"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  Pin,
  MapControl,
  ControlPosition,
} from "@vis.gl/react-google-maps";
import { PropertyFormData } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import {
  Utensils,
  Camera,
  ShoppingBag,
  Plus,
  Trash2,
  Search,
  Star,
  Navigation,
  Baby,
  Beer,
  Mountain,
  MapPin,
  X,
  MoreVertical,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  Beer,
  Baby,
  Mountain,
  Navigation,
  MapPin,
  Star,
};

interface RecommendationsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export function RecommendationsSection({
  initialData: _,
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
  const map = useMap();
  const placesLibrary = useMapsLibrary("places");
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

  // --- Map & Search State ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [suggestedPlaces, setSuggestedPlaces] = useState<
    google.maps.places.Place[]
  >([]);
  const [selectedPlaceInfo, setSelectedPlaceInfo] =
    useState<google.maps.places.Place | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  // --- Handlers ---

  const handleSearch = async (query: string) => {
    if (!map || !placesLibrary || !query) return;

    try {
      const { Place } = placesLibrary;

      // Priority 1: Search Nearby if we have a center
      const request = {
        textQuery: query,
        fields: [
          "displayName",
          "location",
          "formattedAddress",
          "googleMapsURI",
          "id",
          "types",
        ],
        locationBias: center, // Bias towards property
        maxResultCount: 15,
      };

      // Use TextSearch for free form
      const { places } = await Place.searchByText(request);

      if (places && places.length > 0) {
        setSuggestedPlaces(places);
        // Fit bounds to show results
        const bounds = new google.maps.LatLngBounds();
        places.forEach((p) => {
          if (p.location) bounds.extend(p.location);
        });
        map.fitBounds(bounds);
      } else {
        toast("No se encontraron resultados");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error en la búsqueda");
    } finally {
      setIsSearching(false);
    }
  };

  // Smart Discovery: Auto-search when changing category if keywords exist
  useEffect(() => {
    if (!map || !placesLibrary || !activeCategory) return;

    // Only auto-search if we explicitly want to, OR if the list is empty?
    // User requirement: "Omnibox" is primary, but maybe we can suggest based on active category keywords.
    // Let's rely on omnibox for explicit search, BUT provide a "Quick Search" button or auto-search.
    // Actually, sticking to the plan: Omnibox is the main discovery tool.
    // But let's pre-fill omnibox or trigger search if user wants.
    // For now, let's keep it manual via Omnibox as requested, to avoid spamming searches.

    // Optional: Auto-clear suggestions when swapping categories?
    // setSuggestedPlaces([]);
  }, [activeCategory, map, placesLibrary]);

  const handleAddPlace = (place: google.maps.places.Place) => {
    if (!place.location || !place.displayName || !activeCategory) return;

    appendRec({
      title: place.displayName,
      formattedAddress: place.formattedAddress || "",
      googleMapsLink: place.googleMapsURI || "",
      categoryType: activeCategory.type, // Use the slug/type of active category
      description: "",
      googlePlaceId: place.id,
      latitude: place.location.lat().toString(),
      longitude: place.location.lng().toString(),
      rating: place.rating || undefined,
      userRatingsTotal: place.userRatingCount || undefined,
    });

    toast.success("Agregado a " + activeCategory.name);
    setSelectedPlaceInfo(null);
  };

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden animate-in fade-in">
      <div className="flex flex-col  p-4 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recomendaciones
        </h2>
        <p className=" text-sm text-gray-600 dark:text-gray-300">
          Agrega lugares que los huéspedes pueden visitar cerca de la propiedad.
        </p>
      </div>
      {/* 1. TOP BAR: CATEGORY TABS */}
      <div className="min-h-14 flex items-center p-4 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto no-scrollbar gap-2 flex-wrap">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(categoryFields as any[]).map((cat, idx) => {
          const Icon = ICONS_MAP[cat.icon] || Star;
          const isActive = idx === activeCategoryIndex;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryIndex(idx)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
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

        {/* New Category Button */}
        <AddCategoryDialog onAdd={(newCat) => appendCategory(newCat)}>
          <button className="flex items-center justify-center w-fit px-3 py-1.5 bg-brand-copper text-white rounded-full border border-thin border-brand-copper hover:bg-brand-void/80 hover:border-brand-void transition-colors shrink-0">
            <Plus className="w-4 h-4" />
            <p className="text-xs font-medium">Nueva categoría</p>
          </button>
        </AddCategoryDialog>
      </div>

      {/* 2. MAIN CONTENT: SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: LIST */}
        <div className="w-1/3 min-w-[300px] border-r border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-900/10 flex flex-col">
          {/* Context Header */}
          <div className="p-4 flex justify-between items-center bg-white dark:bg-neutral-950/50">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                {activeCategory?.name}
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {
                    (recFields as any[]).filter(
                      (r) => r.categoryType === activeCategory?.type,
                    ).length
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
              onClick={() => removeCategory(activeCategoryIndex)}
            >
              <Trash2 className="w-3 h-3 mr-2" /> Eliminar categoría
            </Button>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(recFields as any[]).map((field, index) => {
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
                    <button className="flex items-center gap-1 p-1 text-green-700 hover:text-green-600 transition-opacity bg-white dark:bg-neutral-900 rounded-md shadow-sm w-fit self-end">
                      <Edit className="w-3.5 h-3.5" />
                      <p>Editar</p>
                    </button>
                    <button
                      onClick={() => removeRec(index)}
                      className=" h-[32px] w-[32px] flex items-center gap-1 p-2 text-red-500 hover:text-red-600 transition-opacity bg-white dark:bg-neutral-900 rounded-md shadow-sm w-fit self-end"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(recFields as any[]).filter(
              (r) => r.categoryType === activeCategory?.type,
            ).length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <h4 className="text-xs font-semibold text-gray-600 mb-1">
                  Lista vacía
                </h4>
                <p className="text-[10px] text-gray-400">
                  Usa el buscador en el mapa para encontrar y agregar lugares a
                  esta categoría.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: MAP AREA */}
        <div className="flex-1 relative bg-gray-100">
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={center}
            defaultZoom={14}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            className="w-full h-full"
          >
            {/* OMNIBOX CONTROL */}
            <MapControl position={ControlPosition.TOP_CENTER}>
              <div className="m-4">
                <Omnibox onSearch={handleSearch} isSearching={isSearching} />
              </div>
            </MapControl>

            {/* Property Pin */}
            <AdvancedMarker position={center}>
              <div className="relative">
                <div className="w-10 h-10 bg-brand-void border-2 border-white dark:border-neutral-900 rounded-full flex items-center justify-center shadow-xl z-20">
                  <Star className="w-5 h-5 text-brand-copper fill-current" />
                </div>
              </div>
            </AdvancedMarker>

            {/* Suggested Pins (Gray) */}
            {suggestedPlaces.map((place) => {
              if (!place.location) return null;
              const isSelected = selectedPlaceIds.has(place.id);
              if (isSelected) return null;

              return (
                <AdvancedMarker
                  key={place.id}
                  position={place.location}
                  onClick={() => setSelectedPlaceInfo(place)}
                >
                  <Pin
                    background={"#64748b"}
                    borderColor={"#475569"}
                    glyphColor={"#f1f5f9"}
                    scale={0.8}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Selected Pins (Colored) */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(recFields as any[]).map((field) => {
              if (!field.latitude || !field.longitude) return null;

              // Only show pins for active category? Or all?
              // Better to show ALL selected pins, but highlight active ones?
              // Let's show all but dim interactive ones?
              // For simplicity, let's show all in Brand Copper.
              const isCurrentCat = field.categoryType === activeCategory?.type;

              return (
                <AdvancedMarker
                  key={field.googlePlaceId || field.id}
                  position={{
                    lat: parseFloat(field.latitude),
                    lng: parseFloat(field.longitude),
                  }}
                  zIndex={isCurrentCat ? 20 : 10}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all border-2 border-white dark:border-neutral-900 transform",
                      isCurrentCat
                        ? "bg-brand-copper scale-110"
                        : "bg-gray-400 scale-90 opacity-70",
                    )}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow */}
            {selectedPlaceInfo && selectedPlaceInfo.location && (
              <InfoWindow
                position={selectedPlaceInfo.location}
                onCloseClick={() => setSelectedPlaceInfo(null)}
                headerContent={
                  <span className="font-bold text-sm">
                    {selectedPlaceInfo.displayName}
                  </span>
                }
              >
                <div className="p-2 min-w-[200px]">
                  <p className="text-xs text-gray-500 mb-2 truncate">
                    {selectedPlaceInfo.formattedAddress}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleAddPlace(selectedPlaceInfo)}
                    className="w-full h-8 text-xs bg-brand-void hover:bg-brand-void/90"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar a {activeCategory?.name}
                  </Button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Omnibox({
  onSearch,
  isSearching,
}: {
  onSearch: (q: string) => void;
  isSearching: boolean;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-800 w-[320px] overflow-hidden transition-all focus-within:ring-2 ring-brand-copper/50">
      <div className="pl-3 text-gray-400">
        {isSearching ? (
          <div className="w-4 h-4 rounded-full border-2 border-brand-copper border-t-transparent animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>
      <Input
        className="border-0 focus-visible:ring-0 shadow-none h-10 text-sm bg-transparent"
        placeholder="Buscar lugares (ej. Pizza, Museo...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch(query);
        }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="pr-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function AddCategoryDialog({
  children,
  onAdd,
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (cat: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Star");
  const [keywords, setKeywords] = useState("");

  const handleSubmit = () => {
    if (!name) return;
    // Generate simple slug
    const type = name.toLowerCase().replace(/\s+/g, "-");
    onAdd({ name, type, icon, searchKeywords: keywords });
    setOpen(false);
    setName("");
    setKeywords("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej. Cafeterías de Especialidad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Palabras Clave (para búsqueda)</Label>
            <Input
              placeholder="Ej. coffee, espresso, latte"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Icono</Label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(ICONS_MAP).map((key) => {
                const I = ICONS_MAP[key];
                return (
                  <button
                    key={key}
                    onClick={() => setIcon(key)}
                    className={cn(
                      "p-2 rounded-md border transition-all",
                      icon === key
                        ? "bg-brand-void text-white border-brand-void"
                        : "hover:bg-gray-100",
                    )}
                  >
                    <I className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Crear Categoría</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
