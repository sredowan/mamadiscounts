"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_js_1 = require("../utils/db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.reviewsRouter = (0, express_1.Router)();
const createReviewSchema = zod_1.z.object({
    dealId: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
});
// GET /api/reviews?dealId=xxx
exports.reviewsRouter.get("/", async (req, res) => {
    try {
        const { dealId, page = "1", limit = "10" } = req.query;
        if (!dealId) {
            res.status(400).json({ error: "dealId is required" });
            return;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = Math.min(parseInt(limit), 50);
        const [reviews, total] = await Promise.all([
            db_js_1.prisma.review.findMany({
                where: { dealId },
                orderBy: { createdAt: "desc" },
                skip,
                take,
                include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
            }),
            db_js_1.prisma.review.count({ where: { dealId } }),
        ]);
        res.json({ data: reviews, pagination: { page: parseInt(page), limit: take, total } });
    }
    catch (err) {
        console.error("[Reviews Error]", err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});
// POST /api/reviews
exports.reviewsRouter.post("/", auth_js_1.requireAuth, async (req, res) => {
    try {
        const data = createReviewSchema.parse(req.body);
        // Check if user has a completed order for this deal
        const hasOrder = await db_js_1.prisma.orderItem.findFirst({
            where: { dealId: data.dealId, order: { userId: req.user.userId, status: "CONFIRMED" } },
        });
        const review = await db_js_1.prisma.review.create({
            data: {
                userId: req.user.userId,
                dealId: data.dealId,
                rating: data.rating,
                comment: data.comment,
                isVerified: !!hasOrder,
            },
        });
        // Update deal rating average
        const agg = await db_js_1.prisma.review.aggregate({
            where: { dealId: data.dealId },
            _avg: { rating: true },
            _count: true,
        });
        await db_js_1.prisma.deal.update({
            where: { id: data.dealId },
            data: {
                ratingAvg: agg._avg.rating || 0,
                ratingCount: agg._count,
            },
        });
        res.status(201).json(review);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Validation failed", details: err.errors });
            return;
        }
        console.error("[Review Create Error]", err);
        res.status(500).json({ error: "Failed to create review" });
    }
});
//# sourceMappingURL=reviews.js.map