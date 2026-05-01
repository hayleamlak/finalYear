import { NextFunction, Request, Response } from "express";
import { verifyToken } from "@clerk/backend";

import { env } from "../config/env";
import { ApiError } from "./errorHandler";

function extractRole(payload: Record<string, unknown>): string {
  const directRole = payload.role;
  if (typeof directRole === "string" && directRole.length > 0) {
    return directRole;
  }

  const metadata = payload.metadata;
  if (metadata && typeof metadata === "object") {
    const role = (metadata as Record<string, unknown>).role;
    if (typeof role === "string" && role.length > 0) {
      return role;
    }
  }

  const publicMetadata = payload.public_metadata;
  if (publicMetadata && typeof publicMetadata === "object") {
    const role = (publicMetadata as Record<string, unknown>).role;
    if (typeof role === "string" && role.length > 0) {
      return role;
    }
  }

  return "BUYER";
}

function extractEmail(payload: Record<string, unknown>): string | undefined {
  const directEmail = payload.email;
  if (typeof directEmail === "string" && directEmail.length > 0) {
    return directEmail;
  }

  const emailAddress = payload.email_address;
  if (typeof emailAddress === "string" && emailAddress.length > 0) {
    return emailAddress;
  }

  return undefined;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid authorization header"));
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    const userId = payload.sub;

    if (!userId) {
      return next(new ApiError(401, "Invalid token payload"));
    }

    req.user = {
      userId,
      role: extractRole(payload as Record<string, unknown>),
      email: extractEmail(payload as Record<string, unknown>),
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired Clerk token"));
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    const normalizedRole = req.user.role.toUpperCase() === "FARMER" ? "SELLER" : req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }

    next();
  };
}
