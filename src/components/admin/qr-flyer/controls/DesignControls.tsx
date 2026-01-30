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
                  {/* Mock Content */}
                  <div className="flex flex-col items-center gap-1 w-full z-10">
                    <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-10 h-1 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="w-10 h-10 border-2 border-slate-900 rounded-md flex items-center justify-center">
                    <div className="w-8 h-8 bg-slate-200/50"></div>
                  </div>
                  <div className="w-full flex justify-between px-2">
                    <div className="w-4 h-1 bg-slate-100 rounded-full"></div>
                    <div className="w-4 h-1 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
              ),
            },
            {
              id: "gradient",
              label: "Modern Gradient",
              preview: (
                <div className="w-full h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-3 flex items-center justify-center relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-white/10 skew-y-12 scale-150"></div>
                  <div className="w-12 h-12 bg-white/90 rounded-lg shadow-xl backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-8 h-8 bg-black/80 rounded-sm"></div>
                  </div>
                </div>
              ),
            },
            {
              id: "card",
              label: "Elegant Card",
              preview: (
                <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-full h-full absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]"></div>
                  <div className="w-16 h-20 bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col items-center justify-center gap-2 p-2">
                    <div className="w-6 h-6 bg-slate-900 rounded-sm"></div>
                    <div className="w-10 h-0.5 bg-slate-200 rounded-full"></div>
                    <div className="w-8 h-0.5 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
              ),
            },
            // {
            //   id: "bento",
            //   label: "Bento Grid",
            //   preview: (
            //     <div className="w-full h-24 bg-slate-50 rounded-lg p-2 gap-1 grid grid-cols-2 grid-rows-2">
            //       <div className="bg-white rounded border border-slate-200 row-span-2 shadow-sm"></div>
            //       <div className="bg-slate-200 rounded border border-slate-300 shadow-sm"></div>
            //       <div className="bg-white rounded border border-slate-200 shadow-sm"></div>
            //     </div>
            //   ),
            // },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => updateConfig("design", "layout", opt.id)}
              className={cn(
                "cursor-pointer border-2 rounded-xl p-2 flex flex-col items-center gap-2 transition-all hover:border-brand-copper/50 group bg-white dark:bg-neutral-900",
                config.design.layout === opt.id
                  ? "border-brand-copper ring-1 ring-brand-copper/20"
                  : "border-slate-200 dark:border-slate-800",
              )}
            >
              {opt.preview}
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  config.design.layout === opt.id
                    ? "text-brand-copper"
                    : "text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-300",
                )}
              >
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Paleta de Colores
        </h4>
        Palettes
        <div className="flex justify-center gap-2 mb-4">
          {[
            { name: "Copper", color: "#D97706" },
            { name: "Void", color: "#0F2A3D" },
            { name: "Forest", color: "#059669" },
            { name: "Berry", color: "#db2777" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => updateConfig("design", "primaryColor", p.color)}
              className="w-[40px] aspect-square rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
        </div>
        {/* Custom Color */}
        <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
          <input
            type="color"
            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
            value={config.design.primaryColor}
            onChange={(e) =>
              updateConfig("design", "primaryColor", e.target.value)
            }
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
              Color Personalizado
            </span>
            <span className="text-[10px] text-slate-400 uppercase">
              {config.design.primaryColor}
            </span>
          </div>
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
