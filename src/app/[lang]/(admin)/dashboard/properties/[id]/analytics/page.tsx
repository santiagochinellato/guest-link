import { notFound } from "next/navigation";
import { getProperty } from "@/lib/actions/properties";
import { getPropertyAnalytics } from "@/lib/actions/analytics";
import { PropertyAnalyticsView } from "@/components/admin/PropertyAnalyticsView";

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function PropertyAnalyticsPage({ params }: PageProps) {
  const { lang, id } = await params;
  const propertyId = parseInt(id, 10);

  if (isNaN(propertyId)) {
    return notFound();
  }

  const [propertyResult, analytics] = await Promise.all([
    getProperty(propertyId),
    getPropertyAnalytics(propertyId),
  ]);

  if (!propertyResult.success || !propertyResult.data) {
    return notFound();
  }

  const property = propertyResult.data;

  return (
    <div className="mx-auto px-2 md:px-8 py-6 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-[#4b5563] dark:text-white text-sm font-medium uppercase tracking-wider">
          Analytics
        </h2>
        <h1 className="text-4xl font-black text-brand-void dark:text-white tracking-tight">
          {property.name}
        </h1>
      </header>

      <PropertyAnalyticsView analytics={analytics} propertyId={propertyId} />
    </div>
  );
}
