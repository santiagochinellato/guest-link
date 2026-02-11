"use client";

import { useState, useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/config/recommendations";
import { RecommendationCard } from "./RecommendationCard";
import { TransportCard } from "./TransportCard";
import { ChevronDown, ChevronUp } from "lucide-react";

const TRANSPORT_CATEGORIES = ["bus", "transit", "transfer", "taxi", "rental"] as const;

interface CategorySectionProps {
  catKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDistanceString?: (place: any) => string | null;
  propertyId?: number;
}

export const CategorySection = memo(function CategorySection({
  catKey,
  items,
  getDistanceString,
  propertyId,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const catConfig = getCategoryConfig(catKey);

  if (!items || items.length === 0) return null;

  // Memoize visible recommendations to avoid re-slicing on every render
  const visibleRecs = useMemo(
    () => (isExpanded ? items : items.slice(0, 3)),
    [items, isExpanded]
  );
  const hasMore = items.length > 3;
  const isTransport = TRANSPORT_CATEGORIES.includes(catKey as any);

  return (
    <div id={catKey} className="space-y-4 scroll-mt-24">
      <div className="flex items-center gap-2 px-1">
        <catConfig.icon className={cn("w-4 h-4", catConfig.color)} />
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          {catConfig.label}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleRecs.map((place, i) =>
          isTransport ? (
            <TransportCard
              key={place.id || place.googlePlaceId || i}
              place={place}
              categoryType={catKey}
            />
          ) : (
            <RecommendationCard
              key={place.id || place.googlePlaceId || i}
              place={place}
              index={i}
              distance={getDistanceString ? getDistanceString(place) : null}
              propertyId={propertyId}
              className="h-[180px]"
            />
          ),
        )}
      </div>

      {/* View More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            {isExpanded ? (
              <>
                Ver menos <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Ver más ({items.length - 3}) <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
});
