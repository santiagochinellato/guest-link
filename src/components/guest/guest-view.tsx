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
  User,
  Lock,
  ArrowRight,
  Star,
  ExternalLink,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQRCode } from "next-qrcode";

import { cn } from "@/lib/utils";

interface GuestViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function GuestView({ property, dict }: GuestViewProps) {
  // We keep state for views
  const [activeView, setActiveView] = useState<
    "home" | "recommendations" | "transport" | "emergency"
  >("home");

  // We keep state for local filters (like recommendations categories)
  const [activeCategory, setActiveCategory] = useState<string>("restaurants");
  const { Canvas } = useQRCode();

  // Mock Host Data
  const HOST_NAME = "Santiago";
  const HOST_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBHGn-Dk297_8nrQ51QgTv8N_HmiAUvd1ypqFyc4MKUrpjipcpbFRSL6mM5RIgHy7GfXRlI7gX0RxUJ0Ye92aULIrGVd7JhQ2DkM7RUkkUMqbxjrqD_zIV7o017xcO6kqLXl1ACa679wKuY_ZXuyAHukWFP3xWw5RrGO1h3TCdQk6_h7KWCau5h1-12yj-9Du_YrUBzJt6hZcy3bxI4qoVdJPmOZDJM1hg94Jy6IGN8UXBphhqhi4_G47bSvTYX9mkIXhD6kfwaDSo";

