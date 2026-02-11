"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGuestData } from "@/hooks/useGuestData";
import { useReservationState } from "@/hooks/useReservationState";
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
import { PreCheckInInstructions } from "./modules/PreCheckInInstructions";
import { TimeBasedRecommendations } from "./modules/TimeBasedRecommendations";
import { EmergencyCard } from "./modules/EmergencyCard";
import { CheckInDayInfo } from "./modules/CheckInDayInfo";
import { WifiCard } from "./modules/WifiCard";
import { GuestWelcomeScreen } from "./GuestWelcomeScreen";
import { PostCheckoutScreen } from "./PostCheckoutScreen";

import { GuestProperty } from "@/types/dtos";

interface GuestViewProps {
  property: GuestProperty;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  /** Fechas de la reserva (solo cuando se accede por token) */
  reservation?: { checkIn: string; checkOut: string; guestName?: string };
  /** Nombre del huésped (solo cuando se accede por token) */
  guestName?: string;
  /** Si es true, muestra vista pública sin datos sensibles de acceso */
  isPublicView?: boolean;
  /** Override para desarrollo/preview - forzar hora del día */
  timeOfDayOverride?: "morning" | "afternoon" | "evening" | "night";
  /** Override para desarrollo/preview - forzar estado de reserva */
  stateOverride?: "BEFORE_CHECKIN" | "CHECKIN_DAY" | "DURING_STAY" | "AFTER_CHECKOUT" | "NO_RESERVATION";
}

