import { TrendingUp, Eye, Home } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getProperties } from "@/lib/actions/properties";
import { getReservations } from "@/lib/actions/reservations";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { getLastSyncTime } from "@/lib/actions/sync";
import { SyncStatusCard } from "@/components/admin/SyncStatusCard";
import { PropertyCardWithMetrics } from "@/components/admin/PropertyCardWithMetrics";
import { UpcomingReservations } from "@/components/admin/UpcomingReservations";

async function PropertyMetricsGrid({
  properties,
  lang,
}: {
  properties: Array<{
    id: number;
    name: string;
    slug: string;
    address: string | null;
    status: string | null;
    coverImageUrl?: string | null;
  }>;
  lang: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Suspense
          key={property.id}
          fallback={
            <PropertyCardWithMetrics
              property={property}
              analytics={null}
              isLoading={true}
              lang={lang}
            />
          }
        >
          <PropertyMetricsCard property={property} lang={lang} />
        </Suspense>
      ))}
    </div>
  );
}

async function PropertyMetricsCard({
  property,
  lang,
}: {
  property: {
    id: number;
    name: string;
    slug: string;
    address: string | null;
    status: string | null;
    coverImageUrl?: string | null;
  };
  lang: string;
}) {
  const analytics = await getPropertyAnalytics(property.id);
  return (
    <PropertyCardWithMetrics
      property={property}
      analytics={analytics}
      isLoading={false}
      lang={lang}
    />
  );
}

async function SyncStatusCardWrapper({ propertyId }: { propertyId: number }) {
  const lastSync = await getLastSyncTime(propertyId);
  return <SyncStatusCard propertyId={propertyId} lastSync={lastSync} />;
}

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
  const totalViews = properties.reduce(
    (acc, curr) => acc + (curr.views || 0),
    0,
  );

  // Find first property enabled for sync
  const syncedProperty = properties.find((p) => p.syncApiKey);

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

      {/* Stats Section */}
      <section className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-6 px-6 no-scrollbar md:grid md:grid-cols-3 md:gap-6 md:mx-0 md:px-0 md:overflow-visible">
        {/* Stat Card 1 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-copper/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <Eye className="w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-void dark:text-white">
              Total Views
            </p>
            <h3 className="text-3xl font-bold text-brand-void dark:text-white mt-1">
              {totalViews}
            </h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-copper/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-copper/10 rounded-lg text-brand-copper group-hover:bg-brand-copper/20 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-void dark:text-white">
              Active Properties
            </p>
            <h3 className="text-3xl font-bold text-brand-void dark:text-white mt-1">
              {activePropertiesCount}
            </h3>
          </div>
        </div>

        {/* Sync Status Card (Replacements QR Scans) */}
        <div className="min-w-[280px] md:min-w-0 md:w-auto snap-center">
          {syncedProperty ? (
            <SyncStatusCardWrapper propertyId={syncedProperty.id} />
          ) : (
            <div className="bg-white dark:bg-brand-void p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col justify-center items-center text-center opacity-70">
              <p className="text-sm font-medium text-gray-500">
                Sincronización no configurada
              </p>
              <Link
                href={`/${lang}/dashboard/properties`}
                className="text-xs text-brand-copper mt-2 underline"
              >
                Configurar en Extension
              </Link>
            </div>
          )}
        </div>
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
        <PropertyMetricsGrid properties={properties} lang={lang} />
      </section>

      {/* Upcoming Reservations Section */}
      <section className="mt-8">
        <UpcomingReservations reservations={reservations} lang={lang} />
      </section>
    </div>
  );
}
