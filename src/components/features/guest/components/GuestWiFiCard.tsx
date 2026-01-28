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

  // Determine layout class based on variant (could be passed as prop in future if needed,
  // currently we can just make it responsive or add a prop)
  // Let's add a `variant` prop.

  return (
    <div className="space-y-4">
      {/* We can use a responsive grid here to adapt to container width automatically */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 p-6">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
          <Wifi className="w-48 h-48" />
        </div>

        {/* Responsive Layout: Flex Column on Mobile, Grid/Flex Row on Desktop */}
        {/* Responsive Layout: Flex Column on Mobile/Tablet/Laptop, Grid/Flex Row on Large Desktop (XL) */}
        <div className="flex flex-col xl:flex-row items-center gap-6 xl:gap-8 relative z-10">
          {/* Left Side: QR Code & Title (Centered) */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="text-center xl:text-left">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-center xl:justify-start gap-2">
                <Wifi className="w-5 h-5 text-brand-copper" /> Red WiFi
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Escanea para conectarte
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:scale-105 transition-transform duration-500 w-fit">
              <Canvas
                text={`WIFI:T:WPA;S:${ssid};P:${password};;`}
                options={{
                  errorCorrectionLevel: "M",
                  margin: 2,
                  scale: 4,
                  width: 160,
                  color: { dark: "#112120", light: "#ffffff" },
                }}
              />
            </div>
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-6 py-2 bg-brand-copper text-white rounded-xl shadow-lg shadow-brand-copper/20 active:scale-95 transition-all text-sm font-bold animate-in zoom-in duration-300 xl:hidden"
            >
              <Wifi className="w-4 h-4" /> Conectar
            </button>
          </div>

          {/* Right Side: Details & Desktop Connect Button */}
          <div className="flex flex-col items-center xl:items-start gap-4 flex-1 min-w-0 w-full">
            {/* Desktop Connect Button (Visible only on xl+) */}
            <div className="hidden xl:block w-full mb-2">
              <div className="p-4 bg-brand-copper/5 dark:bg-brand-copper/10 rounded-2xl border border-brand-copper/20 text-center xl:text-left">
                <p className="text-sm text-brand-copper font-medium mb-3">
                  ¿Estás en tu móvil? Toca abajo para conectar.
                </p>
                <button
                  onClick={handleConnect}
                  className="flex w-full items-center justify-center gap-2 px-6 py-3 bg-brand-copper text-white rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95 text-sm font-bold"
                >
                  <Wifi className="w-4 h-4" /> Conectar al WiFi
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {/* Network Name */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f8f8] dark:bg-neutral-900/50 rounded-2xl w-full justify-between border border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                  <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm shrink-0">
                    <Router className="w-4 h-4 text-brand-copper" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate">
                      Red
                    </span>
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 truncate">
                      {ssid || "Not Configured"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(ssid || "")}
                  className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm transition-colors active:scale-90 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f8f8] dark:bg-neutral-900/50 rounded-2xl w-full justify-between border border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                  <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm shrink-0">
                    <Lock className="w-4 h-4 text-brand-copper" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate">
                      Contraseña
                    </span>
                    <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200 truncate">
                      {password || "••••••••"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(password || "")}
                  className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-brand-copper shadow-sm transition-colors active:scale-90 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
