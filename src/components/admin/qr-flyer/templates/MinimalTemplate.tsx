"use client";

import React from "react";
import { Wifi, Smartphone, ArrowRight, Lock } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

interface TemplateProps {
  config: FlyerConfig;
  containerStyles?: string;
  qrRef?: React.RefObject<HTMLDivElement>;
}

// --- Componentes Auxiliares ---

const Divider = ({ className }: { className?: string }) => (
  <div className={cn("w-16 h-[1px] bg-neutral-900/20 my-8", className)} />
);

const NetworkDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold mb-2">
      {label}
    </span>
    <span className="text-2xl font-medium text-neutral-900 font-mono tracking-tight leading-none break-all">
      {value}
    </span>
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

  // Data
  const qrData =
    content.qrType === "wifi"
      ? `WIFI:T:WPA;S:${content.networkName};P:${content.networkPassword};;`
      : content.guideUrl;

  const a4Styles = isHorizontal
    ? { width: "297mm", height: "210mm" }
    : { width: "210mm", height: "297mm" };

  const containerClass = cn(
    "w-full h-full bg-white text-neutral-900 font-sans flex overflow-hidden relative print:overflow-visible transition-colors duration-500",
    containerStyles,
  );

  const printStyle = {
    WebkitPrintColorAdjust: "exact" as any,
    printColorAdjust: "exact" as any,
    ...a4Styles,
  };

  if (isHorizontal) {
    // --- HORIZONTAL (Landscape) ---
    // Diseño asimétrico elegante: 2/3 contenido, 1/3 barra lateral de marca
    return (
      <div ref={qrRef} className={cn(containerClass)} style={printStyle}>
        {/* Left Column: Brand Bar (35%) */}
        <div
          className="w-[35%] h-full flex flex-col justify-between p-16 relative overflow-hidden bg-neutral-50 print:bg-neutral-50"
          style={{ backgroundColor: `${primaryColor}08` }} // 5% opacity background tint
        >
          {/* Decorative line */}
          <div
            className="absolute top-0 left-0 w-1.5 h-full"
            style={{ backgroundColor: primaryColor }}
          />

          <HostlyLogoVertical
            className="h-64 w-auto opacity-100"
            style={{ color: primaryColor }}
          />

          <div className="space-y-10">
            <NetworkDetail label="Network" value={content.networkName} />
            {content.showPassword && content.networkPassword && (
              <NetworkDetail label="Password" value={content.networkPassword} />
            )}
          </div>
        </div>

        {/* Right Column: Main Content (65%) */}
        <div className="w-[65%] h-full p-20 flex flex-col justify-center items-start pl-24 pb-16">
          <div className="mb-auto w-full">
            <div className="flex items-center gap-4 mb-8">
              <span className="inline-block py-1.5 px-4 border border-neutral-200 rounded-full text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                Guest Access
              </span>
              <div className="h-px flex-1 bg-neutral-100" />
            </div>

            <h1 className="text-7xl font-light tracking-tighter text-neutral-900 mb-6 leading-[0.9]">
              {content.title || "Bienvenido"}
            </h1>
            <p className="text-2xl text-neutral-500 font-light max-w-lg leading-snug">
              {content.welcomeMessage}
            </p>
          </div>

          <div className="flex items-center gap-16 mt-12 w-full">
            <div className="relative group">
              {/* Marco sutil alrededor del QR */}
              <div className="absolute -inset-6 border border-neutral-100 rounded-2xl bg-neutral-50/50" />
              <div className="absolute -inset-px border border-neutral-200 rounded-lg pointer-events-none" />
              <QrCode
                url={qrData}
                size={260}
                branding={branding}
                primaryColor={primaryColor}
                className="relative z-10"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-full bg-neutral-50 text-neutral-900 border border-neutral-100">
                  <Smartphone size={32} strokeWidth={1} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold uppercase tracking-wide">
                    Scan Code
                  </span>
                  <span className="text-sm text-neutral-400 font-medium mt-1">
                    To connect instantly
                  </span>
                </div>
              </div>

              <div className="h-px w-24 bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VERTICAL (Portrait) ---
  // Diseño centralizado, mucho aire, tipografía editorial
  return (
    <div
      ref={qrRef}
      className={cn(containerClass, "flex-col items-center")}
      style={printStyle}
    >
      {/* Top Decoration */}
      <div
        className="w-full h-3 absolute top-0 left-0"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header Section */}
      <header className="w-full pt-10  flex flex-col items-center text-center px-4">
        <HostlyLogoVertical
          className="h-32 w-auto mb-6 opacity-100"
          style={{ color: primaryColor }}
        />

        <h1 className="text-7xl font-light text-neutral-900 mb-8 tracking-tighter leading-none">
          {content.title}
        </h1>

        <Divider className="w-24 my-4" />

        <p className="text-2xl text-neutral-500 font-light max-w-xl leading-relaxed px-4">
          {content.welcomeMessage}
        </p>
        {content.welcomeMessageEn && (
          <p className="text-base text-neutral-400 font-light max-w-md mt-4 italic">
            {content.welcomeMessageEn}
          </p>
        )}
      </header>

      {/* Main QR Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="p-6 bg-neutral-50/50 rounded-[2.5rem] relative border border-neutral-100">
          {/* Esquinas decorativas - Ahora más finas y elegantes */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[1px] border-l-[1px] border-neutral-400 rounded-tl-2xl -translate-x-3 -translate-y-3" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-neutral-400 rounded-tr-2xl translate-x-3 -translate-y-3" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-neutral-400 rounded-bl-2xl -translate-x-3 translate-y-3" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1px] border-r-[1px] border-neutral-400 rounded-br-2xl translate-x-3 translate-y-3" />

          <QrCode
            url={qrData}
            size={300}
            branding={branding}
            primaryColor={primaryColor}
          />
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.3em] text-neutral-400">
          <Wifi size={18} strokeWidth={2.5} />
          <span>Scan to Connect</span>
        </div>
      </main>

      {/* Footer Details */}
      <footer className="w-full">
        <div className="flex flex-col justify-between items-end border-t border-neutral-200 pt-2 pb-8">
          <div className="space-y-8 w-full flex justify-between px-16">
            <NetworkDetail label="Wi-Fi Network" value={content.networkName} />
            {content.showPassword && content.networkPassword && (
              <NetworkDetail label="Password" value={content.networkPassword} />
            )}
          </div>

          <div className="flex justify-center items-center gap-2 w-full opacity-60 mt-8 md:mt-0">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold ">
              Powered by
            </p>
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              HOSTLY
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
