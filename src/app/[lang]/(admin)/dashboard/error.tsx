"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, LogIn } from "lucide-react";
import Link from "next/link";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard]", error);
  }, [error]);

  const isDbError =
    error?.message?.includes("connect") ||
    error?.message?.includes("timeout") ||
    error?.message?.includes("ECONNREFUSED");

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <HostlyLogoVertical className="w-20 h-auto text-brand-copper/80 dark:text-white/80" />
        </div>
        <div className="flex justify-center">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full">
            <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-500" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-void dark:text-white">
            No se pudo cargar el panel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isDbError
              ? "Comprueba que la base de datos esté accesible (POSTGRES_URL en .env.local) y que Docker esté levantado si usas base local."
              : "Algo falló al cargar los datos. Prueba de nuevo o inicia sesión."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-copper hover:bg-brand-copper/90 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/es/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
