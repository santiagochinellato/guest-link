"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GuestRecommendationsView } from "../views/GuestRecommendationsView";
import { useState, useEffect } from "react";

interface GuideDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any[];
  categories: string[];
  propertyLocation?: { lat: number; lng: number };
}

export function GuideDrawer({
  isOpen,
  onOpenChange,
  recommendations,
  categories,
  propertyLocation,
}: GuideDrawerProps) {
  const [activeCategory, setActiveCategory] = useState("");

  // Reset category when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setActiveCategory("");
    }
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col h-[90vh]">
        <DrawerHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <div className="flex items-center justify-between">
            {activeCategory ? (
              <button
                onClick={() => setActiveCategory("")}
                className="p-1 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-500" />
              </button>
            ) : (
              <div className="w-6 h-6" />
            )}

            <div className="flex-1 text-center">
              <DrawerTitle className="text-xl font-bold">
                Guía Local
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                {activeCategory
                  ? "Explorando categoría"
                  : "Lo mejor de la zona"}
              </DrawerDescription>
            </div>

            <div className="w-6 h-6" />
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <GuestRecommendationsView
            recommendations={recommendations}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            propertyLocation={propertyLocation}
          />
        </div>

        <DrawerFooter className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full rounded-xl">
              Cerrar Guía
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
