import { MessageCircle, CheckCircle, XCircle } from "lucide-react";

interface GuestRulesListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: any;
}

export function GuestRulesList({ rules: rawRules }: GuestRulesListProps) {
  const rules =
    typeof rawRules === "object" && rawRules !== null
      ? rawRules
      : {
          text: rawRules || "",
          allowed: [],
          prohibited: [],
        };

  return (
    <div className="dark:bg-brand-void from-[#0f756d]/5 to-transparent rounded-[2rem] p-8 border border-[#0f756d]/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm text-[#0f756d]">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          Reglas de la Casa
        </h3>
      </div>

      <div className="space-y-8">
        {/* Description */}
        <div className="relative">
          <div className="absolute top-0 left-0 text-[#0f756d]/10 text-6xl font-serif -translate-x-2 -translate-y-4">
            “
          </div>
          <div className="prose dark:prose-invert prose-sm relative z-10 prose-p:text-neutral-600 dark:prose-p:text-neutral-300 prose-p:leading-relaxed">
            {rules.text ? (
              <p className="whitespace-pre-wrap font-medium">{rules.text}</p>
            ) : (
              <p className="text-gray-400 italic">
                Por favor respeta la propiedad y disfruta tu estadía.
              </p>
            )}
          </div>
        </div>

        {/* Allowed List */}
        {rules.allowed && rules.allowed.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Se Permite / Info
            </h4>
            <ul className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {rules.allowed.map((item: string, i: number) => (
                <li
                  key={i}
                  className="text-sm text-neutral-600 dark:text-neutral-300 flex items-start gap-2"
                >
                  <span className="mt-1.5 size-1.5 rounded-full bg-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prohibited List */}
        {rules.prohibited && rules.prohibited.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Prohibido
            </h4>
            <ul className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {rules.prohibited.map((item: string, i: number) => (
                <li
                  key={i}
                  className="text-sm text-neutral-600 dark:text-neutral-300 flex items-start gap-2"
                >
                  <span className="mt-1.5 size-1.5 rounded-full bg-red-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
