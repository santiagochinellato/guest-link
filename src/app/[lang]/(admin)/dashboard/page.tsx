import { Home } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { getReservations } from "@/lib/actions/reservations";
import { getSyncStatusForAllProperties } from "@/lib/actions/sync";
import { SyncStatusCard } from "@/components/admin/SyncStatusCard";
import { PropertyCard } from "@/components/admin/PropertyCard";
import { UpcomingReservations } from "@/components/admin/UpcomingReservations";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [propertiesResult, reservationsResult] = await Promise.all([
    getProperties(),
    getReservations(),
  ]);

  const properties = propertiesResult.success && propertiesResult.data
    ? propertiesResult.data
    : [];
  const reservations = reservationsResult.success && reservationsResult.data
    ? reservationsResult.data
    : [];

  const activePropertiesCount = properties.length;
  const syncStatuses = await getSyncStatusForAllProperties(properties);

  return (
    <div className=" mx-auto px-2 md:px-8 py-6 flex flex-col gap-8">
      {/* Header Section */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#4b5563] dark:text-white text-sm font-medium uppercase tracking-wider">
            Buenos dias, bienvenido a tu
          </h2>
          <h1 className="text-4xl font-black text-brand-void dark:text-white tracking-tight">
            Panel de control
          </h1>
        </div>
      </header>

      {/* Stats Section: Propiedades + Sincronización */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propiedades activas */}
        <div className="bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-copper/30 transition-colors min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-brand-copper/10 rounded-lg text-brand-copper">
              <Home className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Propiedades activas
            </p>
            <h3 className="text-2xl font-bold text-brand-void dark:text-white mt-1">
              {activePropertiesCount}
            </h3>
          </div>
        </div>

        {/* Sincronización: listado y botón actualizar */}
        <SyncStatusCard syncStatuses={syncStatuses} />
      </section>

      {/* Property Grid Section */}
      <section className="flex flex-col gap-4 pb-20 md:pb-0">
        <div className="flex flex-col md:flex-row md:gap-0 gap-4 items-start md:items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Tus propiedades
          </h3>
          <Link
            href={`/${lang}/dashboard/properties/new`}
            className="bg-brand-void hover:bg-brand-void/90 dark:bg-brand-copper dark:hover:bg-brand-copper/90 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Agregar Propiedad</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              lang={lang}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Reservations Section */}
      <section className="mt-8">
        <UpcomingReservations reservations={reservations} lang={lang} />
      </section>
    </div>
  );
}
