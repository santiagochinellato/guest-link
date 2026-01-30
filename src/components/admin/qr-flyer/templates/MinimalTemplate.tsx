"use client";

import React from "react";

import { Wifi, Smartphone, Lock } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

interface TemplateProps {
  config: FlyerConfig;
  containerStyles?: string;
  qrRef?: React.RefObject<HTMLDivElement>;
}

// Helper Components
const QrSection = ({
  size = 260,
  content,
  branding,
  primaryColor,
}: {
  size?: number;
  content: FlyerConfig["content"];
  branding: FlyerConfig["branding"];
  primaryColor: string;
}) => {
  // Determine QR Content
  const qrData =
    content.qrType === "wifi"
      ? `WIFI:T:WPA;S:${content.networkName};P:${content.networkPassword};;`
      : content.guideUrl;

  return (
    <div className="flex flex-col items-center justify-center gap-2 print:break-inside-avoid">
      <HostlyLogoVertical
        className="h-32 w-auto"
        style={{ color: primaryColor }}
      />
      <div className="bg-white p-6 pt-0 shadow-sm border border-neutral-200 rounded-none print:border-neutral-300 print:shadow-none">
        <QrCode
          url={qrData}
          size={size}
          branding={branding}
          primaryColor={primaryColor}
          className="block"
        />
      </div>
      <div className="mt-8 flex items-center gap-3 text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 print:text-neutral-600">
        <Smartphone size={12} strokeWidth={2.5} />
        <span>
          {content.qrType === "wifi" ? "Scan to Connect" : "Scan to open"}
        </span>
      </div>
    </div>
  );
};

const NetworkInfo = ({
  className,
  content,
}: {
  className?: string;
  content: FlyerConfig["content"];
}) => (
  <div
    className={cn(
      "flex flex-col gap-6 w-full max-w-md print:break-inside-avoid",
      className,
    )}
  >
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2 print:text-gray-600">
        <Wifi size={14} className="text-gray-900 print:text-black" /> Red WiFi
      </p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight break-words print:text-black">
        {content.networkName}
      </p>
    </div>

    {content.showPassword && content.networkPassword && (
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2 print:text-gray-600">
          <Lock size={14} className="text-gray-900 print:text-black" />{" "}
          Contraseña
        </p>
        <div className="relative inline-block w-full">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight break-words print:text-black">
            {content.networkPassword}
          </p>
        </div>
      </div>
    )}
  </div>
);

export const MinimalTemplate: React.FC<TemplateProps> = ({
  config,
  containerStyles,
  qrRef,
}) => {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";
  const primaryColor = design.primaryColor || "#000000";

  // Dimensions for A4
  const a4Styles = isHorizontal
    ? { width: "297mm", height: "210mm" }
    : { width: "210mm", height: "297mm" };

  const containerClass = cn(
    "w-full h-full bg-white text-gray-900 font-sans flex overflow-hidden relative print:overflow-visible",
    containerStyles,
  );

  const printStyle = {
    WebkitPrintColorAdjust: "exact" as any,
    printColorAdjust: "exact" as any,
    ...a4Styles,
  };

  if (isHorizontal) {
    // HORIZONTAL CLEAN (842x595)
    return (
      <div ref={qrRef} className={cn(containerClass)} style={printStyle}>
        <div className="flex justify-center items-center h-full w-full">
          {/* Left Col: Welcome & Context (60%) */}
          <div className="w-[50%] h-full p-10 flex flex-col justify-center relative z-10">
            <div>
              <h1 className="text-6xl font-black leading-none tracking-tighter text-neutral-950 mb-6 max-w-lg print:text-black">
                {content.title || "Bienvenido"}
              </h1>
              <div className="flex flex-col gap-2">
                <p className="text-gray-500 leading-normal text-xl max-w-md font-medium print:text-gray-700">
                  {content.welcomeMessage ||
                    "Escanea el código QR para acceder a Internet y a nuestra guía local."}
                </p>
                <p className="text-gray-500 leading-normal text-xl max-w-md font-medium print:text-gray-600">
                  *
                  {content.welcomeMessageEn ||
                    "Scan this code to access the property guide, WiFi, and local recommendations."}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-8 print:border-gray-300">
              <NetworkInfo content={content} className="max-w-md" />
            </div>
          </div>

          {/* Right Col: Pure QR Focus (40%) */}
          <div className="w-[50%] h-full bg-[#fafafa] flex items-center justify-center p-8 relative border-l border-gray-100/50 print:bg-gray-50 print:border-gray-200">
            <QrSection
              size={400}
              content={content}
              branding={branding}
              primaryColor={primaryColor}
            />
          </div>
        </div>
      </div>
    );
  }

  // VERTICAL CLEAN (595x842)
  return (
    <div
      ref={qrRef}
      className={cn(containerClass, "flex-col p-12")}
      style={printStyle}
    >
      {/* Main Content (Hero) */}
      <main className="flex-1 flex flex-col items-center justify-start w-full mt-10">
        <div className="mb-10 text-center max-w-md mx-auto">
          <h1 className="text-5xl font-bold mb-4 tracking-tight text-gray-900 leading-tight print:text-black">
            {content.title || "Conéctate"}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 text-xl leading-relaxed print:text-gray-700">
              {content.welcomeMessage}
            </p>
            <p className="text-gray-500 text-xl leading-relaxed print:text-gray-600">
              *{content.welcomeMessageEn}
            </p>
          </div>
        </div>

        <QrSection
          size={400}
          content={content}
          branding={branding}
          primaryColor={primaryColor}
        />
      </main>

      {/* Footer / Network Info */}
      <footer className="w-full pt-8 pb-4 border-t border-gray-100 print:border-gray-300">
        <div className="flex flex-row items-start justify-between gap-10">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 print:text-gray-600">
              Red WiFi
            </p>
            <p className="text-xl font-bold text-gray-900 truncate print:text-black">
              {content.networkName}
            </p>
          </div>

          {content.showPassword && content.networkPassword && (
            <div className="flex-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 print:text-gray-600">
                Contraseña
              </p>
              <p className="text-xl font-bold text-gray-900 truncate print:text-black">
                {content.networkPassword}
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
