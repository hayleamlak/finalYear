import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../.env" });
dotenv.config({ override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:8081"),
  CLERK_SECRET_KEY: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables", result.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = result.data;
