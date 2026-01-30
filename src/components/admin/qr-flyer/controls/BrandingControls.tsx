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
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const reader = new FileReader();
              reader.onload = (ev) =>
                updateConfig("branding", "logo", ev.target?.result as string);
              reader.readAsDataURL(e.target.files[0]);
            }
          }}
        />
        <CloudUpload className="w-8 h-8 text-brand-copper dark:text-brand-copper mb-2" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Subir imagen de encabezado/logo
        </span>
        <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
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
