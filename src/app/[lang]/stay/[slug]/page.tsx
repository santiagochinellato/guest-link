import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { GuestView } from "@/components/guest/guest-view";

// Mock data (Simulating fetch)
const MOCK_PROPERTY = {
  name: "Casa Azul - Ocean View",
  slug: "casa-azul",
  wifiSsid: "CasaAzul_Guest",
  wifiPassword: "sunset-views-2024",
  houseRules: "No smoking inside. Quiet hours after 10 PM.",
  image:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2560&auto=format&fit=crop",
  checkIn: "15:00",
  checkOut: "11:00",
  latitude: "-33.4489",
  longitude: "-70.6693",
};

interface PageProps {
  params: Promise<{
    lang: Locale;
    slug: string;
  }>;
}

export default async function GuestPropertyPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  // In real app: const property = await getPropertyBySlug(slug);
  const property = MOCK_PROPERTY;

  return <GuestView property={property} dict={dict} />;
}
