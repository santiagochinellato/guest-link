import { useMemo } from "react";

import { GuestProperty, GuestRecommendation } from "@/types/dtos";

// Transport types constant
const TRANSPORT_TYPES = ["transit", "bus", "taxi", "transfer"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useGuestData(property: GuestProperty) {
  // Pass-through data (already normalized by server mapper)
  const recommendations = property.recommendations || [];
  
  // Computed UI Helpers
  const openLocation = () => {
    if (property.latitude && property.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`,
        "_blank",
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`,
        "_blank",
      );
    }
  };

  const categories = useMemo(() => {
    return recommendations
      ? Array.from(
          new Set<string>(recommendations.map((r) => r.categoryType)),
        ).filter((c) => !TRANSPORT_TYPES.includes(c))
      : [];
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(
      (r) => !TRANSPORT_TYPES.includes(r.categoryType),
    );
  }, [recommendations]);

  // Top Recommendations (One from each main category)
  const topRecommendations = useMemo(() => {
    return filteredRecommendations.reduce((acc: GuestRecommendation[], curr) => {
      const exists = acc.find((item) => item.categoryType === curr.categoryType);
      if (!exists && acc.length < 4) {
        acc.push(curr);
      }
      return acc;
    }, []);
  }, [filteredRecommendations]);


  // Flatten Return for ease of use in UI (Destructuring)
  return {
    ...property,

    // Aliases for UI consistency if needed, though Mapper standardized names
    effectiveAccessCode: property.access.accessCode,
    effectiveAlarmCode: property.access.alarmCode,
    effectiveAccessSteps: property.access.accessSteps,
    effectiveHasParking: property.access.hasParking,
    effectiveParkingDetails: property.access.parkingDetails,
    
    effectiveHouseRules: property.houseRules.text,
    effectiveAllowed: property.houseRules.allowed,
    effectiveProhibited: property.houseRules.prohibited,

    safeAccess: property.access, // Legacy ref

    // Computed
    categories,
    filteredRecommendations,
    topRecommendations,
    transportRecommendations: property.transport, // Already separated by mapper
    transportCategories: Array.from(new Set(property.transport.map(t => t.type))),

    // Actions
    openLocation,
  };
}
