import { getProperty } from "@/lib/actions/properties";
import { FlyerConfig } from "@/components/admin/qr-flyer/types";
import { PrintClientWrapper } from "@/components/admin/qr-flyer/PrintClientWrapper";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

interface PrintPageProps {
  params: Promise<{
    lang: string;
    propertyId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PrintPageProps): Promise<Metadata> {
  const { propertyId } = await params;
  const id = parseInt(propertyId);
  if (isNaN(id)) return { title: "Error" };

  const { data: property } = await getProperty(Number(id));
  return {
    title: property ? `Flyer - ${property.name}` : "Flyer no encontrado",
  };
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { propertyId } = await params;
  const id = parseInt(propertyId);

  if (isNaN(id)) {
    return notFound();
  }

  const response = await getProperty(id);

  if (!response.success || !response.data) {
    return notFound();
  }

  const property = response.data;

  // Parse Flyer Configuration
  let config: FlyerConfig;
  try {
    if (property.wifiQrCode && property.wifiQrCode.startsWith("{")) {
      config = JSON.parse(property.wifiQrCode);
    } else {
      // Fallback default config if generic string or empty
      throw new Error("Invalid config");
    }
  } catch (e) {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    // Default Config based on Property Data
    config = {
      content: {
        title: "Bienvenido",
        subtitle: "",
        welcomeMessage: `¡Bienvenido a ${property.name}!`,
        welcomeMessageEn: "Scan to connect to WiFi and view our digital guide.",
        networkName: property.wifiSsid || "",
        networkPassword: property.wifiPassword || "",
        guideUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/guest/${property.slug}`,
        showPassword: true,
        qrType: "url",
      },
      branding: {
        logoPosition: "center",
        logoSize: "md",
        qrStyle: "dots",
        qrColor: "#000000",
        embedLogoInQr: true,
      },
      design: {
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        backgroundColor: "#ffffff",
        font: "sans",
        layout: "minimal",
        orientation: "vertical",
      },
    };
  }

  // Ensure guideUrl is correct
  if (!config.content.guideUrl) {
    config.content.guideUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://guestlink.com"}/guest/${property.slug}`;
  }

  return <PrintClientWrapper config={config} propertyId={id} />;
}
