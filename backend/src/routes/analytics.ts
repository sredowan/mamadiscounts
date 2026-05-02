import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../utils/db.js";

export const analyticsRouter = Router();

const eventSchema = z.object({
  eventType: z.string(),
  eventData: z.record(z.unknown()).optional(),
  page: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
});

// POST /api/analytics/event — Server-side event tracking
analyticsRouter.post("/event", async (req, res) => {
  try {
    const data = eventSchema.parse(req.body);

    await prisma.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        eventData: (data.eventData || {}) as Prisma.InputJsonValue,
        page: data.page,
        referrer: data.referrer,
        sessionId: data.sessionId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.status(201).json({ success: true });
  } catch (err) {
    // Analytics should never block — fail silently
    console.error("[Analytics Error]", err);
    res.status(200).json({ success: true });
  }
});

// GET /api/analytics/summary — Admin stats
analyticsRouter.get("/summary", async (_req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [pageViews, dealViews, purchases, uniqueVisitors] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { eventType: "page_view", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { eventType: "deal_view", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { eventType: "purchase_complete", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["sessionId"],
        where: { createdAt: { gte: thirtyDaysAgo }, sessionId: { not: null } },
      }),
    ]);

    res.json({
      period: "last_30_days",
      pageViews,
      dealViews,
      purchases,
      uniqueVisitors: uniqueVisitors.length,
      conversionRate: dealViews > 0 ? ((purchases / dealViews) * 100).toFixed(2) : "0",
    });
  } catch (err) {
    console.error("[Analytics Summary Error]", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
