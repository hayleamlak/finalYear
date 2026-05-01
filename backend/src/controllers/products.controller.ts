import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().optional(),
});

const productImageSchema = z.string().refine(
  (value) => z.string().url().safeParse(value).success || /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
  "Image must be a URL or a base64 image selected from device storage",
);

const createProductSchema = z.object({
  product_name: z.string().min(2),
  farmer_id: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  image: productImageSchema,
  product_detail: z.string().optional(),
});

export async function listProducts(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid query parameters");
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        product_name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : undefined;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        product_name: true,
        price: true,
        stock: true,
        image: true,
        product_detail: true,
        farmer_id: true,
        createdAt: true,
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

export async function getProductById(req: Request, res: Response) {
  const { productId } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      description: true,
      farmer: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({
    success: true,
    data: product,
  });
}

export async function createProduct(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const parsed = createProductSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid product payload");
  }

  if (parsed.data.farmer_id !== req.user.userId) {
    throw new ApiError(403, "You can only create products for your own farmer account");
  }

  const farmer = await prisma.farmer.findUnique({
    where: {
      id: parsed.data.farmer_id,
    },
    select: { id: true },
  });

  if (!farmer) {
    throw new ApiError(400, "Farmer does not exist");
  }

  const product = await prisma.product.create({
    data: parsed.data,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
}
