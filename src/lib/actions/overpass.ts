"use server";

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
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
        queryTag = '["tourism"~"museum|attraction|viewpoint"]';
        break;
      case "shopping":
        queryTag = '["shop"~"supermarket|mall|clothes"]';
        break;
      default:
        queryTag = '["amenity"~"restaurant|cafe|bar"]';
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
        const elLat = el.lat || (el as any).center?.lat;
        const elLon = el.lon || (el as any).center?.lon;

        return {
          title: name,
          description: "Found via Auto-Search",
          formattedAddress: address,
          googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
          categoryType: category,
        };
      });

    return { success: true, data: suggestions };
  } catch (error: any) {
    console.error("Overpass Search Error:", error);
    return { success: false, error: error.message };
  }
}
