"use client";

import { useState } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  MapPin,
  Wifi,
  Sparkles,
  AlertCircle,
  Car,
  Star,
  Scroll,
  Rocket,
  Loader2,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import {
  BasicInfoSection,
  LocationSection,
  WifiSection,
  RecommendationsSection,
  TransportSection,
  EmergencySection,
  RulesSection,
  FlyerSection,
} from "./properties/form-sections";

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData> & {
    id?: number;
  };
  isEditMode?: boolean;
}

export function PropertyForm({
  initialData = {},
  isEditMode = false,
}: PropertyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "basic",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const { handleSubmit, setValue } = form;

  // Handle tab change with URL update
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
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

  // Manejador de errores de validación - muestra los campos con errores
  const onError = (errors: Record<string, unknown>) => {
    const errorFields = Object.keys(errors);
    const errorMessages = errorFields
      .map((field) => {
        const error = errors[field] as { message?: string };
        return `• ${field}: ${error?.message || "Campo inválido"}`;
      })
      .join("\n");

    alert(`Por favor corrige los siguientes campos:\n\n${errorMessages}`);
    console.error("Validation errors:", errors);
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/properties");
    router.refresh();
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
              handleSubmit(onSubmit, onError)();
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
              handleSubmit(onSubmit, onError)();
            }}
            disabled={isSaving}
            className="bg-brand-copper hover:bg-brand-copper/90 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-brand-copper/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
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
              onClick={() => handleTabChange(tab.id)}
              type="button"
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border dark:border-transparent flex-shrink-0",
                activeTab === tab.id
                  ? "bg-brand-copper/10 border-brand-copper/20 text-brand-copper"
                  : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800",
              )}
            >
              <tab.icon
                className={cn(
                  "w-4 h-4",
                  activeTab === tab.id ? "text-brand-copper" : "text-gray-500",
                )}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="lg:col-span-9">
          <FormProvider {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={cn(
                "bg-white dark:bg-neutral-900 p-4 md:p-8 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm relative",
                activeTab === "flyer"
                  ? ""
                  : "min-h-[600px] overflow-y-auto pr-2 custom-scrollbar",
              )}
            >
              {activeTab === "basic" && <BasicInfoSection />}
              {activeTab === "location" && <LocationSection />}
              {activeTab === "wifi" && <WifiSection />}
              {activeTab === "recommendations" && (
                <RecommendationsSection initialData={initialData} />
              )}
              {activeTab === "transport" && (
                <TransportSection
                  initialCity={initialData.city || ""}
                  propertyId={initialData.id}
                />
              )}
              {activeTab === "emergency" && <EmergencySection />}
              {activeTab === "rules" && <RulesSection />}

              {activeTab === "flyer" && <FlyerSection />}
            </form>
          </FormProvider>
        </div>
      </div>
      {/* Mobile Fixed Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 md:hidden z-30 flex gap-3 shadow-top">
        <button
          onClick={() => {
            setValue("status", "draft");
            handleSubmit(onSubmit, onError)();
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
            handleSubmit(onSubmit, onError)();
          }}
          disabled={isSaving}
          className="flex-1 bg-brand-copper hover:bg-brand-copper/90 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-brand-copper/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm"
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
