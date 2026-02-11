"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { GuestViewModal } from "@/components/admin/GuestViewModal";
import { updateReservationNotes, updateReservationAmountPaid, updateReservationContact } from "@/lib/actions/reservations";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { GUEST_LANGUAGES } from "@/db/schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Header } from "./ReservationDetailCard/Header";
import { DatesCard } from "./ReservationDetailCard/DatesCard";
import { ContactCard } from "./ReservationDetailCard/ContactCard";
import { GuestActionsCard } from "./ReservationDetailCard/GuestActionsCard";
import { PaymentCard } from "./ReservationDetailCard/PaymentCard";
import { ActivityCard } from "./ReservationDetailCard/ActivityCard";
import { NotesCard } from "./ReservationDetailCard/NotesCard";
import { PropertyCard } from "./ReservationDetailCard/PropertyCard";
import { getNightsCount, isActiveNow } from "./ReservationDetailCard/helpers";
import type { ReservationDetailCardProps } from "./ReservationDetailCard/types";

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

  return (
    <div className="space-y-8">
      <Header
        reservation={reservation}
        guestName={guestName}
        guestCountText={guestCountText ?? undefined}
        active={active}
        backHref={backHref}
      />

      {/* Bento Grid */}
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
          "min-h-[calc(100vh-280px)] max-h-[900px]"
        )}
      >
        <DatesCard reservation={reservation} nights={nights} />

        <ContactCard
          guestName={guestName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          guestLanguage={guestLanguage}
          isSaving={isSavingContact}
          onBlur={handleContactBlur}
          onLanguageChange={(lang) => saveContact(email, phone, lang)}
        />

        <GuestActionsCard
          activeToken={activeToken}
          guestUrl={guestUrl}
          onOpenModal={() => setGuestModalOpen(true)}
        />

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

        <PaymentCard
          total={total}
          localAmountPaid={localAmountPaid}
          pending={pending}
          currency={currency}
          showPaymentInput={showPaymentInput}
          paymentInputValue={paymentInputValue}
          setPaymentInputValue={setPaymentInputValue}
          isUpdatingPayment={isUpdatingPayment}
          onShowInput={() => setShowPaymentInput(true)}
          onUpdatePayment={handleUpdatePayment}
        />

        <ActivityCard firstAccess={firstAccess} accessCount={accessCount} />

        <NotesCard
          notesValue={notesValue}
          setNotesValue={setNotesValue}
          showNotesEdit={showNotesEdit}
          setShowNotesEdit={setShowNotesEdit}
          isSavingNotes={isSavingNotes}
          onSave={handleSaveNotes}
        />

        <PropertyCard
          propertyName={reservation.propertyName}
          total={total}
          currency={currency}
        />
      </div>
    </div>
  );
}
