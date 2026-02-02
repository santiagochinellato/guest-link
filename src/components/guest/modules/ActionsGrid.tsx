"use client";

import { BookOpen, Map, Siren, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionsGridProps {
  onOpenRules: () => void;
  onOpenGuide: () => void;
  onOpenTransport: () => void;
  onOpenEmergency: () => void;
}

export function ActionsGrid({
  onOpenRules,
  onOpenGuide,
  onOpenTransport: onTransportClick,
  onOpenEmergency,
}: ActionsGridProps) {
  const actions = [
    {
      label: "Reglas",
      icon: BookOpen,
      onClick: onOpenRules,
      color: "text-zinc-500",
      bg: "bg-zinc-50 dark:bg-zinc-800/50",
    },
    {
      label: "Guía Local",
      icon: Map,
      onClick: onOpenGuide,
      color: "text-brand-copper",
      bg: "bg-brand-copper/10",
    },
    {
      label: "Transporte",
      icon: Bus,
      onClick: onTransportClick,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "S.O.S",
      icon: Siren,
      onClick: onOpenEmergency,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex flex-col items-start justify-end p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] h-[100px] relative"
        >
          <div
            className={cn(
              " absolute top-3 right-3 p-2 rounded-xl mb-3 transition-colors",
              action.bg,
            )}
          >
            <action.icon
              className={cn("w-12 h-12 opacity-30", action.color)}
              strokeWidth={1.5}
            />
          </div>
          <span className="z-2 font-semibold uppercase text-xs text-start text-zinc-900 dark:text-zinc-100">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
