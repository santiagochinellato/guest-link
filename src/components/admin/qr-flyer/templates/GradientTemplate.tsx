"use client";

import React from "react";
import { Wifi, ArrowRight, ScanLine } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

// Helper Components
const QrCard = ({
  size,
  content,
  branding,
  primaryColor,
}: {
  size: number;
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
    <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-2xl flex flex-col items-center relative z-20 mx-auto print:shadow-none print:border print:border-gray-200 print:bg-white/50">
      <HostlyLogoVertical
        className="h-24 w-auto mb-2"
        style={{ color: primaryColor }}
      />
      <QrCode
        url={qrData}
        size={size}
        branding={branding}
        primaryColor={primaryColor}
        className="block"
      />
      <div className="mt-5 flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
        <ScanLine size={14} />{" "}
        <span>{content.qrType === "wifi" ? "Scan to Connect" : "Scan Me"}</span>
      </div>
    </div>
  );
};

const NetworkPill = ({
  label,
  value,
  isPassword = false,
}: {
  label: string;
  value: string;
  isPassword?: boolean;
}) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col w-full relative z-20 shadow-lg print:bg-white print:border-gray-200 print:text-black">
    <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1 print:text-gray-500">
      {label}
    </span>
    <span
      className={cn(
        "text-white font-bold tracking-wide drop-shadow-sm truncate print:text-black",
        isPassword ? "font-mono text-xl" : "text-xl",
      )}
    >
      {value}
    </span>
  </div>
);

interface TemplateProps {
  config: FlyerConfig;
  containerStyles?: string;
  qrRef?: React.RefObject<HTMLDivElement>;
}

export const GradientTemplate: React.FC<TemplateProps> = ({
  config,
  containerStyles,
  qrRef,
}) => {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";
  const primaryColor = design.primaryColor || "#D97706";

  // Ensure high contrast gradient with a dark overlay
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, #1a1a1a 100%)`,
    WebkitPrintColorAdjust: "exact" as any,
    printColorAdjust: "exact" as any,
  };

  // Dimensions for A4
  const a4Styles = isHorizontal
    ? { width: "297mm", height: "210mm" }
    : { width: "210mm", height: "297mm" };

  // Common container class
  const containerClass = cn(
    "relative overflow-hidden print:overflow-visible print:shadow-none bg-black",
    containerStyles,
  );

  if (isHorizontal) {
    // HORIZONTAL LAYOUT
    return (
      <div
        ref={qrRef}
        className={cn(containerClass, "flex")}
        style={{ ...backgroundStyle, ...a4Styles }}
      >
        {/* Dark overlay to guarantee text readability if primaryColor is light */}
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none print:hidden" />

        {/* Background Shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-white/5 rounded-full blur-[80px] z-0 print:hidden" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] bg-black/40 rounded-full blur-[80px] z-0 print:hidden" />

        {/* Left: Content */}
        <div className="w-[55%] h-full p-12 flex flex-col justify-center relative z-10 pl-20">
          <h1 className="text-5xl font-bold leading-[0.9] mb-6 tracking-tight drop-shadow-md text-white">
            {content.title || "Bienvenido"}
          </h1>
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-white/90 text-xl  font-medium max-w-sm leading-relaxed drop-shadow-sm">
              {content.welcomeMessage ||
                "Escanea para acceder a nuestra guía digital."}
            </p>
            <p className="text-white/90 text-xl font-medium max-w-sm leading-relaxed drop-shadow-sm opacity-80">
              *{content.welcomeMessageEn || "Welcome."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-sm ">
            <NetworkPill label="Red WiFi" value={content.networkName} />
            {content.showPassword && content.networkPassword && (
              <NetworkPill
                label="Contraseña"
                value={content.networkPassword}
                isPassword
              />
            )}
          </div>
        </div>

        {/* Right: QR Hero */}
        <div className="w-[45%] h-full flex items-center justify-center relative z-10 pr-8">
          <div className="transform  transition-transform duration-500">
            <QrCard
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

  // VERTICAL LAYOUT
  return (
    <div
      ref={qrRef}
      className={cn(
        containerClass,
        "flex flex-col items-center justify-center",
      )}
      style={{ ...backgroundStyle, ...a4Styles }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none print:hidden" />

      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-black/20 to-transparent z-0 print:hidden" />

      <main className="z-10 w-full flex flex-col items-center flex-grow justify-center mt-12">
        <div className="text-center mb-12 w-full max-w-md px-8">
          <h1 className="text-5xl font-black mb-6 drop-shadow-lg tracking-tight text-white leading-tight">
            {content.title || "Conéctate"}
          </h1>
          <div className="flex flex-col gap-3">
            <p className="text-white/90 text-xl font-medium shadow-black drop-shadow-md">
              {content.welcomeMessage}
            </p>
            <p className="text-white/70 text-xl font-medium shadow-black drop-shadow-md">
              {content.welcomeMessageEn}
            </p>
          </div>
        </div>

        <div className="relative mb-8 transform scale-110">
          <QrCard
            size={350}
            content={content}
            branding={branding}
            primaryColor={primaryColor}
          />
        </div>
      </main>

      <footer className="z-10 w-full mt-auto mb-16 px-12">
        <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between border border-white/20 shadow-lg print:bg-white print:border-gray-200">
            <div className="flex items-center gap-5 w-full">
              <div className="bg-white/20 p-3 rounded-full text-white print:bg-gray-100 print:text-black">
                <Wifi size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 print:text-gray-500">
                  Red WiFi
                </p>
                <p className="font-bold text-xl leading-none truncate pr-2 shadow-black drop-shadow-sm text-white print:text-black">
                  {content.networkName}
                </p>
              </div>
            </div>
          </div>

          {content.showPassword && content.networkPassword && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between border border-white/20 shadow-lg print:bg-white print:border-gray-200">
              <div className="flex items-center gap-5 w-full">
                <div className="bg-white/20 p-3 rounded-full text-white print:bg-gray-100 print:text-black">
                  <ArrowRight size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 print:text-gray-500">
                    Contraseña
                  </p>
                  <p className="font-mono text-xl tracking-wide leading-none truncate pr-2 shadow-black drop-shadow-sm text-white print:text-black">
                    {content.networkPassword}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
