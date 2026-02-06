"use client";

import { useState } from "react";
import { Wifi, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { posthog } from "@/lib/posthog";

interface WifiGlassCardProps {
  ssid?: string | null;
  password?: string | null;
  propertyId?: number;
}

export function WifiGlassCard({
  ssid,
  password,
  propertyId,
}: WifiGlassCardProps) {
  const [copied, setCopied] = useState(false);

  if (!ssid) return null;

  // Generate WiFi connection string
  // Format: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASSWORD>;;
  const wifiString = `WIFI:S:${ssid};T:WPA;P:${password || ""};;`;

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    if (propertyId) {
      posthog.capture("wifi_password_copied", { property_id: propertyId });
    }
    setCopied(true);
    toast.success("Contraseña copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-white/20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm p-4 select-none">
      <div className="flex items-center gap-5">
        {/* QR Code Section */}
        <div className="relative shrink-0 w-20 h-20 bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-800 p-1">
          <QRCodeSVG
            value={wifiString}
            size={64} // 16 * 4 = 64px container - padding
            level="M"
            className="w-full h-full"
            marginSize={0}
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-brand-copper/10 rounded-md">
              <Wifi className="w-3.5 h-3.5 text-brand-copper" strokeWidth={2} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-copper">
              WiFi
            </span>
          </div>

          <h3 className="font-bold text-zinc-900 dark:text-white truncate text-md leading-tight mb-0.5">
            {ssid}
          </h3>

          {/* Password Action */}
          {password && (
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 group/btn max-w-full text-left"
              >
                <div className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400 group-hover/btn:text-zinc-800 dark:group-hover/btn:text-zinc-200 transition-colors truncate">
                    {password}
                  </span>
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                    {/* <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check
                            className="w-3.5 h-3.5 text-green-500"
                            strokeWidth={2}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Copy
                            className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-brand-copper"
                            strokeWidth={2}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence> */}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleCopy();
                  // Try to open WiFi scheme
                  window.location.href = wifiString;
                }}
                className="flex w-fit items-center justify-center gap-2 bg-brand-void/10 hover:bg-brand-void/20 text-brand-void text-xs font-bold py-2 px-4 rounded-xl transition-colors active:scale-95"
              >
                <Wifi className="w-4 h-4" />
                Copiar Contraseña
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Gradient Blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-copper/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
