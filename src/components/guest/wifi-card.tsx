"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure utils exists or use clsx/tailwind-merge directly if not. I'll assume utils exists or I will create it.

// Mocking utils if not present for this snippet, but I should create it first.
// I'll create utils in a separate step or assume I'll create it.
// For now, I'll inline a simple cn or rely on valid imports.
// I'll create lib/utils.ts next.

interface WifiCardProps {
  ssid: string;
  password?: string;
}

export function WifiCard({ ssid, password }: WifiCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
              Wi-Fi
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Connect to Internet
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Network
          </span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {ssid}
          </span>
        </div>

        {password && (
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-xl text-white group"
          >
            <span className="font-medium">Password</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{password}</span>
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              )}
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
}
