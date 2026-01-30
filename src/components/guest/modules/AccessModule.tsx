"use client";

import { useState } from "react";
import {
  KeyRound,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  Car,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AccessModuleProps {
  accessCode?: string;
  accessSteps?: { text: string }[];
  accessInstructions?: string;
  location?: { lat?: string; lng?: string; address?: string };
  parkingDetails?: string;
}

export function AccessModule({
  accessCode,
  accessSteps = [],
  accessInstructions,
  location,
  parkingDetails,
}: AccessModuleProps) {
  const [isOpen, setIsOpen] = useState(true); // Default open for visibility as it's at bottom

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pl-1">
        <MapPin className="w-5 h-5 text-brand-void dark:text-white" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Cómo llegar e Ingresar
        </h3>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-6">
        {/* 1. GOOGLE MAPS BUTTON (Prominent) */}
        {location && (location.lat || location.address) && (
          <Button
            className="w-full rounded-xl bg-brand-void dark:bg-white text-white dark:text-brand-void hover:bg-brand-void/90 dark:hover:bg-white/90 shadow-md h-12 font-bold"
            onClick={() => {
              const query =
                location.lat && location.lng
                  ? `${location.lat},${location.lng}`
                  : location.address;
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "")}`,
                "_blank",
              );
            }}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Abrir en Google Maps
          </Button>
        )}

        {/* 2. ACCESS CODE CARD */}
        {accessCode && (
          <div className="relative bg-[#f8f9fa] dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 overflow-hidden">
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white dark:bg-neutral-900 rounded-full border-r border-slate-300 dark:border-white/10" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white dark:bg-neutral-900 rounded-full border-l border-slate-300 dark:border-white/10" />

            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Código de Acceso
            </span>
            <div className="text-4xl font-black font-mono tracking-widest text-brand-void dark:text-white">
              {accessCode}
            </div>
          </div>
        )}

        {/* 3. INSTRUCTIONS / STEPS */}
        {(accessSteps.length > 0 || accessInstructions || parkingDetails) && (
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Indicaciones
            </h4>

            {/* Parking if exists */}
            {parkingDetails && (
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 text-sm text-blue-900 dark:text-blue-100">
                <Car className="w-5 h-5 shrink-0" />
                <p>{parkingDetails}</p>
              </div>
            )}

            {/* Steps Timeline */}
            {accessSteps.length > 0 && (
              <div className="flex flex-col gap-0 pl-2 border-l-2 border-slate-100 dark:border-neutral-800 ml-2">
                {accessSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 pb-6 last:pb-0 relative pl-6"
                  >
                    {/* Dot */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 border-2 border-brand-copper box-content" />

                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed -mt-1">
                      {step.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Extra Instructions / Considerations */}
            {accessInstructions && (
              <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl mt-4">
                <Info className="w-5 h-5 shrink-0 text-slate-400" />
                <p>{accessInstructions}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
