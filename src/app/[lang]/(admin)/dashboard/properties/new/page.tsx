import { Suspense } from "react";
import { PropertyForm } from "@/components/admin/property-form";
import { ContentLoader } from "@/components/ui/content-loader";

export default function NewPropertyPage() {
  return (
    <Suspense fallback={<ContentLoader text="Preparando formulario..." />}>
      <PropertyForm />
    </Suspense>
  );
}
