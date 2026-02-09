"use client";

import { AlertTriangle, Phone, Shield, Ambulance, Flame, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  id?: number;
  name: string;
  phone: string;
  type?: string;
}

interface EmergencyCardProps {
  emergencyContacts?: EmergencyContact[];
  hostPhone?: string;
  hostName?: string;
}

const getIconForContact = (name: string, type?: string) => {
  const lowercaseName = name.toLowerCase();
  if (
    type === "police" ||
    lowercaseName.includes("polic") ||
    lowercaseName.includes("seguridad")
  )
    return <Shield className="w-5 h-5" />;
  if (
    type === "medical" ||
    lowercaseName.includes("ambul") ||
    lowercaseName.includes("hosp") ||
    lowercaseName.includes("medic")
  )
    return <Ambulance className="w-5 h-5" />;
  if (
    type === "fire" ||
    lowercaseName.includes("bomb") ||
    lowercaseName.includes("fuego")
  )
    return <Flame className="w-5 h-5" />;
  if (
    lowercaseName.includes("host") ||
    lowercaseName.includes("anfitrión") ||
    lowercaseName.includes("dueño")
  )
    return <User className="w-5 h-5" />;
  return <Phone className="w-5 h-5" />;
};

export function EmergencyCard({
  emergencyContacts = [],
  hostPhone,
  hostName,
}: EmergencyCardProps) {
  // Combinar contactos de emergencia con host si está disponible
  const allContacts: EmergencyContact[] = [
    ...emergencyContacts,
    ...(hostPhone && hostName
      ? [{ name: `Anfitrión: ${hostName}`, phone: hostPhone, type: "host" }]
      : []),
  ];
  
  if (allContacts.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 w-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-3xl border-2 border-red-200 dark:border-red-800 shadow-lg overflow-hidden">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-red-900 dark:text-red-100">
              Emergencias
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">
              Acceso rápido a números importantes
            </p>
          </div>
        </div>
        
        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allContacts.map((contact, index) => {
            const icon = getIconForContact(contact.name, contact.type);
            
            return (
              <a
                key={index}
                href={`tel:${contact.phone}`}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-red-900 dark:text-red-100 truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs font-mono text-red-700 dark:text-red-300">
                    {contact.phone}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
        
        {/* Info Message */}
        <div className="pt-2 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-300 text-center">
            Toca cualquier número para llamar directamente
          </p>
        </div>
      </div>
    </div>
  );
}

