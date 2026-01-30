import { cn } from "@/lib/utils";
import { FlyerConfig } from "./types";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { GradientTemplate } from "./templates/GradientTemplate";
import { CardTemplate } from "./templates/CardTemplate";
import { ElegantTemplate } from "./templates/ElegantTemplate";

interface FlyerPreviewProps {
  config: FlyerConfig;
  qrRef?: React.RefObject<HTMLDivElement>;
}

export const FlyerPreview = ({ config, qrRef }: FlyerPreviewProps) => {
  const { design } = config;

  // Font class mapping
  const fontClass =
    {
      inter: "font-sans",
      sans: "font-sans",
      playfair: "font-playfair",
      roboto: "font-roboto",
      serif: "font-serif",
      mono: "font-mono",
    }[design.font] || "font-sans";

  const containerStyles = cn(
    "relative flex flex-col items-center shadow-lg transition-all bg-white overflow-hidden",
    design.orientation === "horizontal"
      ? "w-[842px] h-[595px] justify-center flex-row"
      : "w-[595px] h-[842px]",
    fontClass,
  );

  const wrapperProps = {
    id: "flyer-preview-container",
    className: "print:w-full print:h-full print:fixed print:top-0 print:left-0",
  };

  if (design.layout === "minimal") {
    return (
      <div {...wrapperProps}>
        <MinimalTemplate
          config={config}
          containerStyles={containerStyles}
          qrRef={qrRef}
        />
      </div>
    );
  }

  if (design.layout === "gradient") {
    return (
      <div {...wrapperProps}>
        <GradientTemplate
          config={config}
          containerStyles={containerStyles}
          qrRef={qrRef}
        />
      </div>
    );
  }

  if (design.layout === "card") {
    return (
      <div {...wrapperProps}>
        <CardTemplate
          config={config}
          containerStyles={containerStyles}
          qrRef={qrRef}
        />
      </div>
    );
  }

  if (design.layout === "elegant") {
    return (
      <div {...wrapperProps}>
        <ElegantTemplate
          config={config}
          containerStyles={containerStyles}
          qrRef={qrRef}
        />
      </div>
    );
  }

  return null;
};
