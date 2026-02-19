"use client";

import Link from "next/link";
import {
  Home,
  MapPin,
  Wifi,
  Star,
  Bus,
  Phone,
  ScrollText,
  KeyRound,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import type { HostlySectionStatus } from "@/components/admin/HostlyPropertyCard";

const SECTION_ICONS: Record<string, LucideIcon> = {
  basic: Home,
  location: MapPin,
  wifi: Wifi,
  recommendations: Star,
  transport: Bus,
  emergency: Phone,
  rules: ScrollText,
  access: KeyRound,
};

interface GuideSectionsGridProps {
  sections: HostlySectionStatus[];
  lang: string;
}

export function GuideSectionsGrid({ sections }: GuideSectionsGridProps) {
  const completed = sections.filter((s) => s.complete).length;
  const total = sections.length || 1;
  const progressPercent = Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      {/* Progress bar + counter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-brand-copper rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] text-gray-500 shrink-0">
          {completed}/{total} secciones
        </span>
      </div>

      {/* Lista compacta 2 columnas */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.key] ?? Home;
          return (
            <Link
              key={section.key}
              href={section.href}
              className="group flex items-center gap-1.5 py-0.5 min-w-0 hover:opacity-80 transition-opacity"
            >
              {section.complete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <Icon
                className={`w-3 h-3 shrink-0 ${
                  section.complete
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-amber-500 dark:text-amber-400"
                }`}
              />
              <span
                className={`text-[11px] truncate leading-none ${
                  section.complete
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {section.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
