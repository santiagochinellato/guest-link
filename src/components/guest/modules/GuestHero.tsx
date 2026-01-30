"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HostlyLogoVertical } from "@/components/ui/branding/HostlyLogo";

interface GuestHeroProps {
  name: string;
  address: string;
  coverImage?: string;
  hostName?: string;
  hostImage?: string;
  hostPhone?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export function GuestHero({
  name,
  address,
  coverImage,
  hostName,
  hostImage, // eslint-disable-line @typescript-eslint/no-unused-vars
  hostPhone,
  checkInTime,
  checkOutTime,
}: GuestHeroProps) {
  const handleContactHost = () => {
    if (!hostPhone) return;
    // Basic WhatsApp Link
    window.open(`https://wa.me/${hostPhone.replace(/\D/g, "")}`, "_blank");
  };

  return (
    <div className="relative w-full h-[35vh] min-h-[280px] bg-slate-200">
      {/* Background Image */}
      {coverImage ? (
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand-void to-slate-900 flex items-center justify-center">
          <span className="text-white/20 text-4xl font-bold uppercase tracking-widest">
            {name?.[0] || "G"}
          </span>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Top Header Area: Logo & Times */}
      <div className="absolute top-0 left-50 right-50 p-4 flex justify-between items-start z-20 pt-16">
        {/* Hostly Logo (Left) */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10">
          <HostlyLogoVertical className="h-12 w-auto text-white" />
        </div>

        {/* Floating Times (Right) */}
        {(checkInTime || checkOutTime) && (
          <div className="flex flex-col gap-2">
            {checkInTime && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white flex flex-col items-center min-w-[70px]">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Check-in
                </span>
                <span className="text-lg font-black leading-none">
                  {checkInTime}
                </span>
              </div>
            )}
            {checkOutTime && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white flex flex-col items-center min-w-[70px]">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Check-out
                </span>
                <span className="text-lg font-black leading-none">
                  {checkOutTime}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 flex flex-col items-start gap-1">
        <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-md pr-16 line-clamp-2">
          {name}
        </h1>
        <p className="text-white/80 text-sm font-medium flex items-center gap-2 mb-4">
          📍 {address}
        </p>

        {/* Host Chip (Immersive + Contact Legend) */}
        {hostName && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider ml-1">
              Anfitrión
            </span>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-brand-copper flex items-center justify-center text-[10px] text-white font-bold">
                {hostName[0]}
              </div>
              <span className="text-xs text-white/90 font-medium">
                {hostName}
              </span>
              {hostPhone && (
                <span className="text-[10px] text-white/50 ml-1">
                  • Contactar
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FAB: Contact Host */}
      {hostPhone && (
        <div className="absolute bottom-[-20px] right-6 z-20 group">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Contactar
          </div>
          <Button
            onClick={handleContactHost}
            className="rounded-full w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center p-0 transition-transform active:scale-95 overflow-visible"
          >
            <MessageCircle className="w-7 h-7 fill-current" />
          </Button>
        </div>
      )}
    </div>
  );
}
