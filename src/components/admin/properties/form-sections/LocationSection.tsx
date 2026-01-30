"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { GoogleAddressAutocomplete } from "../../google-address-autocomplete";
import { MapCN } from "@/components/ui/map-cn";
import { MapPin } from "lucide-react";
import { useRef, useEffect } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { APIProvider } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function LocationSection() {
  const { register, setValue, watch } = useFormContext<PropertyFormData>();
  const mapRef = useRef<MapRef>(null);

  const lat = watch("latitude");
  const lng = watch("longitude");
  const address = watch("address");

  // Keep map markers in sync
  const markers =
    lat && lng
      ? [
          {
            id: "main-location",
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            title: address,
            icon: (
              <div className="w-10 h-10 bg-brand-void text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-neutral-800 animate-in zoom-in duration-300">
                <MapPin className="w-5 h-5" />
              </div>
            ),
          },
        ]
      : [];

  const handleAddressSelect = (result: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fullResult: any;
  }) => {
    // 1. Set simplified address "Human Readable"
    setValue("address", result.address);

    // 2. Set coordinates
    setValue("latitude", result.latitude.toString());
    setValue("longitude", result.longitude.toString());

    // 3. Set Context Fields
    if (result.city) setValue("city", result.city);
    if (result.country) setValue("country", result.country);

    // 4. Fly to location with a smooth transition
    if (mapRef.current) {
      mapRef.current.getMap().flyTo({
        center: [result.longitude, result.latitude],
        zoom: 16,
        essential: true, // Animation will happen even if user has prefers-reduced-motion
        duration: 2000,
      });
    }
  };

  // Sync map center if initial data loads later or changes externally
  useEffect(() => {
    if (lat && lng && mapRef.current) {
      // Only jump if far away? For now just simple flyTo or jumpTo
      // mapRef.current.getMap().setCenter([parseFloat(lng), parseFloat(lat)]);
      // Better to check if map is already close to avoid jumps on small edits
    }
  }, [lat, lng]);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-copper" />
              Ubicación Exacta
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Define dónde se encuentra tu propiedad para que los huéspedes
              lleguen sin problemas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: Inputs */}
          <div className="space-y-6 bg-gray-50 dark:bg-neutral-800/20 md:p-6 p-2 rounded-2xl border border-gray-100 dark:border-neutral-800/50">
            {/* Main Google Search */}
            <div className="relative z-20">
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">
                Buscar en Google Maps
              </label>
              <GoogleAddressAutocomplete
                onSelect={handleAddressSelect}
                defaultValue={watch("address")}
                className="shadow-sm"
              />
              <p className="text-xs text-brand-void/60 dark:text-gray-400 mt-2">
                Escribe la dirección y selecciona una opción de la lista para
                autocompletar.
              </p>
            </div>

            <div className="h-px w-full bg-gray-200 dark:bg-neutral-800 my-4" />

            {/* Manual / Readable Fields */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección Visual (Cómo se muestra)
              </label>
              <input
                {...register("address")}
                placeholder="Ej: Av. Libertador 1234"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ciudad
                </label>
                <input
                  {...register("city")}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-brand-copper transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  País
                </label>
                <input
                  {...register("country")}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-brand-copper transition-all"
                />
              </div>
            </div>

            {/* Lat/Lng hidden or readonly if needed for debug */}
            <div className="grid grid-cols-2 gap-4 opacity-50">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400">
                  Latitud
                </label>
                <input
                  {...register("latitude")}
                  readOnly
                  className="w-full bg-transparent text-xs font-mono text-gray-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400">
                  Longitud
                </label>
                <input
                  {...register("longitude")}
                  readOnly
                  className="w-full bg-transparent text-xs font-mono text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Map */}
          <div className="relative md:h-[500px] h-[300px] w-full rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none border-thin border-gray-700 dark:border-neutral-800">
            <MapCN
              mapRef={mapRef}
              markers={markers}
              initialViewState={{
                latitude: lat ? parseFloat(lat) : 40.4168,
                longitude: lng ? parseFloat(lng) : -3.7038,
                zoom: lat ? 16 : 12,
              }}
              className="z-0"
            />

            {/* Overlay instruction */}
            {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 shadow-lg border border-white/20 pointer-events-none">
              📍 Arrastra el mapa para explorar los alrededores
            </div> */}

            {/* {!lat && !address && (
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-xl flex md:flex-col flex-row items-center gap-2 md:gap-0">
                  <SearchPinIcon className="md:w-10 md:h-10 w-6 h-6 text-brand-copper md:mb-2" />
                  <p className="text-sm font-semibold">
                    Busca una dirección para comenzar
                  </p>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </APIProvider>
  );
}

function SearchPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
