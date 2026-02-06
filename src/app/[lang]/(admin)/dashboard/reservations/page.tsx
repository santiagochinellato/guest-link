import Link from "next/link";
import { getReservationCountsByProperty } from "@/lib/actions/reservations";
import { getProperties } from "@/lib/actions/properties";
import {
  CalendarCheck,
  Home,
  ChevronRight,
  CircleDot,
  Clock,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ReservationsMainPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [countsResult, propertiesResult] = await Promise.all([
    getReservationCountsByProperty(),
    getProperties(),
  ]);

  const propertyCounts = countsResult.success ? countsResult.data : [];
  const properties = propertiesResult.success && propertiesResult.data
    ? propertiesResult.data
    : [];

  // Properties without reservations (from getProperties but not in counts)
  const propertiesWithCounts = new Set(propertyCounts.map((p) => p.id));
  const propertiesWithoutReservations = properties.filter(
    (p) => !propertiesWithCounts.has(p.id)
  );

  const totalActive = propertyCounts.reduce((acc, p) => acc + p.active, 0);
  const totalUpcoming = propertyCounts.reduce((acc, p) => acc + p.upcoming, 0);
  const totalCheckInsToday = propertyCounts.reduce(
    (acc, p) => acc + p.checkInsToday,
    0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
          Reservas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las reservas de cada propiedad. Selecciona una para ver el
          listado completo.
        </p>
      </header>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-brand-void p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Activas
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalActive}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CircleDot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-brand-void p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Próximas
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalUpcoming}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-brand-void p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Check-ins hoy
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalCheckInsToday}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CalendarDays className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-brand-void p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Propiedades
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {properties.length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Home className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Properties with Reservations */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-brand-copper" />
          Tus propiedades
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertyCounts.map((prop) => (
            <Link
              key={prop.id}
              href={`/${lang}/dashboard/reservations/properties/${prop.id}`}
              className={cn(
                "block bg-white dark:bg-brand-void rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6",
                "hover:shadow-lg hover:border-brand-copper/30 transition-all group"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-copper transition-colors">
                    {prop.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {prop.slug}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-copper transition-colors flex-shrink-0" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Activas
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {prop.active}
                  </p>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Próximas
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {prop.upcoming}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {prop.total}
                  </p>
                </div>
              </div>

              {prop.checkInsToday > 0 && (
                <div className="mb-4 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300">
                  📅 {prop.checkInsToday} check-in{prop.checkInsToday > 1 ? "s" : ""} hoy
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-brand-copper group-hover:text-brand-copper/80">
                  Ver reservas
                </span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}

          {/* Properties without reservations */}
          {propertiesWithoutReservations.map((prop) => (
            <Link
              key={prop.id}
              href={`/${lang}/dashboard/reservations/properties/${prop.id}`}
              className={cn(
                "block bg-white dark:bg-brand-void rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6",
                "hover:border-brand-copper/50 hover:bg-gray-50/50 dark:hover:bg-brand-void-light/30 transition-all group"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-copper transition-colors">
                    {prop.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Sin reservas sincronizadas
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-copper transition-colors flex-shrink-0" />
              </div>

              <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                Sincroniza desde la extensión para ver reservas
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-brand-copper group-hover:text-brand-copper/80">
                  Ir a reservas
                </span>
              </div>
            </Link>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-brand-void rounded-xl border border-gray-200 dark:border-gray-800">
            <Home className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No tienes propiedades creadas
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Crea una propiedad para empezar a gestionar reservas
            </p>
            <Link
              href={`/${lang}/dashboard/properties/new`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-copper text-white rounded-lg hover:bg-brand-copper/90 transition-colors"
            >
              Crear propiedad
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
