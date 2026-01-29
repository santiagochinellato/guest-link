import { db } from "@/db";
import { properties, houseRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FlyerPreview } from "@/components/admin/qr-flyer/FlyerPreview";
import { FlyerConfig } from "@/components/admin/qr-flyer/types";
import { headers } from "next/headers";

// Force valid config for printing
const DEFAULT_CONFIG: FlyerConfig = {
  content: {
    title: "Wifi",
    wifiSsid: "",
    wifiPassword: "",
    customMessage: "",
    showRules: true,
  },
  design: {
    layout: "minimal",
    primaryColor: "#0F2A3D",
    font: "inter",
    orientation: "vertical",
    showLogo: true,
    showBorder: true,
  },
  qr: {
    dotsType: "rounded",
    cornersSquareType: "extra-rounded",
    cornersDotType: "dot",
    image: "/icons/wifi.svg",
  },
};

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
    with: {
      houseRules: true,
    },
  });

  if (!property) return notFound();

  // Merge stored config if it exists (assuming it might be stored in a 'flyerConfig' JSON column in future)
  // For now we use the default + property details
  const config: FlyerConfig = {
    ...DEFAULT_CONFIG,
    content: {
      ...DEFAULT_CONFIG.content,
      title: `Bienvenido a ${property.name}`,
      wifiSsid: property.wifiSsid || "",
      wifiPassword: property.wifiPassword || "",
      // @ts-expect-error JSON parsing
      rules: property.houseRules?.rulesAllowed || [],
    },
  };

  // Get host to generate QR Code URL?
  // FlyerPreview generates QR based on wifi, or if we want a link to the guest app:
  // We can pass a prop to FlyerPreview if we want the QR to be a link instead of WiFi

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center print:bg-white print:block">
      {/* Print Controls - Hidden in Print */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur border-b p-4 flex justify-between items-center print:hidden z-50">
        <h1 className="font-bold text-lg">Vista Previa de Impresión</h1>
        <button
          onClick={() => window.print()} // This will need a client component wrapper or be inline script
          className="bg-brand-void text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition-all"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="mt-20 mb-20 print:m-0 print:p-0 flex justify-center">
        {/* We reuse FlyerPreview but force it to be static */}
        <PrintWrapper config={config} />
      </div>

      <style>{`
        @page {
          size: auto;
          margin: 0mm;
        }
        @media print {
           body {
             background: white;
           }
        }
      `}</style>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('button').addEventListener('click', () => window.print());
          `,
        }}
      />
    </div>
  );
}

// Client wrapper to handle refs if needed, though FlyerPreview is likely client.
// Actually FlyerPreview is client, so we can render it directly.
function PrintWrapper({ config }: { config: FlyerConfig }) {
  return (
    <div className="scale-[0.6] print:scale-100 origin-top shadow-2xl print:shadow-none">
      <FlyerPreview config={config} />
    </div>
  );
}
