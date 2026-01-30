"use client";
import React from "react";
import { Wifi, ScanLine, CheckCircle2, Scan } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

// --- Helper Components ---

const MainCard = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={cn(
      "bg-white rounded-xl shadow-2xl border-[8px] border-white overflow-hidden relative z-20 print:shadow-none print:border-[4px] print:border-zinc-200 transition-all duration-300",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

const InfoCard = ({
  icon: Icon,
  label,
  value,
  isMono = false,
  primaryColor,
}: {
  icon: any;
  label: string;
  value: string;
  isMono?: boolean;
  primaryColor: string;
}) => (
  <div className="bg-white p-3 md:p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.01] relative z-20 print:border-gray-200 print:shadow-none print:break-inside-avoid">
    <div
      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 print:bg-gray-50"
      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
    >
      <Icon size={20} className="md:w-6 md:h-6 print:text-black" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-0.5 print:text-gray-600">
        {label}
      </p>
      <p
        className={cn(
          "text-gray-900 font-bold truncate text-base md:text-lg tracking-tight print:text-black",
          isMono && "font-mono text-base md:text-lg tracking-tight",
        )}
      >
        {value}
      </p>
    </div>
  </div>
);

// Decoración de fondo sutil (Patrón geométrico)
const DecorativeBackground = ({ primaryColor }: { primaryColor: string }) => (
  <div
    className="absolute inset-0 z-0 overflow-hidden bg-slate-50 print:bg-white pointer-events-none"
    style={{ color: primaryColor }}
  >
    {/* Círculo difuminado 1 */}
    <div
      className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-[0.08] print:hidden"
      style={{ backgroundColor: primaryColor }}
    />
    {/* Círculo difuminado 2 */}
    <div
      className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-[0.08] print:hidden"
      style={{ backgroundColor: primaryColor }}
    />

    {/* Acento Geométrico Esquina Superior Izquierda */}
    <svg
      className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-[0.05] print:opacity-[0.1]"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <circle cx="0" cy="0" r="80" />
    </svg>

    {/* Acento Geométrico Esquina Inferior Derecha */}
    <svg
      className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-[0.05] print:opacity-[0.1] rotate-180"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path d="M0 0 L100 0 L100 100 Z" />
    </svg>
  </div>
);

interface TemplateProps {
  config: FlyerConfig;
  containerStyles?: string;
  qrRef?: React.RefObject<HTMLDivElement>;
}

export const CardTemplate: React.FC<TemplateProps> = ({
  config,
  containerStyles,
  qrRef,
}) => {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";
  const primaryColor = design.primaryColor || "#000000";

  // Determine QR Content
  const qrData =
    content.qrType === "wifi"
      ? `WIFI:T:WPA;S:${content.networkName};P:${content.networkPassword};;`
      : content.guideUrl;

  // Dimensions for A4
  const a4Styles = isHorizontal
    ? { width: "297mm", height: "210mm" }
    : { width: "210mm", height: "297mm" };

  const containerClass = cn(
    "w-full h-full relative font-sans p-8 md:p-12 flex bg-slate-50 print:bg-white overflow-hidden relative print:overflow-visible transition-colors duration-500",
    containerStyles,
  );

  const printStyle = {
    WebkitPrintColorAdjust: "exact" as any,
    printColorAdjust: "exact" as any,
    ...a4Styles,
  };

  if (isHorizontal) {
    // --- HORIZONTAL LAYOUT (Landscape) ---
    return (
      <div
        ref={qrRef}
        className={cn(containerClass, "flex-row items-stretch gap-12")}
        style={printStyle}
      >
        <DecorativeBackground primaryColor={primaryColor} />

        {/* Left: Main QR Card (Hero) - Ahora más destacado */}
        <div className="w-[40%] h-full flex flex-col relative z-10 justify-center">
          <MainCard className="relative bg-white flex flex-col items-center justify-center p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] h-auto aspect-[3/4]">
            {/* Borde sutil interno */}
            <div className="absolute inset-2 border border-gray-100 rounded-lg pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
              <HostlyLogoVertical
                className="h-24 w-auto opacity-90"
                style={{ color: primaryColor }}
              />

              <div className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <QrCode
                  url={qrData}
                  size={280}
                  branding={branding}
                  primaryColor={primaryColor}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-gray-900 font-black uppercase tracking-widest text-lg">
                <Scan className="w-5 h-5" style={{ color: primaryColor }} />
                <span>Scan Me</span>
              </div>
              <div
                className="h-1 w-12 rounded-full"
                style={{ backgroundColor: primaryColor }}
              ></div>
            </div>
          </MainCard>
        </div>

        {/* Right: Info & Context */}
        <div className="w-[60%] h-full flex flex-col justify-center relative z-10 pl-4 py-8">
          <div className="flex flex-col justify-center gap-8 h-full">
            {/* Header Text */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
                Guest Guide & WiFi
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[0.95] mb-2 print:text-black">
                {content.title || "Bienvenido"}
              </h1>
              <div
                className="space-y-2 border-l-4 pl-4"
                style={{ borderColor: primaryColor }}
              >
                <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed max-w-lg print:text-gray-700">
                  {content.welcomeMessage ||
                    "Esperamos que disfrutes tu estadía."}
                </p>
                {content.welcomeMessageEn && (
                  <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed max-w-lg italic">
                    {content.welcomeMessageEn}
                  </p>
                )}
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 gap-3 w-full">
              <InfoCard
                icon={Wifi}
                label="Red WiFi / Network"
                value={content.networkName}
                primaryColor={primaryColor}
              />
              {content.showPassword && content.networkPassword && (
                <InfoCard
                  icon={Wifi}
                  label="Contraseña / Password"
                  value={content.networkPassword}
                  isMono
                  primaryColor={primaryColor}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VERTICAL LAYOUT (Portrait) ---
  return (
    <div
      ref={qrRef}
      className={cn(containerClass, "flex-col justify-between")}
      style={printStyle}
    >
      <DecorativeBackground primaryColor={primaryColor} />

      {/* Top: Header w/ Brand */}
      <div className="relative z-10 w-full flex flex-col items-center text-center  space-y-6">
        <HostlyLogoVertical
          className="h-16 md:h-32 w-auto opacity-90 mb-4"
          style={{ color: primaryColor }}
        />

        <div className="space-y-4 max-w-lg mx-auto">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-none print:text-black">
            {content.title}
          </h1>
          <div
            className="h-1.5 w-20 mx-auto rounded-full opacity-30"
            style={{ backgroundColor: primaryColor }}
          />
          <p className="text-gray-500 font-medium text-xl md:text-2xl leading-relaxed print:text-gray-700 px-4">
            {content.welcomeMessage}
          </p>
        </div>
      </div>

      {/* Middle: Hero QR Card */}
      <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full py-8">
        <div className="relative">
          {/* Elemento decorativo detrás del QR */}
          <div
            className="absolute -inset-4 rounded-[2rem] opacity-20 rotate-3"
            style={{ backgroundColor: primaryColor }}
          ></div>
          <div
            className="absolute -inset-4 rounded-[2rem] opacity-20 -rotate-3"
            style={{ backgroundColor: primaryColor }}
          ></div>

          <MainCard className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-0 ring-1 ring-black/5 flex flex-col items-center gap-6 relative">
            <div className="bg-white p-2 rounded-xl">
              <QrCode
                url={qrData}
                size={250}
                branding={branding}
                primaryColor={primaryColor}
              />
            </div>

            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-50 border border-gray-100">
              <ScanLine size={18} style={{ color: primaryColor }} />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-600">
                {content.qrType === "wifi"
                  ? "Escanear para conectar"
                  : "Escanear Guía"}
              </span>
            </div>
          </MainCard>
        </div>
      </div>

      {/* Bottom: Info Cards */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-3 mb-8 print:space-y-4 px-4">
        <InfoCard
          icon={Wifi}
          label="Red WiFi / Network"
          value={content.networkName}
          primaryColor={primaryColor}
        />
        {content.showPassword && content.networkPassword && (
          <InfoCard
            icon={Wifi}
            label="Contraseña / Password"
            value={content.networkPassword}
            isMono
            primaryColor={primaryColor}
          />
        )}

        <div className="text-center pt-6 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Powered by HOSTLY
          </p>
        </div>
      </div>
    </div>
  );
};
