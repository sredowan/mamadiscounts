"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_js_1 = require("../utils/db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.ordersRouter = (0, express_1.Router)();
const createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        dealId: zod_1.z.string(),
        optionId: zod_1.z.string(),
        quantity: zod_1.z.number().min(1).max(10),
    })),
    promoCode: zod_1.z.string().optional(),
});
// POST /api/orders — Create order
exports.ordersRouter.post("/", auth_js_1.requireAuth, async (req, res) => {
    try {
        const data = createOrderSchema.parse(req.body);
        // Validate deals and options exist + calculate total
        let totalAmount = 0;
        const itemDetails = [];
        for (const item of data.items) {
            const option = await db_js_1.prisma.dealOption.findUnique({
                where: { id: item.optionId },
                include: { deal: true },
            });
            if (!option || option.dealId !== item.dealId || !option.isActive) {
                res.status(400).json({ error: `Invalid deal option: ${item.optionId}` });
                return;
            }
            if (option.deal.status !== "ACTIVE") {
                res.status(400).json({ error: `Deal is no longer active: ${option.deal.title}` });
                return;
            }
            const unitPrice = Number(option.dealPrice);
            const lineTotal = unitPrice * item.quantity;
            totalAmount += lineTotal;
            itemDetails.push({
                dealId: item.dealId,
                optionId: item.optionId,
                quantity: item.quantity,
                unitPrice,
                totalPrice: lineTotal,
            });
        }
        // Service fee (2.5%)
        const serviceFee = Math.round(totalAmount * 0.025 * 100) / 100;
        // Create order
        const order = await db_js_1.prisma.order.create({
            data: {
                userId: req.user.userId,
                totalAmount: totalAmount + serviceFee,
                serviceFee,
                promoCode: data.promoCode,
                items: {
                    create: itemDetails,
                },
            },
            include: { items: true },
        });
        res.status(201).json(order);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        console.error("[Order Create Error]", err);
        res.status(500).json({ error: "Failed to create order" });
    }
});
// GET /api/orders — User's orders
exports.ordersRouter.get("/", auth_js_1.requireAuth, async (req, res) => {
    try {
        const orders = await db_js_1.prisma.order.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        deal: { select: { title: true, slug: true, images: true } },
                        option: { select: { title: true } },
                    },
                },
                vouchers: true,
            },
        });
        res.json(orders);
    }
    catch (err) {
        console.error("[Orders List Error]", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
// GET /api/orders/:id
exports.ordersRouter.get("/:id", auth_js_1.requireAuth, async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id)
            return res.status(400).json({ error: "Order id is required" });
        const order = await db_js_1.prisma.order.findFirst({
            where: { id, userId: req.user.userId },
            include: {
                items: {
                    include: {
                        deal: true,
                        option: true,
                    },
                },
                vouchers: true,
            },
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(order);
    }
    catch (err) {
        console.error("[Order Detail Error]", err);
        res.status(500).json({ error: "Failed to fetch order" });
    }
});
//# sourceMappingURL=orders.js.map