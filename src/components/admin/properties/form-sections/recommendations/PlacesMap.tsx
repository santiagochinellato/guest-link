"use client";

import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMapsLibrary,
  Pin,
  MapControl,
  ControlPosition,
  useMap,
} from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Plus, Star, Navigation, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlacesMapProps {
  center: google.maps.LatLngLiteral;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recFields: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suggestedPlaces: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeCategory: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedPlaceIds: Set<string>;
  isSearching: boolean;
  onSearch: (query: string) => void;
  onDiscoverNearby: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddPlace: (place: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectPlace: (place: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedPlaceInfo: any;
  onCloseInfoWindow: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OmniboxComponent: React.ComponentType<any>;
}

export function PlacesMap({
  center,
  recFields,
  suggestedPlaces,
  activeCategory,
  selectedPlaceIds,
  isSearching,
  onSearch,
  onDiscoverNearby,
  onAddPlace,
  onSelectPlace,
  selectedPlaceInfo,
  onCloseInfoWindow,
  OmniboxComponent,
}: PlacesMapProps) {
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

            onSelectPlace(placeLikeObject);
          }
        },
      );
    }
  };

  const map = useMap();
  const placesLibrary = useMapsLibrary("places");

  return (
    <div className="inset-0 w-full h-full">
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
            <OmniboxComponent onSearch={onSearch} isSearching={isSearching} />
          </div>
        </MapControl>

        {/* SMART DISCOVERY BUTTON */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
          <Button
            onClick={onDiscoverNearby}
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

        {/* Property Pin */}
        <AdvancedMarker position={center}>
          <div className="relative">
            <div className="w-10 h-10 bg-brand-void border-2 border-white dark:border-neutral-900 rounded-full flex items-center justify-center shadow-xl z-20">
              <Star className="w-5 h-5 text-brand-copper fill-current" />
            </div>
          </div>
        </AdvancedMarker>

        {/* Suggested Pins (Gray) */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {suggestedPlaces.map((place: any) => {
          if (!place.location && !place.geometry?.location) return null;
          const location = place.location || place.geometry?.location;
          const placeId = place.place_id || place.id;

          const isSelected = selectedPlaceIds.has(placeId);
          if (isSelected) return null;

          return (
            <AdvancedMarker
              key={placeId}
              position={location}
              onClick={() => onSelectPlace(place)}
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {recFields.map((field: any) => {
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
        {selectedPlaceInfo &&
          (selectedPlaceInfo.location ||
            selectedPlaceInfo.geometry?.location) && (
            <InfoWindow
              position={
                selectedPlaceInfo.location ||
                selectedPlaceInfo.geometry?.location
              }
              onCloseClick={onCloseInfoWindow}
              headerContent={
                <span className="font-bold text-sm">
                  {selectedPlaceInfo.displayName || selectedPlaceInfo.name}
                </span>
              }
            >
              <div className="p-2 min-w-[200px]">
                <p className="text-xs text-gray-500 mb-2 truncate">
                  {selectedPlaceInfo.formattedAddress ||
                    selectedPlaceInfo.formatted_address}
                </p>
                <Button
                  size="sm"
                  onClick={() => onAddPlace(selectedPlaceInfo)}
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
  );
}
