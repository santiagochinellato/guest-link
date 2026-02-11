"use client";

import { cn } from "@/lib/utils";

interface PropertyCardProps {
  propertyName: string | null;
  total: number;
  currency: string;
}

export function PropertyCard({ propertyName, total, currency }: PropertyCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 flex flex-col justify-between",
        "bg-gradient-to-br from-slate-800 to-slate-900 text-white",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Propiedad</p>
        <h3 className="text-xl font-bold">
          {propertyName ?? "Sin propiedad"}
        </h3>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-4" />

      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-slate-400">Total</span>
        <div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            {total}
          </span>
          <span className="text-lg text-slate-400 ml-1">{currency}</span>
        </div>
      </div>
    </div>
  );
}

