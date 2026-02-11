"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { getTimeBasedGreeting } from "@/lib/utils/dates";

interface PostCheckoutScreenProps {
  propertyName: string;
  coverImage?: string | null;
  guestName?: string;
}

export function PostCheckoutScreen({
  propertyName,
  coverImage,
  guestName,
}: PostCheckoutScreenProps) {
  const greeting = useMemo(() => getTimeBasedGreeting(), []);
  
  // Extract first name from guestName
  const firstName = useMemo(() => {
    if (!guestName) return null;
    const { name } = parseGuestInfo(guestName);
    // Get first name only
    return name.split(" ")[0] || name;
  }, [guestName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 text-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      {coverImage && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt="Post Checkout Background"
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-sm px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="w-[300px] mb-8 drop-shadow-2xl"
        >
          {/* Logo in White */}
          <HostlyLogoVertical className="w-full h-auto text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full space-y-6 text-center"
        >
          {firstName && (
            <p className="text-white/80 text-[14px] font-bold tracking-[0.3em] uppercase drop-shadow-md">
              ¡{greeting}, {firstName}!
            </p>
          )}
          
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-medium text-white drop-shadow-lg leading-tight">
              Esperamos que tu estadía haya sido de tu agrado
            </h2>
            
            <p className="text-xl sm:text-2xl font-medium text-white drop-shadow-lg">
              ¡Te esperamos nuevamente!
            </p>
          </div>

          <div className="pt-4">
            <p className="text-white/60 text-sm">
              {propertyName}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

