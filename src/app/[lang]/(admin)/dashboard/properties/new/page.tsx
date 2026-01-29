import { Suspense } from "react";
import { CreatePropertyWizard } from "@/components/admin/wizards/create-property-wizard";
import { ContentLoader } from "@/components/ui/content-loader";

export default function NewPropertyPage() {
  return (
    <Suspense fallback={<ContentLoader text="Iniciando asistente..." />}>
      <CreatePropertyWizard />
    </Suspense>
  );
}
