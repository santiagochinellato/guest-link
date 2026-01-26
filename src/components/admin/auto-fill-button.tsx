"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { populateRecommendations } from "@/lib/actions/auto-populate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AutoFillButtonProps {
  propertyId: number;
  categoryId?: string;
  className?: string;
  onComplete?: () => void;
}

export function AutoFillButton({
  propertyId,
  categoryId,
  className,
  onComplete,
}: AutoFillButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAutoFill = () => {
    console.log("🚀 AutoFillButton clicked!", { propertyId, categoryId });
    startTransition(async () => {
      try {
        console.log("📞 Calling populateRecommendations...");
        const res = await populateRecommendations(propertyId, categoryId);
        console.log("📥 Response:", res);

        if (res.success) {
          toast.success(
            `Success! Added ${res.count || 0} new recommendations.`,
          );

          // Reload page to show new recommendations
          if (res.count && res.count > 0) {
            setTimeout(() => {
              // Preserve current URL (including tab parameter)
              window.location.href = window.location.href;
            }, 1000); // Wait 1 second for toast to show
          }

          if (onComplete) onComplete();
        } else {
          toast.error(res.error || "Failed to auto-populate recommendations.");
        }
      } catch (error) {
        console.error("💥 AutoFill error:", error);
        toast.error("Unexpected error occurred");
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
