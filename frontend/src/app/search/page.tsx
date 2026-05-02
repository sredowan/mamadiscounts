"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, MapPin, Loader2 } from "lucide-react";
import { DealCard } from "@/components/deals/DealCard";
import { DEAL_STORE_CHANGED, getMarketplaceDeals } from "@/lib/deal-store";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types";
import styles from "./page.module.css";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "100px 0", textAlign: "center" }}><Loader2 size={32} className="animate-spin mx-auto" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  return <SearchContentBody key={initialQuery} initialQuery={initialQuery} />;
}

function SearchContentBody({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange] = useState<[number, number]>([0, 50000]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const refresh = () => setAllDeals(getMarketplaceDeals());
    refresh();
    window.addEventListener(DEAL_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DEAL_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Haversine formula
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
  };

  const handleNearMe = () => {
    if (userLocation) {
      setUserLocation(null); // Toggle off
      return;
    }
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          setSortBy("distance");
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not access your location. Please check browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  const filteredDeals = useMemo(() => {
    // 1. Start with copy of demo deals and dynamically calculate distance
    let deals = allDeals.map(d => {
      if (userLocation) {
        const dist = getDistanceFromLatLonInKm(
          userLocation.lat, 
          userLocation.lng, 
          d.merchant.latitude as number || 0, 
          d.merchant.longitude as number || 0
        );
        return {
          ...d,
          merchant: { ...d.merchant, distanceKm: parseFloat(dist.toFixed(1)) }
        };
      }
      return d;
    });

    // 2. Filter by search query (Smart Search)
    let isNearbySearch = false;
    
    if (query) {
      const q = query.toLowerCase();
      
      // Synonym mappings
      const keywordMap: Record<string, string[]> = {
        "gym": ["fitness", "workout", "health", "exercise", "weight", "yoga", "gym"],
        "fitness": ["gym", "workout", "health", "exercise", "weight", "yoga", "fitness"],
        "burger": ["food", "restaurant", "cafe", "fast food", "dining", "burger"],
        "pizza": ["food", "restaurant", "italian", "dining", "pizza"],
        "food": ["restaurant", "cafe", "buffet", "burger", "pizza", "dining", "food", "meal"],
        "restaurant": ["food", "cafe", "buffet", "dining", "restaurant", "meal"],
        "spa": ["beauty", "massage", "facial", "salon", "relaxation", "spa", "treatment"],
        "salon": ["beauty", "hair", "haircut", "spa", "salon", "treatment"],
        "beauty": ["spa", "salon", "hair", "massage", "facial", "makeup", "beauty"],
        "car": ["auto", "wash", "mechanic", "vehicle", "car"],
        "auto": ["car", "wash", "mechanic", "vehicle", "auto"]
      };

      const stopWords = ["in", "deals", "deal", "for", "the", "a", "an", "and", "near", "me", "nearby", "closest", "around"];
      
      if (q.includes("nearby") || q.includes("near me") || q.includes("closest") || q.includes("around me")) {
        isNearbySearch = true;
      }

      const words = q.split(/[\s,]+/).filter(w => w.length > 0 && !stopWords.includes(w));

      if (words.length > 0) {
        deals = deals.filter((d) => {
          const searchableText = `${d?.title || ""} ${d?.merchant?.businessName || ""} ${d?.category?.name || ""} ${d?.category?.slug || ""} ${d?.merchant?.area || ""} ${d?.merchant?.city || ""} ${d?.merchant?.address || ""} ${d?.description || ""}`.toLowerCase();
          
          return words.every(word => {
            if (searchableText.includes(word)) return true;
            // Find synonyms if word matches a key in keywordMap
            let synonyms: string[] = [];
            for (const [key, syns] of Object.entries(keywordMap)) {
              if (word === key || (word.length >= 3 && key.startsWith(word))) {
                synonyms = synonyms.concat(syns);
              }
            }
            return synonyms.some(syn => searchableText.includes(syn));
          });
        });
      }
    }

    // 3. Filter by category
    if (selectedCategory) {
      deals = deals.filter((d) => d.category.id === selectedCategory);
    }

    // 4. Filter by price
    deals = deals.filter(
      (d) => d.dealPrice >= priceRange[0] && d.dealPrice <= priceRange[1]
    );

    // 5. If geolocation active, filter out deals beyond radius (e.g. 10km)
    if (userLocation) {
      deals = deals.filter((d) => (d.merchant.distanceKm || 0) <= 10);
    }

    // 6. Sort
    deals.sort((a, b) => {
      // Priority 1: Sponsored or Featured deals always float to the top
      const aPromoted = a.isSponsored || a.isFeatured ? 1 : 0;
      const bPromoted = b.isSponsored || b.isFeatured ? 1 : 0;
      
      if (aPromoted !== bPromoted) {
        return bPromoted - aPromoted;
      }

      // Priority 2: Use user selected sort, but force distance if they searched "nearby"
      const effectiveSort = (isNearbySearch && userLocation) ? "distance" : sortBy;

      switch (effectiveSort) {
        case "price_asc": return a.dealPrice - b.dealPrice;
        case "price_desc": return b.dealPrice - a.dealPrice;
        case "discount": return b.discountPercent - a.discountPercent;
        case "rating": return b.ratingAvg - a.ratingAvg;
        case "distance": 
          if (userLocation) {
            return (a.merchant.distanceKm || 99999) - (b.merchant.distanceKm || 99999);
          }
          return b.quantitySold - a.quantitySold;
        default: 
          return b.quantitySold - a.quantitySold;
      }
    });

    return deals;
  }, [allDeals, query, selectedCategory, priceRange, sortBy, userLocation]);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals, spas, food, activities..."
            className={styles.searchInput}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className={styles.clearBtn} type="button">
              <X size={18} />
            </button>
          )}
          <div className={styles.divider}></div>
          <button 
            onClick={handleNearMe} 
            className={cn(styles.nearMeBtn, userLocation && styles.nearMeActive)}
            title="Find deals near me"
            type="button"
          >
            {isLocating ? <Loader2 size={18} className={styles.spin} /> : <MapPin size={18} />}
            <span>Near Me</span>
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={cn(styles.filterToggle, showFilters && styles.filterActive)} type="button">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Category</h4>
              <div className={styles.filterOptions}>
                <button className={cn(styles.filterChip, !selectedCategory && styles.chipActive)} onClick={() => setSelectedCategory(null)}>
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} className={cn(styles.filterChip, selectedCategory === cat.id && styles.chipActive)} onClick={() => setSelectedCategory(cat.id)}>
                    <cat.icon size={14} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>Sort By</h4>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
                <option value="popular">Most Popular</option>
                {userLocation && <option value="distance">Nearest First</option>}
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        <div className={styles.results}>
          <p className={styles.resultCount}>
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? "s" : ""} found
            {query && <> for &quot;<strong>{query}</strong>&quot;</>}
          </p>

          {filteredDeals.length > 0 ? (
            <div className="deal-grid">
              {filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <Search size={48} className={styles.noResultsIcon} />
              <h2>No deals found</h2>
              <p>Try adjusting your filters or search for something else.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
