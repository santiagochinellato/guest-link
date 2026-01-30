"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Plus,
  Trash2,
  Shield,
  Ambulance,
  Flame,
  Phone,
  User,
  PlusCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Presets por país
const COUNTRY_PRESETS: Record<
  string,
  { name: string; phone: string; type: string }[]
> = {
  Argentina: [
    { name: "Policía", phone: "911", type: "police" },
    { name: "Ambulancia (SAME)", phone: "107", type: "medical" },
    { name: "Bombas", phone: "100", type: "fire" },
  ],
  España: [
    { name: "Emergencias", phone: "112", type: "emergency" },
    { name: "Policía Nacional", phone: "091", type: "police" },
    { name: "Urgencias Médicas", phone: "061", type: "medical" },
  ],
  "United States": [{ name: "Emergencies", phone: "911", type: "emergency" }],
  Mexico: [{ name: "Emergencias", phone: "911", type: "emergency" }],
};

const getIconForContact = (name: string, type?: string) => {
  const lowercaseName = name.toLowerCase();
  if (
    type === "police" ||
    lowercaseName.includes("polic") ||
    lowercaseName.includes("seguridad")
  )
    return <Shield className="w-5 h-5" />;
  if (
    type === "medical" ||
    lowercaseName.includes("ambul") ||
    lowercaseName.includes("hosp") ||
    lowercaseName.includes("medic")
  )
    return <Ambulance className="w-5 h-5" />;
  if (
    type === "fire" ||
    lowercaseName.includes("bomb") ||
    lowercaseName.includes("fuego")
  )
    return <Flame className="w-5 h-5" />;
  if (
    lowercaseName.includes("host") ||
    lowercaseName.includes("anfitrión") ||
    lowercaseName.includes("dueño")
  )
    return <User className="w-5 h-5" />;
  return <Phone className="w-5 h-5" />;
};

export function EmergencySection() {
  const { control, register, watch } = useFormContext<PropertyFormData>();
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const country = watch("country");
  const hostName = watch("hostName");
  const hostPhone = watch("hostPhone");

  const rawContacts = watch("emergencyContacts") || [];
  const currentContacts = useMemo(
    () => rawContacts,
    [JSON.stringify(rawContacts)],
  );

  // Derivamos includeHost directamente del estado de los contactos
  const includeHost = useMemo(
    () =>
      currentContacts.some(
        (c) => c.name === `Anfitrión: ${hostName}` || c.name === "Host Contact",
      ),
    [currentContacts, hostName],
  );

  const handleToggleHost = (checked: boolean) => {
    if (checked) {
      if (hostName && hostPhone) {
        appendContact({
          name: `Anfitrión: ${hostName}`,
          phone: hostPhone,
          type: "host",
        });
      }
    } else {
      const index = currentContacts.findIndex(
        (c) => c.name === `Anfitrión: ${hostName}` || c.name === "Host Contact",
      );
      if (index !== -1) removeContact(index);
    }
  };

  const applyCountryPresets = () => {
    const presets = COUNTRY_PRESETS[country] || [];
    presets.forEach((preset) => {
      // Evitar duplicados por teléfono
      if (!currentContacts.some((c) => c.phone === preset.phone)) {
        appendContact(preset);
      }
    });
  };

  const hasPresets = COUNTRY_PRESETS[country];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header con Info de Contexto */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">
            Smart Emergency Hub
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Gestiona los contactos críticos para tus huéspedes. Sugerimos
            números basados en la ubicación.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasPresets && (
            <button
              type="button"
              onClick={applyCountryPresets}
              className="px-4 py-2 rounded-xl bg-brand-void text-white dark:bg-brand-copper dark:text-brand-void text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              Sugerir para {country}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              appendContact({ name: "", phone: "", type: "other" })
            }
            className="px-4 py-2 rounded-xl border-2 border-brand-void dark:border-brand-copper text-brand-void dark:text-brand-copper text-sm font-bold flex items-center gap-2 hover:bg-brand-void/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Toggles Rápidos */}
      <Card className="bg-neutral-50 dark:bg-white/5 border-none shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-copper/10 rounded-lg">
              <User className="w-5 h-5 text-brand-copper" />
            </div>
            <div>
              <Label htmlFor="host-toggle" className="font-bold">
                Incluir datos del Anfitrión
              </Label>
              <p className="text-xs text-gray-400">
                Tus datos ({hostName || "N/A"}) aparecerán como emergencia.
              </p>
            </div>
          </div>
          <Switch
            id="host-toggle"
            checked={includeHost}
            onCheckedChange={handleToggleHost}
            disabled={!hostPhone}
          />
        </CardContent>
      </Card>

      {/* Grid de Contactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactFields.map((field, index) => (
          <div
            key={field.id}
            className="group relative animate-in zoom-in-95 duration-200"
          >
            <Card className="overflow-hidden border-gray-100 dark:border-neutral-800 transition-all hover:shadow-md group-hover:border-brand-copper/50">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Icon Side */}
                  <div
                    className={cn(
                      "w-14 flex items-center justify-center border-r transition-colors",
                      index % 2 === 0
                        ? "bg-gray-50 dark:bg-neutral-900"
                        : "bg-white dark:bg-white/5",
                    )}
                  >
                    <div className="text-brand-void dark:text-brand-copper">
                      {getIconForContact(
                        watch(`emergencyContacts.${index}.name`) || "",
                        watch(`emergencyContacts.${index}.type`),
                      )}
                    </div>
                  </div>

                  {/* Input Side */}
                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <input
                        {...register(
                          `emergencyContacts.${index}.name` as const,
                        )}
                        placeholder="Nombre del servicio"
                        className="w-full bg-transparent text-sm font-bold outline-none focus:text-brand-copper transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        {...register(
                          `emergencyContacts.${index}.phone` as const,
                        )}
                        placeholder="Número de teléfono"
                        className="flex-1 bg-transparent text-lg font-mono tracking-wider outline-none text-gray-600 dark:text-gray-300"
                      />
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold tracking-tighter py-0"
                      >
                        {watch(`emergencyContacts.${index}.type`) || "General"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {contactFields.length === 0 && (
          <div className="md:col-span-2 py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-3xl space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full">
              <AlertTriangle className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-gray-500 font-medium">
                No hay contactos configurados
              </p>
              <p className="text-xs text-gray-400">
                Usa los botones de arriba para empezar.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nota de Ayuda */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          <strong>Tip Antigravity:</strong> Asegúrate de incluir el código de
          país si el número será marcado desde un teléfono extranjero. Ej: +54
          9...
        </p>
      </div>
    </div>
  );
}
