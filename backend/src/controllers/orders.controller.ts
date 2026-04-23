import { Request, Response } from "express";

import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

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
