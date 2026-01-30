"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Bus,
  Car,
  Phone,
  Trash2,
  Plus,
  Info,
  Train,
  Plane,
  Key,
  Navigation,
  Sparkles,
  CornerDownRight,
} from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { TransitAutoButton } from "@/components/admin/transit-auto-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// --- PARSING LOGIC (La clave para separar las líneas) ---

/**
 * Toma una sugerencia "sucia" que puede contener múltiples líneas y la divide
 * en objetos individuales limpios.
 */
const explodeMultiLineSuggestion = (suggestion: any) => {
  const rawDesc = suggestion.description || "";

  // Caso 1: Si no tiene el separador de viñeta, retornamos tal cual (limpiando un poco)
  if (!rawDesc.includes("•")) {
    return [
      {
        ...suggestion,
        // Si el nombre es genérico "Colectivo", intentamos ver si en la descripción dice "Línea X"
        name:
          parseLineNumber(suggestion.name) === "?" && rawDesc.includes("Línea")
            ? rawDesc.match(/Línea \d+/)?.[0] || suggestion.name
            : suggestion.name,
        scheduleInfo: cleanAddress(suggestion.scheduleInfo, rawDesc),
        description: rawDesc.replace("📍", "").trim(),
      },
    ];
  }

  // Caso 2: Tiene múltiples líneas (El caso de San Martín 400)
  // Formato esperado: "📍 Parada... • Línea 20: Va a... • Línea 72: Va a..."
  const parts = rawDesc
    .split("•")
    .map((p: string) => p.trim())
    .filter(Boolean);

  // La primera parte suele ser la ubicación de la parada
  const locationPart = parts[0];
  const cleanLoc = cleanAddress(suggestion.scheduleInfo, locationPart);

  // Las partes siguientes son las líneas individuales
  const lines = parts.slice(1);

  return lines.map((lineStr: string) => {
    // lineStr ejemplo: "Línea 20: Va a Llao Llao, Puerto Pañuelo"
    // Separamos el Nombre (Línea 20) de la Descripción (Va a...)
    const separatorIndex = lineStr.indexOf(":");
    let name = "Bus";
    let desc = lineStr;

    if (separatorIndex !== -1) {
      name = lineStr.substring(0, separatorIndex).trim(); // "Línea 20"
      desc = lineStr.substring(separatorIndex + 1).trim(); // "Va a Llao Llao..."
    } else {
      // Si no hay dos puntos, asumimos que todo es el nombre o descripción
      if (lineStr.includes("Línea")) name = lineStr;
    }

    return {
      ...suggestion,
      name: name, // Ahora cada tarjeta tendrá su nombre correcto "Línea 20", "Línea 72"
      description: desc, // Solo el destino relevante
      scheduleInfo: cleanLoc, // La dirección limpia compartida
      type: suggestion.type || "bus",
      isActive: true,
    };
  });
};

const parseLineNumber = (rawName: string) => {
  if (!rawName) return "?";
  const match = rawName.match(/(\d+)/);
  return match ? match[0] : rawName.charAt(0).toUpperCase();
};

const cleanAddress = (scheduleInfo: string, description: string) => {
  // Prioridad 1: Texto entre paréntesis (Suele ser la calle real)
  const addressMatch = description?.match(/\((.*?)\)/);
  // Evitar capturar "(Plaza Belgrano)" si tenemos una dirección antes
  // Buscamos algo que parezca dirección con números
  if (addressMatch && /\d/.test(addressMatch[1])) return addressMatch[1];

  // Prioridad 2: Limpiar el string de "📍 Parada a Xm"
  if (description?.includes("📍")) {
    return description.split("•")[0].replace("📍", "").trim();
  }

  // Fallback
  return scheduleInfo || "Parada cercana";
};

// --- VISUAL STYLES ---
const PRIVATE_TYPES = [
  { id: "taxi", label: "Taxi / Remis", icon: Car },
  { id: "transfer", label: "Transfer", icon: Plane },
  { id: "rental", label: "Rent a Car", icon: Key },
  { id: "other", label: "Otro", icon: Info },
];

