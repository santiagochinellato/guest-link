"use client";

import { useState } from "react";
import {
  MapPin,
  KeyRound,
  ShieldCheck,
  ListTodo,
  Info,
  Scroll,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CheckInDayInfoProps {
  address?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  accessCode?: string | null;
  alarmCode?: string | null;
  accessSteps?: { text: string }[];
  accessInstructions?: string | null;
  hostPhone?: string | null;
  hostName?: string | null;
  houseRules?: string;
  rulesAllowed?: string[];
  rulesProhibited?: string[];
}

export function CheckInDayInfo({
  address,
  latitude,
  longitude,
  accessCode,
  alarmCode,
  accessSteps,
  accessInstructions,
  hostPhone,
  hostName,
  houseRules,
  rulesAllowed,
  rulesProhibited,
}: CheckInDayInfoProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAccessInstructionsOpen, setIsAccessInstructionsOpen] = useState(false);

  // Función para extraer solo el texto de houseRules si viene como JSON
  const getHouseRulesText = (): string => {
    if (!houseRules) return "";
    
    // Si es un string que parece JSON, intentar parsearlo
    if (typeof houseRules === "string" && houseRules.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(houseRules);
        if (parsed && typeof parsed === "object" && parsed !== null && "text" in parsed) {
          return typeof parsed.text === "string" ? parsed.text : "";
        }
        return "";
      } catch {
        return "";
      }
    }
    
    // Si ya es texto plano, devolverlo
    return houseRules;
  };

  const houseRulesText = getHouseRulesText();

  const handleOpenLocation = () => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
      );
    } else if (address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank",
      );
    }
  };

  const handleOpenWhatsApp = () => {
    if (!hostPhone) return;
    // Limpiar el número de teléfono (remover espacios, guiones, etc.)
    const cleanPhone = hostPhone.replace(/[^\d+]/g, "");
    // Si no empieza con +, agregarlo (asumiendo formato internacional)
    const phoneNumber = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  const hasLocation = address || (latitude && longitude);
  const hasAccessInfo = accessCode || alarmCode;
  const hasSteps = accessSteps && accessSteps.length > 0;

  return (
    <div className=" mt-4 w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 space-y-6">
            {/* Notas Adicionales */}
            {accessInstructions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
               Importante
              </h3>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/30">
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {accessInstructions}
              </p>
            </div>
          </div>
        )}
        {/* Dirección de la Propiedad */}
        {hasLocation && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-copper" />
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                Ubicación
              </h3>
            </div>
            <button
              onClick={handleOpenLocation}
              className="w-full flex items-center justify-between gap-3 p-4 bg-brand-copper/10 dark:bg-brand-copper/20 rounded-2xl border-2 border-brand-copper/30 hover:border-brand-copper/50 transition-all active:scale-[0.98] group"
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-brand-copper dark:text-brand-copper/90 mb-1">
                  {address || "Ver en mapa"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Toca para abrir en Google Maps
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-brand-copper group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Botón Instrucciones de Acceso */}
        {hasSteps && (
          <Dialog open={isAccessInstructionsOpen} onOpenChange={setIsAccessInstructionsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 border-2  bg-brand-void text-white hover:border-brand-copper/50 hover:bg-brand-copper/5 dark:hover:bg-brand-void/10 transition-all text-[16px]"
              >
                <ListTodo className="w-4 h-4 mr-2" />
                Instrucciones de Acceso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader className="px-0">
                <DialogTitle className="text-xl sm:text-2xl font-bold">Instrucciones de Acceso</DialogTitle>
              </DialogHeader>
              <div className="mt-4 px-0">
                <div className="relative pb-4">
                  {/* Línea conectora */}
                  {accessSteps.length > 0 && (
                    <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800" />
                  )}
                  <div className="space-y-4">
                    {accessSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        {/* Círculo numérico */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-950 border-2 border-brand-copper flex items-center justify-center text-[10px] font-bold text-brand-copper shadow-sm">
                            {index + 1}
                          </div>
                        </div>
                        {/* Texto del paso */}
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                     {/* Códigos de Acceso y Alarma */}
        {hasAccessInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accessCode && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-zinc-500" />
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Código de Acceso
                    </p>
                  </div>
                  <p className="text-2xl font-bold font-mono tracking-wider text-zinc-900 dark:text-white">
                    {accessCode}
                  </p>
                </div>
              )}
              {alarmCode && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-zinc-500" />
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Código de Alarma
                    </p>
                  </div>
                  <p className="text-2xl font-bold font-mono tracking-wider text-zinc-900 dark:text-white">
                    {alarmCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </DialogContent>
          </Dialog>
        )}

             {/* Botón Reglas de la Propiedad */}
             <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-brand-copper text-white hover:border-brand-copper/50 hover:bg-brand-copper/5 dark:hover:bg-brand-copper/10 transition-all text-[16px]"
            >
              <Scroll className="w-4 h-4 mr-2" />
              Reglas de la Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="px-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold">Reglas de la Propiedad</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4 px-0">
              {/* Lo Permitido */}
              {rulesAllowed && rulesAllowed.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-base sm:text-lg text-green-700 dark:text-green-400 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Lo Permitido
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rulesAllowed.map((rule, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs sm:text-sm bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                      >
                        {rule}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Lo Prohibido */}
              {rulesProhibited && rulesProhibited.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-base sm:text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    Lo Prohibido
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rulesProhibited.map((rule, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs sm:text-sm bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                      >
                        {rule}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Detalles y Aclaraciones */}
              {houseRulesText && houseRulesText.trim() !== "" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                    Detalles y Aclaraciones
                  </h4>
                  <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                      {houseRulesText}
                    </p>
                  </div>
                </div>
              )}

              {(!rulesAllowed || rulesAllowed.length === 0) &&
                (!rulesProhibited || rulesProhibited.length === 0) &&
                !houseRulesText && (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                    <p className="text-sm">No hay reglas configuradas para esta propiedad.</p>
                  </div>
                )}
            </div>
            
            {/* Botón WhatsApp dentro del Dialog */}
            {hostPhone && (
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 px-0">
                <Button
                  onClick={handleOpenWhatsApp}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold transition-all text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  ¿Dudas o consultas? Comunícate con el host
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

