import { PropertyForm } from "@/components/admin/property-form";
import { getProperty } from "@/lib/actions/properties";
import { notFound } from "next/navigation";

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

  return <PropertyForm initialData={result.data} isEditMode={true} />;
}
