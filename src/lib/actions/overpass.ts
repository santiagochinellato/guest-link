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
  };
}


interface PlaceSuggestion {
  title: string;
  description: string;
  formattedAddress: string;
  googleMapsLink: string;
  categoryType: string;
}

export async function fetchNearbyPlaces(
  lat: number,
  lon: number,
  category: string
): Promise<{ success: boolean; data?: PlaceSuggestion[]; error?: string }> {
  try {
    // Map our categories to Overpass tags
    let queryTag = "";
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
        queryTag = '["highway"~"path|footway|track"]["name"]'; // Only named trails
        // Alternative: leisure=park, natural=beach
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


    // Overpass QL Query: Search within 1000m radius
    const query = `
      [out:json][timeout:25];
      (
        node${queryTag}(around:1000,${lat},${lon});
        way${queryTag}(around:1000,${lat},${lon});
      );
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
          description: "Found via Auto-Search",
          formattedAddress: address,
          googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
          categoryType: category,
        };
      });

    return { success: true, data: suggestions };
  } catch (error) {
    console.error("Overpass Search Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

