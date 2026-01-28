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
        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800 disabled:opacity-50",
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
