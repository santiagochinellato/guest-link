"use client";

import { AlertCircle, MessageCircle, Phone, User } from "lucide-react";

interface GuestEmergencyViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: {
    hostName?: string;
    hostPhone?: string;
    hostImage?: string;
    emergencyContacts?: any[];
  };
}

export function GuestEmergencyView({ property }: GuestEmergencyViewProps) {
  return (
    <div className="animate-in slide-in-from-right duration-300">
      <div className=" dark:bg-neutral-800 rounded-[2.5rem]  ">
        <div className="bg-red-50 dark:bg-red-900/10 rounded-[2rem] p-6 border border-red-100 dark:border-red-900/20 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="size-12 rounded-full bg-white dark:bg-red-900 flex items-center justify-center text-red-500 shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                Zona de Ayuda
              </h3>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 font-bold uppercase tracking-wider">
                Prioridad Alta
              </p>
            </div>
          </div>
          <p className="text-sm text-red-800/80 dark:text-red-200/80 leading-relaxed pl-1">
            Si tienes un problema urgente o necesitas asistencia inmediata,
            utiliza estos contactos. Estamos aquí para ayudarte 24/7.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">
            Contactos Directos
          </h4>

          {/* Host Contact Card (Dynamic) */}
          {property.hostPhone && (
            <div className="flex items-center justify-between p-5 bg-[#0f756d]/5 dark:bg-[#0f756d]/10 rounded-2xl shadow-sm border border-[#0f756d]/20 group hover:border-[#0f756d]/50 transition-all">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="size-12 rounded-full bg-[#0f756d]/10 flex items-center justify-center text-[#0f756d] transition-colors flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      property.hostImage ||
                      "https://ui-avatars.com/api/?name=" +
                        (property.hostName || "Host")
                    }
                    alt="Host"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight break-words">
                    Contactar a {property.hostName || "Anfitrión"}
                  </span>
                  <span className="text-xs text-[#0f756d] font-bold uppercase tracking-wider mt-0.5">
                    WhatsApp / Llamada
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/${property.hostPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="size-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all active:scale-95 flex-shrink-0"
              >
                <MessageCircle className="w-6 h-6 fill-white" />
              </a>
            </div>
          )}

          <div className="mt-8 p-6 bg-neutral-900 rounded-[2rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-50" />
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1 relative z-10">
              Servicios Públicos
            </p>
            <p className="text-4xl font-black text-white relative z-10 tracking-tight my-2">
              911
            </p>
            <p className="text-sm font-medium text-white/70 relative z-10">
              Policía & Ambulancia
            </p>
          </div>
          {property.emergencyContacts?.map((contact: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between p-5 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 group hover:border-[#0f756d]/30 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="size-12 rounded-full bg-gray-50 dark:bg-neutral-800 group-hover:bg-[#0f756d]/10 flex items-center justify-center text-gray-400 group-hover:text-[#0f756d] transition-colors flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight break-words">
                    {contact.name}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-0.5">
                    {contact.type}
                  </span>
                </div>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="size-12 rounded-full bg-[#0f756d] text-white flex items-center justify-center shadow-lg shadow-[#0f756d]/30 hover:bg-[#0d6059] hover:scale-110 transition-all active:scale-95 flex-shrink-0"
              >
                <Phone className="w-5 h-5 fill-current" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
