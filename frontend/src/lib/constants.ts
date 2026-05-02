import {
  Scissors, UtensilsCrossed, Ticket, Car, Briefcase,
  Plane, Heart, Sparkles, Dumbbell, ShoppingBag, Clapperboard
} from "lucide-react";

export const SITE_NAME = "COUPONUS BD";
export const SITE_TAGLINE = "Best Deals & Discounts in Bangladesh";
export const CURRENCY_SYMBOL = "৳";
export const DEFAULT_CITY = "dhaka";

// ── Categories ────────────────────────────────────────────
export const CATEGORIES = [
  { id: "food", name: "Food & Drink", slug: "food-and-drink", icon: UtensilsCrossed, color: "#f97316" },
  { id: "shopping", name: "Shopping", slug: "shopping", icon: ShoppingBag, color: "#d946ef" },
  { id: "movies", name: "Movie Tickets", slug: "movie-tickets", icon: Clapperboard, color: "#eab308" },
  { id: "beauty", name: "Beauty & Spa", slug: "beauty-and-spa", icon: Sparkles, color: "#ec4899" },
  { id: "activities", name: "Activities", slug: "things-to-do", icon: Ticket, color: "#8b5cf6" },
  { id: "health", name: "Health & Fitness", slug: "health-and-fitness", icon: Dumbbell, color: "#10b981" },
  { id: "auto", name: "Auto & Home", slug: "auto-and-home", icon: Car, color: "#3b82f6" },
  { id: "services", name: "Services", slug: "services", icon: Briefcase, color: "#6366f1" },
  { id: "travel", name: "Travel", slug: "travel", icon: Plane, color: "#0ea5e9" },
  { id: "wellness", name: "Wellness", slug: "wellness", icon: Heart, color: "#ef4444" },
  { id: "salon", name: "Hair & Salon", slug: "hair-and-salon", icon: Scissors, color: "#f59e0b" },
] as const;

// ── Dhaka North City Corporation (DNCC) — 10 Zones, 54 Wards ──
export const DNCC_ZONES = [
  {
    zone: 1, name: "Uttara Zone",
    areas: [
      "Uttara Sector 1", "Uttara Sector 3", "Uttara Sector 4", "Uttara Sector 5",
      "Uttara Sector 6", "Uttara Sector 7", "Uttara Sector 9", "Uttara Sector 10",
      "Uttara Sector 11", "Uttara Sector 12", "Uttara Sector 13", "Uttara Sector 14",
      "Faydabad", "Abdullahpur", "Azampur", "Diabari", "Dakshinkhan",
    ],
  },
  {
    zone: 2, name: "Mirpur Zone",
    areas: [
      "Mirpur 1", "Mirpur 2", "Mirpur 6", "Mirpur 7",
      "Mirpur 10", "Mirpur 11", "Mirpur 12", "Mirpur 13", "Mirpur 14",
      "Rupnagar", "Pallabi", "Duaripara", "Kazipara",
    ],
  },
  {
    zone: 3, name: "Gulshan Zone",
    areas: [
      "Gulshan 1", "Gulshan 2", "Banani", "Banani DOHS",
      "Baridhara", "Baridhara DOHS", "Mohakhali", "Mohakhali DOHS",
      "Badda", "Merul Badda", "Niketan", "Kalachandpur",
    ],
  },
  {
    zone: 4, name: "Kafrul Zone",
    areas: [
      "Kafrul", "Bhashantek", "Ibrahimpur", "Cantonment",
      "Mirpur DOHS", "Pirerbag", "Tolarbag",
    ],
  },
  {
    zone: 5, name: "Tejgaon Zone",
    areas: [
      "Karwan Bazar", "Tejgaon", "Tejkunipara", "Sher-e-Bangla Nagar",
      "Farmgate", "Monipuripara", "Nakhalpara", "Bijoy Sarani",
    ],
  },
  {
    zone: 6, name: "Mohammadpur Zone",
    areas: [
      "Mohammadpur", "Adabar", "Shyamoli", "Ring Road", "Lalmatia",
      "Japan Garden City", "Pisciculture Housing", "Nurjahan Road",
      "Babar Road", "Shankar",
    ],
  },
  {
    zone: 7, name: "Vatara Zone",
    areas: [
      "Vatara", "Bashundhara R/A", "Aftab Nagar", "Nadda",
      "Nurerchala", "Satarkul", "Khilkhet",
    ],
  },
  {
    zone: 8, name: "Turag Zone",
    areas: [
      "Turag", "Tongi", "Ashulia", "Bimanbandar",
      "Kamar Para", "Baunia",
    ],
  },
  {
    zone: 9, name: "Rampura Zone",
    areas: [
      "Rampura", "Banasree", "South Banasree", "Hatirjheel",
      "DIT Project", "Nandipara",
    ],
  },
  {
    zone: 10, name: "Shah Ali Zone",
    areas: [
      "Shah Ali", "Darussalam", "Agargaon", "Taltola",
      "Paikpara", "Monipur",
    ],
  },
] as const;

