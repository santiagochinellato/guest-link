export type GuestViewReservation = {
  id: number;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  /** Idioma del huésped: es, en, pt. Define idioma de mensajes y pantalla guía */
  guestLanguage?: string | null;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  propertyName?: string | null;
  propertySlug?: string | null;
};

export interface GuestViewModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "modal" | "inline";
  reservation: GuestViewReservation;
  lang?: string;
  /** Token existente (cuando el padre ya lo tiene, ej. ReservationDetailCard) */
  existingToken?: { token: string; expiresAt: Date } | null;
  /** Si la reserva tiene token pero no lo pasamos; el modal lo cargará al abrir */
  hasToken?: boolean;
  /** Se llama cuando se genera o regenera un token, para refrescar el padre */
  onTokenGenerated?: () => void;
}

