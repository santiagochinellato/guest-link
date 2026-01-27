import React from "react";
import { useQRCode } from "next-qrcode";
import { cn } from "@/lib/utils";
import { FlyerConfig } from "./types";

interface QrCodeProps {
  url: string;
  branding: FlyerConfig["branding"];
  primaryColor: string;
  className?: string;
  size?: number;
  colorOverride?: string;
}

export const QrCode = ({
  url,
  branding,
  primaryColor,
  className,
  size = 180,
  colorOverride,
}: QrCodeProps) => {
  const { Canvas } = useQRCode();
  const [safeLogo, setSafeLogo] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (branding.embedLogoInQr && branding.logo) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = branding.logo;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            setSafeLogo(canvas.toDataURL("image/png"));
          } catch (e) {
            console.warn("Failed to convert QR logo to safe data URL", e);
            setSafeLogo(undefined);
          }
        }
      };
      img.onerror = () => {
        setSafeLogo(undefined);
      };
    } else {
      setSafeLogo(undefined);
    }
  }, [branding.logo, branding.embedLogoInQr]);

  return (
    <div className={cn("inline-block", className)}>
      <Canvas
        text={url}
        options={{
          errorCorrectionLevel: "M",
          margin: 2,
          scale: 4,
          width: size,
          color: {
            dark:
              colorOverride ||
              (branding.qrStyle === "dots" ? primaryColor : "#000000"),
            light: "#ffffff",
          },
        }}
        logo={
          safeLogo
            ? { src: safeLogo, options: { width: size * 0.2 } }
            : undefined
        }
      />
    </div>
  );
};
