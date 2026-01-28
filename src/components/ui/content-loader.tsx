"use client";

import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

interface ContentLoaderProps {
  text?: string;
  className?: string;
  classNameImage?: string;
}

export function ContentLoader({
  text = "Cargando...",
  className,
  classNameImage,
}: ContentLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] w-full gap-8",
        className,
      )}
    >
      <div className="relative">
        {/* Pulse effect rings - Scaled down for content area */}
        <div className="absolute inset-0 -m-3 border border-[#0f756d]/10 dark:border-[#0f756d]/20 rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute inset-0 -m-6 border border-[#0f756d]/5 dark:border-[#0f756d]/10 rounded-full animate-ping [animation-duration:4s]" />

        {/* Logo Branding - Slightly smaller than full screen loader */}
        <div className="relative animate-pulse">
          <HostlyLogoVertical className="w-[120px] h-auto text-brand-copper dark:text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 relative z-10">
        <div className="w-32 h-[3px] bg-gray-100 dark:bg-neutral-900 rounded-full overflow-hidden">
          <div className="h-full bg-[#0f756d] animate-[loading-bar_1.5s_infinite_ease-in-out]" />
        </div>
        {text && (
          <p className="text-[10px] font-bold text-[#0f756d]/60 dark:text-[#0f756d]/40 tracking-[0.2em] uppercase">
            {text}
          </p>
        )}
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
