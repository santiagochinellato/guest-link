"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Home,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Panel de control", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "My Hostly", href: "/dashboard/my-hostly", icon: Home, exact: false },
  { label: "Reservas", href: "/dashboard/reservations", icon: CalendarCheck, exact: false },
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
  const segment = pathname?.split("/")[1];
  const effectiveLocale = segment === "en" || segment === "es" ? segment : locale;

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then(setSession);
  }, []);

  const initials = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <aside className="w-full flex flex-col h-full bg-white dark:bg-brand-void font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-3">
        <div className="relative w-9 h-9 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hostlylogo.svg"
            alt="Hostly"
            className="dark:hidden w-full h-full object-contain"
          />
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
          <span className="text-lg font-bold tracking-tight text-brand-void dark:text-white block leading-tight">
            HOSTLY
          </span>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">
            The city, simplified
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Menú
        </p>
        {NAV_ITEMS.map((item, idx) => {
          const href = `/${effectiveLocale}${item.href}`;
          const isActive = item.exact ? pathname === href : pathname.startsWith(href);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.22 }}
            >
              <Link
                href={href}
                onClick={onLinkClick}
                className={cn(
                  "relative flex items-center gap-4 py-3.5 px-4 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]",
                  isActive
                    ? "bg-brand-copper/10 text-brand-copper"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 bg-brand-copper/10 dark:bg-brand-copper/15 rounded-xl"
                    transition={{ type: "spring", stiffness: 360, damping: 36 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="mobile-accent-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-copper rounded-r-full"
                    transition={{ type: "spring", stiffness: 360, damping: 36 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 w-5 h-5 flex-shrink-0",
                    isActive ? "text-brand-copper" : "text-gray-400"
                  )}
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <ThemeToggle variant="segmented" className="w-full" />

        <div className="relative">
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1 z-50"
              >
                <button
                  onClick={() => signOut({ callbackUrl: `/${effectiveLocale}/login` })}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setShowUserMenu((v) => !v)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 bg-gray-100">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-copper/70 to-brand-copper flex items-center justify-center text-white font-bold text-xs">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900" />
            </div>
            <div className="flex flex-col items-start overflow-hidden flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {session?.user?.name ?? "Usuario"}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                {session?.user?.email ?? "Cuenta"}
              </p>
            </div>
            <motion.div animate={{ rotate: showUserMenu ? 90 : 0 }} transition={{ duration: 0.18 }}>
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
