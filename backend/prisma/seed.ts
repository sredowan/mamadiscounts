import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = {
  spa: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80","https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80"],
  food: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80"],
  shop: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80","https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80"],
  movie: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80","https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"],
  beauty: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"],
  activity: ["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80","https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80"],
  health: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"],
  auto: ["https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"],
  service: ["https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80","https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"],
  travel: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80","https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"],
  wellness: ["https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80","https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"],
  salon: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"],
};

// Category slug -> seed data
const DEAL_DATA = [
  // ── Food & Drink ──
  { cat: "food-and-drink", merchant: { email: "food@demo.com", name: "Restaurant Owner", biz: "Tokyo Ramen House", area: "Banani", addr: "Road 11, Block D", lat: 23.794, lng: 90.4043, rat: 4.5, rc: 567 }, deals: [
    { title: "Premium Sushi & Ramen Platter for Two", slug: "premium-sushi-platter-banani", desc: "Experience authentic Japanese dining with the freshest ingredients.", img: IMG.food[0], op: 3500, dp: 1499, disc: 57, sold: 890, view: 8900, feat: true },
    { title: "All-You-Can-Eat BBQ Buffet — Unlimited Meat & Seafood", slug: "bbq-buffet-banani", desc: "Sizzling Korean BBQ with premium cuts and fresh seafood.", img: IMG.food[1], op: 2500, dp: 999, disc: 60, sold: 1200, view: 7500, feat: false },
  ]},
  // ── Beauty & Spa ──
  { cat: "beauty-and-spa", merchant: { email: "spa@demo.com", name: "Spa Owner", biz: "Serenity Thai Spa", area: "Gulshan 1", addr: "House 45, Road 12", lat: 23.7801, lng: 90.4162, rat: 4.7, rc: 2341 }, deals: [
    { title: "Luxury Thai Spa Package — Full Body Massage + Aromatherapy", slug: "luxury-thai-spa-package-gulshan", desc: "Indulge in a premium spa experience with authentic Thai techniques.", img: IMG.spa[0], op: 5000, dp: 1999, disc: 60, sold: 3420, view: 12500, feat: true },
    { title: "6 Sessions Laser Hair Removal — Full Body", slug: "laser-hair-removal-dhanmondi", desc: "FDA-approved laser technology for permanent hair reduction.", img: IMG.beauty[0], op: 25000, dp: 5499, disc: 78, sold: 1560, view: 15000, feat: false },
  ]},
  // ── Shopping ──
  { cat: "shopping", merchant: { email: "shop@demo.com", name: "Shop Owner", biz: "Fashion Hub BD", area: "Dhanmondi", addr: "Road 27, Dhanmondi R/A", lat: 23.7461, lng: 90.3742, rat: 4.3, rc: 450 }, deals: [
    { title: "Designer Handbag Collection — Up to 70% Off Premium Brands", slug: "designer-handbag-sale-dhanmondi", desc: "Authentic designer handbags from top international brands at unbeatable prices.", img: IMG.shop[0], op: 8000, dp: 2399, disc: 70, sold: 670, view: 9800, feat: true },
    { title: "Men's Premium Watch Bundle — 2 Watches + Gift Box", slug: "mens-watch-bundle-dhanmondi", desc: "Stylish timepieces for every occasion. Perfect gift set.", img: IMG.shop[1], op: 6000, dp: 1999, disc: 67, sold: 340, view: 5400, feat: false },
  ]},
  // ── Movie Tickets ──
  { cat: "movie-tickets", merchant: { email: "cinema@demo.com", name: "Cinema Owner", biz: "Star Cineplex Dhaka", area: "Bashundhara R/A", addr: "Bashundhara City Mall", lat: 23.7509, lng: 90.3929, rat: 4.4, rc: 1890 }, deals: [
    { title: "Couple Movie Package — 2 Tickets + Popcorn + Drinks", slug: "couple-movie-package-bashundhara", desc: "Enjoy blockbuster movies with your loved one at Star Cineplex.", img: IMG.movie[0], op: 1800, dp: 799, disc: 56, sold: 2100, view: 11000, feat: true },
    { title: "Family Movie Night — 4 Tickets + Snack Combo", slug: "family-movie-night-bashundhara", desc: "Perfect family outing with premium seating and loaded snack trays.", img: IMG.movie[1], op: 3600, dp: 1499, disc: 58, sold: 890, view: 6700, feat: false },
  ]},
  // ── Activities (Things to Do) ──
  { cat: "things-to-do", merchant: { email: "adventure@demo.com", name: "Adventure Owner", biz: "MindLock Adventures", area: "Uttara Sector 10", addr: "Sector 10", lat: 23.8759, lng: 90.395, rat: 4.6, rc: 890 }, deals: [
    { title: "Thrilling Escape Room Experience for 4 Players", slug: "escape-room-adventure-uttara", desc: "Test your wits in Dhaka's most immersive escape room adventures!", img: IMG.activity[0], op: 4000, dp: 1599, disc: 60, sold: 2780, view: 9200, feat: true },
    { title: "Weekend Paintball Battle — 2 Hours Unlimited Ammo", slug: "paintball-battle-uttara", desc: "Action-packed paintball with full gear, unlimited ammo, and referee.", img: IMG.activity[1], op: 3000, dp: 1199, disc: 60, sold: 560, view: 4300, feat: false },
  ]},
  // ── Health & Fitness ──
  { cat: "health-and-fitness", merchant: { email: "gym@demo.com", name: "Gym Owner", biz: "FitZone Premium Gym", area: "Mirpur 10", addr: "Block C, Mirpur 10", lat: 23.8069, lng: 90.3687, rat: 4.5, rc: 780 }, deals: [
    { title: "3-Month Gym Membership + Personal Trainer (5 Sessions)", slug: "gym-membership-mirpur", desc: "Transform your body with premium equipment and expert guidance.", img: IMG.health[0], op: 12000, dp: 4999, disc: 58, sold: 430, view: 7800, feat: true },
    { title: "Full Body Health Checkup — 50+ Tests Included", slug: "health-checkup-mirpur", desc: "Comprehensive health screening with blood work, ECG, and doctor consultation.", img: IMG.health[1], op: 8000, dp: 2999, disc: 63, sold: 670, view: 5600, feat: false },
  ]},
  // ── Auto & Home ──
  { cat: "auto-and-home", merchant: { email: "auto@demo.com", name: "Auto Service Owner", biz: "SpeedCare Auto Spa", area: "Tejgaon", addr: "Tejgaon Industrial Area", lat: 23.7636, lng: 90.3896, rat: 4.2, rc: 320 }, deals: [
    { title: "Premium Car Detailing Package — Interior + Exterior + Ceramic Coat", slug: "car-detailing-tejgaon", desc: "Professional car detailing with premium ceramic coating protection.", img: IMG.auto[0], op: 8000, dp: 2999, disc: 63, sold: 210, view: 4500, feat: true },
    { title: "Full AC Service + Gas Refill — Any Car Model", slug: "ac-service-tejgaon", desc: "Beat the Dhaka heat with complete AC servicing by certified technicians.", img: IMG.auto[1], op: 5000, dp: 1999, disc: 60, sold: 340, view: 3800, feat: false },
  ]},
  // ── Services ──
  { cat: "services", merchant: { email: "service@demo.com", name: "Service Provider", biz: "ProClean Solutions", area: "Mohammadpur", addr: "Adabar, Mohammadpur", lat: 23.7648, lng: 90.3574, rat: 4.4, rc: 560 }, deals: [
    { title: "Deep Home Cleaning — 3BHK Full Apartment (6 Hours)", slug: "deep-cleaning-mohammadpur", desc: "Professional deep cleaning with eco-friendly products for your entire apartment.", img: IMG.service[0], op: 5000, dp: 1999, disc: 60, sold: 890, view: 6700, feat: true },
    { title: "Professional Photography Session — 2 Hours + 50 Edited Photos", slug: "photography-session-mohammadpur", desc: "Capture special moments with award-winning photographers.", img: IMG.service[1], op: 15000, dp: 4999, disc: 67, sold: 230, view: 3900, feat: false },
  ]},
  // ── Travel ──
  { cat: "travel", merchant: { email: "travel@demo.com", name: "Travel Agent", biz: "Wanderlust BD Tours", area: "Gulshan 2", addr: "Gulshan Avenue, Gulshan 2", lat: 23.7935, lng: 90.4143, rat: 4.6, rc: 670 }, deals: [
    { title: "Cox's Bazar 3D/2N Beach Resort Package — Couple", slug: "coxs-bazar-beach-resort", desc: "Luxury beachfront resort with breakfast, dinner, and beach activities.", img: IMG.travel[0], op: 18000, dp: 7999, disc: 56, sold: 340, view: 12000, feat: true },
    { title: "Sundarbans Adventure Tour — 3D/2N with Boat Safari", slug: "sundarbans-adventure-tour", desc: "Explore the world's largest mangrove forest with expert guides.", img: IMG.travel[1], op: 12000, dp: 5499, disc: 54, sold: 180, view: 8900, feat: false },
  ]},
  // ── Wellness ──
  { cat: "wellness", merchant: { email: "wellness@demo.com", name: "Wellness Coach", biz: "Zen Wellness Center", area: "Banani", addr: "Road 17, Banani", lat: 23.7935, lng: 90.4024, rat: 4.7, rc: 430 }, deals: [
    { title: "30-Day Yoga & Meditation Program — Unlimited Classes", slug: "yoga-meditation-banani", desc: "Transform your mind and body with daily yoga and guided meditation.", img: IMG.wellness[0], op: 8000, dp: 2999, disc: 63, sold: 560, view: 7800, feat: true },
    { title: "Ayurvedic Wellness Package — Consultation + 5 Treatments", slug: "ayurvedic-wellness-banani", desc: "Traditional Ayurvedic healing with personalized treatment plans.", img: IMG.wellness[1], op: 15000, dp: 5999, disc: 60, sold: 210, view: 4500, feat: false },
  ]},
  // ── Hair & Salon ──
  { cat: "hair-and-salon", merchant: { email: "salon@demo.com", name: "Salon Owner", biz: "Glamour Hair Studio", area: "Dhanmondi", addr: "Road 8, Dhanmondi", lat: 23.7461, lng: 90.3742, rat: 4.5, rc: 890 }, deals: [
    { title: "Complete Hair Makeover — Cut + Color + Keratin Treatment", slug: "hair-makeover-dhanmondi", desc: "Transform your look with premium hair services by expert stylists.", img: IMG.salon[0], op: 8000, dp: 2999, disc: 63, sold: 780, view: 9200, feat: true },
    { title: "Bridal Makeup Package — HD Makeup + Hairstyling + Draping", slug: "bridal-makeup-dhanmondi", desc: "Look stunning on your special day with our bridal beauty experts.", img: IMG.salon[1], op: 25000, dp: 9999, disc: 60, sold: 230, view: 6700, feat: false },
  ]},
];

