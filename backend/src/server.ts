import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function start() {
  try {
    await prisma.$connect();

    app.listen(env.PORT, () => {
      console.log(`Backend running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
