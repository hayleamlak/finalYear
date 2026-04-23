import { Router } from "express";

import { getCurrentUser, getMyProfile, updateMyProfile } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const authRouter = Router();

authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.get("/profile", requireAuth, getMyProfile);
authRouter.patch("/profile", requireAuth, updateMyProfile);

export { authRouter };
