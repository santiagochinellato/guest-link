"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Rocket,
  Loader2,
  CheckCircle2,
  Sparkles,
  Home,
  Wifi,
  MapPin,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty } from "@/lib/actions/properties";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Sections
import { BasicInfoSection } from "../properties/form-sections/BasicInfoSection";
import { LocationSection } from "../properties/form-sections/LocationSection";
import { WifiSection } from "../properties/form-sections/WifiSection";
import { EmergencySection } from "../properties/form-sections/EmergencySection";
import { RecommendationsSection } from "../properties/form-sections/RecommendationsSection";
import { FlyerSection } from "../properties/form-sections/FlyerSection";
import { AccessSection } from "../properties/form-sections/AccessSection";
import { RulesSection } from "../properties/form-sections/RulesSection";
import { TransportSection } from "../properties/form-sections/TransportSection";

// --- CONFIGURATION ---

type WizardStep = {
  id: string;
  title: string;
  subtitle?: string;
  category:
    | "Intro"
    | "General"
    | "Conectividad"
    | "Guía"
    | "Operativo"
    | "Final";
  fields: (keyof PropertyFormData)[];
};

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "intro",
    title: "Bienvenida",
    category: "Intro",
    fields: [],
  },
  {
    id: "identity",
    title: "Identidad",
    subtitle: "¿Cómo se llama tu alojamiento?",
    category: "General",
    fields: ["name", "slug", "coverImageUrl"],
  },
  {
    id: "location",
    title: "Ubicación",
    subtitle: "¿Dónde se encuentra?",
    category: "General",
    fields: ["address", "city", "country"],
  },
  {
    id: "wifi",
    title: "Conectividad",
    subtitle: "Facilita la conexión a internet",
    category: "Conectividad",
    fields: ["wifiSsid", "wifiPassword"],
  },
  {
    id: "recommendations",
    title: "Guía Local",
    subtitle: "Tus mejores recomendaciones",
    category: "Guía",
    fields: ["recommendations"],
  },
  {
    id: "transport",
    title: "Movilidad",
    subtitle: "Ayuda a tus huéspedes a moverse",
    category: "Guía",
    fields: ["transport"],
  },
  {
    id: "access",
    title: "Acceso",
    subtitle: "¿Cómo entran los huéspedes?",
    category: "Operativo",
    fields: ["accessSteps", "accessCode"],
  },
  {
    id: "rules",
    title: "Reglas",
    subtitle: "Normas de convivencia",
    category: "Operativo",
    fields: ["rulesAllowed", "rulesProhibited", "houseRules"],
  },
  {
    id: "emergency",
    title: "Emergencia",
    subtitle: "Contactos importantes",
    category: "Operativo",
    fields: ["emergencyContacts"],
  },
  {
    id: "flyer",
    title: "Flyer & Final",
    subtitle: "Tu guía está lista",
    category: "Final",
    fields: [],
  },
];

// --- COMPONENTS ---

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-[60vh] animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-brand-void/5 dark:bg-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-brand-copper/10">
        <Sparkles className="w-10 h-10 text-brand-copper animate-pulse" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-brand-void dark:text-white mb-6">
        Vamos a configurar <br /> tu propiedad
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg mb-10 leading-relaxed">
        En unos minutos tendrás una guía digital profesional lista para
        compartir con tus huéspedes.
      </p>
      <Button
        size="lg"
        onClick={onStart}
        className="rounded-full px-10 py-7 text-lg shadow-xl shadow-brand-copper/20 bg-brand-void hover:bg-brand-void/90 text-white dark:bg-white dark:text-brand-void transition-all hover:scale-105"
      >
        Comenzar configuración <ChevronRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
}

