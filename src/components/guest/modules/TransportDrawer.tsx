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
import { GuestRecommendationsView } from "../views/GuestRecommendationsView";

interface TransportDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transportRecommendations: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transportCategories: any[];
}

export function TransportDrawer({
  isOpen,
  onOpenChange,
  transportRecommendations,
  transportCategories,
}: TransportDrawerProps) {
  // Sort categories to put 'bus' first
  const sortedCategories = [...transportCategories].sort((a, b) => {
    if (a === "bus") return -1;
    if (b === "bus") return 1;
    return 0;
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col h-[90vh]">
        <DrawerHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <DrawerTitle className="text-xl font-bold">
                Transporte
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                Opciones para moverte por la ciudad
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20">
          <GuestRecommendationsView
            recommendations={transportRecommendations}
            categories={sortedCategories}
            activeCategory=""
            setActiveCategory={() => {}}
            useScrollNavigation={true}
          />
        </div>

        <DrawerFooter className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full rounded-xl">
              Cerrar Transporte
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
