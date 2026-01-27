import { Suspense } from "react";
import { PropertyForm } from "@/components/admin/property-form";

export default function NewPropertyPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <PropertyForm />
    </Suspense>
  );
}
