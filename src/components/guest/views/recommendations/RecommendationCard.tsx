"use client";

import { cn } from "@/lib/utils";
import { Star, Map as MapIcon } from "lucide-react";
import { getCategoryConfig } from "@/config/recommendations";

interface RecommendationCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  place: any;
  index: number;
  highlight?: boolean;
  distance?: string | null;
  className?: string;
}

export function RecommendationCard({
  place,
  index,
  highlight = false,
  distance,
  className,
}: RecommendationCardProps) {
  const catConfig = getCategoryConfig(place.categoryType);

  // Construct a valid Google Maps URL if one doesn't exist
  const mapsUrl =
    place.googleMapsLink ||
    (place.latitude && place.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title + " " + (place.formattedAddress || ""))}`);

  const Component = "a";
  const props = {
    href: mapsUrl,
    target: "_blank",
    rel: "noopener noreferrer",
  };

  return (
    <Component
      {...props}
      className={cn(
        "relative group overflow-hidden rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm flex-shrink-0 snap-center bg-white dark:bg-neutral-900 cursor-pointer block text-left",
        "h-[180px] md:w-[320px] md:h-[180px]",
        "transition-transform active:scale-[0.98]",
        className,
      )}
    >
      {/* Placeholder Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-void/5 via-transparent to-brand-copper/5 dark:from-brand-void/20 dark:to-brand-copper/10 " />

      <div className="w-full h-full inset-0 px-4 py-4 flex flex-col justify-center gap-2">
        <div className="flex justify-between items-start">
          <div
            className={cn(
              "p-2 rounded-xl backdrop-blur-md bg-white/60 dark:bg-black/40",
              catConfig.color,
            )}
          >
            <catConfig.icon className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {highlight && index < 3 && (
              <div className="px-2 py-0.5 rounded-full bg-brand-copper/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" />
                Top {index + 1}
              </div>
            )}
            {/* Distance Badge */}
            {distance && (
              <span className="text-[9px] font-bold text-neutral-400 bg-white/50 dark:bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                <MapIcon className="w-2.5 h-2.5" />
                {distance}
              </span>
            )}

            {/* Opening Hours (Commented out in original but keeping structure if needed) */}
            {/* {place.openingHours && (
               <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm border ...">
                 ...
               </div>
            )} */}
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-neutral-900 dark:text-white leading-tight decoration-neutral-900 dark:decoration-white text-lg line-clamp-1">
            {place.title}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {place.description}
          </p>
          <div className="flex items-center gap-1 pt-1 opacity-100">
            <MapIcon className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
            <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">
              {place.formattedAddress || "Ver en mapa"}
            </span>
          </div>
        </div>
      </div>
    </Component>
  );
}
