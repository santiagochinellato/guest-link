"use client";

import { useFormContext } from "react-hook-form";
import { Bus, Train, Trash2, CornerDownRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

interface PublicTransportCardProps {
  index: number;
  onRemove: (index: number) => void;
}

export function PublicTransportCard({
  index,
  onRemove,
}: PublicTransportCardProps) {
  const { register, watch, setValue } = useFormContext();
  const type = watch(`transport.${index}.type`) || "bus";
  const isVisible = watch(`transport.${index}.isActive`);
  const styles = getPublicTransportStyles(type);

  return (
    <Card
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
            "w-full sm:w-28 flex flex-row sm:flex-col items-center justify-center sm:justify-center p-3 sm:p-4 gap-2 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-800",
            isVisible ? "bg-zinc-50/50 dark:bg-zinc-900/50" : "bg-transparent",
          )}
        >
          <div className="flex items-center justify-center gap-3 sm:block">
            <div className="relative flex justify-center">
              <div
                className={cn(
                  "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10 overflow-hidden",
                  isVisible
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    : "bg-zinc-200 text-zinc-400",
                )}
              >
                <Input
                  {...register(`transport.${index}.name`)}
                  placeholder="#"
                  className={cn(
                    "w-full h-full border-0 bg-transparent text-center p-0 shadow-none focus-visible:ring-0",
                    "text-lg sm:text-2xl font-bold tracking-tight placeholder:text-zinc-300 dark:placeholder:text-zinc-600",
                    isVisible
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400",
                  )}
                />
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] uppercase tracking-wider font-bold px-2 sm:mt-2",
                styles.bg,
                styles.text,
              )}
            >
              {styles.label}
            </Badge>
          </div>

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
        <div className="flex-1 p-3 sm:p-5 flex flex-col justify-center gap-3 sm:gap-5">
          {/* Parada */}
          <div className="flex items-start gap-3 relative">
            <div className="absolute top-3 left-[5px] w-0.5 h-10 bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-700" />

            <div className="mt-1 relative z-10">
              <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 ring-2 ring-white dark:ring-zinc-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              </div>
            </div>
            <div className="flex-1 -mt-0.5 min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                Parada / Estación
              </p>
              <div className="flex items-center gap-2">
                <Input
                  {...register(`transport.${index}.scheduleInfo`)}
                  className="h-auto py-0 px-0 border-0 bg-transparent text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus-visible:ring-0 placeholder:text-zinc-300 w-full min-w-0"
                  placeholder="Ubicación de parada"
                />
              </div>
            </div>
          </div>

          {/* Recorrido + Recomendación */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
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
              <div className="flex-1 group/input min-w-0">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block group-focus-within/input:text-brand-void dark:group-focus-within/input:text-brand-copper transition-colors">
                  Recorrido / Destinos
                </Label>
                <Input
                  {...register(`transport.${index}.description`)}
                  placeholder="Ej: Centro Cívico, Puerto Pañuelo..."
                  className="border-0 border-b border-zinc-200 dark:border-zinc-800 bg-transparent rounded-none px-0 h-auto py-1 shadow-none focus-visible:ring-0 focus-visible:border-brand-void dark:focus-visible:border-brand-copper font-medium text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 w-full min-w-0"
                />
              </div>
            </div>

            {/* Recomendación (Mapped to priceInfo) */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 group/input min-w-0">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block group-focus-within/input:text-amber-500 transition-colors">
                  Recomendación (Opcional)
                </Label>
                <Input
                  {...register(`transport.${index}.priceInfo`)}
                  placeholder="Ej: Llevar tarjeta SUBE"
                  className="border-0 border-b border-zinc-200 dark:border-zinc-800 bg-transparent rounded-none px-0 h-auto py-1 shadow-none focus-visible:ring-0 focus-visible:border-amber-500 font-medium text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 w-full min-w-0"
                />
              </div>
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
            onClick={() => onRemove(index)}
            className="mb-2 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Delete */}
        <div className="sm:hidden border-t border-zinc-100 dark:border-zinc-800 p-2 flex justify-end bg-zinc-50/50">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center gap-2 text-xs text-red-500 px-3 py-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar línea
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
