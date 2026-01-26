import { LayoutTemplate, Palette, Maximize2, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlyerConfig } from "../types";

interface DesignControlsProps {
  config: FlyerConfig;
  updateConfig: (section: keyof FlyerConfig, key: string, value: any) => void;
}

export function DesignControls({ config, updateConfig }: DesignControlsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4" /> Layout
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              id: "minimal",
              label: "Minimal Clean",
              preview: (
                <div className="w-full h-16 bg-white border border-slate-100 rounded-lg p-2 flex flex-col gap-1 items-center justify-center overflow-hidden relative">
                  <div className="w-8 h-8 rounded-md bg-slate-900 absolute opacity-5 top-[-10px] right-[-10px] rotate-12"></div>
                  <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                  <div className="w-8 h-1 bg-slate-100 rounded-full mb-1"></div>
                  <div className="w-6 h-6 border-2 border-slate-200 rounded pt-0.5 flex justify-center">
                    <div className="w-3 h-3 bg-slate-200"></div>
                  </div>
                </div>
              ),
            },
            {
              id: "gradient",
              label: "Modern Gradient",
              preview: (
                <div className="w-full h-16 bg-gradient-to-br from-[#0f756d] to-[#1e293b] rounded-lg p-2 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 skew-y-12"></div>
                  <div className="w-8 h-8 bg-white/90 rounded border border-white/50 shadow-sm flex items-center justify-center">
                    <div className="w-4 h-4 bg-black/80"></div>
                  </div>
                </div>
              ),
            },
            {
              id: "card",
              label: "Floating Card",
              preview: (
                <div className="w-full h-16 bg-slate-100 rounded-lg flex items-center justify-center relative">
                  <div className="w-10 h-10 bg-white rounded shadow-md border border-slate-200/50 flex flex-col items-center justify-center gap-0.5">
                    <div className="w-4 h-4 bg-slate-900 rounded-sm mb-0.5"></div>
                    <div className="w-6 h-0.5 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              ),
            },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => updateConfig("design", "layout", opt.id)}
              className={cn(
                "cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-3 transition-all hover:border-[#0f756d]/50 group",
                config.design.layout === opt.id
                  ? "border-[#0f756d] bg-[#0f756d]/5"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
              )}
            >
              {opt.preview}
              <span
                className={cn(
                  "text-xs font-bold",
                  config.design.layout === opt.id
                    ? "text-[#0f756d]"
                    : "text-slate-500 group-hover:text-slate-700",
                )}
              >
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Colors
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            "#0f756d",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
            "#f97316",
            "#ef4444",
            "#000000",
          ].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateConfig("design", "primaryColor", color)}
              className={cn(
                "w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 transition-transform hover:scale-110",
                config.design.primaryColor === color
                  ? "ring-gray-400"
                  : "ring-transparent",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Maximize2 className="w-4 h-4" /> Orientation
        </h3>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => updateConfig("design", "orientation", "vertical")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-md transition-all",
              config.design.orientation === "vertical"
                ? "bg-white dark:bg-[#1a2c2a] shadow text-slate-900 dark:text-white"
                : "text-slate-400",
            )}
          >
            Vertical (A4)
          </button>
          <button
            type="button"
            onClick={() => updateConfig("design", "orientation", "horizontal")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-md transition-all",
              config.design.orientation === "horizontal"
                ? "bg-white dark:bg-[#1a2c2a] shadow text-slate-900 dark:text-white"
                : "text-slate-400",
            )}
          >
            Horizontal
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Type className="w-4 h-4" /> Typography
        </h3>
        <select
          value={config.design.font}
          onChange={(e) => updateConfig("design", "font", e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm"
        >
          <option value="inter">Modern Sans (Inter)</option>
          <option value="serif">Elegant Serif</option>
          <option value="mono">Technical (Mono)</option>
        </select>
      </section>
    </div>
  );
}
