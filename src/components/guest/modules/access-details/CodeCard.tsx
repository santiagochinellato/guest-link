"use client";

import { useState } from "react";
import { Copy, Check, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CodeCardProps {
  type: "access" | "alarm";
  code: string;
}

export function CodeCard({ type, code }: CodeCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(
      `${type === "access" ? "Código de acceso" : "Código de alarma"} copiado`,
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const isAccess = type === "access";
  const Icon = isAccess ? KeyRound : ShieldCheck;
  const label = isAccess ? "Puerta" : "Alarma";
  const iconColor = isAccess ? "text-brand-copper" : "text-red-500";

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-2 group relative overflow-hidden">
      <div className="p-2 bg-white dark:bg-black rounded-full shadow-sm mb-1">
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
      </div>
      <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-xl font-mono font-bold tracking-widest text-zinc-900 dark:text-white">
          {code}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute inset-x-0 bottom-0 h-full w-full opacity-0 group-hover:opacity-100 bg-white/50 backdrop-blur-sm transition-opacity flex items-center justify-center gap-2 text-brand-void font-medium"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}
