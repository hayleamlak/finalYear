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
  CHAPA_SECRET_KEY: z.string().min(1),
  CHAPA_BASE_URL: z.string().url().default("https://api.chapa.co"),
  CHAPA_RETURN_URL: z.string().url().optional(),
  CHAPA_APP_RETURN_URL: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables", result.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

if (result.data.CHAPA_SECRET_KEY.toUpperCase().includes("REPLACE_ME")) {
  throw new Error("Invalid CHAPA_SECRET_KEY: set your real Chapa test secret key in backend/.env");
}

export const env = result.data;
