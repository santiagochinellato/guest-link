"use client";

import { Mail, Phone, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GUEST_LANGUAGES } from "@/db/schema";
import { cn } from "@/lib/utils";
import { LANGUAGE_LABELS } from "./types";

interface ContactCardProps {
  guestName: string;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  guestLanguage: (typeof GUEST_LANGUAGES)[number];
  isSaving: boolean;
  onBlur: () => void;
  onLanguageChange: (lang: (typeof GUEST_LANGUAGES)[number]) => void;
}

export function ContactCard({
  guestName,
  email,
  setEmail,
  phone,
  setPhone,
  guestLanguage,
  isSaving,
  onBlur,
  onLanguageChange,
}: ContactCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 flex flex-col",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-white/50 dark:border-slate-800",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {guestName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">Contacto</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Información del huésped
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Email</p>
            <input
              type="email"
              placeholder="huésped@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={onBlur}
              className="w-full h-8 text-sm font-medium bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Teléfono</p>
            <input
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={onBlur}
              className="w-full h-8 text-sm font-medium bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
            <Languages className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Idioma del huésped</p>
            <Select
              value={guestLanguage}
              onValueChange={(v) => onLanguageChange(v as (typeof GUEST_LANGUAGES)[number])}
            >
              <SelectTrigger className="h-8 border-slate-200 dark:border-slate-600 bg-transparent">
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
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Mensajes y pantalla de la guía
            </p>
          </div>
        </div>
      </div>
      {isSaving && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Guardando...</p>
      )}
    </div>
  );
}

