"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import {
  Calendar,
  Trash2,
  Plus,
  Info,
  ListTodo,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export function PreCheckInSection() {
  const { register, control } = useFormContext<PropertyFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "preCheckInSteps",
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pre Check-in
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configura las instrucciones que verán tus huéspedes antes de su llegada (más de 12 horas antes del check-in).
        </p>
      </div>

      {/* PASO A PASO */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-copper/10 rounded-lg text-brand-copper">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Paso a Paso
              </h4>
              <p className="text-xs text-muted-foreground">
                Instrucciones secuenciales para antes del check-in
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono text-[10px]"
          >
            {fields.length} {fields.length === 1 ? "PASO" : "PASOS"}
          </Badge>
        </div>

        <div className="relative pl-4">
          {/* Línea conectora */}
          {fields.length > 0 && (
            <div className="absolute left-[27px] top-4 bottom-10 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800" />
          )}

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-start gap-4 group relative"
                >
                  {/* Círculo numérico */}
                  <div className="relative z-10 flex-shrink-0 mt-2">
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 group-hover:border-brand-copper group-hover:text-brand-copper transition-colors duration-300 shadow-sm">
                      {index + 1}
                    </div>
                  </div>

                  {/* Textarea del paso */}
                  <div className="flex-1 flex gap-2 items-start">
                    <Textarea
                      {...register(`preCheckInSteps.${index}.text` as const)}
                      placeholder={
                        index === 0
                          ? "Ej: Revisa tu email con las instrucciones de llegada..."
                          : `Instrucción del paso ${index + 1}...`
                      }
                      className="min-h-[60px] resize-none bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:border-brand-copper/50 focus-visible:ring-brand-copper/20 text-sm py-3 px-4 rounded-xl shadow-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-8 w-8 mt-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div layout className="mt-4 ml-10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: "" })}
              className="flex items-center gap-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-brand-copper hover:text-brand-copper transition-all bg-transparent"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar siguiente paso
            </Button>
          </motion.div>
        </div>
      </div>

      {/* NOTAS ADICIONALES */}
      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500 mb-1">
          <Info className="w-4 h-4" />
          <Label className="text-xs font-bold uppercase tracking-wider">
            Notas Adicionales (Opcional)
          </Label>
        </div>
        <Textarea
          {...register("preCheckInNotes")}
          placeholder="Cualquier otro detalle importante para antes del check-in..."
          className="min-h-[80px] bg-zinc-50/30 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 focus:border-brand-copper/30 focus-visible:ring-0 resize-none rounded-xl"
        />
      </div>
    </div>
  );
}

