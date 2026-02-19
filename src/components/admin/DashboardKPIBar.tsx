import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Home, CalendarCheck, LogIn, Eye } from "lucide-react";
import { parseGuestInfo } from "@/lib/utils/guest-info";

export interface OccupiedPropertyItem {
  propertyName: string;
  guestName: string;
  checkOut: string;
}

export interface DashboardKPIBarProps {
  propertiesCount: number;
  occupiedProperties: OccupiedPropertyItem[];
  nextCheckIn?: { guestName: string; checkIn: string } | null;
  totalViews: number;
}

function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM", { locale: es });
  } catch {
    return dateStr;
  }
}

export function DashboardKPIBar({
  propertiesCount,
  occupiedProperties,
  nextCheckIn,
  totalViews,
}: DashboardKPIBarProps) {
  const activeNow = occupiedProperties.length;

  let nextCheckInLabel = "—";
  try {
    if (nextCheckIn?.checkIn) {
      nextCheckInLabel = format(parseISO(nextCheckIn.checkIn), "d MMM", { locale: es });
    }
  } catch {
    nextCheckInLabel = "—";
  }

  const nextCheckInName = nextCheckIn ? parseGuestInfo(nextCheckIn.guestName).name : null;

  const staticKpis = [
    {
      icon: Home,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      label: "Propiedades",
      value: String(propertiesCount),
      subtitle: "propiedades activas",
    },
    {
      icon: LogIn,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      label: "Próximo check-in",
      value: nextCheckInLabel,
      subtitle: nextCheckInName ?? "sin reservas próximas",
    },
    {
      icon: Eye,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      label: "Vistas",
      value: String(totalViews),
      subtitle: "vistas en guías",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Tile especial: Ocupadas hoy — soporta múltiples propiedades */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-void p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Ocupadas hoy</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {activeNow}
            </p>
          </div>
        </div>

        {activeNow === 0 ? (
          <p className="text-[10px] sm:text-xs text-gray-400">todo libre hoy</p>
        ) : (
          <div className="space-y-1">
            {occupiedProperties.slice(0, 3).map((op) => {
              const { name } = parseGuestInfo(op.guestName);
              return (
                <div key={op.propertyName} className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                    {op.propertyName}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 shrink-0 hidden sm:inline">
                    · {name} · hasta {formatDateShort(op.checkOut)}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0 sm:hidden">
                    · {formatDateShort(op.checkOut)}
                  </span>
                </div>
              );
            })}
            {occupiedProperties.length > 3 && (
              <p className="text-[10px] text-gray-400 pl-3">
                +{occupiedProperties.length - 3} más
              </p>
            )}
          </div>
        )}
      </div>

      {/* Resto de KPIs genéricos */}
      {staticKpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-void p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${kpi.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{kpi.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                {kpi.value}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">{kpi.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
