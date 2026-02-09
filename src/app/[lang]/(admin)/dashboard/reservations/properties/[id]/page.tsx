import { getReservations } from "@/lib/actions/reservations";
import { getProperties } from "@/lib/actions/properties";
import { getReservationsTokenStatus } from "@/lib/actions/guest-tokens";
import { Search } from "lucide-react";
import { ReservationsFilters } from "@/components/admin/ReservationsFilters";
import { ExportReservationsButton } from "@/components/admin/ExportReservationsButton";
import { ReservationsView } from "@/components/admin/ReservationsView";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

// Utilidad local para ordenar por fecha de check-in
function parseReservationDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().toLowerCase();
  if (!clean) return null;

  // Formato ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const iso = clean.includes("t") ? clean : `${clean}T12:00:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  // Formato "DD MMM YYYY" (ej: "09 mar 2026" o "2 abr 2026")
  const ddMmmYyyy = clean.match(/^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i);
  if (ddMmmYyyy) {
    const [, dayStr, monthStr, yearStr] = ddMmmYyyy;
    const monthMap: Record<string, number> = {
      ene: 0,
      jan: 0,
      feb: 1,
      mar: 2,
      abr: 3,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      ago: 7,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dic: 11,
      dec: 11,
    };
    const month = monthMap[monthStr.toLowerCase()];
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  // Fallback: dejar que el navegador intente parsear
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

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

  const paramsResolved = await searchParams;
  const {
    q: query = "",
    status,
    platform,
    dateFrom,
    dateTo,
  } = paramsResolved;

  const statusFilter = status && status !== "__all__" ? status : undefined;
  const platformFilter = platform && platform !== "__all__" ? platform : undefined;

  const [reservationsResult, propertiesResult] = await Promise.all([
    getReservations({
      search: query,
      status: statusFilter,
      platform: platformFilter,
      propertyId: id,
      dateFrom,
      dateTo,
    }),
    getProperties(),
  ]);

  const reservations = reservationsResult.success ? reservationsResult.data : [];
  const properties = propertiesResult.success && propertiesResult.data
    ? propertiesResult.data.map((p) => ({ id: p.id, name: p.name }))
    : [];

  // Ordenar por fecha de check-in ASC (más cercanas primero),
  // independientemente del formato de fecha que venga de la BD.
  const sortedReservations = [...(reservations || [])].sort((a, b) => {
    const da = parseReservationDate(a.checkIn);
    const db = parseReservationDate(b.checkIn);

    if (!da && !db) return 0;
    if (!da) return 1; // fechas inválidas al final
    if (!db) return -1;

    return da.getTime() - db.getTime();
  });

  const reservationIds = sortedReservations.map((r) => r.id);
  const tokenStatusResult = reservationIds.length > 0 ? await getReservationsTokenStatus(reservationIds) : { success: true, status: {} as Record<number, boolean> };
  const tokenStatus = tokenStatusResult.success ? tokenStatusResult.status : {};

  const currentProperty = properties.find((p) => p.id === propertyId);
  if (!currentProperty) notFound();

  if (reservationsResult.error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error al cargar reservas. Intenta recargar la página.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back + Header */}
      <div className="space-y-4">
        <Link
          href={`/${lang}/dashboard/reservations`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-copper transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a reservas
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
              Reservas · {currentProperty.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Listado completo de reservas sincronizadas para esta propiedad.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <form className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Buscar por huésped, código..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-void-light focus:outline-none focus:ring-2 focus:ring-brand-copper/20 transition-all text-sm"
              />
            </form>
            <ReservationsFilters properties={properties} />
            <ExportReservationsButton
              filters={{
                search: query,
                status: statusFilter,
                platform: platformFilter,
                propertyId: id,
                dateFrom,
                dateTo,
              }}
            />
          </div>
        </div>
      </div>

      <ReservationsView reservations={sortedReservations} tokenStatus={tokenStatus} />
    </div>
  );
}
