"use client";

import { Eye, Clock, Smartphone, Edit, BarChart3, Link as LinkIcon, QrCode, ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PropertyAnalytics } from "@/types/analytics";
import Image from "next/image";

interface Property {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  status: string | null;
  coverImageUrl?: string | null;
  wifiSsid?: string | null;
}

interface PropertyCardWithMetricsProps {
  property: Property;
  analytics: PropertyAnalytics | null;
  isLoading?: boolean;
  lang: string;
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PropertyCardWithMetrics({
  property,
  analytics,
  isLoading,
  lang,
}: PropertyCardWithMetricsProps) {
  const [copied, setCopied] = useState(false);
  const stayUrl = `/${lang}/stay/${property.slug}`;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${stayUrl}` : stayUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar link");
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
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
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
        {/* Status Badge */}
        {property.status === "active" && (
          <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
            ACTIVE
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="font-bold text-lg text-brand-void dark:text-white truncate">
          {property.name}
        </h3>
        {property.address && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {property.address}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Eye className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Vistas</p>
              <p className="text-lg font-bold text-brand-void dark:text-white">
                {analytics.totalViews ?? 0}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-4 h-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tiempo</p>
              <p className="text-lg font-bold text-brand-void dark:text-white">
                {(analytics.avgTimeOnPage ?? 0) > 0 ? formatTime(analytics.avgTimeOnPage ?? 0) : "—"}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Smartphone className="w-4 h-4 mx-auto mb-1 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Mobile</p>
              <p className="text-lg font-bold text-brand-void dark:text-white">
                {analytics.mobilePercent ?? 0}%
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            Sin datos de analytics
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link href={`/${lang}/dashboard/properties/${property.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link href={`/${lang}/dashboard/properties/${property.id}/analytics`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Copiar link
              </>
            )}
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link href={`/${lang}/dashboard/properties/${property.id}/edit?tab=flyer`}>
              <QrCode className="w-4 h-4 mr-2" />
              QR
            </Link>
          </Button>
        </div>

        {/* Guest View Link */}
        <Button
          asChild
          variant="default"
          size="sm"
          className="w-full bg-brand-copper hover:bg-brand-copper/90"
        >
          <Link href={stayUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Vista huésped
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