function TransitionScreen({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-copper/20 blur-xl rounded-full" />
          <Loader2 className="w-12 h-12 text-brand-copper animate-spin relative z-10" />
        </div>
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-medium text-brand-void dark:text-white"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}

// --- MAIN WIZARD COMPONENT ---

export function CreatePropertyWizard() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transition Logic
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      status: "active",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      wifiSsid: "",
      wifiPassword: "",
      wifiQrCode: "",
      recommendations: [],
      emergencyContacts: [],
      rulesAllowed: [],
      rulesProhibited: [],
      accessSteps: [],
      transport: [],
    },
    mode: "onChange",
  });

  const { trigger, handleSubmit, watch } = form;
  const currentStep = WIZARD_STEPS[currentStepIndex];

  // Helper: Detect category change for fake loading
  const handleStepChange = async (nextIndex: number) => {
    const nextStepConfig = WIZARD_STEPS[nextIndex];
    const currentCategory = currentStep.category;
    const nextCategory = nextStepConfig.category;

    // Logic: If moving forward AND changing category (except from Intro), show fake loader
    if (
      nextIndex > currentStepIndex &&
      currentCategory !== nextCategory &&
      currentCategory !== "Intro" &&
      nextCategory !== "Final"
    ) {
      setIsTransitioning(true);

      // Dynamic messages based on next category
      let msg = "Guardando progreso...";
      if (nextCategory === "Conectividad") msg = "Configurando red...";
      if (nextCategory === "Guía") msg = "Preparando recomendaciones...";
      if (nextCategory === "Operativo") msg = "Optimizando detalles...";

      setTransitionMessage(msg);

      // Fake delay
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentStepIndex(nextIndex);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1200);
    } else {
      // Normal transition
      setCurrentStepIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextStep = async () => {
    // 1. Validate current step fields
    const fieldsToValidate = currentStep.fields;
    let isValid = true;

    if (fieldsToValidate.length > 0) {
      isValid = await trigger(fieldsToValidate);
    }

    // Additional Validation for Recommendations (At least 1 item recommended but not enforced by schema strictness)
    if (currentStep.id === "recommendations") {
      // Could add custom check here if we wanted to enforce it
    }

    if (isValid) {
      setDirection(1);
      const nextIndex = Math.min(currentStepIndex + 1, WIZARD_STEPS.length - 1);
      handleStepChange(nextIndex);
    } else {
      toast.error("Por favor completa los campos requeridos.");
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      // Small artificial delay for the "Final" feeling
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = await createProperty(data);
      if (result.success) {
        toast.success("¡Propiedad creada con éxito!");
        router.push("/dashboard/properties");
        router.refresh();
      } else {
        toast.error(`Error al crear: ${result.error}`);
      }
    } catch (_) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER CONTENT BY ID ---
  const renderStepContent = () => {
    switch (currentStep.id) {
      case "intro":
        return <IntroView onStart={() => handleStepChange(1)} />;
      case "identity":
        return <BasicInfoSection />;
      case "location":
        return <LocationSection />;
      case "wifi":
        return <WifiSection />;
      case "recommendations":
        return <RecommendationsSection initialData={{}} />;
      case "transport":
        return <TransportSection />;
      case "access":
        return <AccessSection />;
      case "rules":
        return <RulesSection />;
      case "emergency":
        return <EmergencySection />;
      case "flyer":
        return <FlyerSection />;
      default:
        return null;
    }
  };

  // --- PROGRESS CALCULATION ---
  // We exclude Intro (index 0) from the progress bar math to make it feel like "Step 1 of 8" starts after intro
  const totalWorkSteps = WIZARD_STEPS.length - 1;
  const currentWorkStep = Math.max(0, currentStepIndex);
  const progressPercentage = (currentWorkStep / totalWorkSteps) * 100;

  // Variants for slide animation
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(5px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(5px)",
    }),
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-brand-copper/20">
      <FormProvider {...form}>
        <form
          className="flex flex-col min-h-screen"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* FAKE LOADER TRANSITION OVERLAY */}
          <AnimatePresence>
            {isTransitioning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60]" // Higher than sticky navs
              >
                <TransitionScreen message={transitionMessage} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* STICKY HEADER (Except on Intro) */}
          {currentStep.id !== "intro" && (
            <div className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300">
              <div className="max-w-2xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {currentStep.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {currentWorkStep} / {totalWorkSteps}
                  </span>
                </div>
                <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-void dark:bg-brand-copper"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-6 py-8 md:py-12 relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "anticipate" }}
                className="flex-1"
              >
                {/* Step Title (Except Intro/Flyer which have their own headers) */}
                {currentStep.id !== "intro" && currentStep.id !== "flyer" && (
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {currentStep.title}
                    </h2>
                    {currentStep.subtitle && (
                      <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-lg">
                        {currentStep.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Render Section */}
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* STICKY FOOTER ACTION BAR (Except on Intro) */}
          {currentStep.id !== "intro" && (
            <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 py-4 px-6">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={isSubmitting} // Can always go back unless submitting final
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                </Button>

                {currentStep.id === "flyer" ? (
                  <Button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    size="lg"
                    className="rounded-full px-8 bg-brand-void hover:bg-brand-void/90 text-white dark:bg-brand-copper dark:text-white shadow-xl shadow-brand-copper/10"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Rocket className="w-5 h-5 mr-2" />
                    )}
                    {isSubmitting ? "Lanzando..." : "Lanzar Propiedad"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    size="lg"
                    className="rounded-full px-8 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Continuar
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
