"use client";

import { cn } from "@/lib/utils";
import { Bus, Car, Plane, Star } from "lucide-react";

interface TransportCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  place: any;
  categoryType: string;
  className?: string;
}

export function TransportCard({
  place,
  categoryType,
  className,
}: TransportCardProps) {
  const isBus = categoryType === "bus" || categoryType === "transit";
  const isTaxi = categoryType === "taxi";
  const isTransfer = categoryType === "transfer";
  const isRental = categoryType === "rental";

  let Icon = Bus;
  if (isTaxi || isRental) Icon = Car;
  if (isTransfer) Icon = Plane;

  return (
    <div
      className={cn(
        "bg-white dark:bg-brand-void rounded-2xl p-3 md:p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 md:gap-4 w-full">
        {/* Left: Icon/Line Box */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm border",
              isBus
                ? "bg-[#1A73E8] border-[#1557B0]"
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400",
            )}
          >
            {isBus ? (
              <span className="text-white font-bold text-sm md:text-base text-center leading-tight">
                {place.title.replace("Línea", "").trim()}
              </span>
            ) : (
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </div>
          {/* Visual connector only for Bus */}
          {isBus && (
            <div className="w-0.5 flex-1 min-h-[2rem] bg-zinc-200 dark:bg-zinc-800 my-1 border-l border-dashed border-zinc-300 dark:border-zinc-700" />
          )}
        </div>

        <div className="space-y-3 pt-0.5 min-w-0 flex-1">
          {/* Content based on Transport Type */}
          {isBus ? (
            <>
              {/* Bus: Destination */}
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Hacia
                </p>
                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm md:text-base leading-tight break-words">
                  {place.description}
                </h4>
              </div>
              {/* Bus: Stop Location */}
              {place.formattedAddress && (
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Parada
                  </p>
                  <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                    {place.formattedAddress}
                  </p>
                </div>
              )}
              {/* Bus: Recommendation/Tips */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(place as any).extraInfo && (
                <div className="min-w-0 pt-1">
                  <p className="text-[10px] uppercase font-bold text-amber-500/80 tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Recomendación
                  </p>
                  <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(place as any).extraInfo}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Taxi/Transfer/Rental: Name is Headline */}
              <div className="min-w-0 pb-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  {place.title}
                </h3>
              </div>

              {/* Contact */}
              {place.phone && (
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Contacto
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                      {place.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Observations */}
              {place.description && (
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Observaciones
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {place.description}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
