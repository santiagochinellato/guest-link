"use client";

import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Utensils,
  Camera,
  ShoppingBag,
  Mountain,
  Baby,
  Beer,
  Tag,
  ChevronDown,
  Sparkles,
  Trash2,
  Plus,
  PlusCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyFormData, CategoryFromDB } from "@/lib/schemas";
import { AutoFillButton } from "@/components/admin/auto-fill-button";
import { KeywordModal } from "@/components/admin/keyword-modal";
import {
  updateCategoryKeywords,
  createCategory,
  deleteCategory,
} from "@/lib/actions/categories";

interface RecommendationsTabProps {
  initialData: {
    id?: number;
    categories?: CategoryFromDB[];
    recommendations?: any[];
  };
}

export function RecommendationsSection({
  initialData,
}: RecommendationsTabProps) {
  const { control, register } = useFormContext<PropertyFormData>();
  const {
    fields: recFields,
    append: appendRec,
    remove: removeRec,
  } = useFieldArray({
    control,
    name: "recommendations",
  });

  // Local State for Categories
  const [activeCategory, setActiveCategory] = useState<string>("gastronomy");
  const [keywordModal, setKeywordModal] = useState<{
    isOpen: boolean;
    category: {
      id: string;
      name: string;
      type: string;
      searchKeywords?: string | null;
    } | null;
  }>({ isOpen: false, category: null });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Default Categories Configuration
  const defaultCategories = [
    {
      id: "gastronomy",
      label: "Restaurantes",
      icon: Utensils,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-500",
    },
    {
      id: "sights",
      label: "Atracciones",
      icon: Camera,
      color: "text-purple-600",
      bg: "bg-purple-50/50",
      border: "border-purple-500",
    },
    {
      id: "shops",
      label: "Tiendas",
      icon: ShoppingBag,
      color: "text-pink-600",
      bg: "bg-pink-50/50",
      border: "border-pink-500",
    },
    {
      id: "kids",
      label: "Kids",
      icon: Baby,
      color: "text-yellow-600",
      bg: "bg-yellow-50/50",
      border: "border-yellow-500",
    },
    {
      id: "bars",
      label: "Bares",
      icon: Beer,
      color: "text-orange-600",
      bg: "bg-orange-50/50",
      border: "border-orange-500",
    },
    {
      id: "outdoors",
      label: "Outdoors",
      icon: Mountain,
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
      border: "border-emerald-500",
    },
  ];

  const [categoriesList, setCategoriesList] = useState(defaultCategories);

  // Initialize categories with custom ones from database
  useEffect(() => {
    // Load categories from database if available
    if (initialData.categories && Array.isArray(initialData.categories)) {
      const existingTypes = new Set(defaultCategories.map((c) => c.id));
      const customCatsFromDB = initialData.categories
        .filter((cat: CategoryFromDB) => !existingTypes.has(cat.type))
        .map((cat: CategoryFromDB) => ({
          id: cat.type,
          label: cat.name,
          icon: Tag,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-500",
        }));

      if (customCatsFromDB.length > 0) {
        setCategoriesList((prev) => {
          const currentIds = new Set(prev.map((p) => p.id));
          const uniqueToAdd = customCatsFromDB.filter(
            (c) => !currentIds.has(c.id),
          );
          return [...prev, ...uniqueToAdd];
        });
      }
    }
    // Fallback: check recommendations for custom categories
    else if (initialData.recommendations) {
      const existingTypes = new Set(defaultCategories.map((c) => c.id));
      const customFound = new Set<string>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialData.recommendations.forEach((rec: any) => {
        if (rec.categoryType && !existingTypes.has(rec.categoryType)) {
          customFound.add(rec.categoryType);
        }
      });

      if (customFound.size > 0) {
        const newCustomCats = Array.from(customFound).map((type) => ({
          id: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          icon: Tag,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-500",
        }));
        setCategoriesList((prev) => {
          const currentIds = new Set(prev.map((p) => p.id));
          const uniqueToAdd = newCustomCats.filter(
            (c) => !currentIds.has(c.id),
          );
          return [...prev, ...uniqueToAdd];
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.categories, initialData.recommendations]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    if (!initialData.id) {
      alert(
        "Debes guardar la propiedad primero antes de agregar categorías personalizadas.",
      );
      return;
    }

    const id = newCategoryName.toLowerCase().trim().replace(/\s+/g, "_");

    // Check if exists
    if (categoriesList.find((c) => c.id === id)) {
      alert("Esta categoría ya existe.");
      return;
    }

    // Save to database
    const result = await createCategory(initialData.id, id, newCategoryName);

    if (!result.success) {
      alert("Error al crear la categoría. Intenta nuevamente.");
      return;
    }

    const newCat = {
      id,
      label: newCategoryName,
      icon: Tag,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-500",
    };

    setCategoriesList([...categoriesList, newCat]);
    setActiveCategory(id);
    setNewCategoryName("");
    setIsAddingCategory(false);

    // Reload page to ensure category persists and shows in all views
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Find the category in the database
    const categoryFromDB = initialData.categories?.find(
      (cat: CategoryFromDB) => cat.type === categoryId,
    );

    // Prevent deletion of system categories
    if (categoryFromDB?.isSystemCategory) {
      alert("No se pueden eliminar categorías del sistema.");
      return;
    }

    if (
      !confirm(
        "¿Estás seguro de eliminar esta categoría? Se eliminarán también todas sus recomendaciones.",
      )
    ) {
      return;
    }

    // If it's a custom category from DB, delete it
    if (categoryFromDB?.id) {
      const result = await deleteCategory(categoryFromDB.id);
      if (!result.success) {
        alert("Error al eliminar la categoría");
        return;
      }
    }

    // Remove from local state
    setCategoriesList(categoriesList.filter((c) => c.id !== categoryId));

    // If it was the active category, switch to first one
    if (activeCategory === categoryId) {
      setActiveCategory(categoriesList[0]?.id || "");
    }

    // Reload to ensure consistency
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="text-xl font-semibold">Recomendaciones Locales</h3>
          <p className="text-sm text-gray-500">Gestiona lugares destacados.</p>
        </div>
        {initialData.id && <AutoFillButton propertyId={initialData.id} />}
      </div>

      {/* --- MOBILE ACCORDION LIST --- */}
      <div className="md:hidden space-y-3 mb-6">
        {categoriesList
          .filter((cat) => cat.id !== "transit")
          .map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setActiveCategory(activeCategory === cat.id ? "" : cat.id)
                }
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      activeCategory === cat.id
                        ? `${cat.bg} text-white`
                        : "bg-gray-100 dark:bg-neutral-800 text-gray-500",
                    )}
                  >
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4
                      className={cn(
                        "font-bold text-sm",
                        activeCategory === cat.id
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400",
                      )}
                    >
                      {cat.label}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {
                        recFields.filter(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (f: any) => f.categoryType === cat.id,
                        ).length
                      }{" "}
                      lugares
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-300 transition-transform duration-300",
                    activeCategory === cat.id ? "rotate-180" : "",
                  )}
                />
              </button>

              {/* Expanded Content */}
              {activeCategory === cat.id && (
                <div className="p-4 bg-gray-50 dark:bg-neutral-800/30 border-t border-gray-100 dark:border-neutral-800 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2 mb-3">
                    {/* Keyword Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dbCat = initialData.categories?.find(
                          (c) => c.type === cat.id,
                        );
                        setKeywordModal({
                          isOpen: true,
                          category: {
                            id: cat.id,
                            name: cat.label,
                            type: cat.id,
                            searchKeywords: dbCat?.searchKeywords || null,
                          },
                        });
                      }}
                      className="flex-1 px-3 py-2.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors flex items-center justify-center gap-2 border border-teal-200 dark:border-teal-800"
                    >
                      <Sparkles className="w-4 h-4" />
                      Editar Keywords
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id);
                      }}
                      className="px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        appendRec({
                          title: "",
                          formattedAddress: "",
                          googleMapsLink: "",
                          categoryType: activeCategory,
                          description: "",
                        })
                      }
                      className="w-full px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Agregar Lugar
                    </button>
                  </div>

                  {/* List */}
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {recFields.map((field: any, index) => {
                      if (field.categoryType !== activeCategory) return null;
                      return (
                        <div
                          key={field.id}
                          className="relative p-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl space-y-3"
                        >
                          <div className="pr-6">
                            <input
                              {...register(
                                `recommendations.${index}.title` as const,
                              )}
                              className="w-full text-sm font-bold bg-transparent border-b border-gray-200 dark:border-neutral-700 pb-1 outline-none"
                              placeholder="Nombre del Lugar"
                            />
                            <input
                              {...register(
                                `recommendations.${index}.description` as const,
                              )}
                              className="w-full text-xs text-gray-500 bg-transparent outline-none mt-2"
                              placeholder="Descripción breve..."
                            />
                          </div>
                          <input
                            {...register(
                              `recommendations.${index}.formattedAddress` as const,
                            )}
                            className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-neutral-700 pb-1 outline-none"
                            placeholder="Dirección o Zona"
                          />
                          <input
                            {...register(
                              `recommendations.${index}.googleMapsLink` as const,
                            )}
                            className="w-full text-xs text-blue-500 bg-transparent border-b border-gray-200 dark:border-neutral-700 pb-1 outline-none"
                            placeholder="https://maps..."
                          />
                          <button
                            type="button"
                            onClick={() => removeRec(index)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {recFields.filter(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (f: any) => f.categoryType === activeCategory,
                    ).length === 0 && (
                      <p className="text-center text-gray-400 text-xs italic py-2">
                        Sin lugares por ahora.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        <button
          type="button"
          onClick={() => setIsAddingCategory(true)}
          className="w-full py-3 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl flex items-center justify-center text-gray-500 font-semibold text-sm gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
        {categoriesList
          .filter((cat) => cat.id !== "transit")
          .map((cat) => (
            <div
              key={cat.id}
              className={cn(
                "p-4 border rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 relative overflow-hidden group",
                activeCategory === cat.id
                  ? `${cat.border} ${cat.bg} dark:bg-opacity-10 dark:border-opacity-50`
                  : "border-gray-200 dark:border-neutral-800",
              )}
            >
              <div
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    activeCategory === cat.id
                      ? "bg-white/80 dark:bg-neutral-900/50"
                      : "bg-gray-100 dark:bg-neutral-800",
                  )}
                >
                  <cat.icon
                    className={cn(
                      "w-5 h-5",
                      activeCategory === cat.id ? cat.color : "text-gray-500",
                    )}
                  />
                </div>
                <div>
                  <h4
                    className={cn(
                      "font-bold text-base",
                      activeCategory === cat.id
                        ? cat.color
                        : "text-gray-700 dark:text-gray-300",
                    )}
                  >
                    {cat.label}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {
                      recFields.filter(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (f: any) => f.categoryType === cat.id,
                      ).length
                    }{" "}
                    lugares
                  </p>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-between mt-auto pt-2 gap-2">
                {/* Keyword Edit Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dbCat = initialData.categories?.find(
                      (c) => c.type === cat.id,
                    );
                    setKeywordModal({
                      isOpen: true,
                      category: {
                        id: cat.id,
                        name: cat.label,
                        type: cat.id,
                        searchKeywords: dbCat?.searchKeywords || null,
                      },
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                >
                  + Add Keywords
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

        {/* Add New Category Button */}
        {isAddingCategory ? (
          <div className="p-4 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl bg-gray-50 dark:bg-neutral-800/30 flex flex-col justify-center gap-2">
            <input
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre categoría..."
              className="w-full text-sm bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex-1 bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-3 bg-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="p-4 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all gap-1 h-full min-h-[88px]"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs font-semibold">Nueva Categoría</span>
          </button>
        )}
      </div>

      <div className="hidden md:block bg-gray-50 dark:bg-neutral-800/20 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h4 className="font-semibold capitalize flex items-center gap-2">
            {/* Show active category icon and label */}
            {(() => {
              const cat = categoriesList.find((c) => c.id === activeCategory);
              if (!cat) return activeCategory;
              return (
                <>
                  <cat.icon className={cn("w-5 h-5", cat.color)} />
                  <span className={cat.color}>{cat.label}</span>
                </>
              );
            })()}
          </h4>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {initialData.id && (
              <AutoFillButton
                propertyId={initialData.id}
                categoryId={activeCategory}
                className="flex-shrink-0"
              />
            )}
            <button
              type="button"
              onClick={() =>
                appendRec({
                  title: "",
                  formattedAddress: "",
                  googleMapsLink: "",
                  categoryType: activeCategory,
                  description: "",
                })
              }
              className="px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar Lugar
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {recFields.map((field: any, index) => {
            if (field.categoryType !== activeCategory) return null;
            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm relative group"
              >
                <div className="md:col-span-3 pr-6 md:pr-0">
                  <input
                    {...register(`recommendations.${index}.title` as const)}
                    className="w-full text-sm font-semibold bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                    placeholder="Nombre del Lugar"
                  />
                  <input
                    {...register(
                      `recommendations.${index}.description` as const,
                    )}
                    className="w-full text-xs text-gray-500 bg-transparent outline-none mt-1"
                    placeholder="Descripción breve..."
                  />
                </div>
                <div className="md:col-span-4">
                  <input
                    {...register(
                      `recommendations.${index}.formattedAddress` as const,
                    )}
                    className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                    placeholder="Dirección o Zona"
                  />
                </div>
                <div className="md:col-span-4">
                  <input
                    {...register(
                      `recommendations.${index}.googleMapsLink` as const,
                    )}
                    className="w-full text-sm text-blue-500 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                    placeholder="https://maps..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRec(index)}
                  className=" p-2 pt-0 text-gray-400 hover:text-red-500 opacity-100 group-hover:opacity-100 transition-opacity md:col-span-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {recFields.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (f: any) => f.categoryType === activeCategory,
          ).length === 0 && (
            <p className="text-center text-gray-400 text-sm italic py-4">
              No hay lugares en esta categoría aún.
            </p>
          )}
        </div>
      </div>

      {/* Keyword Modal */}
      {keywordModal.isOpen && keywordModal.category && (
        <KeywordModal
          isOpen={keywordModal.isOpen}
          onClose={() => setKeywordModal({ isOpen: false, category: null })}
          category={keywordModal.category}
          onSave={async (keywords) => {
            // Find the numeric ID from the database categories
            const catType = keywordModal.category?.id;
            const dbCategory = initialData.categories?.find(
              (c) => c.type === catType,
            );

            if (!dbCategory) {
              alert(
                "Error: Categoría no sincronizada. Por favor recarga la página.",
              );
              return;
            }

            const result = await updateCategoryKeywords(
              Number(dbCategory.id),
              keywords,
            );
            if (result.success) {
              console.log("Keywords updated successfully");
            } else {
              alert("Error al guardar keywords");
            }
          }}
        />
      )}
    </div>
  );
}
