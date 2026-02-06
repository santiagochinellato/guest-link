"use client";

import { useState } from "react";
import { Copy, Check, Key, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateGuestToken } from "@/lib/actions/guest-tokens";
import { toast } from "sonner";

interface GenerateTokenDialogProps {
  reservationId: number;
  guestName: string;
}

export function GenerateTokenDialog({
  reservationId,
  guestName,
}: GenerateTokenDialogProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateGuestToken(reservationId);
    setIsGenerating(false);

    if (result.success && result.token) {
      setToken(result.token);
      setExpiresAt(result.expiresAt || null);
      toast.success("Token generado exitosamente");
    } else {
      toast.error(result.error || "Error al generar token");
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    const url = `${window.location.origin}/es/stay/token/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenUrl = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/es/stay/token/${token}` : '';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Key className="w-4 h-4" />
          Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Token de acceso para {guestName}</DialogTitle>
          <DialogDescription>
            Genera un token único para que el huésped acceda a la guía de forma privada.
            El token expirará automáticamente después del check-out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!token ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generando..." : "Generar token"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Link de acceso:
                </p>
                <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                  {tokenUrl}
                </p>
              </div>

              {expiresAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expira: {expiresAt.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar link
                    </>
                  )}
                </Button>
                {tokenUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(tokenUrl, "_blank")}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
