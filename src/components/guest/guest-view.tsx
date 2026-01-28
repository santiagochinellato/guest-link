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
        new Set<string>(
          property.recommendations.map((r: any) => r.categoryType),
        ),
      ).filter((c) => c !== "transit")
    : [];

  const recommendations = property.recommendations?.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.categoryType !== "transit",
  );

  return (
    <div className="fixed inset-0 z-50 w-full bg-[#f1f5f9] dark:bg-[#000000] flex justify-center md:items-start overflow-hidden font-sans text-[#0e1b1a] dark:text-white md:overflow-y-auto">
      {/* 
        MOBILE WRAPPER 
        Maintains the "Phone" look on md screens if we wanted to keep it, 
        but for true desktop layout we want to break out of it.
        We'll use a conditionally rendered layout.
      */}

      {/**
       * DESKTOP LAYOUT (Hidden on mobile, visible on md+)
       * Grid Layout: Left Sidebar (Hero + Info) | Right Content (Views)
       */}
      <div className="hidden md:flex w-full max-w-7xl mx-auto p-4 lg:p-6 gap-6 h-screen overflow-hidden">
        {/* LEFT SIDEBAR (Sticky) */}
        <aside className="w-[320px] lg:w-[360px] flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10 shrink-0 h-full">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-white/20 relative group shrink-0">
            <GuestHero
              image={property.image}
              name={property.name}
              address={property.address || property.city || "Premium Stay"}
              hostName={property.hostName}
              hostImage={property.hostImage}
              className="h-[220px]" // Reduced height for better fit
            />
          </div>

          {/* Host Chip / Property Branding */}
          <div className="bg-white dark:bg-[#112120] p-5 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-4">
              <Image
                src="/hostlyLogo.webp"
                alt="Hostly"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <div>
                <h2 className="text-base font-bold">HOSTLY</h2>
                <p className="text-[10px] text-neutral-500">
                  The city, simplified.
                </p>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative shrink-0">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                  {property.hostName?.charAt(0) || "H"}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-neutral-400">
                  Anfitrión
                </p>
                <p className="font-semibold text-sm">
                  {property.hostName || "Tu Anfitrión"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <Button
              className="w-full rounded-xl h-9 text-xs flex items-center justify-center gap-2"
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
              <MapPinned className="w-3.5 h-3.5" />
              Ir al alojamiento
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10 h-full">
          {/* Desktop Navigation (Tabs) */}
          <div className=" top-6 z-40 bg-white/80 dark:bg-[#112120]/90 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <GuestTabNavigation
              activeView={activeView}
              onNavigate={setActiveView}
              variant="desktop"
            />
          </div>

          {/* Content Container */}
          <div className="bg-white dark:bg-[#112120] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 ">
            {activeView === "home" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold mb-6">Información General</h2>
                <GuestInfoGrid
                  checkIn={property.checkIn}
                  checkOut={property.checkOut}
                />

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Conectividad</h3>
                  <GuestWiFiCard
                    ssid={property.wifiSsid}
                    password={property.wifiPassword}
                  />
                </div>
              </div>
            )}

            {activeView === "rules" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold mb-6">Reglas de la Casa</h2>
                <GuestRulesList rules={property.houseRules} />
              </div>
            )}

            {activeView === "recommendations" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* <h2 className="text-3xl font-bold mb-6">Guía Local</h2> */}
                <GuestRecommendationsView
                  recommendations={recommendations}
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              </div>
            )}

            {activeView === "transport" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold mb-6">Cómo Moverse</h2>
                <GuestTransportView transport={property.transport} />
              </div>
            )}

            {activeView === "help" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold mb-6">Zona de Ayuda</h2>
                <GuestEmergencyView property={property} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 
        MOBILE LAYOUT (Visible < md, Hidden on md+)
        Original "Phone" Container logic
      */}
      <div className="md:hidden w-full h-full relative flex flex-col overflow-hidden bg-[#f6f8f8] dark:bg-[#112120]">
        {/* Top Header Mobile */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/20 backdrop-blur-md z-20 border-b border-gray-100 dark:border-white/5 absolute top-0 w-full">
          <div className="flex items-center justify-between gap-3 text-[#0f756d] w-full">
            <div className="flex items-center gap-3">
              <Image
                src="/hostlylogo.svg"
                alt="Hostly"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col">
                <h2 className="text-neutral-900 dark:text-white text-lg font-bold tracking-tight leading-none font-sans">
                  HOSTLY
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

        {/* Main Scrolling Content Area (Mobile) */}
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

        {/* Navigation Bar (Mobile) */}
        <GuestTabNavigation
          activeView={activeView}
          onNavigate={setActiveView}
        />
      </div>
    </div>
  );
}
