"use client";

import {
  Eye,
  Clock,
  Smartphone,
  Edit,
  BarChart3,
  Link as LinkIcon,
  QrCode,
  ExternalLink,
  Check,
  MoreVertical,
  CalendarDays,
  Wifi,
  MapPin,
  BookOpen,
  Image as ImageIcon,
  Clock3,
  Pencil,
  Power,
  PowerOff,
  EyeOff,
  CalendarX,
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePropertyQuick, updatePropertyStatus } from "@/lib/actions/properties";
import type { PropertyStatusMode } from "@/lib/actions/properties";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import type { PropertyAnalytics } from "@/types/analytics";
import type { ReservationsOverviewByPropertyItem } from "@/lib/actions/reservations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Property {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  status: string | null;
  coverImageUrl?: string | null;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  houseRules?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

interface PropertyCardWithMetricsProps {
  property: Property;
  analytics: PropertyAnalytics | null;
  reservationOverview?: ReservationsOverviewByPropertyItem | null;
  isLoading?: boolean;
  lang: string;
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, "d MMM", { locale: es }) : dateStr;
  } catch {
    return dateStr ?? "—";
  }
}

function CompletenessIndicator({ property }: { property: Property }) {
  const checks = [
    { key: "imagen", label: "Imagen", ok: !!property.coverImageUrl, icon: ImageIcon },
    { key: "wifi", label: "WiFi", ok: !!property.wifiSsid, icon: Wifi },
    { key: "direccion", label: "Dirección", ok: !!property.address, icon: MapPin },
    { key: "reglas", label: "Reglas", ok: !!property.houseRules, icon: BookOpen },
  ] as const;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {checks.map(({ key, label, ok, icon: Icon }) => (
        <span
          key={key}
          title={`${label}: ${ok ? "Configurado" : "Sin configurar"}`}
          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
            ok
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}
        >
          <Icon className="w-3 h-3" />
          {label}
        </span>
      ))}
    </div>
  );
}

