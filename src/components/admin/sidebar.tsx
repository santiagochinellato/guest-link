"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  QrCode,
  BarChart2,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard/properties", icon: Building2 },
  // { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  // { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex-shrink-0 bg-white dark:bg-[#1a2c2b] border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen transition-all duration-300 relative hidden md:flex",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-white dark:bg-[#1a2c2b] border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:shadow-md transition-all z-10 text-gray-500 hover:text-[#0f756d]"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo */}
      <div
        className={cn(
          "flex flex-col border-b border-gray-100 dark:border-gray-800/50 transition-all overflow-hidden relative",
          isCollapsed
            ? "px-0 items-center justify-center h-20"
            : "px-6 py-5 h-auto",
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all",
            isCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/guestHubLogo.png"
              alt="GuestHub"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div
            className={cn(
              "flex flex-col items-start justify-start overflow-hidden transition-all duration-300 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100",
            )}
          >
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap font-sans">
              GUESTHUB
            </span>
            <p
              className="text-[12px] text-gray-500 font-medium tracking-wide whitespace-nowrap"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              You stay, connected.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 rounded-lg font-medium transition-colors group relative",
                isCollapsed ? "justify-center px-2" : "px-4",
                isActive
                  ? "bg-[#0f756d]/10 text-[#0f756d]"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-[#0f756d]" : "group-hover:text-[#0f756d]",
                  isCollapsed ? "w-6 h-6" : "w-5 h-5",
                )}
              />

              {!isCollapsed && (
                <span
                  className={cn(
                    "whitespace-nowrap transition-opacity duration-200",
                    isActive ? "text-[#0f756d]" : "group-hover:text-[#0f756d]",
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors",
            isCollapsed && "justify-center",
          )}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              SM
            </div>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  Santiago M.
                </p>
                <p className="text-xs text-gray-500 truncate">Owner Account</p>
              </div>
              <MoreVertical className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
            </>
          )}
        </div>
        <div className="mt-4 px-2">
          <ThemeToggle
            variant={isCollapsed ? "icon" : "segmented"}
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "mx-auto" : "w-full",
            )}
          />
        </div>
      </div>
    </aside>
  );
}
