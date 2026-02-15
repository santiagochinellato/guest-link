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
import {
  Phone,
  AlertTriangle,
  Ambulance,
  Flame,
  ShieldAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  name: string;
  phone: string;
  type?: string;
}

interface EmergencyDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contacts?: EmergencyContact[];
  address?: string;
  hostName?: string;
  hostPhone?: string;
  showHostInEmergency?: boolean;
}

export function EmergencyDrawer({
  isOpen,
  onOpenChange,
  contacts,
  address,
  hostName,
  hostPhone,
  showHostInEmergency = true,
}: EmergencyDrawerProps) {
  const getIcon = (type?: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("polic") || t.includes("segur")) return ShieldAlert;
    if (t.includes("hosp") || t.includes("ambul") || t.includes("medic"))
      return Ambulance;
    if (t.includes("bomb") || t.includes("fuego")) return Flame;
    return Phone;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-sm overflow-y-auto">
          <DrawerHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <DrawerTitle className="text-2xl font-bold text-center text-red-600 dark:text-red-500">
              Área de Ayuda
            </DrawerTitle>
            <DrawerDescription className="text-center">
              Toca para llamar inmediatamente
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto pb-8 space-y-6">
            {/* Current Location Info */}
            {address && (
              <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Estás en
                </p>
                <p className="font-medium text-zinc-900 dark:text-white leading-tight">
                  {address}
                </p>
              </div>
            )}

            <div className="grid gap-3">
              {/* SPECIAL HOST CARD */}
              {hostPhone && showHostInEmergency && (
                <a
                  href={`https://wa.me/${hostPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-brand-copper/5 border border-brand-copper/20 rounded-2xl active:scale-[0.98] transition-transform shadow-sm hover:bg-brand-copper/10 group mb-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-copper text-white flex items-center justify-center shadow-md">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-copper dark:text-brand-lightCopper">
                        {hostName || "Anfitrión"}
                      </p>
                      <p className="text-sm text-brand-copper/80">
                        Contacto Directo
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-brand-void px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-brand-copper shadow-sm">
                    {hostPhone}
                  </div>
                </a>
              )}

              {contacts?.map((contact, i) => {
                const Icon = getIcon(contact.type);
                return (
                  <a
                    key={i}
                    href={`tel:${contact.phone}`}
                    className="flex flex-col items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl active:scale-[0.98] transition-transform shadow-sm hover:border-red-200 dark:hover:border-red-900/50 group w-full"
                  >
                    <div className="w-full justify-start flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {contact.name}
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-between gap-4">
                      <p className="text-sm text-zinc-500 pl-14">
                        {contact.type || "Emergencia"}
                      </p>
                      <p className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {contact.phone}
                      </p>
                    </div>
                  </a>
                );
              })}

              {(!contacts || contacts.length === 0) && (
                <a
                  href="tel:911"
                  className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-red-900 dark:text-red-100">
                        Emergencias General
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Policía / Bomberos
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-red-950 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-red-600 dark:text-red-400">
                    911
                  </div>
                </a>
              )}
            </div>

            <DrawerFooter className="px-0">
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full text-zinc-500">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
