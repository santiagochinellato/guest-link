"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/config/recommendations";
import { Utensils, TreePine, Zap, Map as MapIcon } from "lucide-react";

// Components
import { CategoryGrid } from "./recommendations/CategoryGrid";
import { CategoryCarousel } from "./recommendations/CategoryCarousel";
import { CategorySection } from "./recommendations/CategorySection";
import { RecommendationCard } from "./recommendations/RecommendationCard";
import { TransportCard } from "./recommendations/TransportCard";

interface GuestRecommendationsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useScrollNavigation?: boolean;
  propertyLocation?: { lat: number; lng: number };
}

export function GuestRecommendationsView({
  recommendations,
  categories,
  activeCategory,
  setActiveCategory,
  useScrollNavigation = false,
  propertyLocation,
}: GuestRecommendationsViewProps) {
  // Helper: Calculate Haversine Distance in km
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDistanceString = (place: any) => {
    if (
      !propertyLocation ||
      !place.latitude ||
      !place.longitude ||
      isNaN(parseFloat(place.latitude)) ||
      isNaN(parseFloat(place.longitude))
    ) {
      return null;
    }

    const distKm = calculateDistance(
      propertyLocation.lat,
      propertyLocation.lng,
      parseFloat(place.latitude),
      parseFloat(place.longitude),
    );

    if (distKm < 1) {
      return `${Math.round(distKm * 1000)}m`;
    }
    return `${distKm.toFixed(1)}km`;
  };

  // Define category groups
  const DINING_CATEGORIES = [
    "food",
    "gastronomy",
    "coffee",
    "breakfast",
    "bars",
    "nightlife",
  ];
  const ACTIVITY_CATEGORIES = [
    "monuments",
    "sights",
    "nature",
    "trails",
    "shopping",
    "shops",
    "culture",
    "outdoors",
    "kids",
  ];
  const SERVICES_CATEGORIES = [
    "supermarket",
    "pharmacy",
    "banks",
    "bancos_y_cajeros",
    "laundry",
    "essentials",
  ];

  const TRANSPORT_CATEGORIES = ["bus", "transit", "transfer", "taxi", "rental"];

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

  // Filter categories that actually have recommendations
  const validCategories = useMemo(
    () =>
      categories.filter((catKey) => {
        return recommendations.some((r) => r.categoryType === catKey);
      }),
    [categories, recommendations],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      {!activeCategory ? (
        <div className="space-y-2 mb-4">
          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Explora las mejores recomendaciones seleccionadas especialmente para
            ti.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 mb-6 w-full">
          <span className="text-xs text-neutral-500 font-medium text-center  ">
            Aquí encontrarás todo lo que necesitas para disfrutar al máximo de
            tu estadía.
          </span>
        </div>
      )}

      {/* OVERVIEW MODE */}
      {!activeCategory && (
        <div className="space-y-8">
          {/* CATEGORY GRID */}
          <CategoryGrid
            categories={validCategories}
            recommendations={recommendations}
            useScrollNavigation={useScrollNavigation}
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
              />

              <CategoryCarousel
                title="Experiencias y Paseos"
                icon={TreePine}
                items={topActivities}
                getDistanceString={getDistanceString}
              />

              <CategoryCarousel
                title="Servicios y Esenciales"
                icon={Zap}
                items={topServices}
                getDistanceString={getDistanceString}
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const catRecs = recommendations.filter(
              (r: any) => r.categoryType === catKey,
            );

            return (
              <CategorySection
                key={catKey}
                catKey={catKey}
                items={catRecs}
                getDistanceString={getDistanceString}
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
      )}

      {/* DETAIL MODE (CATEGORY SPECIFIC) */}
      {activeCategory && (
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
                        className={cn(
                          "w-3.5 h-3.5",
                          isActive ? "" : config.color,
                        )}
                      />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {recommendations
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?.filter((r: any) => r.categoryType === activeCategory)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((place: any, i: number) => {
                if (TRANSPORT_CATEGORIES.includes(activeCategory)) {
                  return (
                    <TransportCard
                      key={i}
                      place={place}
                      categoryType={activeCategory}
                    />
                  );
                }

                // STANDARD CARD
                return (
                  <RecommendationCard
                    key={i}
                    place={place}
                    index={i}
                    distance={getDistanceString(place)}
                  />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
