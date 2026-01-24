"use client";

import { useState, useRef } from "react";
import { useQRCode } from "next-qrcode";
import {
  Download,
  Type,
  Palette, // eslint-disable-line @typescript-eslint/no-unused-vars
  Layout,
  Image as ImageIcon,
  Settings,
  Check, // eslint-disable-line @typescript-eslint/no-unused-vars
  ChevronDown,
  ChevronUp,
  Wifi,
  Printer,
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
    qrStyle: "square" | "dots" | "rounded"; // simplified for this library
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

// --- Sub-components ---

const FlyerLogo = ({ branding }: { branding: FlyerConfig["branding"] }) => {
  if (!branding.logo) return null;
  const size = {
    sm: "h-12",
    md: "h-20",
    lg: "h-32",
  }[branding.logoSize];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={branding.logo}
      alt="Logo"
      className={cn("object-contain", size)}
    />
  );
};

const FlyerQR = ({
  content,
  branding,
}: {
  content: FlyerConfig["content"];
  branding: FlyerConfig["branding"];
}) => {
  const { Canvas } = useQRCode();
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <Canvas
        text={content.guideUrl || "https://guest-link.com"}
        options={{
          errorCorrectionLevel: "M",
          margin: 2,
          scale: 4,
          width: 200,
          color: {
            dark: branding.qrColor,
            light: "#ffffff",
          },
        }}
        logo={
          branding.embedLogoInQr && branding.logo
            ? {
                src: branding.logo,
                options: { width: 30 },
              }
            : undefined
        }
      />
    </div>
  );
};