  // Actions Navigation
  const ACTIONS = [
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
      onClick: () => {
        setActiveView("home");
        // Optional: scroll to rules if already on home, but since it's merged, it might just be visible
        const rulesElement = document.getElementById("rules-section");
        if (rulesElement) rulesElement.scrollIntoView({ behavior: "smooth" });
      },
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
    {
      label: "Bus & Taxi",
      icon: Router,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Set(property.recommendations.map((r: any) => r.categoryType)),
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 w-full bg-[#f1f5f9] dark:bg-[#000000] flex justify-center md:items-center overflow-hidden font-sans text-[#0e1b1a] dark:text-white">
      {/* App Container */}
      <div className="w-full md:max-w-[480px] h-full md:h-[95vh] md:max-h-[850px] md:rounded-[2rem] bg-[#f6f8f8] dark:bg-[#112120] relative shadow-2xl flex flex-col overflow-hidden border-gray-200 dark:border-gray-800 md:border-[8px]">
        {/* Top Navigation / Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/20 backdrop-blur-md z-20 border-b border-gray-100 dark:border-white/5 absolute top-0 w-full">
          <div className="flex items-center gap-3 text-[#0f756d]">
            {activeView === "home" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  {activeView === "emergency"
                    ? "Ayuda"
                    : activeView === "transport"
                      ? "Transporte"
                      : "Recomendaciones"}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Main Scrolling Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 relative scroll-smooth">
          {/* HOME VIEW (Merged WiFi + Info + Rules) */}
          {activeView === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* 1. Hero Section */}
              <div className="relative w-full h-[380px] group">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${property.image || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2942&auto=format&fit=crop"})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f6f8f8] dark:from-[#112120] via-black/40 to-black/30" />

                <div className="absolute bottom-10 left-0 w-full p-6 flex flex-col gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 mb-2 text-xs font-medium tracking-wider text-white uppercase bg-[#0f756d]/90 backdrop-blur-sm rounded-full shadow-lg">
                      Premium Stay
                    </span>
                    <h1 className="text-white text-4xl font-bold leading-tight shadow-sm">
                      {property.name} <br />
                      <span className="text-white/90 font-normal text-2xl">
                        Ocean View
                      </span>
                    </h1>
                  </div>

                  {/* Host Chip */}
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 pr-4 rounded-xl w-fit hover:bg-white/20 transition-colors cursor-pointer">
                    <div className="size-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={HOST_IMAGE}
                        alt="Host"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/70 text-[10px] font-bold uppercase tracking-wide">
                        Hosted by
                      </span>
                      <span className="text-white text-sm font-bold leading-none">
                        {HOST_NAME}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 flex flex-col gap-8 -mt-6 relative z-10">
                {/* 2. Actions Grid */}
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-neutral-700">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 ml-1">
                    Acceso Rápido
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {ACTIONS.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={action.onClick}
                        className="flex flex-col items-center gap-2 group p-2 hover:bg-gray-50 dark:hover:bg-neutral-700/50 rounded-xl transition-all active:scale-95"
                      >
                        <div
                          className={cn(
                            "size-12 rounded-xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-105 group-hover:shadow-md",
                            action.color,
                          )}
                        >
                          <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 text-center leading-tight">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. WiFi Card & Info */}
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 p-6">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                      <Wifi className="w-48 h-48" />
                    </div>
                    <div className="flex flex-col items-center gap-6 relative z-10">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
                          <Wifi className="w-5 h-5 text-[#0f756d]" /> Red WiFi
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          Escanea para conectarte automáticamente
                        </p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:scale-105 transition-transform duration-500">
                        <Canvas
                          text={`WIFI:T:WPA;S:${property.wifiSsid};P:${property.wifiPassword};;`}
                          options={{
                            errorCorrectionLevel: "M",
                            margin: 2,
                            scale: 4,
                            width: 180,
                            color: { dark: "#112120", light: "#ffffff" },
                          }}
                        />
                      </div>

                      <button
                        onClick={() => {
                          window.location.href = `WIFI:T:WPA;S:${property.wifiSsid};P:${property.wifiPassword};;`;
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0f756d] text-white rounded-xl shadow-lg shadow-[#0f756d]/20 active:scale-95 transition-all text-sm font-bold animate-in zoom-in duration-300"
                      >
                        <Wifi className="w-4 h-4" /> Conectar Ahora
                      </button>

                      <div className="flex flex-col items-center gap-3 w-full">
                        <div className="flex items-center gap-3 px-5 py-4 bg-[#f6f8f8] dark:bg-neutral-900/50 rounded-2xl w-full justify-between border border-gray-100 dark:border-neutral-800">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                              <Router className="w-4 h-4 text-[#0f756d]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                Red
                              </span>
                              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">
                                {property.wifiSsid || "Not Configured"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              property.wifiSsid &&
                              navigator.clipboard.writeText(property.wifiSsid)
                            }
                            className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[#0f756d] shadow-sm transition-colors active:scale-90"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 px-5 py-4 bg-[#f6f8f8] dark:bg-neutral-900/50 rounded-2xl w-full justify-between border border-gray-100 dark:border-neutral-800">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                              <Lock className="w-4 h-4 text-[#0f756d]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                Contraseña
                              </span>
                              <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">
                                {property.wifiPassword || "••••••••"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              property.wifiPassword &&
                              navigator.clipboard.writeText(
                                property.wifiPassword,
                              )
                            }
                            className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-[#0f756d] shadow-sm transition-colors active:scale-90"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
                      <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">
                          Check-out
                        </p>
                        <p className="text-neutral-900 dark:text-white font-bold text-xl">
                          {property.checkOut || "11:00 AM"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
                      <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wider">
                          Hoy
                        </p>
                        <p className="text-neutral-900 dark:text-white font-bold text-xl">
                          28° Soleado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 4. Rules Section (Merged into Home) */}
                <div id="rules-section" className="space-y-6 scroll-mt-24">
                  <div className="bg-gradient-to-br from-[#0f756d]/5 to-transparent rounded-[2rem] p-8 border border-[#0f756d]/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm text-[#0f756d]">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        Reglas de la Casa
                      </h3>
                    </div>

                    {/* Logic to determine if Rules are Object or String */}
                    {(() => {
                      const rules =
                        typeof property.houseRules === "object" &&
                        property.houseRules !== null
                          ? property.houseRules
                          : {
                              text: property.houseRules || "",
                              allowed: [],
                              prohibited: [],
                            };

                      return (
                        <div className="space-y-8">
                          {/* Description */}
                          <div className="relative">
                            <div className="absolute top-0 left-0 text-[#0f756d]/10 text-6xl font-serif -translate-x-2 -translate-y-4">
                              “
                            </div>
                            <div className="prose dark:prose-invert prose-sm pl-6 relative z-10 prose-p:text-neutral-600 dark:prose-p:text-neutral-300 prose-p:leading-relaxed">
                              {rules.text ? (
                                <p className="whitespace-pre-wrap font-medium">
                                  {rules.text}
                                </p>
                              ) : (
                                <p className="text-gray-400 italic">
                                  Por favor respeta la propiedad y disfruta tu
                                  estadía.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Allowed List */}
                          {rules.allowed && rules.allowed.length > 0 && (
                            <div className="space-y-3 pl-6">
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Se Permite / Info
                              </h4>
                              <ul className="space-y-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {rules.allowed.map(
                                  (item: string, i: number) => (
                                    <li
                                      key={i}
                                      className="text-sm text-neutral-600 dark:text-neutral-300 flex items-start gap-2"
                                    >
                                      <span className="mt-1.5 size-1.5 rounded-full bg-green-500 shrink-0" />
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Prohibited List */}
                          {rules.prohibited && rules.prohibited.length > 0 && (
                            <div className="space-y-3 pl-6">
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Prohibido
                              </h4>
                              <ul className="space-y-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {rules.prohibited.map(
                                  (item: string, i: number) => (
                                    <li
                                      key={i}
                                      className="text-sm text-neutral-600 dark:text-neutral-300 flex items-start gap-2"
                                    >
                                      <span className="mt-1.5 size-1.5 rounded-full bg-red-500 shrink-0" />
                                      {item}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER VIEWS (Replacing Home) */}
          <div className="px-6 pt-24 pb-12">
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
                    local hasta los rincones secretos que solo los locales
                    conocen.
                  </p>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
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
                      <Router className="w-6 h-6" />
                    </span>
                    Transporte
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Muévete por la ciudad con facilidad. Aquí tienes las mejores
                    opciones para llegar a donde necesites.
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
                          <Router className="w-7 h-7" />
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

            {/* EMERGENCY VIEW */}
            {activeView === "emergency" && (
              <div className="animate-in slide-in-from-right duration-300 pb-12">
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {property.emergencyContacts?.map(
                      (contact: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-5 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 group hover:border-[#0f756d]/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-gray-50 dark:bg-neutral-800 group-hover:bg-[#0f756d]/10 flex items-center justify-center text-gray-400 group-hover:text-[#0f756d] transition-colors">
                              <User className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                                {contact.name}
                              </span>
                              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                                {contact.type}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="size-12 rounded-full bg-[#0f756d] text-white flex items-center justify-center shadow-lg shadow-[#0f756d]/30 hover:bg-[#0d6059] hover:scale-110 transition-all active:scale-95"
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
                      <p className="text-3xl font-black text-white relative z-10 tracking-tight">
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
      </div>
    </div>
  );
}
