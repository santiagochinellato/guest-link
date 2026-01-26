"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutoFillButton } from "@/components/admin/auto-fill-button";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
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
  QrCode,
  User,
  Utensils,
  Camera,
  ShoppingBag,
  Mountain,
  Baby,
  Beer,
  ChevronDown,
  Tag,
  PlusCircle,
  Scroll,
  Rocket,
} from "lucide-react";
import { QrFlyerBuilder } from "@/components/admin/qr-flyer-builder";
import { cn } from "@/lib/utils";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { fetchNearbyPlaces } from "@/lib/actions/overpass";
import { AddressAutocomplete, AddressResult } from "./address-autocomplete";
import { toast } from "sonner"; // Use correct toaster

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData> & { id?: number };
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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Default Categories Configuration
  const defaultCategories = [
    {
      id: "restaurants",
      label: "Restaurantes",
      icon: Utensils,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-500",
    },
    {
      id: "sights",
      label: "Turismo",
      icon: Camera,
      color: "text-purple-600",
      bg: "bg-purple-50/50",
      border: "border-purple-500",
    },
    {
      id: "shopping",
      label: "Compras",
      icon: ShoppingBag,
      color: "text-pink-600",
      bg: "bg-pink-50/50",
      border: "border-pink-500",
    },
    {
      id: "trails",
      label: "Senderos",
      icon: Mountain,
      color: "text-green-600",
      bg: "bg-green-50/50",
      border: "border-green-500",
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
  ];

  const [categoriesList, setCategoriesList] = useState(defaultCategories);

  // Initialize categories with custom ones found in data
  useEffect(() => {
    if (initialData.recommendations) {
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
          // Avoid duplicates if effect runs twice
          const currentIds = new Set(prev.map((p) => p.id));
          const uniqueToAdd = newCustomCats.filter(
            (c) => !currentIds.has(c.id),
          );
          return [...prev, ...uniqueToAdd];
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.recommendations]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = newCategoryName.toLowerCase().trim().replace(/\s+/g, "_");

    // Check if exists
    if (categoriesList.find((c) => c.id === id)) {
      alert("Esta categoría ya existe.");
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
  };

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
      houseRules: initialData.houseRules || "",
      rulesAllowed: initialData.rulesAllowed || [],
      rulesProhibited: initialData.rulesProhibited || [],
      status: (initialData.status as PropertyFormData["status"]) || "draft",
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

  const {
    fields: allowedFields,
    append: appendAllowed,
    remove: removeAllowed,
  } = useFieldArray({
    control,
    name: "rulesAllowed",
  });

  const {
    fields: prohibitedFields,
    append: appendProhibited,
    remove: removeProhibited,
  } = useFieldArray({
    control,
    name: "rulesProhibited",
  });

  // Watchers
  const watchName = watch("name");
  const watchCoverImage = watch("coverImageUrl");
  const hostImageUrl = watch("hostImage");

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

  const handleFileUpload =
    (field: "coverImageUrl" | "hostImage") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
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
    } catch (e) {
      alert(
        "Ocurrió un error: " +
          (e instanceof Error ? e.message : "Error desconocido"),
      );
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
    { id: "rules", label: "Reglas", icon: Scroll },
    { id: "emergency", label: "Emergencia", icon: AlertCircle },
    { id: "flyer", label: "Diseño QR Flyer", icon: QrCode },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div className="flex items-center gap-4">
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

        {/* Save Buttons (Desktop Header) */}
        <div className="hidden md:flex gap-3">
          <button
            type="button"
            onClick={() => {
              setValue("status", "draft");
              handleSubmit(onSubmit)();
            }}
            disabled={isSaving}
            className="bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span className="whitespace-nowrap">Guardar Borrador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("status", "active");
              handleSubmit(onSubmit)();
            }}
            disabled={isSaving}
            className="bg-[#0f756d] hover:bg-[#0a554f] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-[#0f756d]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            <span className="whitespace-nowrap">
              {isSaving ? "Guardando..." : "Aplicar Cambios"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Layout - Single Column with Horizontal Tabs */}
      <div className="flex flex-col gap-6 pb-40 md:pb-0">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 no-scrollbar border-b border-gray-100 dark:border-neutral-800 md:justify-center">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border dark:border-transparent flex-shrink-0",
                activeTab === tab.id
                  ? "bg-[#0f756d]/10 border-[#0f756d]/20 text-[#0f756d]"
                  : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800",
              )}
            >
              <tab.icon
                className={cn(
                  "w-4 h-4",
                  activeTab === tab.id ? "text-[#0f756d]" : "text-gray-500",
                )}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="lg:col-span-9">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn(
              "bg-white dark:bg-neutral-900 p-4 md:p-8 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm relative",
              activeTab === "flyer"
                ? ""
                : "min-h-[600px] overflow-y-auto pr-2 custom-scrollbar",
            )}
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
                              <Clock className="w-4 h-4 text-blue-500" />{" "}
                              Check-in
                            </label>
                            <input
                              type="time"
                              {...register("checkInTime")}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="w-full">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-orange-500" />{" "}
                              Check-out
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
                                Si se completa, aparecerá un botón de contacto
                                directo en &quot;Ayuda&quot;.
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* --- MOBILE ACCORDION LIST --- */}
                <div className="md:hidden space-y-3 mb-6">
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === cat.id ? "" : cat.id,
                          )
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
                          {/* Actions */}
                          <div className="flex flex-col gap-3 mb-4">
                            <button
                              type="button"
                              onClick={handleAutoFill}
                              disabled={isLoadingAuto}
                              className="w-full relative px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 overflow-hidden"
                            >
                              {isLoadingAuto ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              <span>Autocompletar con IA</span>
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
                              className="w-full px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Agregar Lugar
                            </button>
                          </div>

                          {/* List */}
                          <div className="space-y-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {recFields.map((field: any, index) => {
                              if (field.categoryType !== activeCategory)
                                return null;
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
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 relative overflow-hidden group",
                        activeCategory === cat.id
                          ? `${cat.border} ${cat.bg} dark:bg-opacity-10 dark:border-opacity-50`
                          : "border-gray-200 dark:border-neutral-800",
                      )}
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
                            activeCategory === cat.id
                              ? cat.color
                              : "text-gray-500",
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
                      <span className="text-xs font-semibold">
                        Nueva Categoría
                      </span>
                    </button>
                  )}
                </div>

                <div className="hidden md:block bg-gray-50 dark:bg-neutral-800/20 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-neutral-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h4 className="font-semibold capitalize flex items-center gap-2">
                      {/* Show active category icon and label */}
                      {(() => {
                        const cat = categoriesList.find(
                          (c) => c.id === activeCategory,
                        );
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
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={isLoadingAuto}
                        className="group relative px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 overflow-hidden flex-shrink-0"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {isLoadingAuto ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>Autocompletar con IA</span>
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
                          <div className="md:col-span-4 pr-6 md:pr-0">
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
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {recFields.filter((f) => f.categoryType === activeCategory)
                      .length === 0 && (
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
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex flex-col md:flex-row justify-between gap-4 md:items-center">
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
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 flex flex-col md:flex-row justify-between gap-4 md:items-center">
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
                      className="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-white dark:bg-neutral-900 border rounded-xl"
                    >
                      <input
                        {...register(
                          `emergencyContacts.${index}.name` as const,
                        )}
                        placeholder="Service Name"
                        className="flex-1 bg-transparent border-b md:border-none border-gray-100 dark:border-neutral-800 pb-2 md:pb-0 outline-none font-semibold"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          {...register(
                            `emergencyContacts.${index}.phone` as const,
                          )}
                          placeholder="Phone Number"
                          className="flex-1 md:w-32 text-left md:text-right bg-transparent border-none outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

            {activeTab === "rules" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold">Reglas de la Casa</h3>
                  <p className="text-sm text-gray-500">
                    Establece expectativas, permisos y prohibiciones.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Descripción General
                  </label>
                  <textarea
                    {...register("houseRules")}
                    placeholder="Ej. Bienvenidos a nuestra casa. Por favor siéntanse cómodos..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-transparent outline-none focus:border-blue-500 h-32 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Allowed List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Se
                        Permite (Info)
                      </label>
                      <button
                        type="button"
                        onClick={() => appendAllowed({ value: "" })}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-blue-600"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {allowedFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            {...register(
                              `rulesAllowed.${index}.value` as const,
                            )}
                            placeholder="Ej. Mascotas bienvenidas"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-transparent text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeAllowed(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {allowedFields.length === 0 && (
                        <p className="text-xs text-gray-400 italic">
                          No hay items permitidos.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Prohibited List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" /> Prohibido
                      </label>
                      <button
                        type="button"
                        onClick={() => appendProhibited({ value: "" })}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-blue-600"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {prohibitedFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            {...register(
                              `rulesProhibited.${index}.value` as const,
                            )}
                            placeholder="Ej. No fumar"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-transparent text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeProhibited(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {prohibitedFields.length === 0 && (
                        <p className="text-xs text-gray-400 italic">
                          No hay prohibiciones.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {activeTab === "flyer" && (
              <div className="animate-in fade-in duration-300 h-full">
                <div className="border-b border-gray-100 dark:border-neutral-800 pb-4 mb-6">
                  <h3 className="text-xl font-semibold">Diseñador de Flyers</h3>
                  <p className="text-sm text-gray-500">
                    Crea y descarga posters listos para imprimir.
                  </p>
                </div>
                <QrFlyerBuilder initialData={form.getValues()} />
              </div>
            )}
          </form>
        </div>
      </div>
      {/* Mobile Fixed Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 md:hidden z-30 flex gap-3 shadow-top">
        <button
          onClick={() => {
            setValue("status", "draft");
            handleSubmit(onSubmit)();
          }}
          disabled={isSaving}
          className="flex-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm"
        >
          <Save className="w-5 h-5" />
          <span>Borrador</span>
        </button>

        <button
          onClick={() => {
            setValue("status", "active");
            handleSubmit(onSubmit)();
          }}
          disabled={isSaving}
          className="flex-1 bg-[#0f756d] hover:bg-[#0a554f] text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-[#0f756d]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Rocket className="w-5 h-5" />
          )}
          <span>{isSaving ? "..." : "Aplicar"}</span>
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">¡Éxito!</h3>
            <p className="text-gray-500 mb-6">
              La propiedad se ha {isEditMode ? "actualizado" : "creado"}{" "}
              correctamente.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
