"use client";

import { useState } from "react";
import { Wifi, Copy, Eye, EyeOff, Check, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WifiCardProps {
  ssid: string;
  password?: string;
  qrCode?: string;
}

export function WifiCard({ ssid, password, qrCode }: WifiCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Contraseña copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ssid) return null;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden">
      {/* Network Info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Wi-Fi
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {ssid || "Sin red configurada"}
          </h3>
        </div>

        {/* Scan Button (Prominent) */}
        {qrCode && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="shrink-0 h-10 rounded-full border-brand-copper/30 bg-brand-copper/5 hover:bg-brand-copper/10 text-brand-copper font-bold text-xs px-4 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Escanear
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-0 bg-transparent border-none">
              <div className="bg-white dark:bg-black rounded-t-[2rem] p-8 pb-12 flex flex-col items-center gap-6">
                <div className="w-12 h-1 bg-slate-200 dark:bg-white/20 rounded-full mb-2" />
                <DrawerTitle className="text-xl font-bold">
                  Escanea para conectar
                </DrawerTitle>

                <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
                  {qrCode.startsWith("http") ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrCode}
                      alt="WiFi QR"
                      className="w-64 h-64 object-contain"
                    />
                  ) : (
                    // We need to import QRCodeSVG if not available, or just render image if it's a URL.
                    // Assuming QRCodeSVG is not imported, let's use the image tag fallback or just text if it's raw data
                    // Wait, I can't easily add import if I don't replace the whole file.
                    // I will replace whole file to add imports.
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <p className="font-bold text-lg">{ssid}</p>
                  {password && (
                    <p className="font-mono text-slate-500">{password}</p>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Action Area */}
      {password && (
        <div className="flex flex-col gap-3">
          {/* Connect Button (Primary Action) */}
          <Button
            onClick={() => {
              handleCopy();
              if (ssid) window.location.href = `WIFI:S:${ssid};P:${password};;`;
            }}
            className="w-full bg-brand-void dark:bg-white text-white dark:text-brand-void hover:bg-brand-void/90 dark:hover:bg-white/90 rounded-xl h-12 font-bold shadow-md active:scale-[0.98] transition-all"
          >
            Conectar
          </Button>

          {/* Password Copy (Secondary) */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 rounded-xl p-1 pl-4 border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xs font-bold text-slate-400">PASS</span>
              <span
                className={cn(
                  "font-mono text-sm truncate transition-all",
                  showPassword
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 tracking-widest",
                )}
              >
                {showPassword ? password : "••••••••"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 m-1 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-slate-100 dark:border-white/5 active:scale-90 transition-all text-brand-copper"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
