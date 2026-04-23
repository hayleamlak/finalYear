import { Router } from "express";

import { listMyOrders } from "../controllers/orders.controller";
import { requireAuth } from "../middleware/auth";

const ordersRouter = Router();

ordersRouter.get("/my", requireAuth, listMyOrders);

export { ordersRouter };
