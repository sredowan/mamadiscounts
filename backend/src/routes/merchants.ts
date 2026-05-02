import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const merchantsRouter = Router();

// GET /api/merchants/:id — Public merchant profile
merchantsRouter.get("/:id", async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        deals: {
          where: { status: "ACTIVE" },
          take: 10,
          orderBy: { quantitySold: "desc" },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            options: { where: { isActive: true }, take: 3 },
          },
        },
      },
    });
    if (!merchant) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }
    res.json(merchant);
  } catch (err) {
    console.error("[Merchant Error]", err);
    res.status(500).json({ error: "Failed to fetch merchant" });
  }
});

// GET /api/merchants/dashboard/stats — Merchant dashboard KPIs
merchantsRouter.get("/dashboard/stats", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.userId } });
    if (!merchant) {
      res.status(404).json({ error: "Merchant profile not found" });
      return;
    }

    const [activeDeals, totalSales, totalRevenue, recentOrders] = await Promise.all([
      prisma.deal.count({ where: { merchantId: merchant.id, status: "ACTIVE" } }),
      prisma.orderItem.aggregate({
        where: { deal: { merchantId: merchant.id }, order: { status: "CONFIRMED" } },
        _sum: { quantity: true },
      }),
      prisma.orderItem.aggregate({
        where: { deal: { merchantId: merchant.id }, order: { status: "CONFIRMED" } },
        _sum: { totalPrice: true },
      }),
      prisma.orderItem.findMany({
        where: { deal: { merchantId: merchant.id } },
        take: 10,
        orderBy: { order: { createdAt: "desc" } },
        include: {
          order: { select: { id: true, status: true, createdAt: true } },
          deal: { select: { title: true } },
          option: { select: { title: true } },
        },
      }),
    ]);

    res.json({
      activeDeals,
      totalSold: totalSales._sum.quantity || 0,
      totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      pendingPayout: Number(totalRevenue._sum.totalPrice || 0) * 0.75, // 75% after commission
      recentOrders,
    });
  } catch (err) {
    console.error("[Merchant Dashboard Error]", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
