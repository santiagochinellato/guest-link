"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeCard } from "./access-details/CodeCard";
import { AccessSteps } from "./access-details/AccessSteps";

interface AccessDetailsDrawerProps {
  children: React.ReactNode;
  accessCode?: string;
  alarmCode?: string;
  hasParking?: boolean;
  parkingDetails?: string;
  accessSteps?: { text: string }[];
}

export function AccessDetailsDrawer({
  children,
  accessCode,
  alarmCode,
  hasParking,
  parkingDetails,
  accessSteps,
}: AccessDetailsDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold text-center">
              Detalles de Acceso
            </DrawerTitle>
            <DrawerDescription className="text-center">
              Información segura para tu llegada
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-6 overflow-y-auto pb-8">
            {/* Access Codes Grid */}
            <div
              className={cn(
                "grid gap-4",
                alarmCode ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {/* Door Code */}
              {accessCode && <CodeCard type="access" code={accessCode} />}

              {/* Alarm Code */}
              {alarmCode && <CodeCard type="alarm" code={alarmCode} />}
            </div>

            {/* Parking Details */}
            {hasParking && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl shrink-0">
                    <Car
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
                      Estacionamiento Disponible
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {parkingDetails ||
                        "Hay estacionamiento disponible en la propiedad."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Access Steps */}
            {accessSteps && <AccessSteps steps={accessSteps} />}

            <DrawerFooter className="px-0">
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl h-12 text-md"
                >
                  Entendido
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
