"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { AddressAutocomplete, AddressResult } from "../../address-autocomplete";
import { MapCN } from "@/components/ui/map-cn";
import { MapPin } from "lucide-react";
import { useRef, useEffect } from "react";
import { MapRef } from "react-map-gl/maplibre";

export function LocationSection() {
  const { register, setValue, watch } = useFormContext<PropertyFormData>();
  const mapRef = useRef<MapRef>(null);

  const lat = watch("latitude");
  const lng = watch("longitude");
  const address = watch("address");

  const markers =
    lat && lng
      ? [
          {
            id: "main-location",
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            title: address,
            icon: (
              <div className="w-10 h-10 bg-brand-void text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-neutral-800">
                <MapPin className="w-5 h-5" />
              </div>
            ),
          },
        ]
      : [];

  const handleAddressSelect = (result: AddressResult) => {
    // Construct Human Readable Address: Road + Number
    const road = result.address.road || "";
    const number = result.address.house_number || "";
    const city =
      result.address.city ||
      result.address.town ||
      result.address.village ||
      "";

    // "Calle 123, Ciudad" logic as requested
    const mainAddress = road
      ? `${road} ${number}, ${city}`.trim().replace(/^,/, "").trim()
      : result.display_name.split(",")[0];

    // Set simplified address in visible field
    setValue("address", mainAddress);

    // Set other fields
    setValue("latitude", result.lat);
    setValue("longitude", result.lon);
    if (city) setValue("city", city);
    if (result.address.country) setValue("country", result.address.country);

    // Fly to location
    mapRef.current?.flyTo({
      center: [parseFloat(result.lon), parseFloat(result.lat)],
      zoom: 16,
      duration: 2000,
    });
  };

  // Sync map center if initial data loads later
  useEffect(() => {
    if (lat && lng && mapRef.current) {
      mapRef.current.getMap().setCenter([parseFloat(lng), parseFloat(lat)]);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Ubicación</h3>
        <p className="text-sm text-gray-500">
          Dirección y posicionamiento en mapa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Buscar Dirección
            </label>
            <AddressAutocomplete
              onSelect={handleAddressSelect}
              defaultValue={watch("address")}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dirección Visual
            </label>
            <input
              {...register("address")}
              placeholder="Ej: Av. Libertador 1234, Buenos Aires"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper transition-all dark:bg-white/5"
            />
            <p className="text-xs text-gray-400 mt-1">
              Esta es la dirección que verán los huéspedes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ciudad
              </label>
              <input
                {...register("city")}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper dark:bg-white/5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                País
              </label>
              <input
                {...register("country")}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper dark:bg-white/5"
              />
            </div>
          </div>

          {/* Hidden State/JSON storage could go here if schema supported it */}
        </div>

        {/* Map Column */}
        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-neutral-800 relative">
          <MapCN
            mapRef={mapRef}
            markers={markers}
            initialViewState={{
              // Default to lat/lng or fallback
              latitude: lat ? parseFloat(lat) : 40.4168,
              longitude: lng ? parseFloat(lng) : -3.7038,
              zoom: lat ? 15 : 12,
            }}
          />
          {!lat && (
            <div className="absolute top-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur p-3 rounded-lg text-xs text-center border shadow-sm">
              Busca una dirección para fijar el mapa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
