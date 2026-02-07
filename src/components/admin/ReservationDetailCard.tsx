"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  Mail,
  Phone,
  KeyRound,
  Link2,
  QrCode,
  DollarSign,
  Activity,
  PenLine,
  ExternalLink,
  Languages,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuestViewModal } from "@/components/admin/GuestViewModal";
import { updateReservationNotes, updateReservationAmountPaid, updateReservationContact } from "@/lib/actions/reservations";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { GUEST_LANGUAGES } from "@/db/schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LANGUAGE_LABELS: Record<(typeof GUEST_LANGUAGES)[number], string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

type Reservation = {
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

type GuestToken = {
  id: number;
  token: string;
  reservationId: number;
  expiresAt: Date;
  createdAt: Date;
  usedAt: Date | null;
};

interface ReservationDetailCardProps {
  reservation: Reservation;
  lang: string;
  tokens: GuestToken[];
  propertyId?: number | null;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getNightsCount(checkIn: string, checkOut: string): number {
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

function getBookingAdminUrl(reservationCode: string): string {
  return `https://admin.booking.com/hotel/hoteladmin/reservation.html?res_id=${reservationCode}`;
}

function isActiveNow(checkIn: string, checkOut: string, status: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return (
    status === "confirmed" &&
    checkIn <= today &&
    checkOut >= today
  );
}

export function ReservationDetailCard({
  reservation,
  lang,
  tokens,
  propertyId = null,
}: ReservationDetailCardProps) {
  const { name: guestName, guestCountText } = parseGuestInfo(reservation.guestName);
  const total = reservation.totalPrice ?? 0;
  const paid = reservation.amountPaid ?? 0;
  const pending = total - paid;
  const currency = reservation.currency ?? "USD";
  const nights = getNightsCount(reservation.checkIn, reservation.checkOut);
  const active = isActiveNow(reservation.checkIn, reservation.checkOut, reservation.status);

  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentInputValue, setPaymentInputValue] = useState("");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [localAmountPaid, setLocalAmountPaid] = useState(paid);

  const [showNotesEdit, setShowNotesEdit] = useState(false);
  const [notesValue, setNotesValue] = useState(reservation.notes ?? "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState(reservation.guestEmail ?? "");
  const [phone, setPhone] = useState(reservation.guestPhone ?? "");
  const guestLang = (reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number]))
    ? (reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
    : "es";
  const [guestLanguage, setGuestLanguage] = useState<(typeof GUEST_LANGUAGES)[number]>(guestLang);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const contactTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveContact = useCallback(
    async (newEmail: string, newPhone: string, newLang?: (typeof GUEST_LANGUAGES)[number]) => {
      const emailChanged = newEmail.trim() !== (reservation.guestEmail ?? "").trim();
      const phoneChanged = newPhone.trim() !== (reservation.guestPhone ?? "").trim();
      const langToUse = newLang ?? guestLanguage;
      const langChanged = langToUse !== (reservation.guestLanguage ?? "es");
      if (!emailChanged && !phoneChanged && !langChanged) return;
      setIsSavingContact(true);
      const result = await updateReservationContact(reservation.id, {
        guestEmail: newEmail.trim() || undefined,
        guestPhone: newPhone.trim() || undefined,
        guestLanguage: langToUse,
      });
      setIsSavingContact(false);
      if (result.success) {
        toast.success("Contacto guardado");
        if (newLang) setGuestLanguage(newLang);
      } else {
        toast.error(result.error ?? "Error al guardar");
      }
    },
    [reservation.id, reservation.guestEmail, reservation.guestPhone, reservation.guestLanguage, guestLanguage]
  );

  useEffect(() => {
    if (contactTimeoutRef.current) clearTimeout(contactTimeoutRef.current);
    contactTimeoutRef.current = setTimeout(() => {
      contactTimeoutRef.current = null;
      saveContact(email, phone);
    }, 600);
    return () => {
      if (contactTimeoutRef.current) clearTimeout(contactTimeoutRef.current);
    };
  }, [email, phone, saveContact]);

  const handleContactBlur = useCallback(() => {
    if (contactTimeoutRef.current) {
      clearTimeout(contactTimeoutRef.current);
      contactTimeoutRef.current = null;
    }
    saveContact(email, phone);
  }, [email, phone, saveContact]);

  const handleUpdatePayment = async () => {
    const amount = parseFloat(paymentInputValue) || 0;
    setIsUpdatingPayment(true);
    const result = await updateReservationAmountPaid(reservation.id, amount);
    setIsUpdatingPayment(false);
    if (result.success) {
      setLocalAmountPaid(amount);
      setShowPaymentInput(false);
      setPaymentInputValue("");
      toast.success("Pago actualizado");
    } else {
      toast.error(result.error ?? "Error al actualizar");
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const result = await updateReservationNotes(reservation.id, notesValue.trim() || null);
    setIsSavingNotes(false);
    if (result.success) {
      setShowNotesEdit(false);
      toast.success("Notas guardadas");
    } else {
      toast.error(result.error ?? "Error al guardar");
    }
  };

  const now = new Date();
  const activeTokens = tokens.filter((t) => new Date(t.expiresAt) > now);
  const activeToken = activeTokens.length > 0 ? activeTokens[activeTokens.length - 1] : null;

  const tokensWithAccess = tokens.filter((t) => t.usedAt);
  const firstAccess =
    tokensWithAccess.length > 0
      ? tokensWithAccess
          .map((t) => t.usedAt!)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
      : null;
  const accessCount = tokensWithAccess.length;

  const guestLocale = guestLanguage;
  const guestUrl = activeToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${guestLocale}/stay/token/${activeToken.token}`
    : null;

  const backHref = propertyId
    ? `/${lang}/dashboard/reservations/properties/${propertyId}`
    : `/${lang}/dashboard/reservations`;

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
    <div className="space-y-8">
      {/* Header */}
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

      {/* Bento Grid */}
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
          "min-h-[calc(100vh-280px)] max-h-[900px]"
        )}
      >
        {/* Dates Card - col-span-2 */}
        <div
          className={cn(
            "xl:col-span-2 rounded-2xl p-6 flex flex-col",
            "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
            "border border-white/50 dark:border-slate-800",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div className="flex-1 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6 w-fit">
              <Calendar className="w-4 h-4" />
              {nights} {nights === 1 ? "noche" : "noches"}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Check-in
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatDate(reservation.checkIn)}
                </p>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Check-out
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatDate(reservation.checkOut)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
              ID: #{reservation.reservationCode}
            </p>
          </div>
        </div>

        {/* Contact Card */}
        <div
          className={cn(
            "rounded-2xl p-6 flex flex-col",
            "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
            "border border-white/50 dark:border-slate-800",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {guestName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Contacto</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Información del huésped
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Email</p>
                <input
                  type="email"
                  placeholder="huésped@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleContactBlur}
                  className="w-full h-8 text-sm font-medium bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Teléfono</p>
                <input
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={handleContactBlur}
                  className="w-full h-8 text-sm font-medium bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
                <Languages className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Idioma del huésped</p>
                <Select
                  value={guestLanguage}
                  onValueChange={(v) => saveContact(email, phone, v as (typeof GUEST_LANGUAGES)[number])}
                >
                  <SelectTrigger className="h-8 border-slate-200 dark:border-slate-600 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GUEST_LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {LANGUAGE_LABELS[l]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Mensajes y pantalla de la guía
                </p>
              </div>
            </div>
          </div>
          {isSavingContact && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Guardando...</p>
          )}
        </div>

        {/* Guest Actions Card */}
        <div
          className={cn(
            "rounded-2xl p-6 flex flex-col justify-between",
            "bg-gradient-to-br from-orange-500 to-pink-500 text-white",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div>
            <KeyRound className="w-10 h-10 mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-1">Vista del huésped</h3>
            <p className="text-sm opacity-90">Gestiona el acceso a la guía digital</p>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Button
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white"
              onClick={() => setGuestModalOpen(true)}
            >
              {activeToken ? (
                <>
                  <Check className="w-4 h-4" />
                  Link generado
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Generar link
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {guestUrl ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white"
                    asChild
                  >
                    <a href={guestUrl} target="_blank" rel="noopener noreferrer">
                      <Link2 className="w-4 h-4" />
                      Guía
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white"
                    asChild
                  >
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <QrCode className="w-4 h-4" />
                      QR
                    </a>
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="col-span-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white"
                  onClick={() => setGuestModalOpen(true)}
                >
                  <KeyRound className="w-4 h-4" />
                  Generar link primero
                </Button>
              )}
            </div>
          </div>
        </div>

        <GuestViewModal
          open={guestModalOpen}
          onOpenChange={setGuestModalOpen}
          variant="modal"
          reservation={{
            id: reservation.id,
            guestName: reservation.guestName,
            guestEmail: reservation.guestEmail,
            guestPhone: reservation.guestPhone,
            guestLanguage: guestLanguage,
            reservationCode: reservation.reservationCode,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            propertyName: reservation.propertyName,
            propertySlug: reservation.propertySlug,
          }}
          lang={guestLanguage}
          existingToken={activeToken ? { token: activeToken.token, expiresAt: activeToken.expiresAt } : undefined}
          onTokenGenerated={() => router.refresh()}
        />

        {/* Payment Card - row-span-2 */}
        <div
          className={cn(
            "xl:row-span-2 rounded-2xl p-6 flex flex-col",
            "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
            "border border-white/50 dark:border-slate-800",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pagos</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Total reserva
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {total} <span className="text-lg font-normal text-slate-500">{currency}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 border border-emerald-200 dark:border-emerald-700">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Pagado
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {localAmountPaid} <span className="text-lg font-normal text-emerald-600 dark:text-emerald-500">{currency}</span>
              </p>
              {localAmountPaid > 0 && total > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (localAmountPaid / total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border border-amber-200 dark:border-amber-700">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                Pendiente
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {pending} <span className="text-lg font-normal text-amber-600 dark:text-amber-500">{currency}</span>
              </p>
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-700">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
              Actualizar monto pagado
            </label>
            {showPaymentInput ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={paymentInputValue}
                  onChange={(e) => setPaymentInputValue(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  size="sm"
                  onClick={handleUpdatePayment}
                  disabled={isUpdatingPayment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingPayment ? "..." : "Actualizar"}
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                onClick={() => setShowPaymentInput(true)}
              >
                {localAmountPaid > 0 ? `${localAmountPaid} ${currency}` : "Registrar pago"}
              </Button>
            )}
          </div>
        </div>

        {/* Activity Card - col-span-2 */}
        <div
          className={cn(
            "xl:col-span-2 rounded-2xl p-6 flex flex-col",
            "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
            "border border-white/50 dark:border-slate-800",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Actividad en la app
            </h3>
          </div>

          {firstAccess || accessCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {firstAccess && (
                <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Primera visita</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {new Date(firstAccess).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800">
                <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Accesos a la guía</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {accessCount} {accessCount === 1 ? "vez" : "veces"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Sin actividad todavía
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                El huésped aún no ha accedido a la guía digital
              </p>
            </div>
          )}
        </div>

        {/* Notes Card - col-span-2 */}
        <div
          className={cn(
            "xl:col-span-2 rounded-2xl p-6 flex flex-col",
            "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
            "border border-white/50 dark:border-slate-800",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div className="flex items-center gap-2 mb-6">
            <PenLine className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Anotaciones</h3>
          </div>

          <div className="flex-1 flex flex-col">
            {showNotesEdit ? (
              <div className="space-y-3">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Escribe notas sobre esta reserva..."
                  className="flex-1 min-h-[120px] w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSavingNotes ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNotesEdit(true)}
                className={cn(
                  "flex-1 min-h-[120px] w-full px-4 py-3 rounded-xl text-left",
                  "border-2 border-dashed border-slate-200 dark:border-slate-600",
                  "bg-slate-50 dark:bg-slate-800/50",
                  "hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all"
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    notesValue.trim()
                      ? "text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {notesValue.trim() || "Haz clic para agregar notas..."}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Property Card */}
        <div
          className={cn(
            "rounded-2xl p-6 flex flex-col justify-between",
            "bg-gradient-to-br from-slate-800 to-slate-900 text-white",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          )}
        >
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Propiedad</p>
            <h3 className="text-xl font-bold">
              {reservation.propertyName ?? "Sin propiedad"}
            </h3>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-4" />

          <div className="flex justify-between items-baseline">
            <span className="text-xs font-medium text-slate-400">Total</span>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                {total}
              </span>
              <span className="text-lg text-slate-400 ml-1">{currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
