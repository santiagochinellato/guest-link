"use client";

import { MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionsProps {
  propertyLat?: string;
  propertyLng?: string;
  onEmergencyClick: () => void;
}

export function QuickActions({
  propertyLat,
  propertyLng,
  onEmergencyClick,
}: QuickActionsProps) {
  const handleReturnDirections = () => {
    if (navigator.geolocation && propertyLat && propertyLng) {
      // In a real scenario, we'd get current position first, but for now we just open maps destination
      // Google Maps handles "from current location" automatically if origin is omitted
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${propertyLat},${propertyLng}`,
        "_blank",
      );
    } else {
      alert("Location coordinates not available.");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleReturnDirections}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-700 dark:text-emerald-400"
      >
        <MapPin className="w-6 h-6" />
        <span className="text-sm font-semibold">Get Back Here</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onEmergencyClick}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-700 dark:text-red-400"
      >
        <Phone className="w-6 h-6" />
        <span className="text-sm font-semibold">Emergency</span>
      </motion.button>
    </div>
  );
}
