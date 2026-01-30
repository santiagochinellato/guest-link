"use client";

import * as React from "react";
import Map, {
  NavigationControl,
  Marker,
  ViewState,
  MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Use Carto Positron for a clean, premium look without API key
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

interface MapCNProps {
  initialViewState?: Partial<ViewState>;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
  onMapClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
  viewState?: ViewState;
  onMove?: (evt: { viewState: ViewState }) => void;
  mapRef?: React.Ref<MapRef>;
}

export function MapCN({
  initialViewState,
  markers = [],
  onMapClick,
  interactive = true,
  className,
  children,
  viewState,
  onMove,
  mapRef,
}: MapCNProps) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden rounded-xl shadow-sm",
        className,
      )}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -3.7038, // Default Madrid
          latitude: 40.4168,
          zoom: 13,
          ...initialViewState,
        }}
        {...(viewState
          ? { viewState: { ...viewState, width: 0, height: 0 }, onMove }
          : {})}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onClick={(e) => onMapClick?.({ lngLat: e.lngLat })}
        onLoad={() => setLoaded(true)}
        dragPan={interactive}
        scrollZoom={interactive}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        cursor={interactive ? "grab" : "default"}
        attributionControl={false}
      >
        {interactive && (
          <NavigationControl position="bottom-right" showCompass={false} />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
          >
            <div className="group relative">
              <div className="flex items-center justify-center -mb-1 transition-transform group-hover:scale-110">
                {marker.icon || (
                  <div className="w-8 h-8 bg-brand-void text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
              {/* Simple Tooltip on Hover */}
              {marker.title && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {marker.title}
                </div>
              )}
            </div>
          </Marker>
        ))}
        {children}
      </Map>
    </div>
  );
}
