"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Navigation,
  Star,
  Edit,
  Search,
  Map as MapIcon,
} from "lucide-react";

interface RecommendationField {
  id: string;
  categoryType?: string;
  title?: string;
  formattedAddress?: string;
  rating?: number;
  userRatingsTotal?: number;
}

interface RecommendationCategoryMeta {
  name?: string;
  type?: string;
  searchKeywords?: string;
}

interface RecommendationListProps {
  recFields: RecommendationField[];
  activeCategory: RecommendationCategoryMeta | null;
  activeCategoryIndex: number;
  viewMode: "list" | "map";
  onRemoveCategory: (index: number) => void;
  onEditRec: (index: number) => void;
  onRemoveRec: (index: number) => void;
  onSwitchToMap: () => void;
}

export function RecommendationList({
  recFields,
  activeCategory,
  activeCategoryIndex,
  viewMode,
  onRemoveCategory,
  onEditRec,
  onRemoveRec,
  onSwitchToMap,
}: RecommendationListProps) {
  return (
    <div
      className={cn(
        "w-full lg:w-1/3 lg:min-w-[400px] border-r border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-900/10 flex flex-col transition-transform duration-300",
        viewMode === "map" ? "hidden lg:flex" : "flex",
      )}
    >
      {/* Context Header */}
      <div className="p-4 flex justify-between items-center bg-white dark:bg-neutral-950/50">
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            {activeCategory?.name}
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {
                recFields.filter((r) => r.categoryType === activeCategory?.type)
                  .length
              }
            </Badge>
          </h3>
          <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
            {activeCategory?.searchKeywords || "Sin palabras clave"}
          </p>
        </div>

        {/* Category Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="w-fit justify-start text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-500 rounded-full text-xs "
          onClick={() => onRemoveCategory(activeCategoryIndex)}
        >
          <Trash2 className="w-3 h-3 mr-2" /> Eliminar categoría
        </Button>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar pb-20 lg:pb-3">
        {recFields.map((field, index) => {
          if (field.categoryType !== activeCategory?.type) return null;
          return (
            <div
              key={field.id}
              className="group relative bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                    {field.title}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {field.formattedAddress}
                  </div>
                  {field.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-[10px] font-medium text-gray-600">
                        {field.rating} ({field.userRatingsTotal})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onEditRec(index)}
                  className="flex items-center gap-1 p-1 text-green-700 hover:text-green-600 transition-opacity bg-white dark:bg-neutral-900 rounded-md shadow-sm w-fit self-end"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <p className="text-xs">Editar</p>
                </button>
                <button
                  onClick={() => onRemoveRec(index)}
                  className=" h-[24px] w-[24px] flex items-center gap-1 p-1 text-red-500 hover:text-red-600 transition-opacity bg-white dark:bg-neutral-900 rounded-md shadow-sm w-fit self-end"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {recFields.filter((r) => r.categoryType === activeCategory?.type)
          .length === 0 && (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <h4 className="text-xs font-semibold text-gray-600 mb-1">
              Lista vacía
            </h4>
            <p className="text-[10px] text-gray-400">
              Usa el buscador en el mapa para encontrar y agregar lugares.
            </p>
            <div className="mt-4 lg:hidden">
              <Button
                size="sm"
                onClick={onSwitchToMap}
                className="bg-brand-void text-white"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Ir al Mapa
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
