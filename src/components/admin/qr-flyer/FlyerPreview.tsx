import { cn } from "@/lib/utils";
import { FlyerConfig } from "./types";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { GradientTemplate } from "./templates/GradientTemplate";
import { CardTemplate } from "./templates/CardTemplate";

interface FlyerPreviewProps {
  config: FlyerConfig;
  qrRef: React.RefObject<HTMLDivElement>;
}

export const FlyerPreview = ({ config, qrRef }: FlyerPreviewProps) => {
  const { design } = config;

  // Font class mapping
  const fontClass = {
    inter: "font-sans",
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  }[design.font];

  const containerStyles = cn(
    "relative flex flex-col items-center shadow-lg transition-all bg-white overflow-hidden",
    design.orientation === "horizontal"
      ? "w-[842px] h-[595px] justify-center flex-row"
      : "w-[595px] h-[842px]",
    fontClass,
  );

  if (design.layout === "minimal") {
    return (
      <MinimalTemplate
        config={config}
        containerStyles={containerStyles}
        qrRef={qrRef}
      />
    );
  }

  if (design.layout === "gradient") {
    return (
      <GradientTemplate
        config={config}
        containerStyles={containerStyles}
        qrRef={qrRef}
      />
    );
  }

  if (design.layout === "card") {
    return (
      <CardTemplate
        config={config}
        containerStyles={containerStyles}
        qrRef={qrRef}
      />
    );
  }

  return null;
};
