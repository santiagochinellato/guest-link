"use client";

import { Activity, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  firstAccess: Date | null;
  accessCount: number;
}

export function ActivityCard({ firstAccess, accessCount }: ActivityCardProps) {
  return (
    <div
      className={cn(
        "xl:col-span-2 rounded-2xl p-6 flex flex-col",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-white/50 dark:border-slate-800",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Actividad en la app
        </h3>
      </div>

      {firstAccess || accessCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {firstAccess && (
            <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Primera visita</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {new Date(firstAccess).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800">
            <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Accesos a la guía</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {accessCount} {accessCount === 1 ? "vez" : "veces"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            Sin actividad todavía
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            El huésped aún no ha accedido a la guía digital
          </p>
        </div>
      )}
    </div>
  );
}

