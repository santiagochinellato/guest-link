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
  Edit,
  Users,
  Map as MapIcon,
  List as ListIcon,
  Sparkles,
  Loader2,
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
import { Textarea } from "@/components/ui/textarea";

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
  const { control, watch, register } = useFormContext<PropertyFormData>();
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
  const [suggestedPlaces, setSuggestedPlaces] = useState<
    google.maps.places.Place[]
  >([]);
  const [selectedPlaceInfo, setSelectedPlaceInfo] =
    useState<google.maps.places.Place | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- UX State: View Mode & Editing ---
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

        // Auto-switch to map view on mobile if search yields results
        setViewMode("map");
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
  const handleDiscoverNearby = () => {
    if (!map || !placesLibrary || !activeCategory) return;

    setIsSearching(true);
    const service = new placesLibrary.PlacesService(map);

    // Tomamos la primera keyword (ej: "restaurant") para la búsqueda
    const mainKeyword = activeCategory.searchKeywords.split(",")[0].trim();

    const request = {
      location: center,
      radius: 1000, // 1km a la redonda
      keyword: mainKeyword,
      // Opcional: type: activeCategory.type si coincide con los tipos de Google
    };

    service.nearbySearch(request, (results, status) => {
      setIsSearching(false);
      if (
        status === placesLibrary.PlacesServiceStatus.OK &&
        results &&
        results.length > 0
      ) {
        // Filtrar los que ya tenemos guardados
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingIds = new Set(recFields.map((r: any) => r.googlePlaceId));
        const newSuggestions = results.filter(
          (p) => p.place_id && !existingIds.has(p.place_id),
        );

        setSuggestedPlaces(newSuggestions);

        if (newSuggestions.length > 0) {
          toast.success(
            `Se encontraron ${newSuggestions.length} lugares cercanos.`,
          );
          // Ajustar mapa para verlos todos
          const bounds = new google.maps.LatLngBounds();
          newSuggestions.forEach((p) => {
            if (p.geometry?.location) bounds.extend(p.geometry.location);
          });
          map.fitBounds(bounds);

          // Switch to map view to see results
          setViewMode("map");
        } else {
          toast.info("No se encontraron lugares nuevos en esta zona.");
        }
      } else {
        toast.info("No se encontraron resultados cercanos.");
        setIsSearching(false);
      }
    });
  };

  useEffect(() => {
    // Optional: Auto-trigger on category change if desired, but user requested a button.
    // Keeping this hook empty or removing it as per requirement for manual button.
  }, [activeCategory, map, placesLibrary]);

  const handleAddPlace = (place: google.maps.places.Place) => {
    if (!place.location || !place.displayName || !activeCategory) return;

    appendRec({
      title: place.displayName,
      formattedAddress: place.formattedAddress || "",
      googleMapsLink: place.googleMapsURI || "",
      categoryType: activeCategory.type,
      description: "",
      googlePlaceId: place.id,
      latitude: place.location.lat().toString(),
      longitude: place.location.lng().toString(),
      rating: place.rating || undefined,
      userRatingsTotal: place.userRatingCount || undefined,
    });

    toast.success("Agregado a " + activeCategory.name);

    // Remove from suggestions
    setSuggestedPlaces((prev) =>
      prev.filter((p) => p.place_id !== place.place_id),
    );

    setSelectedPlaceInfo(null);

    // Auto-open Curator Modal for the newly added item
    // The new item will be at the end of the array
    setEditingIndex(recFields.length); // length is currently X, index of next is X
  };

  const editingItem = editingIndex !== null ? recFields[editingIndex] : null;

  // POI Click Handler (Native Google Maps POIs)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapClick = (ev: any) => {
    // Check if it was a POI click
    if (ev.detail.placeId && placesLibrary) {
      // Stop the default InfoWindow from showing
      ev.stop();

      const placeId = ev.detail.placeId;

      const service = new placesLibrary.PlacesService(map!);
      service.getDetails(
        {
          placeId: placeId,
          fields: [
            "name",
            "formatted_address",
            "geometry",
            "place_id",
            "rating",
            "user_ratings_total",
            "url",
          ],
        },
        (place, status) => {
          if (status === placesLibrary.PlacesServiceStatus.OK && place) {
            // Convert to a compatible format for our modal
            // We need to shape it like the google.maps.places.Place class instance relative to what our handleAddPlace expects
            // But handleAddPlace expects the new Place class instance structure somewhat.
            // Let's create a compatible object.

            // Constructing a "Place-like" object that matches what we use elsewhere
            const placeLikeObject = {
              displayName: place.name || "",
              formattedAddress: place.formatted_address || "",
              location: place.geometry?.location,
              id: place.place_id || placeId,
              place_id: place.place_id || placeId,
              rating: place.rating,
              userRatingCount: place.user_ratings_total,
              googleMapsURI: place.url,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSelectedPlaceInfo(placeLikeObject as any);
          }
        },
      );
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden animate-in fade-in relative">
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
        {categoryFields.map((cat, idx) => {
          const Icon = ICONS_MAP[cat.icon || "Star"] || Star;
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: LIST */}
        <div
          className={cn(
            "w-full lg:w-1/3 min-w-[300px] border-r border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-900/10 flex flex-col transition-transform duration-300",
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
                    recFields.filter(
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
                      onClick={() => setEditingIndex(index)}
                      className="flex items-center gap-1 p-1 text-green-700 hover:text-green-600 transition-opacity bg-white dark:bg-neutral-900 rounded-md shadow-sm w-fit self-end"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <p className="text-xs">Editar</p>
                    </button>
                    <button
                      onClick={() => removeRec(index)}
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
                    onClick={() => setViewMode("map")}
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

        {/* RIGHT: MAP AREA */}
        <div
          className={cn(
            "flex-1 relative bg-gray-100",
            viewMode === "list" ? "hidden lg:block w-full" : "block w-full",
          )}
        >
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={center}
            defaultZoom={14}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            className="w-full h-full"
            onClick={handleMapClick}
          >
            {/* OMNIBOX CONTROL */}
            <MapControl position={ControlPosition.TOP_CENTER}>
              <div className="m-4">
                <Omnibox onSearch={handleSearch} isSearching={isSearching} />
              </div>
            </MapControl>

            {/* SMART DISCOVERY BUTTON */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              <Button
                onClick={handleDiscoverNearby}
                disabled={isSearching}
                className="bg-white text-black hover:bg-gray-100 shadow-xl border border-gray-200 rounded-full px-6 transition-all hover:scale-105"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
                )}
                Buscar {activeCategory?.name} cercanos
              </Button>
            </div>

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
              if (!place.location && !place.geometry?.location) return null;
              const location = place.location || place.geometry?.location;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const placeId = (place as any).place_id || place.id;

              const isSelected = selectedPlaceIds.has(placeId);
              if (isSelected) return null;

              return (
                <AdvancedMarker
                  key={placeId}
                  position={location}
                  onClick={() => setSelectedPlaceInfo(place)}
                >
                  <Pin
                    background={"#94a3b8"}
                    borderColor={"#475569"}
                    glyphColor={"#f1f5f9"}
                    scale={0.8}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Selected Pins (Colored) */}
            {recFields.map((field) => {
              if (!field.latitude || !field.longitude) return null;

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

          {/* SMART DISCOVERY BUTTON */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
            <Button
              onClick={handleDiscoverNearby}
              disabled={isSearching}
              className="pointer-events-auto bg-white text-black hover:bg-gray-100 shadow-xl border border-gray-200 rounded-full px-6 transition-all hover:scale-105"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
              )}
              Buscar {activeCategory?.name} cercanos
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (TOGGLE VIEW) */}
      <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
          className="flex items-center gap-2 bg-brand-void text-white px-6 py-3 rounded-full shadow-xl font-semibold text-sm hover:scale-105 transition-transform"
        >
          {viewMode === "map" ? (
            <>
              <ListIcon className="w-4 h-4" />
              Ver Lista (
              {
                recFields.filter((r) => r.categoryType === activeCategory?.type)
                  .length
              }
              )
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4" />
              Ver Mapa
            </>
          )}
        </button>
      </div>

      {/* CURATOR MODAL */}
      <Dialog
        open={editingIndex !== null}
        onOpenChange={(open) => !open && setEditingIndex(null)}
      >
        {editingItem && (
          <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
            {/* Header Visual */}
            <div className="h-32 bg-gray-100 relative flex items-center justify-center">
              <MapPin className="w-10 h-10 text-gray-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight">
                  {editingItem.title}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Ratings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-lg">
                    {editingItem.rating || "--"}{" "}
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                    Google
                  </p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-lg">
                    New <Users className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] uppercase text-blue-400 font-bold tracking-wider">
                    Guest Score
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                  Tu reseña personal
                </Label>
                <Textarea
                  {...register(
                    `recommendations.${editingIndex as number}.description`,
                  )}
                  placeholder="Cuéntale a tus huéspedes por qué este lugar es especial..."
                  className="bg-gray-50 border-gray-200 focus:bg-white resize-none"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="p-4 bg-gray-50 border-t flex flex-row gap-2 justify-between items-center w-full sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  if (editingIndex !== null) {
                    removeRec(editingIndex);
                    setEditingIndex(null);
                  }
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <Button
                onClick={() => setEditingIndex(null)}
                className="bg-brand-void text-white hover:bg-brand-void/90"
              >
                Guardar y Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

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
