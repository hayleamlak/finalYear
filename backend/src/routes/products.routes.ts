import { Router } from "express";

import { createProduct, getProductById, listProducts } from "../controllers/products.controller";
import { requireAuth } from "../middleware/auth";

const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.get("/:productId", getProductById);
productsRouter.post("/", requireAuth, createProduct);

export { productsRouter };
