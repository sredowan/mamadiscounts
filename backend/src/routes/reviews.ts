import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/db.js";
import { requireAuth } from "../middleware/auth.js";

export const reviewsRouter = Router();

const createReviewSchema = z.object({
  dealId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// GET /api/reviews?dealId=xxx
reviewsRouter.get("/", async (req, res) => {
  try {
    const { dealId, page = "1", limit = "10" } = req.query as Record<string, string>;
    if (!dealId) {
      res.status(400).json({ error: "dealId is required" });
      return;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { dealId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      }),
      prisma.review.count({ where: { dealId } }),
    ]);

    res.json({ data: reviews, pagination: { page: parseInt(page), limit: take, total } });
  } catch (err) {
    console.error("[Reviews Error]", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews
reviewsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const data = createReviewSchema.parse(req.body);

    // Check if user has a completed order for this deal
    const hasOrder = await prisma.orderItem.findFirst({
      where: { dealId: data.dealId, order: { userId: req.user!.userId, status: "CONFIRMED" } },
    });

    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        dealId: data.dealId,
        rating: data.rating,
        comment: data.comment,
        isVerified: !!hasOrder,
      },
    });

    // Update deal rating average
    const agg = await prisma.review.aggregate({
      where: { dealId: data.dealId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.deal.update({
      where: { id: data.dealId },
      data: {
        ratingAvg: agg._avg.rating || 0,
        ratingCount: agg._count,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    console.error("[Review Create Error]", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});
