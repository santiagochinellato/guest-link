"use client";

import { useEffect, useState, useRef } from "react";
import { Wifi, MapPin, ShieldCheck, Car, Utensils, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Modules
import { GuestHero } from "./modules/GuestHero";
import { WifiCard } from "./modules/WifiCard";
import { AccessModule } from "./modules/AccessModule";
import { TransportModule } from "./modules/TransportModule";
import { RulesModule } from "./modules/RulesModule";

// Views
import { GuestRecommendationsView } from "./views/GuestRecommendationsView";

interface GuestViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function GuestView({ property, dict: _dict }: GuestViewProps) {
  // Navigation State
  const [activeView, setActiveView] = useState<
    "home" | "guide" | "transport" | "info"
  >("home");
  const [activeCategory, setActiveCategory] = useState("all");

  // Scroll Position for Glassmorphism Header
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Home Section Active State (for HomeNav)
  const [activeHomeSection, setActiveHomeSection] = useState("wifi");

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrolled(scrollRef.current.scrollTop > 50);

        // Simple scroll spy logic for HomeNav
        if (activeView === "home") {
          const wifiEl = document.getElementById("wifi-module");
          const rulesEl = document.getElementById("rules-module");
          const accessEl = document.getElementById("access-module");
          const scrollPos = scrollRef.current.scrollTop + 200; // Offset

          if (accessEl && accessEl.offsetTop <= scrollPos) {
            setActiveHomeSection("access");
          } else if (rulesEl && rulesEl.offsetTop <= scrollPos) {
            setActiveHomeSection("rules");
          } else if (wifiEl) {
            setActiveHomeSection("wifi");
          }
        }
      }
    };

    const div = scrollRef.current;
    if (div) div.addEventListener("scroll", handleScroll);
    return () => div?.removeEventListener("scroll", handleScroll);
  }, [activeView]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Adjust scroll position to account for header + nav
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Prepare categories for Recommendations View
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
    <div className="fixed inset-0 z-50 w-full bg-[#f8fafc] dark:bg-[#000000] flex justify-center overflow-hidden font-sans text-slate-900 dark:text-white">
      {/* MAX WIDTH CONTAINER */}
      <div className="w-full max-w-md h-full relative flex flex-col bg-white dark:bg-black shadow-2xl overflow-hidden">
        {/* HEADER */}
        <header
          className={cn(
            "absolute top-0 left-0 right-0 z-40 transition-all duration-300 px-4 py-4 flex items-center justify-between pointer-events-none",
            scrolled || activeView !== "home"
              ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-100 dark:border-white/10"
              : "bg-transparent",
          )}
        >
          <div
            className={cn(
              "font-bold text-lg transition-opacity duration-300 pointer-events-auto",
              scrolled || activeView !== "home"
                ? "opacity-100 text-slate-900 dark:text-white"
                : "opacity-0 invisible",
            )}
          >
            {property.name}
          </div>
          <div className="opacity-0"></div>
        </header>

        {/* SCROLLABLE CONTAINER */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-32 bg-slate-50 dark:bg-neutral-950"
        >
          {/* VIEW: HOME */}
          {activeView === "home" && (
            <>
              {/* 1. HERO SECTION (With Check-in/out) */}
              <GuestHero
                name={property.name}
                address={property.address}
                coverImage={property.image}
                hostName={property.hostName}
                hostImage={property.hostImage}
                hostPhone={property.hostPhone}
                checkInTime={property.checkInTime}
                checkOutTime={property.checkOutTime}
              />

              {/* 2. DASHBOARD FEED */}
              <div className="px-5 -mt-6 relative z-10 flex flex-col gap-6">
                {/* NEW: Modern Home Nav (Sticky-ish feel via placement) */}
                <div className="flex bg-white dark:bg-neutral-900 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-neutral-800 mx-4 justify-between relative z-20 -mb-2">
                  <button
                    onClick={() => scrollToSection("wifi-module")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all duration-300",
                      activeHomeSection === "wifi"
                        ? "bg-brand-void text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5",
                    )}
                  >
                    <Wifi className="w-3.5 h-3.5" /> WiFi
                  </button>
                  <button
                    onClick={() => scrollToSection("rules-module")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all duration-300",
                      activeHomeSection === "rules"
                        ? "bg-brand-void text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5",
                    )}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Reglas
                  </button>
                  <button
                    onClick={() => scrollToSection("access-module")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all duration-300",
                      activeHomeSection === "access"
                        ? "bg-brand-void text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5",
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Llegada
                  </button>
                </div>

                {/* Wifi Card (Section) */}
                <div id="wifi-module" className="scroll-mt-32">
                  <WifiCard
                    ssid={property.wifiSsid}
                    password={property.wifiPassword}
                    qrCode={property.wifiQrCode}
                  />
                </div>

                {/* Rules Module (Section) */}
                <div id="rules-module" className="scroll-mt-32">
                  <RulesModule
                    allowed={property.rulesAllowed}
                    prohibited={property.rulesProhibited}
                    additionalRules={property.houseRules}
                  />
                </div>

                {/* Access (Ingreso) Module (Section) */}
                <div id="access-module" className="scroll-mt-32">
                  <AccessModule
                    accessCode={property.accessCode}
                    accessSteps={property.accessSteps}
                    accessInstructions={property.accessInstructions}
                    parkingDetails={property.parkingDetails}
                    location={{
                      lat: property.latitude,
                      lng: property.longitude,
                      address: property.address,
                    }}
                  />
                </div>

                <div className="h-10"></div>
              </div>
            </>
          )}

          {/* VIEW: GUIDE (RECOMMENDATIONS) */}
          {activeView === "guide" && (
            <div className="pt-24 px-5">
              <GuestRecommendationsView
                recommendations={recommendations}
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
              <div className="h-20"></div>
            </div>
          )}

          {/* VIEW: TRANSPORT */}
          {activeView === "transport" && (
            <div className="pt-24 px-5">
              <TransportModule transport={property.transport} />
              <div className="h-20"></div>
            </div>
          )}

          {/* VIEW: INFO */}
          {activeView === "info" && (
            <div className="pt-24 px-5 flex flex-col gap-6">
              {/* Emergency */}
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-800/20">
                <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">
                  Emergencias
                </h3>
                {property.emergencyContacts?.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="mt-2 flex justify-between text-sm items-center border-b border-red-100 dark:border-red-800/20 last:border-0 pb-2 last:pb-0"
                  >
                    <span className="font-medium text-red-800 dark:text-red-200">
                      {c.name}
                    </span>
                    <a
                      href={`tel:${c.phone}`}
                      className="font-bold text-red-600 dark:text-red-400 bg-white dark:bg-red-950 px-3 py-1 rounded-full text-xs shadow-sm"
                    >
                      {c.phone}
                    </a>
                  </div>
                ))}
                {(!property.emergencyContacts ||
                  property.emergencyContacts.length === 0) && (
                  <p className="text-sm text-red-800 dark:text-red-200">911</p>
                )}
              </div>

              {/* Rules Reprint */}
              <RulesModule
                allowed={property.rulesAllowed}
                prohibited={property.rulesProhibited}
                additionalRules={property.houseRules}
              />

              <div className="h-20"></div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION (Fixed) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-slate-100 dark:border-white/10 px-6 py-3 flex justify-around items-center z-40 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <NavIcon
            icon={MapPin}
            label="Inicio"
            active={activeView === "home"}
            onClick={() => setActiveView("home")}
          />
          <NavIcon
            icon={Utensils}
            label="Guía"
            active={activeView === "guide"}
            onClick={() => setActiveView("guide")}
          />
          <NavIcon
            icon={Car}
            label="Moverse"
            active={activeView === "transport"}
            onClick={() => setActiveView("transport")}
          />
          <NavIcon
            icon={Info}
            label="Info"
            active={activeView === "info"}
            onClick={() => setActiveView("info")}
          />
        </div>
      </div>
    </div>
  );
}

function NavIcon({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active
          ? "text-brand-void dark:text-brand-copper scale-110"
          : "text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300",
      )}
    >
      <Icon
        className={cn(
          "w-6 h-6",
          active && "fill-current animate-in zoom-in duration-300",
        )}
      />
      <span
        className={cn(
          "text-[10px] font-bold",
          active ? "font-bold" : "font-medium",
        )}
      >
        {label}
      </span>
    </button>
  );
}
