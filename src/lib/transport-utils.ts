// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const explodeMultiLineSuggestion = (suggestion: any) => {
  const rawDesc = suggestion.description || "";

  // Caso 1: Si no tiene el separador de viñeta, retornamos tal cual (limpiando un poco)
  if (!rawDesc.includes("•")) {
    return [
      {
        ...suggestion,
        // Si el nombre es genérico "Colectivo", intentamos ver si en la descripción dice "Línea X"
        name: (() => {
          // 1. Try to clean "Línea" from the name first
          const cleanName = suggestion.name.replace(/Línea\s*/i, "").trim();
          // 2. Check if the clean name is just a number (or valid short code)
          const parsed = parseLineNumber(cleanName);
          // 3. Implied: if parsed is "?", maybe name was "Colectivo", so try extracting from desc
          if (parsed === "?" && rawDesc.includes("Línea")) {
            return rawDesc.match(/Línea (\d+)/)?.[1] || cleanName;
          }
          return cleanName;
        })(),
        scheduleInfo: cleanAddress(suggestion.scheduleInfo, rawDesc),
        description: rawDesc.replace("📍", "").trim(),
      },
    ];
  }

  // Caso 2: Tiene múltiples líneas (El caso de San Martín 400)
  // Formato esperado: "📍 Parada... • Línea 20: Va a... • Línea 72: Va a..."
  const parts = rawDesc
    .split("•")
    .map((p: string) => p.trim())
    .filter(Boolean);

  // La primera parte suele ser la ubicación de la parada
  const locationPart = parts[0];
  const cleanLoc = cleanAddress(suggestion.scheduleInfo, locationPart);

  // Las partes siguientes son las líneas individuales
  const lines = parts.slice(1);

  return lines.map((lineStr: string) => {
    // lineStr ejemplo: "Línea 20: Va a Llao Llao, Puerto Pañuelo"
    // Separamos el Nombre (Línea 20) de la Descripción (Va a...)
    const separatorIndex = lineStr.indexOf(":");
    let name = "Bus";
    let desc = lineStr;

    if (separatorIndex !== -1) {
      name = lineStr.substring(0, separatorIndex).replace("Línea", "").trim(); // "20"
      desc = lineStr.substring(separatorIndex + 1).trim(); // "Va a Llao Llao..."
    } else {
      // Si no hay dos puntos, asumimos que todo es el nombre o descripción
      if (lineStr.includes("Línea")) name = lineStr.replace("Línea", "").trim();
    }

    return {
      ...suggestion,
      name: name, // Ahora cada tarjeta tendrá su nombre correcto "Línea 20", "Línea 72"
      description: desc, // Solo el destino relevante
      scheduleInfo: cleanLoc, // La dirección limpia compartida
      type: suggestion.type || "bus",
      isActive: true,
    };
  });
};

export const parseLineNumber = (rawName: string) => {
  if (!rawName) return "?";
  const match = rawName.match(/(\d+)/);
  return match ? match[0] : rawName.charAt(0).toUpperCase();
};

export const cleanAddress = (scheduleInfo: string, description: string) => {
  // Prioridad 1: Texto entre paréntesis (Suele ser la calle real)
  const addressMatch = description?.match(/\((.*?)\)/);
  // Evitar capturar "(Plaza Belgrano)" si tenemos una dirección antes
  // Buscamos algo que parezca dirección con números
  if (addressMatch && /\d/.test(addressMatch[1])) return addressMatch[1];

  // Prioridad 2: Limpiar el string de "📍 Parada a Xm"
  if (description?.includes("📍")) {
    return description.split("•")[0].replace("📍", "").trim();
  }

  // Fallback
  return scheduleInfo || "Parada cercana";
};
