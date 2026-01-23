import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

interface PlaceSuggestion {
  title: string;
  description: string;
  googleMapsLink: string;
  formattedAddress: string;
  phone?: string;
  website?: string;
  latitude: string;
  longitude: string;
  categoryType: string;
  priceRange?: number;
  imageUrl?: string;
}

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchNearby";

export async function getAutoSuggestions(
  propertyId: number,
  latitude: number,
  longitude: number,
  searchQuery?: string
): Promise<{ success: boolean; data?: PlaceSuggestion[]; error?: string }> {
  
  // 1. Rate Limit Check: 24h
  // ... (Rate limit logic remains same, skipping for brewity or assuming I can keep it?)
  // Actually I need to include the rate limit logic so I will just copy it.
  const lastAutoSuggestion = await db
    .select({ createdAt: recommendations.createdAt })
    .from(recommendations)
    .where(
      and(
        eq(recommendations.propertyId, propertyId),
        eq(recommendations.isAutoSuggested, true)
      )
    )
    .orderBy(desc(recommendations.createdAt))
    .limit(1);

  if (lastAutoSuggestion.length > 0) {
    const lastRun = lastAutoSuggestion[0].createdAt;
    const now = new Date();
    const timeDiff = now.getTime() - (lastRun?.getTime() || 0);
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24) {
      console.log(`[Rate Limit] Skipped auto-suggestion for property ${propertyId}. Last run: ${hoursDiff.toFixed(1)}h ago.`);
      return { 
        success: false, 
        error: `Rate limit active. Please wait ${(24 - hoursDiff).toFixed(1)} hours before refreshing suggestions.` 
      };
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Google Places API configuration missing." };
  }

  // 2. Categories to search
  const CATEGORIES = [
    { type: "restaurant", keyword: "restaurant" },
    { type: "bar", keyword: "bar" },
    { type: "pharmacy", keyword: "pharmacy" },
    { type: "supermarket", keyword: "grocery_store" },
    { type: "park", keyword: "park" },
    { type: "bank", keyword: "bank" },
  ];

  const suggestions: PlaceSuggestion[] = [];

  // Determine Strategy: Geo vs Text
  const hasGeo = latitude !== 0 && longitude !== 0; // simplistic check, assumes 0,0 is invalid/default
  const useTextSearch = !hasGeo && !!searchQuery;
  
  if (!hasGeo && !useTextSearch) {
      return { success: false, error: "No location data (coordinates or address) available for suggestions." };
  }

  const fieldMask = [
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.priceLevel",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.rating"
  ].join(",");

  for (const cat of CATEGORIES) {
    try {
      let url = PLACES_API_URL; // default nearby
      let body: any = {};

      if (hasGeo) {
         url = "https://places.googleapis.com/v1/places:searchNearby";
         body = {
            locationRestriction: {
                circle: {
                    center: { latitude, longitude },
                    radius: 2000.0,
                },
            },
            includedTypes: [cat.keyword],
            maxResultCount: 2,
         };
      } else {
         url = "https://places.googleapis.com/v1/places:searchText";
         body = {
            textQuery: `${cat.keyword} in ${searchQuery}`,
            maxResultCount: 2,
         };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask, 
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (data.places) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.places.forEach((place: any) => {
           suggestions.push({
             title: place.displayName?.text || "Unknown Place",
             description: `${cat.type} - Rating: ${place.rating || "N/A"}`,
             formattedAddress: place.formattedAddress,
             googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}`,
             phone: place.nationalPhoneNumber,
             website: place.websiteUri,
             latitude: String(place.location.latitude),
             longitude: String(place.location.longitude),
             categoryType: cat.type,
             priceRange: place.priceLevel ? parseInt(place.priceLevel.replace("PRICE_LEVEL_", "").length) : 2
           });
        });
      }
    } catch (err) {
      console.error(`Error fetching category ${cat.type}`, err);
    }
  }

  return { success: true, data: suggestions };
}
