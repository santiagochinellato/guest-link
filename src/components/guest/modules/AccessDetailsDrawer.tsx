"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Car,
  ShieldCheck,
  KeyRound,
  Footprints,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AccessDetailsDrawerProps {
  children: React.ReactNode;
  accessCode?: string;
  alarmCode?: string;
  hasParking?: boolean;
  parkingDetails?: string;
  accessSteps?: { text: string }[];
}

export function AccessDetailsDrawer({
  children,
  accessCode,
  alarmCode,
  hasParking,
  parkingDetails,
  accessSteps,
}: AccessDetailsDrawerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast.success(
      `${label === "access" ? "Código de acceso" : "Código de alarma"} copiado`,
    );
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold text-center">
              Detalles de Acceso
            </DrawerTitle>
            <DrawerDescription className="text-center">
              Información segura para tu llegada
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-6 overflow-y-auto pb-8">
            {/* Access Codes Grid */}
            <div
              className={cn(
                "grid gap-4",
                alarmCode ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {/* Door Code */}
              {accessCode && (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-2 group relative overflow-hidden">
                  <div className="p-2 bg-white dark:bg-black rounded-full shadow-sm mb-1">
                    <KeyRound
                      className="w-5 h-5 text-brand-copper"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    Puerta
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-bold tracking-widest text-zinc-900 dark:text-white">
                      {accessCode}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute inset-x-0 bottom-0 h-full w-full opacity-0 group-hover:opacity-100 bg-white/50 backdrop-blur-sm transition-opacity flex items-center justify-center gap-2 text-brand-void font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(accessCode, "access");
                    }}
                  >
                    {copiedCode === "access" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedCode === "access" ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              )}

              {/* Alarm Code */}
              {alarmCode && (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-2 group relative overflow-hidden">
                  <div className="p-2 bg-white dark:bg-black rounded-full shadow-sm mb-1">
                    <ShieldCheck
                      className="w-5 h-5 text-red-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    Alarma
                  </span>
                  <span className="text-xl font-mono font-bold tracking-widest text-zinc-900 dark:text-white">
                    {alarmCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute inset-x-0 bottom-0 h-full w-full opacity-0 group-hover:opacity-100 bg-white/50 backdrop-blur-sm transition-opacity flex items-center justify-center gap-2 text-brand-void font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(alarmCode, "alarm");
                    }}
                  >
                    {copiedCode === "alarm" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedCode === "alarm" ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              )}
            </div>

            {/* Parking Details */}
            {hasParking && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl shrink-0">
                    <Car
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
                      Estacionamiento Disponible
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {parkingDetails ||
                        "Hay estacionamiento disponible en la propiedad."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Access Steps */}
            {accessSteps && accessSteps.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Footprints
                    className="w-4 h-4 text-brand-copper"
                    strokeWidth={1.5}
                  />
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-200">
                    Pasos de llegada
                  </h4>
                </div>
                <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-2 space-y-6">
                  {accessSteps.map((step, index) => (
                    <div key={index} className="pl-6 relative">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-black border-2 border-brand-copper rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-brand-copper rounded-full" />
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DrawerFooter className="px-0">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl h-12 text-md"
                >
                  Entendido
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
