"use client";

import { MapPinned } from "lucide-react";
import Image from "next/image";
import { GuestHero } from "@/components/features/guest/components/GuestHero";
import { GuestWiFiCard } from "@/components/features/guest/components/GuestWiFiCard";
import { GuestInfoGrid } from "@/components/features/guest/components/GuestInfoGrid";
import { GuestRulesList } from "@/components/features/guest/components/GuestRulesList";
import { GuestTabNavigation } from "@/components/features/guest/components/GuestTabNavigation";
import { useGuestView } from "@/components/features/guest/hooks/useGuestView";
import { Button } from "../ui/button";
import { GuestRecommendationsView } from "./views/GuestRecommendationsView";
import { GuestTransportView } from "./views/GuestTransportView";
import { GuestEmergencyView } from "./views/GuestEmergencyView";

interface GuestViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function GuestView({ property, dict: _dict }: GuestViewProps) {
  // We keep state for views
  const { activeView, setActiveView, activeCategory, setActiveCategory } =
    useGuestView();

  // Helper to extract unique categories
  const categories = property.recommendations
    ? Array.from(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Set(property.recommendations.map((r: any) => r.categoryType)),
      ).filter((c) => c !== "transit")
    : [];

  const recommendations = property.recommendations?.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.categoryType !== "transit",
  );

  return (
    <div className="fixed inset-0 z-50 w-full bg-[#f1f5f9] dark:bg-[#000000] flex justify-center md:items-center overflow-hidden font-sans text-[#0e1b1a] dark:text-white">
      {/* App Container */}
      <div className="w-full md:max-w-[480px] h-full md:h-[95vh] md:max-h-[850px] md:rounded-[2rem] bg-[#f6f8f8] dark:bg-[#112120] relative shadow-2xl flex flex-col overflow-hidden border-gray-200 dark:border-gray-800 md:border-[8px]">
        {/* Top Navigation / Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/20 backdrop-blur-md z-20 border-b border-gray-100 dark:border-white/5 absolute top-0 w-full">
          <div className="flex items-center justify-between gap-3 text-[#0f756d] w-full">
            <div className="flex items-center gap-3">
              <Image
                src="/guestHubLogo.png"
                alt="GuestHub"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col">
                <h2 className="text-neutral-900 dark:text-white text-lg font-bold tracking-tight leading-none font-sans">
                  GUESTHUB
                </h2>
                <p
                  className="text-[10px] text-neutral-500 font-medium tracking-wide leading-none mt-1"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  You stay, connected.
                </p>
              </div>
            </div>
            {/* Host Chip */}
            <div className="flex items-center gap-3 bg-neutral-100/50 dark:bg-white/10 backdrop-blur-md border border-neutral-200/50 dark:border-white/20 p-2 pr-4 rounded-xl w-fit hover:bg-neutral-200/50 dark:hover:bg-white/20 transition-colors cursor-pointer">
              <div className="flex flex-col">
                <span className="text-neutral-500 dark:text-white/70 text-[10px] font-bold uppercase tracking-wide">
                  Anfitrión
                </span>
                <span className="text-neutral-900 dark:text-white text-sm font-bold leading-none">
                  {property.hostName || "Anfitrión"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrolling Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32 relative scroll-smooth">
          <GuestHero
            image={property.image}
            name={property.name}
            address={property.address || property.city || "Premium Stay"}
            hostName={property.hostName}
            hostImage={property.hostImage}
          />

          <div className="px-6 flex flex-col gap-6 -mt-6 relative z-10 min-h-[500px]">
            {/* HOME VIEW (Hero + InfoGrid) */}

            <div className="animate-in fade-in duration-300 flex flex-col gap-6 justify-center items-center">
              <GuestInfoGrid
                checkIn={property.checkIn}
                checkOut={property.checkOut}
              />
              <Button
                className="rounded-xl w-fit flex items-center gap-2"
                onClick={() => {
                  const query =
                    property.latitude && property.longitude
                      ? `${property.latitude},${property.longitude}`
                      : `${property.address || property.name}, ${property.city || ""}`;
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      query,
                    )}`,
                    "_blank",
                  );
                }}
              >
                <MapPinned />
                Ir al alojamiento
              </Button>
            </div>
            {/* WIFI VIEW (Now Home) */}
            {activeView === "home" && (
              <div className="animate-in slide-in-from-bottom duration-300">
                <GuestWiFiCard
                  ssid={property.wifiSsid}
                  password={property.wifiPassword}
                />
              </div>
            )}

            {/* RULES VIEW */}
            {activeView === "rules" && (
              <div className="animate-in slide-in-from-right duration-300">
                <GuestRulesList rules={property.houseRules} />
              </div>
            )}

            {/* RECOMMENDATIONS VIEW */}
            {activeView === "recommendations" && (
              <GuestRecommendationsView
                recommendations={recommendations}
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            )}

            {/* TRANSPORT VIEW */}
            {activeView === "transport" && (
              <GuestTransportView transport={property.transport} />
            )}

            {/* HELP (EMERGENCY) VIEW */}
            {activeView === "help" && (
              <GuestEmergencyView property={property} />
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <GuestTabNavigation
          activeView={activeView}
          onNavigate={setActiveView}
        />
      </div>
    </div>
  );
}
