/**
 * Prisma v7 uses the "client" engine which requires an explicit database
 * adapter instead of an embedded engine binary.
 *
 * We use @prisma/adapter-pg (the official PostgreSQL adapter) that wraps
 * the `pg` connection pool and passes it to PrismaClient.
 *
 * This works with any PostgreSQL-compatible host:
 *   - Neon (recommended for Vercel)
 *   - Supabase
 *   - Local PostgreSQL
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. " +
        "Copy .env.example to .env and fill in your PostgreSQL connection string."
    );
  }

  // Create a pg connection pool
  const pool = new Pool({ connectionString });

  // Wrap with the Prisma adapter
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
