"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, Lock, Network, Check, Copy } from "lucide-react";
import { toast } from "sonner"; // Asumo que usas sonner o similar para notificaciones

// ... props interface
interface WifiCardProps {
  ssid: string;
  password?: string;
  labels: any; // Ideally typed
}

export const WifiCard = ({ ssid, password, labels }: WifiCardProps) => {
  const [copiedField, setCopiedField] = useState<"ssid" | "password" | null>(
    null,
  );

  // ... (wifiString logic)
  const wifiString = password
    ? `WIFI:T:WPA;S:${ssid};P:${password};;`
    : `WIFI:T:nopass;S:${ssid};;`;

  const brandColor = "#0f766e";

  const handleCopy = (text: string, field: "ssid" | "password") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    // Use translated success message
    toast.success(field === "ssid" ? labels.copyNetwork : labels.copyPassword);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all hover:shadow-md">
      {/* Header con gradiente sutil */}
      <div className="bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/30 p-4 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
          <Wifi className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
            {labels.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {labels.subtitle}
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* Sección de Datos (Izquierda) */}
        <div className="w-full space-y-4 flex-1">
          {/* Red / SSID */}
          <div className="group relative bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 flex items-start gap-3 border border-zinc-100 dark:border-zinc-700/50 transition-colors hover:border-teal-200 dark:hover:border-teal-800">
            <Network className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {labels.ssidLabel}
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base break-all">
                {ssid}
              </p>
            </div>
            <button
              onClick={() => handleCopy(ssid, "ssid")}
              className="p-1.5 text-zinc-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-lg transition-all"
              title="Copiar red"
            >
              {copiedField === "ssid" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Contraseña */}
          {password && (
            <div className="group relative bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 flex items-start gap-3 border border-zinc-100 dark:border-zinc-700/50 transition-colors hover:border-teal-200 dark:hover:border-teal-800">
              <Lock className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {labels.passwordLabel}
                </p>
                <p className="font-mono font-medium text-zinc-900 dark:text-zinc-100 text-base break-all">
                  {password}
                </p>
              </div>
              <button
                onClick={() => handleCopy(password, "password")}
                className="p-1.5 text-zinc-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-lg transition-all"
                title="Copiar contraseña"
              >
                {copiedField === "password" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Sección QR "Pro" (Derecha) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700">
            <QRCodeSVG
              value={wifiString}
              size={140}
              bgColor={"transparent"} // Fondo transparente para que se adapte al contenedor
              fgColor={brandColor} // Color del QR (el teal elegante)
              level={"Q"} // Nivel de corrección de error alto para permitir el logo
              includeMargin={false}
              imageSettings={{
                src: "/images/wifi-icon-for-qr.svg", // ¡IMPORTANTE! Necesitas este icono
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true, // "Excava" el centro del QR para que el icono se vea limpio
              }}
            />
          </div>
          <p className="text-xs text-center text-zinc-500 mt-3 font-medium">
            {labels.scanLabel}
          </p>
        </div>
      </div>
    </div>
  );
};
