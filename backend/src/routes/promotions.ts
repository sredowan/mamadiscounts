import { Router, Request } from "express";
import { Prisma, type Promotion as PromotionModel } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../utils/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const promotionsRouter = Router();

/** Safely extract a route param as string */
function paramId(req: Request): string {
  const id = req.params.id;
  if (Array.isArray(id)) {
    if (!id[0]) throw new Error("Missing route parameter: id");
    return id[0];
  }
  if (!id) throw new Error("Missing route parameter: id");
  return id;
}

// ── Slot Definitions & Pricing ─────────────────────────
const SLOT_TIERS = {
  LATE_NIGHT: { label: "Late Night (1 AM – 9 AM)", startHour: 1, endHour: 9 },
  MORNING:    { label: "Morning (9 AM – 12 PM)",   startHour: 9, endHour: 12 },
  AFTERNOON:  { label: "Afternoon (1 PM – 5 PM)",  startHour: 13, endHour: 17 },
  PRIME:      { label: "Prime Time (6 PM – 12 AM)", startHour: 18, endHour: 24 },
} as const;

const SLOT_PRICES: Record<string, Record<string, number>> = {
  LATE_NIGHT: { MAIN_BANNER: 500, SPONSORED_VOUCHER: 100 },
  MORNING:    { MAIN_BANNER: 1000, SPONSORED_VOUCHER: 500 },
  AFTERNOON:  { MAIN_BANNER: 2000, SPONSORED_VOUCHER: 500 },
  PRIME:      { MAIN_BANNER: 4000, SPONSORED_VOUCHER: 2500 },
};

const SLOT_CAPACITY: Record<string, number> = {
  MAIN_BANNER: 5,
  SPONSORED_VOUCHER: 3,
};

function getSlotPrice(tier: string, placement: string): number {
  return SLOT_PRICES[tier]?.[placement] || 0;
}

class SlotCapacityError extends Error {
  booked: number;
  capacity: number;

  constructor(message: string, booked: number, capacity: number) {
    super(message);
    this.name = "SlotCapacityError";
    this.booked = booked;
    this.capacity = capacity;
  }
}

