"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  Clock,
  Wifi,
  Sparkles,
  AlertCircle,
  Car,
  Star,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { fetchNearbyPlaces } from "@/lib/actions/overpass";
import { AddressAutocomplete, AddressResult } from "./address-autocomplete";

interface PropertyFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isEditMode?: boolean;
}

export function PropertyForm({
  initialData = {},
  isEditMode = false,
}: PropertyFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAuto, setIsLoadingAuto] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("restaurants");

  // Form Setup
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: initialData.name || "",
      slug: initialData.slug || "",
      address: initialData.address || "",
      city: initialData.city || "",
      country: initialData.country || "",
      latitude: initialData.latitude || "",
      longitude: initialData.longitude || "",
      checkInTime: initialData.checkInTime || "15:00",
      checkOutTime: initialData.checkOutTime || "11:00",
      wifiSsid: initialData.wifiSsid || "",
      wifiPassword: initialData.wifiPassword || "",
      wifiQrCode: initialData.wifiQrCode || "",
      coverImageUrl: initialData.coverImageUrl || "",
      recommendations: initialData.recommendations || [],
      emergencyContacts: initialData.emergencyContacts || [],
      transport: initialData.transport || [],
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = form;

  // Field Arrays
  const {
    fields: recFields,
    append: appendRec,
    remove: removeRec,
  } = useFieldArray({
    control,
    name: "recommendations",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const {
    fields: transportFields,
    append: appendTransport,
    remove: removeTransport,
  } = useFieldArray({
    control,
    name: "transport",
  });

  // Watchers
  const watchName = watch("name");
  const watchCoverImage = watch("coverImageUrl");

  // Auto-generate slug
  useEffect(() => {
    if (!isEditMode && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug);
    }
  }, [watchName, isEditMode, setValue]);

  // Handlers
  const handleAddressSelect = (result: AddressResult) => {
    setValue("address", result.display_name);
    setValue("latitude", result.lat);
    setValue("longitude", result.lon);

    if (result.address.city || result.address.town || result.address.village) {
      setValue(
        "city",
        result.address.city ||
          result.address.town ||
          result.address.village ||
          "",
      );
    }
    if (result.address.country) {
      setValue("country", result.address.country);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("coverImageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateWifiQr = () => {
    const ssid = watch("wifiSsid");
    const pass = watch("wifiPassword");
    if (ssid) {
      setValue("wifiQrCode", `WIFI:T:WPA;S:${ssid};P:${pass};;`);
    }
  };

  const handleAutoFill = async () => {
    const lat = parseFloat(watch("latitude") || "0");
    const lon = parseFloat(watch("longitude") || "0");

    if (!lat || !lon) {
      alert(
        "Por favor configura la ubicación (en Información Básica) primero.",
      );
      return;
    }

    setIsLoadingAuto(true);
    try {
      const res = await fetchNearbyPlaces(lat, lon, activeCategory);
      if (res.success && res.data) {
        // Filter out duplicates (simple check by title)
        const existingTitles = recFields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((f: any) => f.categoryType === activeCategory)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((f: any) => f.title);

        const newPlaces = res.data.filter(
          (p) => !existingTitles.includes(p.title),
        );

        if (newPlaces.length === 0) {
          alert("No se encontraron lugares nuevos o todos son duplicados.");
        } else {
          newPlaces.forEach((p) => appendRec(p));
        }
      } else {
        alert("Error buscando lugares: " + res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error en autocompletado.");
    } finally {
      setIsLoadingAuto(false);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSaving(true);
    try {
      let res;
      if (isEditMode && initialData.id) {
        res = await updateProperty(initialData.id, data);
      } else {
        res = await createProperty(data);
      }

      if (res.success) {
        setShowSuccessModal(true);
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (e: any) {
      alert("Ocurrió un error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/properties");
    router.refresh(); // Ensure server constraints are re-checked
  };

  const TABS = [
    { id: "basic", label: "Información Básica", icon: Star },
    { id: "location", label: "Ubicación", icon: MapPin },
    { id: "wifi", label: "WiFi y Acceso", icon: Wifi },
    { id: "recommendations", label: "Recomendaciones", icon: Sparkles },
    { id: "transport", label: "Transporte", icon: Car },
    { id: "emergency", label: "Emergencia", icon: AlertCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <div
          onClick={() => router.back()}
          className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Editar Propiedad" : "Nueva Propiedad"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isEditMode
              ? "Administra tu guía existente."
              : "Crea y configura tu guía de bienvenida."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3">
          <div className="sticky top-6 flex flex-col gap-2">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Configuración
            </h3>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={cn(
                  "group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left",
                  activeTab === tab.id
                    ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-neutral-700 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-4 h-4",
                    activeTab === tab.id ? "text-blue-600" : "text-gray-500",
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-9">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm min-h-[600px] max-h-[600px] overflow-y-auto pr-2 custom-scrollbar relative"
          >
            {/* --- BASIC INFO TAB --- */}
            {activeTab === "basic" && (
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div>
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
                            onChange={handleImageUpload}
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

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-500" /> Check-in
                      </label>
                      <input
                        type="time"
                        {...register("checkInTime")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
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
                </div>
              </div>
            )}

            {/* --- LOCATION TAB (Nominatim) --- */}
            {activeTab === "location" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold">Ubicación</h3>
                  <p className="text-sm text-gray-500">
                    Dirección y posicionamiento en mapa (OpenStreetMap).
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Buscar Dirección
                    </label>
                    <AddressAutocomplete
                      onSelect={handleAddressSelect}
                      defaultValue={watch("address")}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dirección Completa
                    </label>
                    <input
                      {...register("address")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ciudad
                      </label>
                      <input
                        {...register("city")}
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        País
                      </label>
                      <input
                        {...register("country")}
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-neutral-800/20 p-4 rounded-xl">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Latitud
                      </label>
                      <input
                        {...register("latitude")}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-700 py-1 outline-none text-sm font-mono"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Longitud
                      </label>
                      <input
                        {...register("longitude")}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-700 py-1 outline-none text-sm font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- WIFI TAB --- */}
            {activeTab === "wifi" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold">Configuración WiFi</h3>
                  <p className="text-sm text-gray-500">
                    Detalles de conexión segura.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      SSID (Nombre de Red)
                    </label>
                    <input
                      {...register("wifiSsid")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña
                    </label>
                    <input
                      {...register("wifiPassword")}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={generateWifiQr}
                    className="text-sm text-blue-600 font-semibold hover:underline"
                  >
                    Generar Cadena QR
                  </button>
                  {watch("wifiQrCode") && (
                    <span className="ml-4 text-green-500 text-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Generado
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* --- RECOMMENDATIONS TAB --- */}
            {activeTab === "recommendations" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Recomendaciones Locales
                    </h3>
                    <p className="text-sm text-gray-500">
                      Gestiona lugares destacados.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {["Restaurantes", "Turismo", "Compras"].map((cat) => (
                    <div
                      key={cat}
                      onClick={() => {
                        // Map Spanish labels back to internal category types
                        const map: Record<string, string> = {
                          Restaurantes: "restaurants",
                          Turismo: "sights",
                          Compras: "shopping",
                        };
                        setActiveCategory(map[cat] || cat.toLowerCase());
                      }}
                      className={cn(
                        "p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800",
                        activeCategory ===
                          (cat === "Restaurantes"
                            ? "restaurants"
                            : cat === "Turismo"
                              ? "sights"
                              : "shopping")
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-neutral-800",
                      )}
                    >
                      <h4
                        className={cn(
                          "font-bold text-lg",
                          activeCategory ===
                            (cat === "Restaurantes"
                              ? "restaurants"
                              : cat === "Turismo"
                                ? "sights"
                                : "shopping")
                            ? "text-blue-600"
                            : "text-gray-700 dark:text-gray-300",
                        )}
                      >
                        {cat}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {
                          recFields.filter(
                            (f: any) =>
                              f.categoryType ===
                              (cat === "Restaurantes"
                                ? "restaurants"
                                : cat === "Turismo"
                                  ? "sights"
                                  : "shopping"),
                          ).length
                        }{" "}
                        lugares
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 dark:bg-neutral-800/20 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold capitalize">
                      Lista{" "}
                      {activeCategory === "restaurants"
                        ? "Restaurantes"
                        : activeCategory === "sights"
                          ? "Turismo"
                          : "Compras"}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={isLoadingAuto}
                        className="text-sm font-semibold text-purple-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        {isLoadingAuto ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Relleno Automático IA (OSM)
                      </button>
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
                        className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:underline"
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
                          <div className="md:col-span-4">
                            <input
                              {...register(
                                `recommendations.${index}.title` as const,
                              )}
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
                          <div className="md:col-span-3">
                            <input
                              {...register(
                                `recommendations.${index}.googleMapsLink` as const,
                              )}
                              className="w-full text-sm text-blue-500 bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                              placeholder="https://maps..."
                            />
                          </div>
                          <div className="md:col-span-1 flex items-start justify-end">
                            <button
                              type="button"
                              onClick={() => removeRec(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {recFields.filter(
                      (f: any) => f.categoryType === activeCategory,
                    ).length === 0 && (
                      <p className="text-center text-gray-400 text-sm italic py-4">
                        No hay lugares en esta categoría aún.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- TRANSPORT & EMERGENCY (Similar Logic) --- */}
            {activeTab === "transport" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Transporte</h3>
                    <p className="text-sm text-gray-500">Cómo moverse.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      appendTransport({
                        name: "",
                        type: "taxi",
                        description: "",
                      })
                    }
                    className="text-sm font-semibold text-blue-600 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Agregar Opción
                  </button>
                </div>
                <div className="space-y-4">
                  {transportFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border rounded-xl bg-gray-50 dark:bg-neutral-800/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <input
                          {...register(`transport.${index}.name` as const)}
                          placeholder="Proveedor (ej. Uber)"
                          className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                        />
                        <select
                          {...register(`transport.${index}.type` as const)}
                          className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                        >
                          <option value="taxi">Taxi / Uber</option>
                          <option value="bus">Autobús</option>
                          <option value="train">Tren</option>
                          <option value="rental">Alquiler</option>
                        </select>
                      </div>
                      <textarea
                        {...register(`transport.${index}.description` as const)}
                        placeholder="Detalles..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 resize-none h-20"
                      />
                      <button
                        type="button"
                        onClick={() => removeTransport(index)}
                        className="text-red-500 text-xs mt-2 underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  {transportFields.length === 0 && (
                    <p className="text-gray-400 italic text-sm">
                      No hay opciones de transporte agregadas.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Contactos de Emergencia
                    </h3>
                    <p className="text-sm text-gray-500">Números esenciales.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      appendContact({ name: "", phone: "", type: "other" })
                    }
                    className="text-sm font-semibold text-blue-600 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Contact
                  </button>
                </div>
                <div className="space-y-3">
                  {contactFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-4 p-3 bg-white dark:bg-neutral-900 border rounded-xl"
                    >
                      <input
                        {...register(
                          `emergencyContacts.${index}.name` as const,
                        )}
                        placeholder="Service Name"
                        className="flex-1 bg-transparent border-none outline-none font-semibold"
                      />
                      <input
                        {...register(
                          `emergencyContacts.${index}.phone` as const,
                        )}
                        placeholder="Phone Number"
                        className="w-32 text-right bg-transparent border-none outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {contactFields.length === 0 && (
                    <p className="text-gray-400 italic text-sm">
                      No contacts added.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
          </form>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-neutral-800 mt-8 absolute bottom-0 left-0 right-0 p-8 bg-white dark:bg-neutral-900 rounded-3xl relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving
            ? "Saving..."
            : isEditMode
              ? "Update Property"
              : "Save Property"}
        </button>
      </div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Success!</h3>
            <p className="text-gray-500 mb-6">
              Property has been successfully{" "}
              {isEditMode ? "updated" : "created"}.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
