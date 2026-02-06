"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Check, Key, Mail, Phone, MessageCircle, ExternalLink, FileText, Loader2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateGuestToken } from "@/lib/actions/guest-tokens";
import { updateReservationContact } from "@/lib/actions/reservations";
import { GUEST_LANGUAGES } from "@/db/schema";
import { toast } from "sonner";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { cn } from "@/lib/utils";

export type GuestViewReservation = {
  id: number;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  /** Idioma del huésped: es, en, pt. Define idioma de mensajes y pantalla guía */
  guestLanguage?: string | null;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  propertyName?: string | null;
  propertySlug?: string | null;
};

interface GuestViewModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "modal" | "inline";
  reservation: GuestViewReservation;
  lang?: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Deriva un código de 5 dígitos único del token */
function getAccessCode(token: string): string {
  const num = parseInt(token.slice(-5), 16) % 100000;
  return String(num).padStart(5, "0");
}

const LANGUAGE_LABELS: Record<(typeof GUEST_LANGUAGES)[number], string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

/** Plantillas de mensaje por idioma */
const MESSAGE_TEMPLATES: Record<
  (typeof GUEST_LANGUAGES)[number],
  ReadonlyArray<{ name: string; text: string }>
> = {
  es: [
    {
      name: "Buenos días",
      text: `Buenos días! Muchas gracias por elegir #nombrepropiedad.

A continuación te acercamos el detalle de tu reserva, cómo llegar, wifi y recomendaciones pensadas para que aproveches al máximo tu estadía.

Tu CÓDIGO DE ACCESO es #codigo

[link a la web]

¡Te esperamos!`,
    },
    {
      name: "Hola casual",
      text: `¡Hola! Gracias por elegir #nombrepropiedad 👋

Te compartimos tu guía digital con el detalle de tu reserva, cómo llegar, wifi y recomendaciones.

Tu código de acceso es #codigo

Accede aquí: [link a la web]

¡Que disfrutes tu estadía!`,
    },
    {
      name: "Check-in directo",
      text: `Tu guía digital está lista.

Check-in: #checkin | Check-out: #checkout

Tu CÓDIGO DE ACCESO es #codigo

🔗 Accede a tu guía: [link a la web]`,
    },
  ],
  en: [
    {
      name: "Good morning",
      text: `Good morning! Thank you for choosing #nombrepropiedad.

Here is the detail of your reservation, how to get there, wifi and recommendations to make the most of your stay.

Your ACCESS CODE is #codigo

[link a la web]

We look forward to welcoming you!`,
    },
    {
      name: "Hello casual",
      text: `Hello! Thanks for choosing #nombrepropiedad 👋

We're sharing your digital guide with your reservation details, directions, wifi and recommendations.

Your access code is #codigo

Access here: [link a la web]

Enjoy your stay!`,
    },
    {
      name: "Check-in direct",
      text: `Your digital guide is ready.

Check-in: #checkin | Check-out: #checkout

Your ACCESS CODE is #codigo

🔗 Access your guide: [link a la web]`,
    },
  ],
  pt: [
    {
      name: "Bom dia",
      text: `Bom dia! Muito obrigado por escolher #nombrepropiedad.

A seguir enviamos o detalhe da sua reserva, como chegar, wifi e recomendações para aproveitar ao máximo sua estadia.

Seu CÓDIGO DE ACESSO é #codigo

[link a la web]

Esperamos por você!`,
    },
    {
      name: "Olá casual",
      text: `Olá! Obrigado por escolher #nombrepropiedad 👋

Compartilhamos sua guia digital com o detalhe da reserva, como chegar, wifi e recomendações.

Seu código de acesso é #codigo

Acesse aqui: [link a la web]

Aproveite sua estadia!`,
    },
    {
      name: "Check-in direto",
      text: `Sua guia digital está pronta.

Check-in: #checkin | Check-out: #checkout

Seu CÓDIGO DE ACESSO é #codigo

🔗 Acesse sua guia: [link a la web]`,
    },
  ],
};

