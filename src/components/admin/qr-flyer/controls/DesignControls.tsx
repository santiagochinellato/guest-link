import { LayoutTemplate, Palette, Maximize2, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlyerConfig } from "../types";

interface DesignControlsProps {
  config: FlyerConfig;
  updateConfig: (
    section: keyof FlyerConfig,
    key: string,
    value: string | boolean | number,
  ) => void;
}

export function DesignControls({ config, updateConfig }: DesignControlsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <section>
        <h3 className="text-xs font-bold text-slate-500 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4" /> Layout
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              id: "minimal",
              label: "Minimal Clean",
              preview: (
                <div className="w-full h-24 bg-white border border-slate-100 rounded-lg p-3 flex flex-col items-center justify-between overflow-hidden relative shadow-sm">
                  <div className="text-[6px] font-bold text-slate-800 mb-1">
                    WELCOME
                  </div>
                  <div className="w-8 h-8 border-2 border-black rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-black/20" />
                  </div>
                  <div className="w-12 h-0.5 bg-slate-200 mt-2 rounded-full" />
                </div>
              ),
            },
            {
              id: "gradient",
              label: "Modern Gradient",
              preview: (
                <div className="w-full h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-white/10 skew-y-12 scale-150"></div>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 border border-white/30">
                    <div className="w-5 h-5 bg-white/80 rounded-sm" />
                  </div>
                </div>
              ),
            },
            {
              id: "card",
              label: "Modern Card",
              preview: (
                <div className="w-full h-24 bg-slate-50 flex items-center justify-center relative overflow-hidden rounded-lg">
                  <div className="w-14 h-18 bg-white shadow-md border border-slate-200 rounded flex flex-col items-center justify-center gap-1 p-1">
                    <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white/50 rounded-sm" />
                    </div>
                    <div className="w-8 h-0.5 bg-slate-200 rounded-full" />
                  </div>
                </div>
              ),
            },
            {
              id: "elegant",
              label: "Elegant Serif",
              preview: (
                <div className="w-full h-24 bg-[#FAFAFA] flex items-center justify-center relative overflow-hidden rounded-lg p-2">
                  <div className="w-full h-full border border-slate-200 p-1 flex items-center gap-1">
                    <div className="flex-1 flex flex-col gap-1 items-center">
                      <div className="w-6 h-1 bg-slate-800 rounded-full opacity-50" />
                      <div className="w-8 h-0.5 bg-slate-300" />
                    </div>
                    <div className="w-8 h-8 border border-slate-200 bg-white flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-800/10" />
                    </div>
                  </div>
                </div>
              ),
            },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => updateConfig("design", "layout", opt.id)}
              className={cn(
                "cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                config.design.layout === opt.id
                  ? "border-brand-copper ring-4 ring-brand-copper/10"
                  : "border-slate-100 dark:border-slate-800 hover:border-brand-copper/50",
              )}
            >
              <div className="bg-slate-50 dark:bg-slate-900 p-3 flex items-center justify-center">
                {opt.preview}
              </div>
              <div
                className={cn(
                  "py-2 text-center text-[10px] font-bold uppercase tracking-wider border-t",
                  config.design.layout === opt.id
                    ? "bg-brand-copper text-white border-brand-copper"
                    : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800",
                )}
              >
                {opt.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-500 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Maximize2 className="w-4 h-4" /> Orientación
        </h3>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => updateConfig("design", "orientation", "vertical")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-md transition-all",
              config.design.orientation === "vertical"
                ? "bg-white dark:bg-brand-void-light shadow text-slate-900 dark:text-white"
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
                ? "bg-white bg-brand-copper/5 dark:bg-brand-copper/10 shadow text-slate-900 dark:text-white"
                : "text-slate-400",
            )}
          >
            Horizontal
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-500 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Type className="w-4 h-4" /> Tipografía
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "inter", label: "Inter", class: "font-sans" },
            { id: "playfair", label: "Playfair", class: "font-playfair" },
            { id: "roboto", label: "Roboto", class: "font-roboto" },
          ].map((font) => (
            <button
              type="button"
              key={font.id}
              onClick={() => updateConfig("design", "font", font.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs border transition-all",
                config.design.font === font.id
                  ? "border-brand-copper bg-brand-copper/10 text-brand-copper font-bold"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400",
                font.class,
              )}
            >
              {font.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
