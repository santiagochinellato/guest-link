"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Bus, Car, Plus, Sparkles } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { TransitAutoButton } from "@/components/admin/transit-auto-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { explodeMultiLineSuggestion } from "@/lib/transport-utils";
import { PublicTransportCard } from "./transport/PublicTransportCard";
import { PrivateTransportCard } from "./transport/PrivateTransportCard";

interface TransportTabProps {
  initialCity?: string;
  propertyId?: number;
}

export function TransportSection({
  initialCity,
  propertyId,
}: TransportTabProps) {
  const { control, watch } = useFormContext<PropertyFormData>();

  const {
    fields: transportFields,
    append: appendTransport,
    remove: removeTransport,
  } = useFieldArray({
    control,
    name: "transport",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Movilidad
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ayuda a tus huéspedes a moverse como locales.
          </p>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl w-full sm:w-auto flex flex-wrap h-auto">
          <TabsTrigger
            value="public"
            className="flex-1 sm:flex-none rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex gap-2 justify-center"
          >
            <Bus className="w-4 h-4" />{" "}
            <span className="hidden xs:inline">Transporte</span> Público
          </TabsTrigger>
          <TabsTrigger
            value="private"
            className="flex-1 sm:flex-none rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex gap-2 justify-center"
          >
            <Car className="w-4 h-4" /> Privado{" "}
            <span className="hidden xs:inline">y Alquileres</span>
          </TabsTrigger>
        </TabsList>

        {/* --- TAB PÚBLICO --- */}
        <TabsContent value="public" className="space-y-6 mt-6">
          {/* Smart Discovery Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Smart Discovery
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300/80">
                  Busca paradas y líneas cercanas automáticamente.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {propertyId && (
                <TransitAutoButton
                  propertyId={propertyId}
                  city={initialCity || ""}
                  className="w-full sm:w-auto justify-center"
                  onComplete={(suggestions) => {
                    if (suggestions && suggestions.length > 0) {
                      // AQUÍ ESTÁ LA MAGIA: Flattening & Exploding
                      // Convertimos [SuggestionCombined] -> [Line20, Line72, ...]
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const explodedItems = suggestions.flatMap((s: any) =>
                        explodeMultiLineSuggestion(s),
                      );

                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      explodedItems.forEach((item: any) =>
                        appendTransport(item),
                      );
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                appendTransport({
                  name: "",
                  type: "bus",
                  description: "",
                  scheduleInfo: "",
                  isActive: true,
                  priceInfo: "",
                })
              }
              className="text-xs font-semibold text-brand-void dark:text-zinc-300 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar línea manualmente
            </button>
          </div>

          <div className="grid gap-3">
            {transportFields.map((field, index) => {
              const type = watch(`transport.${index}.type`) || "bus";
              if (!["bus", "train", "subway"].includes(type)) return null;

              return (
                <PublicTransportCard
                  key={field.id}
                  index={index}
                  onRemove={removeTransport}
                />
              );
            })}

            {transportFields.filter((f) =>
              ["bus", "train", "subway"].includes(f.type || ""),
            ).length === 0 && (
              <div className="text-center py-12 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Bus className="w-6 h-6 text-zinc-300" />
                </div>
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  Sin transporte público
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Usa &quot;Smart Discovery&quot; para detectar líneas.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- TAB PRIVADO (Sin Cambios) --- */}
        <TabsContent value="private" className="space-y-6 mt-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start md:items-center">
            <div>
              <h4 className="font-medium text-base">Agenda de Contactos</h4>
              <p className="text-xs text-muted-foreground">
                Taxis, remises y servicios recomendados.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                appendTransport({
                  name: "",
                  type: "taxi",
                  description: "",
                  isActive: true,
                  phone: "",
                })
              }
              className="text-xs font-semibold bg-brand-void dark:bg-white text-white dark:text-brand-void px-4 py-2 rounded-full flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo Contacto
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {transportFields.map((field, index) => {
              // Note: using watch inside map is okay for this scale, but componentizing helps pref.
              // We do look up type to decide if we render.
              // Actually, we can check field content if we didn't rely on 'watch' for filtering.
              // But 'type' is in the field object usually? 'field' from useFieldArray has default values?
              // 'field' has the values at the time of mounting usually, but watch is safer for reactive updates.
              const currentType = watch(`transport.${index}.type`);
              if (["bus", "train", "subway"].includes(currentType || ""))
                return null;

              return (
                <PrivateTransportCard
                  key={field.id}
                  index={index}
                  onRemove={removeTransport}
                />
              );
            })}
            {transportFields.filter(
              (f) => !["bus", "train", "subway"].includes(f.type || ""),
            ).length === 0 && (
              <div className="lg:col-span-2 text-center py-12 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                <Car className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">
                  Agrega taxis o remises de confianza.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
