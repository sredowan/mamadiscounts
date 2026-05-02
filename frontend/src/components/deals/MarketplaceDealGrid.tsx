"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, MapPin, Navigation, Loader2 } from "lucide-react";
import { DealCard } from "@/components/deals/DealCard";
import { DEAL_STORE_CHANGED, getMarketplaceDeals } from "@/lib/deal-store";
import { getUserLocation, sortDealsByDistance } from "@/lib/geo";
import type { Deal } from "@/types";
import type { UserCoords } from "@/lib/geo";

/* ─────────────────────────────────────────────────────────
   Deals Near You — Geolocation-sorted
   ───────────────────────────────────────────────────────── */

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; coords: UserCoords }
  | { status: "denied"; message: string };

export function NearbyDealsSection() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  // Load raw deals from store
  const refreshDeals = useCallback(() => getMarketplaceDeals(), []);

  // Request geolocation on mount
  useEffect(() => {
    setGeo({ status: "loading" });

    getUserLocation()
      .then((coords) => setGeo({ status: "granted", coords }))
      .catch(() =>
        setGeo({
          status: "denied",
          message: "Enable location to see deals near you",
        })
      );
  }, []);

  // When geo state changes or deals change, re-sort
  useEffect(() => {
    const raw = refreshDeals();

    if (geo.status === "granted") {
      setDeals(sortDealsByDistance(raw, geo.coords.latitude, geo.coords.longitude));
    } else {
      setDeals(raw);
    }
  }, [geo, refreshDeals]);

  // Listen for deal store changes
  useEffect(() => {
    const refresh = () => {
      const raw = getMarketplaceDeals();
      if (geo.status === "granted") {
        setDeals(sortDealsByDistance(raw, geo.coords.latitude, geo.coords.longitude));
      } else {
        setDeals(raw);
      }
    };

    window.addEventListener(DEAL_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DEAL_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [geo]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <MapPin
              size={22}
              style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
            />
            Deals Near You
          </h2>
          <Link href="/deals" className="section-link">
            Browse All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Location status indicator */}
        {geo.status === "loading" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "var(--color-primary-600)",
              background: "var(--color-primary-50)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <Loader2 size={14} className="animate-pulse" />
            Finding deals near you…
          </div>
        )}

        {geo.status === "denied" && (
          <button
            onClick={() => {
              setGeo({ status: "loading" });
              getUserLocation()
                .then((coords) => setGeo({ status: "granted", coords }))
                .catch(() =>
                  setGeo({ status: "denied", message: "Location access was denied" })
                );
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "var(--color-gray-600)",
              background: "var(--color-gray-100)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--color-gray-300)",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <Navigation size={14} />
            Enable location for nearby deals
          </button>
        )}

        {geo.status === "granted" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              marginBottom: "16px",
              fontSize: "12px",
              color: "var(--color-primary-700)",
              background: "var(--color-primary-50)",
              borderRadius: "var(--radius-full)",
              width: "fit-content",
            }}
          >
            <Navigation size={12} />
            Sorted by distance from you
          </div>
        )}

        <div className="deal-grid">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Featured Deals — Static (no geolocation)
   ───────────────────────────────────────────────────────── */

export function FeaturedDealsSection() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const refresh = () => {
      setDeals(getMarketplaceDeals().filter((d) => d.isFeatured));
    };
    refresh();

    window.addEventListener(DEAL_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DEAL_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <TrendingUp
              size={22}
              style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
            />
            Featured Deals
          </h2>
          <Link href="/deals?sort=featured" className="section-link">
            See All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="deal-grid">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </section>
  );
}
