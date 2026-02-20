import { GUEST_LANGUAGES } from "@/db/schema";

export type Reservation = {
  id: number;
  propertyId: number | null;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  guestLanguage: string | null;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number | null;
  currency: string | null;
  platform: string;
  listingName: string | null;
  propertyName: string | null;
  propertySlug: string | null;
  notes: string | null;
  amountPaid: number | null;
};

export type GuestToken = {
  id: number;
  token: string;
  reservationId: number | null;
  expiresAt: Date;
  createdAt: Date | null;
  usedAt: Date | null;
};

export interface ReservationDetailCardProps {
  reservation: Reservation;
  lang: string;
  tokens: GuestToken[];
  propertyId?: number | null;
}

export const LANGUAGE_LABELS: Record<(typeof GUEST_LANGUAGES)[number], string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

