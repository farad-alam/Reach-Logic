// prisma.config.ts — Required by Prisma 7+
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load from .env.local for CLI commands
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  }
});
