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

  // Generate WiFi connection string for QR
  const wifiString = `WIFI:S:${ssid};T:WPA;P:${password || ""};;`;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden mt-4">
      <div className="flex items-center gap-4">
        {/* QR Code a la izquierda */}
        {qrCode ? (
          <Drawer>
            <DrawerTrigger asChild>
              <button className="shrink-0 w-20 h-20 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-slate-100 dark:border-neutral-700 p-1 hover:scale-105 transition-transform active:scale-95">
                {qrCode.startsWith("http") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrCode}
                    alt="WiFi QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wifiString)}`}
                    alt="QR Code"
                    className="w-full h-full"
                  />
                )}
              </button>
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
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wifiString)}`}
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
        ) : (
          <div className="shrink-0 w-20 h-20 bg-slate-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-neutral-700">
            <Wifi className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Información de red y password a la derecha */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Wi-Fi
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate mb-3">
            {ssid || "Sin red configurada"}
          </h3>

          {/* Password con botón copiar */}
          {password && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl p-2 pl-3 border border-slate-100 dark:border-white/10">
              <span
                className={cn(
                  "font-mono text-sm flex-1 truncate transition-all",
                  showPassword
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 tracking-widest",
                )}
              >
                {showPassword ? password : "••••••••"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-slate-100 dark:border-white/5 active:scale-90 transition-all text-brand-copper"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
