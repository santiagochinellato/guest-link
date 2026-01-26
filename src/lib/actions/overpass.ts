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
  geometry?: any;
}

export async function fetchNearbyPlaces(
  lat: number,
  lon: number,
  category: string
): Promise<{ success: boolean; data?: PlaceSuggestion[]; error?: string }> {
  try {
    // Map our categories to Overpass tags
    let queryTag = "";
    let radius = 1000; // Default 1km
    switch (category.toLowerCase()) {
      case "restaurants":
        queryTag = '["amenity"="restaurant"]';
        break;
      case "sights":
        queryTag = '["tourism"~"museum|attraction|viewpoint|artwork"]';
        break;
      case "shopping":
        queryTag = '["shop"]';
        break;
      case "trails":
      case "outdoors":
        // 5km radius for outdoors (optimized for public API stability)
        radius = 5000;
        // Queries for hiking, huts, peaks
        queryTag = '["highway"~"path|footway|track"]["name"],["route"="hiking"],["tourism"~"alpine_hut|wilderness_hut"],["natural"="peak"]'; 
        break;
      case "kids":
       queryTag = '["leisure"~"playground|water_park|park"]["name"]';
       break;
      case "bars":
        queryTag = '["amenity"~"bar|pub|biergarten|nightclub"]';
        break;
      default:
        // Try to guess or fallback to general tourism/amenities
        // If it's a known english word we might luck out, otherwise fallback.
        queryTag = '["tourism"]'; 
        // We could try to make this smarter later.
    }

    if (category.toLowerCase() === "generic" || !queryTag) {
         queryTag = '["amenity"~"restaurant|cafe|bar|pub"]'; // Fallback
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

