import React from "react";
import { Wifi, ScanLine, CheckCircle2 } from "lucide-react";
import { QrCode } from "../QrCode";
import { FlyerConfig } from "../types";
import { cn } from "@/lib/utils";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

// Helper Components
const MainCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative z-20",
      className,
    )}
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
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/60 flex items-center gap-4 transition-transform hover:scale-[1.02] relative z-20">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
    >
      <Icon size={24} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "text-gray-900 font-bold truncate font-mono text-xl tracking-tight",
          isMono && "font-mono text-xl tracking-tight",
        )}
      >
        {value}
      </p>
    </div>
  </div>
);

const Background = ({ primaryColor }: { primaryColor: string }) => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50">
    <div
      className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full blur-[100px] opacity-[0.05]"
      style={{ backgroundColor: primaryColor }}
    />
    <div
      className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full blur-[100px] opacity-[0.05]"
      style={{ backgroundColor: primaryColor }}
    />
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

  if (isHorizontal) {
    // HORIZONTAL (842x595)
    return (
      <div
        ref={qrRef}
        className={cn(
          "w-full h-full relative font-sans p-8 flex flex-row items-center gap-8 bg-slate-50",
          containerStyles,
        )}
      >
        <Background primaryColor={primaryColor} />

        {/* Left: Main QR Card (Hero) */}
        <div className="w-[45%] h-full flex flex-col relative z-10">
          <MainCard className="h-full flex flex-col items-center justify-center p-6 relative ring-1 ring-gray-900/5">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <HostlyLogoVertical
                className="h-40 w-[200px]"
                style={{ color: primaryColor }}
              />
              <QrCode
                url={content.guideUrl}
                size={240}
                branding={branding}
                primaryColor={primaryColor}
                className="rounded-xl shadow-lg"
              />
            </div>

            <div className="mt-auto mb-2 flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-xs">
              <ScanLine size={16} /> <span>Escanear para acceder</span>
            </div>
          </MainCard>
        </div>

        {/* Right: Info & Context */}
        <div className="w-[55%] h-full flex flex-col justify-center relative z-10 pl-2">
          <div className="flex-1 flex flex-col justify-center gap-6  ">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-[0.9] mb-4 drop-shadow-sm">
                {content.title || "WiFi Access"}
              </h1>
              <div className="flex flex-col gap-2">
                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                  {content.welcomeMessage || "Bienvenido."}
                </p>
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                  *{content.welcomeMessageEn || "Welcome."}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <InfoCard
                icon={Wifi}
                label="Red WiFi"
                value={content.networkName}
                primaryColor={primaryColor}
              />
              {content.showPassword && content.networkPassword && (
                <InfoCard
                  icon={Wifi}
                  label="Contraseña"
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

  // VERTICAL (595x842)
  return (
    <div
      ref={qrRef}
      className={cn(
        "w-full h-full relative font-sans p-8 flex flex-col bg-slate-50",
        containerStyles,
      )}
    >
      <Background primaryColor={primaryColor} />

      {/* Top: Header w/ Brand */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mb-2 pt-4">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none mb-3">
          {content.title}
        </h1>
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 font-medium text-lg max-w-md leading-relaxed">
            {content.welcomeMessage}
          </p>
          <p className="text-gray-500 font-medium text-sm max-w-md leading-relaxed">
            *{content.welcomeMessageEn}
          </p>
        </div>
      </div>

      {/* Middle: Floating QR Card (Hero) */}
      <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full min-h-0">
        <MainCard className="p-4 shadow-2xl w-full max-w-[280px] aspect-[4/5] flex flex-col items-center justify-between ring-1 ring-gray-900/5 bg-white">
          <div className="flex-grow flex flex-col items-center justify-center">
            <HostlyLogoVertical
              className="h-20 w-[120px]"
              style={{ color: primaryColor }}
            />
            <QrCode
              url={content.guideUrl}
              size={200}
              branding={branding}
              primaryColor={primaryColor}
            />
          </div>

          <div className="w-full pt-4 border-t border-gray-100 text-center mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
              <CheckCircle2 size={12} className="text-green-600" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
                Verificado
              </span>
            </div>
          </div>
        </MainCard>
      </div>

      {/* Bottom: Stacked Info Cards */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-3 mt-4">
        <InfoCard
          icon={Wifi}
          label="Red WiFi"
          value={content.networkName}
          primaryColor={primaryColor}
        />
        {content.showPassword && content.networkPassword && (
          <InfoCard
            icon={Wifi}
            label="Contraseña"
            value={content.networkPassword}
            isMono
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  );
};
