import { useState, useEffect, useCallback, useRef } from "react";
import { generateGuestToken, regenerateGuestToken, getActiveTokenForReservation } from "@/lib/actions/guest-tokens";
import { updateReservationContact } from "@/lib/actions/reservations";
import { GUEST_LANGUAGES } from "@/db/schema";
import { toast } from "sonner";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { formatDate, getAccessCode, MESSAGE_TEMPLATES, resolveMessage } from "./helpers";
import type { GuestViewReservation } from "./types";

interface UseGuestViewModalProps {
  reservation: GuestViewReservation;
  lang: string;
  existingToken?: { token: string; expiresAt: Date } | null;
  hasToken?: boolean;
  isActive: boolean;
  onTokenGenerated?: () => void;
}

export function useGuestViewModal({
  reservation,
  lang,
  existingToken,
  hasToken,
  isActive,
  onTokenGenerated,
}: UseGuestViewModalProps) {
  const guestLangInit =
    reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
      ? (reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
      : "es";

  const [guestLanguage, setGuestLanguage] = useState<(typeof GUEST_LANGUAGES)[number]>(guestLangInit);
  const [email, setEmail] = useState(reservation.guestEmail || "");
  const [phone, setPhone] = useState(reservation.guestPhone || "");
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const guestName = parseGuestInfo(reservation.guestName).name;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const guestUrl = token ? `${baseUrl}/${lang}/stay/token/${token}` : "";
  const accessCode = token ? getAccessCode(token) : "";

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 600;

  // Limpiar timeout cuando el modal se cierra
  useEffect(() => {
    if (!isActive && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [isActive]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // Inicializar datos cuando se abre el modal o cambia la reserva
  useEffect(() => {
    const lang =
      reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
        ? (reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
        : "es";
    
    setEmail(reservation.guestEmail || "");
    setPhone(reservation.guestPhone || "");
    setGuestLanguage(lang);

    if (existingToken) {
      setToken(existingToken.token);
      setExpiresAt(existingToken.expiresAt);
      const code = getAccessCode(existingToken.token);
      const guestLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${lang}/stay/token/${existingToken.token}`;
      const tmplLang = (reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])) 
        ? reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number] 
        : "es";
      const defaultTemplate = MESSAGE_TEMPLATES[tmplLang][0];
      const propertyName = reservation.propertyName || "tu alojamiento";
      setShareMessage(
        resolveMessage(defaultTemplate.text, propertyName, code, guestLink, reservation.checkIn, reservation.checkOut)
      );
    } else {
      setToken(null);
      setExpiresAt(null);
      setShareMessage("");
    }
  }, [reservation.guestEmail, reservation.guestPhone, reservation.guestLanguage, reservation.checkIn, reservation.checkOut, reservation.propertyName, existingToken]);

  // Cargar token existente si no se pasó pero existe
  useEffect(() => {
    if (isActive && hasToken && !existingToken && !token) {
      getActiveTokenForReservation(reservation.id).then((r) => {
        if (r.success && r.token) {
          setToken(r.token);
          setExpiresAt(r.expiresAt);
          const code = getAccessCode(r.token);
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          const guestLink = `${baseUrl}/${lang}/stay/token/${r.token}`;
          const guestLang = (reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])) 
            ? reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number] 
            : "es";
          const defaultTemplate = MESSAGE_TEMPLATES[guestLang][0];
          const propertyName = reservation.propertyName || "tu alojamiento";
          setShareMessage(
            resolveMessage(defaultTemplate.text, propertyName, code, guestLink, reservation.checkIn, reservation.checkOut)
          );
        }
      });
    }
  }, [isActive, hasToken, existingToken, token, reservation.id, reservation.guestLanguage, reservation.checkIn, reservation.checkOut, reservation.propertyName, lang]);

  const saveContact = useCallback(
    async (newEmail: string, newPhone: string, newGuestLang?: (typeof GUEST_LANGUAGES)[number]) => {
      const emailChanged = newEmail.trim() !== (reservation.guestEmail || "").trim();
      const phoneChanged = newPhone.trim() !== (reservation.guestPhone || "").trim();
      const langToSave = newGuestLang ?? guestLanguage;
      const langChanged = langToSave !== (reservation.guestLanguage ?? "es");
      if (!emailChanged && !phoneChanged && !langChanged) return;
      setIsSaving(true);
      const result = await updateReservationContact(reservation.id, {
        guestEmail: newEmail.trim() || undefined,
        guestPhone: newPhone.trim() || undefined,
        guestLanguage: langToSave,
      });
      setIsSaving(false);
      if (result.success) {
        toast.success("Contacto guardado");
        if (newGuestLang) setGuestLanguage(newGuestLang);
      } else {
        toast.error(result.error || "Error al guardar");
      }
    },
    [reservation.id, reservation.guestEmail, reservation.guestPhone, reservation.guestLanguage, guestLanguage]
  );

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      saveContact(email, phone);
    }, DEBOUNCE_MS);
  }, [email, phone, saveContact]);

  const handleBlur = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    saveContact(email, phone);
  }, [email, phone, saveContact]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const openEmail = (text: string) => {
    const subject = encodeURIComponent(`Tu guía - ${reservation.propertyName || "Alojamiento"}`);
    const body = encodeURIComponent(text);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    const result = await generateGuestToken(reservation.id);
    setIsGenerating(false);
    if (result.success && result.token) {
      setToken(result.token);
      setExpiresAt(result.expiresAt || null);
      const code = getAccessCode(result.token);
      const guestLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${lang}/stay/token/${result.token}`;
      const defaultTemplate = MESSAGE_TEMPLATES[guestLanguage][0];
      const propertyName = reservation.propertyName || "tu alojamiento";
      setShareMessage(
        resolveMessage(defaultTemplate.text, propertyName, code, guestLink, reservation.checkIn, reservation.checkOut)
      );
      toast.success("Token generado");
      onTokenGenerated?.();
    } else {
      toast.error(result.error || "Error al generar token");
    }
  };

  const handleRegenerateToken = async () => {
    setIsGenerating(true);
    const result = await regenerateGuestToken(reservation.id);
    setIsGenerating(false);
    if (result.success && "token" in result && result.token) {
      setToken(result.token);
      setExpiresAt(result.expiresAt ?? null);
      const code = getAccessCode(result.token);
      const guestLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${lang}/stay/token/${result.token}`;
      const defaultTemplate = MESSAGE_TEMPLATES[guestLanguage][0];
      const propertyName = reservation.propertyName || "tu alojamiento";
      setShareMessage(
        resolveMessage(defaultTemplate.text, propertyName, code, guestLink, reservation.checkIn, reservation.checkOut)
      );
      toast.success("Link regenerado");
      onTokenGenerated?.();
    } else {
      toast.error(result.error || "Error al regenerar");
    }
  };

  return {
    // State
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
    // Actions
    saveContact,
    scheduleSave,
    handleBlur,
    handleCopy,
    openWhatsApp,
    openEmail,
    handleGenerateToken,
    handleRegenerateToken,
  };
}

