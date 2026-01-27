import { FlyerConfig } from "../types";
import { QrCode } from "../QrCode";

interface TemplateProps {
  config: FlyerConfig;
  containerStyles: string;
  qrRef: React.RefObject<HTMLDivElement>;
}

export function GradientTemplate({
  config,
  containerStyles,
  qrRef,
}: TemplateProps) {
  const { content, branding, design } = config;
  const isHorizontal = design.orientation === "horizontal";

  return (
    <div ref={qrRef} className={containerStyles}>
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b]"
        style={{
          background: `linear-gradient(135deg, ${design.primaryColor} 0%, ${design.secondaryColor || "#1e293b"} 100%)`,
        }}
      >
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ffffff0d] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#0000001a] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-12 text-[#ffffff]">
        {isHorizontal ? (
          // Horizontal Grid
          <div className="flex-1 grid grid-cols-2 gap-12 items-center">
            <div className="text-left pl-4 border-r border-[#ffffff1a] pr-4 h-full flex flex-col justify-center">
              <div className="bg-[#ffffff1a] backdrop-blur-md border border-[#ffffff33] px-4 py-2 rounded-lg self-start mb-8">
                <span className="font-bold tracking-widest uppercase text-sm">
                  WELLCOME
                </span>
              </div>
              <h1 className="text-5xl font-black mb-6 drop-shadow-lg leading-none tracking-tight">
                {content.title}
              </h1>
              <p className="text-xl text-[#ffffffe6] font-medium leading-relaxed mb-auto opacity-80">
                {content.welcomeMessage}
              </p>

              <div className="mt-12 flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-mono opacity-60 uppercase tracking-widest">
                      Network
                    </p>
                    <p className="text-2xl font-bold">{content.networkName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#ffffff99] mb-2">
                      Password
                    </p>
                    <p className="text-2xl font-mono tracking-wider">
                      {content.showPassword
                        ? content.networkPassword
                        : "••••••••"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="p-6 bg-[#ffffff] rounded-[2rem] shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <QrCode
                  url={content.guideUrl}
                  branding={branding}
                  primaryColor={design.primaryColor}
                  size={220}
                  colorOverride="#000000"
                />
              </div>
            </div>
          </div>
        ) : (
          // Vertical Layout
          <>
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#ffffff1a] backdrop-blur-md border border-[#ffffff33] px-4 py-2 rounded-lg">
                <span className="font-bold tracking-widest uppercase text-sm">
                  Welcome Guide
                </span>
              </div>
              {branding.logo && (
                <div className="w-16 h-16 rounded-full border-2 border-[#ffffff4d] overflow-hidden bg-[#ffffff]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={branding.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </div>

            <div className="text-center flex-1 flex flex-col items-center justify-center">
              <h1 className="text-6xl font-black mb-6 drop-shadow-lg leading-tight tracking-tight">
                {content.title}
              </h1>
              <p className="text-xl text-[#ffffffe6] font-medium max-w-lg leading-relaxed mb-12">
                {content.welcomeMessage}
              </p>

              <div className="p-4 bg-[#ffffff] rounded-3xl shadow-2xl transform">
                <QrCode
                  url={content.guideUrl}
                  branding={branding}
                  primaryColor={design.primaryColor}
                  size={240}
                  colorOverride="#000000"
                />
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-widest opacity-70">
                Scan to Connect
              </p>
            </div>

            <div className="bg-[#ffffff1a] backdrop-blur-lg border border-[#ffffff33] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-around gap-6 mt-8">
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#ffffff99] mb-1">
                  Network
                </p>
                <p className="text-2xl font-bold">{content.networkName}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#ffffff99] mb-1">
                  Password
                </p>
                <p className="text-2xl font-mono">
                  {content.showPassword ? content.networkPassword : "••••••••"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
