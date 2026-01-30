import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlyerConfig } from "../types";

interface BrandingControlsProps {
  config: FlyerConfig;
  updateConfig: (section: keyof FlyerConfig, key: string, value: any) => void;
}

export function BrandingControls({
  config,
  updateConfig,
}: BrandingControlsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center cursor-pointer hover:bg-slate-100 transition-colors relative">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (ev.target?.result) {
                  updateConfig("branding", "logo", ev.target.result as string);
                }
              };
              reader.readAsDataURL(file);
              // Reset input so validation or re-selection triggers again
              e.target.value = "";
            }
          }}
        />
        <CloudUpload className="w-8 h-8 text-brand-copper dark:text-brand-copper mb-2" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Subir imagen de encabezado/logo
        </span>
        <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Paletas Recomendadas
        </h4>

        {/* Palettes */}
        <div className="flex justify-start gap-3 mb-4">
          {[
            { name: "Copper", color: "#D97706" },
            { name: "Void", color: "#0F2A3D" },
            { name: "Forest", color: "#059669" },
            { name: "Berry", color: "#db2777" },
            { name: "Black", color: "#000000" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => updateConfig("design", "primaryColor", p.color)}
              type="button"
              className={cn(
                "w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-brand-copper",
                config.design.primaryColor === p.color
                  ? "ring-2 ring-offset-2 ring-brand-copper dark:ring-offset-black"
                  : "",
              )}
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
        </div>

        {/* Custom Color */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="relative overflow-hidden w-10 h-10 rounded-lg cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700">
            <input
              type="color"
              className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
              value={config.design.primaryColor}
              onChange={(e) =>
                updateConfig("design", "primaryColor", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700 dark:text-gray-300">
              Color Personalizado
            </span>
            <span className="text-xs text-slate-400 uppercase font-mono">
              {config.design.primaryColor}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Insertar logo en el QR
        </span>
        <button
          type="button"
          onClick={() =>
            updateConfig(
              "branding",
              "embedLogoInQr",
              !config.branding.embedLogoInQr,
            )
          }
          className={cn(
            "w-10 h-6 rounded-full relative transition-colors",
            config.branding.embedLogoInQr ? "bg-brand-copper" : "bg-slate-200",
          )}
        >
          <div
            className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
              config.branding.embedLogoInQr ? "left-5" : "left-1",
            )}
          />
        </button>
      </div>
    </div>
  );
}
