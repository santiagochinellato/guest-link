export interface FlyerConfig {
  content: {
    title: string;
    subtitle: string;
    welcomeMessage: string;
    welcomeMessageEn: string;
    networkName: string;
    networkPassword?: string;
    guideUrl: string;
    showPassword: boolean;
    qrType?: "url" | "wifi";
  };
  branding: {
    logo?: string; // Data URL
    logoPosition: "top" | "center" | "corner";
    logoSize: "sm" | "md" | "lg";
    qrStyle: "square" | "dots" | "rounded";
    qrColor: string;
    embedLogoInQr: boolean;
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    font: "inter" | "sans" | "serif" | "mono";
    layout: "minimal" | "gradient" | "card" | "elegant";
    orientation: "vertical" | "horizontal";
  };
}
