"use client";

import { Edit, Link as LinkIcon, QrCode, ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PropertyCardProps {
  property: {
    id: number;
    name: string;
    slug: string;
    address: string | null;
    status: string | null;
    coverImageUrl?: string | null;
  };
  lang: string;
}

export function PropertyCard({ property, lang }: PropertyCardProps) {
  const [copied, setCopied] = useState(false);
  const stayUrl = `/${lang}/stay/${property.slug}`;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${stayUrl}` : stayUrl;

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
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {property.coverImageUrl ? (
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

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/${lang}/dashboard/properties/${property.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
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
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/${lang}/dashboard/properties/${property.id}/edit?tab=flyer`}>
              <QrCode className="w-4 h-4 mr-2" />
              QR
            </Link>
          </Button>
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
        </div>
      </CardContent>
    </Card>
  );
}
