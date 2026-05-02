import { Router } from "express";
import { prisma } from "../utils/db.js";

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
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
  } catch (err) {
    console.error("[Categories Error]", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/categories/:slug
categoriesRouter.get("/:slug", async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
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
  } catch (err) {
    console.error("[Category Detail Error]", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});
