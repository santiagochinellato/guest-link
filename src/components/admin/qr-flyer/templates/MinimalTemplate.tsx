import { Wifi } from "lucide-react";
import { FlyerConfig } from "../types";
import { QrCode } from "../QrCode";
import { cn } from "@/lib/utils";

interface TemplateProps {
  config: FlyerConfig;
  containerStyles: string;
  qrRef: React.RefObject<HTMLDivElement>;
}

export function MinimalTemplate({
  config,
  containerStyles,
  qrRef,
}: TemplateProps) {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";

  return (
    <div ref={qrRef} className={containerStyles}>
      {isHorizontal ? (
        // Horizontal Layout
        <div className="flex w-full h-full">
          {/* Left Side: Image */}
          <div className="w-[40%] h-full relative overflow-hidden bg-slate-100">
            {branding.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={branding.logo}
                alt="Header"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <div className="bg-white/90 text-slate-900 backdrop-blur-md px-4 py-2 rounded-lg inline-block mb-3 shadow-lg">
                <span className="font-bold tracking-widest text-xs uppercase">
                  Welcome
                </span>
              </div>
              <h2 className="text-3xl font-extrabold leading-tight drop-shadow-md">
                {content.title}
              </h2>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-[60%] h-full p-12 flex flex-col items-center justify-center text-center">
            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ backgroundColor: design.primaryColor }}
            />
            <p className="text-slate-500 font-medium text-lg mb-8 max-w-[90%] leading-relaxed">
              {content.welcomeMessage}
            </p>

            <div className="flex items-center gap-8 mb-8">
              <div className="relative p-3 bg-white rounded-2xl shadow-xl border border-slate-100">
                <QrCode
                  url={content.guideUrl}
                  branding={branding}
                  primaryColor={design.primaryColor}
                  size={160}
                />
              </div>
              <div className="text-left space-y-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Wi-Fi Network
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-600">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">
                      {content.networkName}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Password
                  </p>
                  <p className="text-lg font-mono font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded border border-slate-100 inline-block">
                    {content.showPassword
                      ? content.networkPassword
                      : "••••••••"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 w-full text-center">
              <p className="text-slate-400 text-sm font-medium">
                Scan to view the full digital guide
              </p>
            </div>
          </div>
          <div
            className="absolute right-0 top-0 bottom-0 w-2"
            style={{ backgroundColor: design.primaryColor }}
          />
        </div>
      ) : (
        // Vertical Layout (Original)
        <>
          <div className="w-full h-[35%] relative overflow-hidden">
            {branding.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={branding.logo}
                alt="Header"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                Header Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <span className="font-bold text-slate-800 tracking-tight text-lg uppercase">
                INFOHOUSE
              </span>
            </div>
          </div>

          <div className="flex-1 px-12 py-10 flex flex-col items-center w-full text-center">
            <div
              className="w-16 h-1 rounded-full mb-8"
              style={{ backgroundColor: design.primaryColor }}
            />

            <h2 className="text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              {content.title}
            </h2>
            <p className="text-slate-500 font-medium text-lg mb-10 max-w-[80%]">
              {content.welcomeMessage}
            </p>

            <div className="relative p-3 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 mb-8">
              <QrCode
                url={content.guideUrl}
                branding={branding}
                primaryColor={design.primaryColor}
                size={200}
                className="rounded-2xl overflow-hidden"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                Scan for Guide
              </div>
            </div>

            <div className="mt-auto w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${design.primaryColor}20`,
                    color: design.primaryColor,
                  }}
                >
                  <Wifi className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Wi-Fi Network
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {content.networkName}
                  </p>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="text-left pr-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Password
                </p>
                <p className="text-lg font-mono font-bold text-slate-800">
                  {content.showPassword ? content.networkPassword : "••••••••"}
                </p>
              </div>
            </div>
          </div>
          <div
            className="w-full h-3"
            style={{ backgroundColor: design.primaryColor }}
          />
        </>
      )}
    </div>
  );
}
