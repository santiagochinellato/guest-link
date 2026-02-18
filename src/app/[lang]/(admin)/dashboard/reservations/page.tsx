import Link from "next/link";
import { getReservations, getReservationsOverviewByProperty } from "@/lib/actions/reservations";
import { PropertyReservationCard } from "@/components/admin/PropertyReservationCard";
import { ReservationsCalendar } from "@/components/admin/ReservationsCalendar";
import { UpcomingReservations } from "@/components/admin/UpcomingReservations";
import { ExportReservationsButton } from "@/components/admin/ExportReservationsButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";

function formatDateSafe(dateStr: string | null | undefined): string {
  if (dateStr == null || dateStr === "") return "—";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return isValid(d) ? format(d, "d MMM", { locale: es }) : dateStr;
  } catch {
    return dateStr ?? "—";
  }
}

export const dynamic = "force-dynamic";

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const [overviewResult, reservationsResult] = await Promise.all([
    getReservationsOverviewByProperty(),
    getReservations(),
  ]);

  const rawOverview = overviewResult.success ? overviewResult.data : [];
  const overviewItems = [...rawOverview].sort((a, b) => {
    const hasReservationsA = !!a.currentReservation || a.nextReservations.length > 0;
    const hasReservationsB = !!b.currentReservation || b.nextReservations.length > 0;
    if (hasReservationsA && !hasReservationsB) return -1;
    if (!hasReservationsA && hasReservationsB) return 1;
    if (!hasReservationsA && !hasReservationsB) return a.property.name.localeCompare(b.property.name);
    const soonestA = a.currentReservation ? "" : (a.nextReservation?.checkIn ?? "z");
    const soonestB = b.currentReservation ? "" : (b.nextReservation?.checkIn ?? "z");
    return soonestA.localeCompare(soonestB);
  });
  const reservations = reservationsResult.success ? reservationsResult.data : [];

  return (
    <div className="space-y-8 px-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          <p className="text-white dark:text-white">
            Próximas reservas, tus propiedades y calendario.
          </p>
        </div>
        <ExportReservationsButton />
      </div>



      {/* Tus propiedades: una card por propiedad (plan) */}
      <section aria-labelledby="properties-heading">
        {overviewItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No tienes propiedades. Crea una desde el dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {overviewItems.map((item) => (
              <PropertyReservationCard key={item.property.id} lang={lang} item={item} />
            ))}
          </div>
        )}
      </section>

            {/* Próximas reservas: visible como se planeó */}
            <section aria-labelledby="upcoming-heading w-full">
        <h2 id="upcoming-heading" className="sr-only">
          Próximas reservas
        </h2>
        <UpcomingReservations reservations={reservations} lang={lang} />
      </section>

      {/* Calendario */}
      {/* <ReservationsCalendar reservations={reservations} /> */}

      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Todas las reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No hay reservas.
            </p>
          ) : (
            <div className="space-y-2">
              {reservations.map((res) => (
                <Link
                  key={res.id}
                  href={`/${lang}/dashboard/reservations/${res.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-brand-void dark:text-white truncate">
                      {res.guestName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {res.propertyName ?? "—"} · {res.reservationCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDateSafe(res.checkIn)} – {formatDateSafe(res.checkOut)}
                    </span>
                    <Badge
                      variant={
                        res.status === "confirmed"
                          ? "default"
                          : res.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {res.status === "confirmed"
                        ? "Confirmada"
                        : res.status === "cancelled"
                          ? "Cancelada"
                          : "Pendiente"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
