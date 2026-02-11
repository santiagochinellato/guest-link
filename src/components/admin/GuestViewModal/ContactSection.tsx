"use client";

import { Mail, Phone, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GUEST_LANGUAGES } from "@/db/schema";
import { LANGUAGE_LABELS } from "./helpers";

interface ContactSectionProps {
  guestLanguage: (typeof GUEST_LANGUAGES)[number];
  setGuestLanguage: (v: (typeof GUEST_LANGUAGES)[number]) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  isSaving: boolean;
  onBlur: () => void;
  onLanguageChange: (lang: (typeof GUEST_LANGUAGES)[number]) => void;
}

export function ContactSection({
  guestLanguage,
  setGuestLanguage,
  email,
  setEmail,
  phone,
  setPhone,
  isSaving,
  onBlur,
  onLanguageChange,
}: ContactSectionProps) {
  return (
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
            onLanguageChange(newLang);
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
          onBlur={onBlur}
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
          onBlur={onBlur}
          className="transition-all"
        />
        {isSaving && (
          <p className="text-xs text-muted-foreground">Guardando...</p>
        )}
      </div>
    </div>
  );
}

