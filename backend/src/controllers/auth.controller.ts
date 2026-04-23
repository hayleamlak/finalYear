import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().max(255).nullable().optional(),
  language: z.enum(["ENGLISH", "AMHARIC", "AFAN_OROMO"]).optional(),
  email: z.string().email().optional(),
});

export function getCurrentUser(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

export async function getMyProfile(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const profile = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      address: true,
      language: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!profile) {
    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: req.user.userId,
          first_name: "",
          last_name: "",
          email: req.user.email ?? "",
          address: null,
          language: "ENGLISH",
          role: req.user.role,
          created_at: null,
          updated_at: null,
        },
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
}

export async function updateMyProfile(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid profile payload");
  }

  const payload = parsed.data;

  const existing = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
  });

  const normalizedAddress = payload.address === "" ? null : payload.address;

  const profile = existing
    ? await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          first_name: payload.first_name ?? existing.first_name,
          last_name: payload.last_name ?? existing.last_name,
          address: normalizedAddress ?? existing.address,
          language: payload.language ?? existing.language,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          address: true,
          language: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      })
    : await prisma.user.create({
        data: {
          id: req.user.userId,
          first_name: payload.first_name ?? "User",
          last_name: payload.last_name ?? "Account",
          email: payload.email ?? req.user.email ?? (() => { throw new ApiError(400, "Email is required to create profile"); })(),
          address: normalizedAddress ?? null,
          language: payload.language ?? "ENGLISH",
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          address: true,
          language: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      });

  res.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
}
