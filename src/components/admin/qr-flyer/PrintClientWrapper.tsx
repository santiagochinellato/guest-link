"use client";

import React, { useEffect } from "react";
import { FlyerConfig } from "@/components/admin/qr-flyer/types";
import { GradientTemplate } from "@/components/admin/qr-flyer/templates/GradientTemplate";
import { MinimalTemplate } from "@/components/admin/qr-flyer/templates/MinimalTemplate";
import { CardTemplate } from "@/components/admin/qr-flyer/templates/CardTemplate";
import { ElegantTemplate } from "@/components/admin/qr-flyer/templates/ElegantTemplate";

interface PrintClientWrapperProps {
  config: FlyerConfig;
  propertyId: number;
}

export function PrintClientWrapper({
  config: initialConfig,
  propertyId,
}: PrintClientWrapperProps) {
  const [config, setConfig] = React.useState<FlyerConfig>(initialConfig);

  useEffect(() => {
    // 1. Try to load fresh config from localStorage (Preview Mode)
    const stored = localStorage.getItem(`flyer_config_${propertyId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      } catch (e) {
        console.error("Failed to parse stored config", e);
      }
    }

    // 2. Small delay to ensure styles and images are loaded/rendered
    const timer = setTimeout(() => {
      window.print();
    }, 800);

    return () => clearTimeout(timer);
  }, [propertyId]);

  const renderTemplate = () => {
    switch (config.design.layout) {
      case "gradient":
        return <GradientTemplate config={config} />;
      case "card":
        return <CardTemplate config={config} />;
      case "elegant":
        return <ElegantTemplate config={config} />;
      case "minimal":
      default:
        return <MinimalTemplate config={config} />;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center items-start overflow-auto p-8 print:p-0 print:bg-white print:h-auto print:overflow-visible">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body,
          html {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          /* Ensure we override any global print hiding if it existed */
          body * {
            visibility: visible;
          }
          /* Hide everything by default if we were to use the approach of hiding siblings, 
             but here we are on a dedicated page, so we trust the layout. */
        }
        /* Hide scrollbars in print */
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Container simulating A4 paper for screen view */}
      <div
        className="bg-white shadow-2xl print:shadow-none print:w-full print:h-full print:m-0"
        style={{
          // A4 Dimensions: 210mm x 297mm
          width: config.design.orientation === "horizontal" ? "297mm" : "210mm",
          height:
            config.design.orientation === "horizontal" ? "210mm" : "297mm",
          // Scale for screen viewing if needed, but let's keep 1:1 for accuracy
          maxWidth: "100%",
          position: "relative",
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}
