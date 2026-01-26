"use client";

import { useState } from "react";
import { Sparkles, X, Plus, Tag } from "lucide-react";

interface KeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    type: string;
    searchKeywords?: string | null;
  };
  onSave: (keywords: string) => void;
}

export function KeywordModal({
  isOpen,
  onClose,
  category,
  onSave,
}: KeywordModalProps) {
  // Initialize keywords array from comma-separated string
  const [keywords, setKeywords] = useState<string[]>(
    category.searchKeywords
      ? category.searchKeywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      : [],
  );
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleAddKeyword = () => {
    const val = inputValue.trim();
    if (val) {
      // Avoid duplicates
      if (!keywords.includes(val)) {
        setKeywords([...keywords, val]);
      }
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(keywords.join(", "));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keywords de Búsqueda
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Tip Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg h-fit text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                Mejora el Auto-Discovery
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                Agrega términos específicos para esta categoría. Por ejemplo,
                para &quot;Boliches&quot; usa:{" "}
                <span className="font-mono">night club</span>,{" "}
                <span className="font-mono">discoteca</span>,{" "}
                <span className="font-mono">pub</span>.
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nueva Keyword
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Escribe y presiona Enter..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
              <button
                onClick={handleAddKeyword}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>

          {/* Tags List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Keywords Activas ({keywords.length})
              </label>
              {keywords.length > 0 && (
                <button
                  onClick={() => setKeywords([])}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline"
                >
                  Borrar todas
                </button>
              )}
            </div>

            <div className="min-h-[100px] p-4 bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 rounded-xl flex flex-wrap content-start gap-2">
              {keywords.length > 0 ? (
                keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 shadow-sm animate-in zoom-in-95 duration-200"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(index)}
                      className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 py-8 gap-2">
                  <Tag className="w-8 h-8 opacity-20" />
                  <p className="text-xs">No hay keywords definidas.</p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Estas palabras se usarán para encontrar lugares cercanos
              automáticamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 rounded-xl transition-all active:scale-95"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
