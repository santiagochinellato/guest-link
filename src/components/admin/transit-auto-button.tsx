"use client";

import { useTransition } from "react";
import { Bus, Sparkles, Loader2 } from "lucide-react";
import { populateTransitSmart } from "@/lib/actions/populate-transit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TransitAutoButtonProps {
  propertyId: number;
  city?: string;
  className?: string;
  onComplete?: (data?: any[]) => void;
}

export function TransitAutoButton({
  propertyId,
  city,
  className,
  onComplete,
}: TransitAutoButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await populateTransitSmart(propertyId, city);
      if (result.success) {
        toast.success(
          result.message || `Se detectaron ${result.count} opciones`,
        );
        if (onComplete) {
          onComplete(result.data);
        }
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      type="button"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors border border-purple-200 dark:border-purple-800 disabled:opacity-50",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      <span>{isPending ? "Analizando Rutas..." : "Smart Transit"}</span>
    </button>
  );
}
