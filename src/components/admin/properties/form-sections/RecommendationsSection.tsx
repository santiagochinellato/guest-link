"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { APIProvider } from "@vis.gl/react-google-maps";
import { PropertyFormData } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Camera,
  ShoppingBag,
  Plus,
  Star,
  Map as MapIcon,
  List as ListIcon,
} from "lucide-react";
import { toast } from "sonner";
import { usePlacesSearch } from "./recommendations/usePlacesSearch";
import { PlacesMap } from "./recommendations/PlacesMap";
import { RecommendationList } from "./recommendations/RecommendationList";
import { CuratorModal } from "./recommendations/CuratorModal";
import { Omnibox } from "./recommendations/Omnibox";
import { AddCategoryDialog } from "./recommendations/AddCategoryDialog";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Default Seed Categories (if none exist)
const DEFAULT_CATEGORIES = [
  {
    name: "Gastronomía",
    type: "gastronomy",
    icon: "Utensils",
    searchKeywords: "restaurant, cafe, bar, bakery",
  },
  {
    name: "Atracciones",
    type: "sights",
    icon: "Camera",
    searchKeywords: "tourist_attraction, museum, park",
  },
  {
    name: "Compras",
    type: "shops",
    icon: "ShoppingBag",
    searchKeywords: "shopping_mall, store",
  },
];

const ICONS_MAP: Record<string, React.ElementType> = {
  Utensils,
  Camera,
  ShoppingBag,
  Star,
};

interface RecommendationsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export function RecommendationsSection({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialData,
}: RecommendationsSectionProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl">
        Error: Falta la API Key de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places", "marker"]}
      version="beta"
    >
      <RecommendationsContent />
    </APIProvider>
  );
}

