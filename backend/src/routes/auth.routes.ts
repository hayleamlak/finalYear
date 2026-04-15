import { Router } from "express";

import { getCurrentUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const authRouter = Router();

authRouter.get("/me", requireAuth, getCurrentUser);

export { authRouter };
