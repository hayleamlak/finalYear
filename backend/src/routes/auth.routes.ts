import { Router } from "express";

import { getCurrentUser, getMyProfile, updateMyProfile } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";

const authRouter = Router();

authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.get("/profile", requireAuth, asyncHandler(getMyProfile));
authRouter.patch("/profile", requireAuth, asyncHandler(updateMyProfile));

export { authRouter };
