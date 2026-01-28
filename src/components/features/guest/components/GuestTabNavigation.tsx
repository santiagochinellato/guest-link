import { Wifi, FileText, CableCar, TramFront, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { GuestViewMode } from "@/components/features/guest/hooks/useGuestView";

interface GuestTabNavigationProps {
  activeView: GuestViewMode;
  onNavigate: (view: GuestViewMode) => void;
  variant?: "mobile" | "desktop";
}

export function GuestTabNavigation({
  activeView,
  onNavigate,
  variant = "mobile",
}: GuestTabNavigationProps) {
  const tabs: {
    id: GuestViewMode;
    label: string;
    icon: React.ElementType;
    isCenter?: boolean;
  }[] = [
    {
      id: "rules",
      label: "Reglas",
      icon: FileText,
    },
    {
      id: "recommendations",
      label: "Guía",
      icon: CableCar,
    },
    {
      id: "home",
      label: "WiFi",
      icon: Wifi,
      isCenter: true,
    },
    {
      id: "transport",
      label: "Moverse",
      icon: TramFront,
    },
    {
      id: "help",
      label: "Ayuda",
      icon: Info,
    },
  ];

  return (
    <div
      className={cn(
        variant === "mobile"
          ? "fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-brand-void backdrop-blur-2xl border border-white/20 dark:border-white/10 p-1.5 rounded-3xl shadow-2xl z-50 flex items-center justify-center gap-1 sm:gap-2 ring-1 ring-black/5 w-[95%]"
          : "flex items-center justify-center gap-2 w-full",
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;

        // Desktop Specific Button Style
        if (variant === "desktop") {
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold",
                isActive
                  ? "bg-brand-void dark:bg-brand-copper text-white shadow-lg"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        }

        // Mobile Styles (Original)
        if (tab.isCenter && variant === "mobile") {
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={cn(
                "relative -mt-8 mx-1 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl",
                isActive
                  ? "dark:bg-brand-copper bg-brand-void text-white dark:shadow-brand-copper/40 scale-110"
                  : "bg-brand-copper  text-white  hover:scale-105",
              )}
            >
              <tab.icon className="w-6 h-6" />
              {isActive && (
                <span className="absolute -bottom-6 text-[10px] font-bold dark:text-brand-copper text-brand-void bg-white/90 dark:bg-black/90 px-2 py-0.5 rounded-full shadow-sm">
                  WiFi
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={cn(
              "relative px-3 sm:px-4 py-3 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 group min-w-[60px]",
              isActive
                ? "bg-neutral-100 dark:bg-white/10 dark:text-brand-copper text-brand-void"
                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5",
            )}
          >
            <tab.icon
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-100" : "group-hover:scale-110",
              )}
            />
            <span
              className={cn(
                "text-[9px] font-bold transition-all duration-300 opacity-100 translate-y-0",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