function GuestViewContent({
  reservation,
  lang,
  guestLanguage,
  setGuestLanguage,
  email,
  setEmail,
  phone,
  setPhone,
  token,
  setToken,
  expiresAt,
  setExpiresAt,
  isGenerating,
  setIsGenerating,
  isSaving,
  saveContact,
  scheduleSave,
  handleBlur,
  copied,
  handleCopy,
  guestName,
  guestUrl,
  accessCode,
  shareMessage,
  setShareMessage,
  openWhatsApp,
  openEmail,
  isActive,
}: {
  reservation: GuestViewReservation;
  lang: string;
  guestLanguage: (typeof GUEST_LANGUAGES)[number];
  setGuestLanguage: (v: (typeof GUEST_LANGUAGES)[number]) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  token: string | null;
  setToken: (v: string | null) => void;
  expiresAt: Date | null;
  setExpiresAt: (v: Date | null) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  isSaving: boolean;
  saveContact: (email: string, phone: string, guestLang?: (typeof GUEST_LANGUAGES)[number]) => Promise<void>;
  scheduleSave: () => void;
  handleBlur: () => void;
  copied: boolean;
  handleCopy: (text: string) => void;
  guestName: string;
  guestUrl: string;
  accessCode: string;
  shareMessage: string;
  setShareMessage: (v: string) => void;
  openWhatsApp: (text: string) => void;
  openEmail: (text: string) => void;
  isActive: boolean;
}) {
  const propertyName = reservation.propertyName || "tu alojamiento";

  const resolveMessage = useCallback(
    (msg: string) =>
      msg
        .replace(/#nombrepropiedad/g, propertyName)
        .replace(/#codigo/g, accessCode)
        .replace(/\[link a la web\]/g, guestUrl)
        .replace(/#checkin/g, formatDate(reservation.checkIn))
        .replace(/#checkout/g, formatDate(reservation.checkOut)),
    [propertyName, accessCode, guestUrl, reservation.checkIn, reservation.checkOut]
  );

  const templates = MESSAGE_TEMPLATES[guestLanguage];

  const handleSelectTemplate = (template: (typeof templates)[number]) => {
    setShareMessage(resolveMessage(template.text));
    toast.success(`Plantilla "${template.name}" aplicada`);
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
      const defaultTemplate = templates[0];
      setShareMessage(
        defaultTemplate.text
          .replace(/#nombrepropiedad/g, propertyName)
          .replace(/#codigo/g, code)
          .replace(/\[link a la web\]/g, guestLink)
          .replace(/#checkin/g, formatDate(reservation.checkIn))
          .replace(/#checkout/g, formatDate(reservation.checkOut))
      );
      toast.success("Token generado");
    } else {
      toast.error(result.error || "Error al generar token");
    }
  };

  useEffect(() => {
    if (isActive) scheduleSave();
    return () => {};
  }, [email, phone, isActive, scheduleSave]);

  const hasToken = !!token;
  const showLoading = isGenerating;

  return (
    <div className="space-y-5 relative min-h-[200px]">
      {/* Loading overlay: oculta todo y muestra spinner */}
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

      {/* 1. Contacto + Generar link (oculto durante loading) */}
      {!showLoading && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Idioma del huésped
              </Label>
              <Select
                value={guestLanguage}
                onValueChange={(v) => {
                  const newLang = v as (typeof GUEST_LANGUAGES)[number];
                  setGuestLanguage(newLang);
                  saveContact(email, phone, newLang);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GUEST_LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LANGUAGE_LABELS[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define el idioma de las plantillas y de la guía.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                type="email"
                placeholder="huésped@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                className="transition-all"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono
              </Label>
              <Input
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handleBlur}
                className="transition-all"
              />
              {isSaving && (
                <p className="text-xs text-muted-foreground">Guardando...</p>
              )}
            </div>
          </div>

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

      {/* 2. Link + Código de acceso (visible cuando hay token, oculto durante loading) */}
      {hasToken && !showLoading && (
        <div
          className={cn(
            "space-y-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex gap-4",
            "bg-gray-50/50 dark:bg-gray-900/30",
            "animate-in fade-in slide-in-from-top-2 duration-300"
          )}
        >
          <div className="space-y-2 w-1/2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-copper" />
              Link de la guía
            </Label>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border text-sm font-mono break-all">
              {guestUrl}
            </div>
            {expiresAt && (
              <p className="text-xs text-muted-foreground">
                Válido hasta: {expiresAt.toLocaleDateString("es-ES", { dateStyle: "long" })}
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleCopy(guestUrl)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar link"}
              </Button>
              <Button size="sm" asChild>
                <a href={guestUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Ver guía
                </a>
              </Button>
            </div>
              <div className="">
            <Label className="text-xs font-medium text-muted-foreground">Código de acceso</Label>
            <div className=" inline-flex items-center gap-2 ml-2 px-4 py-1 rounded-lg bg-white dark:bg-gray-900 border font-mono text-lg font-semibold tracking-widest">
              {accessCode}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleCopy(accessCode)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
            </div>
          </div>
            {/* 3. Compartir mensaje (visible cuando hay token, oculto durante loading) */}
      {hasToken && !showLoading && (
        <div
          className={cn(
            "space-y-3 w-1/2 ",
            "animate-in fade-in slide-in-from-top-2 duration-300"
          )}
        >
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Compartir mensaje 
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edita el texto o elige una plantilla. Las variables se reemplazan automáticamente.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <Button
                key={tpl.name}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => handleSelectTemplate(tpl)}
              >
                <FileText className="w-3.5 h-3.5" />
                {tpl.name}
              </Button>
            ))}
          </div>

          <Textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            placeholder="Escribe o pega tu mensaje aquí..."
            className="min-h-[120px] font-sans text-sm resize-y"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleCopy(resolveMessage(shareMessage))}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copiar
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-[#25D366] hover:bg-[#20BD5A]"
              onClick={() => openWhatsApp(resolveMessage(shareMessage))}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => openEmail(resolveMessage(shareMessage))}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
        </div>
      )}
        </div>
      )}

    
    </div>
  );
}

export function GuestViewModal({
  open = true,
  onOpenChange,
  variant = "modal",
  reservation,
  lang = "es",
}: GuestViewModalProps) {
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

  const isModal = variant === "modal";
  const isActive = isModal ? !!open : true;

  useEffect(() => {
    if (!isActive && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const lang =
      reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
        ? (reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
        : "es";
    if (isModal && open) {
      setEmail(reservation.guestEmail || "");
      setPhone(reservation.guestPhone || "");
      setGuestLanguage(lang);
      setToken(null);
      setExpiresAt(null);
      setShareMessage("");
    }
    if (!isModal) {
      setEmail(reservation.guestEmail || "");
      setPhone(reservation.guestPhone || "");
      setGuestLanguage(lang);
    }
  }, [isModal, open, reservation.guestEmail, reservation.guestPhone, reservation.guestLanguage]);

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

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 600;

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
      setToken={setToken}
      expiresAt={expiresAt}
      setExpiresAt={setExpiresAt}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
      isSaving={isSaving}
      saveContact={saveContact}
      scheduleSave={scheduleSave}
      handleBlur={handleBlur}
      copied={copied}
      handleCopy={handleCopy}
      guestName={guestName}
      guestUrl={guestUrl}
      accessCode={accessCode}
      shareMessage={shareMessage}
      setShareMessage={setShareMessage}
      openWhatsApp={openWhatsApp}
      openEmail={openEmail}
      isActive={isActive}
    />
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange!}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto">
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