// ── Dhaka South City Corporation (DSCC) — 75 Wards ────────
export const DSCC_AREAS = [
  {
    zone: "Dhanmondi", slug: "dhanmondi",
    areas: [
      "Dhanmondi", "Dhanmondi R/A", "Jhigatola", "Shankar",
      "Kalabagan", "Elephant Road", "New Market",
    ],
  },
  {
    zone: "Motijheel", slug: "motijheel",
    areas: [
      "Motijheel", "Dilkusha", "Arambagh", "Kakrail", "Paltan",
      "Segunbagicha", "Topkhana Road", "Stadium",
    ],
  },
  {
    zone: "Gulistan", slug: "gulistan",
    areas: [
      "Gulistan", "Fulbaria", "Babu Bazar", "Bangshal",
      "Sadarghat", "Wiseghat",
    ],
  },
  {
    zone: "Lalbagh", slug: "lalbagh",
    areas: [
      "Lalbagh", "Azimpur", "Nawabpur", "Islampur",
      "Chawkbazar", "Bakshi Bazar",
    ],
  },
  {
    zone: "Kotwali", slug: "kotwali",
    areas: [
      "Kotwali", "Shankhari Bazar", "Tanti Bazar",
      "Patuatuli", "Farashganj",
    ],
  },
  {
    zone: "Hazaribagh", slug: "hazaribagh",
    areas: [
      "Hazaribagh", "Zigatola", "Rayerbazar",
      "Bashbari", "Posta",
    ],
  },
  {
    zone: "Sutrapur", slug: "sutrapur",
    areas: [
      "Sutrapur", "Narinda", "Wari", "Gendaria",
      "Tipu Sultan Road", "Dholaikhal",
    ],
  },
  {
    zone: "Jatrabari", slug: "jatrabari",
    areas: [
      "Jatrabari", "Matuail", "Shyampur",
      "Mugda", "Sabujbag", "Bashabo",
    ],
  },
  {
    zone: "Kamrangirchar", slug: "kamrangirchar",
    areas: [
      "Kamrangirchar", "Beribandh", "Mohammadpur Beribandh",
    ],
  },
  {
    zone: "Demra", slug: "demra",
    areas: [
      "Demra", "Matuail", "Dhania",
      "Kashipur", "South Matuail",
    ],
  },
] as const;

// ── All Dhaka areas (flat list for search/autocomplete) ────
export const DHAKA_AREAS = [
  ...DNCC_ZONES.flatMap((z) =>
    z.areas.map((area) => ({
      name: area,
      zone: z.name,
      corporation: "DNCC" as const,
      slug: area.toLowerCase().replace(/[\s\/]+/g, "-").replace(/[()]/g, ""),
    }))
  ),
  ...DSCC_AREAS.flatMap((z) =>
    z.areas.map((area) => ({
      name: area,
      zone: z.zone,
      corporation: "DSCC" as const,
      slug: area.toLowerCase().replace(/[\s\/]+/g, "-").replace(/[()]/g, ""),
    }))
  ),
];

// ── Cities (Dhaka primary, others coming later) ────────────
export const CITIES = [
  {
    id: "dhaka",
    name: "Dhaka",
    namebn: "ঢাকা",
    primary: true,
    corporations: [
      { code: "DNCC", name: "Dhaka North City Corporation", namebn: "ঢাকা উত্তর সিটি কর্পোরেশন" },
      { code: "DSCC", name: "Dhaka South City Corporation", namebn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন" },
    ],
    popularAreas: [
      "Gulshan 1", "Gulshan 2", "Banani", "Dhanmondi", "Uttara Sector 4",
      "Bashundhara R/A", "Mirpur 10", "Mohammadpur", "Motijheel",
      "Farmgate", "Baridhara", "Banani DOHS", "Tejgaon",
      "Rampura", "Badda", "Mohakhali", "Uttara Sector 7",
    ],
  },
  { id: "chittagong", name: "Chittagong", namebn: "চট্টগ্রাম", primary: false, corporations: [], popularAreas: ["GEC Circle", "Agrabad", "Nasirabad"] },
  { id: "sylhet", name: "Sylhet", namebn: "সিলেট", primary: false, corporations: [], popularAreas: ["Zindabazar", "Amberkhana"] },
  { id: "rajshahi", name: "Rajshahi", namebn: "রাজশাহী", primary: false, corporations: [], popularAreas: ["Shaheb Bazar"] },
  { id: "khulna", name: "Khulna", namebn: "খুলনা", primary: false, corporations: [], popularAreas: ["Boyra"] },
] as const;

// ── SEO: Area-based deal pages for internal linking ────────
export const DHAKA_SEO_LINKS = DHAKA_AREAS.slice(0, 60).map((area) => ({
  label: `Deals in ${area.name}`,
  href: `/browse/dhaka/${area.slug}`,
  zone: area.zone,
  corporation: area.corporation,
}));

export const FOOTER_SERVICES = [
  "Spa Near You", "Massage Near You", "Hair Salon Near You",
  "Facial Near You", "Nail Salon Near You", "Waxing Near You",
  "Gym Near You", "Yoga Near You", "Restaurant Deals Near You",
  "Car Wash Near You", "Dental Near You", "Eye Care Near You",
];

export const NAV_LINKS = [
  { label: "Beauty & Spa", href: "/category/beauty-and-spa" },
  { label: "Food & Drink", href: "/category/food-and-drink" },
  { label: "Activities", href: "/category/things-to-do" },
  { label: "Services", href: "/category/services" },
  { label: "Travel", href: "/category/travel" },
  { label: "Deals", href: "/deals" },
] as const;

export const FOOTER_CITIES = CITIES.map(c => ({
  label: `Deals in ${c.name}`,
  href: `/browse/${c.id}`,
}));
