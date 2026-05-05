"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_js_1 = require("../utils/db.js");
const auth_js_1 = require("../middleware/auth.js");
const crypto_1 = __importDefault(require("crypto"));
exports.paymentsRouter = (0, express_1.Router)();
/**
 * MOCK bKash Payment Service
 * Simulates the full bKash Tokenized Checkout flow WITHOUT hitting real bKash APIs.
 * Replace with real bKash integration when merchant credentials are obtained.
 */
const createPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    payerPhone: zod_1.z.string().regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number"),
});
const executePaymentSchema = zod_1.z.object({
    paymentId: zod_1.z.string(),
    otp: zod_1.z.string().default("123456"),
    pin: zod_1.z.string().default("12121"),
});
// In-memory mock payment store (replace with Redis in production)
const mockPayments = new Map();
// POST /api/payments/bkash/create — Initiate bKash payment
exports.paymentsRouter.post("/bkash/create", auth_js_1.requireAuth, async (req, res) => {
    try {
        const data = createPaymentSchema.parse(req.body);
        // Verify order belongs to user and is pending
        const order = await db_js_1.prisma.order.findFirst({
            where: { id: data.orderId, userId: req.user.userId, paymentStatus: "PENDING" },
        });
        if (!order) {
            res.status(404).json({ error: "Order not found or already paid" });
            return;
        }
        // Mock bKash Create Payment
        const paymentId = `MOCK-BK-${Date.now()}-${crypto_1.default.randomBytes(4).toString("hex")}`;
        mockPayments.set(paymentId, {
            paymentId,
            orderId: data.orderId,
            amount: Number(order.totalAmount),
            payerPhone: data.payerPhone,
            status: "initiated",
            createdAt: new Date(),
        });
        // Update order with payment reference
        await db_js_1.prisma.order.update({
            where: { id: data.orderId },
            data: { paymentId, paymentMethod: "bkash" },
        });
        res.json({
            paymentId,
            amount: Number(order.totalAmount),
            currency: "BDT",
            merchantName: "COUPONUS BD",
            payerPhone: data.payerPhone,
            status: "initiated",
            message: "Mock bKash payment initiated. Use OTP: 123456, PIN: 12121 to complete.",
            // In real bKash, this would be a redirect URL:
            bkashURL: `http://localhost:3000/checkout/bkash-confirm?paymentId=${paymentId}`,
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        console.error("[bKash Create Error]", err);
        res.status(500).json({ error: "Payment initiation failed" });
    }
});
// POST /api/payments/bkash/execute — Complete bKash payment
exports.paymentsRouter.post("/bkash/execute", auth_js_1.requireAuth, async (req, res) => {
    try {
        const data = executePaymentSchema.parse(req.body);
        const payment = mockPayments.get(data.paymentId);
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            return;
        }
        if (payment.status !== "initiated") {
            res.status(400).json({ error: "Payment already processed" });
            return;
        }
        // Simulate bKash OTP/PIN verification (mock always succeeds with demo values)
        if (data.otp !== "123456" || data.pin !== "12121") {
            payment.status = "failed";
            mockPayments.set(data.paymentId, payment);
            await db_js_1.prisma.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: "FAILED" },
            });
            res.status(400).json({ error: "Invalid OTP or PIN" });
            return;
        }
        // Mark payment as completed
        payment.status = "completed";
        mockPayments.set(data.paymentId, payment);
        // Update order status
        const order = await db_js_1.prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: "COMPLETED",
                status: "CONFIRMED",
            },
            include: { items: { include: { deal: true, option: true } } },
        });
        // Generate vouchers for each item
        const vouchers = [];
        for (const item of order.items) {
            for (let i = 0; i < item.quantity; i++) {
                const voucherCode = `CPB-${crypto_1.default.randomBytes(3).toString("hex").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
                const voucher = await db_js_1.prisma.voucher.create({
                    data: {
                        orderId: order.id,
                        userId: req.user.userId,
                        voucherCode,
                        qrData: JSON.stringify({ code: voucherCode, dealId: item.dealId, optionId: item.optionId }),
                        expiryDate: new Date(item.deal.endDate),
                    },
                });
                vouchers.push(voucher);
            }
            // Increment sold count
            await db_js_1.prisma.dealOption.update({
                where: { id: item.optionId },
                data: { boughtCount: { increment: item.quantity } },
            });
            await db_js_1.prisma.deal.update({
                where: { id: item.dealId },
                data: { quantitySold: { increment: item.quantity } },
            });
        }
        // Track analytics
        await db_js_1.prisma.analyticsEvent.create({
            data: {
                eventType: "purchase_complete",
                eventData: {
                    orderId: order.id,
                    paymentId: data.paymentId,
                    amount: Number(order.totalAmount),
                    itemCount: order.items.length,
                },
                userId: req.user.userId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });
        res.json({
            success: true,
            transactionId: `TXN-${crypto_1.default.randomBytes(4).toString("hex").toUpperCase()}`,
            orderId: order.id,
            amount: Number(order.totalAmount),
            paymentId: data.paymentId,
            payerPhone: payment.payerPhone,
            vouchers: vouchers.map((v) => ({
                code: v.voucherCode,
                expiryDate: v.expiryDate,
                status: v.status,
            })),
            message: "Payment successful! Your vouchers have been generated.",
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        console.error("[bKash Execute Error]", err);
        res.status(500).json({ error: "Payment execution failed" });
    }
});
// GET /api/payments/bkash/status/:paymentId
exports.paymentsRouter.get("/bkash/status/:paymentId", auth_js_1.requireAuth, async (req, res) => {
    const paymentId = Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId;
    if (!paymentId)
        return res.status(400).json({ error: "Payment id is required" });
    const payment = mockPayments.get(paymentId);
    if (!payment) {
        res.status(404).json({ error: "Payment not found" });
        return;
    }
    res.json({
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        payerPhone: payment.payerPhone,
        createdAt: payment.createdAt,
    });
});
//# sourceMappingURL=payments.js.map