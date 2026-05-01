import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { chapaReturnBridge } from "./controllers/orders.controller";
import { farmerRouter } from "./routes/farmer.routes";
import { healthRouter } from "./routes/health.routes";
import { ordersRouter } from "./routes/orders.routes";
import { productsRouter } from "./routes/products.routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FYP backend is running",
  });
});

app.get("/payment/chapa-return", chapaReturnBridge);
app.get("/api/v1/orders/chapa/return", chapaReturnBridge);

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/farmer", farmerRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/orders", ordersRouter);

app.use(notFoundHandler);
app.use(errorHandler);