function ReservationSnippet({
  overview,
  propertyId,
  lang,
}: {
  overview: ReservationsOverviewByPropertyItem;
  propertyId: number;
  lang: string;
}) {
  const current = overview.currentReservation;
  const next = overview.nextReservation;

  if (!current && !next) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-sm text-gray-500 dark:text-gray-400 min-h-[55px]">
        <span className="text-xs">Sin reservas próximas</span>
        <Link
          href={`/${lang}/dashboard/reservations/properties/${propertyId}`}
          className="text-xs text-brand-copper hover:underline font-medium"
        >
          Ver todas
        </Link>
      </div>
    );
  }

  const res = current ?? next!;
  const { name } = parseGuestInfo(res.guestName);
  const isActive = !!current;

  return (
    <Link
      href={`/${lang}/dashboard/reservations/properties/${propertyId}`}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
    >
      <span
        className={`shrink-0 w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-400"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
            {isActive ? "Ocupada" : "Próxima"}
          </span>
          {res.platform.toLowerCase() === "booking" ? (
            <Image src="/Booking.svg" alt="Booking" width={14} height={14} className="shrink-0" />
          ) : res.platform.toLowerCase() === "airbnb" ? (
            <Image src="/airbnb.svg" alt="Airbnb" width={14} height={14} className="shrink-0" />
          ) : null}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {name} · {formatDateShort(res.checkIn)}–{formatDateShort(res.checkOut)}
        </p>
      </div>
      <CalendarDays className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-copper shrink-0 transition-colors" />
    </Link>
  );
}

function QuickEditPopover({
  property,
  onSaved,
}: {
  property: Property;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    wifiSsid: property.wifiSsid ?? "",
    wifiPassword: property.wifiPassword ?? "",
    checkInTime: property.checkInTime ?? "",
    checkOutTime: property.checkOutTime ?? "",
  });

  async function handleSave() {
    setSaving(true);
    const result = await updatePropertyQuick(property.id, {
      wifiSsid: form.wifiSsid,
      wifiPassword: form.wifiPassword,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Cambios guardados");
      setOpen(false);
      onSaved();
    } else {
      toast.error(result.error ?? "Error al guardar");
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <Pencil className="w-3.5 h-3.5" />
          Edición rápida
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 space-y-3" align="start">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Edición rápida</p>
        <div className="space-y-2">
          <Label className="text-xs">WiFi · Nombre de red</Label>
          <Input
            value={form.wifiSsid}
            onChange={(e) => setForm((f) => ({ ...f, wifiSsid: e.target.value }))}
            placeholder="Mi Red WiFi"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">WiFi · Contraseña</Label>
          <Input
            value={form.wifiPassword}
            onChange={(e) => setForm((f) => ({ ...f, wifiPassword: e.target.value }))}
            placeholder="contraseña"
            className="h-8 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              Check-in
            </Label>
            <Input
              value={form.checkInTime}
              onChange={(e) => setForm((f) => ({ ...f, checkInTime: e.target.value }))}
              placeholder="15:00"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              Check-out
            </Label>
            <Input
              value={form.checkOutTime}
              onChange={(e) => setForm((f) => ({ ...f, checkOutTime: e.target.value }))}
              placeholder="11:00"
              className="h-8 text-sm"
            />
          </div>
        </div>
        {/* <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button> */}
      </PopoverContent>
    </Popover>
  );
}

type DeactivateMode = Extract<
  PropertyStatusMode,
  "deactivate_all" | "deactivate_guest" | "deactivate_reservations"
>;

const DEACTIVATE_OPTIONS: {
  mode: DeactivateMode;
  icon: React.ElementType;
  title: string;
  description: string;
  border: string;
  selectedBg: string;
  iconColor: string;
}[] = [
  {
    mode: "deactivate_all",
    icon: PowerOff,
    title: "Desactivar todo",
    description:
      "La propiedad dejará de mostrarse en la guía del huésped y en el gestor de reservas. No se enviarán automatizaciones.",
    border: "border-red-200 dark:border-red-800",
    selectedBg: "bg-red-50 dark:bg-red-900/20 ring-2 ring-red-300 dark:ring-red-700",
    iconColor: "text-red-500",
  },
  {
    mode: "deactivate_guest",
    icon: EyeOff,
    title: "Desactivar guía del huésped",
    description:
      "Los huéspedes no podrán acceder a la guía digital. El gestor de reservas y las automatizaciones continúan funcionando.",
    border: "border-amber-200 dark:border-amber-800",
    selectedBg: "bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300 dark:ring-amber-700",
    iconColor: "text-amber-500",
  },
  {
    mode: "deactivate_reservations",
    icon: CalendarX,
    title: "Desactivar gestor de reservas",
    description:
      "Se detienen las sincronizaciones y el envío de mensajes automáticos. La guía del huésped permanece activa.",
    border: "border-blue-200 dark:border-blue-800",
    selectedBg: "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-700",
    iconColor: "text-blue-500",
  },
];

function PropertyStatusModal({
  open,
  onClose,
  propertyId,
  propertyName,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertyName: string;
  isActive: boolean;
}) {
  const [selected, setSelected] = useState<DeactivateMode | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirmDeactivate() {
    if (!selected) return;
    setSaving(true);
    const result = await updatePropertyStatus(propertyId, selected);
    setSaving(false);
    if (result.success) {
      toast.success("Estado de la propiedad actualizado");
      onClose();
    } else {
      toast.error(result.error ?? "Error al actualizar");
    }
  }

  async function handleActivate() {
    setSaving(true);
    const result = await updatePropertyStatus(propertyId, "activate");
    setSaving(false);
    if (result.success) {
      toast.success(`"${propertyName}" activada`);
      onClose();
    } else {
      toast.error(result.error ?? "Error al activar");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelected(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isActive ? (
              <PowerOff className="w-4 h-4 text-red-500" />
            ) : (
              <Power className="w-4 h-4 text-emerald-500" />
            )}
            {isActive ? "Desactivar propiedad" : "Activar propiedad"}
          </DialogTitle>
          <DialogDescription>
            {isActive
              ? `Elegí cómo desactivar "${propertyName}". Podés revertir el cambio en cualquier momento.`
              : `Activar "${propertyName}" restaurará el acceso completo: guía del huésped, gestor de reservas y automatizaciones.`}
          </DialogDescription>
        </DialogHeader>

        {isActive ? (
          <div className="space-y-2.5 mt-1">
            {DEACTIVATE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setSelected(opt.mode)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${opt.border} ${
                    isSelected ? opt.selectedBg : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white dark:bg-gray-900/60 shadow-sm" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                        {opt.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                    <div
                      className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                        isSelected
                          ? "border-brand-copper bg-brand-copper"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                  </div>
                </button>
              );
            })}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => { setSelected(null); onClose(); }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                disabled={!selected || saving}
                onClick={handleConfirmDeactivate}
              >
                {saving ? "Guardando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={saving}
              onClick={handleActivate}
            >
              {saving ? "Activando..." : "Activar propiedad"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PropertyCardWithMetrics({
  property,
  analytics,
  reservationOverview,
  isLoading,
  lang,
}: PropertyCardWithMetricsProps) {
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const stayUrl = `/${lang}/stay/${property.slug}`;
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${stayUrl}` : stayUrl;

  const hasCurrentReservation = !!reservationOverview?.currentReservation;
  const hasNextReservation = !!reservationOverview?.nextReservation;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar link");
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
      {/* Cover image with chips */}
      <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : property.coverImageUrl ? (
          <Image
            src={property.coverImageUrl}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <ImageIcon className="w-8 h-8 opacity-30" />
            <span className="text-xs opacity-60">Sin imagen de portada</span>
          </div>
        )}

        {/* Status badge */}
        {property.status === "active" && (
          <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-2">
            Activa
          </Badge>
        )}
        {property.status === "draft" && (
          <Badge className="absolute top-3 left-3 bg-gray-500 hover:bg-gray-600 text-white text-[10px] px-2">
            Borrador
          </Badge>
        )}

        {/* Occupation chip */}
        {hasCurrentReservation && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Ocupada · hasta{" "}
            {formatDateShort(reservationOverview!.currentReservation!.checkOut)}
          </span>
        )}
        {!hasCurrentReservation && hasNextReservation && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-400/90 text-amber-900 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            Próxima · {formatDateShort(reservationOverview!.nextReservation!.checkIn)}
          </span>
        )}

        {/* Dropdown: secondary actions */}
        <div className="absolute bottom-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/properties/${property.id}/analytics`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copiar link huésped
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/properties/${property.id}/edit?tab=flyer`}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Ver QR
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={stayUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Vista huésped
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-base text-brand-void dark:text-white truncate">
              {property.name}
            </h3>
            {property.address && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {property.address}
              </p>
            )}
          </div>
        </div>

        {/* Completeness indicators */}
        <div className="mt-2">
          <CompletenessIndicator property={property} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Reservation snippet */}
        {reservationOverview && (
          <ReservationSnippet
            overview={reservationOverview}
            propertyId={property.id}
            lang={lang}
          />
        )}

        {/* Analytics metrics */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Eye className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600 dark:text-blue-400" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Vistas</p>
              <p className="text-base font-bold text-brand-void dark:text-white">
                {analytics.totalViews ?? 0}
              </p>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 text-purple-600 dark:text-purple-400" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Tiempo</p>
              <p className="text-base font-bold text-brand-void dark:text-white">
                {(analytics.avgTimeOnPage ?? 0) > 0
                  ? formatTime(analytics.avgTimeOnPage ?? 0)
                  : "—"}
              </p>
            </div>
            <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Smartphone className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Mobile</p>
              <p className="text-base font-bold text-brand-void dark:text-white">
                {(analytics.mobilePercent ?? 0) > 0 ? `${analytics.mobilePercent}%` : "—"}
              </p>
            </div>
          </div>
        ) : null}

        {/* Primary actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/${lang}/dashboard/properties/${property.id}/edit`}>
              <Edit className="w-4 h-4 mr-1.5" />
              Editar
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="flex-1 bg-brand-copper hover:bg-brand-copper/90">
            <Link href={`/${lang}/dashboard/reservations/properties/${property.id}`}>
              <CalendarDays className="w-4 h-4 mr-1.5" />
              Reservas
            </Link>
          </Button>
        </div>

        {/* Quick-edit + status toggle */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2">
          <QuickEditPopover
            key={refreshKey}
            property={property}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
              property.status === "active"
                ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
            }`}
          >
            {property.status === "active" ? (
              <PowerOff className="w-3.5 h-3.5" />
            ) : (
              <Power className="w-3.5 h-3.5" />
            )}
            {property.status === "active" ? "Desactivar" : "Activar"}
          </button>
        </div>

        <PropertyStatusModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          propertyId={property.id}
          propertyName={property.name}
          isActive={property.status === "active"}
        />
      </CardContent>
    </Card>
  );
}
