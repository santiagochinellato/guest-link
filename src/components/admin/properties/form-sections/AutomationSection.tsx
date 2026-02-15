"use client";

import { Sparkles } from "lucide-react";

export function AutomationSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Automatizaciones
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Envía emails o WhatsApp automáticos a tus huéspedes según las fechas de reserva.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 text-center shadow-sm">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-copper/10 dark:bg-brand-copper/20 items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-brand-copper dark:text-brand-lightCopper" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-copper dark:text-brand-lightCopper mb-2">
          Próximamente
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Estamos preparando la integración para enviar guías, recordatorios y solicitudes de reseña
          por email y WhatsApp de forma automática.
        </p>
      </div>
    </div>
  );
}
