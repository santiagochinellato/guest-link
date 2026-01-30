"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import {
  Car,
  KeyRound,
  ShieldCheck,
  Trash2,
  Plus,
  Info,
  MapPin,
  ListTodo,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export function AccessSection() {
  const { register, control, watch } = useFormContext<PropertyFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "accessSteps",
  });

  // Watch for UI conditional rendering ONLY
  const alarmCode = watch("alarmCode");
  const hasParking = watch("hasParking");

  const isAlarmEnabled = alarmCode !== undefined && alarmCode !== null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Acceso y Seguridad
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configura cómo entrarán tus huéspedes y los códigos necesarios.
        </p>
      </div>

      {/* BLOQUE DE SEGURIDAD (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Código de Acceso */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-brand-copper/30 transition-all bg-zinc-50/30 dark:bg-zinc-900/20">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center text-brand-copper shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <Label className="text-sm font-bold block text-zinc-900 dark:text-zinc-100">
                  Código de Acceso
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Caja fuerte o Smart Lock
                </p>
              </div>
            </div>
            <div className="relative">
              <Input
                {...register("accessCode")}
                placeholder="Ej: 1234#"
                className="font-mono text-lg tracking-[0.2em] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-copper/30 h-12 text-center font-bold placeholder:tracking-normal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Alarma */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-brand-copper/30 transition-all bg-zinc-50/30 dark:bg-zinc-900/20">
          <CardContent className="p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <Label className="text-sm font-bold block text-zinc-900 dark:text-zinc-100">
                    Alarma
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Sistema de seguridad
                  </p>
                </div>
              </div>
              <Controller
                name="alarmCode"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value !== undefined && field.value !== null}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? "" : undefined);
                    }}
                  />
                )}
              />
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <AnimatePresence mode="wait">
                {isAlarmEnabled ? (
                  <motion.div
                    key="alarm-input-field"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="w-full pt-2"
                  >
                    <Input
                      {...register("alarmCode")}
                      placeholder="Clave de desactivación"
                      className="font-mono text-sm tracking-widest bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-copper/30 h-12"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="alarm-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-12 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/50 dark:bg-zinc-900/50"
                  >
                    <span className="text-xs text-zinc-400">
                      Sin alarma configurada
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GUÍA PASO A PASO (TIMELINE) */}
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
                Instrucciones secuenciales
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
                      {...register(`accessSteps.${index}.text` as const)}
                      placeholder={
                        index === 0
                          ? "Ej: Al llegar a la calle principal, buscar el portón negro..."
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

      {/* ADDITIONAL NOTES */}
      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500 mb-1">
          <Info className="w-4 h-4" />
          <Label className="text-xs font-bold uppercase tracking-wider">
            Notas Adicionales (Opcional)
          </Label>
        </div>
        <Textarea
          {...register("accessInstructions")}
          placeholder="Cualquier otro detalle importante..."
          className="min-h-[80px] bg-zinc-50/30 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 focus:border-brand-copper/30 focus-visible:ring-0 resize-none rounded-xl"
        />
      </div>

      {/* PARKING */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <Label className="text-base font-bold block text-zinc-900 dark:text-zinc-100">
                  Estacionamiento
                </Label>
                <p className="text-sm text-muted-foreground">
                  ¿La propiedad cuenta con cochera?
                </p>
              </div>
            </div>
            <Controller
              name="hasParking"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <AnimatePresence>
            {hasParking && (
              <motion.div
                key="parking-details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800"
              >
                <div className="p-6 pt-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Detalles de ubicación
                  </Label>
                  <Input
                    {...register("parkingDetails")}
                    placeholder="Ej: Cochera número 4, subsuelo. Control remoto en la mesa."
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-copper/20 h-11"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
