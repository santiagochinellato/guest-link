"use client";

import { useState } from "react";
import { WifiCard } from "@/components/guest/wifi-card";
import { HeroSection } from "@/components/guest/hero-section";
import { CheckInOutCard } from "@/components/guest/check-in-out-card";
import { QuickActions } from "@/components/guest/quick-actions";
import { CategoriesSection } from "@/components/guest/categories-section";
import { EmergencyModal } from "@/components/guest/emergency-modal";

interface GuestViewProps {
  property: {
    name: string;
    wifiSsid?: string | null;
    wifiPassword?: string | null;
    houseRules?: string | null;
    image?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    recommendations?: any[];
    emergencyContacts?: any[];
    transport?: any[];
  };
  dict: any;
}

export function GuestView({ property, dict }: GuestViewProps) {
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <HeroSection
        image={property.image || ""}
        name={property.name}
        welcomeText={dict.guest.welcome}
      />

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10 space-y-5">
        <WifiCard
          ssid={property.wifiSsid || ""}
          password={property.wifiPassword || ""}
          labels={dict.guest.wifi}
        />

        <CheckInOutCard
          checkIn={property.checkIn || ""}
          checkOut={property.checkOut || ""}
          labels={dict.guest.checkInOut}
        />

        <QuickActions
          propertyLat={property.latitude || undefined}
          propertyLng={property.longitude || undefined}
          onEmergencyClick={() => setIsEmergencyOpen(true)}
          labels={dict.guest.actions}
        />

        <div className="pt-4">
          <h3 className="text-lg font-bold mb-4 px-1">
            {dict.guest.discover.title}
          </h3>
          <CategoriesSection
            recommendations={property.recommendations || []}
            emptyText={dict.guest.discover.empty}
            labels={dict.guest.discover.categories}
          />
        </div>

        {/* Welcome Text / Rules */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
            {dict.guest.houseRules.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            {property.houseRules}
          </p>
        </div>
      </div>

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        labels={dict.guest.emergencyModal}
      />
    </div>
  );
}
