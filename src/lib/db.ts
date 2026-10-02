// lib/db.ts — Prisma client singleton using Neon HTTP adapter (Prisma 7)
// PrismaNeonHttp is correct for Vercel serverless (stateless HTTP, no WebSocket pool).
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  // ─── Environment Safety Guard ───────────────────────────────────────────────
  // Runs ONCE at startup (module init) — zero per-request cost.
  // Prevents dev machines from accidentally hitting the production database.
  if (!url) {
    throw new Error("DATABASE_URL is not set. Check your .env.local file.");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isDevBranch  = url.includes("-dev") || url.includes("dev-") || url.includes("development");

  if (isProduction && isDevBranch) {
    throw new Error(
      "🚨 SAFETY: NODE_ENV=production but DATABASE_URL looks like a dev branch. " +
      "Set the production DATABASE_URL in your hosting environment (Vercel/Railway), not in .env.local."
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  const adapter = new PrismaNeonHttp(url, {});
  return new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

