"use client";

import Image from "next/image";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, List, KeyRound } from "lucide-react";
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

function ReservationLine({ r }: { r: ReservationOverviewItem }) {
  const { name, guestCountText } = parseGuestInfo(r.guestName);
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <div className="font-medium text-brand-void dark:text-white">{name}</div>
      {guestCountText && (
        <div className="text-xs text-gray-500 dark:text-gray-400">{guestCountText}</div>
      )}
      <div className="mt-0.5">
        <span className="capitalize">{r.platform}</span>
        <span className="mx-1">·</span>
        <span>{formatDateSafe(r.checkIn)} – {formatDateSafe(r.checkOut)}</span>
        {r.totalPrice != null && (
          <>
            <span className="mx-1">·</span>
            <span>{formatPrice(r.totalPrice, r.currency)}</span>
          </>
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
  const hasAnyReservation = currentReservation ?? nextReservations.length > 0;

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
            <Button variant="outline" size="sm" onClick={handleSync} aria-label="Sincronizar">
              <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden />
              Sincronizar
            </Button>
          </div>

          {/* Reserva actual */}
          <div>
            <h4 className="text-base font-semibold text-brand-void dark:text-white mb-1">
              Reserva actual
            </h4>
            {currentReservation ? (
              <ReservationLine r={currentReservation} />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay reserva en curso.</p>
            )}
          </div>

          {/* Próxima reserva */}
          <div>
            <h4 className="text-sm font-semibold text-brand-void dark:text-white mb-1">
              Próxima reserva
            </h4>
            {nextReservation ? (
              <ReservationLine r={nextReservation} />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay próxima reserva.</p>
            )}
          </div>

          {/* Siguientes reservas */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Siguientes reservas
            </h4>
            {nextReservations.length > 0 ? (
              <ul className="space-y-1">
                {nextReservations.map((r) => (
                  <li key={r.id}>
                    <ReservationLine r={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">No hay más reservas.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
