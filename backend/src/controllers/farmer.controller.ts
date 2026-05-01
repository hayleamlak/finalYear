import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

const productImageSchema = z.string().refine(
  (value) => z.string().url().safeParse(value).success || /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
  "Image must be a URL or a base64 image selected from device storage",
);

const updateProductSchema = z.object({
  product_name: z.string().trim().min(2).optional(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  image: productImageSchema.optional(),
  product_detail: z.string().trim().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]).optional(),
});

const orderItemStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

function requireFarmer(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const role = req.user.role.toUpperCase();
  if (role !== "SELLER" && role !== "FARMER" && role !== "ADMIN") {
    throw new ApiError(403, "Farmer access required");
  }

  return req.user.userId;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), diff));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getFarmerDashboard(req: Request, res: Response) {
  const farmerId = requireFarmer(req);
  const now = new Date();

  const [farmer, products, orderItems, reviews] = await Promise.all([
    prisma.farmer.findUnique({
      where: { id: farmerId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        address: true,
        language: true,
        status: true,
        latitude: true,
        longitude: true,
        locationUpdatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.product.findMany({
      where: { farmer_id: farmerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        product_name: true,
        price: true,
        stock: true,
        image: true,
        product_detail: true,
        status: true,
        farmer_id: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.orderItem.findMany({
      where: {
        product: {
          farmer_id: farmerId,
        },
      },
      orderBy: {
        order: {
          createdAt: "desc",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            image: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            address: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                region: true,
                country: true,
              },
            },
            payment: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                provider: true,
                transactionRef: true,
                paidAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.findMany({
      where: {
        OR: [
          { farmer_id: farmerId },
          {
            product: {
              farmer_id: farmerId,
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        product: {
          select: {
            id: true,
            product_name: true,
          },
        },
      },
    }),
  ]);

  if (!farmer) {
    throw new ApiError(404, "Farmer profile not found");
  }

  const paidItems = orderItems.filter((item) => item.order.payment?.status === "PAID");
  const totalEarnings = paidItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paidOrderIds = new Set(paidItems.map((item) => item.order_id));
  const pendingOrderIds = new Set(
    orderItems
      .filter((item) => item.status === "PENDING" || item.status === "PAID" || item.status === "PROCESSING")
      .map((item) => item.order_id),
  );
  const completedOrderIds = new Set(
    orderItems
      .filter((item) => item.status === "DELIVERED" || item.order.status === "CONFIRMED")
      .map((item) => item.order_id),
  );

  const earningsForRange = (start: Date) =>
    paidItems
      .filter((item) => item.order.payment?.paidAt && new Date(item.order.payment.paidAt) >= start)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const averageRating =
    reviews.length === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  res.status(200).json({
    success: true,
    data: {
      farmer,
      products,
      orderItems,
      reviews,
      summary: {
        totalProducts: products.length,
        activeProducts: products.filter((product) => product.status === "ACTIVE").length,
        pendingOrders: pendingOrderIds.size,
        completedOrders: completedOrderIds.size,
        paidOrders: paidOrderIds.size,
        totalEarnings,
        lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
        outOfStockProducts: products.filter((product) => product.stock === 0).length,
        averageRating,
        reviewCount: reviews.length,
      },
      earnings: {
        today: earningsForRange(startOfDay(now)),
        week: earningsForRange(startOfWeek(now)),
        month: earningsForRange(startOfMonth(now)),
        total: totalEarnings,
        paidAmount: totalEarnings,
        pendingAmount: orderItems
          .filter((item) => item.order.payment?.status !== "PAID")
          .reduce((sum, item) => sum + item.price * item.quantity, 0),
      },
    },
  });
}

export async function updateFarmerProduct(req: Request, res: Response) {
  const farmerId = requireFarmer(req);
  const parsed = updateProductSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid product payload");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: req.params.productId,
      farmer_id: farmerId,
    },
    select: { id: true },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: parsed.data,
  });

  res.status(200).json({
    success: true,
    data: updated,
  });
}

export async function deleteFarmerProduct(req: Request, res: Response) {
  const farmerId = requireFarmer(req);

  const product = await prisma.product.findFirst({
    where: {
      id: req.params.productId,
      farmer_id: farmerId,
    },
    select: { id: true },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { status: "INACTIVE" },
  });

  res.status(200).json({
    success: true,
    data: updated,
  });
}

export async function updateFarmerOrderItemStatus(req: Request, res: Response) {
  const farmerId = requireFarmer(req);
  const parsed = orderItemStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid order status payload");
  }

  const item = await prisma.orderItem.findFirst({
    where: {
      id: req.params.orderItemId,
      product: {
        farmer_id: farmerId,
      },
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!item) {
    throw new ApiError(404, "Order item not found");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.orderItem.update({
      where: { id: item.id },
      data: { status: parsed.data.status },
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            image: true,
          },
        },
      },
    });

    const siblingItems = await tx.orderItem.findMany({
      where: { order_id: item.order_id },
      select: { status: true },
    });

    const orderStatus = siblingItems.every((row) => row.status === "DELIVERED")
      ? "DELIVERED"
      : siblingItems.some((row) => row.status === "SHIPPED")
        ? "SHIPPED"
        : siblingItems.some((row) => row.status === "PROCESSING")
          ? "PROCESSING"
          : siblingItems.some((row) => row.status === "CANCELLED")
            ? "CANCELLED"
            : item.order.status;

    await tx.order.update({
      where: { id: item.order_id },
      data: { status: orderStatus },
    });

    return updatedItem;
  });

  res.status(200).json({
    success: true,
    data: updated,
  });
}
