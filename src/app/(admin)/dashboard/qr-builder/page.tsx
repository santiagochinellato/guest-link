"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Printer, RefreshCw } from "lucide-react";
import { QrFlyer } from "@/components/admin/qr-flyer";

export default function QrBuilderPage() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState({
    propertyName: "Casa Azul - Ocean View",
    wifiSsid: "CasaAzul_Guest",
    qrValue: "https://guest-link.com/stay/casa-azul",
    accentColor: "#2563ea",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2, // Retine quality
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${config.propertyName.replace(/\s+/g, "-").toLowerCase()}-qr-flyer.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-100px)]">
      {/* Controls */}
      <div className="w-full xl:w-1/3 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm h-fit">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600" />
          Customize Flyer
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Name
            </label>
            <input
              type="text"
              value={config.propertyName}
              onChange={(e) =>
                setConfig({ ...config, propertyName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Network Name (Preferred)
            </label>
            <input
              type="text"
              value={config.wifiSsid}
              onChange={(e) =>
                setConfig({ ...config, wifiSsid: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Guide URL
            </label>
            <input
              type="text"
              value={config.qrValue}
              onChange={(e) =>
                setConfig({ ...config, qrValue: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brand Color
            </label>
            <div className="flex gap-2">
              {["#2563ea", "#db2777", "#16a34a", "#d97706", "#000000"].map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, accentColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${config.accentColor === color ? "border-gray-900 dark:border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ),
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-neutral-800">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98]"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Download Print-Ready PNG
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Generates a high-res image suitable for A5/A4 printing.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 dark:bg-neutral-950 rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-800 flex items-center justify-center p-8 overflow-auto">
        <div className="scale-[0.8] md:scale-100 shadow-2xl">
          <QrFlyer ref={flyerRef} {...config} />
        </div>
      </div>
    </div>
  );
}
