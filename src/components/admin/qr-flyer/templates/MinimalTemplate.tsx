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
          <div className="w-[40%] h-full relative overflow-hidden bg-[#f1f5f9]">
            {branding.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={branding.logo}
                alt="Header"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#00000080] to-transparent" />
            <div className="absolute bottom-8 left-8 text-[#ffffff]">
              <div className="bg-[#ffffffe6] text-[#0f172a] backdrop-blur-md px-4 py-2 rounded-lg inline-block mb-3 shadow-lg">
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
            <p className="text-[#64748b] font-medium text-lg mb-8 max-w-[90%] leading-relaxed">
              {content.welcomeMessage}
            </p>

            <div className="flex flex-col items-center gap-8 mb-8">
              <div className="relative p-3 bg-[#ffffff] rounded-2xl shadow-xl border border-[#f1f5f9]">
                <QrCode
                  url={content.guideUrl}
                  branding={branding}
                  primaryColor={design.primaryColor}
                  size={160}
                />
              </div>
              <div className="text-left space-y-6">
                <div>
                  <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mb-1 text-center">
                    Wi-Fi Network
                  </p>
                  <div className="flex items-center gap-3">
                    {/* <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f1f5f9] text-[#475569]">
                      <Wifi className="w-4 h-4" />
                    </div> */}
                    <p className="text-lg font-bold text-[#1e293b] text-center">
                      {content.networkName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mb-1 text-center">
                    Password
                  </p>
                  <p className="text-lg font-mono font-bold text-[#1e293b] bg-[#f8fafc] px-3 py-1 rounded border border-[#f1f5f9] inline-block text-center">
                    {content.showPassword
                      ? content.networkPassword
                      : "••••••••"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#f1f5f9] w-full text-center">
              <p className="text-[#94a3b8] text-sm font-medium">
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
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-[#e2e8f0] flex items-center justify-center text-[#94a3b8]">
                Header Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0000004d] to-transparent" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#fffffff2] backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <span className="font-bold text-[#1e293b] tracking-tight text-lg uppercase">
                GUESTHUB
              </span>
            </div>
          </div>

          <div className="flex-1 px-12 py-10 flex flex-col items-center w-full text-center">
            <div
              className="w-16 h-1 rounded-full mb-8"
              style={{ backgroundColor: design.primaryColor }}
            />

            <h2 className="text-5xl font-extrabold text-[#0f172a] mb-4 leading-tight">
              {content.title}
            </h2>
            <p className="text-[#64748b] font-medium text-lg mb-10 max-w-[80%]">
              {content.welcomeMessage}
            </p>

            <div className="relative p-3 bg-[#ffffff] rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-[#f1f5f9] mb-8">
              <QrCode
                url={content.guideUrl}
                branding={branding}
                primaryColor={design.primaryColor}
                size={200}
                className="rounded-2xl overflow-hidden"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a] text-[#ffffff] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                Scan for Guide
              </div>
            </div>

            <div className="mt-auto w-full bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-6 flex items-center justify-between gap-2">
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
                  <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">
                    Wi-Fi Network
                  </p>
                  <p className="text-lg font-bold text-[#1e293b]">
                    {content.networkName}
                  </p>
                </div>
              </div>
              <div className="h-10 w-px bg-[#e2e8f0]"></div>
              <div className="text-left pr-4">
                <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">
                  Password
                </p>
                <p className="text-lg font-mono font-bold text-[#1e293b]">
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
