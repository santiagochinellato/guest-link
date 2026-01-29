"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { CheckCircle, X, PlusCircle } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";

export function RulesSection() {
  const { control, register } = useFormContext<PropertyFormData>();

  // We use useFieldArray to manage data, but exposing a simpler UI
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

  // Predefined Rules
  const COMMON_RULES = [
    { label: "Mascotas permitidas", type: "allowed", icon: CheckCircle },
    { label: "Fumar permitido", type: "allowed", icon: CheckCircle },
    { label: "Fiestas permitidas", type: "allowed", icon: CheckCircle }, // Rare but possible
    { label: "No fumar", type: "prohibited", icon: X },
    { label: "No fiestas", type: "prohibited", icon: X },
    { label: "No mascotas", type: "prohibited", icon: X },
    { label: "Silencio después de 22hs", type: "prohibited", icon: X },
  ];

  const handleToggleRule = (label: string, type: "allowed" | "prohibited") => {
    if (type === "allowed") {
      const index = allowedFields.findIndex((f) => f.value === label);
      if (index >= 0) {
        removeAllowed(index);
      } else {
        appendAllowed({ value: label });
      }
    } else {
      const index = prohibitedFields.findIndex((f) => f.value === label);
      if (index >= 0) {
        removeProhibited(index);
      } else {
        appendProhibited({ value: label });
      }
    }
  };

  const isRuleActive = (label: string, type: "allowed" | "prohibited") => {
    if (type === "allowed") return allowedFields.some((f) => f.value === label);
    return prohibitedFields.some((f) => f.value === label);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Reglas de la Casa</h3>
        <p className="text-sm text-gray-500 text-brand-void dark:text-gray-400">
          Establece expectativas claras para tus huéspedes.
        </p>
      </div>

      {/* Common Rules Badges */}
      <div>
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-4 block">
          Reglas Comunes
        </label>
        <div className="flex flex-wrap gap-3">
          {COMMON_RULES.map((rule) => {
            const active = isRuleActive(
              rule.label,
              rule.type as "allowed" | "prohibited",
            );
            const Icon = rule.icon;
            return (
              <button
                key={rule.label}
                type="button"
                onClick={() =>
                  handleToggleRule(
                    rule.label,
                    rule.type as "allowed" | "prohibited",
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                  active
                    ? rule.type === "allowed"
                      ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                      : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-400 dark:hover:border-neutral-600"
                }`}
              >
                {active ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <PlusCircle className="w-4 h-4 opacity-50" />
                )}
                {rule.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Description */}
      <div>
        <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">
          Reglas Adicionales & Detalles
        </label>
        <textarea
          {...register("houseRules")}
          placeholder="Escribe aquí cualquier otra regla específica de la casa, instrucciones de convivencia, etc."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-white/5 outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper/20 h-40 resize-none transition-all"
        />
      </div>
    </div>
  );
}
