import { Plus, Home, CalendarCheck, Eye } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { getReservationsOverviewByProperty } from "@/lib/actions/reservations";
import { PropertyCardWithMetrics } from "@/components/admin/PropertyCardWithMetrics";
import type { ReservationsOverviewByPropertyItem } from "@/lib/actions/reservations";

interface Property {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  status: string | null;
  coverImageUrl?: string | null;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  houseRules?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

// Server Component
export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const result = await getProperties();
  const properties = (result.success ? result.data : []) as Property[];

  const [analyticsList, reservationsOverviewResult] = await Promise.all([
    Promise.all(properties.map((p) => getPropertyAnalytics(p.id))),
    getReservationsOverviewByProperty(),
  ]);

  const overviewByPropertyId = new Map<number, ReservationsOverviewByPropertyItem>();
  if (reservationsOverviewResult.success) {
    for (const item of reservationsOverviewResult.data) {
      overviewByPropertyId.set(item.property.id, item);
    }
  }

  const totalViews = analyticsList.reduce((acc, a) => acc + (a?.totalViews ?? 0), 0);
  const activeNow = reservationsOverviewResult.success
    ? reservationsOverviewResult.data.filter((item) => item.currentReservation !== null).length
    : 0;

  return (
    <div className="space-y-6 px-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-gray-400 dark:text-gray-400 text-sm mt-0.5">
            Administra tus unidades de alquiler y guías de huéspedes.
          </p>
        </div>
        <Link
          href={`/${lang}/dashboard/properties/new`}
          className="w-full md:w-auto bg-brand-void hover:bg-brand-void/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors dark:bg-brand-copper dark:hover:bg-brand-copper/90"
        >
          <Plus className="w-4 h-4" />
          Agregar Propiedad
        </Link>
      </div>

      {properties.length === 0 ? (
        /* Empty state / onboarding */
        <div className="flex flex-col items-center justify-center py-24 text-center gap-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-brand-void/30">
          <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 flex items-center justify-center">
            <Home className="w-8 h-8 text-brand-copper" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Todavía no tienes propiedades
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Crea tu primera propiedad para empezar a gestionar guías digitales para huéspedes, reservas y analíticas.
            </p>
          </div>
          <Link
            href={`/${lang}/dashboard/properties/new`}
            className="bg-brand-copper hover:bg-brand-copper/90 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar primera propiedad
          </Link>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-brand-void border border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Propiedades</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {properties.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-brand-void border border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ocupadas hoy</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {activeNow}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-brand-void border border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vistas totales</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {totalViews}
                </p>
              </div>
            </div>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, i) => (
              <PropertyCardWithMetrics
                key={property.id}
                property={property}
                analytics={analyticsList[i] ?? null}
                reservationOverview={overviewByPropertyId.get(property.id) ?? null}
                lang={lang}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
