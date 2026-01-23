"use client";

import { useState } from "react";
import { WifiCard } from "@/components/guest/wifi-card";
import { HeroSection } from "@/components/guest/hero-section";
import { CheckInOutCard } from "@/components/guest/check-in-out-card";
import { QuickActions } from "@/components/guest/quick-actions";
import { CategoriesSection } from "@/components/guest/categories-section";
import { EmergencyModal } from "@/components/guest/emergency-modal";

// Mock data
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
  // In real app, these coords come from DB
  latitude: "-33.4489",
  longitude: "-70.6693",
};

// Converted to Client Component for Modal state
export default function GuestPropertyPageWrapper({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // In a real Server Component usage, we'd fetch data here and pass to a Client Child.
  // Since we need state for Modal/Tabs in the *Page*, let's just make the Page client for this MVP phase
  // or split. For simplicity, treating this as Client Component.

  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const property = MOCK_PROPERTY;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <HeroSection image={property.image} name={property.name} />

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10 space-y-5">
        <WifiCard ssid={property.wifiSsid} password={property.wifiPassword} />

        <CheckInOutCard
          checkIn={property.checkIn}
          checkOut={property.checkOut}
        />

        <QuickActions
          propertyLat={property.latitude}
          propertyLng={property.longitude}
          onEmergencyClick={() => setIsEmergencyOpen(true)}
        />

        <div className="pt-4">
          <h3 className="text-lg font-bold mb-4 px-1">Discover</h3>
          <CategoriesSection recommendations={[]} />
        </div>

        {/* Welcome Text / Rules */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
            House Rules
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            {property.houseRules}
          </p>
        </div>
      </div>

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
