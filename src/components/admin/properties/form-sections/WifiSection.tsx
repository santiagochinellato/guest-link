"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { toast } from "sonner";
import { Link2, Wifi, QrCode as QrIcon } from "lucide-react";

export function WifiSection() {
  const { register, watch, setValue } = useFormContext<PropertyFormData>();

  const wifiQrCode = watch("wifiQrCode");
  const ssid = watch("wifiSsid");
  const password = watch("wifiPassword");
  const currentSlug = watch("slug");

  // Auto-generate WiFi QR code with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ssid) {
        const qrString = `WIFI:T:WPA;S:${ssid};P:${password || ""};;`;
        // Only update if it's different to avoid infinite loops or overwriting Access Link if user didn't touch Wifi fields
        // checking against current wifiQrCode might be tricky if it currently holds a URL.
        // We assume if user is typing in SSID/Pass, they want a Wifi QR.
        if (wifiQrCode !== qrString) {
          setValue("wifiQrCode", qrString, { shouldDirty: true });
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [ssid, password, setValue, wifiQrCode]);

  const generateAccessLinkQr = () => {
    if (!currentSlug) {
      toast.error("Primero debes definir el Slug en 'Información Básica'");
      return;
    }
    const accessUrl = `https://guest-link.com/stay/${currentSlug}`;
    setValue("wifiQrCode", accessUrl, { shouldDirty: true });
    toast.success("¡Link de Acceso generado!", {
      description: "El QR ahora dirigirá a los huéspedes a tu guía digital.",
      icon: <Link2 className="w-4 h-4 text-brand-copper" />,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Conectividad & Acceso
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configura la red WiFi y el punto de acceso para tus huéspedes.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Left Column: QR Card Preview (Bento Item) */}
        <div className="lg:col-span-1 order-last lg:order-none">
          <div
            className={`h-full rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden group ${wifiQrCode ? "bg-brand-void text-white border-brand-void dark:bg-brand-copper dark:border-brand-copper" : "bg-gray-100 border-gray-200 text-gray-400 dark:bg-neutral-800 dark:border-neutral-700"}`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[250px]">
              <div>
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  {wifiQrCode?.startsWith("http") ? (
                    <Link2 className="w-5 h-5" />
                  ) : (
                    <Wifi className="w-5 h-5" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {wifiQrCode?.startsWith("http")
                      ? "Enlace Directo"
                      : "Red WiFi"}
                  </span>
                </div>
                <h3 className="text-2xl font-bold leading-tight mb-2">
                  {wifiQrCode
                    ? wifiQrCode.startsWith("http")
                      ? "Acceso Web"
                      : ssid || "Tu Red"
                    : "Sin Configurar"}
                </h3>
                {password && wifiQrCode && !wifiQrCode.startsWith("http") && (
                  <p className="font-mono text-sm opacity-60">
                    Pass: {password}
                  </p>
                )}
              </div>

              <div className="mt-8">
                <div className="bg-white p-3 rounded-xl w-fit mb-4">
                  <QrIcon className="w-12 h-12 text-black" />
                </div>
                <p className="text-xs opacity-50 line-clamp-2">
                  {wifiQrCode ||
                    "Ingresa los datos para generar el código QR..."}
                </p>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
          </div>
        </div>

        {/* Right Column: Inputs (Bento Item) */}
        <div className="lg:col-span-2 space-y-6">
          {/* WiFi Inputs Group */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
              <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                <Wifi className="w-5 h-5" />
              </div>
              <h4 className="font-semibold">Credenciales WiFi</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SSID (Nombre)
                </label>
                <input
                  {...register("wifiSsid")}
                  placeholder="Ej. Casa_Guests"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-brand-copper/20 outline-none transition-all font-medium placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <input
                  {...register("wifiPassword")}
                  placeholder="********"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-brand-copper/20 outline-none transition-all font-mono placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Alternativas */}
          <div className="bg-white dark:bg-neutral-900 flex flex-col md:flex-row rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Alternativa: QR de Enlace
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Genera un QR que abra el navegador en lugar de conectar al WiFi.
              </p>
            </div>
            <button
              type="button"
              onClick={generateAccessLinkQr}
              className="shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold transition-colors"
            >
              Generar Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
