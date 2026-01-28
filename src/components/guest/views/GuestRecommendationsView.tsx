"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Star, ExternalLink, Map as MapIcon } from "lucide-react";

interface GuestRecommendationsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function GuestRecommendationsView({
  recommendations,
  categories,
  activeCategory,
  setActiveCategory,
}: GuestRecommendationsViewProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-brand-copper/10 rounded-xl text-brand-copper">
            <BookOpen className="w-6 h-6" />
          </span>
          Recomendaciones
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Descubre nuestros lugares favoritos. Desde la gastronomía local hasta
          los rincones secretos.
        </p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "snap-start px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border shadow-sm flex items-center gap-2",
                activeCategory === cat
                  ? "bg-brand-copper text-white border-brand-copper ring-4 ring-brand-copper/10 scale-105"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-gray-300 border-gray-100 dark:border-neutral-700 hover:border-brand-copper/50 hover:bg-gray-50",
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Sin categorías</p>
        )}
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {recommendations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.filter(
            (r: any) => !activeCategory || r.categoryType === activeCategory,
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((place: any, i: number) => (
            <div
              key={i}
              className="group bg-white dark:bg-neutral-800 rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        Top Pick
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-gray-200 dark:border-neutral-700 px-2 py-1 rounded-lg">
                        {place.categoryType}
                      </span>
                    </div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xl leading-tight">
                      {place.title}
                    </h4>
                  </div>
                  {place.googleMapsLink && (
                    <a
                      href={place.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-12 rounded-2xl bg-brand-copper/5 text-brand-copper flex items-center justify-center flex-shrink-0 hover:bg-brand-copper hover:text-white transition-all shadow-sm group-hover:scale-110"
                    >
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-gray-50 dark:border-neutral-700/50 pt-3">
                  {place.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-xl">
                  <MapIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{place.formattedAddress}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
