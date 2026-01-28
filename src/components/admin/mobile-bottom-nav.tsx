"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  QrCode,
  Menu,
  X,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const NAV_ITEMS = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Properties", href: "/dashboard/properties", icon: Building2 },
    // { label: "QR Creator", href: "/dashboard/qr-builder", icon: QrCode },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      {/* <div className="h-16" /> */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1a2c2b]/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1",
                  isActive
                    ? "text-brand-copper"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <item.icon
                    className={cn("w-6 h-6", isActive && "scale-110")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-brand-void rounded-t-3xl border-t border-gray-200 dark:border-gray-800 p-6 md:hidden pb-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Menu</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Sun className="w-5 h-5 text-orange-500" />
                    )}
                    <span className="font-medium">Theme</span>
                  </div>
                  <button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="text-sm font-bold text-brand-copper"
                  >
                    Switch to {theme === "dark" ? "Light" : "Dark"}
                  </button>
                </div>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Settings</span>
                </Link>

                {/* Additional menu items could go here */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
