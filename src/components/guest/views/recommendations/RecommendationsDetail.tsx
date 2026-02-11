"use client";

import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/config/recommendations";
import { RecommendationCard } from "./RecommendationCard";
import { TransportCard } from "./TransportCard";
import type { GuestRecommendation } from "@/types/dtos";

const TRANSPORT_CATEGORIES = ["bus", "transit", "transfer", "taxi", "rental"] as const;

type TransportCategory = (typeof TRANSPORT_CATEGORIES)[number];

interface RecommendationsDetailProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  recommendations: GuestRecommendation[];
  getDistanceString: (place: GuestRecommendation) => string | null;
  propertyId?: number;
}

export const RecommendationsDetail = memo(function RecommendationsDetail({
  categories,
  activeCategory,
  setActiveCategory,
  recommendations,
  getDistanceString,
  propertyId,
}: RecommendationsDetailProps) {
  // Memoize filtered recommendations to avoid re-filtering on every render
  const filteredRecommendations = useMemo(() => {
    return (
      recommendations?.filter(
        (r) => r.categoryType === activeCategory,
      ) || []
    );
  }, [recommendations, activeCategory]);

  const isTransport = TRANSPORT_CATEGORIES.includes(
    activeCategory as TransportCategory,
  );

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* CATEGORY TABS (If multiple categories exist) */}
      {categories.length > 1 && (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 w-max">
            {categories.map((catKey) => {
              const config = getCategoryConfig(catKey);
              const isActive = activeCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-md"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  )}
                >
                  <config.icon
                    className={cn("w-3.5 h-3.5", isActive ? "" : config.color)}
                  />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredRecommendations.map((place, i) => {
          if (isTransport) {
            return (
              <TransportCard
                key={place.id ?? i}
                place={place}
                categoryType={activeCategory}
              />
            );
          }

          // STANDARD CARD
          return (
            <RecommendationCard
              key={place.id ?? i}
              place={place}
              index={i}
              distance={getDistanceString(place)}
              propertyId={propertyId}
            />
          );
        })}
      </div>
    </div>
  );
});
