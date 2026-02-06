import { notFound } from "next/navigation";
import { getReservationById } from "@/lib/actions/reservations";
import { getReservationTokens } from "@/lib/actions/guest-tokens";
import { ReservationDetailCard } from "@/components/admin/ReservationDetailCard";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const reservationId = parseInt(id, 10);
  if (isNaN(reservationId)) notFound();

  const [result, tokensResult] = await Promise.all([
    getReservationById(reservationId),
    getReservationTokens(reservationId),
  ]);

  if (!result.success || !result.data) notFound();

  const reservation = result.data;
  const tokens = tokensResult.success ? tokensResult.tokens : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-100 dark:from-brand-void dark:via-brand-void-light dark:to-brand-void p-6 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <ReservationDetailCard
          reservation={reservation}
          lang={lang}
          tokens={tokens}
          propertyId={reservation.propertyId}
        />
      </div>
    </div>
  );
}
