"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";

export function EmergencySection() {
  const { control, register } = useFormContext<PropertyFormData>();
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h3 className="text-xl font-semibold">Contactos de Emergencia</h3>
          <p className="text-sm text-brand-void dark:text-white">
            Números esenciales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => appendContact({ name: "", phone: "", type: "other" })}
          className="text-sm font-semibold text-brand-void dark:text-brand-copper flex items-center gap-1"
        >
          <Plus className="w-4 h-4 text-brand-void dark:text-brand-copper" />{" "}
          Add Contact
        </button>
      </div>
      <div className="space-y-3">
        {contactFields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-white dark:bg-white/5 border rounded-xl"
          >
            <input
              {...register(`emergencyContacts.${index}.name` as const)}
              placeholder="Service Name"
              className="flex-1 bg-transparent border-b md:border-none border-gray-100 dark:border-neutral-800 pb-2 md:pb-0 outline-none font-semibold"
            />
            <div className="flex items-center gap-2">
              <input
                {...register(`emergencyContacts.${index}.phone` as const)}
                placeholder="Phone Number"
                className="flex-1 md:w-32 text-left md:text-right bg-transparent border-none outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => removeContact(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {contactFields.length === 0 && (
          <p className="text-gray-400 italic text-sm">No contacts added.</p>
        )}
      </div>
    </div>
  );
}
