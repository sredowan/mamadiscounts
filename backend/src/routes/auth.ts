import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../utils/db.js";
import { generateTokens, requireAuth, verifyToken } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
      },
    });

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      ...tokens,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    throw err;
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      ...tokens,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    throw err;
  }
});

// POST /api/auth/refresh
authRouter.post("/refresh", async (req, res) => {
  try {
    const data = refreshSchema.parse(req.body);
    const payload = verifyToken(data.refreshToken);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      ...tokens,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});
