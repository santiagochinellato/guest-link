"use client";

import { calculateDistance } from "@/lib/geo";
import { RecommendationsOverview } from "./recommendations/RecommendationsOverview";
import { RecommendationsDetail } from "./recommendations/RecommendationsDetail";

interface GuestRecommendationsViewProps {
  recommendations: any[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useScrollNavigation?: boolean;
  propertyId?: number;
  propertyLocation?: { lat: number; lng: number };
}

export function GuestRecommendationsView({
  recommendations,
  categories,
  activeCategory,
  setActiveCategory,
  useScrollNavigation = false,
  propertyId,
  propertyLocation,
}: GuestRecommendationsViewProps) {
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
        <RecommendationsOverview
          categories={categories}
          recommendations={recommendations}
          setActiveCategory={setActiveCategory}
          useScrollNavigation={useScrollNavigation}
          getDistanceString={getDistanceString}
          propertyId={propertyId}
        />
      )}

      {/* DETAIL MODE (CATEGORY SPECIFIC) */}
      {activeCategory && (
        <RecommendationsDetail
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          recommendations={recommendations}
          getDistanceString={getDistanceString}
          propertyId={propertyId}
        />
      )}
    </div>
  );
}
