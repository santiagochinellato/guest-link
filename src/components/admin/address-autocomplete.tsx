"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

// Inline simple debounce hook for now to be self-contained or I check if exists.
// Actually, I'll implement a custom logic inside the component to avoid dependencies not checked.

export interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  onSelect: (result: AddressResult) => void;
  defaultValue?: string;
}

export function AddressAutocomplete({
  onSelect,
  defaultValue = "",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              "User-Agent": "GuestLinkApp",
            },
          },
        );
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Nominatim Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1s debounce for Nominatim

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: AddressResult) => {
    setQuery(item.display_name);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Verify if user cleared input
            if (e.target.value === "") setIsOpen(false);
          }}
          placeholder="Search address (OpenStreetMap)..."
          className="w-full pl-11 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 transition-all dark:bg-white/5"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {results.map((item, i) => (
            <button
              key={i + item.lat}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-start gap-3 transition-colors border-b border-gray-50 dark:border-neutral-800 last:border-0 dark:bg-white/5"
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
                  {item.display_name.split(",")[0]}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {item.display_name}
                </p>
              </div>
            </button>
          ))}
          <div className="px-2 py-1 bg-gray-50 dark:bg-neutral-800 text-[10px] text-gray-400 text-center">
            Data © OpenStreetMap contributors
          </div>
        </div>
      )}
    </div>
  );
}
