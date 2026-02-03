"use client";

import { Footprints } from "lucide-react";

interface AccessStepsProps {
  steps: { text: string }[];
}

export function AccessSteps({ steps }: AccessStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Footprints className="w-4 h-4 text-brand-copper" strokeWidth={1.5} />
        <h4 className="font-bold text-zinc-900 dark:text-zinc-200">
          Pasos de llegada
        </h4>
      </div>
      <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-2 space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="pl-6 relative">
            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-black border-2 border-brand-copper rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-brand-copper rounded-full" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
