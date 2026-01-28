import React from "react";
import { Wifi, ArrowRight, ScanLine } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";

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
}) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center relative z-20 mx-auto">
    <div
      className="h-15"
      style={{
        maskImage: 'url("/guestText.svg")',
        WebkitMaskImage: 'url("/guestText.svg")',
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        backgroundColor: primaryColor,
        aspectRatio: "1009 / 800",
      }}
    />
    <QrCode
      url={content.guideUrl}
      size={size}
      branding={branding}
      primaryColor={primaryColor}
      className="block"
    />
    <div className="mt-5 flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
      <ScanLine size={14} /> <span>Scan Me</span>
    </div>
  </div>
);

const NetworkPill = ({
  label,
  value,
  isPassword = false,
}: {
  label: string;
  value: string;
  isPassword?: boolean;
}) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col w-full relative z-20 shadow-lg">
    <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">
      {label}
    </span>
    <span
      className={cn(
        "text-white font-bold tracking-wide drop-shadow-sm truncate",
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
  const primaryColor = design.primaryColor || "#0f756d";

  // Ensure high contrast gradient with a dark overlay
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, #000000 100%)`,
  };

  if (isHorizontal) {
    // HORIZONTAL LAYOUT
    return (
      <div
        ref={qrRef}
        className={cn(
          "w-full h-full text-white font-sans flex overflow-hidden relative",
          containerStyles,
        )}
        style={backgroundStyle}
      >
        {/* Dark overlay to guarantee text readability if primaryColor is light */}
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

        {/* Background Shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-white/5 rounded-full blur-[80px] z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] bg-black/40 rounded-full blur-[80px] z-0" />

        {/* Left: Content */}
        <div className="w-[55%] h-full p-12 flex flex-col justify-center relative z-10">
          <h1 className="text-5xl font-bold leading-[0.9] mb-6 tracking-tight drop-shadow-md">
            {content.title || "Bienvenido"}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-white/90 text-lg  font-medium max-w-sm leading-relaxed drop-shadow-sm">
              {content.welcomeMessage ||
                "Escanea para acceder a nuestra guía digital."}
            </p>
            <p className="text-white/90 text-sm mb-8 font-medium max-w-sm leading-relaxed drop-shadow-sm">
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
              size={240}
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
        "w-full h-full text-white font-sans flex flex-col items-center justify-center p-10 relative overflow-hidden",
        containerStyles,
      )}
      style={backgroundStyle}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-black/20 to-transparent z-0" />

      <main className="z-10 w-full flex flex-col items-center flex-grow justify-center mt-6">
        <div className="text-center mb-10 w-full max-w-sm">
          <h1 className="text-4xl font-black mb-3 drop-shadow-lg tracking-tight">
            {content.title || "Conéctate"}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-white/80 text-lg font-medium shadow-black drop-shadow-md">
              {content.welcomeMessage}
            </p>
            <p className="text-white/80 text-sm font-medium shadow-black drop-shadow-md">
              *{content.welcomeMessageEn}
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <QrCard
            size={250}
            content={content}
            branding={branding}
            primaryColor={primaryColor}
          />
        </div>
      </main>

      <footer className="z-10 w-full mt-auto mb-2">
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between border border-white/20 shadow-lg">
            <div className="flex items-center gap-4 w-full">
              <div className="bg-white/20 p-2.5 rounded-full text-white">
                <Wifi size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Red WiFi
                </p>
                <p className="font-bold text-lg leading-none truncate pr-2 shadow-black drop-shadow-sm">
                  {content.networkName}
                </p>
              </div>
            </div>
          </div>

          {content.showPassword && content.networkPassword && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between border border-white/20 shadow-lg">
              <div className="flex items-center gap-4 w-full">
                <div className="bg-white/20 p-2.5 rounded-full text-white">
                  <ArrowRight size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Contraseña
                  </p>
                  <p className="font-mono text-xl tracking-wide leading-none truncate pr-2 shadow-black drop-shadow-sm">
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
