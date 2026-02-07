"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Eye,
  LogIn,
  ChevronRight,
  Calendar,
  Users,
  ExternalLink,
  Building2,
  DollarSign,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestViewModal } from "./GuestViewModal";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { cn } from "@/lib/utils";

interface ReservationRow {
  id: number;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestLanguage?: string | null;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number | null;
  currency: string | null;
  platform: string;
  listingName: string | null;
  propertyName: string | null;
  propertySlug?: string | null;
}

interface ReservationsTableProps {
  reservations: ReservationRow[];
  tokenStatus?: Record<number, boolean>;
}

function safeDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return format(date, "dd MMM yyyy", { locale: es });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function getBookingUrl(platform: string, reservationCode: string): string | null {
  if (platform === "booking") {
    return `https://admin.booking.com/hotel/hoteladmin/reservation.html?res_id=${reservationCode}`;
  }
  if (platform === "airbnb") {
    return `https://www.airbnb.com/reservations/confirmation/${reservationCode}`;
  }
  return null;
}

export function ReservationsTable({ reservations, tokenStatus = {} }: ReservationsTableProps) {
  const [guestViewReservation, setGuestViewReservation] = useState<ReservationRow | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const lang = pathname?.split("/")[1] || "es";

  return (
    <>
      {/* Desktop: tabla moderna */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-void">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">
                Huésped
              </th>
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">
                Fechas
              </th>
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">
                Total
              </th>
              <th className="px-5 py-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                Estado
              </th>
              <th className="px-5 py-4 text-right font-semibold text-gray-600 dark:text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {reservations.length > 0 ? (
              reservations.map((res) => {
                const { name, guestCountText } = parseGuestInfo(res.guestName);
                const bookingUrl = getBookingUrl(res.platform, res.reservationCode);
                const hasToken = tokenStatus[res.id] ?? false;
                return (
                  <tr
                    key={res.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-brand-void-light/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {name}
                        </span>
                        {guestCountText && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {guestCountText}
                          </span>
                        )}
                        {bookingUrl ? (
                          <a
                            href={bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-brand-copper hover:underline inline-flex items-center gap-1 w-fit"
                          >
                            #{res.reservationCode}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-gray-500">#{res.reservationCode}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5 text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Calendar className="w-3.5 h-3.5" />
                          IN: {safeDate(res.checkIn)}
                        </span>
                        <span className="flex items-center gap-1.5 text-red-500/90 dark:text-red-400/90">
                          <Calendar className="w-3.5 h-3.5" />
                          OUT: {safeDate(res.checkOut)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900 dark:text-white font-mono">
                        {res.totalPrice} {res.currency || "USD"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                          res.status === "confirmed" &&
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                          res.status === "cancelled" &&
                            "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                          res.status === "pending" &&
                            "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        )}
                      >
                        {res.status === "confirmed" && "Confirmada"}
                        {res.status === "cancelled" && "Cancelada"}
                        {res.status === "pending" && "Pendiente"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setGuestViewReservation(res)}
                        >
                          {hasToken ? (
                            <>
                              <Check className="w-4 h-4" />
                              Link generado
                            </>
                          ) : (
                            <>
                              <LogIn className="w-4 h-4" />
                              Generar check-in
                            </>
                          )}
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="gap-1.5">
                          <Link href={`/${lang}/dashboard/reservations/${res.id}`}>
                            <Eye className="w-4 h-4" />
                            Ver detalles
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-gray-500">
                  <p className="font-medium">No se encontraron reservas</p>
                  <p className="text-sm mt-1">Sincroniza desde la extensión para ver datos aquí.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-4">
        {reservations.length > 0 ? (
          reservations.map((res) => {
            const { name, guestCountText } = parseGuestInfo(res.guestName);
            const bookingUrl = getBookingUrl(res.platform, res.reservationCode);
            const hasToken = tokenStatus[res.id] ?? false;
            return (
              <div
                key={res.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-void p-4 space-y-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                    {guestCountText && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {guestCountText}
                      </p>
                    )}
                    {bookingUrl ? (
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-brand-copper hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        #{res.reservationCode}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-xs font-mono text-gray-500 mt-1">#{res.reservationCode}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
                      res.status === "confirmed" &&
                        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30",
                      res.status === "cancelled" && "bg-red-50 text-red-700 dark:bg-red-900/30",
                      res.status === "pending" && "bg-amber-50 text-amber-700 dark:bg-amber-900/30"
                    )}
                  >
                    {res.status === "confirmed" && "Confirmada"}
                    {res.status === "cancelled" && "Cancelada"}
                    {res.status === "pending" && "Pendiente"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-4 h-4" />
                    <span>IN: {safeDate(res.checkIn)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-500/90 dark:text-red-400/90">
                    <Calendar className="w-4 h-4" />
                    <span>OUT: {safeDate(res.checkOut)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{res.listingName || res.propertyName || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span>{res.totalPrice} {res.currency}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setGuestViewReservation(res)}
                  >
                    {hasToken ? (
                      <>
                        <Check className="w-4 h-4" />
                        Link generado
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Generar check-in
                      </>
                    )}
                  </Button>
                  <Button asChild variant="default" size="sm" className="flex-1 gap-2">
                    <Link href={`/${lang}/dashboard/reservations/${res.id}`}>
                      Ver detalles
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center text-gray-500">
            <p className="font-medium">No se encontraron reservas</p>
            <p className="text-sm mt-1">Sincroniza desde la extensión para ver datos aquí.</p>
          </div>
        )}
      </div>

      {guestViewReservation && (
        <GuestViewModal
          open={!!guestViewReservation}
          onOpenChange={(open) => !open && setGuestViewReservation(null)}
          reservation={{
            ...guestViewReservation,
            propertySlug: (guestViewReservation as ReservationRow & { propertySlug?: string }).propertySlug,
          }}
          lang={(guestViewReservation.guestLanguage as "es" | "en" | "pt") || "es"}
          hasToken={tokenStatus[guestViewReservation.id]}
          onTokenGenerated={() => router.refresh()}
        />
      )}
    </>
  );
}
