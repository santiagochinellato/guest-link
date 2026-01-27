"use client";

import { useFormContext } from "react-hook-form";
import { Clock, ImageIcon, X } from "lucide-react";
import { PropertyFormData } from "@/lib/schemas";
import { ChangeEvent } from "react";

export function BasicInfoSection() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<PropertyFormData>();

  const watchCoverImage = watch("coverImageUrl");

  const handleFileUpload =
    (field: "coverImageUrl" | "hostImage") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("El archivo es demasiado grande (Máx 5MB)");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setValue(field, reader.result as string);
        };
        reader.readAsDataURL(file);
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
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 transition-all"
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
              className="w-full pl-48 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none font-mono text-sm focus:border-blue-500 transition-all"
            />
          </div>
          {errors.slug && (
            <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
          )}
        </div>

        {/* Cover Image */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="w-full col-span-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Imagen de Portada
              </label>

              {watchCoverImage ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:border-blue-500/50 transition-all text-center cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                    <span className="text-sm text-blue-600 font-medium hover:underline">
                      Subir archivo
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload("coverImageUrl")}
                    />
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF hasta 5MB
                    </p>
                  </label>
                  <div className="flex flex-col justify-center gap-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      O pegar URL
                    </p>
                    <input
                      {...register("coverImageUrl")}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="col-span-1 gap-6 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row w-full justify-between gap-6">
                {" "}
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" /> Check-in
                  </label>
                  <input
                    type="time"
                    {...register("checkInTime")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                  />
                </div>
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" /> Check-out
                  </label>
                  <input
                    type="time"
                    {...register("checkOutTime")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
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
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 transition-all"
                      placeholder="Ej. Santiago"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Teléfono / WhatsApp (Opcional)
                    </label>
                    <input
                      {...register("hostPhone")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 transition-all"
                      placeholder="+54 9 11 ..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Si se completa, aparecerá un botón de contacto directo en
                      &quot;Ayuda&quot;.
                    </p>
                  </div>
                </div>
                {/* <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Foto del Anfitrión
                  </label>
                  <div className="mt-1">
                    {hostImageUrl ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 dark:border-neutral-700 group mx-auto md:mx-0">
                        <img
                          src={hostImageUrl}
                          alt="Host"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setValue("hostImage", "")}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        <label className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:border-blue-500/50 transition-all text-center cursor-pointer w-full md:w-auto min-w-[120px]">
                          <User className="w-6 h-6 text-gray-300" />
                          <span className="text-xs text-blue-600 font-medium hover:underline">
                            Subir foto
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload("hostImage")}
                          />
                        </label>
                        <div className="flex-1 w-full">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            O pegar URL
                          </p>
                          <input
                            {...register("hostImage")}
                            placeholder="https://..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Recomendado: Imagen cuadrada, rostro
                            visible.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