const getPublicTransportStyles = (type: string) => {
  switch (type) {
    case "train":
    case "subway":
      return {
        bg: "bg-indigo-100 dark:bg-indigo-900/40",
        text: "text-indigo-700 dark:text-indigo-300",
        icon: Train,
        label: "Tren/Subte",
      };
    case "bus":
    default:
      return {
        bg: "bg-orange-100 dark:bg-orange-900/40",
        text: "text-orange-700 dark:text-orange-300",
        icon: Bus,
        label: "Colectivo",
      };
  }
};

interface TransportTabProps {
  initialCity?: string;
  propertyId?: number;
}

export function TransportSection({
  initialCity,
  propertyId,
}: TransportTabProps) {
  const { control, register, watch, setValue } =
    useFormContext<PropertyFormData>();

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
        <TabsList className="bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl w-full sm:w-auto inline-flex">
          <TabsTrigger
            value="public"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex gap-2"
          >
            <Bus className="w-4 h-4" /> Transporte Público
          </TabsTrigger>
          <TabsTrigger
            value="private"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all flex gap-2"
          >
            <Car className="w-4 h-4" /> Privado y Alquileres
          </TabsTrigger>
        </TabsList>

        {/* --- TAB PÚBLICO --- */}
        <TabsContent value="public" className="space-y-6 mt-6">
          {/* Smart Discovery Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-3">
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
                  onComplete={(suggestions) => {
                    if (suggestions && suggestions.length > 0) {
                      // AQUÍ ESTÁ LA MAGIA: Flattening & Exploding
                      // Convertimos [SuggestionCombined] -> [Line20, Line72, ...]
                      const explodedItems = suggestions.flatMap((s) =>
                        explodeMultiLineSuggestion(s),
                      );

                      explodedItems.forEach((item: any) =>
                        appendTransport(item),
                      );
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid gap-3">
            {transportFields.map((field, index) => {
              const type = watch(`transport.${index}.type`) || "bus";
              if (!["bus", "train", "subway"].includes(type)) return null;

              const isVisible = watch(`transport.${index}.isActive`);
              const rawName = watch(`transport.${index}.name`) || "";

              // Como ya separamos las tarjetas, rawName debería ser "Línea 20"
              const styles = getPublicTransportStyles(type);
              const displayLineNumber = parseLineNumber(rawName);

              return (
                <Card
                  key={field.id}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 border",
                    isVisible
                      ? "border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 bg-white dark:bg-zinc-950"
                      : "border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 opacity-70",
                  )}
                >
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    {/* Badge Columna Izquierda */}
                    <div
                      className={cn(
                        "w-full sm:w-28 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-4 gap-2 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-800",
                        isVisible
                          ? "bg-zinc-50/50 dark:bg-zinc-900/50"
                          : "bg-transparent",
                      )}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm border border-black/5 dark:border-white/10 tracking-tight",
                            isVisible
                              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                              : "bg-zinc-200 text-zinc-400",
                          )}
                        >
                          {displayLineNumber}
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] uppercase tracking-wider font-bold px-2",
                          styles.bg,
                          styles.text,
                        )}
                      >
                        {styles.label}
                      </Badge>

                      <div className="sm:hidden">
                        <Switch
                          checked={isVisible}
                          onCheckedChange={(c) =>
                            setValue(`transport.${index}.isActive`, c)
                          }
                        />
                      </div>
                    </div>

                    {/* Info Central */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center gap-5">
                      {/* Parada */}
                      <div className="flex items-start gap-3 relative">
                        <div className="absolute top-3 left-[5px] w-0.5 h-10 bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-700" />

                        <div className="mt-1 relative z-10">
                          <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 ring-2 ring-white dark:ring-zinc-950 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                          </div>
                        </div>
                        <div className="flex-1 -mt-0.5">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                            Parada / Estación
                          </p>
                          <div className="flex items-center gap-2">
                            {/* Input de Parada (Ahora editable y limpio) */}
                            <Input
                              {...register(
                                `transport.${index}.scheduleInfo` as const,
                              )}
                              className="h-auto py-0 px-0 border-0 bg-transparent text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus-visible:ring-0 placeholder:text-zinc-300"
                              placeholder="Ubicación de parada"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recorrido */}
                      <div className="flex items-start gap-3">
                        <div className="mt-3">
                          <CornerDownRight
                            className={cn(
                              "w-4 h-4",
                              isVisible
                                ? "text-brand-void dark:text-brand-copper"
                                : "text-zinc-300",
                            )}
                          />
                        </div>
                        <div className="flex-1 group/input">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block group-focus-within/input:text-brand-void dark:group-focus-within/input:text-brand-copper transition-colors">
                            Recorrido / Destinos
                          </Label>
                          <Input
                            {...register(
                              `transport.${index}.description` as const,
                            )}
                            placeholder="Ej: Centro Cívico, Puerto Pañuelo..."
                            className="border-0 border-b border-zinc-200 dark:border-zinc-800 bg-transparent rounded-none px-0 h-auto py-1 shadow-none focus-visible:ring-0 focus-visible:border-brand-void dark:focus-visible:border-brand-copper font-medium text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Acciones Desktop */}
                    <div className="hidden sm:flex flex-col items-center justify-between p-3 border-l border-zinc-100 dark:border-zinc-800 w-16 bg-zinc-50/30 dark:bg-zinc-900/10">
                      <div className="mt-2">
                        <Switch
                          checked={isVisible}
                          onCheckedChange={(checked) =>
                            setValue(`transport.${index}.isActive`, checked)
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTransport(index)}
                        className="mb-2 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Delete */}
                    <div className="sm:hidden border-t border-zinc-100 dark:border-zinc-800 p-2 flex justify-end bg-zinc-50/50">
                      <button
                        type="button"
                        onClick={() => removeTransport(index)}
                        className="flex items-center gap-2 text-xs text-red-500 px-3 py-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar línea
                      </button>
                    </div>
                  </CardContent>
                </Card>
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
                  Usa "Smart Discovery" para detectar líneas.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- TAB PRIVADO (Sin Cambios) --- */}
        <TabsContent value="private" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
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
              const currentType = watch(`transport.${index}.type`);
              if (["bus", "train", "subway"].includes(currentType || ""))
                return null;

              return (
                <Card
                  key={field.id}
                  className="relative group overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                >
                  <CardContent className="p-5 space-y-5">
                    {/* Selector Visual */}
                    <div className="space-y-2">
                      <Label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                        Tipo de Servicio
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {PRIVATE_TYPES.map((typeOption) => {
                          const isSelected = currentType === typeOption.id;
                          const Icon = typeOption.icon;
                          return (
                            <button
                              key={typeOption.id}
                              type="button"
                              onClick={() =>
                                setValue(
                                  `transport.${index}.type`,
                                  typeOption.id,
                                )
                              }
                              className={cn(
                                "flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[10px] font-medium transition-all",
                                isSelected
                                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-sm"
                                  : "bg-transparent border-zinc-100 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                              )}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {typeOption.label.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Nombre / Empresa
                        </Label>
                        <Input
                          {...register(`transport.${index}.name` as const)}
                          placeholder="Ej: Remises del Centro"
                          className="font-semibold text-base border-zinc-200 focus-visible:ring-brand-copper/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            WhatsApp / Teléfono
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                            <Input
                              {...register(`transport.${index}.phone` as const)}
                              placeholder="+54 9 ..."
                              className="pl-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Nota (Opcional)
                          </Label>
                          <Input
                            {...register(
                              `transport.${index}.description` as const,
                            )}
                            placeholder="Ej: Solo efectivo"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                      <button
                        type="button"
                        onClick={() => removeTransport(index)}
                        className="text-xs font-medium text-zinc-400 hover:text-red-600 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </CardContent>
                </Card>
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
