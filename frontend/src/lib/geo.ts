import type { Deal } from "@/types";

/* ── Browser Geolocation ─────────────────────────────── */

export interface UserCoords {
  latitude: number;
  longitude: number;
}

/**
 * Wraps navigator.geolocation.getCurrentPosition in a Promise.
 * Resolves with { latitude, longitude } or rejects on denial / timeout.
 */
export function getUserLocation(timeoutMs = 8000): Promise<UserCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: false, // faster, battery-friendly
        timeout: timeoutMs,
        maximumAge: 5 * 60 * 1000, // cache for 5 min
      }
    );
  });
}

/* ── Haversine Distance ──────────────────────────────── */

const R_KM = 6371; // Earth's mean radius in km

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula — returns the great-circle distance (km)
 * between two points on the Earth.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Sort deals by proximity ─────────────────────────── */

/**
 * Returns a new array of deals sorted by distance from the user.
 * Injects `merchant.distanceKm` into each deal.
 * Deals whose merchant has no lat/lng are pushed to the end.
 */
export function sortDealsByDistance(
  deals: Deal[],
  userLat: number,
  userLng: number
): Deal[] {
  return deals
    .map((deal) => {
      const mLat = deal.merchant.latitude;
      const mLng = deal.merchant.longitude;

      if (mLat == null || mLng == null) {
        return { ...deal, _dist: Infinity };
      }

      const dist = haversineDistance(userLat, userLng, mLat, mLng);
      return {
        ...deal,
        merchant: { ...deal.merchant, distanceKm: Math.round(dist * 10) / 10 },
        _dist: dist,
      };
    })
    .sort((a, b) => (a as { _dist: number })._dist - (b as { _dist: number })._dist)
    .map(({ _dist, ...rest }) => rest as Deal);
}