async function assertSlotHasCapacity(
  db: Pick<typeof prisma, "promotion">,
  placement: string,
  slotDate: Date,
  slotTier: string,
  excludeId?: string
) {
  const booked = await db.promotion.count({
    where: {
      placement: placement as any,
      slotDate,
      slotTier: slotTier as any,
      status: { not: "REJECTED" },
      paymentStatus: { not: "REJECTED" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  const capacity = SLOT_CAPACITY[placement];
  if (booked >= capacity) {
    throw new SlotCapacityError("Slot is fully booked", booked, capacity);
  }

  return { booked, capacity };
}

function formatDhakaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getCurrentSlotTier(): { tier: string; dateStr: string; hour: number } | null {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  let dateStr = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = parseInt(get("hour"), 10);

  if (hour === 0) {
    dateStr = formatDhakaDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    return { tier: "PRIME", dateStr, hour };
  }

  for (const [tierId, def] of Object.entries(SLOT_TIERS)) {
    if (tierId === "PRIME") {
      if (hour >= 18) return { tier: tierId, dateStr, hour };
    } else {
      if (hour >= def.startHour && hour < def.endHour) return { tier: tierId, dateStr, hour };
    }
  }
  return null;
}

// ── Validation Schemas ─────────────────────────────────
const createPromotionSchema = z.object({
  placement: z.enum(["MAIN_BANNER", "SPONSORED_VOUCHER"]),
  title: z.string().min(3).max(120),
  imageUrl: z.string().optional(),
  linkType: z.enum(["SHOP", "DEAL", "CUSTOM"]).default("DEAL"),
  linkHref: z.string().min(1),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotTier: z.enum(["LATE_NIGHT", "MORNING", "AFTERNOON", "PRIME"]).optional(),
  slotTiers: z.array(z.enum(["LATE_NIGHT", "MORNING", "AFTERNOON", "PRIME"])).min(1).max(4).optional(),
  templateStyleKey: z.string().optional(),
  templateHeadline: z.string().optional(),
  templateSubtext: z.string().optional(),
  templateDiscountText: z.string().optional(),
  templateShopLogo: z.string().optional(),
  templateProductImage: z.string().optional(),
}).refine((data) => data.slotTier || data.slotTiers?.length, {
  message: "Choose at least one slot",
  path: ["slotTiers"],
});

const updatePromotionSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  imageUrl: z.string().optional(),
  linkType: z.enum(["SHOP", "DEAL", "CUSTOM"]).optional(),
  linkHref: z.string().min(1).optional(),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  slotTier: z.enum(["LATE_NIGHT", "MORNING", "AFTERNOON", "PRIME"]).optional(),
  templateStyleKey: z.string().optional().nullable(),
  templateHeadline: z.string().optional().nullable(),
  templateSubtext: z.string().optional().nullable(),
  templateDiscountText: z.string().optional().nullable(),
  templateShopLogo: z.string().optional().nullable(),
  templateProductImage: z.string().optional().nullable(),
});

// ────────────────────────────────────────────────────────
// PUBLIC: Get currently live promotions
// GET /api/promotions/live?placement=MAIN_BANNER
// ────────────────────────────────────────────────────────
promotionsRouter.get("/live", async (req, res) => {
  try {
    const { placement } = req.query as Record<string, string>;
    const current = getCurrentSlotTier();
    if (!current) return res.json([]);

    const limit = SLOT_CAPACITY[placement] || 5;

    const promotions = await prisma.promotion.findMany({
      where: {
        placement: placement as any,
        status: "APPROVED",
        paymentStatus: "VERIFIED",
        slotDate: new Date(current.dateStr),
        slotTier: current.tier as any,
      },
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        merchant: { select: { id: true, businessName: true, logoUrl: true } },
      },
    });

    res.json(promotions);
  } catch (err) {
    console.error("[Live Promotions Error]", err);
    res.status(500).json({ error: "Failed to fetch live promotions" });
  }
});

// ────────────────────────────────────────────────────────
// PUBLIC: Check slot availability for a date
// GET /api/promotions/availability?date=2026-05-05&placement=MAIN_BANNER
// ────────────────────────────────────────────────────────
promotionsRouter.get("/availability", async (req, res) => {
  try {
    const { date, placement } = req.query as Record<string, string>;
    if (!date || !placement) {
      return res.status(400).json({ error: "date and placement are required" });
    }

    const capacity = SLOT_CAPACITY[placement] || 5;
    const tiers = Object.keys(SLOT_TIERS);

    const counts = await Promise.all(
      tiers.map(async (tier) => {
        const booked = await prisma.promotion.count({
          where: {
            placement: placement as any,
            slotDate: new Date(date),
            slotTier: tier as any,
            status: { not: "REJECTED" },
            paymentStatus: { not: "REJECTED" },
          },
        });
        return {
          tier,
          label: (SLOT_TIERS as any)[tier].label,
          booked,
          capacity,
          available: capacity - booked,
          price: getSlotPrice(tier, placement),
        };
      })
    );

    res.json({ date, placement, slots: counts });
  } catch (err) {
    console.error("[Availability Error]", err);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

// ────────────────────────────────────────────────────────
// MERCHANT: List my promotions
// GET /api/promotions/mine
// ────────────────────────────────────────────────────────
promotionsRouter.get("/mine", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.userId } });
    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });

    const promotions = await prisma.promotion.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      include: {
        extensions: { select: { id: true, slotDate: true, slotTier: true, status: true, price: true } },
      },
    });

    res.json(promotions);
  } catch (err) {
    console.error("[My Promotions Error]", err);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

// ────────────────────────────────────────────────────────
// MERCHANT: Create a new promotion
// POST /api/promotions
// ────────────────────────────────────────────────────────
promotionsRouter.post("/", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  try {
    const data = createPromotionSchema.parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.userId } });
    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });

    const slotTiers = Array.from(new Set(data.slotTiers || (data.slotTier ? [data.slotTier] : [])));
    const slotDate = new Date(data.slotDate);

    const promotions = await prisma.$transaction(async (tx) => {
      const createdPromotions: PromotionModel[] = [];

      for (const tier of slotTiers) {
        await assertSlotHasCapacity(tx, data.placement, slotDate, tier);
        const price = getSlotPrice(tier, data.placement);

        const created = await tx.promotion.create({
          data: {
            merchantId: merchant.id,
            placement: data.placement as any,
            title: data.title,
            imageUrl: data.imageUrl,
            linkType: data.linkType as any,
            linkHref: data.linkHref,
            slotDate,
            slotTier: tier as any,
            price,
            templateStyleKey: data.templateStyleKey,
            templateHeadline: data.templateHeadline,
            templateSubtext: data.templateSubtext,
            templateDiscountText: data.templateDiscountText,
            templateShopLogo: data.templateShopLogo,
            templateProductImage: data.templateProductImage,
          },
        });

        createdPromotions.push(created);
      }

      return createdPromotions;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(201).json({
      promotion: promotions[0],
      promotions,
      totalPrice: promotions.reduce((sum, promo) => sum + Number(promo.price), 0),
    });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({ error: err.message, booked: err.booked, capacity: err.capacity });
    }
    console.error("[Create Promotion Error]", err);
    res.status(500).json({ error: "Failed to create promotion" });
  }
});

