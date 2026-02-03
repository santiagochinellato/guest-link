"use client";

import { useFormContext } from "react-hook-form";
import { Car, Plane, Key, Info, Phone, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRIVATE_TYPES = [
  { id: "taxi", label: "Taxi / Remis", icon: Car },
  { id: "transfer", label: "Transfer", icon: Plane },
  { id: "rental", label: "Rent a Car", icon: Key },
  { id: "other", label: "Otro", icon: Info },
];

interface PrivateTransportCardProps {
  index: number;
  onRemove: (index: number) => void;
}

export function PrivateTransportCard({
  index,
  onRemove,
}: PrivateTransportCardProps) {
  const { register, watch, setValue } = useFormContext();
  const currentType = watch(`transport.${index}.type`);

  return (
    <Card className="relative group overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm">
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
                    setValue(`transport.${index}.type`, typeOption.id)
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
              {...register(`transport.${index}.name`)}
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
                  {...register(`transport.${index}.phone`)}
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
                {...register(`transport.${index}.description`)}
                placeholder="Ej: Solo efectivo"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs font-medium text-zinc-400 hover:text-red-600 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
