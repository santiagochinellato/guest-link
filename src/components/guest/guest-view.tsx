"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGuestData } from "@/hooks/useGuestData";
import { posthog } from "@/lib/posthog";

// Modules
import {
  GuestHero,
  WifiGlassCard,
  CheckInAccess,
  ActionsGrid,
  HostFab,
  LocationButton,
  RulesDrawer,
  EmergencyDrawer,
  GuideDrawer,
  TransportDrawer,
} from "./modules";
import { GuestWelcomeScreen } from "./GuestWelcomeScreen";

import { GuestProperty } from "@/types/dtos";

interface GuestViewProps {
  property: GuestProperty;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function GuestView({ property, dict: _dict }: GuestViewProps) {
  // Data Hook
  const {
    name,
    address,
    coverImageUrl,
    checkInTime,
    checkOutTime,
    wifiSsid,
    wifiPassword,
    hostName,
    hostImage,
    hostPhone,
    latitude,
    longitude,
    safeAccess,
    effectiveAccessCode,
    effectiveAlarmCode,
    effectiveAccessSteps,
    effectiveHasParking,
    effectiveParkingDetails,
    effectiveHouseRules,
    effectiveAllowed,
    effectiveProhibited,
    filteredRecommendations,
    categories,
    topRecommendations,
    transportRecommendations,
    transportCategories,
    openLocation,
  } = useGuestData(property);

  // Drawer States
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Analytics: track guest_guide_viewed when user dismisses welcome
  useEffect(() => {
    if (!showWelcome && property.id) {
      const device =
        typeof window !== "undefined" && window.innerWidth < 768
          ? "mobile"
          : "desktop";
      posthog.capture("guest_guide_viewed", {
        property_id: property.id,
        device,
      });
    }
  }, [showWelcome, property.id]);

  // Analytics: rules_viewed, transport_viewed when drawers open
  useEffect(() => {
    if (isRulesOpen && property.id) {
      posthog.capture("rules_viewed", { property_id: property.id });
    }
  }, [isRulesOpen, property.id]);

  useEffect(() => {
    if (isTransportOpen && property.id) {
      posthog.capture("transport_viewed", { property_id: property.id });
    }
  }, [isTransportOpen, property.id]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-brand-copper/20">
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <GuestWelcomeScreen
            key="welcome"
            propertyName={name}
            coverImage={coverImageUrl}
            onDismiss={() => setShowWelcome(false)}
          />
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24"
          >
            {/* 1. HERO ATMOSPHERE */}
            <GuestHero name={name} coverImage={coverImageUrl} />

            {/* 2. UTILITY SECTION (Floating slightly over hero) */}
            <div className="relative z-10 px-4 -mt-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CheckInAccess
                  checkInTime={checkInTime}
                  checkOutTime={checkOutTime}
                  accessCode={effectiveAccessCode}
                  alarmCode={effectiveAlarmCode}
                  hasParking={effectiveHasParking}
                  parkingDetails={effectiveParkingDetails}
                  accessSteps={effectiveAccessSteps}
                />

                <WifiGlassCard
                  ssid={wifiSsid}
                  password={wifiPassword}
                  propertyId={property.id}
                />

                <LocationButton
                  onClick={() => {
                    if (property.id) {
                      posthog.capture("map_opened", {
                        property_id: property.id,
                      });
                    }
                    openLocation();
                  }}
                  address={address}
                />
              </motion.div>

              {/* 3. NAVIGATION GRID */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ActionsGrid
                  onOpenRules={() => setIsRulesOpen(true)}
                  onOpenGuide={() => setIsGuideOpen(true)}
                  onOpenTransport={() => setIsTransportOpen(true)}
                  onOpenEmergency={() => setIsEmergencyOpen(true)}
                />

                {/* TOP RECOMMENDATIONS PREVIEW */}
                {topRecommendations.length > 0 && (
                  <div className="mt-8 mb-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                        Imperdibles
                      </h3>
                      <button
                        onClick={() => setIsGuideOpen(true)}
                        className="text-xs font-medium text-brand-copper hover:underline"
                      >
                        Ver todo
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {topRecommendations.map((item: any) => (
                        <div
                          key={item.title}
                          onClick={() => setIsGuideOpen(true)}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all"
                        >
                          <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden">
                            {/* Placeholder or real image if available */}
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                              <span className="text-xs">IMG</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-brand-copper uppercase tracking-wider">
                              {item.categoryType}
                            </span>
                            <h4 className="font-semibold text-zinc-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* 4. FAB */}
            <HostFab
              hostImage={hostImage}
              hostPhone={hostPhone}
              hostName={hostName}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWERS */}
      <RulesDrawer
        isOpen={isRulesOpen}
        onOpenChange={setIsRulesOpen}
        allowed={effectiveAllowed}
        prohibited={effectiveProhibited}
        houseRules={effectiveHouseRules}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        access={safeAccess}
      />

      <EmergencyDrawer
        isOpen={isEmergencyOpen}
        onOpenChange={setIsEmergencyOpen}
        contacts={property.emergencyContacts}
        address={address}
        hostName={hostName}
        hostPhone={hostPhone}
      />

      <GuideDrawer
        isOpen={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        recommendations={filteredRecommendations}
        categories={categories}
        propertyId={property.id}
        propertyLocation={
          latitude && longitude
            ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
            : undefined
        }
      />

      <TransportDrawer
        isOpen={isTransportOpen}
        onOpenChange={setIsTransportOpen}
        transportRecommendations={transportRecommendations}
        transportCategories={transportCategories}
        propertyId={property.id}
      />
    </div>
  );
}
