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
