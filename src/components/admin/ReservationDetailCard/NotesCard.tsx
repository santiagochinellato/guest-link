"use client";

import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotesCardProps {
  notesValue: string;
  setNotesValue: (v: string) => void;
  showNotesEdit: boolean;
  setShowNotesEdit: (v: boolean) => void;
  isSavingNotes: boolean;
  onSave: () => void;
}

export function NotesCard({
  notesValue,
  setNotesValue,
  showNotesEdit,
  setShowNotesEdit,
  isSavingNotes,
  onSave,
}: NotesCardProps) {
  return (
    <div
      className={cn(
        "xl:col-span-2 rounded-2xl p-6 flex flex-col",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-white/50 dark:border-slate-800",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <PenLine className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Anotaciones</h3>
      </div>

      <div className="flex-1 flex flex-col">
        {showNotesEdit ? (
          <div className="space-y-3">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Escribe notas sobre esta reserva..."
              className="flex-1 min-h-[120px] w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSavingNotes}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSavingNotes ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNotesEdit(true)}
            className={cn(
              "flex-1 min-h-[120px] w-full px-4 py-3 rounded-xl text-left",
              "border-2 border-dashed border-slate-200 dark:border-slate-600",
              "bg-slate-50 dark:bg-slate-800/50",
              "hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all"
            )}
          >
            <span
              className={cn(
                "text-sm",
                notesValue.trim()
                  ? "text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              {notesValue.trim() || "Haz clic para agregar notas..."}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

