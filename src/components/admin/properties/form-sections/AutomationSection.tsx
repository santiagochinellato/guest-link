"use client";

import { useFormContext } from "react-hook-form";
import { PropertyFormData } from "@/lib/schemas";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Star } from "lucide-react";

export function AutomationSection() {
  const { watch, setValue } = useFormContext<PropertyFormData>();

  const autoSendGuide = watch("autoSendGuide") ?? true;
  const autoCheckoutReminder = watch("autoCheckoutReminder") ?? true;
  const autoReviewRequest = watch("autoReviewRequest") ?? true;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Automatizaciones
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Envía emails o WhatsApp automáticos a tus huéspedes según las fechas de reserva.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-void/10 dark:bg-brand-copper/10">
              <Mail className="w-5 h-5 text-brand-void dark:text-brand-copper" />
            </div>
            <div>
              <Label htmlFor="autoSendGuide" className="font-medium">
                Guía pre-llegada
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Envía la guía digital 1 día antes del check-in
              </p>
            </div>
          </div>
          <Switch
            id="autoSendGuide"
            checked={autoSendGuide}
            onCheckedChange={(v) => setValue("autoSendGuide", v, { shouldDirty: true })}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <Label htmlFor="autoCheckoutReminder" className="font-medium">
                Recordatorio check-out
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recuerda el check-out el mismo día
              </p>
            </div>
          </div>
          <Switch
            id="autoCheckoutReminder"
            checked={autoCheckoutReminder}
            onCheckedChange={(v) => setValue("autoCheckoutReminder", v, { shouldDirty: true })}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <Label htmlFor="autoReviewRequest" className="font-medium">
                Solicitud de reseña
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pide opinión el día del check-out
              </p>
            </div>
          </div>
          <Switch
            id="autoReviewRequest"
            checked={autoReviewRequest}
            onCheckedChange={(v) => setValue("autoReviewRequest", v, { shouldDirty: true })}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Requiere configurar Resend (email) y/o Twilio (WhatsApp) en las variables de entorno.
        Las reservas deben tener email o teléfono del huésped.
      </p>
    </div>
  );
}
