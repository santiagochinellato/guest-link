"use client";

import React from "react";
import { Wifi, KeyRound } from "lucide-react";
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

const DoubleBorder = ({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color: string;
}) => (
  <div
    className="w-full h-full p-4 md:p-6 relative"
    style={{ borderColor: color }}
  >
    {/* Borde Externo */}
    <div
      className="absolute inset-0 border-[1px] opacity-30 pointer-events-none"
      style={{ borderColor: color }}
    />
    {/* Borde Interno */}
    <div
      className="absolute inset-2 md:inset-3 border-[3px] pointer-events-none"
      style={{ borderColor: color }}
    />
    <div className={cn("w-full h-full relative z-10 flex", className)}>
      {children}
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2 text-center">
    {children}
  </h3>
);

const SerifHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h1
    className={cn(
      "font-serif text-5xl md:text-6xl text-neutral-900 leading-[0.95] tracking-tight",
      className,
    )}
  >
    {children}
  </h1>
);

export const ElegantTemplate: React.FC<TemplateProps> = ({
  config,
  containerStyles,
  qrRef,
}) => {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";
  const primaryColor = design.primaryColor || "#000000";

  // Data Logic
  const qrData =
    content.qrType === "wifi"
      ? `WIFI:T:WPA;S:${content.networkName};P:${content.networkPassword};;`
      : content.guideUrl;

  const a4Styles = isHorizontal
    ? { width: "297mm", height: "210mm" }
    : { width: "210mm", height: "297mm" };

  const containerClass = cn(
    "w-full h-full bg-[#FAFAFA] text-neutral-900 font-sans flex overflow-hidden relative print:overflow-visible transition-colors duration-500 p-8",
    containerStyles,
  );

  const printStyle = {
    WebkitPrintColorAdjust: "exact" as any,
    printColorAdjust: "exact" as any,
    ...a4Styles,
  };

  if (isHorizontal) {
    // --- HORIZONTAL (Landscape) ---
    return (
      <div ref={qrRef} className={containerClass} style={printStyle}>
        <DoubleBorder color={primaryColor} className="flex-row items-center">
          {/* Left: Content & Context */}
          <div className="w-[55%] h-full flex flex-col justify-center items-center text-center p-12 border-r border-neutral-200/60 relative gap-6">
            <div className="mb-8">
              <HostlyLogoVertical
                className="h-32 w-auto opacity-80"
                style={{ color: primaryColor }}
              />
            </div>

            <div className="space-y-6 max-w-lg">
              <SerifHeading className="text-3xl">
                {content.title || "Bienvenido"}
              </SerifHeading>
              <div className="w-16 h-[2px] bg-neutral-900 mx-auto opacity-20" />
              <p className="text-xl text-neutral-600 font-light italic leading-relaxed font-serif">
                "{content.welcomeMessage}"
              </p>
            </div>

            <div className="w-full pt-8">
              <div className="flex justify-center gap-12 text-left">
                <div>
                  <SectionTitle>Red / Network</SectionTitle>
                  <p className="text-xl font-medium text-center font-serif text-neutral-800">
                    {content.networkName}
                  </p>
                </div>
                {content.showPassword && content.networkPassword && (
                  <div>
                    <SectionTitle>Clave / Pass</SectionTitle>
                    <p className="text-xl font-medium text-center font-serif text-neutral-800">
                      {content.networkPassword}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="w-[45%] h-full flex flex-col justify-center items-center bg-white relative">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative p-6 border border-neutral-100 shadow-sm bg-white">
              {/* Esquinas decorativas del QR */}
              <div
                className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
                style={{ borderColor: primaryColor }}
              />
              <div
                className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
                style={{ borderColor: primaryColor }}
              />
              <div
                className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
                style={{ borderColor: primaryColor }}
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
                style={{ borderColor: primaryColor }}
              />

              <QrCode
                url={qrData}
                size={280}
                branding={branding}
                primaryColor={primaryColor}
              />
            </div>

            <p className="mt-8 font-serif italic text-neutral-400 text-lg">
              Scan to connect
            </p>
          </div>
        </DoubleBorder>
      </div>
    );
  }

  // --- VERTICAL (Portrait) ---
  return (
    <div ref={qrRef} className={containerClass} style={printStyle}>
      <DoubleBorder color={primaryColor} className="flex-col items-center">
        {/* Top: Branding Area */}
        <div className="w-full flex flex-col items-center pt-6 pb-0 px-8 text-center relative z-10">
          <HostlyLogoVertical
            className="h-24 w-auto mb-2 opacity-90"
            style={{ color: primaryColor }}
          />

          <SerifHeading className="mb-6">{content.title}</SerifHeading>

          <div className="w-12 h-1 bg-neutral-900 mx-auto mb-6 opacity-10" />

          <p className="text-2xl text-neutral-600 font-light font-serif italic max-w-xl leading-relaxed">
            "{content.welcomeMessage}"
          </p>
          {content.welcomeMessageEn && (
            <p className="text-base text-neutral-400 font-light mt-3">
              {content.welcomeMessageEn}
            </p>
          )}
        </div>

        {/* Center: The Framed QR */}
        <div className="flex-grow flex flex-col justify-center items-center w-full py-6">
          <div className="p-8 bg-white shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative">
            {/* Marco interno fino */}
            <div className="absolute inset-2 border border-neutral-100 pointer-events-none" />

            <QrCode
              url={qrData}
              size={320}
              branding={branding}
              primaryColor={primaryColor}
            />

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 shadow-sm border border-neutral-100">
              <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                {content.qrType === "wifi" ? "WiFi Access" : "Guest Guide"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Details Box */}
        <div className="w-[100%] px-8  mb-12">
          <div className="border-t border-b border-neutral-200 py-8 flex gap-6 justify-between items-center bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-neutral-100 text-neutral-600">
                <Wifi size={18} />
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  Network
                </p>
                <p className="text-xl font-serif text-neutral-900">
                  {content.networkName}
                </p>
              </div>
            </div>

            {content.showPassword && content.networkPassword && (
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-neutral-100 text-neutral-600">
                  <KeyRound size={18} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    Password
                  </p>
                  <p className="text-xl font-serif text-neutral-900">
                    {content.networkPassword}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <p className="font-serif italic text-neutral-300 text-sm">
              Thank you for staying with us
            </p>
          </div>
        </div>
      </DoubleBorder>
    </div>
  );
};
