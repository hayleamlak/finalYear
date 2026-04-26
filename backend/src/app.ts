import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
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

app.get("/payment/chapa-return", (req, res) => {
  const txRef = typeof req.query.tx_ref === "string" ? req.query.tx_ref : "";
  const appReturnFromQuery = typeof req.query.app_return_url === "string" ? req.query.app_return_url : "";
  const fallbackAppReturn = env.CHAPA_APP_RETURN_URL ?? "fypfrontend://payment/chapa-return";
  const appReturnBase = appReturnFromQuery || fallbackAppReturn;

  let deepLink: string;
  try {
    deepLink = new URL(appReturnBase).toString();
  } catch {
    deepLink = fallbackAppReturn;
  }

  try {
    const deepLinkUrl = new URL(deepLink);
    if (txRef) {
      deepLinkUrl.searchParams.set("tx_ref", txRef);
    }
    deepLink = deepLinkUrl.toString();
  } catch {
    if (txRef) {
      const separator = deepLink.includes("?") ? "&" : "?";
      deepLink = `${deepLink}${separator}tx_ref=${encodeURIComponent(txRef)}`;
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Returning to app</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 24px;">
    <p>Returning to app...</p>
    <p><a href="${deepLink}">Tap here if not redirected</a></p>
    <script>window.location.replace(${JSON.stringify(deepLink)});</script>
  </body>
</html>`);
});

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/orders", ordersRouter);

app.use(notFoundHandler);
app.use(errorHandler);
