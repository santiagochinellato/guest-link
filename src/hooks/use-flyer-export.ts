"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseFlyerExportProps {
  propertyId?: number;
}

export function useFlyerExport({ propertyId }: UseFlyerExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (_type: "png" | "pdf" | "print") => {
    if (!propertyId) {
      toast.error("Guarda la propiedad antes de imprimir el flyer.");
      return;
    }

    setIsExporting(true);
    
    try {
      // Open the print page in a new tab
      // The print page will automatically trigger window.print()
      const url = `/flyer/${propertyId}/print`;
      window.open(url, "_blank");

    } catch (e) {
      console.error(e);
      toast.error("Error al abrir la página de impresión.");
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting };
}
