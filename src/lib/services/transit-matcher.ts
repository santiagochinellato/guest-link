import { db } from "@/db";
import { busStops, busLines, busRouteStops } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
// Importamos Google solo como complemento, no como fuente única
import { GoogleTransitService } from "./google-transit";

interface MatchResult {
  type: string;
  name: string; 
  scheduleInfo: string;
  description: string;
  distanceMeters: number;
  latitude: number;
  longitude: number;
  hasAttractions: boolean; // Flag interno para el ordenamiento
}

// Utilidad Haversine para calcular distancia en metros
function getDistM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // Radio de la tierra en metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findNearbyTransit(
  propertyLat: number,
  propertyLng: number,
  radiusMeters: number = 500 // Aumentamos radio para encontrar conectividad valiosa
): Promise<MatchResult[]> {
  
  // 1. Obtener TODAS las paradas locales de la DB
  // (Como son pocas -menos de 1000-, es más eficiente traerlas y filtrar en memoria
  // que hacer queries complejas geoespaciales si no usamos PostGIS)
  const allLocalStops = await db.select().from(busStops);

  // 2. Filtrar paradas cercanas (Capa de Proximidad)
  const nearbyStops = allLocalStops
    .map(stop => ({
      ...stop,
      dist: getDistM(propertyLat, propertyLng, Number(stop.latitude), Number(stop.longitude))
    }))
    .filter(stop => stop.dist <= radiusMeters);

  if (nearbyStops.length === 0) {
    return [];
  }

  const results: MatchResult[] = [];

  // 3. Para cada parada cercana, buscar qué líneas pasan (Capa de Conectividad)
  for (const stop of nearbyStops) {
    const routes = await db
      .select({
        lineNumber: busLines.lineNumber,
        name: busLines.name,
        attractions: busLines.mainAttractions,
        color: busLines.color
      })
      .from(busRouteStops)
      .innerJoin(busLines, eq(busRouteStops.lineId, busLines.id))
      .where(eq(busRouteStops.stopId, stop.id));

    if (routes.length > 0) {
      // 4. Analizar "Valor Turístico"
      // ¿Alguna de estas líneas lleva a una atracción clave?
      const importantLines = routes.filter(r => r.attractions && r.attractions.length > 0);
      const isStrategicStop = importantLines.length > 0;

      // Generar descripción rica
      // Priorizamos mostrar las líneas con atracciones primero
      const sortedRoutes = routes.sort((a, b) => {
        if (a.attractions && !b.attractions) return -1;
        if (!a.attractions && b.attractions) return 1;
        return 0;
      });

      // Formatear bullets: "• Línea 20: Llao Llao..."
      const descriptionBullets = sortedRoutes.map(r => {
        const dest = r.attractions ? r.attractions : r.name; // Si tiene atracciones, úsalas como destino
        return `• Línea ${r.lineNumber}: Va a ${dest}`;
      }).join(" ");

      // Nombre del Badge: Si hay muchas líneas, mostrar las principales o "Múltiples"
      // Si hay una línea "estrella" (ej 20 o 72), usar esa para el badge.
      let badgeName = `Línea ${sortedRoutes[0].lineNumber}`;
      const starLine = sortedRoutes.find(r => ["20", "72", "55", "10"].includes(r.lineNumber));
      if (starLine) {
          badgeName = `Línea ${starLine.lineNumber}`; 
          // Si hay varias, el frontend agregará el "+" visualmente
          if (routes.length > 1) badgeName += ", ..."; 
      }

      results.push({
        type: 'bus',
        name: badgeName, 
        scheduleInfo: `📍 Parada a ${Math.round(stop.dist)}m (${stop.name})`,
        description: descriptionBullets,
        distanceMeters: Math.round(stop.dist),
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        hasAttractions: isStrategicStop
      });
    }
  }

  // 5. Ordenamiento Inteligente (La clave de la UX)
  // Prioridad 1: Conectividad (Tiene atracciones)
  // Prioridad 2: Distancia
  return results.sort((a, b) => {
    if (a.hasAttractions && !b.hasAttractions) return -1; // A va primero
    if (!a.hasAttractions && b.hasAttractions) return 1;  // B va primero
    return a.distanceMeters - b.distanceMeters; // Si empatan en importancia, gana el más cerca
  });
}