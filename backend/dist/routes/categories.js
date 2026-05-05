"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../utils/db.js");
exports.categoriesRouter = (0, express_1.Router)();
// GET /api/categories
exports.categoriesRouter.get("/", async (_req, res) => {
    try {
        const categories = await db_js_1.prisma.category.findMany({
            where: { isActive: true, parentId: null },
            orderBy: { sortOrder: "asc" },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                },
                _count: { select: { deals: { where: { status: "ACTIVE" } } } },
            },
        });
        res.json(categories);
    }
    catch (err) {
        console.error("[Categories Error]", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
// GET /api/categories/:slug
exports.categoriesRouter.get("/:slug", async (req, res) => {
    try {
        const category = await db_js_1.prisma.category.findUnique({
            where: { slug: req.params.slug },
            include: {
                children: { where: { isActive: true } },
                _count: { select: { deals: { where: { status: "ACTIVE" } } } },
            },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.json(category);
    }
    catch (err) {
        console.error("[Category Detail Error]", err);
        res.status(500).json({ error: "Failed to fetch category" });
    }
});
//# sourceMappingURL=categories.js.map