"use client";

import { useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Rocket, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty } from "@/lib/actions/properties";
import { cn } from "@/lib/utils";

// Sections
import { BasicInfoSection } from "../properties/form-sections/BasicInfoSection";
import { LocationSection } from "../properties/form-sections/LocationSection";
import { WifiSection } from "../properties/form-sections/WifiSection";
import { EmergencySection } from "../properties/form-sections/EmergencySection";
import { RecommendationsSection } from "../properties/form-sections/RecommendationsSection";
import { FlyerSection } from "../properties/form-sections/FlyerSection";

const STEPS = [
  {
    id: "identity",
    title: "Identidad",
    subtitle: "Comencemos con lo básico",
    fields: ["name", "address", "city", "country"] as const,
  },
  {
    id: "essentials",
    title: "Esenciales",
    subtitle: "Conectividad y seguridad",
    fields: ["wifiSsid", "emergencyContacts"] as const,
  },
  {
    id: "experience",
    title: "Experiencia",
    subtitle: "Recomendaciones y diseño",
    fields: [] as const, // Last step validatates everything or loose check
  },
];

export function CreatePropertyWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for next

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      status: "active", // Default active for wizard? Or draft?
      checkInTime: "15:00",
      checkOutTime: "11:00",
      wifiSsid: "",
      wifiPassword: "",
      wifiQrCode: "",
      recommendations: [],
      emergencyContacts: [],
      rulesAllowed: [],
      rulesProhibited: [],
    },
    mode: "onChange",
  });

  const { trigger, handleSubmit } = form;

  // Navigation Logic
  const nextStep = async () => {
    const stepConfig = STEPS[currentStep];

    // Validate fields for current step
    // We cast fields to string array to satisfy trigger
    const fieldsToValidate =
      stepConfig.fields as unknown as (keyof PropertyFormData)[];

    let isValid = true;

    // Only validate if we have specific fields to check
    if (fieldsToValidate.length > 0) {
      isValid = await trigger(fieldsToValidate);
    }

    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error(
        "Por favor completa los campos requeridos antes de continuar.",
      );
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    setIsSubmitting(true);
    try {
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

  // Animation Variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  // --- RENDER HELPERS ---

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-brand-void dark:text-white">
                ¿Cómo se llama tu alojamiento?
              </h2>
              <BasicInfoSection />
              {/* Note: BasicInfoSection includes more than just name. It works well. */}
            </section>
            <section>
              <div className="h-px bg-gray-100 dark:bg-neutral-800 w-full" />
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-6 text-brand-void dark:text-white">
                ¿Dónde se ubica tu propiedad?
              </h2>
              <LocationSection />
            </section>
          </div>
        );
      case 1:
        return (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-brand-void dark:text-white">
                Facilita la conexión
              </h2>
              <WifiSection />
            </section>
            <section>
              <div className="h-px bg-gray-100 dark:bg-neutral-800 w-full" />
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-6 text-brand-void dark:text-white">
                En caso de emergencia
              </h2>
              <EmergencySection />
            </section>
          </div>
        );
      case 2:
        // Experience: Recommendations + Flyer
        return (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-brand-void dark:text-white">
                Tus mejores recomendaciones
              </h2>
              <p className="text-gray-500 mb-6 -mt-4">
                Agrega lugares cercanos para tus huéspedes.
              </p>
              <RecommendationsSection initialData={{}} />
            </section>
            <section>
              <div className="h-px bg-gray-100 dark:bg-neutral-800 w-full" />
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-6 text-brand-void dark:text-white">
                Así lo verán tus huéspedes
              </h2>
              <FlyerSection />
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 md:p-12 flex flex-col items-center">
      {/* PROGRESS BAR */}
      <div className="w-full max-w-5xl mb-12">
        <div className="flex items-center justify-between text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
          <span>
            Paso {currentStep + 1} de {STEPS.length}
          </span>
          <span>{STEPS[currentStep].title}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-copper to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="w-full max-w-5xl flex-1 flex flex-col">
        <FormProvider {...form}>
          <form className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, type: "tween" }}
                  className="w-full"
                >
                  {renderStepContent(currentStep)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between sticky bottom-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl py-6 -mx-6 px-6 md:mx-0 md:px-0 z-20">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                  currentStep === 0
                    ? "opacity-0 pointer-events-none"
                    : "hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300",
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Atrás</span>
              </button>

              {currentStep === STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-void dark:bg-brand-copper text-white rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Rocket className="w-5 h-5" />
                  )}
                  <span>
                    {isSubmitting ? "Creando..." : "Lanzar Propiedad"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-void dark:bg-white dark:text-black text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
