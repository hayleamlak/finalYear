import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { env } from "../config/env";
import { ApiError } from "./errorHandler";

type TokenPayload = JwtPayload & {
  userId: string;
  role: string;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid authorization header"));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    if (!decoded.userId || !decoded.role) {
      return next(new ApiError(401, "Invalid token payload"));
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