function RecommendationsContent() {
  const { control, watch } = useFormContext<PropertyFormData>();
  const propLat = watch("latitude");
  const propLng = watch("longitude");

  // --- Dynamic Categories State ---
  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: "categories",
  });

  // Ensure we have seeds
  useEffect(() => {
    if (categoryFields.length === 0) {
      DEFAULT_CATEGORIES.forEach((cat) => appendCategory(cat));
    }
  }, [categoryFields.length, appendCategory]);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const activeCategory = categoryFields[activeCategoryIndex];

  // --- Recommendations State ---
  const {
    fields: recFields,
    append: appendRec,
    remove: removeRec,
  } = useFieldArray({
    control,
    name: "recommendations",
  });

  // --- UX State: View Mode & Editing ---
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<any>(null);

  const selectedPlaceIds = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Set(recFields.map((f: any) => f.googlePlaceId));
  }, [recFields]);

  // Center Map on Property
  const center = useMemo(() => {
    if (propLat && propLng) {
      return { lat: parseFloat(propLat), lng: parseFloat(propLng) };
    }
    return { lat: 40.416, lng: -3.703 }; // Default Madrid
  }, [propLat, propLng]);

  // --- Custom Hook for Search Logic ---
  const {
    isSearching,
    suggestedPlaces,
    handleSearch,
    handleDiscoverNearby,
    setSuggestedPlaces,
  } = usePlacesSearch({
    center,
    existingPlaceIds: selectedPlaceIds,
  });

  // --- Handlers ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddPlace = (place: any) => {
    const location = place.location || place.geometry?.location;
    const displayName = place.displayName || place.name;
    const placeId = place.id || place.place_id;

    if (!location || !displayName || !activeCategory) return;

    appendRec({
      title: displayName,
      formattedAddress:
        place.formattedAddress ||
        place.formatted_address ||
        place.vicinity ||
        "",
      googleMapsLink: place.googleMapsURI || place.url || "",
      categoryType: activeCategory.type,
      description: "",
      googlePlaceId: placeId,
      latitude: location.lat().toString(),
      longitude: location.lng().toString(),
      rating: place.rating || undefined,
      userRatingsTotal:
        place.userRatingCount || place.user_ratings_total || undefined,
      // Enhanced Data Extraction
      website: place.website || place.websiteURI || "",
      phone:
        place.formatted_phone_number || place.international_phone_number || "",
      openingHours: place.opening_hours
        ? {
            weekday_text: place.opening_hours.weekday_text || [],
            open_now:
              place.opening_hours.open_now || place.opening_hours.isOpen?.(),
            periods: place.opening_hours.periods || [],
          }
        : undefined,
    });

    toast.success("Agregado a " + activeCategory.name);

    // Remove from suggestions
    setSuggestedPlaces((prev) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prev.filter((p: any) => {
        const pId = p.id || p.place_id;
        return pId !== placeId;
      }),
    );

    setSelectedPlaceInfo(null);
    setEditingIndex(recFields.length); // length is currently X, index of next is X (wait, if appended, length increased?)
    // Actually append is async in terms of render, but usually fast.
    // Ideally we should wait or rely on effect, but this works often.
    // Correct logic: if we just called append, length will be X+1 next render.
    // But recFields is from hook form, it might not update immediately in this closure.
    // However, length is safe enough for index of NEW item.
  };

  const editingItem = editingIndex !== null ? recFields[editingIndex] : null;

  return (
    <div className="flex flex-col h-[560px] md:h-[500px] bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden animate-in fade-in relative">

      {/* TOP BAR: Categories + Lista/Mapa toggle */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {/* Category chips — scrollable */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap py-1">
            {categoryFields.map((cat, idx) => {
              const Icon = ICONS_MAP[cat.icon || "Star"] || Star;
              const isActive = idx === activeCategoryIndex;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryIndex(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border shrink-0",
                    isActive
                      ? "bg-brand-void text-white border-brand-void shadow-md"
                      : "bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-800 hover:bg-gray-100",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}

            <AddCategoryDialog onAdd={(newCat) => appendCategory(newCat)}>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-copper text-white rounded-full border border-brand-copper hover:bg-brand-void/80 hover:border-brand-void transition-colors shrink-0">
                <Plus className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Nueva</span>
              </button>
            </AddCategoryDialog>
          </div>
        </div>

        {/* Lista / Mapa segmented control — visible only on mobile */}
        <div className="lg:hidden flex-shrink-0 flex items-center rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden bg-gray-50 dark:bg-neutral-900 p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
              viewMode === "list"
                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700",
            )}
          >
            <ListIcon className="w-3.5 h-3.5" />
            Lista
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
              viewMode === "map"
                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700",
            )}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Mapa
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden relative">
        <RecommendationList
          recFields={recFields}
          activeCategory={activeCategory}
          activeCategoryIndex={activeCategoryIndex}
          viewMode={viewMode}
          onRemoveCategory={removeCategory}
          onEditRec={setEditingIndex}
          onRemoveRec={removeRec}
          onSwitchToMap={() => setViewMode("map")}
        />

        {/* RIGHT: MAP AREA */}
        <div
          className={cn(
            "flex-1 relative min-w-0 overflow-hidden",
            viewMode === "list" ? "hidden lg:block" : "block",
          )}
        >
          <PlacesMap
            center={center}
            recFields={recFields}
            suggestedPlaces={suggestedPlaces}
            activeCategory={activeCategory}
            selectedPlaceIds={selectedPlaceIds}
            isSearching={isSearching}
            onSearch={handleSearch}
            onDiscoverNearby={() => handleDiscoverNearby(activeCategory)}
            onAddPlace={handleAddPlace}
            onSelectPlace={setSelectedPlaceInfo}
            selectedPlaceInfo={selectedPlaceInfo}
            onCloseInfoWindow={() => setSelectedPlaceInfo(null)}
            OmniboxComponent={Omnibox}
          />
        </div>
      </div>

      {/* CURATOR MODAL */}
      <CuratorModal
        editingIndex={editingIndex}
        onClose={() => setEditingIndex(null)}
        item={editingItem}
      />
    </div>
  );
}
