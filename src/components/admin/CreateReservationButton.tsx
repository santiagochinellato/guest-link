"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReservation } from "@/lib/actions/reservations";
import { toast } from "sonner";

interface CreateReservationButtonProps {
  propertyId: number;
  propertyName: string;
  lang: string;
}

export function CreateReservationButton({
  propertyId,
  propertyName,
  lang,
}: CreateReservationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    reservationCode: "",
    checkIn: "",
    checkOut: "",
    status: "confirmed",
    totalPrice: "",
    currency: "EUR",
    platform: "manual",
    listingName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName.trim() || !form.reservationCode.trim() || !form.checkIn.trim() || !form.checkOut.trim()) {
      toast.error("Completa nombre, código, check-in y check-out.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createReservation({
        propertyId,
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim() || null,
        guestPhone: form.guestPhone.trim() || null,
        reservationCode: form.reservationCode.trim(),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: form.status,
        totalPrice: form.totalPrice ? parseFloat(form.totalPrice) : null,
        currency: form.currency || null,
        platform: form.platform,
        listingName: form.listingName.trim() || null,
      });
      if (result.success) {
        toast.success("Reserva creada correctamente.");
        setOpen(false);
        setForm({
          guestName: "",
          guestEmail: "",
          guestPhone: "",
          reservationCode: "",
          checkIn: "",
          checkOut: "",
          status: "confirmed",
          totalPrice: "",
          currency: "EUR",
          platform: "manual",
          listingName: "",
        });
        router.refresh();
      } else {
        toast.error(result.error || "Error al crear la reserva.");
      }
    } catch {
      toast.error("Error inesperado al crear la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button type="button" variant="default" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        Nueva reserva
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva reserva · {propertyName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guestName">Nombre del huésped *</Label>
              <Input
                id="guestName"
                value={form.guestName}
                onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                placeholder="Ej. Juan Pérez"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                type="email"
                value={form.guestEmail}
                onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
                placeholder="huésped@email.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="guestPhone">Teléfono</Label>
              <Input
                id="guestPhone"
                value={form.guestPhone}
                onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))}
                placeholder="+34 600 000 000"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="reservationCode">Código de reserva *</Label>
              <Input
                id="reservationCode"
                value={form.reservationCode}
                onChange={(e) => setForm((f) => ({ ...f, reservationCode: e.target.value }))}
                placeholder="Ej. BK123456"
                className="mt-1.5"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkIn">Check-in *</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out *</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
              >
                <SelectTrigger id="platform" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger id="status" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="totalPrice">Precio total</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.totalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, totalPrice: e.target.value }))}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                >
                  <SelectTrigger id="currency" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="listingName">Nombre del listado</Label>
              <Input
                id="listingName"
                value={form.listingName}
                onChange={(e) => setForm((f) => ({ ...f, listingName: e.target.value }))}
                placeholder="Opcional"
                className="mt-1.5"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando…" : "Crear reserva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
