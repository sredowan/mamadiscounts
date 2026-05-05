"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_js_1 = require("./routes/auth.js");
const deals_js_1 = require("./routes/deals.js");
const categories_js_1 = require("./routes/categories.js");
const orders_js_1 = require("./routes/orders.js");
const payments_js_1 = require("./routes/payments.js");
const promotions_js_1 = require("./routes/promotions.js");
const reviews_js_1 = require("./routes/reviews.js");
const merchants_js_1 = require("./routes/merchants.js");
const analytics_js_1 = require("./routes/analytics.js");
function isAllowedDevOrigin(origin) {
    try {
        const { hostname } = new URL(origin);
        return (hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1" ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("10.") ||
            /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname));
    }
    catch {
        return false;
    }
}
function createApp({ serveRootInfo = true } = {}) {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        origin: function (origin, callback) {
            if (!origin)
                return callback(null, true);
            if (origin === process.env.FRONTEND_URL ||
                isAllowedDevOrigin(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
    }));
    const generalLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: { error: "Too many requests, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
    });
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: { error: "Too many login attempts, please try again later." },
    });
    app.use(generalLimiter);
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
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
    app.use("/api/auth", authLimiter, auth_js_1.authRouter);
    app.use("/api/deals", deals_js_1.dealsRouter);
    app.use("/api/categories", categories_js_1.categoriesRouter);
    app.use("/api/orders", orders_js_1.ordersRouter);
    app.use("/api/payments", payments_js_1.paymentsRouter);
    app.use("/api/reviews", reviews_js_1.reviewsRouter);
    app.use("/api/merchants", merchants_js_1.merchantsRouter);
    app.use("/api/analytics", analytics_js_1.analyticsRouter);
    app.use("/api/promotions", promotions_js_1.promotionsRouter);
    app.use("/api/admin/promotions", (req, res, next) => {
        if (req.url === "/" || req.url.startsWith("/?")) {
            const query = req.url.startsWith("/?") ? req.url.slice(1) : "";
            req.url = `/admin/all${query}`;
        }
        else {
            req.url = `/admin${req.url}`;
        }
        (0, promotions_js_1.promotionsRouter)(req, res, next);
    });
    app.use((req, res, next) => {
        if (req.path.startsWith("/api")) {
            res.status(404).json({ error: "Route not found" });
            return;
        }
        next();
    });
    app.use((err, _req, res, _next) => {
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
exports.default = createApp();
//# sourceMappingURL=app.js.map