// ────────────────────────────────────────────────────────
// MERCHANT: Update own promotion (edit creative, date, slot)
// PUT /api/promotions/:id
// ────────────────────────────────────────────────────────
promotionsRouter.put("/:id", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  try {
    const data = updatePromotionSchema.parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.userId } });
    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });

    const existing = await prisma.promotion.findUnique({ where: { id: paramId(req) } });
    if (!existing) return res.status(404).json({ error: "Promotion not found" });
    if (existing.merchantId !== merchant.id) return res.status(403).json({ error: "Not your promotion" });

    // If date or slot changed, check availability
    const newDate = data.slotDate || existing.slotDate.toISOString().split("T")[0];
    const newTier = data.slotTier || existing.slotTier;
    const dateChanged = data.slotDate && data.slotDate !== existing.slotDate.toISOString().split("T")[0];
    const tierChanged = data.slotTier && data.slotTier !== existing.slotTier;

    // Recalculate price if tier changed
    const newPrice = tierChanged ? getSlotPrice(newTier, existing.placement) : Number(existing.price);
    const oldPrice = Number(existing.price);
    const priceDiff = newPrice - oldPrice;

    const creativeOrLinkChanged = Boolean(
      (data.title !== undefined && data.title !== existing.title) ||
      (data.imageUrl !== undefined && data.imageUrl !== existing.imageUrl) ||
      (data.linkType !== undefined && data.linkType !== existing.linkType) ||
      (data.linkHref !== undefined && data.linkHref !== existing.linkHref) ||
      (data.templateStyleKey !== undefined && data.templateStyleKey !== existing.templateStyleKey) ||
      (data.templateHeadline !== undefined && data.templateHeadline !== existing.templateHeadline) ||
      (data.templateSubtext !== undefined && data.templateSubtext !== existing.templateSubtext) ||
      (data.templateDiscountText !== undefined && data.templateDiscountText !== existing.templateDiscountText) ||
      (data.templateShopLogo !== undefined && data.templateShopLogo !== existing.templateShopLogo) ||
      (data.templateProductImage !== undefined && data.templateProductImage !== existing.templateProductImage)
    );

    // Approved promotions need re-review after any merchant-visible content or booking change.
    const needsReReview = existing.status === "APPROVED" && (dateChanged || tierChanged || creativeOrLinkChanged);

    const updated = await prisma.$transaction(async (tx) => {
      if (dateChanged || tierChanged) {
        await assertSlotHasCapacity(tx, existing.placement, new Date(newDate), newTier, existing.id);
      }

      return tx.promotion.update({
        where: { id: paramId(req) },
        data: {
          ...data,
          slotDate: data.slotDate ? new Date(data.slotDate) : undefined,
          slotTier: data.slotTier as any || undefined,
          price: newPrice,
          status: needsReReview ? "PENDING_REVIEW" : undefined,
          approvedAt: needsReReview ? null : undefined,
          paymentStatus: priceDiff > 0 ? "PENDING" : undefined,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.json({ promotion: updated, priceDiff, newPrice, oldPrice });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({ error: "Target slot is fully booked", booked: err.booked, capacity: err.capacity });
    }
    console.error("[Update Promotion Error]", err);
    res.status(500).json({ error: "Failed to update promotion" });
  }
});

// ────────────────────────────────────────────────────────
// MERCHANT: Extend promotion (book additional days)
// POST /api/promotions/:id/extend
// ────────────────────────────────────────────────────────
promotionsRouter.post("/:id/extend", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.userId } });
    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });

    const original = await prisma.promotion.findUnique({ where: { id: paramId(req) } });
    if (!original) return res.status(404).json({ error: "Promotion not found" });
    if (original.merchantId !== merchant.id) return res.status(403).json({ error: "Not your promotion" });

    // Body: array of { slotDate, slotTier }
    const extensionsSchema = z.array(z.object({
      slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      slotTier: z.enum(["LATE_NIGHT", "MORNING", "AFTERNOON", "PRIME"]),
    })).min(1).max(30);

    const extensions = extensionsSchema.parse(req.body.extensions);

    const results = await prisma.$transaction(async (tx) => {
      const createdPromotions: typeof original[] = [];

      for (const ext of extensions) {
        const slotDate = new Date(ext.slotDate);
        await assertSlotHasCapacity(tx, original.placement, slotDate, ext.slotTier);

        const price = getSlotPrice(ext.slotTier, original.placement);

        const created = await tx.promotion.create({
          data: {
            merchantId: merchant.id,
            placement: original.placement,
            title: original.title,
            imageUrl: original.imageUrl,
            linkType: original.linkType,
            linkHref: original.linkHref,
            slotDate,
            slotTier: ext.slotTier as any,
            price,
            templateStyleKey: original.templateStyleKey,
            templateHeadline: original.templateHeadline,
            templateSubtext: original.templateSubtext,
            templateDiscountText: original.templateDiscountText,
            templateShopLogo: original.templateShopLogo,
            templateProductImage: original.templateProductImage,
            parentId: original.parentId || original.id, // Link to root
          },
        });

        createdPromotions.push(created);
      }

      return createdPromotions;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(201).json({ extensions: results, totalPrice: results.reduce((s, r) => s + Number(r.price), 0) });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed", details: err.errors });
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({ error: err.message, booked: err.booked, capacity: err.capacity });
    }
    console.error("[Extend Promotion Error]", err);
    res.status(500).json({ error: "Failed to extend promotion" });
  }
});

