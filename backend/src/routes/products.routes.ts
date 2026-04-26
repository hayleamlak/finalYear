import { Router } from "express";

import { createProduct, getProductById, listProducts } from "../controllers/products.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";

const productsRouter = Router();

productsRouter.get("/", asyncHandler(listProducts));
productsRouter.get("/:productId", asyncHandler(getProductById));
productsRouter.post("/", requireAuth, requireRole(["SELLER", "ADMIN"]), asyncHandler(createProduct));

export { productsRouter };
