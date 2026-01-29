"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { Car, KeyRound, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function AccessSection() {
  const { register, watch, setValue } = useFormContext<PropertyFormData>();
  const hasParking = watch("hasParking");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Guía de Llegada & Acceso</h3>
        <p className="text-sm text-gray-500 text-brand-void dark:text-gray-400">
          Instrucciones para que tus huéspedes lleguen sin problemas.
        </p>
      </div>

      {/* Arrival Instructions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-brand-copper" />
          <label className="text-sm font-bold text-gray-900 dark:text-white">
            Instrucciones de Llegada y Check-in
          </label>
        </div>

        <textarea
          {...register("accessInstructions")}
          placeholder="Ej: 1. Llegar a la calle principal. 2. Buscar el portón negro. 3. El código de la caja fuerte es 1234."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-white/5 outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper/20 h-40 resize-none transition-all"
        />
        <p className="text-xs text-gray-400">
          Sé lo más detallado posible. Puedes incluir códigos de acceso,
          referencias visuales, etc.
        </p>
      </div>

      <div className="h-px bg-gray-100 dark:bg-neutral-800" />

      {/* Parking */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-copper" />
            <div>
              <label className="text-sm font-bold text-gray-900 dark:text-white block">
                Estacionamiento
              </label>
              <p className="text-xs text-gray-400">
                ¿La propiedad cuenta con estacionamiento propio?
              </p>
            </div>
          </div>
          <Switch
            checked={hasParking}
            onCheckedChange={(checked) =>
              setValue("hasParking", checked, { shouldDirty: true })
            }
          />
        </div>

        {hasParking && (
          <div className="pl-7 border-l-2 border-gray-100 dark:border-neutral-800 ml-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Detalles del Estacionamiento
            </label>
            <textarea
              {...register("parkingDetails")}
              placeholder="Ej: Cochera número 4. El control remoto está en la mesa de entrada."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-white/5 outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper/20 h-24 resize-none transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}
