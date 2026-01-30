"use client";

import * as React from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Search, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface GoogleAddressAutocompleteProps {
  onSelect: (data: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fullResult: any;
  }) => void;
  defaultValue?: string;
  className?: string;
}

export function GoogleAddressAutocomplete({
  onSelect,
  defaultValue = "",
  className,
}: GoogleAddressAutocompleteProps) {
  // Check if places library is loaded
  const placesLib = useMapsLibrary("places");
  const isScriptLoaded = !!placesLib;

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Define search scope here if needed (e.g., types: ['address'])
    },
    debounce: 300,
    defaultValue,
    initOnMount: isScriptLoaded,
  });

  // Re-initialize when script loads if needed (use-places-autocomplete might handle this if initOnMount becomes true,
  // but initOnMount is read on mount. We might need to force re-render or let it auto-detect google global)
  // Actually use-places-autocomplete checks window.google on mount. If async, we need to defer.
  // Passing `initOnMount: isScriptLoaded` works if the component re-renders when isScriptLoaded changes.

  // Sync defaultValue if it changes externally
  React.useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue, false);
    }
  }, [defaultValue, setValue]);

  const handleSelect = async (placeId: string, description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ placeId });
      const result = results[0];
      const { lat, lng } = await getLatLng(result);

      // Extract address components
      let route = "";
      let streetNumber = "";
      let city = "";
      let country = "";

      result.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes("route")) route = component.long_name;
        if (types.includes("street_number")) streetNumber = component.long_name;
        if (types.includes("locality")) city = component.long_name;
        if (types.includes("administrative_area_level_2") && !city)
          city = component.long_name; // Fallback for city
        if (types.includes("country")) country = component.long_name;
      });

      // Construct readable address
      const mainAddress =
        `${route} ${streetNumber}`.trim() ||
        result.formatted_address.split(",")[0];

      onSelect({
        address: mainAddress,
        city,
        country,
        latitude: lat,
        longitude: lng,
        fullResult: result,
      });
    } catch (error) {
      console.error("Error selecting address:", error);
    }
  };

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          disabled={!ready && !isScriptLoaded}
          placeholder={
            isScriptLoaded
              ? "Busca una calle, lugar o ciudad..."
              : "Cargando mapas..."
          }
          className={cn(
            "w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-white/5 outline-none focus:border-brand-copper transition-all",
            !ready && "opacity-70 cursor-not-allowed",
          )}
          onFocus={() => setIsOpen(true)}
          // Close on blur with delay to allow click
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {value && (
          <button
            onClick={() => {
              setValue("");
              clearSuggestions();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            {status === "OK" ? <X className="w-3 h-3 text-gray-400" /> : null}
          </button>
        )}
      </div>

      {/* Suggestions List */}
      {status === "OK" && isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {data.map((prediction) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = prediction;

            return (
              <li
                key={place_id}
                onClick={() =>
                  handleSelect(place_id, main_text + ", " + secondary_text)
                }
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex items-start gap-3 transition-colors border-b border-gray-50 dark:border-neutral-800 last:border-0"
              >
                <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full flex-shrink-0 text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {main_text}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {secondary_text}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Loading State for Predictions */}
      {status === "ZERO_RESULTS" && isOpen && value && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl shadow-lg text-center text-sm text-gray-500">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
}
