"use client";

import { Copy, Check, Key, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TokenSectionProps {
  guestUrl: string;
  accessCode: string;
  expiresAt: Date | null;
  copied: boolean;
  isGenerating: boolean;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
}

export function TokenSection({
  guestUrl,
  accessCode,
  expiresAt,
  copied,
  isGenerating,
  onCopy,
  onRegenerate,
}: TokenSectionProps) {
  return (
    <div
      className={cn(
        "space-y-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex gap-4",
        "bg-gray-50/50 dark:bg-gray-900/30",
        "animate-in fade-in slide-in-from-top-2 duration-300"
      )}
    >
      <div className="space-y-2 w-1/2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-copper" />
          Link de la guía
        </Label>
        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border text-sm font-mono break-all">
          {guestUrl}
        </div>
        {expiresAt && (
          <p className="text-xs text-muted-foreground">
            Válido hasta: {expiresAt.toLocaleDateString("es-ES", { dateStyle: "long" })}
          </p>
        )}
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onCopy(guestUrl)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button size="sm" asChild>
              <a href={guestUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver guía
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onRegenerate}
              disabled={isGenerating}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerar link
            </Button>
          </div>
          <div className="">
            <Label className="text-xs font-medium text-muted-foreground">Código de acceso</Label>
            <div className="inline-flex items-center gap-2 ml-2 px-4 py-1 rounded-lg bg-white dark:bg-gray-900 border font-mono text-lg font-semibold tracking-widest">
              {accessCode}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onCopy(accessCode)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