export function GuestView({
  property,
  dict: _dict,
  reservation,
  guestName,
  isPublicView = false,
  timeOfDayOverride,
  stateOverride,
}: GuestViewProps) {
  const hasValidAccess = !!(reservation || guestName);

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
    effectivePreCheckInSteps,
    effectivePreCheckInNotes,
    filteredRecommendations,
    categories,
    topRecommendations,
    transportRecommendations,
    transportCategories,
    openLocation,
  } = useGuestData(property);

  // Reservation State Hook
  const {
    state: reservationState,
    shouldShowAccessCodes,
    timeOfDay,
  } = useReservationState({
    checkInDate: reservation?.checkIn,
    checkOutDate: reservation?.checkOut,
    checkInTime: checkInTime || undefined,
    timeOfDayOverride,
    stateOverride,
  });

  // En vista privada, validar que haya reserva o token generado
  if (!isPublicView && !hasValidAccess) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Acceso no disponible
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Esta guía solo está disponible para huéspedes con reserva confirmada o con un enlace de acceso generado.
          </p>
        </div>
      </div>
    );
  }

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

  // Vista pública: mostrar solo información general sin datos sensibles
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-brand-copper/20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pb-24"
        >
          {/* 1. HERO ATMOSPHERE */}
          <GuestHero name={name} coverImage={coverImageUrl} />

          {/* 2. UTILITY SECTION */}
          <div className="relative z-10 px-4 -mt-8 flex flex-col">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* WifiCard: Siempre visible en vista pública */}
              {wifiSsid && (
                <WifiCard
                  ssid={wifiSsid}
                  password={wifiPassword}
                  qrCode={property.wifiQrCode}
                />
              )}

              {/* LocationButton: Siempre visible en vista pública */}
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

          {/* HostFab: Mostrar si hay datos de contacto */}
          {hostPhone && (
            <HostFab
              hostImage={hostImage}
              hostPhone={hostPhone}
              hostName={hostName}
            />
          )}
        </motion.div>

        {/* DRAWERS - Disponibles en vista pública */}
        <RulesDrawer
          isOpen={isRulesOpen}
          onOpenChange={setIsRulesOpen}
          allowed={effectiveAllowed}
          prohibited={effectiveProhibited}
          houseRules={effectiveHouseRules}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          checkInDate={undefined}
          checkOutDate={undefined}
          access={undefined}
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

  // Vista privada: funcionalidad completa con reserva/token
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-brand-copper/20">
      <AnimatePresence mode="wait">
        {reservationState === "AFTER_CHECKOUT" ? (
          <PostCheckoutScreen
            key="post-checkout"
            propertyName={name}
            coverImage={coverImageUrl}
            guestName={guestName || reservation?.guestName}
          />
        ) : showWelcome ? (
          <GuestWelcomeScreen
            key="welcome"
            propertyName={name}
            coverImage={coverImageUrl}
            guestName={guestName || reservation?.guestName}
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
            <div className="relative z-10 px-4 -mt-8 flex flex-col">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* CheckInAccess: Siempre visible en todas las pantallas */}
                <CheckInAccess
                  checkInTime={checkInTime}
                  checkOutTime={checkOutTime}
                  checkInDate={reservation?.checkIn}
                  checkOutDate={reservation?.checkOut}
                  accessCode={effectiveAccessCode}
                  alarmCode={effectiveAlarmCode}
                  hasParking={effectiveHasParking}
                  parkingDetails={effectiveParkingDetails}
                  accessSteps={effectiveAccessSteps}
                  showCodes={reservationState === "NO_RESERVATION" ? true : shouldShowAccessCodes}
                />

                {/* BEFORE_CHECKIN: Mostrar PreCheckInInstructions */}
                {reservationState === "BEFORE_CHECKIN" && (
                  <PreCheckInInstructions
                    accessSteps={effectivePreCheckInSteps.length > 0 ? effectivePreCheckInSteps : effectiveAccessSteps}
                    preCheckInNotes={effectivePreCheckInNotes}
                    checkInDate={reservation?.checkIn}
                    checkInTime={checkInTime || undefined}
                    hostPhone={hostPhone}
                    hostName={hostName}
                    address={address}
                    latitude={latitude}
                    longitude={longitude}
                  />
                )}

                {/* CHECKIN_DAY: Mostrar información completa del día de check-in */}
                {reservationState === "CHECKIN_DAY" && (
                  <CheckInDayInfo
                    address={address}
                    latitude={latitude}
                    longitude={longitude}
                    accessCode={effectiveAccessCode}
                    alarmCode={effectiveAlarmCode}
                    accessSteps={effectiveAccessSteps}
                    accessInstructions={safeAccess?.instructions || ""}
                    hostPhone={hostPhone}
                    hostName={hostName}
                    houseRules={effectiveHouseRules}
                    rulesAllowed={effectiveAllowed}
                    rulesProhibited={effectiveProhibited}
                  />
                )}

                {/* WifiCard: Visible solo si no es BEFORE_CHECKIN */}
                {wifiSsid && reservationState !== "BEFORE_CHECKIN" && (
                  <WifiCard
                    ssid={wifiSsid}
                    password={wifiPassword}
                    qrCode={property.wifiQrCode}
                  />
                )}

                {/* LocationButton: Solo si no es BEFORE_CHECKIN ni CHECKIN_DAY */}
                {reservationState !== "BEFORE_CHECKIN" && reservationState !== "CHECKIN_DAY" && (
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
                )}

                {/* Time-based Recommendations durante la estadía */}
                {reservationState === "DURING_STAY" && (
                  <TimeBasedRecommendations
                    recommendations={filteredRecommendations}
                    timeOfDay={timeOfDay}
                    propertyId={property.id}
                    onOpenGuide={() => setIsGuideOpen(true)}
                  />
                )}

                {/* Emergency Card en madrugada durante la estadía */}
                {reservationState === "DURING_STAY" && timeOfDay === "night" && (
                  <EmergencyCard
                    emergencyContacts={property.emergencyContacts}
                    hostPhone={hostPhone}
                    hostName={hostName}
                  />
                )}
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

                {/* TOP RECOMMENDATIONS PREVIEW - Solo si NO es durante la estadía (ya que usamos TimeBasedRecommendations) */}
                {reservationState !== "DURING_STAY" && topRecommendations.length > 0 && (
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
            {/* <HostFab
              hostImage={hostImage}
              hostPhone={hostPhone}
              hostName={hostName}
            /> */}
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
        checkInDate={reservation?.checkIn}
        checkOutDate={reservation?.checkOut}
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
