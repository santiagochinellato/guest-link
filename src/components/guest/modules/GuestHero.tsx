"use client";

import { motion } from "framer-motion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface GuestHeroProps {
  name: string;
  coverImage?: string;
}

export function GuestHero({ name, coverImage }: GuestHeroProps) {
  return (
    <div className="relative h-[38vh] w-full overflow-hidden bg-zinc-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback src={coverImage} alt={name} />
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
  );
}
