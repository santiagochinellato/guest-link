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
  description?: string;
  tips?: string[];
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
    title: "Información de la propiedad",
    subtitle: "La primera impresión de tu alojamiento",
    description:
      "Define el nombre, la URL pública y la imagen de portada que verán tus huéspedes antes de llegar.",
    tips: [
      "Pon un nombre claro y memorable para el alojamiento",
      "El slug genera la URL que compartirás con tus huéspedes",
      "La imagen de portada es lo primero que verán al abrir la guía",
    ],
    category: "General",
    fields: ["name", "slug", "coverImageUrl"],
  },
  {
    id: "location",
    title: "Ubicación",
    subtitle: "Que lleguen sin llamarte",
    description:
      "Busca la dirección en Google Maps y confirma los datos. Tus huéspedes verán el mapa directamente en la guía.",
    tips: [
      "Busca la dirección con el autocompletado para mayor precisión",
      "La ciudad y el país se rellenan solos al seleccionar",
      "El mapa aparecerá en la guía del huésped con un pin exacto",
    ],
    category: "General",
    fields: ["address", "city", "country"],
  },
  {
    id: "wifi",
    title: "Conectividad",
    subtitle: "Conexión sin fricciones desde el primer minuto",
    description:
      "Tus huéspedes podrán conectarse al instante. Generamos un QR para que no tengan que escribir la contraseña.",
    tips: [
      "Escribe la red exactamente como aparece en el router",
      "La contraseña queda oculta y el huésped la puede revelar",
      "El QR se genera automáticamente para escanear y conectar",
    ],
    category: "Conectividad",
    fields: ["wifiSsid", "wifiPassword"],
  },
  {
    id: "recommendations",
    title: "Guía Local",
    subtitle: "Tus mejores recomendaciones, en su bolsillo",
    description:
      "Recomienda los lugares que tú usarías. Una guía personal marca la diferencia entre una estancia buena y una memorable.",
    tips: [
      "Agrupa por categorías: desayuno, cena, actividades…",
      "Añade el horario y la ubicación de cada lugar",
      "Las valoraciones dan confianza al huésped",
    ],
    category: "Guía",
    fields: ["recommendations"],
  },
  {
    id: "transport",
    title: "Movilidad",
    subtitle: "Que se muevan sin perderse",
    description:
      "Indica paradas de bus, metro o cómo llegar desde el aeropuerto. Menos preguntas para ti, más autonomía para ellos.",
    tips: [
      "Indica el bus o metro más cercano al alojamiento",
      "Explica cómo llegar desde el aeropuerto o la estación",
      "Añade apps de taxi o ridesharing que uses en la ciudad",
    ],
    category: "Guía",
    fields: ["transport"],
  },
  {
    id: "access",
    title: "Acceso",
    subtitle: "Entrar sin llamarte a las 11 de la noche",
    description:
      "Instrucciones paso a paso para que el check-in sea fluido. Código de cerradura, llaves físicas o caja de seguridad.",
    tips: [
      "Detalla cada paso para entrar al edificio y al piso",
      "Si hay código de acceso, indícalo aquí de forma segura",
      "Explica dónde dejar las llaves al hacer el check-out",
    ],
    category: "Operativo",
    fields: ["accessSteps", "accessCode"],
  },
  {
    id: "rules",
    title: "Reglas",
    subtitle: "Convivencia sin malentendidos",
    description:
      "Lo que está permitido y lo que no. Cuanto más claro seas aquí, menos incidencias tendrás durante la estancia.",
    tips: [
      "Especifica los horarios de silencio o de entrada de visitas",
      "Indica si se admiten mascotas, niños o fumadores",
      "Explica las normas de limpieza y separación de basura",
    ],
    category: "Operativo",
    fields: ["rulesAllowed", "rulesProhibited", "houseRules"],
  },
  {
    id: "emergency",
    title: "Emergencia",
    subtitle: "Que siempre tengan a alguien a quien llamar",
    description:
      "Tu número, un contacto de respaldo y los servicios de urgencia de la zona. Pequeño detalle, gran tranquilidad.",
    tips: [
      "Añade tu número directo para cualquier imprevisto",
      "Un contacto de respaldo es clave si no estás disponible",
      "Incluye el número de urgencias de la ciudad o vecindario",
    ],
    category: "Operativo",
    fields: ["emergencyContacts"],
  },
  {
    id: "flyer",
    title: "¡Todo listo!",
    subtitle: "Personaliza tu flyer antes de lanzar",
    description:
      "Antes de publicar, puedes ajustar el diseño del flyer imprimible que los huéspedes escanearán. Despliega cada sección para editar:",
    tips: [
      "Diseño & Layout: elige la plantilla, orientación y tipografía",
      "Contenido: edita el título, el mensaje de bienvenida y la URL del QR",
      "Branding: cambia el logo, los colores y el estilo del código QR",
    ],
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
      if (result.success && result.data?.id) {
        toast.success("¡Propiedad creada con éxito!");
        // Clear storage on success
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STEP_KEY);
        setCreatedPropertyId(result.data.id);
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
