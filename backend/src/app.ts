import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { dealsRouter } from "./routes/deals.js";
import { categoriesRouter } from "./routes/categories.js";
import { ordersRouter } from "./routes/orders.js";
import { paymentsRouter } from "./routes/payments.js";
import { promotionsRouter } from "./routes/promotions.js";
import { reviewsRouter } from "./routes/reviews.js";
import { merchantsRouter } from "./routes/merchants.js";
import { analyticsRouter } from "./routes/analytics.js";
import { prisma } from "./utils/db.js";

type AppOptions = {
  serveRootInfo?: boolean;
};

function isAllowedDevOrigin(origin: string) {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
}

export function createApp({ serveRootInfo = true }: AppOptions = {}) {
  const app = express();
  app.set("trust proxy", 1);

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin === process.env.FRONTEND_URL ||
        isAllowedDevOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  }));

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Too many login attempts, please try again later." },
  });

  app.use(generalLimiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (serveRootInfo) {
    app.get("/", (_req, res) => {
      res.json({
        status: "ok",
        service: "couponus-bd-api",
        message: "COUPONUS BD API is running. Use /api/health for health checks.",
        health: "/api/health",
      });
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      service: "couponus-bd-api",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      node: process.version,
    });
  });

  // DB connection check — raw MySQL test (bypasses Prisma engine entirely)
  app.get("/api/health/db", async (_req, res) => {
    const timeout = setTimeout(() => {
      res.status(504).json({
        status: "timeout",
        error: "DB connection test timed out after 8 seconds",
        hint: "Database may be unreachable or Prisma engine is hanging",
      });
    }, 8000);

    try {
      // First try raw TCP to see if DB host is reachable
      const dbUrl = process.env.DATABASE_URL || "";
      const match = dbUrl.match(/@([^:]+):(\d+)\//);
      const host = match?.[1] || "unknown";
      const port = match?.[2] || "3306";

      // Try Prisma connection
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 AS ok`;
      clearTimeout(timeout);
      res.json({ status: "connected", database: "ok", host, port, prismaVersion: require("@prisma/client").Prisma.prismaVersion?.client || "unknown" });
    } catch (err: any) {
      clearTimeout(timeout);
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          database: "disconnected",
          error: err.message?.substring(0, 500),
          code: err.code,
          name: err.name,
          hint: "Check DATABASE_URL in Hostinger environment variables",
        });
      }
    }
  });

  // Raw TCP port test — check if DB host is reachable at all
  app.get("/api/health/tcp", (_req, res) => {
    const dbUrl = process.env.DATABASE_URL || "";
    const match = dbUrl.match(/@([^:]+):(\d+)\//);
    const host = match?.[1] || "unknown";
    const port = parseInt(match?.[2] || "3306");

    const net = require("net");
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(5000);
    socket.on("connect", () => {
      const ms = Date.now() - start;
      socket.destroy();
      res.json({ status: "reachable", host, port, latencyMs: ms });
    });
    socket.on("timeout", () => {
      socket.destroy();
      res.status(504).json({ status: "unreachable", host, port, error: "TCP connection timed out (5s)" });
    });
    socket.on("error", (err: any) => {
      res.status(500).json({ status: "unreachable", host, port, error: err.message });
    });
    socket.connect(port, host);
  });

  // Env check — see which variables are configured (no values exposed)
  app.get("/api/health/env", (_req, res) => {
    const dbUrl = process.env.DATABASE_URL || "";
    res.json({
      NODE_ENV: process.env.NODE_ENV || "(not set)",
      DATABASE_URL: dbUrl ? `✅ set (${dbUrl.substring(0, 20)}...)` : "❌ NOT SET",
      JWT_SECRET: process.env.JWT_SECRET ? "✅ set" : "❌ NOT SET",
      FRONTEND_URL: process.env.FRONTEND_URL || "(not set)",
      PORT: process.env.PORT || "(not set)",
    });
  });

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/deals", dealsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/merchants", merchantsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/promotions", promotionsRouter);
  app.use("/api/admin/promotions", (req, res, next) => {
    if (req.url === "/" || req.url.startsWith("/?")) {
      const query = req.url.startsWith("/?") ? req.url.slice(1) : "";
      req.url = `/admin/all${query}`;
    } else {
      req.url = `/admin${req.url}`;
    }
    promotionsRouter(req, res, next);
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    next();
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[API Error]", err.message);
    console.error(err.stack);
    res.status(500).json({
      error: process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    });
  });

  return app;
}

export default createApp();
