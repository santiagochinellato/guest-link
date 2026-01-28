"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { toast } from "sonner";
import { Link2, Wifi, CheckCircle2, QrCode } from "lucide-react";

export function WifiSection() {
  const { register, watch, setValue, getValues } =
    useFormContext<PropertyFormData>();

  const wifiQrCode = watch("wifiQrCode");
  const slug = watch("slug");

  const generateWifiQr = () => {
    const ssid = getValues("wifiSsid");
    const pass = getValues("wifiPassword");

    if (!ssid) {
      toast.error("Debes ingresar el nombre de la red (SSID)");
      return;
    }
    const qrString = `WIFI:T:WPA;S:${ssid};P:${pass || ""};;`;
    setValue("wifiQrCode", qrString);
    toast.success("¡Cadena WiFi generada con éxito!", {
      description: "Ahora los huéspedes podrán conectarse escaneando el QR.",
      icon: <Wifi className="w-4 h-4 text-green-500" />,
    });
  };

  const generateAccessLinkQr = () => {
    const currentSlug = getValues("slug");
    if (!currentSlug) {
      toast.error("Primero debes definir el Slug en 'Información Básica'");
      return;
    }
    const accessUrl = `https://guest-link.com/stay/${currentSlug}`;
    setValue("wifiQrCode", accessUrl);
    toast.success("¡Link de Acceso generado!", {
      description: "El QR ahora dirigirá a los huéspedes a tu guía digital.",
      icon: <Link2 className="w-4 h-4 text-brand-copper" />,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">WiFi y Acceso</h3>
        <p className="text-sm text-gray-500">
          Configura cómo tus huéspedes se conectarán a internet y accederán a tu
          guía.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-6 bg-gray-50 dark:bg-neutral-800/20 rounded-2xl border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-brand-copper" />
            <span className="font-bold">Datos de WiFi</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              SSID (Nombre de Red)
            </label>
            <input
              {...register("wifiSsid")}
              placeholder="Ej. MiCasa_5G"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-brand-copper transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              {...register("wifiPassword")}
              placeholder="Contraseña de la red"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-brand-copper font-mono transition-all"
            />
          </div>

          <button
            type="button"
            onClick={generateWifiQr}
            className="w-full py-3 bg-white dark:bg-neutral-800 border border-brand-copper/30 text-brand-copper rounded-xl font-bold hover:bg-brand-copper/5 transition-colors flex items-center justify-center gap-2"
          >
            <Wifi className="w-4 h-4" />
            Generar QR de WiFi
          </button>
        </div>

        <div className="space-y-4 p-6 bg-brand-copper/5 rounded-2xl border border-brand-copper/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-brand-copper" />
              <span className="font-bold">Link de Invitados</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Genera un QR que lleve directamente a los huéspedes a tu guía
              digital en{" "}
              <code className="text-xs bg-white dark:bg-black/20 px-1 rounded">
                /stay/{slug || "..."}
              </code>
            </p>
          </div>

          <button
            type="button"
            onClick={generateAccessLinkQr}
            className="w-full py-3 bg-brand-copper text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-brand-copper/20 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Generar QR de Acceso
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {wifiQrCode ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Cadena QR Actual
            </h4>
            <div className="mt-1 font-mono text-[10px] break-all p-2 bg-white/50 dark:bg-black/20 rounded border border-amber-200/50">
              {wifiQrCode || "Aún no se ha generado una cadena QR."}
            </div>
            {wifiQrCode && (
              <p className="text-[10px] mt-2 text-amber-700 dark:text-amber-400">
                Esta es la cadena que se imprimirá en el flyer y se compartirá
                con los huéspedes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
