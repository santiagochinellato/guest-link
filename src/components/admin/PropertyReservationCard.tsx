"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, List, KeyRound, Check } from "lucide-react";
import { toast } from "sonner";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import type {
  PropertyOverview,
  ReservationOverviewItem,
  ReservationsOverviewByPropertyItem,
} from "@/lib/actions/reservations";

function formatDateSafe(dateStr: string | null | undefined): string {
  if (dateStr == null || dateStr === "") return "—";
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, "d MMM yyyy", { locale: es }) : dateStr;
  } catch {
    return dateStr ?? "—";
  }
}

function formatPrice(price: number | null, currency: string | null): string {
  if (price == null) return "—";
  const code = currency?.toUpperCase() || "EUR";
  try {
    return new Intl.NumberFormat("es", { style: "currency", currency: code }).format(price);
  } catch {
    return `${price} ${code}`;
  }
}

function ReservationLine({
  r,
  className = "",
}: {
  r: ReservationOverviewItem;
  className?: string;
}) {
  const { name, guestCountText } = parseGuestInfo(r.guestName);
  return (
    <div className={`text-gray-600 dark:text-gray-400 flex gap-2 items-center ${className}`}>
      <span className="inline-flex shrink-0" aria-label={r.platform}>
        {r.platform.toLowerCase() === "booking" ? (
          <Image src="/Booking.svg" alt="Booking" width={16} height={16} />
        ) : r.platform.toLowerCase() === "airbnb" ? (
          <Image src="/airbnb.svg" alt="Airbnb" width={16} height={16} />
        ) : (
          <span className="capitalize">{r.platform}</span>
        )}
      </span>
      <div className="font-bold text-brand-void dark:text-white text-gray-500">{name}</div>
      <div className=" opacity-90">

        <span className="font-bold opacity-90">{formatDateSafe(r.checkIn)} – {formatDateSafe(r.checkOut)}</span>
 
      </div>
      {guestCountText && (
        <div className="text-gray-500 dark:text-gray-400 opacity-90">{guestCountText}</div>
      )}
      {r.totalPrice != null && (
          <>
            <span className="text-green-700 font-bold dark:text-gray-400 opacity-90">{formatPrice(r.totalPrice, r.currency)}</span>
          </>
        )}
    </div>
  );
}

interface PropertyReservationCardProps {
  lang: string;
  item: ReservationsOverviewByPropertyItem;
}

export function PropertyReservationCard({ lang, item }: PropertyReservationCardProps) {
  const { property, currentReservation, nextReservation, nextReservations, platforms } = item;
  const hasAnyReservation = currentReservation ?? nextReservations.length > 0;
  const isSynced = hasAnyReservation;
  const [syncHovered, setSyncHovered] = useState(false);

  const handleSync = () => {
    toast.info("Sincronización no disponible en esta versión.");
  };

  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Foto propiedad */}
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[200px] bg-slate-100 dark:bg-slate-900">
          {property.coverImageUrl ? (
            <Image
              src={property.coverImageUrl}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              Sin imagen
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="md:col-span-2 flex flex-col p-4 md:p-5 gap-4">
          {/* Cabecera: nombre, dirección/slug, iconos */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-brand-void dark:text-white truncate">
                {property.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {property.address || property.slug || "—"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0" aria-label="Plataformas con reservas">
              {["booking", "airbnb"].map((p) => (
                <span
                  key={p}
                  className={platforms.includes(p as "booking" | "airbnb") ? "opacity-100" : "opacity-30"}
                  title={p === "booking" ? "Booking.com" : "Airbnb"}
                >
                  {p === "booking" ? (
                    <Image src="/Booking.svg" alt="Booking" width={20} height={20} />
                  ) : (
                    <Image src="/airbnb.svg" alt="Airbnb" width={20} height={20} />
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" asChild>
              <Link href={`/${lang}/dashboard/reservations/properties/${property.id}`}>
                <List className="w-4 h-4 mr-1.5" aria-hidden />
                Ver reservas
              </Link>
            </Button>
            {hasAnyReservation ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${lang}/dashboard/reservations/properties/${property.id}`}>
                  <KeyRound className="w-4 h-4 mr-1.5" aria-hidden />
                  Generar check-in
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled aria-label="Generar check-in (sin reservas)">
                <KeyRound className="w-4 h-4 mr-1.5" aria-hidden />
                Generar check-in
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              onMouseEnter={() => setSyncHovered(true)}
              onMouseLeave={() => setSyncHovered(false)}
              aria-label={isSynced && syncHovered ? "Volver a sincronizar" : isSynced ? "Sincronizado" : "Sincronizar"}
              className={isSynced && !syncHovered ? "border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : ""}
            >
              {isSynced && !syncHovered ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" aria-hidden />
                  Sincronizado
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden />
                  {isSynced && syncHovered ? "Volver a sincronizar" : "Sincronizar"}
                </>
              )}
            </Button>
          </div>

          {/* Reserva actual: bg verde muy claro, texto 14px */}
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-[14px]">
            <h4 className="font-semibold text-brand-void dark:text-white mb-1.5 text-[12px]">
              Reserva actual
            </h4>
            {currentReservation ? (
              <ReservationLine r={currentReservation} className="text-[12px]" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-[12px]">No hay reserva en curso.</p>
            )}
          </div>

          {/* Próxima reserva: bg amarillo suave, texto 12px */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-[12px]">
            <h4 className="font-semibold text-brand-void dark:text-white mb-1.5 text-[12px]">
              Próxima reserva
            </h4>
            {nextReservation ? (
              <ReservationLine r={nextReservation} className="text-[12px]" />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-[12px]">No hay próxima reserva.</p>
            )}
          </div>

          {/* Siguientes reservas: bg gris claro, texto 12px, todas juntas */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 p-3 text-[12px]">
            <h4 className="font-medium text-gray-600 dark:text-gray-300 mb-1.5 text-[12px]">
              Siguientes reservas
            </h4>
            {nextReservations.length > 0 ? (
              <ul className="space-y-2">
                {nextReservations.map((r) => (
                  <li key={r.id}>
                    <ReservationLine r={r} className="text-[12px]" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-[12px]">No hay más reservas.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
