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
} from "lucide-react";
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Categories Configuration
const CATEGORIES = [
  {
    id: "gastronomy",
    label: "Gastronomía",
    icon: Utensils,
    types: ["restaurant", "cafe", "bar", "bakery"],
    color: "bg-orange-500",
    text: "text-orange-500",
  },
  {
    id: "sights",
    label: "Atracciones",
    icon: Camera,
    types: ["tourist_attraction", "museum", "park", "church"],
    color: "bg-purple-500",
    text: "text-purple-500",
  },
  {
    id: "shops",
    label: "Compras",
    icon: ShoppingBag,
    types: ["shopping_mall", "store", "supermarket"],
    color: "bg-pink-500",
    text: "text-pink-500",
  },
  {
    id: "nightlife",
    label: "Bares y Clubs",
    icon: Beer,
    types: ["bar", "night_club", "casino"],
    color: "bg-indigo-500",
    text: "text-indigo-500",
  },
  {
    id: "kids",
    label: "Para Niños",
    icon: Baby,
    types: ["amusement_park", "aquarium", "zoo"],
    color: "bg-yellow-500",
    text: "text-yellow-500",
  },
  {
    id: "outdoors",
    label: "Aire Libre",
    icon: Mountain,
    types: ["campground", "rv_park", "hiking_area"],
    color: "bg-emerald-500",
    text: "text-emerald-500",
  },
];

interface RecommendationsTabProps {
  initialData: {
    id?: number;
    categories?: PropertyFormData["categories"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recommendations?: any[];
    latitude?: string | null;
    longitude?: string | null;
  };
}

export function RecommendationsSection({
  initialData,
}: RecommendationsTabProps) {
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
      <RecommendationsContent initialData={initialData} />
    </APIProvider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RecommendationsContent({ initialData }: RecommendationsTabProps) {
  const { control, watch } = useFormContext<PropertyFormData>();
  const map = useMap();
  const placesLibrary = useMapsLibrary("places");
  const propLat = watch("latitude");
  const propLng = watch("longitude");

  // State
  const [activeCategory, setActiveCategory] = useState("gastronomy");
  const [suggestedPlaces, setSuggestedPlaces] = useState<
    google.maps.places.Place[]
  >([]);
  const [selectedPlaceInfo, setSelectedPlaceInfo] =
    useState<google.maps.places.Place | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    fields: recFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "recommendations",
  });

