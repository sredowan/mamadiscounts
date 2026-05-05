"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_js_1 = require("../utils/db.js");
exports.analyticsRouter = (0, express_1.Router)();
const eventSchema = zod_1.z.object({
    eventType: zod_1.z.string(),
    eventData: zod_1.z.record(zod_1.z.unknown()).optional(),
    page: zod_1.z.string().optional(),
    referrer: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
});
// POST /api/analytics/event — Server-side event tracking
exports.analyticsRouter.post("/event", async (req, res) => {
    try {
        const data = eventSchema.parse(req.body);
        await db_js_1.prisma.analyticsEvent.create({
            data: {
                eventType: data.eventType,
                eventData: (data.eventData || {}),
                page: data.page,
                referrer: data.referrer,
                sessionId: data.sessionId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            },
        });
        res.status(201).json({ success: true });
    }
    catch (err) {
        // Analytics should never block — fail silently
        console.error("[Analytics Error]", err);
        res.status(200).json({ success: true });
    }
});
// GET /api/analytics/summary — Admin stats
exports.analyticsRouter.get("/summary", async (_req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [pageViews, dealViews, purchases, uniqueVisitors] = await Promise.all([
            db_js_1.prisma.analyticsEvent.count({
                where: { eventType: "page_view", createdAt: { gte: thirtyDaysAgo } },
            }),
            db_js_1.prisma.analyticsEvent.count({
                where: { eventType: "deal_view", createdAt: { gte: thirtyDaysAgo } },
            }),
            db_js_1.prisma.analyticsEvent.count({
                where: { eventType: "purchase_complete", createdAt: { gte: thirtyDaysAgo } },
            }),
            db_js_1.prisma.analyticsEvent.groupBy({
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
    }
    catch (err) {
        console.error("[Analytics Summary Error]", err);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});
//# sourceMappingURL=analytics.js.map