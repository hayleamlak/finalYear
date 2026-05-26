import { Router } from "express";

import { getCurrentUser, getMyProfile, updateMyProfile } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";

const authRouter = Router();

authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.get("/profile", requireAuth, asyncHandler(getMyProfile));
authRouter.patch("/profile", requireAuth, asyncHandler(updateMyProfile));

// Protected debug endpoint: logs raw token and parsed user to server console
authRouter.get("/debug-token", requireAuth, (req, res) => {
	const authHeader = req.headers.authorization;
	const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

	console.log("[DEBUG] Raw Clerk token:", token);
	console.log("[DEBUG] Parsed user from requireAuth middleware:", req.user);

	res.status(200).json({ success: true, token: token ?? null, user: req.user ?? null });
});

export { authRouter };
