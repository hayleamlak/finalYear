import { Router } from "express";

import { initializeChapaCheckout, listMyOrders, verifyChapaCheckout } from "../controllers/orders.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";

const ordersRouter = Router();

ordersRouter.get("/my", requireAuth, asyncHandler(listMyOrders));
ordersRouter.post("/chapa/initialize", requireAuth, asyncHandler(initializeChapaCheckout));
ordersRouter.post("/chapa/verify", requireAuth, asyncHandler(verifyChapaCheckout));

export { ordersRouter };
