"use client";

import type { PropertyGuestUsage } from "@/types/analytics";

interface GuestUsageInlineProps {
  usage: PropertyGuestUsage | null;
}

export function GuestUsageInline({ usage }: GuestUsageInlineProps) {
  const hasData =
    (usage?.topSections?.length ?? 0) > 0 ||
    (usage?.topRecommendations?.length ?? 0) > 0 ||
    usage?.peakUsageHour != null;

  if (!hasData) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
        Aún no hay datos de uso · Los datos aparecerán cuando tus huéspedes visiten la guía
        digital.
      </div>
    );
  }

  const topSections = (usage?.topSections ?? []).slice(0, 3);
  const topRecommendations = (usage?.topRecommendations ?? []).slice(0, 3);
  const peakHour = usage?.peakUsageHour ?? null;
  const peakHourLabel =
    peakHour !== null ? `${String(peakHour).padStart(2, "0")}:00` : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
      {/* Col 1: top secciones */}
      <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-2">
          Secciones más vistas
        </p>
        {topSections.length === 0 ? (
          <p className="text-[11px] text-gray-400">Sin datos todavía.</p>
        ) : (
          <div className="space-y-2">
            {topSections.map((s) => (
              <div key={s.sectionKey} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-700 dark:text-gray-200 truncate">{s.label}</span>
                  <span className="text-gray-500 ml-1 shrink-0">
                    {s.percentage}% ({s.count})
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-brand-copper/80 rounded-full"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Col 2: hora pico */}
      <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-3 flex flex-col justify-between">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-2">
          Hora más activa
        </p>
        <p className="text-3xl font-bold text-brand-void dark:text-white leading-none">
          {peakHourLabel}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">hora con más consultas</p>
      </div>

      {/* Col 3: top recomendaciones */}
      <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-2">
          Recomendaciones más clicadas
        </p>
        {topRecommendations.length === 0 ? (
          <p className="text-[11px] text-gray-400">Sin clics todavía.</p>
        ) : (
          <div className="space-y-1.5">
            {topRecommendations.map((r) => (
              <div
                key={`${r.id ?? r.name}`}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="truncate flex-1 text-gray-700 dark:text-gray-200">
                  {r.name}
                </span>
                <span className="bg-brand-copper/10 text-brand-copper text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                  {r.clicks}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
