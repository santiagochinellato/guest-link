import { Wifi, Router, Copy, Lock } from "lucide-react";
import { useQRCode } from "next-qrcode";

interface GuestWiFiCardProps {
  ssid?: string;
  password?: string;
}

export function GuestWiFiCard({ ssid, password }: GuestWiFiCardProps) {
  const { Canvas } = useQRCode();

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      // Optional: Add toast notification specific to copy
    }
  };

  const handleConnect = () => {
    if (ssid) {
      window.location.href = `WIFI:T:WPA;S:${ssid};P:${password};;`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 p-6">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
          <Wifi className="w-48 h-48" />
        </div>
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="text-center">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
              <Wifi className="w-5 h-5 text-[#0f756d]" /> Red WiFi
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Escanea para conectarte automáticamente
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:scale-105 transition-transform duration-500">
            <Canvas
              text={`WIFI:T:WPA;S:${ssid};P:${password};;`}
              options={{
                errorCorrectionLevel: "M",
                margin: 2,
                scale: 4,
                width: 180,
                color: { dark: "#112120", light: "#ffffff" },
              }}
            />
          </div>

          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f756d] text-white rounded-xl shadow-lg shadow-[#0f756d]/20 active:scale-95 transition-all text-sm font-bold animate-in zoom-in duration-300"
          >
            <Wifi className="w-4 h-4" /> Conectar Ahora
          </button>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-3 px-5 py-4 bg-[#f6f8f8] dark:bg-neutral-900/50 rounded-2xl w-full justify-between border border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <Router className="w-4 h-4 text-[#0f756d]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Red
                  </span>
                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">
                    {ssid || "Not Configured"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(ssid || "")}
                className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[#0f756d] shadow-sm transition-colors active:scale-90"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 bg-[#f6f8f8] dark:bg-neutral-900/50 rounded-2xl w-full justify-between border border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <Lock className="w-4 h-4 text-[#0f756d]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Contraseña
                  </span>
                  <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">
                    {password || "••••••••"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(password || "")}
                className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[#0f756d] shadow-sm transition-colors active:scale-90"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
