import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";

const loginSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "BUYER", "SELLER", "LAB_TECHNICIAN", "CASHIER"]),
});

export function issueToken(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid login payload");
  }

  const token = jwt.sign(parsed.data, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    success: true,
    data: {
      token,
      user: parsed.data,
    },
  });
}
