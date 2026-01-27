"use server";

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    website?: string;
    phone?: string;
    amenity?: string;
    shop?: string;
    tourism?: string;
    natural?: string;
  };
}


interface PlaceSuggestion {
  title: string;
  description: string;
  formattedAddress: string;
  googleMapsLink: string;
  categoryType: string;
  externalSource?: "osm";
  geometry?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function fetchNearbyPlaces(
  lat: number,
  lon: number,
  category: string
): Promise<{ success: boolean; data?: PlaceSuggestion[]; error?: string }> {
  try {
    // Map our categories to Overpass tags
    let queryTag = "";
    let radius = 2000; // Default 2km
    switch (category.toLowerCase()) {
      case "restaurants":
      case "gastronomy":
        queryTag = '["amenity"~"restaurant|fast_food"]["name"]';
        break;
      case "sights":
      case "tourism":
        queryTag = '["tourism"~"museum|attraction|viewpoint|artwork|gallery"]["name"]';
        radius = 5000;
        break;
      case "shops":
      case "shopping":
        queryTag = '["shop"~"clothes|shoes|boutique|gift|souvenir|mall"]["name"]';
        break;
      case "trails":
      case "outdoors":
        radius = 5000;
        queryTag = '["highway"~"path|footway|track"]["name"],["route"="hiking"],["tourism"~"alpine_hut|wilderness_hut"],["natural"="peak"]'; 
        break;
      case "kids":
        queryTag = '["leisure"~"playground|water_park|park"]["name"],["amenity"="ice_cream"]["name"]';
        radius = 3000;
        break;
      case "bars":
      case "nightlife":
        queryTag = '["amenity"~"bar|pub|biergarten|nightclub"]["name"]';
        break;
      case "breakfast":
      case "cafe":
        queryTag = '["amenity"~"cafe"]["name"]';
        break;
      case "essentials":
      case "supermarket":
        queryTag = '["shop"~"supermarket|convenience"]["name"],["amenity"="pharmacy"]["name"]';
        break;
      default:
        queryTag = '["tourism"]["name"],["amenity"~"restaurant|cafe"]["name"]'; 
    }

    if (category.toLowerCase() === "generic" || !queryTag) {
         queryTag = '["amenity"~"restaurant|cafe|bar|pub"]["name"]';
    }



    // Overpass QL Query: Search within radius
    // Ensure we handle multiple tag sets in union (node[tag](...); way[tag](...);) is standard but for simple OR logic in Overpass 
    // we often use union of sets. With the comma selector above `["key"~"val"],["key2"]` it acts as AND in some contexts or we need explicit union.
    // Actually standard Overpass `node[k=v]` is filtering. 
    // For OR logic with different keys, we need separate statements in the union.
    // Let's refine the query construction for "outdoors" specifically if needed, or use a simpler regex approach if possible.
    // But comma in `node[...]` is AND. 
    // So for "outdoors", we need a Union structure in the query string itself.
    
    let queryBody = "";
    if (category.toLowerCase() === "outdoors" || category.toLowerCase() === "trails") {
        // Complex Union for outdoors
        queryBody = `
          (
            node["highway"~"path|footway|track"]["name"](around:${radius},${lat},${lon});
            way["highway"~"path|footway|track"]["name"](around:${radius},${lat},${lon});
            relation["route"="hiking"]["name"](around:${radius},${lat},${lon});
            node["tourism"~"alpine_hut|wilderness_hut"](around:${radius},${lat},${lon});
            node["natural"="peak"]["name"](around:${radius},${lat},${lon});
            node["tourism"="attraction"](around:${radius},${lat},${lon});
          );
        `;
    } else {
        // Standard single tag set query
        queryBody = `
          (
            node${queryTag}(around:${radius},${lat},${lon});
            way${queryTag}(around:${radius},${lat},${lon});
          );
        `;
    }

    const query = `
      [out:json][timeout:90];
      ${queryBody}
      out center 10;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
    });

    if (!response.ok) {
      throw new Error(`Overpass API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const elements: OverpassElement[] = data.elements;

    const suggestions: PlaceSuggestion[] = elements
      .filter((el) => el.tags && el.tags.name) // Only with names
      .map((el) => {
        const name = el.tags?.name || "Unknown";
        const street = el.tags?.["addr:street"] || "";
        const house = el.tags?.["addr:housenumber"] || "";
        const address = street ? `${street} ${house}` : "Address not available";
        
        // Use center for ways, or lat/lon for nodes
        const elLat = el.lat || el.center?.lat || 0;
        const elLon = el.lon || el.center?.lon || 0;

        return {
          title: name,
          description: el.tags?.tourism ? `Tourism: ${el.tags.tourism}` : (el.tags?.natural ? `Nature: ${el.tags.natural}` : "Found via OpenStreetMap"),
          formattedAddress: address,
          googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
          categoryType: category,
          externalSource: "osm",
          googlePlaceId: `osm:${el.id}`,
          geometry: { location: { lat: elLat, lng: elLon } }
        };
      });

    return { success: true, data: suggestions };
  } catch (error) {
    // Defensive: Log error but return empty array to prevent cascading failures
    console.error("Overpass Search Error (gracefully degraded):", error);
    return { success: true, data: [] }; // Changed from success: false to allow partial results
  }
}

export interface TransitStop {
  name: string;
  lines: string[]; // e.g., ["20", "50", "51"]
  lat: number;
  lng: number;
  distance?: number;
}

/**
 * Fetch nearby transit stops from OpenStreetMap (FREE)
 * Extracts bus stop locations and line numbers from OSM tags
 */
export async function fetchNearbyTransitStops(lat: number, lng: number) {
  // Busca paradas de bus o plataformas en 500m
  const query = `
    [out:json][timeout:25];
    (
      node["highway"="bus_stop"](around:500,${lat},${lng});
      node["public_transport"="platform"](around:500,${lat},${lng});
    );
    out body;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      next: { revalidate: 86400 } // Cachear fuerte
    });

    if (!response.ok) return [];
    const data = await response.json();

    return data.elements.map((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Intentar extraer números de línea
      const lines = node.tags?.route_ref || node.tags?.lines || "";
      return {
        title: lines ? `Parada Bus (Líneas: ${lines})` : "Parada de Transporte Público",
        description: `Ubicación: ${node.tags?.name || "Sin nombre"}.`,
        formattedAddress: "Ver en mapa",
        externalSource: "osm",
        googlePlaceId: `osm:${node.id}`,
        geometry: { lat: node.lat, lng: node.lon },
        rating: null,
      };
    });
  } catch (e) {
    console.warn("Overpass Transit fail:", e);
    return [];
  }
}

