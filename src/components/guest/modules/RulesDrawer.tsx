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
import { CheckCircle2, Ban, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

interface RulesDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allowed?: (string | { value: string })[];
  prohibited?: (string | { value: string })[];
  houseRules?: string;
}

export function RulesDrawer({
  isOpen,
  onOpenChange,
  allowed,
  prohibited,
  houseRules,
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
              Reglas de la Casa
            </DrawerTitle>
            <DrawerDescription className="text-center">
              Normas de convivencia para una estadía feliz
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto pb-8 space-y-6">
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
                <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl">
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
