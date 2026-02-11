"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGuestViewModal } from "./GuestViewModal/useGuestViewModal";
import { GuestViewContent } from "./GuestViewModal/GuestViewContent";
import type { GuestViewModalProps } from "./GuestViewModal/types";

export { type GuestViewReservation, type GuestViewModalProps } from "./GuestViewModal/types";

export function GuestViewModal({
  open = true,
  onOpenChange,
  variant = "modal",
  reservation,
  lang = "es",
  existingToken,
  hasToken,
  onTokenGenerated,
}: GuestViewModalProps) {
  const isModal = variant === "modal";
  const isActive = isModal ? !!open : true;

  const {
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
    guestName,
    guestUrl,
    accessCode,
    saveContact,
    scheduleSave,
    handleBlur,
    handleCopy,
    openWhatsApp,
    openEmail,
    handleGenerateToken,
    handleRegenerateToken,
  } = useGuestViewModal({
    reservation,
    lang,
    existingToken,
    hasToken,
    isActive,
    onTokenGenerated,
  });

  const content = (
    <GuestViewContent
      reservation={reservation}
      lang={lang}
      guestLanguage={guestLanguage}
      setGuestLanguage={setGuestLanguage}
      email={email}
      setEmail={setEmail}
      phone={phone}
      setPhone={setPhone}
      token={token}
      expiresAt={expiresAt}
      shareMessage={shareMessage}
      setShareMessage={setShareMessage}
      isGenerating={isGenerating}
      isSaving={isSaving}
      copied={copied}
      guestName={guestName}
      guestUrl={guestUrl}
      accessCode={accessCode}
      isActive={isActive}
      saveContact={saveContact}
      scheduleSave={scheduleSave}
      handleBlur={handleBlur}
      handleCopy={handleCopy}
      openWhatsApp={openWhatsApp}
      openEmail={openEmail}
      handleGenerateToken={handleGenerateToken}
      handleRegenerateToken={handleRegenerateToken}
    />
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange!}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista del huésped · {guestName}</DialogTitle>
          <DialogDescription>
            Configura el contacto, genera el link y comparte la guía por WhatsApp o email.
          </DialogDescription>
        </DialogHeader>

        {content}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
