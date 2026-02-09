/**
 * Recomendaciones base para propiedades en Bariloche
 * Estas recomendaciones se cargan automáticamente cuando se crea una nueva propiedad
 */

export interface DefaultPlace {
  name: string;
  place_id: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  rating_count: number;
  price_level?: number;
  description: string;
}

export interface DefaultCategory {
  type: string;
  label: string;
  icon: string;
  color: string;
  isSystemCategory: boolean;
  displayOrder: number;
  places: DefaultPlace[];
}

export interface DefaultRecommendations {
  property_name: string;
  location: string;
  categories: Record<string, DefaultCategory>;
}

// Importar el JSON de recomendaciones
import barilocheRecommendationsData from "../../jsonRecomendaciones.json";

export const defaultRecommendations = barilocheRecommendationsData as DefaultRecommendations;

/**
 * Convierte las recomendaciones base del JSON al formato esperado por el sistema
 */
export function convertDefaultRecommendationsToSystemFormat(
  recommendations: DefaultRecommendations
): Array<{
  categoryType: string;
  title: string;
  googlePlaceId: string;
  formattedAddress: string;
  latitude: string;
  longitude: string;
  rating?: number;
  userRatingsTotal?: number;
  description?: string;
  googleMapsLink?: string;
  externalSource: "manual" | "google" | "osm";
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}> {
  const result: Array<{
    categoryType: string;
    title: string;
    googlePlaceId: string;
    formattedAddress: string;
    latitude: string;
    longitude: string;
    rating?: number;
    userRatingsTotal?: number;
    description?: string;
    googleMapsLink?: string;
    externalSource: "manual" | "google" | "osm";
    geometry?: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }> = [];

  // Iterar sobre todas las categorías
  for (const [categoryKey, category] of Object.entries(recommendations.categories)) {
    // Iterar sobre todos los lugares de cada categoría
    for (const place of category.places) {
      result.push({
        categoryType: category.type,
        title: place.name,
        googlePlaceId: place.place_id,
        formattedAddress: place.address,
        latitude: place.latitude.toString(),
        longitude: place.longitude.toString(),
        rating: place.rating,
        userRatingsTotal: place.rating_count,
        description: place.description,
        googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        externalSource: "google",
        geometry: {
          location: {
            lat: place.latitude,
            lng: place.longitude,
          },
        },
      });
    }
  }

  return result;
}

/**
 * Obtiene las categorías base del JSON de recomendaciones
 */
export function getDefaultCategoriesFromRecommendations(
  recommendations: DefaultRecommendations
): Array<{
  type: string;
  name: string;
  icon: string;
  displayOrder: number;
  isSystemCategory: boolean;
  searchKeywords?: string;
}> {
  const categories: Array<{
    type: string;
    name: string;
    icon: string;
    displayOrder: number;
    isSystemCategory: boolean;
    searchKeywords?: string;
  }> = [];

  for (const [categoryKey, category] of Object.entries(recommendations.categories)) {
    categories.push({
      type: category.type,
      name: category.label,
      icon: category.icon.toLowerCase(),
      displayOrder: category.displayOrder,
      isSystemCategory: category.isSystemCategory,
    });
  }

  // Ordenar por displayOrder
  return categories.sort((a, b) => a.displayOrder - b.displayOrder);
}

