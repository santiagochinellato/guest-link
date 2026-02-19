import { Plus } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { getReservationsOverviewByProperty } from "@/lib/actions/reservations";
import { PropertyCardWithMetrics } from "@/components/admin/PropertyCardWithMetrics";
import { BannerCarousel } from "@/components/admin/BannerCarousel";
import { DashboardKPIBar } from "@/components/admin/DashboardKPIBar";
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

  const occupiedProperties = reservationsOverviewResult.success
    ? reservationsOverviewResult.data
        .filter((item) => item.currentReservation !== null)
        .map((item) => ({
          propertyName: item.property.name,
          guestName: item.currentReservation!.guestName,
          checkOut: item.currentReservation!.checkOut,
        }))
    : [];

  const nextCheckIn = reservationsOverviewResult.success
    ? reservationsOverviewResult.data
        .filter((item) => item.nextReservation)
        .sort((a, b) =>
          a.nextReservation!.checkIn > b.nextReservation!.checkIn ? 1 : -1
        )[0]?.nextReservation ?? null
    : null;

  return (
    <div className="space-y-5 sm:space-y-6 px-4 sm:px-8 pb-16">
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

      {/* Banner carousel — always visible */}
      <BannerCarousel lang={lang} />

      {properties.length === 0 ? (
        /* Empty state / onboarding */
        <div className="flex flex-col items-center justify-center py-24 text-center gap-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-brand-void/30">
          <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-brand-copper" />
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
          {/* KPI bar — replaces the old grid-cols-3 summary */}
          <DashboardKPIBar
            propertiesCount={properties.length}
            occupiedProperties={occupiedProperties}
            nextCheckIn={
              nextCheckIn
                ? { guestName: nextCheckIn.guestName, checkIn: nextCheckIn.checkIn }
                : null
            }
            totalViews={totalViews}
          />

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
