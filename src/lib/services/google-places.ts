import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

interface PlaceResult {
  title: string;
  description: string;
  formattedAddress: string;
  googleMapsLink: string;
  rating?: number;
  userRatingsTotal?: number;
  googlePlaceId: string;
  categoryType: string;
  geometry: any;
  externalSource: "google";
}

export async function findTopRatedPlaces(
  lat: number,
  lng: number,
  categoryKeyword: string
): Promise<PlaceResult[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.warn("GOOGLE_MAPS_API_KEY is not set. Skipping Google Places search.");
    return [];
  }

  try {
    const response = await client.textSearch({
      params: {
        query: categoryKeyword,
        location: { lat, lng },
        radius: 10000, // 10km
        key: key,
      },
      timeout: 5000,
    });

    if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
        console.error("Google Places API Error:", response.data.status);
        return [];
    }

    const results = response.data.results
      .filter((place) => (place.rating || 0) >= 4.0) // Filter by rating
      .slice(0, 5) // Top 5
      .map((place) => ({
        title: place.name,
        description: `Rated ${place.rating} (${place.user_ratings_total} reviews)`,
        formattedAddress: place.formatted_address || "Address not available",
        googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        googlePlaceId: place.place_id,
        categoryType: mapKeywordToCategory(categoryKeyword),
        geometry: place.geometry,
        externalSource: "google" as const,
      }));

    return results as PlaceResult[];
  } catch (error) {
    console.error("Google Places Service Error:", error);
    return [];
  }
}

export async function findNearbyTransit(
  lat: number,
  lng: number
): Promise<PlaceResult[]> {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return [];

    try {
        const response = await client.placesNearby({
            params: {
                location: { lat, lng },
                radius: 1000, // 1km for transit
                type: "transit_station",
                key: key,
            },
            timeout: 5000,
        });

      if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
          return [];
      }

      return response.data.results.slice(0, 3).map(place => ({
         title: place.name,
         description: "Transit Station",
         formattedAddress: place.vicinity || place.formatted_address || "",
         googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
         rating: place.rating,
         userRatingsTotal: place.user_ratings_total,
         googlePlaceId: place.place_id,
         categoryType: "transport",
         geometry: place.geometry,
         externalSource: "google" as const,
      })) as PlaceResult[];

    } catch (error) {
        console.error("Google Transit Search Error:", error);
        return [];
    }
}

function mapKeywordToCategory(keyword: string): string {
    const lower = keyword.toLowerCase();
    
    // Restaurants
    if (lower.includes("restaurant") || lower.includes("parrilla") || 
        lower.includes("steakhouse") || lower.includes("grill") || 
        lower.includes("comida") || lower.includes("food")) return "restaurants";
    
    // Tourism/Sights
    if (lower.includes("tourist") || lower.includes("attraction") || 
        lower.includes("museum") || lower.includes("cinema") || 
        lower.includes("movie") || lower.includes("theater") ||
        lower.includes("bowling") || lower.includes("escape") ||
        lower.includes("entertainment")) return "sights";
    
    // Shopping
    if (lower.includes("clothing") || lower.includes("fashion") || 
        lower.includes("boutique") || lower.includes("souvenir") || 
        lower.includes("gift") || lower.includes("shoe") || 
        lower.includes("footwear") || lower.includes("store")) return "shopping";
    
    // Supermarket
    if (lower.includes("supermarket") || lower.includes("grocery")) return "supermarket";
    
    // Kids
    if (lower.includes("kids") || lower.includes("children") || 
        lower.includes("family") || lower.includes("playground") || 
        lower.includes("park")) return "kids";
    
    // Bars
    if (lower.includes("bar") || lower.includes("pub") || 
        lower.includes("nightlife") || lower.includes("brewery") || 
        lower.includes("beer") || lower.includes("cervecería") ||
        lower.includes("wine") || lower.includes("vinoteca")) return "bars";
    
    // Pharmacy
    if (lower.includes("pharmacy")) return "pharmacy";
    
    return "other";
}
