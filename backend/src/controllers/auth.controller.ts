import { Request, Response } from "express";
import { ApiError } from "../middleware/errorHandler";

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
