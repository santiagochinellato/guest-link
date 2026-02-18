import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty } from "@/lib/actions/properties/get";
import { getReservations } from "@/lib/actions/reservations";
import { getReservationsTokenStatus } from "@/lib/actions/guest-tokens";
import { ReservationsView } from "@/components/admin/ReservationsView";
import { ReservationsFilters } from "@/components/admin/ReservationsFilters";
import { ExportReservationsButton } from "@/components/admin/ExportReservationsButton";
import { CreateReservationButton } from "@/components/admin/CreateReservationButton";
import { ChevronLeft, Search } from "lucide-react";

function parseReservationDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().toLowerCase();
  if (!clean) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const iso = clean.includes("t") ? clean : `${clean}T12:00:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

export const dynamic = "force-dynamic";

export default async function PropertyReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    platform?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const { lang, id } = await params;
  const propertyId = parseInt(id, 10);
  if (isNaN(propertyId)) notFound();

  const resolvedSearch = await searchParams;
  const query = resolvedSearch.q ?? "";
  const statusFilter = resolvedSearch.status && resolvedSearch.status !== "__all__" ? resolvedSearch.status : undefined;
  const platformFilter = resolvedSearch.platform && resolvedSearch.platform !== "__all__" ? resolvedSearch.platform : undefined;
  const dateFrom = resolvedSearch.dateFrom ?? undefined;
  const dateTo = resolvedSearch.dateTo ?? undefined;

  const [propertyResult, reservationsResult] = await Promise.all([
    getProperty(propertyId),
    getReservations({
      propertyId,
      search: query || undefined,
      status: statusFilter,
      platform: platformFilter,
      from: dateFrom,
      to: dateTo,
    }),
  ]);

  if (!propertyResult.success || !propertyResult.data) notFound();

  const property = propertyResult.data;
  const reservations = reservationsResult.success ? reservationsResult.data : [];
  const propertiesForFilter = [{ id: property.id, name: property.name }];

  const sortedReservations = [...reservations].sort((a, b) => {
    const da = parseReservationDate(a.checkIn);
    const db = parseReservationDate(b.checkIn);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  });

  const reservationIds = sortedReservations.map((r) => r.id);
  const tokenStatusResult =
    reservationIds.length > 0
      ? await getReservationsTokenStatus(reservationIds)
      : { success: true as const, status: {} as Record<number, boolean> };
  const tokenStatus = tokenStatusResult.success ? tokenStatusResult.status : {};

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-4">
        <Link
          href={`/${lang}/dashboard/reservations`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-copper transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a reservas
        </Link>

        <div className="flex flex-col  md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
              Reservas · {property.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Listado completo de reservas sincronizadas para esta propiedad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <form method="get" className="relative flex-1 md:w-96 min-w-0">
              <input type="hidden" name="status" value={resolvedSearch.status ?? ""} />
              <input type="hidden" name="platform" value={resolvedSearch.platform ?? ""} />
              <input type="hidden" name="dateFrom" value={resolvedSearch.dateFrom ?? ""} />
              <input type="hidden" name="dateTo" value={resolvedSearch.dateTo ?? ""} />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Buscar por huésped, código..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-void-light focus:outline-none focus:ring-2 focus:ring-brand-copper/20 transition-all text-sm"
              />
            </form>
            <ReservationsFilters properties={propertiesForFilter} />
            <CreateReservationButton propertyId={propertyId} propertyName={property.name} lang={lang} />
            <ExportReservationsButton
              filters={{
                propertyId,
                search: query || undefined,
                status: statusFilter,
                platform: platformFilter,
                from: dateFrom,
                to: dateTo,
              }}
            />
          </div>
        </div>
      </div>

      <ReservationsView reservations={sortedReservations} tokenStatus={tokenStatus} />
    </div>
  );
}