  // Derived state for existing markers
  const selectedPlaceIds = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Set(recFields.map((f: any) => f.googlePlaceId));
  }, [recFields]);

  // Handle Category Change & Smart Discovery
  useEffect(() => {
    if (!map || !placesLibrary || !propLat || !propLng) return;

    const fetchSuggestions = async () => {
      setIsSearching(true);
      setSuggestedPlaces([]);
      setSelectedPlaceInfo(null); // Close info window

      try {
        const center = { lat: parseFloat(propLat), lng: parseFloat(propLng) };
        const categoryConfig = CATEGORIES.find((c) => c.id === activeCategory);

        if (!categoryConfig) return;

        // Use Place.searchNearby (New Places API)
        const { Place, SearchNearbyRankPreference } = placesLibrary;

        const request = {
          fields: [
            "displayName",
            "location",
            "formattedAddress",
            "googleMapsURI",
            "id",
            "types",
          ],
          locationRestriction: {
            center: center,
            radius: 1500, // 1.5km
          },
          includedPrimaryTypes: categoryConfig.types,
          maxResultCount: 15,
          rankPreference: SearchNearbyRankPreference.POPULARITY,
        };

        // @ts-expect-error - searchNearby types might be tricky in beta
        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
          // Filter out already selected places if desired?
          // Better to show them but visually distinct.
          setSuggestedPlaces(places);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
        toast.error("Error buscando lugares cercanos.");
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [activeCategory, map, placesLibrary, propLat, propLng]);

  // Actions
  const handleAddPlace = (place: google.maps.places.Place) => {
    if (!place.location || !place.displayName) return;

    append({
      title: place.displayName,
      formattedAddress: place.formattedAddress || "",
      googleMapsLink: place.googleMapsURI || "",
      categoryType: activeCategory,
      description: "",
      googlePlaceId: place.id,
      latitude: place.location.lat().toString(),
      longitude: place.location.lng().toString(),
    });

    toast.success("Lugar agregado a la guía");
    setSelectedPlaceInfo(null);
  };

  const handleRemovePlace = (index: number) => {
    remove(index);
    toast.success("Lugar eliminado");
  };

  // Center Map on Property initially
  const center = useMemo(() => {
    if (propLat && propLng) {
      return { lat: parseFloat(propLat), lng: parseFloat(propLng) };
    }
    return { lat: 40.416, lng: -3.703 }; // Default Madrid
  }, [propLat, propLng]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-[700px] gap-6 animate-in fade-in duration-500">
      {/* LEFT PANEL: CONTROLS */}
      <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-white/5">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-brand-copper" fill="currentColor" />
            Curación de Lugares
          </h3>
          <p className="text-xs text-brand-void/60 dark:text-gray-400 mt-1">
            Explora y selecciona las mejores experiencias.
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="p-2 grid grid-cols-3 gap-1 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all text-xs font-medium gap-1",
                activeCategory === cat.id
                  ? `bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white`
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5",
              )}
            >
              <cat.icon
                className={cn("w-4 h-4", activeCategory === cat.id && cat.text)}
              />
              <span className="truncate w-full text-center">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* List of Selected Places (For current category or All?) 
            Let's show current category for focus.
        */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex justify-between items-center">
            Seleccionados (
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recFields.filter((f: any) => f.categoryType === activeCategory)
                .length
            }
            )
          </h4>

          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recFields.map((field: any, index) => {
              if (field.categoryType !== activeCategory) return null;
              return (
                <div
                  key={field.id}
                  className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-brand-copper/30 transition-all bg-white dark:bg-white/5"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      CATEGORIES.find((c) => c.id === field.categoryType)
                        ?.color,
                      "text-white",
                    )}
                  >
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                      {field.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {field.formattedAddress}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePlace(index)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recFields.filter((f: any) => f.categoryType === activeCategory)
              .length === 0 && (
              <div className="text-center py-8 px-4 border border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
                <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No has seleccionado lugares de{" "}
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label} aún.
                </p>
                <p className="text-xs text-gray-400 mt-1">Busca en el mapa →</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: MAP */}
      <div className="lg:col-span-2 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-neutral-800 relative group">
        <Map
          mapId="DEMO_MAP_ID" // Reemplazar con ID real si se quiere styling avanzado
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          className="w-full h-full"
        >
          {/* 1. Property Location Pin */}
          <AdvancedMarker position={center}>
            <div className="relative">
              <div className="w-12 h-12 bg-brand-void text-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-black z-20">
                <Star className="w-6 h-6 fill-current" />
              </div>
              {/* Pulse */}
              <div className="absolute inset-0 bg-brand-void rounded-full animate-ping opacity-20 z-10"></div>
            </div>
          </AdvancedMarker>

          {/* 2. Suggested Places (Gray Pins) */}
          {suggestedPlaces.map((place) => {
            // Skip if already selected? Or show as separate marker?
            if (!place.location) return null;
            const isSelected = selectedPlaceIds.has(place.id);

            // If selected, we might render it via the 'selected' loop or handle it here.
            // Ideally we handle everything here.
            if (isSelected) return null; // We'll render selected ones separately

            return (
              <AdvancedMarker
                key={place.id}
                position={place.location}
                onClick={() => setSelectedPlaceInfo(place)}
              >
                <Pin
                  background={"#94a3b8"}
                  borderColor={"#64748b"}
                  glyphColor={"#f8fafc"}
                  scale={0.8}
                />
              </AdvancedMarker>
            );
          })}

          {/* 3. Selected Places (Brand Pins) */}
          {/* We iterate fields instead of map items to ensure sync */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {recFields.map((field: any) => {
            if (!field.latitude || !field.longitude) return null;
            const catConfig =
              CATEGORIES.find((c) => c.id === field.categoryType) ||
              CATEGORIES[0];

            return (
              <AdvancedMarker
                key={field.id} // use field.id (uuid from hook form)
                position={{
                  lat: parseFloat(field.latitude),
                  lng: parseFloat(field.longitude),
                }}
                // Maybe onClick to edit?
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110",
                    catConfig.color,
                  )}
                >
                  <catConfig.icon className="w-4 h-4" />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Info Window for Suggestions */}
          {selectedPlaceInfo && selectedPlaceInfo.location && (
            <InfoWindow
              position={selectedPlaceInfo.location}
              onCloseClick={() => setSelectedPlaceInfo(null)}
              headerContent={
                <div className="font-bold text-sm px-1 pt-1">
                  {selectedPlaceInfo.displayName}
                </div>
              }
            >
              <div className="min-w-[200px] p-2">
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {selectedPlaceInfo.formattedAddress}
                </p>
                <button
                  onClick={() => handleAddPlace(selectedPlaceInfo)}
                  className="w-full py-1.5 bg-brand-void text-white text-xs font-bold rounded shadow hover:bg-opacity-90 transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Agregar a Guía
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Loading Indicator */}
        {isSearching && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-medium text-gray-600 flex items-center gap-2 z-10">
            <div className="w-3 h-3 border-2 border-brand-copper border-t-transparent rounded-full animate-spin"></div>
            Buscando lugares...
          </div>
        )}
      </div>
    </div>
  );
}
