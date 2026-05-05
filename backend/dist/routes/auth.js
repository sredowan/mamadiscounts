"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const db_js_1 = require("../utils/db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.authRouter = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    fullName: zod_1.z.string().min(2).max(100),
    phone: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
// POST /api/auth/register
exports.authRouter.post("/register", async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const existing = await db_js_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const user = await db_js_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: data.phone,
            },
        });
        const tokens = (0, auth_js_1.generateTokens)({ userId: user.id, email: user.email, role: user.role });
        res.status(201).json({
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
            ...tokens,
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        throw err;
    }
});
// POST /api/auth/login
exports.authRouter.post("/login", async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await db_js_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const tokens = (0, auth_js_1.generateTokens)({ userId: user.id, email: user.email, role: user.role });
        res.json({
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
            ...tokens,
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        throw err;
    }
});
// POST /api/auth/refresh
exports.authRouter.post("/refresh", async (req, res) => {
    try {
        const data = refreshSchema.parse(req.body);
        const payload = (0, auth_js_1.verifyToken)(data.refreshToken);
        const user = await db_js_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || !user.isActive) {
            res.status(401).json({ error: "Invalid refresh token" });
            return;
        }
        const tokens = (0, auth_js_1.generateTokens)({ userId: user.id, email: user.email, role: user.role });
        res.json({
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
            ...tokens,
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        res.status(401).json({ error: "Invalid or expired refresh token" });
    }
});
// GET /api/auth/me
exports.authRouter.get("/me", auth_js_1.requireAuth, async (req, res) => {
    const user = await db_js_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true, createdAt: true },
    });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
});
//# sourceMappingURL=auth.js.map