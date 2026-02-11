"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContactSection } from "./ContactSection";
import { TokenSection } from "./TokenSection";
import { ShareMessageSection } from "./ShareMessageSection";
import { GUEST_LANGUAGES } from "@/db/schema";
import type { GuestViewReservation } from "./types";

interface GuestViewContentProps {
  reservation: GuestViewReservation;
  lang: string;
  guestLanguage: (typeof GUEST_LANGUAGES)[number];
  setGuestLanguage: (v: (typeof GUEST_LANGUAGES)[number]) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  token: string | null;
  expiresAt: Date | null;
  shareMessage: string;
  setShareMessage: (v: string) => void;
  isGenerating: boolean;
  isSaving: boolean;
  copied: boolean;
  guestName: string;
  guestUrl: string;
  accessCode: string;
  isActive: boolean;
  saveContact: (email: string, phone: string, guestLang?: (typeof GUEST_LANGUAGES)[number]) => Promise<void>;
  scheduleSave: () => void;
  handleBlur: () => void;
  handleCopy: (text: string) => void;
  openWhatsApp: (text: string) => void;
  openEmail: (text: string) => void;
  handleGenerateToken: () => Promise<void>;
  handleRegenerateToken: () => Promise<void>;
}

export function GuestViewContent({
  reservation,
  guestLanguage,
  setGuestLanguage,
  email,
  setEmail,
  phone,
  setPhone,
  token,
  expiresAt,
  shareMessage,
  setShareMessage,
  isGenerating,
  isSaving,
  copied,
  guestUrl,
  accessCode,
  isActive,
  saveContact,
  scheduleSave,
  handleBlur,
  handleCopy,
  openWhatsApp,
  openEmail,
  handleGenerateToken,
  handleRegenerateToken,
}: GuestViewContentProps) {
  const propertyName = reservation.propertyName || "tu alojamiento";
  const hasToken = !!token;
  const showLoading = isGenerating;

  useEffect(() => {
    if (isActive) scheduleSave();
  }, [email, phone, isActive, scheduleSave]);

  return (
    <div className="space-y-5 relative min-h-[200px]">
      {/* Loading overlay */}
      {showLoading && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3",
            "rounded-xl bg-background/95 backdrop-blur-sm",
            "animate-in fade-in duration-200"
          )}
        >
          <Loader2 className="w-10 h-10 animate-spin text-brand-copper" />
          <p className="text-sm text-muted-foreground">Generando link...</p>
        </div>
      )}

      {/* Contact Section */}
      {!showLoading && (
        <div className="space-y-4">
          <ContactSection
            guestLanguage={guestLanguage}
            setGuestLanguage={setGuestLanguage}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            isSaving={isSaving}
            onBlur={handleBlur}
            onLanguageChange={(lang) => saveContact(email, phone, lang)}
          />

          {!hasToken && (
            <Button
              onClick={handleGenerateToken}
              disabled={isGenerating}
              className="w-full bg-brand-copper hover:bg-brand-copper/90"
              size="lg"
            >
              Generar link
            </Button>
          )}
        </div>
      )}

      {/* Token Section */}
      {hasToken && !showLoading && (
        <div className="flex gap-4">
          <TokenSection
            guestUrl={guestUrl}
            accessCode={accessCode}
            expiresAt={expiresAt}
            copied={copied}
            isGenerating={isGenerating}
            onCopy={handleCopy}
            onRegenerate={handleRegenerateToken}
          />

          {/* Share Message Section */}
          <ShareMessageSection
            guestLanguage={guestLanguage}
            shareMessage={shareMessage}
            setShareMessage={setShareMessage}
            copied={copied}
            propertyName={propertyName}
            accessCode={accessCode}
            guestUrl={guestUrl}
            checkIn={reservation.checkIn}
            checkOut={reservation.checkOut}
            onCopy={handleCopy}
            onWhatsApp={openWhatsApp}
            onEmail={openEmail}
          />
        </div>
      )}
    </div>
  );
}

