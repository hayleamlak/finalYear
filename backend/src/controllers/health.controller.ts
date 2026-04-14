import { Request, Response } from "express";

import { prisma } from "../lib/prisma";

export async function getHealth(_req: Request, res: Response) {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "fyp-backend",
      timestamp: new Date().toISOString(),
    },
  });
}
