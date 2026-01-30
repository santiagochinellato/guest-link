"use client";

import { useState } from "react";
import { Bus, Car, ChevronRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TransportItem {
  id?: number;
  name: string;
  type: string | null;
  description?: string;
  phone?: string;
  scheduleInfo?: string;
}

interface TransportModuleProps {
  transport?: TransportItem[];
}

export function TransportModule({ transport = [] }: TransportModuleProps) {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  if (!transport || transport.length === 0) return null;

  // Filter items
  // Assuming "public" usually maps to type 'bus', 'train', 'subway', 'public'
  // Assuming "private" maps to 'taxi', 'uber', 'private', 'transfer'
  const publicItems = transport.filter(
    (t) => !["taxi", "uber", "private", "transfer"].includes(t.type || ""),
  );
  const privateItems = transport.filter((t) =>
    ["taxi", "uber", "private", "transfer"].includes(t.type || ""),
  );

  const displayItems = activeTab === "public" ? publicItems : privateItems;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-neutral-800 flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Car className="w-5 h-5 text-brand-copper" />
          Movilidad
        </h3>

        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("public")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              activeTab === "public"
                ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-400",
            )}
          >
            Transporte Público
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              activeTab === "private"
                ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-400",
            )}
          >
            Privado / Taxis
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {displayItems.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm italic">
            No hay opciones registradas en esta categoría.
          </div>
        ) : (
          displayItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f8fafc] dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex gap-4 items-start"
            >
              {/* Icon / Badge */}
              <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 shrink-0 flex items-center justify-center shadow-sm text-slate-600 dark:text-gray-300 font-bold border border-slate-100 dark:border-white/5">
                {activeTab === "public" ? (
                  <Bus className="w-5 h-5" />
                ) : (
                  <Car className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  {/* If it looks like a line number, maybe show a badge? layout handles it generically for now */}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description || item.scheduleInfo}
                </p>

                {/* Actions for Private (Call) */}
                {activeTab === "private" && item.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 h-8 text-xs w-full bg-white dark:bg-transparent"
                    onClick={() => window.open(`tel:${item.phone}`, "_self")}
                  >
                    <Phone className="w-3 h-3 mr-2" />
                    Llamar {item.phone}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
