"use client";

import { LucideIcon } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";

interface CategoryCarouselProps {
  title: string;
  icon: LucideIcon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDistanceString?: (place: any) => string | null;
}

export function CategoryCarousel({
  title,
  icon: Icon,
  items,
  getDistanceString,
}: CategoryCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className="w-4 h-4 text-brand-copper" />
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          {title}
        </h4>
      </div>
      <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x no-scrollbar">
        {items.map((place, i) => (
          <RecommendationCard
            key={`${title}-${i}`}
            place={place}
            index={i}
            highlight={true}
            distance={getDistanceString ? getDistanceString(place) : null}
            className="w-[280px] h-[180px] md:w-[320px] md:h-[180px]"
          />
        ))}
      </div>
    </div>
  );
}
