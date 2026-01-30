"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  CheckCircle2,
  Ban,
  Plus,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// --- PRESETS CONFIG ---
const ALLOWED_PRESETS = [
  "Mascotas",
  "Niños / Bebés",
  "Fumar (Balcón)",
  "Reuniones pequeñas",
  "Check-in flexible",
];

const PROHIBITED_PRESETS = [
  "Fumar (Interior)",
  "Fiestas / Eventos",
  "Mascotas",
  "Ruidos molestos",
  "Visitas nocturnas",
  "Fotografía comercial",
];

export function RulesSection() {
  const { control, register } = useFormContext<PropertyFormData>();

  // --- ARRAYS ---
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Reglas de Convivencia
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define claramente qué se puede hacer y qué no en tu propiedad.
        </p>
      </div>

      {/* GRID DE DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1: PERMITIDO */}
        <RuleCategoryManager
          title="Lo Permitido"
          description="Cosas que tus huéspedes SÍ pueden hacer."
          icon={CheckCircle2}
          colorTheme="green"
          presets={ALLOWED_PRESETS}
          fields={allowedFields}
          onAdd={(val) => appendAllowed({ value: val })}
          onRemove={(idx) => removeAllowed(idx)}
        />

        {/* COLUMNA 2: PROHIBIDO */}
        <RuleCategoryManager
          title="Lo Prohibido"
          description="Restricciones importantes de la casa."
          icon={Ban}
          colorTheme="red"
          presets={PROHIBITED_PRESETS}
          fields={prohibitedFields}
          onAdd={(val) => appendProhibited({ value: val })}
          onRemove={(idx) => removeProhibited(idx)}
        />
      </div>

      {/* REGLAS ADICIONALES (Texto libre) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 mb-1">
          <AlertCircle className="w-4 h-4" />
          <Label className="text-xs font-bold uppercase tracking-wider">
            Detalles y Aclaraciones
          </Label>
        </div>
        <Textarea
          {...register("houseRules")}
          placeholder="Ej: El horario de silencio es estricto de 22:00 a 08:00. Las multas del consorcio corren por cuenta del huésped..."
          className="min-h-[120px] bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 focus:border-brand-copper/30 focus-visible:ring-0 resize-none rounded-xl"
        />
        <p className="text-xs text-muted-foreground">
          Usa este espacio para explicar matices o reglas complejas que no caben
          en la lista.
        </p>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE REUTILIZABLE PARA GESTIÓN DE LISTAS ---

interface RuleManagerProps {
  title: string;
  description: string;
  icon: React.ElementType;
  colorTheme: "green" | "red";
  presets: string[];
  fields: any[]; // FieldArray fields
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

function RuleCategoryManager({
  title,
  description,
  icon: Icon,
  colorTheme,
  presets,
  fields,
  onAdd,
  onRemove,
}: RuleManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddCustom = () => {
    if (!inputValue.trim()) return;
    // Evitar duplicados simples
    if (
      fields.some((f) => f.value.toLowerCase() === inputValue.toLowerCase())
    ) {
      setInputValue("");
      return;
    }
    onAdd(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const togglePreset = (preset: string) => {
    const existsIndex = fields.findIndex((f) => f.value === preset);
    if (existsIndex >= 0) {
      onRemove(existsIndex);
    } else {
      onAdd(preset);
    }
  };

  // Estilos dinámicos basados en el tema
  const styles = {
    green: {
      card: "border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10",
      icon: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
      badge:
        "bg-white border-green-200 text-green-700 hover:border-green-300 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300",
      activePreset:
        "bg-green-100 border-green-300 text-green-800 dark:bg-green-800 dark:border-green-600 dark:text-white",
    },
    red: {
      card: "border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10",
      icon: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
      badge:
        "bg-white border-red-200 text-red-700 hover:border-red-300 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300",
      activePreset:
        "bg-red-100 border-red-300 text-red-800 dark:bg-red-800 dark:border-red-600 dark:text-white",
    },
  };

  const currentStyle = styles[colorTheme];

  return (
    <Card className={cn("border shadow-sm overflow-hidden", currentStyle.card)}>
      <CardContent className="p-5 flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              currentStyle.icon,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Input Custom */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Agregar regla personalizada..."
            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleAddCustom}
            disabled={!inputValue.trim()}
            variant="outline"
            className="shrink-0 bg-white dark:bg-zinc-950"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Presets (Chips) */}
        <div>
          <Label className="text-[10px] uppercase text-zinc-400 font-bold mb-2 block">
            Sugerencias Rápidas
          </Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const isActive = fields.some((f) => f.value === preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                    isActive
                      ? currentStyle.activePreset
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300",
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active List */}
        <div className="flex-1 mt-2">
          {fields.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-zinc-400 font-bold mb-2 block">
                Lista Activa ({fields.length})
              </Label>
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg border text-sm animate-in slide-in-from-left-2 fade-in duration-300",
                      currentStyle.badge,
                    )}
                  >
                    <span className="font-medium break-words min-w-0 flex-1 mr-2">
                      {field.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="text-current opacity-60 hover:opacity-100 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/50">
              <Sparkles className="w-5 h-5 text-zinc-300 mb-1" />
              <p className="text-xs text-zinc-400">Sin reglas asignadas</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
