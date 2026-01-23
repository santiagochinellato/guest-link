"use client";

import { useState } from "react";
import {
  Utensils,
  ShoppingBag,
  Baby,
  TreePine,
  Pill,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecommendationCard } from "./recommendation-card";
import { motion, AnimatePresence } from "framer-motion";

interface CategoriesSectionProps {
  // In real app, this would be data from DB
  recommendations: any[];
}

export function CategoriesSection({
  recommendations = [],
}: CategoriesSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const CATEGORIES = [
    { id: "all", label: "All", icon: null },
    {
      id: "restaurant",
      label: "Eat & Drink",
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: "shopping",
      label: "Shopping",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    { id: "kids", label: "Kids", icon: <Baby className="w-4 h-4" /> },
    { id: "outdoor", label: "Outdoor", icon: <TreePine className="w-4 h-4" /> },
    { id: "services", label: "Services", icon: <Pill className="w-4 h-4" /> },
  ];

  // Mock filtering
  // const filtered = activeCategory === 'all' ? recommendations : recommendations.filter(r => r.categoryType === activeCategory);

  // MOCK DATA for display
  const MOCK_RECS = [
    {
      id: 1,
      title: "La Maranda",
      description: "Best seafood paella in town.",
      categoryType: "restaurant",
      priceRange: 3,
      isFavorite: true,
      address: "Av. del Mar 55",
    },
    {
      id: 2,
      title: "Supermarket Sol",
      description: "Open 24/7.",
      categoryType: "services",
      priceRange: 1,
      address: "Main St 102",
    },
    {
      id: 3,
      title: "Hidden Beach",
      description: "Secret cove only locals know.",
      categoryType: "outdoor",
      priceRange: 0,
      isFavorite: true,
    },
  ];

  const filtered =
    activeCategory === "all"
      ? MOCK_RECS
      : MOCK_RECS.filter((r) => r.categoryType === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              activeCategory === cat.id
                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-gray-300",
            )}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4 min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              title={rec.title}
              description={rec.description}
              priceRange={rec.priceRange}
              isFavorite={rec.isFavorite}
              address={rec.address}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            No recommendations found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
