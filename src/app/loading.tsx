"use client";

import Image from "next/image";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-950 z-50 flex flex-col items-center justify-center gap-8 md:gap-12 overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-[#0f756d]/5 dark:bg-[#0f756d]/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none transition-all duration-500" />

      <div className="relative">
        {/* Pulse effect rings */}
        <div className="absolute inset-0 -m-4 border border-[#0f756d]/10 dark:border-[#0f756d]/20 rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute inset-0 -m-8 border border-[#0f756d]/5 dark:border-[#0f756d]/10 rounded-full animate-ping [animation-duration:4s]" />

        {/* Logo Branding */}
        <div className="relative animate-pulse">
          <HostlyLogoVertical className="w-[160px] h-auto text-brand-copper dark:text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="w-40 md:w-48 h-[3px] bg-gray-100 dark:bg-neutral-900 rounded-full overflow-hidden transition-all duration-300">
          <div className="h-full bg-[#0f756d] animate-[loading-bar_2s_infinite_ease-in-out]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black text-[#0f756d]/60 dark:text-[#0f756d]/40 tracking-[0.3em] uppercase">
            Preparando tu estancia
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%) scaleX(0.2);
          }
          50% {
            transform: translateX(0%) scaleX(1);
          }
          100% {
            transform: translateX(100%) scaleX(0.2);
          }
        }
      `}</style>
    </div>
  );
}
