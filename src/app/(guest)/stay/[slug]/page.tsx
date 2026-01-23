import { WifiCard } from "@/components/guest/wifi-card";
import { HeroSection } from "@/components/guest/hero-section";
import { GridMenu } from "@/components/guest/grid-menu";

// Mock data until DB is connected
const MOCK_PROPERTY = {
  name: "Casa Azul - Ocean View",
  slug: "casa-azul",
  wifiSsid: "CasaAzul_Guest",
  wifiPassword: "sunset-views-2024",
  houseRules: "No smoking inside. Quiet hours after 10 PM.",
  image:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2560&auto=format&fit=crop", // Placeholder
};

export default async function GuestPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = MOCK_PROPERTY;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <HeroSection image={property.image} name={property.name} />

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10 space-y-6">
        <WifiCard ssid={property.wifiSsid} password={property.wifiPassword} />

        <GridMenu />

        {/* Welcome Text */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
            About your stay
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            We hope you enjoy your stay at {property.name}!<br />
            Feel free to explore our local guide for the best coffee spots and
            hidden gems around the neighborhood.
          </p>
        </div>
      </div>
    </div>
  );
}
