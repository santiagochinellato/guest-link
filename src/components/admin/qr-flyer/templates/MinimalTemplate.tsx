import React from "react";

import { Wifi, Smartphone, Lock } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";

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
}) => (
  <div className="flex flex-col items-center justify-center gap-2">
    <div
      className="h-15 w-[120px] opacity-90"
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
    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-2xl">
      <QrCode
        url={content.guideUrl}
        size={size}
        branding={branding}
        primaryColor={primaryColor}
        className="block"
      />
    </div>
    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
      <Smartphone size={14} />
      <span>Scan to connect</span>
    </div>
  </div>
);

const NetworkInfo = ({
  className,
  content,
}: {
  className?: string;
  content: FlyerConfig["content"];
}) => (
  <div className={cn("flex flex-col gap-6 w-full max-w-md", className)}>
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2">
        <Wifi size={14} className="text-gray-900" /> Red WiFi
      </p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight break-words">
        {content.networkName}
      </p>
    </div>

    {content.showPassword && content.networkPassword && (
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-2">
          <Lock size={14} className="text-gray-900" /> Contraseña
        </p>
        <div className="relative inline-block w-full">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight break-words">
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

  if (isHorizontal) {
    // HORIZONTAL CLEAN (842x595)
    return (
      <div
        ref={qrRef}
        className={cn(
          "w-full h-full flex bg-white text-gray-900 font-sans flex overflow-hidden",
          containerStyles,
        )}
      >
        <div className="flex justify-center items-center">
          {/* Left Col: Welcome & Context (60%) */}
          <div className="w-[60%] h-full p-10 flex flex-col justify-center relative z-10">
            <div>
              <h1 className="text-5xl font-bold leading-none tracking-tight text-gray-900 mb-4 max-w-md">
                {content.title || "Bienvenido"}
              </h1>
              <div className="flex flex-col gap-2">
                <p className="text-gray-500 leading-normal text-lg max-w-md font-medium">
                  {content.welcomeMessage ||
                    "Escanea el código QR para acceder a Internet y a nuestra guía local."}
                </p>
                <p className="text-gray-500 leading-normal text-sm max-w-md font-medium">
                  *
                  {content.welcomeMessageEn ||
                    "Scan this code to access the property guide, WiFi, and local recommendations."}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <NetworkInfo content={content} className="max-w-md" />
            </div>
          </div>

          {/* Right Col: Pure QR Focus (40%) */}
          <div className="w-[40%] h-full bg-[#fafafa] flex items-center justify-center p-8 relative border-l border-gray-100/50">
            <QrSection
              size={220}
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
      className={cn(
        "w-full h-full bg-white text-gray-900 font-sans flex flex-col relative overflow-hidden p-12",
        containerStyles,
      )}
    >
      {/* Header */}
      {/* Main Content (Hero) */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <div className="mb-10 text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900 leading-tight">
            {content.title || "Conéctate"}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 text-lg leading-relaxed">
              {content.welcomeMessage}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              *{content.welcomeMessageEn}
            </p>
          </div>
        </div>

        <QrSection
          size={260}
          content={content}
          branding={branding}
          primaryColor={primaryColor}
        />
      </main>

      {/* Footer / Network Info */}
      <footer className="w-full pt-2 border-t border-gray-100 ">
        <div className="flex flex-row items-start justify-between gap-10">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
              Red WiFi
            </p>
            <p className="text-xl font-bold text-gray-900 truncate">
              {content.networkName}
            </p>
          </div>

          {content.showPassword && content.networkPassword && (
            <div className="flex-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                Contraseña
              </p>
              <p className="text-xl font-bold text-gray-900 truncate">
                {content.networkPassword}
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
