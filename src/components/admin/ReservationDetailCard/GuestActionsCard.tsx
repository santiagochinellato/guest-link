"use client";

import Link from "next/link";
import { KeyRound, Link2, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuestActionsCardProps {
  activeToken: { token: string; expiresAt: Date } | null;
  guestUrl: string | null;
  onOpenModal: () => void;
  /** Para enlazar al diseñador de flyers (FlyerSection) de la propiedad */
  propertyId?: number | null;
  lang?: string;
}

export function GuestActionsCard({
  activeToken,
  guestUrl,
  onOpenModal,
  propertyId,
  lang = "es",
}: GuestActionsCardProps) {
  const flyerUrl = propertyId ? `/${lang}/dashboard/properties/${propertyId}/edit?tab=flyer` : null;
  return (
    <div
      className={cn(
        "rounded-2xl p-6 flex flex-col justify-between",
        "bg-gradient-to-br from-orange-500 to-pink-500 text-white",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div>
        <KeyRound className="w-10 h-10 mb-4 opacity-90" />
        <h3 className="text-xl font-bold mb-1">Vista del huésped</h3>
        <p className="text-sm opacity-90">Gestiona el acceso a la guía digital</p>
      </div>

      <div className="flex flex-col gap-2 mt-6">
        <Button
          variant="secondary"
          className="w-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white"
          onClick={onOpenModal}
        >
          {activeToken ? (
            <>
              <Check className="w-4 h-4" />
              Link generado
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Generar link
            </>
          )}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {guestUrl ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white"
                asChild
              >
                <a href={guestUrl} target="_blank" rel="noopener noreferrer">
                  <Link2 className="w-4 h-4" />
                  Guía
                </a>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white"
                asChild
              >
                {flyerUrl ? (
                  <Link href={flyerUrl}>
                    <QrCode className="w-4 h-4" />
                    QR
                  </Link>
                ) : (
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <QrCode className="w-4 h-4" />
                    QR
                  </a>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="col-span-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white"
              onClick={onOpenModal}
            >
              <KeyRound className="w-4 h-4" />
              Generar link primero
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

