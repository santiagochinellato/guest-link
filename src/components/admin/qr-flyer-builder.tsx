"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FlyerConfig } from "./qr-flyer/types";
import { Sidebar } from "./qr-flyer/controls/Sidebar";
import { FlyerPreview } from "./qr-flyer/FlyerPreview";
import { PropertyFormData } from "@/lib/schemas";

interface QrFlyerBuilderProps {
  initialData?: {
    id?: number;
    name: string;
    wifiSsid?: string;
    wifiPassword?: string;
    slug?: string;
    coverImageUrl?: string;
  };
}

export function QrFlyerBuilder({ initialData }: QrFlyerBuilderProps) {
  const [scale, setScale] = useState(0.8);
  const [activeTab, setActiveTab] = useState("design");
  const { setValue } = useFormContext<PropertyFormData>();

  const [config, setConfig] = useState<FlyerConfig>({
    content: {
      title: initialData?.name || "Welcome Home",
      subtitle: "Scan to Connect",
      welcomeMessage:
        "Escanea el código QR para acceder a la guía de la propiedad, WiFi y recomendaciones locales.",
      welcomeMessageEn:
        "Scan this code to access the property guide, WiFi, and local recommendations.",
      networkName: initialData?.wifiSsid || "Guest-WiFi",
      networkPassword: initialData?.wifiPassword || "password123",
      guideUrl: initialData?.slug
        ? `https://guest-link.com/stay/${initialData.slug}`
        : "https://guest-link.com",
      showPassword: true,
    },
    branding: {
      logo: initialData?.coverImageUrl || "/hostlyHorizontal.webp",
      logoPosition: "center",
      logoSize: "md",
      qrStyle: "square",
      qrColor: "#000000",
      embedLogoInQr: false,
    },
    design: {
      primaryColor: "#D97706", // Brand Copper
      secondaryColor: "#1e293b",
      backgroundColor: "#ffffff",
      font: "inter",
      layout: "gradient", // Default to Gradient which will be premium
      orientation: "vertical",
    },
  });

  // Sync config changes to the form data
  useEffect(() => {
    setValue("wifiQrCode", JSON.stringify(config), {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [config, setValue]);

  const updateConfig = (
    section: keyof FlyerConfig,
    key: string,
    value: string | number | boolean,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handlePrint = () => {
    if (initialData?.id) {
      // Save to localStorage for instant preview
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `flyer_config_${initialData.id}`,
          JSON.stringify(config),
        );
      }
      // Open print page
      window.open(`/flyer/${initialData.id}/print`, "_blank");
    } else {
      // Fallback or alert if no ID (e.g. creating new property)
      alert(
        "Primero debes guardar la propiedad para imprimir el diseño final.",
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-[#f0f0f0] dark:bg-black h-[calc(100vh-100px)] fixed inset-0 md:relative md:h-[800px] w-full overflow-hidden border border-gray-200 dark:border-gray-800 md:rounded-xl">
      {/* Sidebar Controls - Left Panel */}
      <div className="w-full md:w-[450px] bg-white dark:bg-brand-void border-r border-gray-200 dark:border-gray-800 flex flex-col z-20 shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-void z-10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="text-brand-copper">Design</span> Studio
          </h2>
          <p className="text-xs text-gray-400">
            Personaliza tu flyer imprimible
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Sidebar
            config={config}
            updateConfig={updateConfig}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      {/* Main Preview Area - Right Panel */}
      <main className="flex-1 bg-zinc-100 dark:bg-[#121212] relative overflow-hidden flex flex-col">
        {/* Floating Toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white dark:bg-brand-void/90 backdrop-blur shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 rounded-full px-4 transition-all hover:scale-105 w-[70%] flex justify-center">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-3">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* WiFi Toggle Shortcut */}
          <button
            type="button"
            onClick={() =>
              updateConfig(
                "content",
                "qrType",
                config.content.qrType === "wifi" ? "url" : "wifi",
              )
            }
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${
              config.content.qrType === "wifi"
                ? "bg-brand-copper/10 text-brand-copper"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            }`}
          >
            <span>📶</span> WiFi
          </button>

          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          {/* Export Action */}
          <button
            onClick={handlePrint}
            className="bg-brand-void hover:bg-brand-copper text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md flex items-center gap-2 transition-all"
          >
            <span>🖨️</span> Imprimir PDF
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 md:p-20 custom-scrollbar relative">
          {/* Background Grid Pattern (Dot Pattern) */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div
            style={{ transform: `scale(${scale})` }}
            className="transition-transform duration-300 origin-center will-change-transform"
          >
            {/* Paper Effect: Shadow-2xl & White BG */}
            <div className="shadow-2xl shadow-black/20 ring-1 ring-black/5 bg-white relative">
              <FlyerPreview config={config} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
