"use client";

import { useMemo } from "react";
import { Check, Ban, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

interface RuleItem {
  value: string;
}

interface RulesModuleProps {
  allowed?: RuleItem[];
  prohibited?: RuleItem[];
  additionalRules?: string | any;
}

export function RulesModule({
  allowed = [],
  prohibited = [],
  additionalRules,
}: RulesModuleProps) {
  // Parse legacy/JSON data from additionalRules if present
  const { finalAllowed, finalProhibited, finalText } = useMemo(() => {
    let parsedAllowed = [...allowed];
    let parsedProhibited = [...prohibited];
    // If it's a string, assume it's the text content initially. If object, start empty.
    let parsedText = typeof additionalRules === "string" ? additionalRules : "";

    try {
      let parsed: any = null;

      if (typeof additionalRules === "object" && additionalRules !== null) {
        parsed = additionalRules;
      } else if (
        typeof additionalRules === "string" &&
        additionalRules.trim().startsWith("{")
      ) {
        parsed = JSON.parse(additionalRules);
      }

      if (parsed && typeof parsed === "object") {
        // Extract text
        if (typeof parsed.text === "string") {
          parsedText = parsed.text;
        }

        // Extract allowed
        if (Array.isArray(parsed.allowed)) {
          const newAllowed = parsed.allowed.map((val: any) => ({
            value: typeof val === "string" ? val : String(val),
          }));
          parsedAllowed = [...parsedAllowed, ...newAllowed];
        }

        // Extract prohibited
        if (Array.isArray(parsed.prohibited)) {
          const newProhibited = parsed.prohibited.map((val: any) => ({
            value: typeof val === "string" ? val : String(val),
          }));
          parsedProhibited = [...parsedProhibited, ...newProhibited];
        }
      }
    } catch (e) {
      // If parsing fails, treat as plain text if it was a string
      console.error("Failed to parse additionalRules JSON", e);
    }

    return {
      finalAllowed: parsedAllowed,
      finalProhibited: parsedProhibited,
      finalText: parsedText,
    };
  }, [allowed, prohibited, additionalRules]);

  if (finalAllowed.length === 0 && finalProhibited.length === 0 && !finalText)
    return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pl-1">
        <ScrollText className="w-5 h-5 text-brand-void dark:text-white" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Reglas de la casa
        </h3>
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* General/Additional Rules Text */}
        {finalText && (
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 order-first">
            {/* Added order-first just in case, but physical order is better */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Consideraciones
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {typeof finalText === "string"
                ? finalText
                : JSON.stringify(finalText)}
            </p>
          </div>
        )}

        {/* Allowed List */}
        {finalAllowed.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500/20" />
            <h4 className="font-bold text-sm text-green-700 dark:text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 block" />
              Permitido
            </h4>
            <div className="flex flex-wrap gap-2">
              {finalAllowed.map((rule, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-xs font-semibold text-green-800 dark:text-green-200"
                >
                  <Check className="w-3 h-3" />
                  {rule.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prohibited List */}
        {finalProhibited.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/20" />
            <h4 className="font-bold text-sm text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 block" />
              Prohibido
            </h4>
            <div className="flex flex-wrap gap-2">
              {finalProhibited.map((rule, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-xs font-semibold text-red-800 dark:text-red-200"
                >
                  <Ban className="w-3 h-3" />
                  {rule.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
