"use client";

import { useMemo } from "react";
import { Utensils, TreePine, Zap, Map as MapIcon } from "lucide-react";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryCarousel } from "./CategoryCarousel";
import { CategorySection } from "./CategorySection";
import {
  DINING_CATEGORIES,
  ACTIVITY_CATEGORIES,
  SERVICES_CATEGORIES,
} from "@/config/recommendations";
import type { GuestRecommendation } from "@/types/dtos";

interface RecommendationsOverviewProps {
  categories: string[];
  recommendations: GuestRecommendation[];
  setActiveCategory: (category: string) => void;
  useScrollNavigation?: boolean;
  getDistanceString: (place: GuestRecommendation) => string | null;
  propertyId?: number;
}

export function RecommendationsOverview({
  categories,
  recommendations,
  setActiveCategory,
  useScrollNavigation,
  getDistanceString,
  propertyId,
}: RecommendationsOverviewProps) {
  // Filter categories that actually have recommendations
  const validCategories = useMemo(
    () =>
      categories.filter((catKey) => {
        return recommendations.some((r) => r.categoryType === catKey);
      }),
    [categories, recommendations],
  );

  // Filter and limit recommendations for each group (Top 5)
  const topDining = useMemo(
    () =>
      recommendations
        .filter((r) => DINING_CATEGORIES.includes(r.categoryType))
        .slice(0, 5),
    [recommendations],
  );

  const topActivities = useMemo(
    () =>
      recommendations
        .filter((r) => ACTIVITY_CATEGORIES.includes(r.categoryType))
        .slice(0, 5),
    [recommendations],
  );

  const topServices = useMemo(
    () =>
      recommendations
        .filter((r) => SERVICES_CATEGORIES.includes(r.categoryType))
        .slice(0, 5),
    [recommendations],
  );

  return (
    <div className="space-y-8">
      {/* CATEGORY GRID */}
      <CategoryGrid
        categories={validCategories}
        recommendations={recommendations}
        useScrollNavigation={!!useScrollNavigation}
        setActiveCategory={setActiveCategory}
      />

      {/* DOUBLE CAROUSEL - TOP PICKS */}
      {(topDining.length > 0 ||
        topActivities.length > 0 ||
        topServices.length > 0) && (
        <div className="space-y-8">
          <CategoryCarousel
            title="Gastronomía y Vida Nocturna"
            icon={Utensils}
            items={topDining}
            getDistanceString={getDistanceString}
            propertyId={propertyId}
          />

          <CategoryCarousel
            title="Experiencias y Paseos"
            icon={TreePine}
            items={topActivities}
            getDistanceString={getDistanceString}
            propertyId={propertyId}
          />

          <CategoryCarousel
            title="Servicios y Esenciales"
            icon={Zap}
            items={topServices}
            getDistanceString={getDistanceString}
            propertyId={propertyId}
          />
        </div>
      )}

      {/* GENERIC SECTIONS (Transport / Others) */}
      {categories.map((catKey) => {
        // Skip if handled by top groupings
        if (
          DINING_CATEGORIES.includes(catKey) ||
          ACTIVITY_CATEGORIES.includes(catKey) ||
          SERVICES_CATEGORIES.includes(catKey)
        )
          return null;

        const catRecs = recommendations.filter(
          (r) => r.categoryType === catKey,
        );

        return (
          <CategorySection
            key={catKey}
            catKey={catKey}
            items={catRecs}
            getDistanceString={getDistanceString}
            propertyId={propertyId}
          />
        );
      })}

      {/* EMPTY STATE */}
      {validCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <MapIcon className="w-6 h-6 text-neutral-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              Aún no hay recomendaciones
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[200px] mx-auto mt-1">
              Tu anfitrión está preparando las mejores sugerencias para ti.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
