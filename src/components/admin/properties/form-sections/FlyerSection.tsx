"use client";

import { useFormContext } from "react-hook-form";
import { QrFlyerBuilder } from "@/components/admin/qr-flyer-builder";
import { PropertyFormData } from "@/lib/schemas";

export function FlyerSection() {
  const { getValues } = useFormContext<PropertyFormData>();

  return (
    <div className="animate-in fade-in duration-300 h-full">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 mb-6">
        <h3 className="text-xl font-semibold">Diseñador de Flyers</h3>
        <p className="text-sm text-gray-500">
          Crea y descarga posters listos para imprimir.
        </p>
      </div>
      <QrFlyerBuilder initialData={getValues()} />
    </div>
  );
}
