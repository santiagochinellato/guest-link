"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { populateRecommendations } from "@/lib/actions/auto-populate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AutoFillButtonProps {
  propertyId: number;
  className?: string;
  onComplete?: () => void;
}

export function AutoFillButton({
  propertyId,
  className,
  onComplete,
}: AutoFillButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAutoFill = () => {
    startTransition(async () => {
      const res = await populateRecommendations(propertyId);

      if (res.success) {
        toast.success(`Success! Added ${res.count || 0} new recommendations.`);
        if (onComplete) onComplete();
      } else {
        toast.error(res.error || "Failed to auto-populate recommendations.");
      }
    });
  };

  return (
    <button
      onClick={handleAutoFill}
      disabled={isPending}
      type="button"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-300 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors border border-purple-200 dark:border-purple-800",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      <span>{isPending ? "Discovering..." : "Auto-Discovery"}</span>
    </button>
  );
}
