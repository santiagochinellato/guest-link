// eslint-disable-next-line @typescript-eslint/no-unused-vars

const FSQ_API_KEY = process.env.FOURSQUARE_API_KEY;

interface FsqPlace {
  fsq_id: string;
  name: string;
  location: {
    formatted_address: string;
    address?: string;
    locality?: string;
  };
  rating?: number;
  stats?: {
    total_photos?: number;
    total_ratings?: number;
  };
  link?: string;
  categories?: { name: string }[];
  geocodes?: { main: { latitude: number; longitude: number } };
}

export async function searchFoursquarePlaces(
  lat: number,
  lng: number,
  query: string,
  _categoryId?: string // Opcional: IDs específicos de Foursquare
) {
  if (!FSQ_API_KEY) {
    console.error("Foursquare API Key missing");
    return [];
  }

  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    query: query,
    sort: "POPULARITY", // EL SECRETO: Ordenar por fama, no solo distancia
    limit: "8",
    fields: "fsq_id,name,location,rating,stats,link,categories,geocodes",
    open_now: "false" // Importante: Traer lugares famosos aunque estén cerrados ahora
  });

  try {
    const res = await fetch(`https://api.foursquare.com/v3/places/search?${params}`, {
      headers: {
        Authorization: FSQ_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cachear por 24hs para velocidad
    });

    if (!res.ok) {
      console.error("FSQ Error:", await res.text());
      return [];
    }

    const data = await res.json();

    return data.results.map((place: FsqPlace) => {
      // Mapeo a tu estructura de base de datos
      const rating = place.rating ? place.rating / 2 : null; // FSQ es 0-10, lo pasamos a 0-5

      return {
        title: place.name,
        description: place.categories?.[0]?.name || "Lugar popular",
        formattedAddress: place.location.formatted_address || place.location.address,
        googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + (place.location.locality || ""))}`,
        rating: rating,
        userRatingsTotal: place.stats?.total_ratings || 0,
        externalSource: "foursquare",
        googlePlaceId: place.fsq_id, // Usamos el ID de FSQ aquí para evitar duplicados
        geometry: place.geocodes?.main ? { lat: place.geocodes.main.latitude, lng: place.geocodes.main.longitude } : null,
      };
    });
  } catch (error) {
    console.error("Foursquare Service Error:", error);
    return [];
  }
}
