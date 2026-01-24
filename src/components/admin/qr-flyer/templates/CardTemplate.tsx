import { Wifi } from "lucide-react";
import { FlyerConfig } from "../types";
import { QrCode } from "../QrCode";
import { cn } from "@/lib/utils";

interface TemplateProps {
  config: FlyerConfig;
  containerStyles: string;
  qrRef: React.RefObject<HTMLDivElement>;
}

export function CardTemplate({
  config,
  containerStyles,
  qrRef,
}: TemplateProps) {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";

  return (
    <div ref={qrRef} className={cn(containerStyles, "bg-slate-50")}>
      {/* Top Banner decoration */}
      <div
        className="w-full h-32 absolute top-0 left-0"
        style={{ backgroundColor: design.primaryColor }}
      />

      <div className="relative z-10 w-full h-full p-12 flex flex-col items-center justify-center">
        {isHorizontal ? (
          // Horizontal Floating Card
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex h-[400px]">
            <div className="w-1/2 bg-slate-100 relative h-full">
              {branding.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={branding.logo}
                  alt="Bg"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  Image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                  {content.title}
                </h2>
                <div className="flex gap-8 border-t border-white/20 pt-6">
                  <div>
                    <p className="text-xs font-bold uppercase opacity-75 mb-1">
                      Network
                    </p>
                    <p className="font-bold text-lg">{content.networkName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase opacity-75 mb-1">
                      Password
                    </p>
                    <p className="font-mono text-lg">
                      {content.showPassword ? content.networkPassword : "••••"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 p-10 flex flex-col items-center justify-center text-center">
              <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                {content.welcomeMessage}
              </p>
              <div className="border-2 border-dashed border-slate-200 p-2 rounded-xl">
                <QrCode
                  url={content.guideUrl}
                  branding={branding}
                  primaryColor={design.primaryColor}
                  size={170}
                />
              </div>
              <div className="mt-8 text-slate-400 font-medium text-xs flex items-center gap-2 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Digital Guide
              </div>
            </div>
          </div>
        ) : (
          // Vertical (Original)
          <>
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              {branding.logo && (
                <div className="h-48 w-full bg-slate-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={branding.logo}
                    alt="Header"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 text-white">
                    <h2 className="text-3xl font-bold">{content.title}</h2>
                  </div>
                </div>
              )}

              <div className="p-8 flex flex-col items-center text-center">
                {!branding.logo && (
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">
                    {content.title}
                  </h2>
                )}

                <p className="text-slate-600 mb-8 leading-relaxed">
                  {content.welcomeMessage}
                </p>

                <div className="border-2 border-dashed border-slate-200 p-2 rounded-xl mb-8">
                  <QrCode
                    url={content.guideUrl}
                    branding={branding}
                    primaryColor={design.primaryColor}
                    size={180}
                  />
                </div>

                <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">
                    <div className="text-center">
                      <Wifi className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-bold text-slate-800">
                        {content.networkName}
                      </p>
                    </div>
                    <div className="text-center pl-4">
                      <div className="mx-auto mb-2 text-xs font-bold text-slate-400 uppercase border border-slate-200 rounded px-1 w-fit">
                        Pass
                      </div>
                      <p className="text-sm font-mono font-bold text-slate-800 break-all">
                        {content.showPassword
                          ? content.networkPassword
                          : "••••"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-slate-400 font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Digital Guide
            </div>
          </>
        )}
      </div>
    </div>
  );
}
