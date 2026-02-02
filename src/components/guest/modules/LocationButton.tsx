"use client";

import { MapPin } from "lucide-react";

interface LocationButtonProps {
  onClick: () => void;
  address?: string;
}

export function LocationButton({ onClick, address }: LocationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-4 flex items-center gap-4 p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 active:scale-[0.98] transition-all group"
    >
      <div className="flex-1 text-left">
        <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-lg leading-tight">
          Ubicación
        </h3>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 opacity-80 leading-snug">
          {address || "Ver en mapa"}
        </p>
      </div>

      <div className="w-8 h-8 rounded-full bg-white dark:bg-blue-900/40 flex items-center justify-center">
        <MapPin className="w-4 h-4 text-blue-500" />
      </div>
    </button>
  );
}
