"use client";

import { useState, useCallback } from "react";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { GUEST_LANGUAGES } from "@/db/schema";
import {
  updateReservationContact,
  updateReservationNotes,
  updateReservationPayment,
} from "@/lib/actions/reservations";
import { toast } from "sonner";
import type { ReservationDetailCardProps, Reservation, GuestToken } from "./types";
import { getNightsCount, isActiveNow } from "./helpers";
import { Header } from "./Header";
import { DatesCard } from "./DatesCard";
import { PropertyCard } from "./PropertyCard";
import { ContactCard } from "./ContactCard";
import { NotesCard } from "./NotesCard";
import { PaymentCard } from "./PaymentCard";
import { ActivityCard } from "./ActivityCard";

function getActivityFromTokens(tokens: GuestToken[]): { firstAccess: Date | null; accessCount: number } {
  const withUsed = tokens.filter((t) => t.usedAt != null);
  if (withUsed.length === 0) return { firstAccess: null, accessCount: 0 };
  const first = withUsed.reduce(
    (min, t) => (!t.usedAt ? min : min == null || t.usedAt < min ? t.usedAt : min),
    null as Date | null
  );
  return { firstAccess: first, accessCount: withUsed.length };
}

export function ReservationDetailCard({
  reservation,
  lang,
  tokens,
  propertyId,
}: ReservationDetailCardProps) {
  const { name: guestName, guestCountText } = parseGuestInfo(reservation.guestName);
  const nights = getNightsCount(reservation.checkIn, reservation.checkOut);
  const active = isActiveNow(reservation.checkIn, reservation.checkOut, reservation.status);
  const backHref = `/${lang}/dashboard`;

  const [email, setEmail] = useState(reservation.guestEmail || "");
  const [phone, setPhone] = useState(reservation.guestPhone || "");
  const [guestLanguage, setGuestLanguage] = useState<(typeof GUEST_LANGUAGES)[number]>(
    reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
      ? (reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
      : "es"
  );
  const [isSavingContact, setIsSavingContact] = useState(false);

  const [notesValue, setNotesValue] = useState(reservation.notes || "");
  const [showNotesEdit, setShowNotesEdit] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [localAmountPaid, setLocalAmountPaid] = useState(reservation.amountPaid ?? 0);
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentInputValue, setPaymentInputValue] = useState(String(reservation.amountPaid ?? ""));
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const saveContact = useCallback(async () => {
    setIsSavingContact(true);
    try {
      const result = await updateReservationContact(reservation.id, {
        guestEmail: email || undefined,
        guestPhone: phone || undefined,
        guestLanguage,
      });
      if (result.success) toast.success("Contacto actualizado");
      else toast.error(result.error || "Error al guardar");
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsSavingContact(false);
    }
  }, [reservation.id, email, phone, guestLanguage]);

  const saveNotes = useCallback(async () => {
    setIsSavingNotes(true);
    try {
      const result = await updateReservationNotes(reservation.id, notesValue);
      if (result.success) {
        toast.success("Notas guardadas");
        setShowNotesEdit(false);
      } else toast.error(result.error || "Error al guardar");
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsSavingNotes(false);
    }
  }, [reservation.id, notesValue]);

  const updatePayment = useCallback(async () => {
    const value = parseFloat(paymentInputValue);
    const amount = isNaN(value) ? 0 : value;
    setIsUpdatingPayment(true);
    try {
      const result = await updateReservationPayment(reservation.id, amount);
      if (result.success) {
        setLocalAmountPaid(amount);
        setShowPaymentInput(false);
        setPaymentInputValue(String(amount));
        toast.success("Pago actualizado");
      } else toast.error(result.error || "Error al actualizar");
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsUpdatingPayment(false);
    }
  }, [reservation.id, paymentInputValue]);

  const total = reservation.totalPrice ?? 0;
  const currency = reservation.currency ?? "";
  const pending = Math.max(0, total - localAmountPaid);
  const { firstAccess, accessCount } = getActivityFromTokens(tokens);

  return (
    <div className="space-y-6">
      <Header
        reservation={reservation}
        guestName={guestName}
        guestCountText={guestCountText ?? undefined}
        active={active}
        backHref={backHref}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <DatesCard reservation={reservation} nights={nights} />

        <PropertyCard
          propertyName={reservation.propertyName ?? reservation.listingName}
          total={total}
          currency={currency}
        />

        <ContactCard
          guestName={guestName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          guestLanguage={guestLanguage}
          isSaving={isSavingContact}
          onBlur={saveContact}
          onLanguageChange={(l) => {
            setGuestLanguage(l);
            updateReservationContact(reservation.id, { guestLanguage: l }).then((r) => {
              if (r.success) toast.success("Idioma actualizado");
            });
          }}
        />

        <ActivityCard firstAccess={firstAccess} accessCount={accessCount} />

        <NotesCard
          notesValue={notesValue}
          setNotesValue={setNotesValue}
          showNotesEdit={showNotesEdit}
          setShowNotesEdit={setShowNotesEdit}
          isSavingNotes={isSavingNotes}
          onSave={saveNotes}
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
          onUpdatePayment={updatePayment}
        />
      </div>
    </div>
  );
}
