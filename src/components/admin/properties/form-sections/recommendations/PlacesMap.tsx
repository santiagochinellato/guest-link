"use client";

import {
  Map,
  InfoWindow,
  useMapsLibrary,
  MapControl,
  ControlPosition,
  useMap,
  Marker,
} from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Clean minimal style — same visual language as the Carto Positron used in MapCN
const MINIMAL_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

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
  const map = useMap();
  const placesLibrary = useMapsLibrary("places");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapClick = (ev: any) => {
    if (ev.detail?.placeId && placesLibrary && map) {
      ev.stop?.();
      const placeId = ev.detail.placeId;
      const service = new placesLibrary.PlacesService(map);
      service.getDetails(
        {
          placeId,
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
            onSelectPlace({
              displayName: place.name || "",
              formattedAddress: place.formatted_address || "",
              location: place.geometry?.location,
              id: place.place_id || placeId,
              place_id: place.place_id || placeId,
              rating: place.rating,
              userRatingCount: place.user_ratings_total,
              googleMapsURI: place.url,
            });
          }
        },
      );
    }
  };

  // Circle symbols — constructed at render time (google is loaded by APIProvider)
  const propertyIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#0f172a",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 3,
    scale: 10,
  };

  const suggestedIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#94a3b8",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 7,
  };

  const addedCurrentIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#D97706",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2.5,
    scale: 9,
  };

  const addedOtherIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#9ca3af",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 7,
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <Map
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        className="w-full h-full"
        onClick={handleMapClick}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styles={MINIMAL_MAP_STYLE as any}
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
        <Marker position={center} icon={propertyIcon} title="Tu propiedad" />

        {/* Suggested Pins (Gray — not yet added) */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {suggestedPlaces.map((place: any) => {
          if (!place.location && !place.geometry?.location) return null;
          const location = place.location || place.geometry?.location;
          const placeId = place.place_id || place.id;
          if (selectedPlaceIds.has(placeId)) return null;

          return (
            <Marker
              key={placeId}
              position={location}
              icon={suggestedIcon}
              title={place.displayName || place.name}
              onClick={() => onSelectPlace(place)}
            />
          );
        })}

        {/* Added/Selected Pins */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {recFields.map((field: any) => {
          if (!field.latitude || !field.longitude) return null;
          const isCurrentCat = field.categoryType === activeCategory?.type;
          return (
            <Marker
              key={field.googlePlaceId || field.id}
              position={{
                lat: parseFloat(field.latitude),
                lng: parseFloat(field.longitude),
              }}
              icon={isCurrentCat ? addedCurrentIcon : addedOtherIcon}
              zIndex={isCurrentCat ? 20 : 10}
            />
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
              <div className={cn("p-2 min-w-[200px]")}>
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
