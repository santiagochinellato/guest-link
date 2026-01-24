"use client";

import { useState } from "react";
import {
  Utensils,
  ShoppingBag,
  Baby,
  TreePine,
  Pill,
  Landmark,
  MapPin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CategoriesSectionProps {
  // In real app, this would be data from DB
  recommendations: any[];
  emptyText: string;
  labels: {
    all: string;
    restaurant: string;
    shopping: string;
    kids: string;
    outdoor: string;
    services: string;
  };
}

// Temporary inline card until we refactor recommendation-card.tsx thoroughly or replace it
const ScrollCard = ({ rec }: { rec: any }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="snap-center shrink-0 w-[280px] h-[320px] rounded-3xl overflow-hidden relative group"
  >
    {/* Image / Gradient Fallback */}
    <div
      className={cn(
        "w-full h-full bg-neutral-200 dark:bg-neutral-800",
        // Generate a gradient based on category or ID if no image
        !rec.image &&
          "bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900",
      )}
    >
      {rec.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rec.image}
          alt={rec.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
    </div>

    {/* Content Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-bold text-lg leading-tight mb-1">{rec.title}</h4>
          <p className="text-sm text-white/70 line-clamp-2 mb-2">
            {rec.description}
          </p>
          {rec.address && (
            <div className="flex items-center gap-1 text-xs text-white/50">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{rec.address}</span>
            </div>
          )}
        </div>
        {rec.isFavorite && (
          <div className="p-1.5 bg-yellow-400/20 rounded-full text-yellow-400 backdrop-blur-sm">
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export function CategoriesSection({
  recommendations = [],
  emptyText,
  labels,
}: CategoriesSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const CATEGORIES = [
    { id: "all", label: labels?.all || "All", icon: null },
    {
      id: "restaurant",
      label: labels?.restaurant || "Eat",
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: "shopping",
      label: labels?.shopping || "Shop",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: "kids",
      label: labels?.kids || "Kids",
      icon: <Baby className="w-4 h-4" />,
    },
    {
      id: "outdoor",
      label: labels?.outdoor || "Outdoor",
      icon: <TreePine className="w-4 h-4" />,
    },
    {
      id: "services",
      label: labels?.services || "Services",
      icon: <Pill className="w-4 h-4" />,
    },
  ];

  // TODO: Replace with real data logic
  const MOCK_RECS = [
    {
      id: 1,
      title: "La Maranda",
      description: "Best seafood paella in town. Ask for the daily catch.",
      categoryType: "restaurant",
      priceRange: 3,
      isFavorite: true,
      address: "Av. del Mar 55",
      image:
        "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=2940&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Supermarket Sol",
      description: "Open 24/7. Fresh bakery every morning.",
      categoryType: "services",
      priceRange: 1,
      address: "Main St 102",
      image:
        "https://images.unsplash.com/photo-1604719312566-b7cbfa869534?q=80&w=2600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Hidden Beach",
      description: "Secret cove only locals know. Steep hike down.",
      categoryType: "outdoor",
      priceRange: 0,
      isFavorite: true,
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2946&auto=format&fit=crop",
    },
  ];

  const displayRecs = recommendations.length > 0 ? recommendations : MOCK_RECS;
  const filtered =
    activeCategory === "all"
      ? displayRecs
      : displayRecs.filter((r) => r.categoryType === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 scroll-pl-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border",
              activeCategory === cat.id
                ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-lg scale-105"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50",
            )}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Horizontal Scroll List */}
      <div className="overflow-x-auto -mx-4 px-4 pb-8 no-scrollbar flex snap-x snap-mandatory gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((rec) => (
            <ScrollCard key={rec.id} rec={rec} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="w-full text-center py-10 text-neutral-400 text-sm flex flex-col items-center">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3">
              <MapPin className="w-6 h-6 opacity-30" />
            </div>
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}
