import { PropertySettings } from "@/components/admin/dashboards/property-settings";
import { Suspense } from "react";
import { getProperty } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import { ContentLoader } from "@/components/ui/content-loader";

// Server Component (removed "use client")
export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = parseInt(id);

  if (isNaN(propertyId)) {
    return notFound();
  }

  const result = await getProperty(propertyId);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading property: {result.error || "Unknown error"}
      </div>
    );
  }

  return (
    <Suspense fallback={<ContentLoader text="Cargando propiedad..." />}>
      <PropertySettings initialData={result.data} />
    </Suspense>
  );
}
