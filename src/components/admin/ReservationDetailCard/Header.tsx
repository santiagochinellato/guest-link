"use client";

import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import type { Reservation } from "./types";
import { getBookingAdminUrl } from "./helpers";

interface HeaderProps {
  reservation: Reservation;
  guestName: string;
  guestCountText?: string;
  active: boolean;
  backHref: string;
}

export function Header({
  reservation,
  guestName,
  guestCountText,
  active,
  backHref,
}: HeaderProps) {
  const platformLabel =
    reservation.platform === "booking"
      ? "Booking.com"
      : reservation.platform === "airbnb"
        ? "Airbnb"
        : reservation.platform;

  const platformUrl =
    reservation.platform === "booking"
      ? getBookingAdminUrl(reservation.reservationCode)
      : null;

  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
            {guestName}
          </h1>
          {guestCountText && (
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {guestCountText}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {active && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Activa ahora
            </div>
          )}
          {platformUrl ? (
            <a
              href={platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#003580] hover:bg-[#002855] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {platformLabel}
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {platformLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

