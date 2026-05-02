import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/db.js";
import { requireAuth } from "../middleware/auth.js";
import crypto from "crypto";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({
    dealId: z.string(),
    optionId: z.string(),
    quantity: z.number().min(1).max(10),
  })),
  promoCode: z.string().optional(),
});

// POST /api/orders — Create order
ordersRouter.post("/", requireAuth, async (req, res) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Validate deals and options exist + calculate total
    let totalAmount = 0;
    const itemDetails = [];

    for (const item of data.items) {
      const option = await prisma.dealOption.findUnique({
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
    const order = await prisma.order.create({
      data: {
        userId: req.user!.userId,
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    console.error("[Order Create Error]", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders — User's orders
ordersRouter.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
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
  } catch (err) {
    console.error("[Orders List Error]", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id
ordersRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: "Order id is required" });

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.userId },
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
  } catch (err) {
    console.error("[Order Detail Error]", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});
