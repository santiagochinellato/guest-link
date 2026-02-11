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
import { CheckCircle2, Ban, ScrollText, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

import { formatReservationDate } from "@/lib/utils/dates";

interface RulesDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allowed?: (string | { value: string })[];
  prohibited?: (string | { value: string })[];
  houseRules?: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInDate?: string;
  checkOutDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  access?: any;
}

export function RulesDrawer({
  isOpen,
  onOpenChange,
  allowed,
  prohibited,
  houseRules,
  checkInTime,
  checkOutTime,
  checkInDate,
  checkOutDate,
  access,
}: RulesDrawerProps) {
  const getRuleText = (rule: string | { value: string }) => {
    if (typeof rule === "string") return rule;
    return rule.value;
  };
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-sm overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold text-center">
              Información y Reglas
            </DrawerTitle>
            <DrawerDescription className="text-center">
              Datos de llegada y normas de convivencia
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto pb-8 space-y-6">
            {/* 1. Arrival & Departure
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                  Check-in
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {checkInDate
                    ? `${formatReservationDate(checkInDate)} · ${checkInTime || "15:00"}`
                    : checkInTime || "--:--"}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">
                  Check-out
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {checkOutDate
                    ? `${formatReservationDate(checkOutDate)} · ${checkOutTime || "11:00"}`
                    : checkOutTime || "--:--"}
                </p>
              </div>
            </div> */}

            {/* 2. Access Section (If exists)
            {access && (access.instructions || access.accessCode) && (
              <div className="bg-brand-void/5 dark:bg-brand-copper/10 border border-brand-void/10 dark:border-brand-copper/20 rounded-2xl p-4 space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-brand-void dark:text-brand-copper uppercase tracking-wider">
                  <KeyRound className="w-4 h-4" /> Acceso
                </h4>

                {access.accessCode && (
                  <div className="flex items-center justify-between bg-white dark:bg-black/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-medium text-zinc-500">
                      Código de entrada
                    </span>
                    <span className="font-mono font-bold text-lg tracking-widest text-zinc-900 dark:text-white">
                      {access.accessCode}
                    </span>
                  </div>
                )}

                {access.alarmCode && (
                  <div className="flex items-center justify-between bg-white dark:bg-black/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-medium text-zinc-500">
                      Alarma
                    </span>
                    <span className="font-mono font-bold text-lg tracking-widest text-zinc-900 dark:text-white">
                      {access.alarmCode}
                    </span>
                  </div>
                )}

                {access.instructions && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {access.instructions}
                  </div>
                )}
              </div>
            )} */}

            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800" />

            {/* Allowed / Prohibited Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Allowed */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Permitido
                </h4>
                {allowed && allowed.length > 0 ? (
                  <ul className="space-y-2">
                    {allowed.map((rule, i) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-600 dark:text-zinc-300 bg-green-50 dark:bg-green-900/10 px-1 py-1 rounded-lg border border-green-100 dark:border-green-900/20"
                      >
                        {getRuleText(rule)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    No especificado
                  </p>
                )}
              </div>

              {/* Prohibited */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  <Ban className="w-4 h-4" /> Prohibido
                </h4>
                {prohibited && prohibited.length > 0 ? (
                  <ul className="space-y-2">
                    {prohibited.map((rule, i) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-600 dark:text-zinc-300 bg-red-50 dark:bg-red-900/10 px-1 py-1 rounded-lg border border-red-100 dark:border-red-900/20"
                      >
                        {getRuleText(rule)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    No especificado
                  </p>
                )}
              </div>
            </div>

            {/* Free Text Rules */}
            {houseRules && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white mb-3">
                  <ScrollText className="w-4 h-4" /> Adicionales
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl">
                  {houseRules}
                </p>
              </div>
            )}

            <DrawerFooter className="px-0">
              <DrawerClose asChild>
                <Button className="w-full rounded-xl" size="lg">
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
