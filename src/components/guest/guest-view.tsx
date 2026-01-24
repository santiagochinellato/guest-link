"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  Map as MapIcon,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Bell,
  User,
  Router,
  Copy,
  Zap,
  Clock,
  Sun,
  Home,
  Lock,
  Plus,
  Compass,
  Settings,
  ArrowRight,
} from "lucide-react";
import { useQRCode } from "next-qrcode";

import { WifiDrawer } from "@/components/guest/wifi-drawer";
import { EmergencyModal } from "@/components/guest/emergency-modal";
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
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const { Canvas } = useQRCode();

  // Mock Host Data (replace with real if available)
  const HOST_NAME = "Santiago";
  const HOST_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBHGn-Dk297_8nrQ51QgTv8N_HmiAUvd1ypqFyc4MKUrpjipcpbFRSL6mM5RIgHy7GfXRlI7gX0RxUJ0Ye92aULIrGVd7JhQ2DkM7RUkkUMqbxjrqD_zIV7o017xcO6kqLXl1ACa679wKuY_ZXuyAHukWFP3xWw5RrGO1h3TCdQk6_h7KWCau5h1-12yj-9Du_YrUBzJt6hZcy3bxI4qoVdJPmOZDJM1hg94Jy6IGN8UXBphhqhi4_G47bSvTYX9mkIXhD6kfwaDSo";

  // Actions Bar Data
  const ACTIONS = [
    {
      label: "WiFi",
      icon: Wifi,
      onClick: () => setIsWifiOpen(true),
      color: "bg-[#0f756d] text-white",
    },
    {
      label: "Map",
      icon: MapIcon,
      onClick: () => {},
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
    {
      label: "SOS",
      icon: AlertCircle,
      onClick: () => setIsEmergencyOpen(true),
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700 hover:text-red-500 hover:border-red-200",
    },
    {
      label: "Guide",
      icon: BookOpen,
      onClick: () => {},
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
    {
      label: "Chat",
      icon: MessageCircle,
      onClick: () => {},
      color:
        "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8f8] dark:bg-[#112120] pb-24 font-sans text-[#0e1b1a] dark:text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/20 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-[#0f756d]">
          <Home className="w-6 h-6" />
          <h2 className="text-neutral-900 dark:text-white text-lg font-bold tracking-tight">
            INFOHOUSE
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-sm hover:text-[#0f756d] transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-sm hover:text-[#0f756d] transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
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

        {/* Quick Action Bar */}
        <div className="px-6 py-6">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 snap-x">
            {ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="snap-start flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div
                  className={cn(
                    "size-14 rounded-2xl flex items-center justify-center shadow-md transition-all group-hover:scale-105",
                    action.color,
                  )}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* WiFi Card */}
        <div className="px-6 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-neutral-700 p-1">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wifi className="w-32 h-32" />
            </div>
            <div className="p-5 flex flex-col items-center gap-6 relative z-10">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Get Connected
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Scan to join the high-speed network
                </p>
              </div>

              <div
                onClick={() => setIsWifiOpen(true)}
                className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:scale-105 transition-transform"
              >
                <Canvas
                  text={`WIFI:T:WPA;S:${property.wifiSsid};P:${property.wifiPassword};;`}
                  options={{
                    errorCorrectionLevel: "M",
                    margin: 2,
                    scale: 4,
                    width: 160,
                    color: { dark: "#112120", light: "#ffffff" },
                  }}
                />
              </div>

              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f8f8] dark:bg-neutral-900 rounded-lg w-full justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Router className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate">
                      {property.wifiSsid || "Not Configured"}
                    </span>
                  </div>
                  <button className="text-[#0f756d] text-xs font-bold uppercase tracking-wide hover:opacity-80 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <button
                  onClick={() => setIsWifiOpen(true)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0f756d] to-[#4f9690] hover:to-[#0f756d] text-white rounded-xl font-bold shadow-lg shadow-[#0f756d]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Zap className="w-5 h-5" />
                  Connect Automatically
                </button>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Check-out Card */}
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
              <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
                  Check-out
                </p>
                <p className="text-neutral-900 dark:text-white font-bold text-lg">
                  {property.checkOut || "11:00 AM"}
                </p>
              </div>
            </div>
            {/* Weather Card */}
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-3">
              <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium">
                  Forecast
                </p>
                <p className="text-neutral-900 dark:text-white font-bold text-lg">
                  28° Sunny
                </p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="p-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-between shadow-lg mb-4">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm">Need fresh towels?</span>
              <span className="text-xs text-gray-400 dark:text-neutral-500">
                Request service in one tap
              </span>
            </div>
            <button className="size-10 rounded-full bg-white/20 dark:bg-neutral-900/10 flex items-center justify-center hover:bg-white/30 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-white/5 fixed bottom-0 w-full px-6 py-3 pb-6 flex justify-between items-center z-20">
        <button className="flex flex-col items-center gap-1 text-[#0f756d]">
          <Home className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          <Lock className="w-6 h-6" />
          <span className="text-[10px] font-medium">Access</span>
        </button>
        <div className="-mt-12 size-14 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-900/20 cursor-pointer hover:scale-105 transition-transform">
          <Plus className="w-8 h-8" />
        </div>
        <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>

      {/* Modals and Drawers */}
      <WifiDrawer
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        ssid={property.wifiSsid || ""}
        password={property.wifiPassword || ""}
        labels={dict.guest.wifi}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        labels={dict.guest.emergencyModal}
      />
    </div>
  );
}
