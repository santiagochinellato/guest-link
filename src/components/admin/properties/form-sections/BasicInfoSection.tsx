"use client";

import { useFormContext } from "react-hook-form";
import { Clock, ImageIcon, X, Loader2, Upload } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { useState, ChangeEvent } from "react";

export function BasicInfoSection() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<PropertyFormData>();

  const watchCoverImage = watch("coverImageUrl");

  // Estado para upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Valida que la URL sea una imagen válida (no base64)
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    // Rechazar URLs base64
    if (url.startsWith("data:")) return false;
    // Aceptar URLs http/https
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // Maneja la subida de archivos a Supabase Storage
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Solo se permiten imágenes JPEG, PNG, GIF o WebP");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El archivo es muy grande. Máximo 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al subir imagen");
      }

      // Setear la URL en el formulario
      setValue("coverImageUrl", result.url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error al subir imagen",
      );
    } finally {
      setIsUploading(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold">Información Básica</h3>
        <p className="text-sm text-gray-500">
          Detalles principales de tu propiedad.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre de la Propiedad
          </label>
          <input
            {...register("name")}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper transition-all dark:bg-white/5"
            placeholder="ej. Casa Azul - Vista al Mar"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug (URL)
          </label>
          <div className="relative mt-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
              guestlink.com/stay/
            </span>
            <input
              {...register("slug")}
              className="w-full pl-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none font-mono text-sm focus:border-brand-copper transition-all dark:bg-white/5"
            />
          </div>
          {errors.slug && (
            <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
          )}
        </div>

        {/* Cover Image - Con upload a Supabase Storage */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="w-full col-span-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Imagen de Portada
              </label>

              {isValidImageUrl(watchCoverImage || "") ? (
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={watchCoverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("coverImageUrl", "")}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Área de upload */}
                  <label
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all dark:bg-white/5 ${
                      isUploading
                        ? "border-brand-copper bg-brand-copper/5 dark:bg-brand-copper/10"
                        : "border-gray-300 dark:border-neutral-700 hover:border-brand-copper/50 hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-brand-copper animate-spin" />
                        <p className="text-sm text-brand-copper font-medium">
                          Subiendo imagen...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-brand-copper font-medium hover:underline">
                          Subir imagen desde tu PC
                        </span>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, GIF, WebP hasta 5MB
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>

                  {/* Error de upload */}
                  {uploadError && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      ⚠️ {uploadError}
                    </p>
                  )}

                  {/* Separador */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                    <span className="text-xs text-gray-400">o pegar URL</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                  </div>

                  {/* Input de URL */}
                  <div className="flex flex-col gap-2">
                    <input
                      {...register("coverImageUrl")}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper text-sm dark:bg-white/5"
                    />
                    {watchCoverImage && !isValidImageUrl(watchCoverImage) && (
                      <p className="text-amber-500 text-xs">
                        ⚠️ Solo URLs https:// son válidas.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="col-span-1 gap-6 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row w-full justify-between gap-6">
                {" "}
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-brand-copper" /> Check-in
                  </label>
                  <input
                    type="time"
                    {...register("checkInTime")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper dark:bg-white/5"
                  />
                </div>
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-brand-copper" /> Check-out
                  </label>
                  <input
                    type="time"
                    {...register("checkOutTime")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper dark:bg-white/5"
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-neutral-800 pt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Información del Anfitrión
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre del Anfitrión
                    </label>
                    <input
                      {...register("hostName")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper transition-all dark:bg-white/5"
                      placeholder="Ej. Santiago"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Teléfono / WhatsApp (Opcional)
                    </label>
                    <input
                      {...register("hostPhone")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-brand-copper transition-all dark:bg-white/5"
                      placeholder="+54 9 11 ..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Si se completa, aparecerá un botón de contacto directo en
                      &quot;Ayuda&quot;.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
