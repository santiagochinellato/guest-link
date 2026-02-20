"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateReservationContact } from "@/lib/actions/reservations";
import { GUEST_LANGUAGES } from "@/db/schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { parseGuestInfo } from "@/lib/utils/guest-info";

const LANGUAGE_LABELS: Record<(typeof GUEST_LANGUAGES)[number], string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

const FormSchema = z.object({
  guestEmail: z
    .string()
    .optional()
    .refine((s) => !s || s === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), "Email inválido"),
  guestPhone: z.string().optional(),
  guestLanguage: z.enum(GUEST_LANGUAGES),
});

type FormData = z.infer<typeof FormSchema>;

interface EditReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: {
    id: number;
    guestName: string;
    guestEmail?: string | null;
    guestPhone?: string | null;
    guestLanguage?: string | null;
  };
  onSuccess?: () => void;
}

export function EditReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: EditReservationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    values: {
      guestEmail: reservation.guestEmail || "",
      guestPhone: reservation.guestPhone || "",
      guestLanguage: (reservation.guestLanguage && GUEST_LANGUAGES.includes(reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number]))
        ? (reservation.guestLanguage as (typeof GUEST_LANGUAGES)[number])
        : "es",
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateReservationContact(reservation.id, {
        guestEmail: data.guestEmail || undefined,
        guestPhone: data.guestPhone || undefined,
        guestLanguage: data.guestLanguage,
      });
      if (result.success) {
        toast.success("Contacto actualizado");
        handleOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Error al guardar");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar contacto</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(() => {
              const { name, guestCountText } = parseGuestInfo(reservation.guestName);
              return (
                <>
                  {name}
                  {guestCountText && (
                    <span className="text-gray-400"> · {guestCountText}</span>
                  )}{" "}
                  · #{reservation.id}
                </>
              );
            })()}
          </p>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email del huésped</Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="huésped@ejemplo.com"
              {...form.register("guestEmail")}
              className={form.formState.errors.guestEmail ? "border-red-500" : ""}
            />
            {form.formState.errors.guestEmail && (
              <p className="text-xs text-red-500">{form.formState.errors.guestEmail.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestPhone">Teléfono del huésped</Label>
            <Input
              id="guestPhone"
              type="tel"
              placeholder="+34 600 000 000"
              {...form.register("guestPhone")}
            />
          </div>
          <div className="space-y-2">
            <Label>Idioma del huésped</Label>
            <Select
              value={form.watch("guestLanguage")}
              onValueChange={(v) => form.setValue("guestLanguage", v as FormData["guestLanguage"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona idioma" />
              </SelectTrigger>
              <SelectContent>
                {GUEST_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {LANGUAGE_LABELS[lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Define el idioma de los mensajes (WhatsApp/email) y de la pantalla de la guía.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
