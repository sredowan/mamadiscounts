"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Prevent multiple instances during development hot-reload
const globalForPrisma = globalThis;
// Add connect_timeout to DATABASE_URL if not present
const dbUrl = process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("connect_timeout")) {
    const sep = dbUrl.includes("?") ? "&" : "?";
    process.env.DATABASE_URL = `${dbUrl}${sep}connect_timeout=10&pool_timeout=10`;
}
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=db.js.map