import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during development hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add connect_timeout to DATABASE_URL if not present
const dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("connect_timeout")) {
  const sep = dbUrl.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${dbUrl}${sep}connect_timeout=10&pool_timeout=10`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
