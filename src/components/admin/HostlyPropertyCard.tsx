"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Edit3,
  Link as LinkIcon,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PropertyGuestUsage } from "@/types/analytics";
import { GuideSectionsGrid } from "@/components/admin/GuideSectionsGrid";
import { GuestUsageInline } from "@/components/admin/GuestUsageInline";

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
  const guestUrl = `/${lang}/stay/${propertyId}`;
  const fullGuestUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${guestUrl}`
      : guestUrl;

  const completed = sections.filter((s) => s.complete).length;
  const total = sections.length || 1;
  const completionPercent = Math.round((completed / total) * 100);

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
        {/* Secciones de la guía — siempre visible */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Secciones de la guía
            </p>
            <span className="text-[11px] text-gray-500">{completionPercent}% completo</span>
          </div>
          <GuideSectionsGrid sections={sections} lang={lang} />
        </section>

        {/* Uso de la app del huésped — siempre visible */}
        <section className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Uso de la app del huésped
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <BarChart3 className="w-3.5 h-3.5 text-brand-copper" />
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {totalViews}
                </span>{" "}
                vistas
              </span>
            </div>
          </div>
          <GuestUsageInline usage={usage} />
        </section>

        {/* Acciones principales */}
        <section className="flex flex-col sm:flex-row gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          <Button
            asChild
            size="sm"
            className="flex-1 bg-brand-copper hover:bg-brand-copper/90 text-white px-4 py-2"
          >
            <Link href={`/${lang}/dashboard/properties/${propertyId}/edit`}>
              <Edit3 className="w-4 h-4 mr-2" />
              Editar propiedad
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 px-4 py-2"
            onClick={handleCopyGuestLink}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {copied ? "Link copiado" : "Copiar link huésped"}
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 px-4 py-2"
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
