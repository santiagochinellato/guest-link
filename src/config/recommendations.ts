
import React from "react";
import {
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
  Sun,
  Baby,
  Zap,
  MoreHorizontal,
  Car,
  Bus,
  Plane,
  BookOpen,
  Map as MapIcon,
} from "lucide-react";

// Category Groups
export const DINING_CATEGORIES = [
  "food",
  "gastronomy",
  "coffee",
  "breakfast",
  "bars",
  "nightlife",
];

export const ACTIVITY_CATEGORIES = [
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

export const SERVICES_CATEGORIES = [
  "supermarket",
  "pharmacy",
  "banks",
  "bancos_y_cajeros",
  "laundry",
  "essentials",
];

export const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }
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

export const getCategoryConfig = (cat: string) => {
  return (
    CATEGORY_CONFIG[cat] || {
      label: cat,
      icon: BookOpen,
      color: "text-gray-500",
      bg: "bg-gray-100",
    }
  );
};
