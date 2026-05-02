import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding COUPONUS BD database...\n");

  // ── Categories ─────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "beauty-and-spa" }, update: {}, create: { name: "Beauty & Spa", slug: "beauty-and-spa", iconName: "Sparkles", color: "#ec4899", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "food-and-drink" }, update: {}, create: { name: "Food & Drink", slug: "food-and-drink", iconName: "UtensilsCrossed", color: "#f97316", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "things-to-do" }, update: {}, create: { name: "Activities", slug: "things-to-do", iconName: "Ticket", color: "#8b5cf6", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "health-and-fitness" }, update: {}, create: { name: "Health & Fitness", slug: "health-and-fitness", iconName: "Dumbbell", color: "#10b981", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "auto-and-home" }, update: {}, create: { name: "Auto & Home", slug: "auto-and-home", iconName: "Car", color: "#3b82f6", sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: "services" }, update: {}, create: { name: "Services", slug: "services", iconName: "Briefcase", color: "#6366f1", sortOrder: 6 } }),
    prisma.category.upsert({ where: { slug: "travel" }, update: {}, create: { name: "Travel", slug: "travel", iconName: "Plane", color: "#0ea5e9", sortOrder: 7 } }),
    prisma.category.upsert({ where: { slug: "shopping" }, update: {}, create: { name: "Shopping", slug: "shopping", iconName: "ShoppingBag", color: "#d946ef", sortOrder: 8 } }),
  ]);

  console.log(`✅ ${categories.length} categories seeded`);

  // ── Admin User ─────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@2026", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@couponusbd.com" },
    update: {},
    create: {
      email: "admin@couponusbd.com",
      passwordHash: adminHash,
      fullName: "COUPONUS Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: admin@couponusbd.com / Admin@2026`);

  // ── Demo Merchant Users ────────────────────────────────
  const merchantHash = await bcrypt.hash("Merchant@2026", 12);
  const merchantUsers = await Promise.all([
    prisma.user.upsert({ where: { email: "spa@demo.com" }, update: {}, create: { email: "spa@demo.com", passwordHash: merchantHash, fullName: "Spa Owner", role: "MERCHANT" } }),
    prisma.user.upsert({ where: { email: "food@demo.com" }, update: {}, create: { email: "food@demo.com", passwordHash: merchantHash, fullName: "Restaurant Owner", role: "MERCHANT" } }),
    prisma.user.upsert({ where: { email: "clinic@demo.com" }, update: {}, create: { email: "clinic@demo.com", passwordHash: merchantHash, fullName: "Clinic Owner", role: "MERCHANT" } }),
    prisma.user.upsert({ where: { email: "adventure@demo.com" }, update: {}, create: { email: "adventure@demo.com", passwordHash: merchantHash, fullName: "Adventure Owner", role: "MERCHANT" } }),
  ]);

  // ── Merchants ──────────────────────────────────────────
  const merchants = await Promise.all([
    prisma.merchant.upsert({
      where: { userId: merchantUsers[0].id }, update: {},
      create: { userId: merchantUsers[0].id, businessName: "Serenity Thai Spa", description: "Premium spa with authentic Thai techniques", address: "House 45, Road 12", area: "Gulshan 1", city: "Dhaka", latitude: 23.7801, longitude: 90.4162, isVerified: true, ratingAvg: 4.7, ratingCount: 2341, commissionRate: 25 },
    }),
    prisma.merchant.upsert({
      where: { userId: merchantUsers[1].id }, update: {},
      create: { userId: merchantUsers[1].id, businessName: "Tokyo Ramen House", description: "Authentic Japanese dining", address: "Road 11, Block D", area: "Banani", city: "Dhaka", latitude: 23.7940, longitude: 90.4043, isVerified: true, ratingAvg: 4.5, ratingCount: 567, commissionRate: 20 },
    }),
    prisma.merchant.upsert({
      where: { userId: merchantUsers[2].id }, update: {},
      create: { userId: merchantUsers[2].id, businessName: "GlowDerm Clinic", description: "Advanced aesthetic treatments", address: "House 7, Road 4", area: "Dhanmondi", city: "Dhaka", latitude: 23.7461, longitude: 90.3742, isVerified: true, ratingAvg: 4.8, ratingCount: 1230, commissionRate: 25 },
    }),
    prisma.merchant.upsert({
      where: { userId: merchantUsers[3].id }, update: {},
      create: { userId: merchantUsers[3].id, businessName: "MindLock Adventures", description: "Immersive escape room experiences", address: "Sector 10", area: "Uttara", city: "Dhaka", latitude: 23.8759, longitude: 90.3950, isVerified: true, ratingAvg: 4.6, ratingCount: 890, commissionRate: 20 },
    }),
  ]);
  console.log(`✅ ${merchants.length} merchants seeded`);

  // ── Deals ──────────────────────────────────────────────
  const deals = await Promise.all([
    prisma.deal.upsert({
      where: { slug: "luxury-thai-spa-package-gulshan" }, update: {},
      create: {
        merchantId: merchants[0].id, categoryId: categories[0].id,
        title: "Luxury Thai Spa Package — Full Body Massage with Aromatherapy & Hot Stones",
        slug: "luxury-thai-spa-package-gulshan",
        description: "Indulge in a premium spa experience with authentic Thai techniques.",
        finePrint: "Valid Mon-Sat. Appointment required. Not valid on holidays.",
        highlights: JSON.stringify(["60-min full body massage", "Aromatherapy included", "Hot stone therapy", "Refreshments included"]),
        images: JSON.stringify(["/images/deals/spa-1.jpg"]),
        originalPrice: 5000, dealPrice: 1999, discountPercent: 60,
        extraDiscount: 200, extraDiscountLabel: "Extra ৳200 off, ends tomorrow",
        quantityTotal: 500, quantitySold: 3420, maxPerUser: 3,
        startDate: new Date("2026-04-01"), endDate: new Date("2026-05-15"),
        isFeatured: true, viewCount: 12500, ratingAvg: 4.7, ratingCount: 2341,
        options: { create: [
          { title: "60-Min Thai Massage", originalPrice: 5000, dealPrice: 1999, boughtCount: 2100, sortOrder: 1 },
          { title: "90-Min Royal Package", originalPrice: 7500, dealPrice: 2999, boughtCount: 1320, sortOrder: 2 },
        ] },
      },
    }),
    prisma.deal.upsert({
      where: { slug: "premium-sushi-platter-banani" }, update: {},
      create: {
        merchantId: merchants[1].id, categoryId: categories[1].id,
        title: "Premium Sushi & Ramen Platter for Two — 20pc Sushi + 2 Signature Ramen Bowls",
        slug: "premium-sushi-platter-banani",
        description: "Experience authentic Japanese dining with the freshest ingredients.",
        highlights: JSON.stringify(["20pc mixed sushi platter", "2 bowls signature ramen", "Complimentary green tea", "Dine-in only"]),
        images: JSON.stringify(["/images/deals/food-1.jpg"]),
        originalPrice: 3500, dealPrice: 1499, discountPercent: 57,
        quantityTotal: 300, quantitySold: 890, maxPerUser: 5,
        startDate: new Date("2026-04-01"), endDate: new Date("2026-04-30"),
        isFeatured: true, viewCount: 8900, ratingAvg: 4.5, ratingCount: 567,
        options: { create: [
          { title: "Sushi Platter for Two", originalPrice: 3500, dealPrice: 1499, boughtCount: 650, sortOrder: 1 },
          { title: "Premium Omakase for Two", originalPrice: 6000, dealPrice: 2799, boughtCount: 240, sortOrder: 2 },
        ] },
      },
    }),
    prisma.deal.upsert({
      where: { slug: "laser-hair-removal-dhanmondi" }, update: {},
      create: {
        merchantId: merchants[2].id, categoryId: categories[0].id,
        title: "6 Sessions Laser Hair Removal — Full Body or Targeted Areas (Up to 78% Off)",
        slug: "laser-hair-removal-dhanmondi",
        description: "FDA-approved laser technology for permanent hair reduction.",
        highlights: JSON.stringify(["6 sessions included", "FDA-approved laser", "Licensed practitioners", "All skin types"]),
        images: JSON.stringify(["/images/deals/beauty-1.jpg"]),
        originalPrice: 25000, dealPrice: 5499, discountPercent: 78,
        quantityTotal: 200, quantitySold: 1560, maxPerUser: 2, isSponsored: true,
        startDate: new Date("2026-04-01"), endDate: new Date("2026-06-30"),
        viewCount: 15000, ratingAvg: 4.8, ratingCount: 1230,
        options: { create: [
          { title: "Full Body — 6 Sessions", originalPrice: 25000, dealPrice: 5499, boughtCount: 980, sortOrder: 1 },
          { title: "Underarms + Bikini — 6 Sessions", originalPrice: 12000, dealPrice: 2999, boughtCount: 580, sortOrder: 2 },
        ] },
      },
    }),
    prisma.deal.upsert({
      where: { slug: "escape-room-adventure-uttara" }, update: {},
      create: {
        merchantId: merchants[3].id, categoryId: categories[2].id,
        title: "Thrilling Escape Room Experience for 4 — Choose from 5 Themed Rooms",
        slug: "escape-room-adventure-uttara",
        description: "Test your wits in Dhaka's most immersive escape room adventures!",
        highlights: JSON.stringify(["60 mins gameplay", "Teams of 2-6", "5 themed rooms", "Photo opportunity included"]),
        images: JSON.stringify(["/images/deals/activity-1.jpg"]),
        originalPrice: 4000, dealPrice: 1599, discountPercent: 60,
        quantityTotal: 100, quantitySold: 2780, maxPerUser: 4, isFeatured: true,
        startDate: new Date("2026-04-01"), endDate: new Date("2026-05-31"),
        viewCount: 9200, ratingAvg: 4.6, ratingCount: 890,
        options: { create: [
          { title: "Standard Room — 4 Players", originalPrice: 4000, dealPrice: 1599, boughtCount: 1800, sortOrder: 1 },
          { title: "Premium Room — 4 Players", originalPrice: 6000, dealPrice: 2499, boughtCount: 980, sortOrder: 2 },
        ] },
      },
    }),
  ]);
  console.log(`✅ ${deals.length} deals seeded`);

  // ── Demo Customer ──────────────────────────────────────
  const customerHash = await bcrypt.hash("Customer@2026", 12);
  await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      passwordHash: customerHash,
      fullName: "Demo Customer",
      phone: "01770618575",
      role: "CUSTOMER",
    },
  });
  console.log(`✅ Demo customer: customer@demo.com / Customer@2026`);

  console.log("\n🎉 Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
