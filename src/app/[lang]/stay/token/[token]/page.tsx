import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { GuestView } from "@/components/guest/guest-view";
import { validateGuestToken } from "@/lib/actions/guest-tokens";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    lang: Locale;
    token: string;
  }>;
}

export default async function GuestTokenPage({ params }: PageProps) {
  const { lang, token } = await params;
  const dict = await getDictionary(lang);

  const result = await validateGuestToken(token);

  if (!result.success || !result.property) {
    return notFound();
  }

  // Debug: verificar qué fechas están llegando
  console.log("GuestTokenPage - Reservation data:", {
    hasReservation: !!result.reservation,
    checkIn: result.reservation?.checkIn,
    checkOut: result.reservation?.checkOut,
    checkInType: typeof result.reservation?.checkIn,
    checkOutType: typeof result.reservation?.checkOut,
  });

  const reservation = result.reservation?.checkIn && result.reservation?.checkOut
    ? { 
        checkIn: result.reservation.checkIn, 
        checkOut: result.reservation.checkOut,
        guestName: result.reservation.guestName || undefined
      }
    : undefined;

  console.log("GuestTokenPage - Reservation object to pass:", reservation);

  return (
    <GuestView
      property={result.property}
      dict={dict}
      reservation={reservation}
      guestName={result.reservation?.guestName || undefined}
    />
  );
}
