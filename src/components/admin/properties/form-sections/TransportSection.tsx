"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { TransitAutoButton } from "@/components/admin/transit-auto-button";

interface TransportTabProps {
  initialCity?: string;
  propertyId?: number;
}

export function TransportSection({
  initialCity,
  propertyId,
}: TransportTabProps) {
  const { control, register } = useFormContext<PropertyFormData>();
  const {
    fields: transportFields,
    append: appendTransport,
    remove: removeTransport,
  } = useFieldArray({
    control,
    name: "transport",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h3 className="text-xl font-semibold">Transporte</h3>
          <p className="text-sm text-brand-void dark:text-white">
            Cómo moverse en la ciudad, puedes brindar detalles de Uber, Taxi,
            Bus, etc.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {propertyId && (
            <TransitAutoButton
              propertyId={propertyId}
              city={initialCity || ""}
              onComplete={(suggestions) => {
                if (suggestions && suggestions.length > 0) {
                  // 1. Remove existing "Auto-detected" bus items to prevent sloppy duplicates
                  // (Optional: simple logic is remove all 'bus' types if user clicks the magic button)
                  // Because indices change when removing, we filter the list and reset.
                  // But simpler with field array is just:

                  // We just append. The user can delete.
                  // OR we can clear. Let's start with append. User satisfaction is higher if we don't delete their stuff.

                  // Actually, user complained about "previous result".
                  // Let's iterate and append.
                  suggestions.forEach((item: any) => {
                    appendTransport(item);
                  });
                }
              }}
            />
          )}
          <button
            type="button"
            onClick={() =>
              appendTransport({
                name: "",
                type: "taxi",
                description: "",
              })
            }
            className="text-sm font-semibold text-brand-void dark:text-brand-copper flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Agregar Opción
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {transportFields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border rounded-xl bg-gray-50 dark:bg-neutral-800/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <input
                {...register(`transport.${index}.name` as const)}
                placeholder="Proveedor (ej. Uber)"
                className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-neutral-700"
              />
              <select
                {...register(`transport.${index}.type` as const)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-neutral-700"
              >
                <option value="taxi">Taxi / Uber</option>
                <option value="bus">Autobús</option>
                <option value="train">Tren</option>
                <option value="rental">Alquiler</option>
              </select>
            </div>
            <textarea
              {...register(`transport.${index}.description` as const)}
              placeholder="Detalles..."
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-neutral-700 resize-none h-20"
            />
            <input
              type="hidden"
              {...register(`transport.${index}.website` as const)}
            />
            <button
              type="button"
              onClick={() => removeTransport(index)}
              className="text-red-500 text-xs mt-2 underline"
            >
              Eliminar
            </button>
          </div>
        ))}
        {transportFields.length === 0 && (
          <p className="text-gray-400 italic text-sm">
            No hay opciones de transporte agregadas.
          </p>
        )}
      </div>
    </div>
  );
}
