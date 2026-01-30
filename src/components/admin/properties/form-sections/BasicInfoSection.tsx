"use client";

import { useState, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import {
  Clock,
  ImageIcon,
  X,
  Loader2,
  Upload,
  Home,
  Globe,
  User,
  Phone,
  LayoutTemplate,
  Image as ImageIconLucide,
} from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

  // Valida que la URL sea una imagen válida
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith("data:")) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // Maneja la subida de archivos
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Formato no soportado (Use JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El archivo es muy grande (Máx 5MB)");
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

      if (!response.ok) throw new Error(result.error || "Error al subir");

      setValue("coverImageUrl", result.url, { shouldDirty: true });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Hubo un error al subir la imagen.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Información General
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define la identidad principal de tu propiedad y su portada.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: DATOS Y LOGÍSTICA */}
        <div className="xl:col-span-2 space-y-6">
          {/* CARD 1: IDENTIDAD */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-brand-copper/10 rounded-lg text-brand-copper">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Identidad Digital
                </h4>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Nombre Público
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <Input
                    {...register("name")}
                    placeholder="Ej: Cabaña Vista al Lago"
                    className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-copper/20 text-base"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Link Personalizado (Slug)
                </Label>
                <div className="flex rounded-md shadow-sm">
                  <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-sm font-mono select-none">
                    <Globe className="w-3.5 h-3.5 mr-2" />
                    guestlink.com/stay/
                  </div>
                  <Input
                    {...register("slug")}
                    placeholder="mi-propiedad"
                    className="rounded-l-none h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-brand-copper/20 font-mono text-sm"
                  />
                </div>
                {errors.slug && (
                  <p className="text-red-500 text-xs">{errors.slug.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: OPERATIVIDAD & HOST */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Horarios */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Horarios
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Check-in</Label>
                      <Input
                        type="time"
                        {...register("checkInTime")}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Check-out</Label>
                      <Input
                        type="time"
                        {...register("checkOutTime")}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Anfitrión */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded text-green-600 dark:text-green-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      Anfitrión
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <Input
                        {...register("hostName")}
                        placeholder="Nombre del Host"
                        className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <Input
                        {...register("hostPhone")}
                        placeholder="+54 9 11..."
                        className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: COVER IMAGE (VISUAL ANCHOR) */}
        <div className="xl:col-span-1">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm h-full bg-white dark:bg-zinc-950 flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-brand-copper/10 rounded-lg text-brand-copper">
                  <ImageIconLucide className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Imagen de Portada
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Será la primera impresión del huésped.
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {isValidImageUrl(watchCoverImage || "") ? (
                  <div className="relative w-full aspect-[9/16] xl:aspect-[3/4] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group shadow-sm bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={watchCoverImage}
                      alt="Cover"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => setValue("coverImageUrl", "")}
                        className="p-3 bg-white/90 text-red-600 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                        title="Eliminar imagen"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs font-medium text-center">
                        Vista Previa
                      </p>
                    </div>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group relative overflow-hidden",
                      isUploading
                        ? "border-brand-copper bg-brand-copper/5"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-brand-copper/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                    )}
                  >
                    <div className="absolute inset-0 bg-[url('/file.svg')] opacity-[0.03] bg-center bg-repeat space-y-4" />

                    {isUploading ? (
                      <>
                        <Loader2 className="w-10 h-10 text-brand-copper animate-spin relative z-10" />
                        <p className="text-sm text-brand-copper font-medium relative z-10">
                          Subiendo...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                          <Upload className="w-8 h-8 text-zinc-400 group-hover:text-brand-copper transition-colors" />
                        </div>
                        <div className="text-center relative z-10 px-4">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Click para subir imagen
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            o arrastra y suelta aquí
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-4 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full inline-block">
                            JPG, PNG, WEBP (Max 5MB)
                          </p>
                        </div>
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
                )}

                {/* Error Message */}
                {uploadError && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                    <X className="w-4 h-4 shrink-0" />
                    {uploadError}
                  </div>
                )}

                {/* Fallback URL Input (Subtle) */}
                {!isValidImageUrl(watchCoverImage || "") && !isUploading && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10px] text-zinc-400 uppercase text-center">
                        O pegar enlace directo
                      </Label>
                      <Input
                        {...register("coverImageUrl")}
                        placeholder="https://..."
                        className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-center"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
