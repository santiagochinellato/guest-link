"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO, isValid, differenceInDays } from "date-fns";
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

function daysRemaining(checkOut: string): number | null {
  try {
    const d = parseISO(checkOut);
    if (!isValid(d)) return null;
    const diff = differenceInDays(d, new Date());
    return diff >= 0 ? diff : null;
  } catch {
    return null;
  }
}

function ReservationLine({
  r,
}: {
  r: ReservationOverviewItem;
}) {
  const { name, guestCountText } = parseGuestInfo(r.guestName);
  const platformIcon =
    r.platform.toLowerCase() === "booking" ? (
      <Image src="/Booking.svg" alt="Booking" width={14} height={14} />
    ) : r.platform.toLowerCase() === "airbnb" ? (
      <Image src="/airbnb.svg" alt="Airbnb" width={14} height={14} />
    ) : (
      <span className="text-[10px] capitalize text-gray-400">{r.platform}</span>
    );

  return (
    <div className="flex flex-col gap-0.5">
      {/* Fila 1: plataforma + nombre + precio */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex shrink-0" aria-label={r.platform}>{platformIcon}</span>
          <span className="font-semibold text-brand-void dark:text-white text-[12px] truncate">
            {name}
          </span>
          {guestCountText && (
            <span className="text-[11px] text-gray-400 shrink-0 hidden sm:inline">
              · {guestCountText}
            </span>
          )}
        </div>
        {r.totalPrice != null && (
          <span className="text-green-700 dark:text-green-400 font-semibold text-[11px] shrink-0">
            {formatPrice(r.totalPrice, r.currency)}
          </span>
        )}
      </div>
      {/* Fila 2: fechas + huéspedes (en mobile) */}
      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span>{formatDateSafe(r.checkIn)} – {formatDateSafe(r.checkOut)}</span>
        {guestCountText && (
          <span className="sm:hidden">· {guestCountText}</span>
        )}
      </div>
    </div>
  );
}

interface PropertyReservationCardProps {
  lang: string;
  item: ReservationsOverviewByPropertyItem;
}

export function PropertyReservationCard({ lang, item }: PropertyReservationCardProps) {
  const { property, currentReservation, nextReservation, nextReservations, platforms } = item;
  const hasAnyReservation = !!(currentReservation ?? nextReservations.length > 0);
  const isSynced = hasAnyReservation;
  const [syncHovered, setSyncHovered] = useState(false);

  const handleSync = () => {
    toast.info("Sincronización no disponible en esta versión.");
  };

  const hasNoReservations =
    !currentReservation && !nextReservation && nextReservations.length === 0;

  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-slate-100 dark:md:divide-slate-800">
        {/* Foto propiedad */}
        <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[220px] bg-slate-100 dark:bg-slate-900">
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
        <div className="md:col-span-2 flex flex-col p-4 gap-3">
          {/* Cabecera */}
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
              <Button
                variant="outline"
                size="sm"
                disabled
                aria-label="Generar check-in (sin reservas)"
                title="Disponible cuando hay una reserva confirmada"
              >
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

          {hasNoReservations ? (
            /* Estado vacío unificado */
            <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Sin reservas próximas</p>
              <p className="text-xs text-gray-400">
                Sincroniza con Booking o Airbnb para ver tus reservas aquí.
              </p>
            </div>
          ) : (
            <>
              {/* Reserva actual */}
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2.5">
                <h4 className="font-semibold text-brand-void dark:text-white mb-1.5 text-[11px] uppercase tracking-wide">
                  Reserva actual
                </h4>
                {currentReservation ? (
                  <>
                    <ReservationLine r={currentReservation} />
                    {daysRemaining(currentReservation.checkOut) !== null && (
                      <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                        Quedan {daysRemaining(currentReservation.checkOut)} noche(s)
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-[12px]">No hay reserva en curso.</p>
                )}
              </div>

              {/* Próxima reserva */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5">
                <h4 className="font-semibold text-brand-void dark:text-white mb-1.5 text-[11px] uppercase tracking-wide">
                  Próxima reserva
                </h4>
                {nextReservation ? (
                  <ReservationLine r={nextReservation} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-[12px]">No hay próxima reserva.</p>
                )}
              </div>

              {/* Siguientes reservas */}
              {nextReservations.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5">
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-2 text-[11px] uppercase tracking-wide">
                    Siguientes reservas
                  </h4>
                  <ul className="space-y-2.5">
                    {nextReservations.map((r) => (
                      <li key={r.id}>
                        <ReservationLine r={r} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
