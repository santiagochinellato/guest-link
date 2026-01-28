import { db } from "@/db";
import { busStops, busLines, busRouteStops } from "@/db/schema";
import { eq } from "drizzle-orm";

interface MatchResult {
  stopName: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  lines: {
    number: string;
    name: string | null;
    attractions: string | null;
    color: string | null;
  }[];
}

// Simple Haversine formula to calculate distance in meters
function getDistanceFromLatLonInM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // Radius of earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function findNearbyTransit(
  propertyLat: number,
  propertyLng: number,
  radiusMeters: number = 600
): Promise<MatchResult[]> {
  // 1. Fetch all stops (In a real app with thousands of stops, use PostGIS 'ST_DWithin')
  // For < 500 stops, fetching all and filtering in-memory is blazing fast and simpler.
  const allStops = await db.select().from(busStops);
  
  // 2. Filter by distance
  const nearbyStops = allStops
    .map((stop) => {
      // Force conversion to numbers (just in case DB driver returns strings for 'real' or 'decimal')
      const stopLat = Number(stop.latitude);
      const stopLng = Number(stop.longitude);

      const distance = getDistanceFromLatLonInM(
        propertyLat,
        propertyLng,
        stopLat,
        stopLng
      );
      
      return { ...stop, distance };
    })
    .filter((stop) => stop.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5); // Take closest 5

  if (nearbyStops.length === 0) {
    return [];
  }

  // 3. For each stop, find lines
  const results: MatchResult[] = [];

  for (const stop of nearbyStops) {
    // Determine lines passing through this stop
    const routes = await db
      .select({
        lineNumber: busLines.lineNumber,
        name: busLines.name,
        color: busLines.color,
        attractions: busLines.mainAttractions,
      })
      .from(busRouteStops)
      .innerJoin(busLines, eq(busRouteStops.lineId, busLines.id))
      .where(eq(busRouteStops.stopId, stop.id));

    if (routes.length > 0) {
      results.push({
        stopName: stop.name,
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        distanceMeters: Math.round(stop.distance),
        lines: routes.map((r) => ({
          number: r.lineNumber,
          name: r.name,
          attractions: r.attractions,
          color: r.color,
        })),
      });
    }
  }

  return results;
}
