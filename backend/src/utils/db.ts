import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prevent multiple instances during development hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";
  
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set!");
    return new PrismaClient();
  }

  try {
    // Parse mysql://user:pass@host:port/database URL
    const url = new URL(dbUrl.replace("mysql://", "http://"));
    
    // PrismaMariaDb adapter accepts connection config directly
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: parseInt(url.port || "3306"),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      connectionLimit: 5,
      connectTimeout: 10000,
      acquireTimeout: 10000,
    });
    
    console.log(`✅ Prisma using mariadb driver adapter → ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
    
    return new PrismaClient({ adapter } as any);
  } catch (err) {
    console.error("❌ Failed to create mariadb adapter, falling back to default:", err);
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
