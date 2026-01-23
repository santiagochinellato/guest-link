"use client";

import { motion } from "framer-motion";
import { Map, AlertCircle, Car, ScrollText } from "lucide-react";

interface GridItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function GridMenu() {
  const items: GridItem[] = [
    {
      icon: <ScrollText className="w-8 h-8 text-emerald-600 mb-2" />,
      label: "House Rules",
    },
    {
      icon: <Map className="w-8 h-8 text-blue-600 mb-2" />,
      label: "Local Guide",
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-red-500 mb-2" />,
      label: "Emergency",
    },
    {
      icon: <Car className="w-8 h-8 text-amber-500 mb-2" />,
      label: "Transport",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4"
    >
      {items.map((action, idx) => (
        <motion.div
          key={idx}
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 flex flex-col items-center gap-1 text-center aspect-square justify-center cursor-pointer"
        >
          {action.icon}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {action.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
