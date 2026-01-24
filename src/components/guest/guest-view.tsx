"use client";

import { useState } from "react";

import {
  Wifi,
  Map as MapIcon,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Router,
  Copy,
  Clock,
  Sun,
  ArrowRight,
  User,
  Lock,
} from "lucide-react";
import { useQRCode } from "next-qrcode";

import { cn } from "@/lib/utils";

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
  const [activeView, setActiveView] = useState<
    | "home"
    | "wifi"
    | "map"
    | "recommendations"
    | "rules"
    | "emergency"
    | "transport"
  >("home");
  const [activeCategory, setActiveCategory] = useState<string>("restaurants");
  const { Canvas } = useQRCode();

  // Mock Host Data (replace with real if available)
  const HOST_NAME = "Santiago";
  const HOST_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBHGn-Dk297_8nrQ51QgTv8N_HmiAUvd1ypqFyc4MKUrpjipcpbFRSL6mM5RIgHy7GfXRlI7gX0RxUJ0Ye92aULIrGVd7JhQ2DkM7RUkkUMqbxjrqD_zIV7o017xcO6kqLXl1ACa679wKuY_ZXuyAHukWFP3xWw5RrGO1h3TCdQk6_h7KWCau5h1-12yj-9Du_YrUBzJt6hZcy3bxI4qoVdJPmOZDJM1hg94Jy6IGN8UXBphhqhi4_G47bSvTYX9mkIXhD6kfwaDSo";

  // Actions Navigation
  const ACTIONS = [
    {
      label: "WiFi",
      icon: Wifi,
      onClick: () => setActiveView("wifi"),
      color: "bg-[#0f756d] text-white",
    },
    {
      label: "Recomendaciones",
      icon: BookOpen,
      onClick: () => setActiveView("recommendations"),
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
    {
      label: "Reglas",
      icon: MessageCircle,
      onClick: () => setActiveView("rules"),
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
    {
      label: "Bus & Taxi",
      icon: Router, // Using Router as placeholder, ideally Car or Bus
      onClick: () => setActiveView("transport"),
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
    {
      label: "Ayuda",
      icon: AlertCircle,
      onClick: () => setActiveView("emergency"),
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700 hover:text-red-500 hover:border-red-200",
    },
  ];

  // Helper to extract unique categories
  const categories = property.recommendations
    ? Array.from(
        new Set(property.recommendations.map((r: any) => r.categoryType)),
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 w-full bg-[#f1f5f9] dark:bg-[#000000] flex justify-center md:items-center overflow-hidden font-sans text-[#0e1b1a] dark:text-white">
      {/* App Container */}
      <div className="w-full md:max-w-[480px] h-full md:h-[95vh] md:max-h-[850px] md:rounded-[2rem] bg-[#f6f8f8] dark:bg-[#112120] relative shadow-2xl flex flex-col overflow-hidden border-gray-200 dark:border-gray-800 md:border-[8px]">
        {/* Top Navigation / Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/20 backdrop-blur-md z-20 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 text-[#0f756d]">
            {activeView === "home" ? (
              <>
                <img
                  src="/guestHubLogo.png"
                  alt="GuestHub"
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
              </>
            ) : (
              <button
                onClick={() => setActiveView("home")}
                className="flex items-center gap-2 text-neutral-800 dark:text-white hover:opacity-70 transition-opacity"
              >
                <div className="p-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </div>
                <span className="font-bold text-lg capitalize">
                  {activeView === "emergency" ? "Ayuda" : activeView}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-6 relative">
          {/* HOME VIEW */}
          {activeView === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Hero Section */}
              <div className="relative w-full h-[320px] group">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${property.image || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2942&auto=format&fit=crop"})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 mb-2 text-xs font-medium tracking-wider text-white uppercase bg-[#0f756d]/80 backdrop-blur-sm rounded-full">
                      Premium Stay
                    </span>
                    <h1 className="text-white text-3xl font-bold leading-tight shadow-sm">
                      {property.name} <br />
                      <span className="text-white/90 font-normal text-2xl">
                        Ocean View
                      </span>
                    </h1>
                  </div>
                  {/* Host Chip */}
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 pr-4 rounded-xl w-fit">
                    <div className="size-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white/50">
                      <img
                        src={HOST_IMAGE}
                        alt="Host"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wide">
                        Hosted by
                      </span>
                      <span className="text-white text-sm font-bold">
                        {HOST_NAME}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="px-6 py-8">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={cn(
                          "size-16 rounded-2xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-105 group-hover:shadow-md",
                          action.color,
                        )}
                      >
                        <action.icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 text-center leading-tight">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WIFI VIEW */}
          {activeView === "wifi" && (
            <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <Canvas
                    text={`WIFI:T:WPA;S:${property.wifiSsid};P:${property.wifiPassword};;`}
                    options={{
                      errorCorrectionLevel: "M",
                      margin: 2,
                      scale: 4,
                      width: 200,
                      color: { dark: "#112120", light: "#ffffff" },
                    }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Red WiFi
                  </h3>
                  <p className="text-neutral-500 text-sm">
                    Escanea para conectarte automáticamente
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <Router className="w-5 h-5 text-neutral-400" />
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {property.wifiSsid || "No configurado"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-neutral-400" />
                      <span className="font-mono text-neutral-900 dark:text-white">
                        {property.wifiPassword || "••••••••"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        property.wifiPassword &&
                        navigator.clipboard.writeText(property.wifiPassword)
                      }
                      className="text-xs font-bold text-[#0f756d] bg-[#0f756d]/10 px-3 py-1.5 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Check-In / Check-Out & Weather Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
                    <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
                        Check-out
                      </p>
                      <p className="text-neutral-900 dark:text-white font-bold text-lg">
                        {property.checkOut || "11:00"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
                    <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
                        Clima
                      </p>
                      <p className="text-neutral-900 dark:text-white font-bold text-lg">
                        28° Soleado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECOMMENDATIONS VIEW */}
          {activeView === "recommendations" && (
            <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
              {/* Categories Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                {categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border",
                        activeCategory === cat
                          ? "bg-[#0f756d] text-white border-[#0f756d]"
                          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700",
                      )}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay categorías disponibles
                  </p>
                )}
              </div>

              {/* List */}
              <div className="space-y-4">
                {property.recommendations
                  ?.filter(
                    (r: any) =>
                      !activeCategory || r.categoryType === activeCategory,
                  )
                  .map((place: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex justify-between items-start gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">
                          {place.title}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                          {place.description}
                        </p>
                        <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                          <MapIcon className="w-3 h-3" />{" "}
                          {place.formattedAddress}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {place.googleMapsLink && (
                          <a
                            href={place.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                          >
                            <MapIcon className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                {(!property.recommendations ||
                  property.recommendations.length === 0) && (
                  <div className="text-center py-10 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay recomendaciones aún.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RULES VIEW */}
          {activeView === "rules" && (
            <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-neutral-700 pb-4">
                  <div className="p-2 bg-[#0f756d]/10 rounded-lg text-[#0f756d]">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Reglas de la Casa</h3>
                </div>
                <div className="prose dark:prose-invert prose-sm">
                  {property.houseRules ? (
                    <p className="whitespace-pre-wrap">{property.houseRules}</p>
                  ) : (
                    <p className="text-gray-400 italic">
                      El anfitrión no ha especificado reglas específicas, pero
                      por favor respeta la propiedad y los vecinos.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EMERGENCY VIEW */}
          {activeView === "emergency" && (
            <div className="p-6 space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 mb-6">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> En caso de emergencia
                  real, marca 911.
                </p>
              </div>

              {property.emergencyContacts?.map((contact: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">
                        {contact.name}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {contact.type || "Contacto"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="size-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform active:scale-95"
                  >
                    <div className="w-4 h-4 fill-current">📞</div>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TRANSPORT VIEW */}
          {activeView === "transport" && (
            <div className="p-6 space-y-4 animate-in slide-in-from-right duration-300">
              {property.transport?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        {/* Ideally map item.type to icon */}
                        <Router className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-neutral-900 dark:text-white capitalize">
                        {item.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded text-gray-500">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {item.description}
                  </p>
                </div>
              ))}
              {(!property.transport || property.transport.length === 0) && (
                <div className="text-center py-10 text-gray-400">
                  <p>No hay información de transporte disponible.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
