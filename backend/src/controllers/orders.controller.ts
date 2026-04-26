import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

const checkoutItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

const chapaInitializeSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  addressLine1: z.string().trim().min(3),
  city: z.string().trim().min(2),
  note: z.string().trim().optional(),
  returnUrl: z.string().url(),
  appReturnUrl: z.string().url().optional(),
});

const chapaVerifySchema = z.object({
  tx_ref: z.string().trim().min(3),
});

const DELIVERY_FEE = 150;
const SERVICE_FEE = 40;

function appendTxRef(url: string, txRef: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("tx_ref", txRef);
  return parsed.toString();
}

function sanitizeChapaText(value: string, maxLength = 120): string {
  const sanitized = value.replace(/[^A-Za-z0-9._ -]/g, " ").replace(/\s+/g, " ").trim();
  return sanitized.slice(0, maxLength);
}

function extractProviderMessage(chapaData: { message?: string; detail?: string; errors?: unknown } | null, rawBody: string) {
  const firstCandidate =
    chapaData?.message ??
    chapaData?.detail ??
    (typeof chapaData?.errors === "string" ? chapaData.errors : undefined);

  if (firstCandidate) {
    return firstCandidate.slice(0, 500);
  }

  if (chapaData?.errors && typeof chapaData.errors === "object") {
    return JSON.stringify(chapaData.errors).slice(0, 500);
  }

  if (chapaData) {
    return JSON.stringify(chapaData).slice(0, 500);
  }

  if (rawBody) {
    return rawBody.slice(0, 500);
  }

  return undefined;
}

export async function listMyOrders(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const orders = await prisma.order.findMany({
    where: {
      user_id: req.user.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              product_name: true,
              image: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          method: true,
          paidAt: true,
        },
      },
      address: {
        select: {
          id: true,
          fullName: true,
          city: true,
          country: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      items: orders,
      total: orders.length,
    },
  });
}

