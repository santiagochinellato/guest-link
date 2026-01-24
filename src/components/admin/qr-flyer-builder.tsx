"use client";

import { useState, useRef } from "react";
import { useQRCode } from "next-qrcode";
import {
  Download,
  Share2,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize,
  Check,
  Plus,
  QrCode,
  Edit3,
  Palette,
  Stamp,
  CloudUpload,
  Settings,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Types ---
export interface FlyerConfig {
  content: {
    title: string;
    subtitle: string;
    welcomeMessage: string;
    networkName: string;
    networkPassword?: string;
    guideUrl: string;
    showPassword: boolean;
  };
  branding: {
    logo?: string; // Data URL
    logoPosition: "top" | "center" | "corner";
    logoSize: "sm" | "md" | "lg";
    qrStyle: "square" | "dots" | "rounded";
    qrColor: string;
    embedLogoInQr: boolean;
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    font: "inter" | "sans" | "serif" | "mono";
    layout: "minimal" | "gradient" | "card";
    orientation: "vertical" | "horizontal";
  };
}

interface QrFlyerBuilderProps {
  initialData?: {
    name: string;
    wifiSsid?: string;
    wifiPassword?: string;
    slug?: string;
    coverImageUrl?: string;
  };
}

// --- Preview Component (Extracted for cleaner code) ---
const FlyerPreview = ({
  config,
  qrRef,
}: {
  config: FlyerConfig;
  qrRef: React.RefObject<HTMLDivElement>;
}) => {
  const { content, branding, design } = config;
  const { Canvas } = useQRCode();

  // Font class mapping
  const fontClass = {
    inter: "font-sans",
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  }[design.font];

  // Common QR Component
  const TheQR = () => (
    <div className="bg-white p-3 rounded-xl shadow-sm inline-block">
      <Canvas
        text={content.guideUrl}
        options={{
          errorCorrectionLevel: "M",
          margin: 2,
          scale: 4,
          width: 180,
          color: {
            dark:
              design.primaryColor === "#ffffff"
                ? "#000000"
                : branding.qrStyle === "dots"
                  ? design.primaryColor
                  : "#000000",
            light: "#ffffff",
          },
        }}
        logo={
          branding.embedLogoInQr && branding.logo
            ? { src: branding.logo, options: { width: 30 } }
            : undefined
        }
      />
    </div>
  );

  // --- Layout: Minimal ---
  if (design.layout === "minimal") {
    return (
      <div
        ref={qrRef}
        className={cn(
          "bg-white relative flex flex-col items-center p-12 text-center shadow-lg transition-all",
          design.orientation === "horizontal"
            ? "w-[842px] h-[595px]"
            : "w-[595px] h-[842px]",
          fontClass,
        )}
      >
        {/* Header Image Area mockup */}
        <div className="w-full h-[35%] bg-slate-100 relative overflow-hidden rounded-t-lg -mt-12 -mx-12 mb-8 w-[calc(100%+6rem)]">
          {branding.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logo}
              alt="Header"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              Header Image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
          {/* Logo Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-tight text-lg uppercase">
              INFOHOUSE
            </span>
          </div>
        </div>

        <div className="flex-1 px-8 flex flex-col items-center w-full">
          <div
            className="w-16 h-1 rounded-full mb-6"
            style={{ backgroundColor: design.primaryColor }}
          />

          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 leading-tight">
            {content.title}
          </h2>
          <p className="text-slate-500 font-medium mb-8 max-w-[80%]">
            {content.welcomeMessage}
          </p>

          <div className="relative p-2 bg-white rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 mb-8">
            <TheQR />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Scan Me
            </div>
          </div>

          <div className="mt-auto w-full bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                style={{
                  backgroundColor: `${design.primaryColor}20`,
                  color: design.primaryColor,
                }}
              >
                <Wifi className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Wi-Fi Network
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {content.networkName}
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-left pr-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Password
              </p>
              <p className="text-sm font-mono font-medium text-slate-800">
                {content.showPassword ? content.networkPassword : "••••••••"}
              </p>
            </div>
          </div>

          <div
            className="mt-4 w-[calc(100%+6rem)] -mb-12 py-3 text-center text-white"
            style={{ backgroundColor: design.primaryColor }}
          >
            <p className="text-white/80 text-[10px] font-medium tracking-wide">
              Have a wonderful stay!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Other layouts can be added similarly, using minimal as default for this stitching ---
  return null;
};

export function QrFlyerBuilder({ initialData }: QrFlyerBuilderProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.64);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "branding">(
    "design",
  );

  const [config, setConfig] = useState<FlyerConfig>({
    content: {
      title: initialData?.name || "Welcome to Seaside Villa",
      subtitle: "Digital Guest Guide",
      welcomeMessage:
        "Scan the code below to access the house guide, local recommendations, and more.",
      networkName: initialData?.wifiSsid || "Seaside_Guest_5G",
      networkPassword: initialData?.wifiPassword || "SunnyDays2024",
      guideUrl: initialData?.slug
        ? `https://guest-link.com/stay/${initialData.slug}`
        : "https://guest-link.com",
      showPassword: true,
    },
    branding: {
      logo:
        initialData?.coverImageUrl ||
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2942&auto=format&fit=crop", // Default Stitch Image
      logoPosition: "center",
      logoSize: "md",
      qrStyle: "dots",
      qrColor: "#000000",
      embedLogoInQr: false,
    },
    design: {
      primaryColor: "#0f756d",
      secondaryColor: "#4b5563",
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

  const handleExport = async (type: "png" | "pdf") => {
    // Implementation same as before
    if (!qrRef.current) return;
    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        useCORS: true,
      });
      if (type === "png") {
        const link = document.createElement("a");
        link.download = `flyer.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
        pdf.save("flyer.pdf");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for Colors
  const ColorButton = ({ color }: { color: string }) => (
    <button
      type="button"
      onClick={() => updateConfig("design", "primaryColor", color)}
      className={cn(
        "w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 transition-transform hover:scale-110",
        config.design.primaryColor === color
          ? "ring-slate-400"
          : "ring-transparent",
      )}
      style={{ backgroundColor: color }}
    />
  );

  return (
    <div className="flex h-[calc(100vh-100px)] w-full overflow-hidden bg-[#f6f8f8] dark:bg-[#112120] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
      {/* Left Panel: Controls */}
      <aside className="w-[450px] shrink-0 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2c2a] relative z-20">
        <div className="flex h-full">
          {/* Vertical Tabs Rail */}
          <nav className="w-[80px] bg-[#f0f4f4] dark:bg-[#0e1b1a] border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-8 shrink-0">
            <div className="mb-4">
              <div className="w-10 h-10 bg-[#0f756d]/10 rounded-xl flex items-center justify-center text-[#0f756d]">
                <QrCode className="w-6 h-6" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className="group flex flex-col items-center gap-1 w-full px-2 focus:outline-none"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  activeTab === "content"
                    ? "bg-[#0f756d] text-white shadow-lg"
                    : "text-slate-500 hover:text-[#0f756d] hover:bg-white",
                )}
              >
                <Edit3 className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  activeTab === "content"
                    ? "text-[#0f756d] font-bold"
                    : "text-slate-500",
                )}
              >
                Content
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("design")}
              className="group flex flex-col items-center gap-1 w-full px-2 focus:outline-none"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  activeTab === "design"
                    ? "bg-[#0f756d] text-white shadow-lg"
                    : "text-slate-500 hover:text-[#0f756d] hover:bg-white",
                )}
              >
                <Palette className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  activeTab === "design"
                    ? "text-[#0f756d] font-bold"
                    : "text-slate-500",
                )}
              >
                Design
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("branding")}
              className="group flex flex-col items-center gap-1 w-full px-2 focus:outline-none"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  activeTab === "branding"
                    ? "bg-[#0f756d] text-white shadow-lg"
                    : "text-slate-500 hover:text-[#0f756d] hover:bg-white",
                )}
              >
                <Stamp className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  activeTab === "branding"
                    ? "text-[#0f756d] font-bold"
                    : "text-slate-500",
                )}
              >
                Branding
              </span>
            </button>
          </nav>

          {/* Active Tab Content Area */}
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            <header className="px-8 pt-8 pb-4 shrink-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 capitalize">
                {activeTab}
              </h1>
              <p className="text-sm text-slate-500">
                Customize your flyer settings.
              </p>
            </header>

            <div className="flex-1 overflow-y-auto px-8 pb-28 space-y-8 custom-scrollbar">
              {/* --- DESIGN TAB --- */}
              {activeTab === "design" && (
                <>
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Templates
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["minimal", "gradient", "card", "blank"].map((t) => (
                        <div
                          key={t}
                          onClick={() => updateConfig("design", "layout", t)}
                          className="group relative cursor-pointer"
                        >
                          {config.design.layout === t && (
                            <div className="absolute inset-0 border-[3px] border-[#0f756d] rounded-xl z-10 pointer-events-none" />
                          )}
                          <div className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative shadow-sm hover:border-[#0f756d]/50 border border-transparent transition-all">
                            {/* Mock visual for template */}
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 capitalize">
                              {t}
                            </div>
                          </div>
                          <p
                            className={cn(
                              "mt-2 text-xs font-medium text-center capitalize",
                              config.design.layout === t
                                ? "text-[#0f756d]"
                                : "text-slate-500",
                            )}
                          >
                            {t}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <hr className="border-slate-100 dark:border-slate-700" />
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                      Color Palette
                    </h3>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-500 mb-2">
                        Primary Brand Color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <ColorButton color="#0f756d" />
                        <ColorButton color="#2563EB" />
                        <ColorButton color="#7C3AED" />
                        <ColorButton color="#DB2777" />
                        <ColorButton color="#000000" />
                        <label className="w-8 h-8 rounded-full border border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:border-[#0f756d] text-slate-400">
                          <Plus className="w-4 h-4" />
                          <input
                            type="color"
                            className="opacity-0 w-0 h-0"
                            onChange={(e) =>
                              updateConfig(
                                "design",
                                "primaryColor",
                                e.target.value,
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* --- CONTENT TAB --- */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      Title
                    </label>
                    <input
                      value={config.content.title}
                      onChange={(e) =>
                        updateConfig("content", "title", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0f756d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      Welcome Message
                    </label>
                    <textarea
                      value={config.content.welcomeMessage}
                      onChange={(e) =>
                        updateConfig(
                          "content",
                          "welcomeMessage",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0f756d] h-24 resize-none"
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-[#0f756d]" /> WiFi Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Network Name (SSID)
                        </label>
                        <input
                          value={config.content.networkName}
                          onChange={(e) =>
                            updateConfig(
                              "content",
                              "networkName",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Password
                        </label>
                        <input
                          value={config.content.networkPassword}
                          onChange={(e) =>
                            updateConfig(
                              "content",
                              "networkPassword",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- BRANDING TAB --- */}
              {activeTab === "branding" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      Header Image
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-[#0f756d] hover:bg-[#0f756d]/5 transition-all cursor-pointer group">
                      <CloudUpload className="w-8 h-8 text-[#0f756d] mb-2" />
                      <p className="text-xs font-medium text-slate-700">
                        Click to upload
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              updateConfig(
                                "branding",
                                "logo",
                                ev.target?.result as string,
                              );
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      Embed Logo in QR
                    </label>
                    <div
                      onClick={() =>
                        updateConfig(
                          "branding",
                          "embedLogoInQr",
                          !config.branding.embedLogoInQr,
                        )
                      }
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          config.branding.embedLogoInQr
                            ? "bg-[#0f756d] border-[#0f756d]"
                            : "border-slate-300",
                        )}
                      >
                        {config.branding.embedLogoInQr && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">Enabled</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-white dark:bg-[#1a2c2a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-lg z-30">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                <Save className="w-4 h-4" /> Save
              </button>
              <div className="flex gap-2">
                <button
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0f756d] hover:bg-[#0a524c] text-white text-sm font-bold shadow-lg shadow-[#0f756d]/30 transition-all"
                  onClick={() => handleExport("pdf")}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel: Preview */}
      <main className="flex-1 bg-[#e0e5e6] dark:bg-[#0b1212] relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#0f756d 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Toolbar */}
        <div className="absolute top-6 flex gap-2 bg-white/90 dark:bg-[#1a2c2a]/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-white/20 z-30">
          <button
            onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="flex items-center justify-center px-2 text-xs font-mono font-medium text-slate-500">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="relative w-full h-full overflow-auto flex items-center justify-center p-12 custom-scrollbar">
          <div
            style={{ transform: `scale(${scale})` }}
            className="transition-transform duration-300 origin-center"
          >
            <div className="shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]">
              <FlyerPreview config={config} qrRef={qrRef} />
            </div>
          </div>
        </div>

        {/* Safe Zone Toast */}
        <div className="absolute bottom-6 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg opacity-80 pointer-events-none">
          Preview Mode • A4 Size
        </div>
      </main>
    </div>
  );
}
