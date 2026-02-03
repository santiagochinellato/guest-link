"use client";

import { FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Rocket,
  Loader2,
  CheckCircle2,
  Sparkles,
  Home,
} from "lucide-react";
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

// Hook & Constants
import { usePropertyWizard, WIZARD_STEPS } from "./usePropertyWizard";

// --- SUB-COMPONENTS ---

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
        className="rounded-full px-10 py-7 text-lg shadow-xl shadow-brand-copper/20 bg-brand-void hover:bg-brand-void/90 text-white dark:bg-white dark:text-brand-void transition-all hover:scale-105 text-md md:text-lg"
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
  const {
    form,
    currentStepIndex,
    direction,
    isSubmitting,
    createdPropertyId,
    isTransitioning,
    transitionMessage,
    currentStep,
    nextStep,
    prevStep,
    handleStepChange,
    onSubmit,
    router,
  } = usePropertyWizard();

  const { handleSubmit } = form;

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

          {/* SUCCESS OVERLAY */}
          <AnimatePresence>
            {createdPropertyId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-xl p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ¡Propiedad lanzada!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Tu propiedad ha sido creada y publicada correctamente.
                      ¿Qué te gustaría hacer ahora?
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      size="lg"
                      className="w-full rounded-xl bg-brand-void hover:bg-brand-void/90 text-white dark:bg-brand-copper dark:text-white shadow-xl"
                      onClick={() =>
                        window.open(
                          `/flyer/${createdPropertyId}/print`,
                          "_blank",
                        )
                      }
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Imprimir Flyer QR
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-xl"
                      onClick={() => {
                        router.push("/dashboard/properties");
                        router.refresh();
                      }}
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Ir al Panel de control
                    </Button>
                  </div>
                </motion.div>
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
          <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 relative">
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
