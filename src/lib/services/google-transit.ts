export interface GoogleStop {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  distanceMeters?: number; // Calculated or from API if available (we will calc)
  placeId: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export const GoogleTransitService = {
  async getNearbyStops(
    lat: number,
    lng: number,
    radius: number = 300
  ): Promise<GoogleStop[]> {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("GoogleTransitService: Missing API Key");
      return [];
    }

    const endpoint = "https://places.googleapis.com/v1/places:searchNearby";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.displayName,places.location,places.id,places.types",
        },
        body: JSON.stringify({
          includedPrimaryTypes: ["bus_stop", "transit_station"],
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius,
            },
          },
          maxResultCount: 5,
          rankPreference: "DISTANCE",
        }),
      });

      if (!response.ok) {
        console.error(
          "GoogleTransitService Error:",
          response.status,
          await response.text()
        );
        return [];
      }

      const data = await response.json();
      const places = data.places || [];

      return places.map((place: any) => {
        // Simple Haversine to confirm distance (optional, but good for data richness if API doesn't return it directly in this endpoint easily)
        const pLat = place.location.latitude;
        const pLng = place.location.longitude;
        const dist = getDistanceFromLatLonInM(lat, lng, pLat, pLng);

        return {
          name: place.displayName?.text || "Parada de transporte",
          location: {
            lat: pLat,
            lng: pLng,
          },
          placeId: place.id,
          distanceMeters: Math.round(dist),
        };
      });
    } catch (error) {
      console.error("GoogleTransitService Exception:", error);
      return [];
    }
  },
};

// --- Utils ---
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
