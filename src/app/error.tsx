"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Branding */}
        <div className="flex justify-center">
          <div className="block dark:hidden">
            <Image
              src="/GUESTHUBVERTICALCOLOR.webp"
              alt="GuestHub"
              width={100}
              height={100}
              className="w-20 h-auto"
            />
          </div>
          <div className="hidden dark:block">
            <Image
              src="/GUESTHUBVERTICALTOTALWHITE.webp"
              alt="GuestHub"
              width={100}
              height={100}
              className="w-20 h-auto"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Algo no salió como esperábamos
            </h2>
            <p className="text-gray-500 dark:text-neutral-500 text-sm">
              Hubo un problema técnico al cargar esta sección. No te preocupes,
              tus datos están seguros.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0f756d] hover:bg-[#0d635c] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#0f756d]/20 active:scale-95 text-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Intentar de nuevo
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all active:scale-95 text-sm"
          >
            <Home className="w-4 h-4" />
            Ir a mis propiedades
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-gray-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
