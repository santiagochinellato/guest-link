"use client";

import { useState } from "react";
import { ReservationsTable } from "./ReservationsTable";
import { ReservationsCalendar } from "./ReservationsCalendar";
import { ReservationsViewToggle } from "./ReservationsViewToggle";

interface Reservation {
  id: number;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number | null;
  currency: string | null;
  platform: string;
  listingName: string | null;
  propertyName: string | null;
}

interface ReservationsViewProps {
  reservations: Reservation[];
}

export function ReservationsView({ reservations }: ReservationsViewProps) {
  const [view, setView] = useState<"table" | "calendar">("table");

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <ReservationsViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Conditional Rendering */}
      {view === "table" ? (
        <div className="bg-white dark:bg-brand-void border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <ReservationsTable reservations={reservations} />
        </div>
      ) : (
        <ReservationsCalendar reservations={reservations} />
      )}
    </div>
  );
}