export async function initializeChapaCheckout(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const parsed = chapaInitializeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid checkout payload");
  }

  const { items, fullName, phone, addressLine1, city, note, returnUrl, appReturnUrl } = parsed.data;

  const productIds = [...new Set(items.map((item) => item.product_id))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      product_name: true,
      price: true,
      stock: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, "One or more products were not found");
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  const subtotal = items.reduce((sum, item) => {
    const product = productById.get(item.product_id);
    if (!product) {
      throw new ApiError(400, "One or more products were not found");
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `${product.product_name} has insufficient stock`);
    }

    return sum + product.price * item.quantity;
  }, 0);

  const amount = subtotal + DELIVERY_FEE + SERVICE_FEE;

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true },
  });

  if (!user?.email) {
    throw new ApiError(400, "User email not found");
  }

  const txRef = `pay_${Date.now()}_${randomUUID().split("-")[0]}`;

  const requestedReturnUrl = env.CHAPA_RETURN_URL ?? returnUrl;
  const returnUrlProtocol = new URL(requestedReturnUrl).protocol.toLowerCase();
  if (returnUrlProtocol !== "http:" && returnUrlProtocol !== "https:") {
    throw new ApiError(
      400,
      "Invalid return URL for Chapa. Set CHAPA_RETURN_URL to an https URL in backend/.env.",
    );
  }

  const bridgeReturnUrl = new URL(requestedReturnUrl);
  const finalAppReturnUrl = appReturnUrl ?? env.CHAPA_APP_RETURN_URL;
  if (finalAppReturnUrl) {
    bridgeReturnUrl.searchParams.set("app_return_url", finalAppReturnUrl);
  }

  const chapaPayload = {
    amount,
    currency: "ETB",
    email: user.email,
    tx_ref: txRef,
    return_url: appendTxRef(bridgeReturnUrl.toString(), txRef),
    customization: {
      title: sanitizeChapaText("Order Payment"),
      description: sanitizeChapaText(`Payment for ${items.length} items`),
    },
  } as Record<string, unknown>;

  const chapaRes = await fetch(`${env.CHAPA_BASE_URL}/v1/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chapaPayload),
  });

  const rawChapaBody = await chapaRes.text().catch(() => "");
  let parsedChapaBody: unknown = null;
  if (rawChapaBody) {
    try {
      parsedChapaBody = JSON.parse(rawChapaBody);
    } catch {
      parsedChapaBody = null;
    }
  }
  const chapaData = parsedChapaBody as
    | {
        data?: { checkout_url?: string };
        message?: string;
        detail?: string;
        errors?: unknown;
      }
    | null;

  if (!chapaRes.ok || !chapaData?.data?.checkout_url) {
    const providerMessage = extractProviderMessage(chapaData, rawChapaBody);

    console.error("Chapa initialize failed", {
      status: chapaRes.status,
      providerMessage: providerMessage ?? null,
      txRef,
    });

    const suffix = providerMessage ? `: ${providerMessage}` : "";
    throw new ApiError(502, `Failed to initialize Chapa checkout${suffix}`);
  }

  const { paymentId } = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: req.user!.userId,
        fullName,
        phone,
        addressLine1,
        city,
        region: city,
        country: "Ethiopia",
        addressLine2: note ?? null,
      },
    });

    const createdPayment = await tx.payment.create({
      data: {
        user_id: req.user!.userId,
        amount,
        method: "CARD",
        status: "UNPAID",
        provider: "CHAPA",
        transactionRef: txRef,
      },
    });

    const order = await tx.order.create({
      data: {
        user_id: req.user!.userId,
        address_id: address.id,
        payment_id: createdPayment.id,
        status: "PENDING",
      },
    });

    for (const item of items) {
      const product = productById.get(item.product_id)!;
      await tx.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price,
          status: "PENDING",
        },
      });
    }

    return { paymentId: createdPayment.id };
  });

  res.status(200).json({
    success: true,
    data: {
      checkout_url: chapaData.data.checkout_url,
      tx_ref: txRef,
      payment_id: paymentId,
    },
  });
}

export async function verifyChapaCheckout(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const parsed = chapaVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid verify payload");
  }

  const { tx_ref } = parsed.data;

  const verifyRes = await fetch(`${env.CHAPA_BASE_URL}/v1/transaction/verify/${tx_ref}`, {
    headers: {
      Authorization: `Bearer ${env.CHAPA_SECRET_KEY}`,
    },
  });

  const verifyData = (await verifyRes.json().catch(() => null)) as
    | { status?: string; data?: { status?: string; amount?: string | number; currency?: string } }
    | null;

  if (!verifyRes.ok || verifyData?.status !== "success" || verifyData?.data?.status !== "success") {
    throw new ApiError(400, "Transaction not successful");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      transactionRef: tx_ref,
      user_id: req.user.userId,
    },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const verifiedAmount = Number(verifyData?.data?.amount);
  if (Number.isFinite(verifiedAmount) && Math.abs(verifiedAmount - payment.amount) > 0.01) {
    throw new ApiError(400, "Verified amount does not match payment amount");
  }

  const verifiedCurrency = verifyData?.data?.currency;
  if (verifiedCurrency && verifiedCurrency !== "ETB") {
    throw new ApiError(400, "Unexpected transaction currency");
  }

  const verificationResult = await prisma.$transaction(async (tx) => {
    const markAsPaid = await tx.payment.updateMany({
      where: {
        id: payment.id,
        status: "UNPAID",
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    const orders = await tx.order.findMany({
      where: {
        payment_id: payment.id,
      },
      include: {
        items: true,
      },
    });

    if (markAsPaid.count === 0) {
      return { alreadyPaid: true, orderIds: orders.map((order) => order.id) };
    }

    for (const order of orders) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      await tx.orderItem.updateMany({
        where: { order_id: order.id },
        data: { status: "PAID" },
      });

      for (const item of order.items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.product_id,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          throw new ApiError(409, "Insufficient stock while finalizing payment");
        }
      }
    }

    return { alreadyPaid: false, orderIds: orders.map((order) => order.id) };
  });

  res.status(200).json({
    success: true,
    data: {
      payment_id: payment.id,
      order_ids: verificationResult.orderIds,
      message: verificationResult.alreadyPaid ? "Already verified" : "Payment verified",
    },
  });
}
