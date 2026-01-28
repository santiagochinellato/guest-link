"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { CheckCircle, X, PlusCircle, Trash2 } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";

export function RulesSection() {
  const { control, register } = useFormContext<PropertyFormData>();

  const {
    fields: allowedFields,
    append: appendAllowed,
    remove: removeAllowed,
  } = useFieldArray({
    control,
    name: "rulesAllowed",
  });

  const {
    fields: prohibitedFields,
    append: appendProhibited,
    remove: removeProhibited,
  } = useFieldArray({
    control,
    name: "rulesProhibited",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Reglas de la Casa</h3>
        <p className="text-sm text-gray-500">
          Establece expectativas, permisos y prohibiciones.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Descripción General
        </label>
        <textarea
          {...register("houseRules")}
          placeholder="Ej. Bienvenidos a nuestra casa. Por favor siéntanse cómodos..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper h-32 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Allowed List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Se Permite
              (Info)
            </label>
            <button
              type="button"
              onClick={() => appendAllowed({ value: "" })}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-brand-copper"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {allowedFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`rulesAllowed.${index}.value` as const)}
                  placeholder="Ej. Mascotas bienvenidas"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeAllowed(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {allowedFields.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                No hay items permitidos.
              </p>
            )}
          </div>
        </div>

        {/* Prohibited List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <X className="w-4 h-4 text-red-500" /> Prohibido
            </label>
            <button
              type="button"
              onClick={() => appendProhibited({ value: "" })}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-brand-copper"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {prohibitedFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`rulesProhibited.${index}.value` as const)}
                  placeholder="Ej. No fumar"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeProhibited(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {prohibitedFields.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                No hay prohibiciones.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
