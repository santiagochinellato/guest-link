"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  image: string;
  name: string;
}

export function HeroSection({ image, name }: HeroSectionProps) {
  return (
    <div className="relative h-64 md:h-80 w-full overflow-hidden">
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8 }}
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white"
        >
          <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">
            Welcome to
          </p>
          <h1 className="text-3xl font-bold">{name}</h1>
        </motion.div>
      </div>
    </div>
  );
}
