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

const app = express();
const PORT = process.env.PORT || 4000;

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

// ── CORS — must come first so preflight OPTIONS are handled ─
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow local development and private network URLs.
    if (
      origin === process.env.FRONTEND_URL || 
      isAllowedDevOrigin(origin)
    ) {
      return callback(null, true);
    }
    
    // Fallback error
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Security Middleware ────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // This is an API server, not serving HTML pages
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false, // Allow cross-origin fetch from frontend
}));

// Rate limiting — general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting — auth (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Too many login attempts, please try again later." },
});

app.use(generalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "couponus-bd-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────
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
  // Compatibility with the documented admin promotion API shape.
  if (req.url === "/" || req.url.startsWith("/?")) {
    const query = req.url.startsWith("/?") ? req.url.slice(1) : "";
    req.url = `/admin/all${query}`;
  } else {
    req.url = `/admin${req.url}`;
  }
  promotionsRouter(req, res, next);
});

// ── 404 Handler ────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ───────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API Error]", err.message);
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// ── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 COUPONUS BD API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
