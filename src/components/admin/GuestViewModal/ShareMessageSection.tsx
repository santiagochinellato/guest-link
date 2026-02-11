"use client";

import { Copy, Check, MessageCircle, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GUEST_LANGUAGES } from "@/db/schema";
import { MESSAGE_TEMPLATES, resolveMessage } from "./helpers";

interface ShareMessageSectionProps {
  guestLanguage: (typeof GUEST_LANGUAGES)[number];
  shareMessage: string;
  setShareMessage: (v: string) => void;
  copied: boolean;
  propertyName: string;
  accessCode: string;
  guestUrl: string;
  checkIn: string;
  checkOut: string;
  onCopy: (text: string) => void;
  onWhatsApp: (text: string) => void;
  onEmail: (text: string) => void;
}

export function ShareMessageSection({
  guestLanguage,
  shareMessage,
  setShareMessage,
  copied,
  propertyName,
  accessCode,
  guestUrl,
  checkIn,
  checkOut,
  onCopy,
  onWhatsApp,
  onEmail,
}: ShareMessageSectionProps) {
  const templates = MESSAGE_TEMPLATES[guestLanguage];

  const handleSelectTemplate = (template: (typeof templates)[number]) => {
    const resolved = resolveMessage(template.text, propertyName, accessCode, guestUrl, checkIn, checkOut);
    setShareMessage(resolved);
  };

  const resolvedMessage = resolveMessage(shareMessage, propertyName, accessCode, guestUrl, checkIn, checkOut);

  return (
    <div
      className={cn(
        "space-y-3 w-1/2",
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
          onClick={() => onCopy(resolvedMessage)}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          Copiar
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-[#25D366] hover:bg-[#20BD5A]"
          onClick={() => onWhatsApp(resolvedMessage)}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onEmail(resolvedMessage)}
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
      </div>
    </div>
  );
}

