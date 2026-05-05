"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../utils/db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.dealsRouter = (0, express_1.Router)();
// GET /api/deals — List deals with filtering, search, pagination
exports.dealsRouter.get("/", auth_js_1.optionalAuth, async (req, res) => {
    try {
        const { q, category, city, area, status = "ACTIVE", sort = "popular", minPrice, maxPrice, minDiscount, lat, lng, radius = "5", // Default 5km radius
        page = "1", limit = "20", } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = Math.min(parseInt(limit), 50);
        // Build where clause
        const where = { status };
        if (category)
            where.category = { slug: category };
        if (city)
            where.merchant = { city: { contains: city } };
        if (area)
            where.merchant = { ...where.merchant, area: { contains: area } };
        if (minPrice)
            where.dealPrice = { ...where.dealPrice, gte: parseFloat(minPrice) };
        if (maxPrice)
            where.dealPrice = { ...where.dealPrice, lte: parseFloat(maxPrice) };
        if (minDiscount)
            where.discountPercent = { gte: parseInt(minDiscount) };
        if (q)
            where.OR = [
                { title: { contains: q } },
                { description: { contains: q } },
                { merchant: { businessName: { contains: q } } },
            ];
        // Build orderBy
        let orderBy = {};
        switch (sort) {
            case "price_asc":
                orderBy = { dealPrice: "asc" };
                break;
            case "price_desc":
                orderBy = { dealPrice: "desc" };
                break;
            case "discount":
                orderBy = { discountPercent: "desc" };
                break;
            case "newest":
                orderBy = { createdAt: "desc" };
                break;
            case "rating":
                orderBy = { ratingAvg: "desc" };
                break;
            default:
                orderBy = { quantitySold: "desc" };
                break; // popular
        }
        // Spatial Search: If lat/lng provided, find nearby merchants first
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const rad = parseFloat(radius);
            // Haversine formula in MySQL to find merchants within radius (in KM)
            const nearbyMerchants = await db_js_1.prisma.$queryRaw `
        SELECT id, (
          6371 * acos (
            cos ( radians(${latitude}) )
            * cos( radians( latitude ) )
            * cos( radians( longitude ) - radians(${longitude}) )
            + sin ( radians(${latitude}) )
            * sin( radians( latitude ) )
          )
        ) AS distance
        FROM merchants
        HAVING distance < ${rad}
        ORDER BY distance;
      `;
            const merchantIds = nearbyMerchants.map(m => m.id);
            // If no merchants nearby, return empty early
            if (merchantIds.length === 0) {
                return res.json({ data: [], pagination: { page: parseInt(page), limit: take, total: 0, totalPages: 0 } });
            }
            where.merchantId = { in: merchantIds };
        }
        const [deals, total] = await Promise.all([
            db_js_1.prisma.deal.findMany({
                where,
                orderBy,
                skip,
                take,
                include: {
                    merchant: { select: { id: true, businessName: true, logoUrl: true, address: true, area: true, city: true, isVerified: true, ratingAvg: true, ratingCount: true } },
                    category: { select: { id: true, name: true, slug: true } },
                    options: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
                },
            }),
            db_js_1.prisma.deal.count({ where }),
        ]);
        res.json({
            data: deals,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    }
    catch (err) {
        console.error("[Deals List Error]", err);
        res.status(500).json({ error: "Failed to fetch deals" });
    }
});
// GET /api/deals/featured
exports.dealsRouter.get("/featured", async (_req, res) => {
    try {
        const deals = await db_js_1.prisma.deal.findMany({
            where: { status: "ACTIVE", isFeatured: true },
            take: 8,
            orderBy: { quantitySold: "desc" },
            include: {
                merchant: { select: { id: true, businessName: true, area: true, city: true, isVerified: true, ratingAvg: true, ratingCount: true } },
                category: { select: { id: true, name: true, slug: true } },
                options: { where: { isActive: true }, take: 3 },
            },
        });
        res.json(deals);
    }
    catch (err) {
        console.error("[Featured Deals Error]", err);
        res.status(500).json({ error: "Failed to fetch featured deals" });
    }
});
// GET /api/deals/:slug — Single deal detail
exports.dealsRouter.get("/:slug", auth_js_1.optionalAuth, async (req, res) => {
    try {
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        if (!slug)
            return res.status(400).json({ error: "Deal slug is required" });
        const deal = await db_js_1.prisma.deal.findUnique({
            where: { slug },
            include: {
                merchant: true,
                category: true,
                options: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
                reviews: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
                },
            },
        });
        if (!deal) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }
        // Track view (server-side analytics)
        await db_js_1.prisma.deal.update({
            where: { id: deal.id },
            data: { viewCount: { increment: 1 } },
        });
        // Track analytics event
        await db_js_1.prisma.analyticsEvent.create({
            data: {
                eventType: "deal_view",
                eventData: { dealId: deal.id, slug: deal.slug },
                userId: req.user?.userId,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                page: `/deals/${deal.slug}`,
                referrer: req.headers.referer,
            },
        });
        res.json(deal);
    }
    catch (err) {
        console.error("[Deal Detail Error]", err);
        res.status(500).json({ error: "Failed to fetch deal" });
    }
});
//# sourceMappingURL=deals.js.map