import { Plus } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/actions/properties";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { PropertyCardWithMetrics } from "@/components/admin/PropertyCardWithMetrics";

interface Property {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  status: string | null;
  coverImageUrl?: string | null;
  wifiSsid?: string | null;
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
  const analyticsList = await Promise.all(
    properties.map((p) => getPropertyAnalytics(p.id))
  );

  return (
    <div className="space-y-6 px-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-white dark:text-white">
            Administra tus unidades de alquiler y guías.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, i) => (
          <PropertyCardWithMetrics
            key={property.id}
            property={property}
            analytics={analyticsList[i] ?? null}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
