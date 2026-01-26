"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

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
  const [keywords, setKeywords] = useState(category.searchKeywords || "");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(keywords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
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
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">Tip:</span> Separa múltiples
              términos con comas.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Ejemplo:{" "}
              <span className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
                Cervecería Artesanal, Manush, Blest
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keywords Personalizadas
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Agrega palabras claves para mejorar la búsquedas por categoria "
              className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {keywords.trim()
                ? "Usando keywords personalizadas"
                : "Se usarán keywords por defecto si dejas esto vacío"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
          >
            Guardar Keywords
          </button>
        </div>
      </div>
    </div>
  );
}
