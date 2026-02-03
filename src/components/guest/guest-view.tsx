"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Modules
import { WifiGlassCard } from "./modules/WifiGlassCard";
import { CheckInAccess } from "./modules/CheckInAccess";
import { ActionsGrid } from "./modules/ActionsGrid";
import { HostFab } from "./modules/HostFab";
import { LocationButton } from "./modules/LocationButton";
import { RulesDrawer } from "./modules/RulesDrawer";
import { EmergencyDrawer } from "./modules/EmergencyDrawer";
import { GuideDrawer } from "./modules/GuideDrawer";
import { TransportDrawer } from "./modules/TransportDrawer";

// Views (Legacy support for Guide) - REMOVED
// import { GuestRecommendationsView } from "./views/GuestRecommendationsView";
import { ArrowLeft } from "lucide-react";

interface GuestViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function GuestView({ property, dict: _dict }: GuestViewProps) {
  // Normalize Property Data
  const recommendations = property.recommendations || [];

  const TRANSPORT_TYPES = ["transit", "bus", "taxi", "transfer"];

  // Filter categories for guide
  const categories = recommendations
    ? Array.from(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Set<string>(recommendations.map((r: any) => r.categoryType)),
      ).filter((c) => !TRANSPORT_TYPES.includes(c))
    : [];

  // Drawer States
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);

  // Derived Data
  const {
    wifiSsid,
    wifiPassword,
    checkInTime: _checkInTime,
    checkOutTime: _checkOutTime,
    checkIn,
    checkOut,
    coverImageUrl: _coverImageUrl,
    image,
    name,
    latitude,
    longitude,
    address,
    hostImage,
    hostPhone,
    hostName,
  } = property;

  // Normalize Property Data
  const coverImageUrl = _coverImageUrl || image;
  const checkInTime = _checkInTime || checkIn;
  const checkOutTime = _checkOutTime || checkOut;

  useEffect(() => {
    // Optional: Keep a simple mount log if helpful, or remove entirely.
    // Removing entirely for cleanup.
  }, []);

  const safeAccess = property.access || {};
  const effectiveAccessCode = safeAccess.accessCode || "";
  const effectiveAlarmCode = safeAccess.alarmCode || "";
  const effectiveAccessSteps = safeAccess.accessSteps || [];
  const effectiveHasParking = safeAccess.hasParking || false;
  const effectiveParkingDetails = safeAccess.parkingDetails || "";

  const effectiveHouseRules = property.houseRules?.text || "";
  const effectiveAllowed = property.houseRules?.allowed || [];
  const effectiveProhibited = property.houseRules?.prohibited || [];

  const filteredRecommendations = recommendations?.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => !TRANSPORT_TYPES.includes(r.categoryType),
  );

  // Normalize transport data (merge legacy recommendations 'transit' + separate transport array)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawTransport = property.transport || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedTransport = rawTransport.map((t: any) => ({
    title: t.name,
    description: t.description,
    categoryType: t.type || "taxi", // Default to taxi if missing
    originalType: t.type,
    formattedAddress: t.scheduleInfo || "", // Fix: Now using scheduleInfo for Parada/Address
    googleMapsLink: t.website || "", // Use website as link
    phone: t.phone, // Map phone number for WhatsApp
    extraInfo: t.priceInfo, // Map priceInfo to extraInfo (for detailed recommendations)
    isTransport: true,
  }));

  const legacyTransport = recommendations?.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => TRANSPORT_TYPES.includes(r.categoryType),
  );

  const transportRecommendations = useMemo(
    () => [...(legacyTransport || []), ...mappedTransport],
    [legacyTransport, mappedTransport],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transportCategories = useMemo(
    () =>
      transportRecommendations
        ? Array.from(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new Set<string>(
              transportRecommendations.map((r: any) => r.categoryType),
            ),
          )
        : [],
    [transportRecommendations],
  );

  // Top Recommendations (One from each main category)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topRecommendations = filteredRecommendations.reduce(
    (acc: any[], curr: any) => {
      const exists = acc.find(
        (item) => item.categoryType === curr.categoryType,
      );
      if (!exists && acc.length < 4) {
        acc.push(curr);
      }
      return acc;
    },
    [],
  );

  // Handlers
  const openLocation = () => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank",
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-brand-copper/20">
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          className="pb-24"
        >
          {/* 1. HERO ATMOSPHERE */}
          <div className="relative h-[38vh] w-full overflow-hidden bg-zinc-900">
            {/* Background Image */}
            <div className="absolute inset-0">
              <ImageWithFallback src={coverImageUrl} alt={name} />
            </div>
            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Title */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 z-20">
              <motion.h1
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold tracking-tighter text-white leading-tight drop-shadow-md"
              >
                {name}
              </motion.h1>
            </div>
          </div>

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

              <WifiGlassCard ssid={wifiSsid} password={wifiPassword} />

              <LocationButton onClick={openLocation} address={address} />
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
      />
    </div>
  );
}

function ImageWithFallback({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-brand-void to-black opacity-80 animate-in fade-in" />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
      onError={() => setError(true)}
    />
  );
}
