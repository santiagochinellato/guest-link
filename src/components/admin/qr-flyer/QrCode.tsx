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
          branding.embedLogoInQr && branding.logo
            ? { src: branding.logo, options: { width: size * 0.2 } }
            : undefined
        }
      />
    </div>
  );
};
