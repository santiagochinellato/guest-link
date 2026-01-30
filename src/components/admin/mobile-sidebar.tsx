"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  // Add other mobile nav items here if needed
];

export function MobileSidebar({
  locale = "es",
  onLinkClick,
}: {
  locale?: string;
  onLinkClick?: () => void;
}) {
  const [session, setSession] = useState<{
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null>(null);
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data));
  }, []);

  return (
    <aside className="w-full flex flex-col h-full bg-white dark:bg-brand-void font-sans">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* Light mode: Original Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hostlylogo.svg"
              alt="Hostly"
              className="dark:hidden w-full h-full object-contain"
            />
            {/* Dark mode: Copper Colored Logo Mask */}
            <div
              className="hidden dark:block w-full h-full bg-brand-copper"
              style={{
                maskImage: "url(/hostlylogo.svg)",
                WebkitMaskImage: "url(/hostlylogo.svg)",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-brand-void dark:text-white font-sans block">
              HOSTLY
            </span>
            <p
              className="text-[12px] text-brand-void dark:text-white font-medium tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              The city, simplified
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const hrefWithLocale = `/${locale}${item.href}`;
          const isActive = pathname === hrefWithLocale;
          return (
            <Link
              key={item.href}
              href={hrefWithLocale}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-4 py-4 px-4 rounded-xl text-base font-semibold transition-all duration-200 active:scale-95",
                isActive
                  ? "bg-brand-copper/10 text-brand-copper shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-void-light/50",
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6",
                  isActive ? "text-brand-copper" : "text-gray-400",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
        {/* Theme Toggle */}
        <ThemeToggle variant="segmented" className="w-full" />

        {/* User Menu Trigger */}
        <div className="relative">
          {showUserMenu && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          )}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200 dark:border-gray-700">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-void-light to-brand-void flex items-center justify-center text-white font-bold text-xs">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex flex-col items-start overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || "Cuenta"}
              </p>
            </div>
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
