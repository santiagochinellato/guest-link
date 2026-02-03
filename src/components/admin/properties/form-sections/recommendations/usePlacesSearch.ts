"use client";

import { useState, useCallback } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { toast } from "sonner";

interface UsePlacesSearchProps {
  center: google.maps.LatLngLiteral;
  existingPlaceIds: Set<string>;
}

export function usePlacesSearch({
  center,
  existingPlaceIds,
}: UsePlacesSearchProps) {
  const map = useMap();
  const placesLibrary = useMapsLibrary("places");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState<
    (google.maps.places.Place | google.maps.places.PlaceResult)[]
  >([]);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!map || !placesLibrary || !query) return;

      setIsSearching(true);
      try {
        const { Place } = placesLibrary;

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
          locationBias: center,
          maxResultCount: 15,
        };

        const { places } = await Place.searchByText(request);

        if (places && places.length > 0) {
          setSuggestedPlaces(places);
          const bounds = new google.maps.LatLngBounds();
          places.forEach((p) => {
            if (p.location) bounds.extend(p.location);
          });
          map.fitBounds(bounds);
          return true; // Indicate success to switch view mode if needed
        } else {
          toast("No se encontraron resultados");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error en la búsqueda");
      } finally {
        setIsSearching(false);
      }
      return false;
    },
    [map, placesLibrary, center],
  );

  const handleDiscoverNearby = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (activeCategory: any) => {
      if (!map || !placesLibrary || !activeCategory) return;

      setIsSearching(true);
      const service = new placesLibrary.PlacesService(map);

      const mainKeyword = (activeCategory.searchKeywords || "")
        .split(",")[0]
        .trim();

      const request = {
        location: center,
        radius: 1000,
        keyword: mainKeyword,
      };

      service.nearbySearch(request, (results, status) => {
        setIsSearching(false);
        if (
          status === placesLibrary.PlacesServiceStatus.OK &&
          results &&
          results.length > 0
        ) {
          const newSuggestions = results.filter(
            (p) => p.place_id && !existingPlaceIds.has(p.place_id),
          );

          setSuggestedPlaces(newSuggestions);

          if (newSuggestions.length > 0) {
            toast.success(
              `Se encontraron ${newSuggestions.length} lugares cercanos.`,
            );
            const bounds = new google.maps.LatLngBounds();
            newSuggestions.forEach((p) => {
              if (p.geometry?.location) bounds.extend(p.geometry.location);
            });
            map.fitBounds(bounds);
            return true;
          } else {
            toast.info("No se encontraron lugares nuevos en esta zona.");
          }
        } else {
          toast.info("No se encontraron resultados cercanos.");
        }
      });
    },
    [map, placesLibrary, center, existingPlaceIds],
  );

  const clearSuggestions = useCallback(() => {
    setSuggestedPlaces([]);
  }, []);

  const removeSuggestion = useCallback((placeId: string) => {
    setSuggestedPlaces((prev) => {
        return prev.filter(p => {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const pId = (p as any).id || (p as any).place_id;
             return pId !== placeId;
        })
    });
  }, []);

  return {
    isSearching,
    suggestedPlaces,
    handleSearch,
    handleDiscoverNearby,
    clearSuggestions,
    removeSuggestion,
    setSuggestedPlaces
  };
}
