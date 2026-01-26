"use client";

import {
  Map as MapIcon,
  AlertCircle,
  BookOpen,
  MessageCircle,
  TramFront,
  User,
  ArrowRight,
  Star,
  ExternalLink,
  Phone,
  MapPinned,
} from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { GuestHero } from "@/components/features/guest/components/GuestHero";
import { GuestWiFiCard } from "@/components/features/guest/components/GuestWiFiCard";
import { GuestInfoGrid } from "@/components/features/guest/components/GuestInfoGrid";
import { GuestRulesList } from "@/components/features/guest/components/GuestRulesList";
import { GuestTabNavigation } from "@/components/features/guest/components/GuestTabNavigation";
import { useGuestView } from "@/components/features/guest/hooks/useGuestView";
import { Button } from "../ui/button";

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
      )
    : [];

  const renderHeaderTitle = () => {
    switch (activeView) {
      case "rules":
        return "Reglas de la Casa";
      case "recommendations":
        return "Guía Local";
      case "wifi":
        return "Conexión WiFi";
      case "transport":
        return "Moverse";
      case "help":
        return "Ayuda & Emergencia";
      default:
        return "GUESTHUB";
    }
  };

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
              {/* <div className="size-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white/50">
                <img
                  src={
                    property.hostImage ||
                    "https://ui-avatars.com/api/?name=" +
                      (property.hostName || "Host") +
                      "&background=random"
                  }
                  alt="Host"
                  className="w-full h-full object-cover"
                />
              </div> */}
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
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-[#0f756d]/10 rounded-xl text-[#0f756d]">
                      <BookOpen className="w-6 h-6" />
                    </span>
                    Recomendaciones
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Descubre nuestros lugares favoritos. Desde la gastronomía
                    local hasta los rincones secretos.
                  </p>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x px-2">
                  {categories.length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    categories.map((cat: any) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "snap-start px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border shadow-sm flex items-center gap-2",
                          activeCategory === cat
                            ? "bg-[#0f756d] text-white border-[#0f756d] ring-4 ring-[#0f756d]/10 scale-105"
                            : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-gray-300 border-gray-100 dark:border-neutral-700 hover:border-[#0f756d]/50 hover:bg-gray-50",
                        )}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Sin categorías
                    </p>
                  )}
                </div>

                {/* Cards */}
                <div className="grid gap-6">
                  {property.recommendations
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ?.filter(
                      (r: any) =>
                        !activeCategory || r.categoryType === activeCategory,
                    )
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((place: any, i: number) => (
                      <div
                        key={i}
                        className="group bg-white dark:bg-neutral-800 rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-wider">
                                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                  Top Pick
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-gray-200 dark:border-neutral-700 px-2 py-1 rounded-lg">
                                  {place.categoryType}
                                </span>
                              </div>
                              <h4 className="font-bold text-neutral-900 dark:text-white text-xl leading-tight">
                                {place.title}
                              </h4>
                            </div>
                            {place.googleMapsLink && (
                              <a
                                href={place.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="size-12 rounded-2xl bg-[#0f756d]/5 text-[#0f756d] flex items-center justify-center flex-shrink-0 hover:bg-[#0f756d] hover:text-white transition-all shadow-sm group-hover:scale-110"
                              >
                                <ExternalLink className="w-6 h-6" />
                              </a>
                            )}
                          </div>

                          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-gray-50 dark:border-neutral-700/50 pt-3">
                            {place.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-xl">
                            <MapIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {place.formattedAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TRANSPORT VIEW */}
            {activeView === "transport" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                      <TramFront className="w-6 h-6" />
                    </span>
                    Transporte
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Opciones para moverte por la ciudad.
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {property.transport?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-neutral-800 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-neutral-700 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                          <TramFront className="w-7 h-7" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                              {item.name}
                            </h4>
                            <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-neutral-700 px-2.5 py-1 rounded-lg text-gray-500">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HELP (EMERGENCY) VIEW */}
            {activeView === "help" && (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-[2rem] p-6 border border-red-100 dark:border-red-900/20 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="size-12 rounded-full bg-white dark:bg-red-900 flex items-center justify-center text-red-500 shadow-sm">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                          Zona de Ayuda
                        </h3>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70 font-bold uppercase tracking-wider">
                          Prioridad Alta
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-red-800/80 dark:text-red-200/80 leading-relaxed pl-1">
                      Si tienes un problema urgente o necesitas asistencia
                      inmediata, utiliza estos contactos. Estamos aquí para
                      ayudarte 24/7.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">
                      Contactos Directos
                    </h4>

                    {/* Host Contact Card (Dynamic) */}
                    {property.hostPhone && (
                      <div className="flex items-center justify-between p-5 bg-[#0f756d]/5 dark:bg-[#0f756d]/10 rounded-2xl shadow-sm border border-[#0f756d]/20 group hover:border-[#0f756d]/50 transition-all">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="size-12 rounded-full bg-[#0f756d]/10 flex items-center justify-center text-[#0f756d] transition-colors flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                property.hostImage ||
                                "https://ui-avatars.com/api/?name=" +
                                  (property.hostName || "Host")
                              }
                              alt="Host"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight break-words">
                              Contactar a {property.hostName || "Anfitrión"}
                            </span>
                            <span className="text-xs text-[#0f756d] font-bold uppercase tracking-wider mt-0.5">
                              WhatsApp / Llamada
                            </span>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/${property.hostPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="size-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all active:scale-95 flex-shrink-0"
                        >
                          <MessageCircle className="w-6 h-6 fill-white" />
                        </a>
                      </div>
                    )}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {property.emergencyContacts?.map(
                      (contact: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-5 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 group hover:border-[#0f756d]/30 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="size-12 rounded-full bg-gray-50 dark:bg-neutral-800 group-hover:bg-[#0f756d]/10 flex items-center justify-center text-gray-400 group-hover:text-[#0f756d] transition-colors flex-shrink-0">
                              <User className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight break-words">
                                {contact.name}
                              </span>
                              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-0.5">
                                {contact.type}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="size-12 rounded-full bg-[#0f756d] text-white flex items-center justify-center shadow-lg shadow-[#0f756d]/30 hover:bg-[#0d6059] hover:scale-110 transition-all active:scale-95 flex-shrink-0"
                          >
                            <Phone className="w-5 h-5 fill-current" />
                          </a>
                        </div>
                      ),
                    )}

                    <div className="mt-8 p-6 bg-neutral-900 rounded-[2rem] text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-50" />
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1 relative z-10">
                        Servicios Públicos
                      </p>
                      <p className="text-4xl font-black text-white relative z-10 tracking-tight my-2">
                        911
                      </p>
                      <p className="text-sm font-medium text-white/70 relative z-10">
                        Policía & Ambulancia
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