// ────────────────────────────────────────────────────────
// MERCHANT: Delete/Cancel promotion
// DELETE /api/promotions/:id
// ────────────────────────────────────────────────────────
promotionsRouter.delete("/:id", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.userId } });
    if (!merchant) return res.status(404).json({ error: "Merchant profile not found" });

    const promotion = await prisma.promotion.findUnique({ where: { id: paramId(req) } });
    if (!promotion) return res.status(404).json({ error: "Promotion not found" });
    if (promotion.merchantId !== merchant.id) return res.status(403).json({ error: "Not your promotion" });

    // Don't allow deleting live promotions
    const current = getCurrentSlotTier();
    if (
      current &&
      promotion.status === "APPROVED" &&
      promotion.slotDate.toISOString().split("T")[0] === current.dateStr &&
      promotion.slotTier === current.tier
    ) {
      return res.status(409).json({ error: "Cannot delete a currently live promotion" });
    }

    await prisma.promotion.delete({ where: { id: paramId(req) } });
    res.json({ success: true });
  } catch (err) {
    console.error("[Delete Promotion Error]", err);
    res.status(500).json({ error: "Failed to delete promotion" });
  }
});

// ════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════

// GET /api/promotions/admin/all — List all promotions
promotionsRouter.get("/admin/all", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, placement, date, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (placement) where.placement = placement;
    if (date) where.slotDate = new Date(date);

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          merchant: { select: { id: true, businessName: true, logoUrl: true, phone: true } },
          extensions: { select: { id: true, slotDate: true, slotTier: true, status: true } },
        },
      }),
      prisma.promotion.count({ where }),
    ]);

    res.json({
      data: promotions,
      pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (err) {
    console.error("[Admin Promotions Error]", err);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

// PUT /api/promotions/admin/:id — Admin edit any promotion
promotionsRouter.put("/admin/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({ where: { id: paramId(req) } });
    if (!promotion) return res.status(404).json({ error: "Promotion not found" });

    const allowedFields = [
      "title", "imageUrl", "linkType", "linkHref", "slotDate", "slotTier",
      "templateStyleKey", "templateHeadline", "templateSubtext",
      "templateDiscountText", "templateShopLogo", "templateProductImage",
      "adminNote",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (key === "slotDate") {
          updateData[key] = new Date(req.body[key]);
        } else {
          updateData[key] = req.body[key];
        }
      }
    }

    const nextDate = updateData.slotDate instanceof Date ? updateData.slotDate : promotion.slotDate;
    const nextTier = typeof updateData.slotTier === "string" ? updateData.slotTier : promotion.slotTier;
    const dateChanged = nextDate.getTime() !== promotion.slotDate.getTime();
    const tierChanged = nextTier !== promotion.slotTier;

    // Recalculate price if tier changed
    if (tierChanged) {
      updateData.price = getSlotPrice(nextTier, promotion.placement);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (dateChanged || tierChanged) {
        await assertSlotHasCapacity(tx, promotion.placement, nextDate, nextTier, promotion.id);
      }

      return tx.promotion.update({ where: { id: paramId(req) }, data: updateData });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.json(updated);
  } catch (err) {
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({ error: "Target slot is fully booked", booked: err.booked, capacity: err.capacity });
    }
    console.error("[Admin Edit Promotion Error]", err);
    res.status(500).json({ error: "Failed to update promotion" });
  }
});