async function main() {
  console.log("🌱 Seeding COUPONUS BD database...\n");

  // ── Categories ─────────────────────────────────────────
  const catData = [
    { name: "Beauty & Spa", slug: "beauty-and-spa", iconName: "Sparkles", color: "#ec4899", sortOrder: 1 },
    { name: "Food & Drink", slug: "food-and-drink", iconName: "UtensilsCrossed", color: "#f97316", sortOrder: 2 },
    { name: "Activities", slug: "things-to-do", iconName: "Ticket", color: "#8b5cf6", sortOrder: 3 },
    { name: "Health & Fitness", slug: "health-and-fitness", iconName: "Dumbbell", color: "#10b981", sortOrder: 4 },
    { name: "Auto & Home", slug: "auto-and-home", iconName: "Car", color: "#3b82f6", sortOrder: 5 },
    { name: "Services", slug: "services", iconName: "Briefcase", color: "#6366f1", sortOrder: 6 },
    { name: "Travel", slug: "travel", iconName: "Plane", color: "#0ea5e9", sortOrder: 7 },
    { name: "Shopping", slug: "shopping", iconName: "ShoppingBag", color: "#d946ef", sortOrder: 8 },
    { name: "Movie Tickets", slug: "movie-tickets", iconName: "Clapperboard", color: "#eab308", sortOrder: 9 },
    { name: "Wellness", slug: "wellness", iconName: "Heart", color: "#ef4444", sortOrder: 10 },
    { name: "Hair & Salon", slug: "hair-and-salon", iconName: "Scissors", color: "#f59e0b", sortOrder: 11 },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const c of catData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug }, update: {}, create: c,
    });
  }
  console.log(`✅ ${catData.length} categories seeded`);

  // ── Admin ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@2026", 12);
  await prisma.user.upsert({
    where: { email: "admin@couponusbd.com" }, update: {},
    create: { email: "admin@couponusbd.com", passwordHash: adminHash, fullName: "COUPONUS Admin", role: "ADMIN" },
  });
  console.log(`✅ Admin: admin@couponusbd.com / Admin@2026`);

  // ── Demo Customer ──────────────────────────────────────
  const customerHash = await bcrypt.hash("Customer@2026", 12);
  await prisma.user.upsert({
    where: { email: "customer@demo.com" }, update: {},
    create: { email: "customer@demo.com", passwordHash: customerHash, fullName: "Demo Customer", phone: "01770618575", role: "CUSTOMER" },
  });
  console.log(`✅ Customer: customer@demo.com / Customer@2026`);

  // ── Merchants & Deals per category ─────────────────────
  const merchantHash = await bcrypt.hash("Merchant@2026", 12);
  let totalDeals = 0;
  let totalMerchants = 0;

  for (const entry of DEAL_DATA) {
    const m = entry.merchant;
    const catId = categories[entry.cat]?.id;
    if (!catId) { console.warn(`⚠️  Category ${entry.cat} not found, skipping`); continue; }

    // Upsert merchant user
    const user = await prisma.user.upsert({
      where: { email: m.email }, update: {},
      create: { email: m.email, passwordHash: merchantHash, fullName: m.name, role: "MERCHANT" },
    });

    // Upsert merchant profile
    const merchant = await prisma.merchant.upsert({
      where: { userId: user.id }, update: {},
      create: {
        userId: user.id, businessName: m.biz, description: `${m.biz} — top-rated in ${m.area}`,
        address: m.addr, area: m.area, city: "Dhaka",
        latitude: m.lat, longitude: m.lng,
        isVerified: true, ratingAvg: m.rat, ratingCount: m.rc, commissionRate: 25,
      },
    });
    totalMerchants++;

    // Upsert deals
    for (const d of entry.deals) {
      const existing = await prisma.deal.findUnique({ where: { slug: d.slug } });
      if (!existing) {
        await prisma.deal.create({
          data: {
            merchantId: merchant.id, categoryId: catId,
            title: d.title, slug: d.slug, description: d.desc,
            highlights: JSON.stringify(["Premium quality", "Verified merchant", "Easy redemption", "Valid 30 days"]),
            images: JSON.stringify([d.img]),
            originalPrice: d.op, dealPrice: d.dp, discountPercent: d.disc,
            quantityTotal: 500, quantitySold: d.sold, maxPerUser: 5,
            startDate: new Date("2026-04-01"), endDate: new Date("2026-07-31"),
            isFeatured: d.feat, viewCount: d.view, ratingAvg: 4.5, ratingCount: 100,
            status: "ACTIVE",
            options: { create: [
              { title: "Standard", originalPrice: d.op, dealPrice: d.dp, boughtCount: Math.floor(d.sold * 0.6), sortOrder: 1 },
              { title: "Premium", originalPrice: d.op * 1.5, dealPrice: d.dp * 1.4, boughtCount: Math.floor(d.sold * 0.4), sortOrder: 2 },
            ]},
          },
        });
        totalDeals++;
      }
    }
  }

  console.log(`✅ ${totalMerchants} merchants seeded`);
  console.log(`✅ ${totalDeals} deals seeded across all categories`);
  console.log("\n🎉 Seed complete!\n");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
