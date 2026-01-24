"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, AlertCircle, X, Navigation } from "lucide-react";

interface ReturnFabProps {
  location?: { lat: string; lng: string };
  onEmergencyClick: () => void;
  labels: {
    backHome: string;
    emergency: string;
  };
}

export function ReturnFab({
  location,
  onEmergencyClick,
  labels,
}: ReturnFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMapsClick = () => {
    if (location && location.lat && location.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
        "_blank",
      );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Secondary Actions */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={(e) => {
                // Prevent closing immediately
                e.stopPropagation();
                onEmergencyClick();
                setIsExpanded(false);
              }}
              className="pointer-events-auto flex items-center gap-3 pr-4 pl-3 py-3 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30"
            >
              <div className="bg-white/20 p-1 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">{labels.emergency}</span>
            </motion.button>

            {location && (
              <motion.button
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ delay: 0.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMapsClick();
                  setIsExpanded(false);
                }}
                className="pointer-events-auto flex items-center gap-3 pr-4 pl-3 py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-1 rounded-full">
                  <Navigation className="w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-sm">{labels.backHome}</span>
              </motion.button>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-colors ${
          isExpanded
            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            : "bg-black dark:bg-white text-white dark:text-black"
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MapPin className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
