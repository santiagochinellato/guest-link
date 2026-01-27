"use client";

import { useState, useRef } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { FlyerConfig } from "./qr-flyer/types";
import { Sidebar } from "./qr-flyer/controls/Sidebar";
import { FlyerPreview } from "./qr-flyer/FlyerPreview";
import { useFlyerExport } from "@/hooks/use-flyer-export";

interface QrFlyerBuilderProps {
  initialData?: {
    name: string;
    wifiSsid?: string;
    wifiPassword?: string;
    slug?: string;
    coverImageUrl?: string;
  };
}

export function QrFlyerBuilder({ initialData }: QrFlyerBuilderProps) {
  const qrRef = useRef<HTMLDivElement>(null!);
  const [scale, setScale] = useState(0.5);

  const [config, setConfig] = useState<FlyerConfig>({
    content: {
      title: initialData?.name || "Welcome Home",
      subtitle: "Scan to Connect",
      welcomeMessage:
        "Scan this code to access the property guide, WiFi, and local recommendations.",
      networkName: initialData?.wifiSsid || "Guest-WiFi",
      networkPassword: initialData?.wifiPassword || "password123",
      guideUrl: initialData?.slug
        ? `https://guest-link.com/stay/${initialData.slug}`
        : "https://guest-link.com",
      showPassword: true,
    },
    branding: {
      logo:
        initialData?.coverImageUrl ||
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2942&auto=format&fit=crop",
      logoPosition: "center",
      logoSize: "md",
      qrStyle: "dots",
      qrColor: "#000000",
      embedLogoInQr: false,
    },
    design: {
      primaryColor: "#0f756d", // Brand Teal
      secondaryColor: "#1e293b",
      backgroundColor: "#ffffff",
      font: "inter",
      layout: "minimal",
      orientation: "vertical",
    },
  });

  const updateConfig = (
    section: keyof FlyerConfig,
    key: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const { handleExport, isExporting } = useFlyerExport({ qrRef, config });

  return (
    <div className="flex flex-col md:flex-row bg-[#f6f8f8] dark:bg-[#112120] rounded-xl shadow border border-slate-200 dark:border-slate-800 h-auto md:h-[800px] overflow-hidden">
      <div className="w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 h-[400px] md:h-full overflow-y-auto shrink-0">
        <Sidebar
          config={config}
          updateConfig={updateConfig}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>

      {/* Right Panel: Preview Stage */}
      <main className="flex-1 bg-[#1e293b] relative overflow-hidden flex flex-col h-[500px] md:h-full">
        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 z-30 flex gap-2 bg-white/10 backdrop-blur rounded-full p-1 ring-1 ring-white/20">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.2, s - 0.1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="flex items-center px-1 text-xs font-mono text-white/80">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-8 md:p-20 custom-scrollbar">
          <div
            style={{ transform: `scale(${scale})` }}
            className="transition-transform duration-300 origin-center"
          >
            <div className="shadow-2xl">
              <FlyerPreview config={config} qrRef={qrRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
