import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PrintClientWrapper } from "@/components/admin/qr-flyer/PrintClientWrapper";
import { FlyerConfig } from "@/components/admin/qr-flyer/types";

export default async function PrintFlyerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = parseInt(id);

  if (isNaN(propertyId)) return notFound();

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
  });

  if (!property) return notFound();

  // Load config stored in wifiQrCode JSON column (set by the flyer builder)
  let config: FlyerConfig;
  try {
    if (property.wifiQrCode && property.wifiQrCode.startsWith("{")) {
      config = JSON.parse(property.wifiQrCode);
    } else {
      throw new Error("No saved config");
    }
  } catch {
    config = {
      content: {
        title: `Bienvenido a ${property.name}`,
        subtitle: "",
        welcomeMessage: `¡Bienvenido a ${property.name}! Esperamos que disfrutes tu estadía.`,
        welcomeMessageEn: "Scan this code to access the property guide, WiFi, and local recommendations.",
        networkName: property.wifiSsid || "",
        networkPassword: property.wifiPassword || "",
        guideUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://guest-link.com"}/stay/${property.slug}`,
        showPassword: true,
      },
      branding: {
        logoPosition: "center",
        logoSize: "md",
        qrStyle: "rounded",
        qrColor: "#000000",
        embedLogoInQr: false,
      },
      design: {
        layout: "minimal",
        primaryColor: "#D97706",
        secondaryColor: "#1e293b",
        backgroundColor: "#ffffff",
        font: "inter",
        orientation: "vertical",
      },
    };
  }

  return <PrintClientWrapper config={config} propertyId={propertyId} />;
}
