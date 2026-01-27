"use client";

import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0f756d] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0f756d] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in duration-700 relative z-10">
        {/* Branding */}
        <div className="flex justify-center">
          <div className="block dark:hidden">
            <Image
              src="/GUESTHUBVERTICALCOLOR.webp"
              alt="GuestHub"
              width={180}
              height={180}
              className="w-32 h-auto"
              priority
            />
          </div>
          <div className="hidden dark:block">
            <Image
              src="/GUESTHUBVERTICALTOTALWHITE.webp"
              alt="GuestHub"
              width={180}
              height={180}
              className="w-32 h-auto"
              priority
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative inline-block">
            <h1 className="text-9xl font-black tracking-tighter text-[#0f756d]/10 dark:text-white/5 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Página extraviada
              </h2>
            </div>
          </div>
          <p className="text-gray-500 dark:text-neutral-400 text-sm max-w-[280px] mx-auto leading-relaxed">
            Parece que esta página se ha tomado unas vacaciones inesperadas.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-3 px-10 py-4 bg-[#0f756d] hover:bg-[#0d635c] text-white rounded-2xl font-bold transition-all shadow-xl shadow-[#0f756d]/20 active:scale-95 group"
        >
          <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
