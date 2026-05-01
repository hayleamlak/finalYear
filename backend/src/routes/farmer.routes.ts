import { Router } from "express";

import {
  deleteFarmerProduct,
  getFarmerDashboard,
  updateFarmerOrderItemStatus,
  updateFarmerProduct,
} from "../controllers/farmer.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";

const farmerRouter = Router();

farmerRouter.get("/dashboard", requireAuth, asyncHandler(getFarmerDashboard));
farmerRouter.patch("/products/:productId", requireAuth, asyncHandler(updateFarmerProduct));
farmerRouter.delete("/products/:productId", requireAuth, asyncHandler(deleteFarmerProduct));
farmerRouter.patch("/order-items/:orderItemId/status", requireAuth, asyncHandler(updateFarmerOrderItemStatus));

export { farmerRouter };
