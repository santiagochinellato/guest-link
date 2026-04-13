import { Plus } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { getReservationsOverviewByProperty } from "@/lib/actions/reservations";
import { PropertyCardWithMetrics } from "@/components/admin/PropertyCardWithMetrics";
import { BannerCarousel } from "@/components/admin/BannerCarousel";
import { DashboardKPIBar } from "@/components/admin/DashboardKPIBar";
import type { ReservationsOverviewByPropertyItem } from "@/lib/actions/reservations";

const DATA_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `${label} no respondió a tiempo. Comprueba la conexión a la base de datos (POSTGRES_URL).`
            )
          ),
        ms
      )
    ),
  ]);
}

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

  let properties: Property[] = [];
  let propertiesLoadError: string | null = null;

  try {
    const result = await withTimeout(getProperties(), DATA_TIMEOUT_MS, "Propiedades");
    if (result.success) {
      properties = result.data as Property[];
    } else {
      propertiesLoadError = result.error ?? "No se pudieron cargar las propiedades.";
    }
  } catch (e) {
    propertiesLoadError =
      e instanceof Error ? e.message : "Error de conexión con la base de datos (timeout o red).";
  }

  const [analyticsList, reservationsOverviewResult] = await Promise.all([
    Promise.all(
      properties.map((p) =>
        withTimeout(getPropertyAnalytics(p.id), DATA_TIMEOUT_MS, "Analíticas").catch(() => null)
      )
    ),
    withTimeout(getReservationsOverviewByProperty(), DATA_TIMEOUT_MS, "Reservas").catch(() => ({
      success: false as const,
      error: "timeout",
      data: [] as ReservationsOverviewByPropertyItem[],
    })),
  ]);

  const reservationsOverview = reservationsOverviewResult.success
    ? reservationsOverviewResult
    : { success: false as const, data: [] as ReservationsOverviewByPropertyItem[] };
  const overviewData = reservationsOverview.success ? reservationsOverview.data : [];

  const overviewByPropertyId = new Map<number, ReservationsOverviewByPropertyItem>();
  for (const item of overviewData) {
    overviewByPropertyId.set(item.property.id, item);
  }

  const totalViews = analyticsList.reduce((acc, a) => acc + (a?.totalViews ?? 0), 0);

  const occupiedProperties = overviewData
    .filter((item) => item.currentReservation !== null)
    .map((item) => ({
      propertyName: item.property.name,
      guestName: item.currentReservation!.guestName,
      checkOut: item.currentReservation!.checkOut,
    }));

  const nextCheckIn = overviewData
    .filter((item) => item.nextReservation)
    .sort((a, b) =>
      (a.nextReservation!.checkIn ?? "") > (b.nextReservation!.checkIn ?? "") ? 1 : -1
    )[0]?.nextReservation ?? null;

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

      {propertiesLoadError ? (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-4 text-sm text-amber-900 dark:text-amber-100 space-y-2">
          <p className="font-semibold">No se pudieron cargar las propiedades</p>
          <p className="text-amber-800/90 dark:text-amber-200/90 font-mono text-xs break-all">
            {propertiesLoadError}
          </p>
          <p className="text-amber-800/80 dark:text-amber-200/80">
            Revisa en Vercel que <code className="rounded bg-amber-100 dark:bg-amber-900/50 px-1">POSTGRES_URL</code> o{" "}
            <code className="rounded bg-amber-100 dark:bg-amber-900/50 px-1">POSTGRES_URL_NON_POOLING</code> apunten al
            mismo Supabase que usas y que el esquema esté aplicado (<code className="rounded px-1">npm run db:push</code>).
          </p>
        </div>
      ) : null}

      {!propertiesLoadError && properties.length === 0 ? (
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
              En producción la base (Supabase) suele estar vacía si no copiaste datos desde local. Crea una propiedad
              aquí o sincroniza con <code className="text-xs rounded bg-gray-100 dark:bg-gray-800 px-1">npm run db:sync-to-supabase</code>{" "}
              desde tu máquina con <code className="text-xs rounded bg-gray-100 dark:bg-gray-800 px-1">POSTGRES_URL</code> en{" "}
              <code className="text-xs rounded bg-gray-100 dark:bg-gray-800 px-1">.env.local</code>.
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
      ) : !propertiesLoadError ? (
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
      ) : null}
    </div>
  );
}