// DELETE /api/promotions/admin/:id — Admin delete any promotion
promotionsRouter.delete("/admin/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({ where: { id: paramId(req) } });
    if (!promotion) return res.status(404).json({ error: "Promotion not found" });

    await prisma.promotion.delete({ where: { id: promotion.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("[Admin Delete Promotion Error]", err);
    res.status(500).json({ error: "Failed to delete promotion" });
  }
});

// PUT /api/promotions/admin/:id/approve — Approve promotion
promotionsRouter.put("/admin/:id/approve", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const promotion = await prisma.promotion.findUnique({ where: { id: paramId(req) } });
    if (!promotion) return res.status(404).json({ error: "Promotion not found" });
    if (promotion.paymentStatus !== "VERIFIED") {
      return res.status(409).json({ error: "Payment must be verified before approval" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Verify slot still has approved capacity at approval time.
      const booked = await tx.promotion.count({
        where: {
          placement: promotion.placement,
          slotDate: promotion.slotDate,
          slotTier: promotion.slotTier,
          status: "APPROVED",
          id: { not: promotion.id },
        },
      });

      const capacity = SLOT_CAPACITY[promotion.placement];
      if (booked >= capacity) {
        throw new SlotCapacityError("Slot is already at capacity", booked, capacity);
      }

      return tx.promotion.update({
        where: { id: paramId(req) },
        data: { status: "APPROVED", approvedAt: new Date(), adminNote: req.body.adminNote || null },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.json(updated);
  } catch (err) {
    if (err instanceof SlotCapacityError) {
      return res.status(409).json({ error: err.message, booked: err.booked, capacity: err.capacity });
    }
    console.error("[Approve Promotion Error]", err);
    res.status(500).json({ error: "Failed to approve promotion" });
  }
});

// PUT /api/promotions/admin/:id/reject — Reject promotion
promotionsRouter.put("/admin/:id/reject", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const updated = await prisma.promotion.update({
      where: { id: paramId(req) },
      data: { status: "REJECTED", adminNote: req.body.adminNote || req.body.reason || "Rejected by admin" },
    });
    res.json(updated);
  } catch (err) {
    console.error("[Reject Promotion Error]", err);
    res.status(500).json({ error: "Failed to reject promotion" });
  }
});

// PUT /api/promotions/admin/:id/payment — Verify/reject payment
promotionsRouter.put("/admin/:id/payment", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!["VERIFIED", "REJECTED"].includes(paymentStatus)) {
      return res.status(400).json({ error: "paymentStatus must be VERIFIED or REJECTED" });
    }

    const updated = await prisma.promotion.update({
      where: { id: paramId(req) },
      data: { paymentStatus },
    });

    res.json(updated);
  } catch (err) {
    console.error("[Payment Status Error]", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// GET /api/promotions/admin/calendar — Slot calendar overview
promotionsRouter.get("/admin/calendar", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { startDate, endDate, placement } = req.query as Record<string, string>;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const promotions = await prisma.promotion.findMany({
      where: {
        slotDate: { gte: new Date(startDate), lte: new Date(endDate) },
        ...(placement ? { placement: placement as any } : {}),
        status: { not: "REJECTED" },
        paymentStatus: { not: "REJECTED" },
      },
      orderBy: [{ slotDate: "asc" }, { slotTier: "asc" }],
      include: {
        merchant: { select: { id: true, businessName: true } },
      },
    });

    // Group by date
    const calendar: Record<string, Record<string, typeof promotions>> = {};
    for (const promo of promotions) {
      const dateKey = promo.slotDate.toISOString().split("T")[0];
      if (!calendar[dateKey]) calendar[dateKey] = {};
      if (!calendar[dateKey][promo.slotTier]) calendar[dateKey][promo.slotTier] = [];
      calendar[dateKey][promo.slotTier].push(promo);
    }

    res.json({ calendar, totalPromotions: promotions.length });
  } catch (err) {
    console.error("[Calendar Error]", err);
    res.status(500).json({ error: "Failed to fetch calendar" });
  }
});
