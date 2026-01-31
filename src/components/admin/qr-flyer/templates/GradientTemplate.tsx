"use client";

import React from "react";
import { Wifi, ArrowRight, ScanLine, Lock } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

// --- Helper Components ---

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
  const qrData =
    content.qrType === "wifi"
      ? `WIFI:T:WPA;S:${content.networkName};P:${content.networkPassword};;`
      : content.guideUrl;

  return (
    <div className="relative group">
      {/* Glow effect behind QR */}
      <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full transform scale-110 pointer-events-none" />

      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] flex flex-col items-center relative z-20 mx-auto print:shadow-none print:border print:border-zinc-300 print:bg-white overflow-hidden">
        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />

        <HostlyLogoVertical
          className="h-20 w-auto mb-2 opacity-90 drop-shadow-sm"
          style={{ color: "white" }}
          // En modo print forzamos color oscuro si es necesario, o lo manejamos con CSS
        />

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <QrCode
            url={qrData}
            size={size}
            branding={branding}
            primaryColor={primaryColor}
            className="block"
          />
        </div>

        <div className="mt-6 flex items-center gap-2.5 text-white/90 text-sm font-bold uppercase tracking-[0.2em] drop-shadow-sm">
          <ScanLine size={16} className="text-white" />
          <span>
            {content.qrType === "wifi" ? "Scan to Connect" : "Scan Me"}
          </span>
        </div>
      </div>
    </div>
  );
};

const NetworkPill = ({
  label,
  value,
  isPassword = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  isPassword?: boolean;
  icon: any;
}) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-5 w-full relative z-20 shadow-lg hover:bg-white/15 transition-colors print:bg-white print:border-gray-300 print:text-black group">
    <div className="bg-white/20 p-3 rounded-xl text-white print:bg-gray-100 print:text-black shadow-inner">
      <Icon size={24} />
    </div>
    <div className="min-w-0 flex-1">
      <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1 block print:text-gray-500">
        {label}
      </span>
      <span
        className={cn(
          "text-white font-bold tracking-tight drop-shadow-sm truncate block print:text-black text-2xl leading-none",
          isPassword && "font-mono tracking-normal",
        )}
      >
        {value}
      </span>
    </div>
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

  // Complex gradient background logic
  const backgroundStyle = {
    background: `
        radial-gradient(circle at 0% 0%, ${primaryColor}dd 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, ${primaryColor} 0%, transparent 50%),
        linear-gradient(135deg, #1a1a1a 0%, #000000 100%)
    `,
    WebkitPrintColorAdjust: "exact" as any,
    printColorAdjust: "exact" as any,
  };

  const a4Styles = isHorizontal
    ? { width: "297mm", height: "210mm" }
    : { width: "210mm", height: "297mm" };

  const containerClass = cn(
    "relative overflow-hidden print:overflow-visible print:shadow-none bg-black transition-all duration-500 font-sans",
    containerStyles,
  );

  if (isHorizontal) {
    // --- HORIZONTAL LAYOUT ---
    return (
      <div
        ref={qrRef}
        className={cn(containerClass, "flex")}
        style={{ ...backgroundStyle, ...a4Styles }}
      >
        {/* Noise texture overlay for texture (optional) */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none print:hidden" />

        {/* Left: Content Area (60%) */}
        <div className="w-[60%] h-full p-16  flex flex-col justify-center relative z-10 gap-16">
          <div className="">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Wifi size={12} /> Guest Access
            </div>

            <h1 className="text-7xl font-black leading-[0.9] mb-6 tracking-tight text-white drop-shadow-2xl">
              {content.title || "Bienvenido"}
            </h1>

            <div className="space-y-2 border-l-4 border-white/20 pl-6">
              <p className="text-white/90 text-2xl font-medium max-w-lg leading-snug drop-shadow-md">
                {content.welcomeMessage ||
                  "Escanea para acceder a nuestra guía digital."}
              </p>
              {content.welcomeMessageEn && (
                <p className="text-white/60 text-lg font-medium max-w-lg leading-snug italic">
                  {content.welcomeMessageEn}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md w-full">
            <NetworkPill
              label="Red WiFi"
              value={content.networkName}
              icon={Wifi}
            />
            {content.showPassword && content.networkPassword && (
              <NetworkPill
                label="Contraseña"
                value={content.networkPassword}
                isPassword
                icon={Lock}
              />
            )}
          </div>
        </div>

        {/* Right: QR Area (40%) */}
        <div className="w-[40%] h-full flex items-center justify-center relative z-10 pr-12">
          {/* Decorative Circle behind QR */}
          <div className="absolute w-[120%] h-[80%] bg-white/5 rounded-full blur-[90px] left-[-20%] pointer-events-none" />

          <div className="transform transition-transform duration-500 hover:scale-105">
            <QrCard
              size={320}
              content={content}
              branding={branding}
              primaryColor={primaryColor}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- VERTICAL LAYOUT ---
  return (
    <div
      ref={qrRef}
      className={cn(
        containerClass,
        "flex flex-col items-center justify-between py-12 px-6",
      )}
      style={{ ...backgroundStyle, ...a4Styles }}
    >
      {/* Texture & Shapes */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none print:hidden" />
      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-black/40 to-transparent z-0 print:hidden" />

      {/* Header */}
      <header className="z-10 w-full flex flex-col items-center text-center max-w-2xl mx-auto pt-8">
        <h1 className="text-6xl font-black mb-6 drop-shadow-2xl tracking-tighter text-white leading-none">
          {content.title || "Conéctate"}
        </h1>
        <div className="space-y-3">
          <p className="text-white/95 text-2xl font-medium drop-shadow-md leading-tight">
            {content.welcomeMessage}
          </p>
          {content.welcomeMessageEn && (
            <p className="text-white/60 text-xl font-medium drop-shadow-sm italic">
              {content.welcomeMessageEn}
            </p>
          )}
        </div>
      </header>

      {/* Main QR */}
      <main className="z-10 relative py-8">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-white/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative transform scale-110">
          <QrCard
            size={300}
            content={content}
            branding={branding}
            primaryColor={primaryColor}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="z-10 pb-4 w-[100%]">
        <div className="flex justify-between gap-4 w-full">
          <div className="w-full">
            <NetworkPill
              label="Red WiFi"
              value={content.networkName}
              icon={Wifi}
            />
          </div>
          <div className="w-full">
            {" "}
            {content.showPassword && content.networkPassword && (
              <NetworkPill
                label="Contraseña"
                value={content.networkPassword}
                isPassword
                icon={Lock}
              />
            )}
          </div>
        </div>

        <div className="text-center mt-8 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
            Powered by GuestLink
          </p>
        </div>
      </footer>
    </div>
  );
};
