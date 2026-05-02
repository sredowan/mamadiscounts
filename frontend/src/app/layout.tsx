import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "COUPONUS BD — Best Deals & Discounts in Bangladesh",
    template: "%s | COUPONUS BD",
  },
  description:
    "Discover amazing deals and discounts from local businesses across Bangladesh. Save up to 90% on restaurants, spas, activities, travel, and more. Pay with bKash.",
  keywords: [
    "deals Bangladesh",
    "discounts Dhaka",
    "coupon BD",
    "local deals",
    "bKash deals",
    "spa deals Dhaka",
    "restaurant deals Bangladesh",
  ],
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://couponusbd.com",
    siteName: "COUPONUS BD",
    title: "COUPONUS BD — Best Deals & Discounts in Bangladesh",
    description:
      "Save up to 90% on amazing local deals. Restaurants, spas, activities & more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "COUPONUS BD — Best Deals & Discounts in Bangladesh",
    description:
      "Save up to 90% on amazing local deals. Restaurants, spas, activities & more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
