"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HostFabProps {
  hostImage?: string | null;
  hostPhone?: string | null;
  hostName?: string | null;
}

export function HostFab({ hostImage, hostPhone, hostName }: HostFabProps) {
  if (!hostPhone) return null;

  const handleWhatsApp = () => {
    // Basic clean of phone number
    const cleanPhone = hostPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <button
      onClick={handleWhatsApp}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-3 pl-1 pr-5 py-1.5",
        "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900",
        "rounded-full shadow-xl shadow-zinc-900/20",
        "transition-all duration-300 hover:scale-105 active:scale-95",
        "group",
      )}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-zinc-700 dark:bg-zinc-200 overflow-hidden border-2 border-white dark:border-zinc-100">
          {hostImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hostImage}
              alt="Host"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-copper text-white font-bold text-xs">
              {hostName ? hostName.charAt(0) : "H"}
            </div>
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border border-zinc-900 dark:border-white">
          <MessageCircle
            className="w-2.5 h-2.5 text-white"
            fill="currentColor"
          />
        </div>
      </div>

      <div className="flex flex-col items-start">
        <span className="text-xs font-medium opacity-70 leading-none mb-0.5">
          Host
        </span>
        <span className="text-sm font-bold leading-none">Ayuda</span>
      </div>
    </button>
  );
}
