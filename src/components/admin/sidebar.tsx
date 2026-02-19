"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MoreVertical,
  LogOut,
  CalendarCheck,
  ChevronLeft,
  Home,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  {
    label: "Panel de control",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My Hostly",
    href: "/dashboard/my-hostly",
    icon: Home,
    exact: false,
  },
  {
    label: "Reservas",
    href: "/dashboard/reservations",
    icon: CalendarCheck,
    exact: false,
  },
];

// ─── NavItem ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
  index,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
    >
      <Link
        href={href}
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={`group relative flex items-center gap-3 py-2.5 rounded-xl font-medium transition-colors overflow-hidden ${
          isCollapsed ? "justify-center px-2" : "px-3"
        } ${
          isActive
            ? ""
            : "hover:bg-gray-50 dark:hover:bg-white/5"
        }`}
      >
        {/* Shared-layout active background pill */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 bg-brand-copper/10 dark:bg-brand-copper/15 rounded-xl"
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
          />
        )}

        {/* Left accent bar */}
        {isActive && (
          <motion.div
            layoutId="sidebar-accent-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-copper rounded-r-full"
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
          />
        )}

        {/* Icon */}
        <Icon
          className={`relative z-10 flex-shrink-0 w-[18px] h-[18px] transition-colors ${
            isActive
              ? "text-brand-copper"
              : "text-gray-400 dark:text-gray-500 group-hover:text-brand-copper"
          }`}
        />

        {/* Label */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className={`relative z-10 text-sm whitespace-nowrap select-none ${
                isActive
                  ? "text-brand-copper font-semibold"
                  : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
              }`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  locale = "es",
  onLinkClick,
}: {
  locale?: string;
  onLinkClick?: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [session, setSession] = useState<{
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(setSession);
  }, []);

  const initials = session?.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 36 }}
      className="flex-shrink-0 bg-white dark:bg-brand-void border-r border-gray-200 dark:border-gray-800 flex flex-col h-full relative overflow-visible"
    >
      {/* ── Collapse toggle ── */}
      <motion.button
        onClick={() => setIsCollapsed((v) => !v)}
        className="absolute -right-3.5 top-[88px] z-30 hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-brand-void border border-gray-200 dark:border-gray-700 shadow-sm text-gray-400 hover:text-brand-copper hover:border-brand-copper/50 transition-colors"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.88 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.div>
      </motion.button>

      {/* ── Logo ── */}
      <div
        className={`h-[73px] flex items-center border-b border-gray-100 dark:border-gray-800/60 overflow-hidden transition-all ${
          isCollapsed ? "justify-center px-4" : "px-5"
        }`}
      >
        {/* Icon */}
        <div className="flex-shrink-0 relative w-8 h-8">
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

        {/* Text */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -8, width: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="ml-3 overflow-hidden whitespace-nowrap"
            >
              <span className="text-[17px] font-bold tracking-tight text-brand-void dark:text-white block leading-tight">
                HOSTLY
              </span>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                The city, simplified
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 whitespace-nowrap"
            >
              Menú
            </motion.p>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item, idx) => {
          const href = `/${locale}${item.href}`;
          const isActive = item.exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <NavItem
              key={item.href}
              href={href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={onLinkClick}
              index={idx}
            />
          );
        })}
      </nav>

      {/* ── Thin divider line ── */}
      <div className="mx-3 h-px bg-gray-100 dark:bg-gray-800/60" />

      {/* ── User footer ── */}
      <div className="p-3 space-y-1">
        {/* User menu popup */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="mb-1 bg-white dark:bg-brand-void-light border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1"
            >
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2.5 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      Cerrar Sesión
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User row */}
        <motion.button
          onClick={() => setShowUserMenu((v) => !v)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${showUserMenu ? "bg-gray-50 dark:bg-white/5" : ""}`}
          whileTap={{ scale: 0.97 }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 bg-gray-100">
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
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-brand-void" />
          </div>

          {/* Name + email */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-hidden text-left whitespace-nowrap"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  {session?.user?.name ?? "Usuario"}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  {session?.user?.email ?? "Owner"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chevron icon */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="ml-auto"
              >
                <motion.div
                  animate={{ rotate: showUserMenu ? 90 : 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
