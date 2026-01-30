import { Wifi, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlyerConfig } from "../types";

interface ContentControlsProps {
  config: FlyerConfig;
  updateConfig: (section: keyof FlyerConfig, key: string, value: any) => void;
}

export function ContentControls({
  config,
  updateConfig,
}: ContentControlsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-white uppercase mb-2 block">
            ¿Qué debe abrir el QR?
          </label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => updateConfig("content", "qrType", "url")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all",
                !config.content.qrType || config.content.qrType === "url"
                  ? "bg-white dark:bg-brand-void-light shadow text-brand-copper"
                  : "text-slate-400",
              )}
            >
              <span>🔗</span> Guía Digital
            </button>
            <button
              type="button"
              onClick={() => updateConfig("content", "qrType", "wifi")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all",
                config.content.qrType === "wifi"
                  ? "bg-white dark:bg-brand-void-light shadow text-brand-copper"
                  : "text-slate-400",
              )}
            >
              <span>📶</span> Conectar WiFi
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-white uppercase">
            Título
          </label>
          <input
            value={config.content.title}
            onChange={(e) => updateConfig("content", "title", e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-white uppercase">
            Mensaje de bienvenida
          </label>
          <textarea
            value={config.content.welcomeMessage}
            onChange={(e) =>
              updateConfig("content", "welcomeMessage", e.target.value)
            }
            className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-600 h-24 resize-none"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <h4 className="flex items-center gap-2 font-bold mb-4 text-sm">
          <Wifi className="w-4 h-4 text-[#0f756d]" /> Configuración WiFi
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white uppercase">
              Red
            </label>
            <input
              value={config.content.networkName}
              onChange={(e) =>
                updateConfig("content", "networkName", e.target.value)
              }
              className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-white uppercase">
              Contraseña
            </label>
            <div className="flex gap-2">
              <input
                value={config.content.networkPassword || ""}
                onChange={(e) =>
                  updateConfig("content", "networkPassword", e.target.value)
                }
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-mono"
              />
              <button
                type="button"
                onClick={() =>
                  updateConfig(
                    "content",
                    "showPassword",
                    !config.content.showPassword,
                  )
                }
                className={cn(
                  "mt-1 px-3 rounded-lg border flex items-center justify-center",
                  config.content.showPassword
                    ? "bg-[#0f756d] border-transparent text-white"
                    : "border-slate-200 text-slate-400",
                )}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
