"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

interface WifiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ssid: string;
  password?: string;
  labels: {
    title: string;
    subtitle: string;
    ssidLabel: string;
    passwordLabel: string;
    copyNetwork: string;
    copyPassword: string;
    scanLabel: string;
    connectButton: string;
  };
}

export function WifiDrawer({
  isOpen,
  onClose,
  ssid,
  password,
  labels,
}: WifiDrawerProps) {
  const [copiedField, setCopiedField] = useState<"ssid" | "password" | null>(
    null,
  );

  const wifiString = password
    ? `WIFI:T:WPA;S:${ssid};P:${password};;`
    : `WIFI:T:nopass;S:${ssid};;`;

  const handleCopy = (text: string, field: "ssid" | "password") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(field === "ssid" ? labels.copyNetwork : labels.copyPassword);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Drag handler to close on swipe down
  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 rounded-t-[2rem] shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
              onClick={onClose}
            >
              <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            </div>

            <div className="p-6 pb-12 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                      <Wifi className="w-6 h-6" />
                    </div>
                    WiFi Access
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code Big */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-3xl shadow-lg border border-neutral-100 dark:border-neutral-800">
                  <QRCodeSVG
                    value={wifiString}
                    size={240}
                    className="w-full h-auto max-w-[240px]"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                  />
                </div>
                <p className="mt-4 text-sm text-neutral-500 font-medium">
                  {labels.scanLabel}
                </p>
              </div>

              {/* Data Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                      {labels.ssidLabel}
                    </p>
                    <p className="text-lg font-semibold">{ssid}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(ssid, "ssid")}
                    className="p-3 bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-xl active:scale-95 transition-transform"
                  >
                    {copiedField === "ssid" ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-neutral-500" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                        {labels.passwordLabel}
                      </p>
                      <p className="text-lg font-mono font-bold">{password}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(password, "password")}
                      className="p-3 bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-xl active:scale-95 transition-transform"
                    >
                      {copiedField === "password" ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-neutral-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Native Connect Button */}
              {/* Note: This works mostly on mobile devices that support the schema */}
              <a
                href={wifiString}
                className="block w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-lg text-center rounded-2xl shadow-lg shadow-blue-500/30 transition-all"
              >
                {labels.connectButton || "Connect Automatically"}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
