"use client";

import { useState } from "react";
import { GuestView } from "@/components/guest/guest-view";
import { getPropertyBySlug } from "@/lib/actions/properties";
import { use, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReservationState, TimeOfDay } from "@/hooks/useReservationState";
import { Loader2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GuestProperty } from "@/types/dtos";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default function GuestPreviewPage({ params }: PageProps) {
  // Consumir params (requerido en Next.js 15+)
  void use(params);
  const [propertySlug, setPropertySlug] = useState("san-martin-460");
  const [property, setProperty] = useState<GuestProperty | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  
  // Controles de preview
  const [reservationState, setReservationState] = useState<ReservationState>("DURING_STAY");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");
  const [guestName, setGuestName] = useState("Candela Rodríguez");
  const [daysUntilCheckIn, setDaysUntilCheckIn] = useState(0);
  const [checkInHour, setCheckInHour] = useState(15);
  const [stayDuration, setStayDuration] = useState(5);

  // Calcular fechas basadas en el estado seleccionado
  const getReservationDates = () => {
    const now = new Date();
    let checkIn: Date;
    let checkOut: Date;

    switch (reservationState) {
      case "BEFORE_CHECKIN":
        // Más de 12 horas antes (2 días antes)
        checkIn = new Date(now);
        checkIn.setDate(checkIn.getDate() + daysUntilCheckIn);
        checkIn.setHours(checkInHour, 0, 0, 0);
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + stayDuration);
        break;
      case "CHECKIN_DAY":
        // 12 horas antes o durante el día de check-in
        checkIn = new Date(now);
        checkIn.setDate(checkIn.getDate() + daysUntilCheckIn);
        checkIn.setHours(checkInHour, 0, 0, 0);
        // Si es el mismo día, ajustar para que esté dentro de las 12 horas
        if (daysUntilCheckIn === 0) {
          checkIn.setHours(now.getHours() + 6, 0, 0, 0); // 6 horas en el futuro
        }
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + stayDuration);
        break;
      case "DURING_STAY":
        // Durante la estadía (check-in ya pasó)
        checkIn = new Date(now);
        checkIn.setDate(checkIn.getDate() - 1); // Ayer
        checkIn.setHours(checkInHour, 0, 0, 0);
        checkOut = new Date(now);
        checkOut.setDate(checkOut.getDate() + stayDuration - 1);
        checkOut.setHours(11, 0, 0, 0);
        break;
      case "AFTER_CHECKOUT":
        // Después del check-out
        checkIn = new Date(now);
        checkIn.setDate(checkIn.getDate() - stayDuration - 1);
        checkIn.setHours(checkInHour, 0, 0, 0);
        checkOut = new Date(now);
        checkOut.setDate(checkOut.getDate() - 1);
        checkOut.setHours(11, 0, 0, 0);
        break;
      default:
        return undefined;
    }

    return {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
    };
  };

  const loadProperty = async () => {
    if (!propertySlug || propertySlug.trim() === "") {
      setError("Por favor ingresa un slug válido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("[GuestPreview] Cargando propiedad con slug:", propertySlug);
      const result = await getPropertyBySlug(propertySlug.trim());
      console.log("[GuestPreview] Resultado:", result);
      
      if (result.success && result.data) {
        console.log("[GuestPreview] Propiedad cargada exitosamente:", result.data);
        setProperty(result.data);
      } else {
        const errorMsg = result.error || "Propiedad no encontrada";
        console.error("[GuestPreview] Error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("[GuestPreview] Excepción al cargar:", err);
      setError(`Error al cargar la propiedad: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar automáticamente solo al montar el componente
  useEffect(() => {
    console.log("[GuestPreview] Componente montado, propertySlug:", propertySlug, "property:", property);
    if (propertySlug && !property && !loading) {
      console.log("[GuestPreview] Iniciando carga automática...");
      loadProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  const reservation = getReservationDates();

  // Simular hora del día modificando el hook (esto requeriría modificar useReservationState)
  // Por ahora, usaremos un enfoque diferente: crear un wrapper que sobrescriba la hora

  if (!property) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Guest View Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Cargando propiedad...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
                <div className="space-y-2">
                  <Label>Slug de la propiedad</Label>
                  <Input
                    value={propertySlug}
                    onChange={(e) => setPropertySlug(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadProperty();
                      }
                    }}
                    placeholder="san-martin-460"
                  />
                  <Button onClick={loadProperty} className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      "Intentar de Nuevo"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Slug de la propiedad</Label>
                  <Input
                    value={propertySlug}
                    onChange={(e) => setPropertySlug(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadProperty();
                      }
                    }}
                    placeholder="san-martin-460"
                  />
                </div>
                <Button onClick={loadProperty} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar Propiedad"
                  )}
                </Button>
                <p className="text-xs text-zinc-500 text-center">
                  Ingresa el slug de una propiedad existente (ej: san-martin-460)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black relative">
      {/* Botón Flotante para abrir controles */}
      <Dialog open={isControlsOpen} onOpenChange={setIsControlsOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-copper text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
            aria-label="Abrir controles de preview"
          >
            <Settings className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Preview Controls
            </DialogTitle>
            <DialogDescription>
              Ajusta los parámetros para ver diferentes variantes de la vista del huésped
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Estado de Reserva</Label>
            <Select
              value={reservationState}
              onValueChange={(value) => setReservationState(value as ReservationState)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEFORE_CHECKIN">Antes del Check-in (más de 12h)</SelectItem>
                <SelectItem value="CHECKIN_DAY">Día del Check-in (12h antes)</SelectItem>
                <SelectItem value="DURING_STAY">Durante la Estadía</SelectItem>
                <SelectItem value="AFTER_CHECKOUT">Después del Check-out</SelectItem>
                <SelectItem value="NO_RESERVATION">Sin Reserva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hora del Día</Label>
            <Select
              value={timeOfDay}
              onValueChange={(value) => setTimeOfDay(value as TimeOfDay)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Mañana (5:00 - 12:00)</SelectItem>
                <SelectItem value="afternoon">Tarde (12:00 - 19:00)</SelectItem>
                <SelectItem value="evening">Noche (19:00 - 00:00)</SelectItem>
                <SelectItem value="night">Madrugada (00:00 - 5:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Huésped</Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Candela Rodríguez"
            />
          </div>

          {reservationState !== "NO_RESERVATION" && (
            <>
              <div className="space-y-2">
                <Label>Días hasta Check-in</Label>
                <Input
                  type="number"
                  value={daysUntilCheckIn}
                  onChange={(e) => setDaysUntilCheckIn(parseInt(e.target.value) || 0)}
                  min="-7"
                  max="30"
                />
              </div>

              <div className="space-y-2">
                <Label>Hora de Check-in</Label>
                <Input
                  type="number"
                  value={checkInHour}
                  onChange={(e) => setCheckInHour(parseInt(e.target.value) || 15)}
                  min="0"
                  max="23"
                />
              </div>

              <div className="space-y-2">
                <Label>Duración de Estadía (días)</Label>
                <Input
                  type="number"
                  value={stayDuration}
                  onChange={(e) => setStayDuration(parseInt(e.target.value) || 5)}
                  min="1"
                  max="30"
                />
              </div>

              {reservation && (
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
                  <p><strong>Check-in:</strong> {reservation.checkIn}</p>
                  <p><strong>Check-out:</strong> {reservation.checkOut}</p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>Slug de Propiedad</Label>
            <Input
              value={propertySlug}
              onChange={(e) => setPropertySlug(e.target.value)}
              placeholder="san-martin-460"
            />
            <Button 
              onClick={loadProperty} 
              size="sm" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Recargar Propiedad"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      {/* Guest View con parámetros simulados */}
      <GuestView
        property={property}
        dict={{}}
        reservation={reservation}
        guestName={guestName}
        timeOfDayOverride={timeOfDay}
        stateOverride={reservationState}
      />
    </div>
  );
}

