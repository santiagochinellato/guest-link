"use client";

import { useFormContext } from "react-hook-form";
import { QrFlyerBuilder } from "@/components/admin/qr-flyer-builder";
import { PropertyFormData } from "@/lib/schemas";

export function FlyerSection({ propertyId, tips }: { propertyId?: number; tips?: string[] }) {
  const { getValues } = useFormContext<PropertyFormData>();

  return (
    <div className="animate-in fade-in duration-300">
      <QrFlyerBuilder initialData={{ ...getValues(), id: propertyId }} tips={tips} />
    </div>
  );
}
