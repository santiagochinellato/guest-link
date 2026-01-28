"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "segmented";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={cn("w-9 h-9", className)} />;

  const isDark = resolvedTheme === "dark";

  if (variant === "icon") {
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-brand-copper dark:hover:text-brand-copper transition-all active:scale-95 shadow-sm group",
          className,
        )}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Moon className="w-5 h-5 group-hover:fill-current transition-colors" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Sun className="w-5 h-5 group-hover:fill-current transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center p-1 bg-gray-100/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-neutral-800/50 w-full max-w-[210px] mx-auto",
        className,
      )}
    >
      {/* Background slider */}
      <motion.div
        className="absolute h-8 bg-white dark:bg-neutral-800 rounded-xl shadow-sm z-0 border border-gray-200/20 dark:border-white/5"
        initial={false}
        animate={{
          x: isDark ? "100%" : "0%",
          width: "calc(50% - 4px)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => setTheme("light")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold tracking-tight transition-all duration-300",
          !isDark
            ? "text-brand-copper"
            : "text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300",
        )}
      >
        <Sun
          className={cn(
            "w-3.5 h-3.5 transition-all",
            !isDark && "fill-current",
          )}
        />
        <span className="opacity-90">CLARO</span>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold tracking-tight transition-all duration-300",
          isDark
            ? "text-brand-copper dark:text-brand-copper"
            : "text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300",
        )}
      >
        <Moon
          className={cn("w-3.5 h-3.5 transition-all", isDark && "fill-current")}
        />
        <span className="opacity-90">OSCURO</span>
      </button>
    </div>
  );
}