// --- Templates ---
const FlyerPreview = ({
  config,
  qrRef,
}: {
  config: FlyerConfig;
  qrRef: React.RefObject<HTMLDivElement>;
}) => {
  const { content, branding, design } = config;

  // Font class mapping
  const fontClass = {
    inter: "font-sans",
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  }[design.font];

  // --- Layout: Minimal ---
  if (design.layout === "minimal") {
    return (
      <div
        ref={qrRef}
        className={cn(
          "bg-white relative flex flex-col items-center justify-between p-12 text-center",
          design.orientation === "horizontal"
            ? "w-[842px] h-[595px]"
            : "w-[595px] h-[842px]", // A5 roughly scaled or A4
          fontClass,
        )}
        style={{
          backgroundColor: design.backgroundColor,
          color: design.secondaryColor,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-4"
          style={{ background: design.primaryColor }}
        />

        <div className="space-y-4 mt-8">
          {branding.logoPosition === "top" && <FlyerLogo branding={branding} />}
          <h1
            className="text-4xl font-bold"
            style={{ color: design.primaryColor }}
          >
            {content.title}
          </h1>
          <p className="text-xl uppercase tracking-widest">
            {content.subtitle}
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center gap-8 my-8">
          {branding.logoPosition === "center" && (
            <FlyerLogo branding={branding} />
          )}
          <FlyerQR content={content} branding={branding} />
          <p className="max-w-md italic text-lg">{content.welcomeMessage}</p>
        </div>

        <div className="w-full">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
            <Wifi className="w-8 h-8" style={{ color: design.primaryColor }} />
            <div className="text-center">
              <p className="text-sm text-gray-400 uppercase font-bold">
                WiFi Network
              </p>
              <p className="text-2xl font-bold">{content.networkName}</p>
              {content.showPassword && content.networkPassword && (
                <p className="text-lg font-mono mt-1 text-gray-600">
                  {content.networkPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        {branding.logoPosition === "corner" && (
          <div className="absolute bottom-8 right-8">
            <FlyerLogo branding={branding} />
          </div>
        )}
      </div>
    );
  }

  // --- Layout: Gradient ---
  if (design.layout === "gradient") {
    return (
      <div
        ref={qrRef}
        className={cn(
          "bg-white relative flex flex-col items-center justify-center p-12 text-center overflow-hidden",
          design.orientation === "horizontal"
            ? "w-[842px] h-[595px]"
            : "w-[595px] h-[842px]",
          fontClass,
        )}
        style={{ backgroundColor: design.backgroundColor }}
      >
        {/* Gradient Blobs */}
        <div
          className="absolute top-0 left-0 w-full h-64 opacity-10"
          style={{
            background: `linear-gradient(180deg, ${design.primaryColor} 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-full h-64 opacity-10"
          style={{
            background: `linear-gradient(0deg, ${design.primaryColor} 0%, transparent 100%)`,
          }}
        />

        <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white/50 flex flex-col items-center gap-8">
          {branding.logo && <FlyerLogo branding={branding} />}

          <div className="space-y-2">
            <h1
              className="text-3xl font-bold"
              style={{ color: design.primaryColor }}
            >
              {content.title}
            </h1>
            <p className="text-gray-500 font-medium">{content.subtitle}</p>
          </div>

          <div className="p-4 rounded-3xl bg-white shadow-inner">
            <FlyerQR content={content} branding={branding} />
          </div>

          <div className="space-y-4 w-full">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between px-6">
              <span className="text-gray-400 font-medium text-sm">Network</span>
              <span className="font-bold text-gray-800">
                {content.networkName}
              </span>
            </div>
            {content.showPassword && content.networkPassword && (
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between px-6">
                <span className="text-gray-400 font-medium text-sm">
                  Password
                </span>
                <span className="font-mono font-bold text-gray-800">
                  {content.networkPassword}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-center text-gray-400">
            {content.guideUrl}
          </p>
        </div>
      </div>
    );
  }

  // --- Layout: Card ---
  return (
    <div
      ref={qrRef}
      className={cn(
        "relative flex flex-col p-8 text-center",
        design.orientation === "horizontal"
          ? "w-[842px] h-[595px]"
          : "w-[595px] h-[842px]",
        fontClass,
      )}
      style={{ backgroundColor: design.backgroundColor }}
    >
      <div
        className="flex-1 border-8 border-double rounded-3xl flex flex-col items-center justify-between p-12"
        style={{ borderColor: design.primaryColor }}
      >
        <div className="space-y-6">
          {branding.logo && <FlyerLogo branding={branding} />}
          <div>
            <h1
              className="text-5xl font-black uppercase tracking-tighter"
              style={{ color: design.primaryColor }}
            >
              {content.title}
            </h1>
            <div
              className="h-1 w-24 mx-auto mt-4"
              style={{ backgroundColor: design.secondaryColor }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-medium">{content.welcomeMessage}</p>
          <div
            className="border-4 rounded-xl p-2"
            style={{ borderColor: design.primaryColor }}
          >
            <FlyerQR content={content} branding={branding} />
          </div>
          <p
            className="text-xs tracking-[0.2em] font-bold uppercase"
            style={{ color: design.secondaryColor }}
          >
            Scan Me
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-black text-white p-4 rounded-lg text-center">
            <p className="text-xs uppercase opacity-50 mb-1">Network</p>
            <p className="font-bold truncate">{content.networkName}</p>
          </div>
          <div className="bg-black text-white p-4 rounded-lg text-center">
            <p className="text-xs uppercase opacity-50 mb-1">Password</p>
            <p className="font-bold font-mono">
              {content.showPassword ? content.networkPassword : "••••••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Builder Component ---
export function QrFlyerBuilder({ initialData }: QrFlyerBuilderProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // State
  const [config, setConfig] = useState<FlyerConfig>({
    content: {
      title: initialData?.name || "Welcome",
      subtitle: "Digital Guest Guide",
      welcomeMessage:
        "Scan the QR code to connect to WiFi and view our local guide.",
      networkName: initialData?.wifiSsid || "",
      networkPassword: initialData?.wifiPassword || "",
      guideUrl: initialData?.slug
        ? `https://guest-link.com/stay/${initialData.slug}`
        : "https://guest-link.com",
      showPassword: true,
    },
    branding: {
      logo: initialData?.coverImageUrl, // Use cover image as logo default? Or null.
      logoPosition: "top",
      logoSize: "md",
      qrStyle: "dots",
      qrColor: "#000000",
      embedLogoInQr: false,
    },
    design: {
      primaryColor: "#2563ea",
      secondaryColor: "#4b5563",
      backgroundColor: "#ffffff",
      font: "inter",
      layout: "minimal",
      orientation: "vertical",
    },
  });

  const [activePanel, setActivePanel] = useState<
    "content" | "branding" | "design"
  >("design");

  // Handlers
  const handleExport = async (type: "png" | "pdf") => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2, // Retain quality
        useCORS: true,
        backgroundColor: null,
        // Ensure fonts are loaded if possible, otherwise it falls back
      });

      if (type === "png") {
        const link = document.createElement("a");
        link.download = `${config.content.title.replace(/\s+/g, "_")}_flyer.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: config.design.orientation === "horizontal" ? "l" : "p",
          unit: "mm",
          format: "a4", // or 'a5'
        });
        const imgData = canvas.toDataURL("image/png");
        // Pdf dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(`${config.content.title.replace(/\s+/g, "_")}_flyer.pdf`);
      }
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. Please try again.");
    }
  };

  const updateConfig = (
    section: keyof FlyerConfig,
    key: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateConfig("branding", "logo", ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Render ---
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
      {/* Left: Customization Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
        {/* Section: Design (Layout & Colors) */}
        <div className="border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
          <button
            onClick={() =>
              setActivePanel(activePanel === "design" ? "design" : "design")
            }
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 font-semibold"
          >
            <span className="flex items-center gap-2">
              <Layout className="w-4 h-4" /> Layout & Style
            </span>
            {activePanel === "design" ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {activePanel === "design" && (
            <div className="p-4 space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Template
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["minimal", "gradient", "card"].map((l) => (
                    <button
                      key={l}
                      onClick={() => updateConfig("design", "layout", l)}
                      className={cn(
                        "p-2 rounded-lg border text-sm capitalize transition-all",
                        config.design.layout === l
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:bg-gray-50",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Colors
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 mb-1 block">
                      Primary
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.design.primaryColor}
                        onChange={(e) =>
                          updateConfig("design", "primaryColor", e.target.value)
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={config.design.primaryColor}
                        onChange={(e) =>
                          updateConfig("design", "primaryColor", e.target.value)
                        }
                        className="w-full text-xs p-1 border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 mb-1 block">
                      Background
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.design.backgroundColor}
                        onChange={(e) =>
                          updateConfig(
                            "design",
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={config.design.backgroundColor}
                        onChange={(e) =>
                          updateConfig(
                            "design",
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                        className="w-full text-xs p-1 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Orientation
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateConfig("design", "orientation", "vertical")
                    }
                    className={cn(
                      "flex-1 py-2 text-sm border rounded",
                      config.design.orientation === "vertical"
                        ? "bg-blue-50 border-blue-500"
                        : "",
                    )}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() =>
                      updateConfig("design", "orientation", "horizontal")
                    }
                    className={cn(
                      "flex-1 py-2 text-sm border rounded",
                      config.design.orientation === "horizontal"
                        ? "bg-blue-50 border-blue-500"
                        : "",
                    )}
                  >
                    Horizontal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Content */}
        <div className="border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
          <button
            onClick={() => setActivePanel("content")}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 font-semibold"
          >
            <span className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Content
            </span>
            {activePanel === "content" ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {activePanel === "content" && (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">
                  Title
                </label>
                <input
                  value={config.content.title}
                  onChange={(e) =>
                    updateConfig("content", "title", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">
                  Subtitle
                </label>
                <input
                  value={config.content.subtitle}
                  onChange={(e) =>
                    updateConfig("content", "subtitle", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">
                  Welcome Message
                </label>
                <textarea
                  value={config.content.welcomeMessage}
                  onChange={(e) =>
                    updateConfig("content", "welcomeMessage", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent h-20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold">WiFi Details</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={config.content.networkName}
                    onChange={(e) =>
                      updateConfig("content", "networkName", e.target.value)
                    }
                    placeholder="Network Name"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent"
                  />
                  <div className="flex gap-2">
                    <input
                      value={config.content.networkPassword}
                      onChange={(e) =>
                        updateConfig(
                          "content",
                          "networkPassword",
                          e.target.value,
                        )
                      }
                      placeholder="Password"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm bg-transparent"
                    />
                    <button
                      onClick={() =>
                        updateConfig(
                          "content",
                          "showPassword",
                          !config.content.showPassword,
                        )
                      }
                      className={cn(
                        "px-3 border rounded-lg text-xs",
                        config.content.showPassword
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-gray-50",
                      )}
                    >
                      {config.content.showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Branding */}
        <div className="border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
          <button
            onClick={() => setActivePanel("branding")}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 font-semibold"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Branding & QR
            </span>
            {activePanel === "branding" ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {activePanel === "branding" && (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold mb-2 block">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {config.branding.logo ? (
                    <div className="relative w-16 h-16 border rounded-lg p-1 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.branding.logo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() =>
                          updateConfig("branding", "logo", undefined)
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 border border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                      <Settings className="w-6 h-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  )}
                  <div className="flex-1 space-y-2">
                    <select
                      value={config.branding.logoPosition}
                      onChange={(e) =>
                        updateConfig("branding", "logoPosition", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="corner">Corner</option>
                    </select>
                    <select
                      value={config.branding.logoSize}
                      onChange={(e) =>
                        updateConfig("branding", "logoSize", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="text-xs text-gray-500 font-bold mb-2 block">
                  QR Style
                </label>
                <div className="flex gap-2 mb-4">
                  {["square", "dots", "rounded"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateConfig("branding", "qrStyle", s)}
                      className={cn(
                        "flex-1 py-1 text-xs border rounded capitalize",
                        config.branding.qrStyle === s
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.branding.embedLogoInQr}
                    onChange={(e) =>
                      updateConfig(
                        "branding",
                        "embedLogoInQr",
                        e.target.checked,
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Embed Logo in QR</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Preview */}
      <div className="w-full lg:w-2/3 bg-gray-100 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-700 flex flex-col p-6 items-center justify-center relative min-h-[600px]">
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button
            onClick={() => handleExport("png")}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 shadow-sm rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> PNG
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white shadow-sm rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> PDF
          </button>
        </div>

        <div className="overflow-auto w-full h-full flex items-center justify-center p-8 custom-scrollbar">
          <div className="shadow-2xl transition-transform duration-300 origin-center scale-[0.6] md:scale-[0.8] lg:scale-[0.65] xl:scale-[0.8]">
            <FlyerPreview config={config} qrRef={qrRef} />
          </div>
        </div>

        <p className="absolute bottom-4 text-xs text-gray-400">
          Preview scaled to fit. Exports in high resolution.
        </p>
      </div>
    </div>
  );
}
