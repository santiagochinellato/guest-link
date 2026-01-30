import { db } from "@/db";
import { busStops, busLines, busRouteStops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GoogleTransitService } from "./google-transit";

interface MatchResult {
  type: string;
  name: string; // The "Label" name (e.g. "Línea 20") - can be generic if multiple
  scheduleInfo: string; // "📍 Parada a Xm (Calle)"
  description: string; // "• Línea 20: Va a... • Línea 55: Va a..."
  distanceMeters: number;
  latitude: number;
  longitude: number;
}

// Haversine util (duplicated but kept for local logic independence if needed)
function getDistM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3;
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
  radiusMeters: number = 400
): Promise<MatchResult[]> {
  // 1. Get WHERE from Google (High Precision)
  const googleStops = await GoogleTransitService.getNearbyStops(
    propertyLat,
    propertyLng,
    radiusMeters
  );

  if (googleStops.length === 0) {
    // Optional: Fallback to purely local DB search if Google fails? 
    // For now, let's respect the user's request to use Google. 
    // We could implement a fallback here if aggressive reliability is needed.
    return [];
  }

  // 2. Fetch all local stops (The WHAT)
  // Optimization: In a large system we would use PostGIS ST_DWithin on the DB side.
  // Here we fetch all (assuming < 1000 stops) and filter in memory for simplicity.
  const localStops = await db.select().from(busStops);

  const results: MatchResult[] = [];

  for (const gStop of googleStops) {
    // 3. Match Google Stop -> Local Stop
    // Strategy: Find closest local stop within 80 meters.
    let bestLocalStop: typeof localStops[0] | null = null;
    let minLocalDist = Infinity;

    for (const lStop of localStops) {
      const d = getDistM(
        gStop.location.lat,
        gStop.location.lng,
        Number(lStop.latitude),
        Number(lStop.longitude)
      );
      if (d < 80 && d < minLocalDist) { // 80m threshold for "same stop"
        minLocalDist = d;
        bestLocalStop = lStop;
      }
    }

    // 3b. Fallback: Fuzzy Name Match (if no spatial match)
    // If 'gStop.name' contains 'San Martin', look for local stops with 'San Martin'
    if (!bestLocalStop) {
        // Simplistic fuzzy: check if name matches partially
        const normalizedGName = gStop.name.toLowerCase();
        for (const lStop of localStops) {
             if (lStop.name.toLowerCase().includes(normalizedGName) || normalizedGName.includes(lStop.name.toLowerCase())) {
                 // Double check distance isn't insane (e.g. < 500m from property)
                 // We already know gStop is close to property.
                 bestLocalStop = lStop;
                 break; 
             }
        }
    }

    // 4. If we found a corresponding local stop, get its lines
    if (bestLocalStop) {
        const routes = await db
        .select({
            lineNumber: busLines.lineNumber,
            name: busLines.name,
            attractions: busLines.mainAttractions,
        })
        .from(busRouteStops)
        .innerJoin(busLines, eq(busRouteStops.lineId, busLines.id))
        .where(eq(busRouteStops.stopId, bestLocalStop.id));

        if (routes.length > 0) {
            // Build the Enriched Format
            const dist = gStop.distanceMeters || 0;
            
            // Generate Bullet Points
            const descriptionBullets = routes.map(r => 
                `• Línea ${r.lineNumber}: ${r.name || 'Recorrido'} (${r.attractions || ''})`
            ).join(" ");
            
            results.push({
                type: 'bus',
                name: `Línea ${routes[0].lineNumber}`, // Primary line for Badge
                scheduleInfo: `📍 Parada a ${dist}m (${gStop.name})`,
                description: `${gStop.name} • ${descriptionBullets}`, 
                distanceMeters: dist,
                latitude: gStop.location.lat,
                longitude: gStop.location.lng,
            });
        }
    }
  }
  
  // Deduplicate results based on stop name similarity or very close distance
  // (Optional refinement)

  return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

