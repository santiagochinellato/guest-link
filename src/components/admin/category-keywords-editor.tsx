"use client";

import { useState } from "react";
import { Sparkles, Info } from "lucide-react";

interface CategoryKeywordsEditorProps {
  categories: Array<{
    id: string;
    name: string;
    type: string;
    searchKeywords?: string | null;
  }>;
  onUpdate: (categoryId: string, keywords: string) => void;
}

export function CategoryKeywordsEditor({
  categories,
  onUpdate,
}: CategoryKeywordsEditorProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<Record<string, string>>({});

  const handleSave = (categoryId: string) => {
    onUpdate(categoryId, keywords[categoryId] || "");
    setEditingCategory(null);
  };

  const handleEdit = (
    categoryId: string,
    currentKeywords: string | null | undefined,
  ) => {
    setEditingCategory(categoryId);
    setKeywords({ ...keywords, [categoryId]: currentKeywords || "" });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Keywords Personalizadas para Auto-Discovery
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              Define términos de búsqueda específicos para cada categoría.
              Separa múltiples keywords con comas. Ejemplo:{" "}
              <span className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
                Cervecería Artesanal, Manush, Blest
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border border-gray-200 dark:border-neutral-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {category.name}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({category.type})
                  </span>
                </div>

                {editingCategory === category.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={keywords[category.id] || ""}
                      onChange={(e) =>
                        setKeywords({
                          ...keywords,
                          [category.id]: e.target.value,
                        })
                      }
                      placeholder="Ej: Cervecería Artesanal, Manush, Blest, Wesley"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(category.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.searchKeywords ? (
                        <span className="font-mono text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">
                          {category.searchKeywords}
                        </span>
                      ) : (
                        <span className="italic text-gray-400">
                          Usando keywords por defecto
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(category.id, category.searchKeywords)
                      }
                      className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
