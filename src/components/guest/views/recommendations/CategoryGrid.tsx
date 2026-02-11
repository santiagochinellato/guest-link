"use client";

import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/config/recommendations";

interface CategoryGridProps {
  categories: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any[];
  useScrollNavigation: boolean;
  setActiveCategory: (cat: string) => void;
}

export function CategoryGrid({
  categories,
  recommendations,
  useScrollNavigation,
  setActiveCategory,
}: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
        Explorar por Categoría
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((catKey) => {
          const config = getCategoryConfig(catKey);
          const count = recommendations.filter(
            (r) => r.categoryType === catKey,
          ).length;

          return (
            <button
              key={catKey}
              onClick={() => {
                if (useScrollNavigation) {
                  const element = document.getElementById(catKey);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                } else {
                  setActiveCategory(catKey);
                }
              }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-brand-void border border-neutral-100 dark:border-neutral-800 shadow-sm active:scale-95 transition-all text-left group"
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-colors shrink-0",
                  config.bg,
                  config.color,
                )}
              >
                <config.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold text-neutral-800 dark:text-neutral-200 text-xs truncate">
                  {config.label}
                </span>
                <span className="block text-[10px] text-neutral-400 font-medium">
                  {count} {count === 1 ? "lugar" : "lugares"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
