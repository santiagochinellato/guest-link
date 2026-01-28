"use client";

import Link from "next/link";
import Image from "next/image";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0f756d] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0f756d] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full text-center space-y-8 md:space-y-12 animate-in fade-in zoom-in duration-700 relative z-10 px-4 md:px-0">
        {/* Branding */}
        <div className="flex justify-center">
          <HostlyLogoVertical className="w-[180px] h-auto text-brand-void/80 dark:text-white/80" />
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-brand-copper/10 dark:text-white/5 select-none transition-all duration-300">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-xl md:text-3xl font-bold text-brand-void/80 dark:text-white text-center px-4">
                Página extraviada
              </h2>
            </div>
          </div>
          <p className="text-gray-500 dark:text-neutral-400 text-sm max-w-[280px] mx-auto leading-relaxed">
            Parece que esta página se ha tomado unas vacaciones inesperadas.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-brand-copper hover:bg-brand-copper/80 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-copper/20 active:scale-95 group text-sm md:text-base"
        >
          <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
