"use client";

import { Coffee, Sun, Moon, MapPin, ChevronRight } from "lucide-react";
import { TimeOfDay } from "@/hooks/useReservationState";
import { GuestRecommendation } from "@/types/dtos";
import { getCategoryConfig } from "@/config/recommendations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TIME_CATEGORY_MAP: Record<TimeOfDay, string[]> = {
  morning: ['breakfast', 'outdoors', 'trails', 'sights'],
  afternoon: ['shopping', 'shops', 'kids', 'bars'],
  evening: ['bars', 'gastronomy', 'essentials', 'banks', 'bancos_y_cajeros'],
  night: [], // Solo emergencias
};

const TIME_TITLES: Record<TimeOfDay, string> = {
  morning: "¿Qué hacer hoy?",
  afternoon: "¿Qué hacer esta tarde?",
  evening: "¿Qué hacer esta noche?",
  night: "",
};

const TIME_ICONS: Record<TimeOfDay, typeof Coffee> = {
  morning: Coffee,
  afternoon: Sun,
  evening: Moon,
  night: Coffee, // No se usa
};

// Límites por categoría
const CATEGORY_LIMITS: Record<string, number> = {
  gastronomy: 4,
  trails: 2,
  sights: 2,
  shopping: 2,
  shops: 2,
  kids: 2,
  breakfast: 2,
  outdoors: 2,
  bars: 2,
  essentials: 2,
  banks: 2,
  bancos_y_cajeros: 2,
  // Resto de categorías: 2 por defecto
};

const getCategoryLimit = (categoryType: string): number => {
  return CATEGORY_LIMITS[categoryType] || 2;
};

interface TimeBasedRecommendationsProps {
  recommendations: GuestRecommendation[];
  timeOfDay: TimeOfDay;
  propertyId?: number;
  onOpenGuide?: () => void;
}

export function TimeBasedRecommendations({
  recommendations,
  timeOfDay,
  propertyId,
  onOpenGuide,
}: TimeBasedRecommendationsProps) {
  // No mostrar en madrugada
  if (timeOfDay === "night") {
    return null;
  }
  
  const relevantCategories = TIME_CATEGORY_MAP[timeOfDay];
  const title = TIME_TITLES[timeOfDay];
  const Icon = TIME_ICONS[timeOfDay];
  
  // Filtrar recomendaciones por categorías relevantes
  const filteredRecs = recommendations.filter((rec) =>
    rec.categoryType && relevantCategories.includes(rec.categoryType)
  );
  
  // Agrupar por categoría
  const groupedByCategory = filteredRecs.reduce((acc, rec) => {
    if (!rec.categoryType) return acc;
    const category = rec.categoryType;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rec);
    return acc;
  }, {} as Record<string, GuestRecommendation[]>);
  
  // Aplicar límites por categoría y obtener las primeras 6 recomendaciones
  const displayedRecs: Array<{ category: string; items: GuestRecommendation[] }> = [];
  let totalCount = 0;
  const maxDisplay = 6;
  
  // Ordenar categorías: gastronomía primero, luego el resto
  const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
    if (a === 'gastronomy') return -1;
    if (b === 'gastronomy') return 1;
    return a.localeCompare(b);
  });
  
  for (const category of sortedCategories) {
    if (totalCount >= maxDisplay) break;
    
    const limit = getCategoryLimit(category);
    const items = groupedByCategory[category].slice(0, limit);
    const remaining = maxDisplay - totalCount;
    const itemsToShow = items.slice(0, remaining);
    
    if (itemsToShow.length > 0) {
      displayedRecs.push({
        category,
        items: itemsToShow,
      });
      totalCount += itemsToShow.length;
    }
  }
  
  if (displayedRecs.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mt-4">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center text-brand-copper">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Recomendaciones para {timeOfDay === "morning" ? "la mañana" : timeOfDay === "afternoon" ? "la tarde" : "la noche"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Recommendations grouped by category */}
        <div className="space-y-5">
          {displayedRecs.map(({ category, items }) => {
            if (items.length === 0) return null;
            const categoryConfig = getCategoryConfig(category);
            const CategoryIcon = categoryConfig.icon;
            
            return (
              <div key={category} className="space-y-3">
                {/* Category Title */}
                <div className="flex items-center gap-2">
                  <CategoryIcon className={cn("w-4 h-4", categoryConfig.color)} />
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {categoryConfig.label}
                  </h4>
                </div>
                
                {/* Recommendations for this category */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id || item.title}
                      onClick={onOpenGuide}
                      className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
                    >
                      {/* Category Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        categoryConfig.bg
                      )}>
                        <CategoryIcon className={cn("w-5 h-5", categoryConfig.color)} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h5 className="font-semibold text-zinc-900 dark:text-white truncate text-sm">
                            {item.title}
                          </h5>
                          {item.rating && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                              ⭐ {item.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Map Icon */}
                      {item.googleMapsLink && (
                        <a
                          href={item.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Ver más button */}
        {onOpenGuide && (
          <Button
            onClick={onOpenGuide}
            variant="outline"
            className="w-full h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-brand-copper/50 hover:bg-brand-copper/5 dark:hover:bg-brand-copper/10 transition-all"
          >
            Ver más
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

