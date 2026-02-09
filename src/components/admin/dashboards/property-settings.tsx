"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { AccessSection } from "../properties/form-sections/AccessSection";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Wifi,
  Sparkles,
  AlertCircle,
  Car,
  Scroll,
  Settings,
  Globe,
  Loader2,
  Save,
  ArrowLeft,
  Check,
  Key,
  Menu,
  Zap,
  Calendar,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { updateProperty } from "@/lib/actions/properties";
import { toast } from "sonner";

// Sections
import { BasicInfoSection } from "../properties/form-sections/BasicInfoSection";
import { LocationSection } from "../properties/form-sections/LocationSection";
import { WifiSection } from "../properties/form-sections/WifiSection";
import { RecommendationsSection } from "../properties/form-sections/RecommendationsSection";
import { TransportSection } from "../properties/form-sections/TransportSection";
import { RulesSection } from "../properties/form-sections/RulesSection";
import { EmergencySection } from "../properties/form-sections/EmergencySection";
import { FlyerSection } from "../properties/form-sections/FlyerSection";
import { AutomationSection } from "../properties/form-sections/AutomationSection";
import { PreCheckInSection } from "../properties/form-sections/PreCheckInSection";

interface PropertySettingsProps {
  initialData: Partial<PropertyFormData> & { id: number };
}

const SETTINGS_TABS = [
  {
    category: "General",
    items: [
      {
        id: "general",
        label: "Información Básica",
        icon: Settings,
        component: BasicInfoSection,
      },
      {
        id: "location",
        label: "Ubicación",
        icon: MapPin,
        component: LocationSection,
      },
    ],
  },
  {
    category: "Conectividad",
    items: [
      { id: "wifi", label: "WiFi & QR", icon: Wifi, component: WifiSection },
      // Flyer can go here as it's related to access
      {
        id: "flyer",
        label: "Flyer & Diseño",
        icon: Globe,
        component: FlyerSection,
      },
    ],
  },
  {
    category: "Guía del Huésped",
    items: [
      {
        id: "recommendations",
        label: "Recomendaciones",
        icon: Sparkles,
        component: RecommendationsSection,
      },
      {
        id: "transport",
        label: "Transporte",
        icon: Car,
        component: TransportSection,
      },
    ],
  },
  {
    category: "Operativo",
    items: [
      {
        id: "automations",
        label: "Automatizaciones",
        icon: Zap,
        component: AutomationSection,
      },
      {
        id: "access",
        label: "Llegada & Acceso",
        icon: Key,
        component: AccessSection,
      },
      {
        id: "pre-checkin",
        label: "Pre Check-in",
        icon: Calendar,
        component: PreCheckInSection,
      },
      {
        id: "rules",
        label: "Reglas de Casa",
        icon: Scroll,
        component: RulesSection,
      },
      {
        id: "emergency",
        label: "Emergencia",
        icon: AlertCircle,
        component: EmergencySection,
      },
    ],
  },
];

