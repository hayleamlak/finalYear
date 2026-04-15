import { Router } from "express";

import { createProduct, getProductById, listProducts } from "../controllers/products.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.get("/:productId", getProductById);
productsRouter.post("/", requireAuth, requireRole(["SELLER", "ADMIN"]), createProduct);

export { productsRouter };
