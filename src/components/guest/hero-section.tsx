"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface HeroSectionProps {
  image: string;
  name: string;
  welcomeText: string;
}

export function HeroSection({ image, name, welcomeText }: HeroSectionProps) {
  return (
    <div className="relative h-[45vh] lg:h-[50vh] w-full overflow-hidden rounded-b-[2.5rem] shadow-xl z-0">
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {/* Fallback pattern if no image */}
        {!image ? (
          <div className="w-full h-full bg-neutral-900" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="w-full h-full object-cover" />
        )}
      </motion.div>

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white max-w-2xl mx-auto w-full"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">
              Superhost
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2 tracking-tight">
            {name}
          </h1>
          <p className="text-lg text-white/80 font-medium">{welcomeText}</p>
        </motion.div>
      </div>
    </div>
  );
}