export function PropertySettings({ initialData }: PropertySettingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "general",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Deep linking for tabs
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      ...initialData,
      status: (initialData.status as PropertyFormData["status"]) || "draft",
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isDirty },
    reset,
  } = form;

  const watchedData = watch();
  const debouncedData = useDebounce(watchedData, 2000);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save effect
  useEffect(() => {
    const autoSave = async () => {
      // Only save if dirty and not already saving
      // We check against initialData or just rely on isDirty from RHF
      if (!isDirty || isSaving || isAutoSaving) return;

      setIsAutoSaving(true);
      try {
        // We use a silent update (prevent toast spam)
        const res = await updateProperty(initialData.id, debouncedData);
        if (res.success) {
          setLastSaved(new Date());
          // Optional: Reset dirty state with new data so we don't save again immediately
          // unless user keeps typing.
          // reset(debouncedData); // This might cause UI re-render issues or cursor jumps?
          // Usually better to just keep it dirty until manual save?
          // "Auto-save" usually implies we sync state.
          // For now, let's strictly save what we have.

          // IMPORTANT: We do NOT call reset() here.
          // Calling reset() (even with keepValues) triggers a re-render of useFieldArray
          // components because it updates defaultValues, regenerating internal field IDs.
          // This causes loss of focus/cursor in dynamic lists like "Access Steps".
          // We accept that isDirty will remain true and the manual Save button stays enabled,
          // which actually aligns better with "invisible" auto-save (no UI flashing).
          // reset(undefined, { keepValues: true });
        }
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setIsAutoSaving(false);
      }
    };

    if (isDirty) {
      autoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedData]); // Trigger when debounced data changes

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    setIsSaving(true);
    try {
      const res = await updateProperty(initialData.id, data);
      if (res.success) {
        toast.success("Cambios guardados correctamente");
        reset(data); // Sync state
        router.refresh();
      } else {
        toast.error(`Error al guardar: ${res.error}`);
      }
    } catch {
      toast.error("Error inesperado al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  // Find active component
  const ActiveComponent =
    SETTINGS_TABS.flatMap((cat) => cat.items).find(
      (item) => item.id === activeTab,
    )?.component || (BasicInfoSection as any);

  // This sidebar is REMOVED because it's now handled by the layout.
  // We make the internal property navigation responsive:
  // Mobile: Horizontal Scrollable Tabs.
  // Desktop: Sidebar + Content.

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 dark:bg-black font-sans min-h-full">
      {/* INTERNAL NAVIGATION - Desktop: Sidebar, Mobile: Horizontal Tabs */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-black flex-shrink-0 flex flex-col z-10 lg:min-h-[calc(100vh-4rem)]">
        {/* Sidebar Header - Hidden on Mobile to save space, or kept compact */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 lg:block hidden">
          <button
            onClick={() => router.push("/dashboard/properties")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <h1 className="font-bold text-lg truncate px-1">
            {initialData.name || "Configuración"}
          </h1>
          <div className="px-1 h-4">
            {isSaving ? (
              <span className="text-xs text-brand-copper animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
              </span>
            ) : isAutoSaving ? (
              <span className="text-xs text-gray-400 animate-pulse flex items-center gap-1 opacity-50">
                <Loader2 className="w-3 h-3 animate-spin" /> Auto-guardado...
              </span>
            ) : lastSaved ? (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Guardado{" "}
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : null}
          </div>
        </div>

        {/* Navigation - Vertical on Desktop, Sheet Button on Mobile */}
        {/* Made sticky top-0 so it stays visible while scrolling */}
        <div className="lg:hidden sticky top-0 z-30 bg-gray-50 dark:bg-black p-4 border-b border-gray-100 dark:border-neutral-800 transition-all">
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm active:scale-[0.98] transition-all">
                <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Menu className="w-4 h-4 text-brand-copper" />
                  {SETTINGS_TABS.flatMap((c) => c.items).find(
                    (i) => i.id === activeTab,
                  )?.label || "Menu"}
                </span>
                <span className="text-xs text-brand-copper font-medium">
                  Cambiar
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[80vh] rounded-t-[20px] p-0 flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
                <SheetTitle className="text-lg font-bold text-center">
                  Secciones
                </SheetTitle>
                <SheetDescription className="text-center text-xs text-gray-500">
                  Selecciona una sección para editar
                </SheetDescription>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                {SETTINGS_TABS.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3 px-2">
                      {category.category}
                    </h3>
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <SheetTrigger key={item.id} asChild>
                          <button
                            onClick={() => handleTabChange(item.id)}
                            className={cn(
                              "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                              activeTab === item.id
                                ? "bg-brand-void text-white dark:bg-brand-copper dark:text-white shadow-md"
                                : "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-neutral-900/50 hover:bg-gray-100 dark:hover:bg-neutral-800",
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </button>
                        </SheetTrigger>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <nav className="hidden lg:flex flex-1 p-4 flex-col gap-8 items-stretch whitespace-nowrap sticky top-0">
          {SETTINGS_TABS.map((category) => (
            <div key={category.category} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-2">
                {category.category}
              </h3>
              <div className="flex flex-col gap-1">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      activeTab === item.id
                        ? "bg-brand-void text-white dark:bg-brand-copper dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer info - Desktop Only */}
        <div className="p-4 text-xs text-gray-400 border-t border-gray-100 dark:border-neutral-800 text-center lg:block hidden">
          ID: {initialData.id} • v1.0
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative">
        {/* Form Area - Allow it to grow naturally */}
        <div className="flex-1 p-4 md:p-8 lg:p-12 pb-48">
          <div className="max-w-6xl mx-auto">
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                id="settings-form"
                className="space-y-8"
              >
                <div
                  key={activeTab}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  {/* We pass initialData to sections that need it specifically like Recommendations */}
                  {activeTab === "recommendations" ? (
                    <RecommendationsSection initialData={initialData} />
                  ) : activeTab === "transport" ? (
                    <TransportSection
                      initialCity={initialData.city || ""}
                      propertyId={initialData.id}
                    />
                  ) : activeTab === "flyer" ? (
                    <FlyerSection propertyId={initialData.id} />
                  ) : activeTab === "automations" ? (
                    <AutomationSection />
                  ) : (
                    <ActiveComponent />
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Floating Save Action Bar */}
        {/* Mobile: Fixed Bottom Bar. Desktop: Floating Pill */}
        <div
          className={cn(
            "z-20",
            "lg:sticky lg:bottom-6 lg:self-end lg:mr-6 lg:w-auto", // Desktop: Sticky Pill
            "fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-black border-t border-gray-100 dark:border-neutral-800 lg:bg-transparent lg:border-none", // Mobile
          )}
        >
          <button
            type="submit"
            form="settings-form"
            disabled={isSaving}
            className={cn(
              "w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl lg:rounded-full font-bold shadow-none lg:shadow-xl transition-all active:scale-95", // Mobile: Full width, Desktop: Pill
              "bg-brand-void dark:bg-brand-copper text-white hover:opacity-90 ring-2 ring-offset-2 ring-brand-copper dark:ring-offset-black",
              isDirty
                ? ""
                : "border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 bg-white dark:bg-transparent text-gray-900 dark:text-gray-300 shadow-none lg:shadow-sm", // Not dirty styling
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
