"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantsRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../utils/db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.merchantsRouter = (0, express_1.Router)();
// GET /api/merchants/:id — Public merchant profile
exports.merchantsRouter.get("/:id", async (req, res) => {
    try {
        const merchant = await db_js_1.prisma.merchant.findUnique({
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
    }
    catch (err) {
        console.error("[Merchant Error]", err);
        res.status(500).json({ error: "Failed to fetch merchant" });
    }
});
// GET /api/merchants/dashboard/stats — Merchant dashboard KPIs
exports.merchantsRouter.get("/dashboard/stats", auth_js_1.requireAuth, (0, auth_js_1.requireRole)("MERCHANT"), async (req, res) => {
    try {
        const merchant = await db_js_1.prisma.merchant.findUnique({ where: { userId: req.user.userId } });
        if (!merchant) {
            res.status(404).json({ error: "Merchant profile not found" });
            return;
        }
        const [activeDeals, totalSales, totalRevenue, recentOrders] = await Promise.all([
            db_js_1.prisma.deal.count({ where: { merchantId: merchant.id, status: "ACTIVE" } }),
            db_js_1.prisma.orderItem.aggregate({
                where: { deal: { merchantId: merchant.id }, order: { status: "CONFIRMED" } },
                _sum: { quantity: true },
            }),
            db_js_1.prisma.orderItem.aggregate({
                where: { deal: { merchantId: merchant.id }, order: { status: "CONFIRMED" } },
                _sum: { totalPrice: true },
            }),
            db_js_1.prisma.orderItem.findMany({
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
    }
    catch (err) {
        console.error("[Merchant Dashboard Error]", err);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
});
//# sourceMappingURL=merchants.js.map