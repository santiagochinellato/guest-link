"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";

export function WifiSection() {
  const { register, watch, setValue } = useFormContext<PropertyFormData>();

  const generateWifiQr = () => {
    const ssid = watch("wifiSsid");
    const pass = watch("wifiPassword");
    if (ssid) {
      setValue("wifiQrCode", `WIFI:T:WPA;S:${ssid};P:${pass};;`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Configuración WiFi</h3>
        <p className="text-sm text-gray-500">Detalles de conexión segura.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            SSID (Nombre de Red)
          </label>
          <input
            {...register("wifiSsid")}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <input
            {...register("wifiPassword")}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={generateWifiQr}
          className="text-sm text-blue-600 font-semibold hover:underline"
        >
          Generar Cadena QR
        </button>
        {watch("wifiQrCode") && (
          <span className="ml-4 text-green-500 text-sm flex items-center gap-1">
            ✓ QR Generado
          </span>
        )}
      </div>
    </div>
  );
}
