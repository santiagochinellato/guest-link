"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Star,
  ExternalLink,
  Map as MapIcon,
  ChevronLeft,
  Utensils,
  Landmark,
  TreePine,
  ShoppingBag,
  Music,
  Drama,
  Coffee,
  Train,
  CircleDollarSign,
  Shirt,
  ShoppingCart,
  Pill,
  MoreHorizontal,
  Sun,
  Baby,
  Zap,
  Car,
  Bus,
  Plane,
} from "lucide-react";

// Configuration for categories with visual assets
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  food: {
    label: "Gastronomía",
    icon: Utensils,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
  monuments: {
    label: "Sitios de Interés",
    icon: Landmark,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  sights: {
    label: "Sitios de Interés",
    icon: MapIcon,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  nature: {
    label: "Naturaleza",
    icon: TreePine,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-500/10",
  },
  trails: {
    label: "Senderos",
    icon: TreePine,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-600/10",
  },
  shopping: {
    label: "Compras",
    icon: ShoppingBag,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
  },
  shops: {
    label: "Tiendas",
    icon: ShoppingBag,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
  },
  nightlife: {
    label: "Vida Nocturna",
    icon: Music,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  bars: {
    label: "Bares",
    icon: Music,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  culture: {
    label: "Cultura",
    icon: Drama,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  coffee: {
    label: "Cafeterías",
    icon: Coffee,
    color: "text-amber-700",
    bg: "bg-amber-50 dark:bg-amber-700/10",
  },
  breakfast: {
    label: "Desayuno",
    icon: Coffee,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-600/10",
  },
  gastronomy: {
    label: "Gastronomía",
    icon: Utensils,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-600/10",
  },
  transit: {
    label: "Transporte",
    icon: Train,
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-500/10",
  },
  bancos_y_cajeros: {
    label: "Bancos / Cajeros",
    icon: CircleDollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-600/10",
  },
  banks: {
    label: "Bancos",
    icon: CircleDollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-600/10",
  },
  laundry: {
    label: "Lavandería",
    icon: Shirt,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
  },
  supermarket: {
    label: "Supermercados",
    icon: ShoppingCart,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  pharmacy: {
    label: "Farmacia",
    icon: Pill,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  outdoors: {
    label: "Aire Libre",
    icon: Sun,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
  },
  kids: {
    label: "Niños",
    icon: Baby,
    color: "text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10",
  },
  essentials: {
    label: "Esenciales",
    icon: Zap,
    color: "text-zinc-500",
    bg: "bg-zinc-50 dark:bg-zinc-500/10",
  },
  other: {
    label: "Otros",
    icon: MoreHorizontal,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-500/10",
  },
  taxi: {
    label: "Taxi / Remis",
    icon: Car,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  bus: {
    label: "Colectivo (Bus)",
    icon: Bus,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  transfer: {
    label: "Traslados",
    icon: Plane,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
};

interface GuestRecommendationsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any[];
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  useScrollNavigation?: boolean;
}

export function GuestRecommendationsView({
  recommendations,
  categories,
  activeCategory,
  setActiveCategory,
  useScrollNavigation = false,
}: GuestRecommendationsViewProps) {
  // State for expanded sections in Bento Grid
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Define category groups
  const TRANSPORT_CATEGORIES = ["bus", "transit", "transfer", "taxi", "rental"];

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

  // Filter and limit recommendations for each group (Top 5)
  const topDining = recommendations
    .filter((r) => DINING_CATEGORIES.includes(r.categoryType))
    .slice(0, 5);

  const topActivities = recommendations
    .filter((r) => ACTIVITY_CATEGORIES.includes(r.categoryType))
    .slice(0, 5);

  const topServices = recommendations
    .filter((r) => SERVICES_CATEGORIES.includes(r.categoryType))
    .slice(0, 5);

  // Helper to get category config safely
  const getCategoryConfig = (cat: string) => {
    return (
      CATEGORY_CONFIG[cat] || {
        label: cat,
        icon: BookOpen,
        color: "text-gray-500",
        bg: "bg-gray-100",
      }
    );
  };

  const currentCategoryConfig = activeCategory
    ? getCategoryConfig(activeCategory)
    : null;

  // Filter categories that actually have recommendations
  const validCategories = categories.filter((catKey) => {
    return recommendations.some((r) => r.categoryType === catKey);
  });

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
          {/* CATEGORY GRID - Moved to top for better navigation */}
          {validCategories.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">
                Explorar por Categoría
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {validCategories.map((catKey) => {
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
                        <config.icon className="w-5 h-5" strokeWidth={2} />
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
          )}

          {/* DOUBLE CAROUSEL - TOP PICKS */}
          {(topDining.length > 0 ||
            topActivities.length > 0 ||
            topServices.length > 0) && (
            <div className="space-y-8">
              {/* Dining Carousel */}
              {topDining.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Utensils className="w-4 h-4 text-brand-copper" />
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      Gastronomía y Vida Nocturna
                    </h4>
                  </div>
                  <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x no-scrollbar">
                    {topDining.map((place, i) => {
                      const catConfig = getCategoryConfig(place.categoryType);
                      const Component = place.googleMapsLink ? "a" : "div";
                      const props = place.googleMapsLink
                        ? {
                            href: place.googleMapsLink,
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {};

                      return (
                        <Component
                          key={`dining-${i}`}
                          {...props}
                          className={cn(
                            "relative group overflow-hidden rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm flex-shrink-0 snap-center bg-white dark:bg-neutral-900 cursor-pointer block text-left",
                            "w-[280px] h-[120px] md:w-[320px] md:h-[200px]",
                          )}
                        >
                          {/* Placeholder Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-copper/5 via-transparent to-brand-void/5 dark:from-brand-copper/10 dark:to-brand-void/20" />

                          <div className="absolute inset-0 px-4 py-2 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div
                                className={cn(
                                  "p-2 rounded-xl backdrop-blur-md bg-white/60 dark:bg-black/40",
                                  catConfig.color,
                                )}
                              >
                                <catConfig.icon className="w-4 h-4" />
                              </div>
                              {i < 3 && (
                                <div className="px-2 py-0.5 rounded-full bg-brand-copper/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                  Top {i + 1}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-neutral-900 dark:text-white leading-tight decoration-neutral-900 dark:decoration-white text-lg line-clamp-1">
                                {place.title}
                              </h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                {place.description}
                              </p>
                              <div className="flex items-center gap-1 pt-1">
                                <MapIcon className="w-3 h-3 text-neutral-400" />
                                <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                                  {place.formattedAddress || "Ver en mapa"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Component>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activities Carousel */}
              {topActivities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <TreePine className="w-4 h-4 text-brand-copper" />
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      Experiencias y Paseos
                    </h4>
                  </div>
                  <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x no-scrollbar">
                    {topActivities.map((place, i) => {
                      const catConfig = getCategoryConfig(place.categoryType);
                      const Component = place.googleMapsLink ? "a" : "div";
                      const props = place.googleMapsLink
                        ? {
                            href: place.googleMapsLink,
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {};

                      return (
                        <Component
                          key={`activity-${i}`}
                          {...props}
                          className={cn(
                            "relative group overflow-hidden rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm flex-shrink-0 snap-center bg-white dark:bg-neutral-900 cursor-pointer block text-left",
                            "w-[280px] h-[120px] md:w-[320px] md:h-[200px]",
                          )}
                        >
                          {/* Placeholder Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/20" />

                          <div className="absolute inset-0 py-2 px-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div
                                className={cn(
                                  "p-2 rounded-xl backdrop-blur-md bg-white/60 dark:bg-black/40",
                                  catConfig.color,
                                )}
                              >
                                <catConfig.icon className="w-4 h-4" />
                              </div>
                              {i < 3 && (
                                <div className="px-2 py-0.5 rounded-full bg-blue-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                  Must See
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-neutral-900 dark:text-white leading-tight decoration-neutral-900 dark:decoration-white text-lg line-clamp-1">
                                {place.title}
                              </h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                {place.description}
                              </p>
                              <div className="flex items-center gap-1 pt-1">
                                <MapIcon className="w-3 h-3 text-neutral-400" />
                                <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                                  {place.formattedAddress || "Ver en mapa"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Component>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Services Carousel */}
              {topServices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Zap className="w-4 h-4 text-brand-copper" />
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      Servicios y Esenciales
                    </h4>
                  </div>
                  <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x no-scrollbar">
                    {topServices.map((place, i) => {
                      const catConfig = getCategoryConfig(place.categoryType);
                      const Component = place.googleMapsLink ? "a" : "div";
                      const props = place.googleMapsLink
                        ? {
                            href: place.googleMapsLink,
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {};

                      return (
                        <Component
                          key={`service-${i}`}
                          {...props}
                          className={cn(
                            "relative group overflow-hidden rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm flex-shrink-0 snap-center bg-white dark:bg-neutral-900 cursor-pointer block text-left",
                            "w-[280px] h-[120px] md:w-[320px] md:h-[200px]",
                          )}
                        >
                          {/* Placeholder Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-teal-500/5 dark:from-green-500/10 dark:to-teal-500/20" />

                          <div className="absolute inset-0 py-2 px-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div
                                className={cn(
                                  "p-2 rounded-xl backdrop-blur-md bg-white/60 dark:bg-black/40",
                                  catConfig.color,
                                )}
                              >
                                <catConfig.icon className="w-4 h-4" />
                              </div>
                              {i < 3 && (
                                <div className="px-2 py-0.5 rounded-full bg-green-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                  Useful
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-neutral-900 dark:text-white leading-tight decoration-neutral-900 dark:decoration-white text-lg line-clamp-1">
                                {place.title}
                              </h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                {place.description}
                              </p>
                              <div className="flex items-center gap-1 pt-1">
                                <MapIcon className="w-3 h-3 text-neutral-400" />
                                <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                                  {place.formattedAddress || "Ver en mapa"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Component>
                      );
                    })}
                  </div>
                </div>
              )}
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

            const catConfig = getCategoryConfig(catKey);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const catRecs = recommendations.filter(
              (r: any) => r.categoryType === catKey,
            );
            if (catRecs.length === 0) return null;

            const isExpanded = expandedSections[catKey];
            const visibleRecs = isExpanded ? catRecs : catRecs.slice(0, 3);
            const hasMore = catRecs.length > 3;

            return (
              <div key={catKey} id={catKey} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 px-1">
                  <catConfig.icon className={cn("w-4 h-4", catConfig.color)} />
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    {catConfig.label}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {visibleRecs.map((place: any, i: number) => {
                    // Determine layout based on category
                    const isTransport = TRANSPORT_CATEGORIES.includes(catKey);

                    // TRANSPORT CARD STYLE
                    if (isTransport) {
                      const isBus = catKey === "bus" || catKey === "transit";
                      const isTaxi = catKey === "taxi";
                      const isTransfer = catKey === "transfer";
                      const isRental = catKey === "rental";

                      let Icon = Bus;
                      if (isTaxi || isRental) Icon = Car;
                      if (isTransfer) Icon = Plane;

                      return (
                        <div
                          key={i}
                          className="bg-white dark:bg-brand-void rounded-2xl p-3 md:p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2 md:gap-4 w-full">
                            {/* Left: Icon/Line Box */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <div
                                className={cn(
                                  "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm border",
                                  isBus
                                    ? "bg-[#1A73E8] border-[#1557B0]"
                                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400",
                                )}
                              >
                                {isBus ? (
                                  <span className="text-white font-bold text-sm md:text-base text-center leading-tight">
                                    {place.title.replace("Línea", "").trim()}
                                  </span>
                                ) : (
                                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                )}
                              </div>
                              {/* Visual connector only for Bus */}
                              {isBus && (
                                <div className="w-0.5 flex-1 min-h-[2rem] bg-zinc-200 dark:bg-zinc-800 my-1 border-l border-dashed border-zinc-300 dark:border-zinc-700" />
                              )}
                            </div>

                            <div className="space-y-3 pt-0.5 min-w-0 flex-1">
                              {/* Content based on Transport Type */}
                              {isBus ? (
                                <>
                                  {/* Bus: Destination */}
                                  <div className="min-w-0">
                                    <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                      Hacia
                                    </p>
                                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm md:text-base leading-tight break-words">
                                      {place.description}
                                    </h4>
                                  </div>
                                  {/* Bus: Stop Location */}
                                  {place.formattedAddress && (
                                    <div className="min-w-0">
                                      <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                        Parada
                                      </p>
                                      <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                                        {place.formattedAddress}
                                      </p>
                                    </div>
                                  )}
                                  {/* Bus: Recommendation/Tips */}
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {(place as any).extraInfo && (
                                    <div className="min-w-0 pt-1">
                                      <p className="text-[10px] uppercase font-bold text-amber-500/80 tracking-wider flex items-center gap-1">
                                        <Star className="w-3 h-3" />{" "}
                                        Recomendación
                                      </p>
                                      <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(place as any).extraInfo}
                                      </p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* Taxi/Transfer/Rental: Name is Headline */}
                                  <div className="min-w-0 pb-1">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                                      {place.title}
                                    </h3>
                                  </div>

                                  {/* Contact */}
                                  {place.phone && (
                                    <div className="min-w-0">
                                      <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                        Contacto
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                          {place.phone}
                                        </p>
                                        {/* Optional: Add WhatsApp/Call actions here if needed later */}
                                      </div>
                                    </div>
                                  )}

                                  {/* Observations */}
                                  {place.description && (
                                    <div className="min-w-0">
                                      <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                        Observaciones
                                      </p>
                                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                                        {place.description}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Right: Action Button */}
                            {/* BUS: Google Maps Link */}
                            {isBus && place.googleMapsLink && (
                              <a
                                href={place.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center gap-1 min-w-[50px] md:min-w-[60px] p-1.5 md:p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors shrink-0"
                              >
                                <div className="bg-white dark:bg-brand-void p-1.5 md:p-2 rounded-full shadow-sm">
                                  <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-center">
                                  Mapa
                                </span>
                              </a>
                            )}

                            {/* TAXI/TRANSFER: WhatsApp Action */}
                            {(isTaxi || isTransfer) && place.phone && (
                              <a
                                href={`https://wa.me/${place.phone.replace(/[^0-9]/g, "")}?text=Hola, quiero consultar por un servicio.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center gap-1 min-w-[50px] md:min-w-[60px] p-1.5 md:p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 transition-colors shrink-0"
                              >
                                <div className="bg-white dark:bg-brand-void p-1.5 md:p-2 rounded-full shadow-sm">
                                  {/* Simple Phone/Message Icon */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4 md:w-5 md:h-5"
                                  >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-center">
                                  Llamar
                                </span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // STANDARD CARD STYLE (For other categories)
                    return (
                      <div
                        key={i}
                        className="group bg-white dark:bg-brand-void rounded-[1rem] p-1 overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-2 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5 pt-1">
                              <h4 className="font-bold text-neutral-900 dark:text-white text-md leading-tight">
                                {place.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                                <MapIcon className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[100px]">
                                  {place.formattedAddress}
                                </span>
                              </div>
                            </div>

                            {place.googleMapsLink && (
                              <a
                                href={place.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-2xl bg-brand-copper/5 text-brand-copper hover:bg-brand-copper hover:text-white transition-all shadow-sm group-hover:rotate-6"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </div>

                          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-2xl">
                            {place.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [catKey]: !isExpanded,
                        }))
                      }
                      className="px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                      {isExpanded
                        ? "Ver menos"
                        : `Ver más (${catRecs.length - 3})`}
                    </button>
                  </div>
                )}
              </div>
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
            <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-2 w-max">
                {categories.map((catKey) => {
                  const config = getCategoryConfig(catKey);
                  // Count items for this category (optional, maybe overkill for tab?)
                  // const count = recommendations.filter(r => r.categoryType === catKey).length;
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
                // TRANSPORT CRAD (Google Maps Style)
                const TRANSPORT_CATEGORIES = [
                  "bus",
                  "transit",
                  "transfer",
                  "taxi",
                ];
                if (TRANSPORT_CATEGORIES.includes(activeCategory)) {
                  // Determine icon and label based on category/type
                  const isBus =
                    activeCategory === "bus" || activeCategory === "transit";
                  const isTaxi = activeCategory === "taxi";
                  const isTransfer = activeCategory === "transfer";

                  let Icon = Bus;
                  if (isTaxi) Icon = Car;
                  if (isTransfer) Icon = Plane;

                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-brand-void rounded-2xl p-3 md:p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2 md:gap-4 w-full">
                        {/* Left: Line Info */}
                        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div
                              className={cn(
                                "min-h-[2.5rem] w-auto max-w-[80px] md:max-w-[100px] px-2 py-1 rounded-lg flex items-center justify-center shadow-sm",
                                isBus ? "bg-[#1A73E8]" : "bg-brand-copper",
                              )}
                            >
                              <span className="text-white font-bold text-xs md:text-sm text-center leading-tight break-words">
                                {place.title}
                              </span>
                            </div>
                            {/* Visual dotted line connector - ONLY FOR BUS */}
                            {isBus && (
                              <div className="w-0.5 h-full min-h-[2rem] bg-neutral-200 dark:bg-neutral-700 my-1 border-l border-dashed border-neutral-300" />
                            )}
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-neutral-400 shrink-0" />
                          </div>

                          <div className="space-y-3 pt-0.5 min-w-0 flex-1">
                            {/* Destination / Description */}
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                {isBus ? "Hacia" : "Descripción"}
                              </p>
                              <h4 className="font-semibold text-neutral-900 dark:text-white text-sm md:text-base leading-tight break-words">
                                {place.description}
                              </h4>
                            </div>

                            {/* Stop Location (Only for Bus) */}
                            {isBus && place.formattedAddress && (
                              <div className="min-w-0">
                                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                  Parada
                                </p>
                                <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                                  {place.formattedAddress}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Action Button */}
                        {/* BUS: Google Maps Link */}
                        {isBus && place.googleMapsLink && (
                          <a
                            href={place.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1 min-w-[50px] md:min-w-[60px] p-1.5 md:p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors shrink-0"
                          >
                            <div className="bg-white dark:bg-brand-void p-1.5 md:p-2 rounded-full shadow-sm">
                              <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold text-center">
                              Mapa
                            </span>
                          </a>
                        )}

                        {/* TAXI/TRANSFER: WhatsApp Action */}
                        {(isTaxi || isTransfer) && place.phone && (
                          <a
                            href={`https://wa.me/${place.phone.replace(/[^0-9]/g, "")}?text=Hola, quiero consultar por un servicio.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1 min-w-[50px] md:min-w-[60px] p-1.5 md:p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 transition-colors shrink-0"
                          >
                            <div className="bg-white dark:bg-brand-void p-1.5 md:p-2 rounded-full shadow-sm">
                              {/* Simple Phone/Message Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 md:w-5 md:h-5"
                              >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold text-center">
                              Llamar
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }

                // STANDARD CARD (For Dining, Sights, etc.)
                return (
                  <div
                    key={i}
                    className="group bg-white dark:bg-brand-void rounded-[1rem] p-1 overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-2 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5 pt-1">
                          <h4 className="font-bold text-neutral-900 dark:text-white text-md leading-tight">
                            {place.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                            <MapIcon className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px]">
                              {place.formattedAddress}
                            </span>
                          </div>
                        </div>

                        {place.googleMapsLink && (
                          <a
                            href={place.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-2xl bg-brand-copper/5 text-brand-copper hover:bg-brand-copper hover:text-white transition-all shadow-sm group-hover:rotate-6"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-2xl">
                        {place.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
