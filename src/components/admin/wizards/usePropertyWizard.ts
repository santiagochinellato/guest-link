"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas";
import { createProperty } from "@/lib/actions/properties";

// --- CONFIGURATION ---

export type WizardStep = {
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

export const WIZARD_STEPS: WizardStep[] = [
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

export function usePropertyWizard() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(
    null,
  );

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

  const { trigger, watch } = form;
  const currentStep = WIZARD_STEPS[currentStepIndex];

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- PERSISTENCE LOGIC ---
  const STORAGE_KEY = "wizard_property_data";
  const STEP_KEY = "wizard_current_step";

  // 1. Load from storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STEP_KEY);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Reset form with merged defaults and saved data
        form.reset({ ...form.getValues(), ...parsed });
      } catch (e) {
        console.error("Failed to parse saved wizard data", e);
      }
    }

    if (savedStep) {
      setCurrentStepIndex(parseInt(savedStep, 10));
    }
  }, [form]);

  // 2. Save to storage on change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // 3. Save step on change
  useEffect(() => {
    localStorage.setItem(STEP_KEY, currentStepIndex.toString());
  }, [currentStepIndex]);

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

    // Additional Validation for Recommendations
    if (currentStep.id === "recommendations") {
      // Could add custom check here
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
      if (result.success && result.id) {
        toast.success("¡Propiedad creada con éxito!");
        // Clear storage on success
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STEP_KEY);
        setCreatedPropertyId(result.id);
      } else {
        toast.error(`Error al crear: ${result.error}`);
      }
    } catch {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
