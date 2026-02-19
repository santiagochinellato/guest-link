"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Edit3,
  Link as LinkIcon,
  BarChart3,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PropertyGuestUsage } from "@/types/analytics";

export interface HostlySectionStatus {
  key: string;
  label: string;
  complete: boolean;
  href: string;
}

interface HostlyPropertyCardProps {
  propertyId: number;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  coverImageUrl?: string | null;
  status?: string | null;
  lang: string;
  sections: HostlySectionStatus[];
  totalViews?: number;
  usage: PropertyGuestUsage | null;
}

export function HostlyPropertyCard({
  propertyId,
  name,
  address,
  city,
  country,
  coverImageUrl,
  status,
  lang,
  sections,
  totalViews = 0,
  usage,
}: HostlyPropertyCardProps) {
  const [copied, setCopied] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const guestUrl = `/${lang}/stay/${propertyId}`;
  const fullGuestUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${guestUrl}`
      : guestUrl;

  const completed = sections.filter((s) => s.complete).length;
  const total = sections.length || 1;
  const completionPercent = Math.round((completed / total) * 100);

  const peakHour = usage?.peakUsageHour ?? null;
  const peakHourLabel =
    peakHour !== null
      ? `${String(peakHour).padStart(2, "0")}:00`
      : "Sin datos todavía";

  const topSections = (usage?.topSections ?? []).slice(0, 3);
  const topRecommendations = (usage?.topRecommendations ?? []).slice(0, 3);

  async function handleCopyGuestLink() {
    try {
      await navigator.clipboard.writeText(fullGuestUrl);
      setCopied(true);
      toast.success("Link del huésped copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }

  return (
    <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="relative h-52 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-1">
            <span className="text-xs uppercase tracking-wide">
              Sin imagen de portada
            </span>
          </div>
        )}

        {status && (
          <Badge className="absolute top-4 left-4 bg-emerald-500/90 hover:bg-emerald-600 text-[11px]">
            {status === "active" ? "Activa" : status}
          </Badge>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-white/70 uppercase tracking-wide">
                Completitud de la guía
              </span>
              <span className="text-sm font-semibold text-white">
                {completed}/{total} secciones listas
              </span>
            </div>
          </div>
          <div className="hidden sm:block w-32 h-2 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full bg-brand-copper"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            />
          </div>
        </motion.div>
      </div>

      <CardHeader className="pb-3">
        <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
          {name}
        </h1>
        {address && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {address}
            {(city || country) && (
              <>
                {" "}
                · {city}
                {country ? `, ${country}` : ""}
              </>
            )}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Secciones / checklist (plegable) */}
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setShowSections((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-left"
          >
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Secciones de la guía
              </p>
              <span className="text-[11px] text-gray-500">
                {completionPercent}% completo
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showSections ? "rotate-180" : ""
              }`}
            />
          </button>
          {showSections && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map((section) => (
                <Link
                  key={section.key}
                  href={section.href}
                  className="group flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2 hover:border-brand-copper/60 hover:bg-brand-copper/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {section.complete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {section.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 group-hover:text-brand-copper font-medium">
                    {section.complete ? "Listo" : "Completar"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Estadísticas de uso huésped (plegable) */}
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowUsage((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-left"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Uso de la app del huésped
            </p>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showUsage ? "rotate-180" : ""
              }`}
            />
          </button>

          {showUsage && (
            <>
              {(usage?.topSections?.length ?? 0) === 0 &&
              (usage?.topRecommendations?.length ?? 0) === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-3 py-2.5">
                  Aún no hay suficientes datos de uso. Cuando tus huéspedes usen
                  la guía, verás aquí las secciones más consultadas y las
                  recomendaciones destacadas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Secciones más consultadas */}
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                      Secciones más consultadas
                    </p>
                    <div className="space-y-1.5">
                      {topSections.map((s) => (
                        <div
                          key={s.sectionKey}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span className="text-gray-700 dark:text-gray-200">
                            {s.label}
                          </span>
                          <span className="text-gray-500">
                            {s.percentage}% ({s.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horario promedio */}
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2.5 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                        Horario promedio de consulta
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {peakHourLabel}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Basado en las últimas visitas a la guía.
                    </p>
                  </div>

                  {/* Recomendaciones TOP */}
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                      Recomendaciones más seleccionadas
                    </p>
                    {topRecommendations.length === 0 ? (
                      <p className="text-[11px] text-gray-500">
                        Aún no hay clics en recomendaciones.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {topRecommendations.map((r) => (
                          <div
                            key={`${r.id ?? r.name}`}
                            className="flex items-center justify-between gap-2 text-[11px]"
                          >
                            <span className="truncate text-gray-700 dark:text-gray-200">
                              {r.name}
                            </span>
                            <span className="text-gray-500 whitespace-nowrap">
                              {r.clicks} clics
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen general de vistas / reservas (por ahora solo vistas) */}
              <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                <BarChart3 className="w-3.5 h-3.5 text-brand-copper" />
                <span>
                  Esta propiedad suma{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {totalViews}
                  </span>{" "}
                  vistas en total.
                </span>
              </div>
            </>
          )}
        </section>

        {/* Acciones principales */}
        <section className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 mt-2 pt-3">
          <Button
            asChild
            size="sm"
            className="flex-1 bg-brand-copper hover:bg-brand-copper/90 text-white"
          >
            <Link href={`/${lang}/dashboard/properties/${propertyId}/edit`}>
              <Edit3 className="w-4 h-4 mr-2" />
              Editar propiedad
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopyGuestLink}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {copied ? "Link copiado" : "Copiar link huésped"}
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link
              href={`/${lang}/dashboard/reservations/properties/${propertyId}`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Ver reservas
            </Link>
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}

