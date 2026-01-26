import { Home, BookOpen, Router, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestTabNavigationProps {
  activeView: string;
  onNavigate: (
    view: "home" | "recommendations" | "transport" | "emergency",
  ) => void;
}

export function GuestTabNavigation({
  activeView,
  onNavigate,
}: GuestTabNavigationProps) {
  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: Home,
    },
    {
      id: "recommendations",
      label: "Guía",
      icon: BookOpen,
    },
    {
      id: "transport",
      label: "Moverse",
      icon: Router,
    },
    {
      id: "emergency",
      label: "Ayuda",
      icon: AlertCircle,
    },
  ] as const;

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-2 rounded-full shadow-2xl z-50 flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={cn(
              "relative px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 group",
              isActive
                ? "bg-[#0f756d] text-white shadow-lg shadow-[#0f756d]/25"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10",
            )}
          >
            <tab.icon
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110",
              )}
            />
            {isActive && (
              <span className="text-sm font-bold animate-in fade-in slide-in-from-right-4 duration-300 hidden sm:block">
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
