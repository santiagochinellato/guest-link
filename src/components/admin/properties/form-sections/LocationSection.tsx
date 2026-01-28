"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { AddressAutocomplete, AddressResult } from "../../address-autocomplete";

export function LocationSection() {
  const { register, setValue, watch } = useFormContext<PropertyFormData>();

  const handleAddressSelect = (result: AddressResult) => {
    setValue("address", result.display_name);
    setValue("latitude", result.lat);
    setValue("longitude", result.lon);

    if (result.address.city || result.address.town || result.address.village) {
      setValue(
        "city",
        result.address.city ||
          result.address.town ||
          result.address.village ||
          "",
      );
    }
    if (result.address.country) {
      setValue("country", result.address.country);
    }
  };

  const watchAddress = watch("address");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Ubicación</h3>
        <p className="text-sm text-gray-500">
          Dirección y posicionamiento en mapa (OpenStreetMap).
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Buscar Dirección
          </label>
          <AddressAutocomplete
            onSelect={handleAddressSelect}
            defaultValue={watchAddress}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dirección Completa
          </label>
          <input
            {...register("address")}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 transition-all dark:bg-white/5"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ciudad
            </label>
            <input
              {...register("city")}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              País
            </label>
            <input
              {...register("country")}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 dark:bg-white/5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-neutral-800/20 p-4 rounded-xl">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Latitud
            </label>
            <input
              {...register("latitude")}
              className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-700 py-1 outline-none text-sm font-mono dark:bg-white/5"
              readOnly
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Longitud
            </label>
            <input
              {...register("longitude")}
              className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-700 py-1 outline-none text-sm font-mono dark:bg-white/5"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
