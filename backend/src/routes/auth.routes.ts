import { Router } from "express";

import { issueToken } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/token", issueToken);

export { authRouter };
