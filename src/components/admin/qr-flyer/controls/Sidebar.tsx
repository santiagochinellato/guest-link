import { Edit3, Palette, Stamp, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlyerConfig } from "../types";
import { DesignControls } from "./DesignControls";
import { ContentControls } from "./ContentControls";
import { BrandingControls } from "./BrandingControls";
import { useState } from "react";

interface SidebarProps {
  config: FlyerConfig;
  updateConfig: (section: keyof FlyerConfig, key: string, value: any) => void;
  onExport: (type: "png" | "pdf") => void;
}

export function Sidebar({ config, updateConfig, onExport }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"content" | "design" | "branding">(
    "design",
  );

  return (
    <aside className="w-[420px] shrink-0 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2c2a] relative z-20">
      {/* Top Tabs */}
      <div className="bg-white dark:bg-[#1a2c2a] border-b border-slate-200 dark:border-slate-800 p-2 grid grid-cols-3 gap-1">
        {[
          { id: "content", label: "Content", icon: Edit3 },
          { id: "design", label: "Design", icon: Palette },
          { id: "branding", label: "Branding", icon: Stamp },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
              activeTab === tab.id
                ? "bg-[#f0f4f4] dark:bg-[#0e201e] text-[#0f756d]"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5",
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === "design" && (
          <DesignControls config={config} updateConfig={updateConfig} />
        )}
        {activeTab === "content" && (
          <ContentControls config={config} updateConfig={updateConfig} />
        )}
        {activeTab === "branding" && (
          <BrandingControls config={config} updateConfig={updateConfig} />
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2c2a] flex justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={() => alert("Saved to profile!")}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Save Preset
        </button>
        <button
          type="button"
          onClick={() => onExport("pdf")}
          className="flex-1 px-4 py-2 bg-[#0f756d] hover:bg-[#0a5c55] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0f756d]/30"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </aside>
  );
}
