import { useMemo } from "react";

// Transport types constant
const TRANSPORT_TYPES = ["transit", "bus", "taxi", "transfer"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useGuestData(property: any) {
  // 1. Normalize Core Data
  const {
    wifiSsid,
    wifiPassword,
    checkInTime: _checkInTime,
    checkOutTime: _checkOutTime,
    checkIn,
    checkOut,
    coverImageUrl: _coverImageUrl,
    image,
    name,
    latitude,
    longitude,
    address,
    hostImage,
    hostPhone,
    hostName,
  } = property;

  const coverImageUrl = _coverImageUrl || image;
  const checkInTime = _checkInTime || checkIn;
  const checkOutTime = _checkOutTime || checkOut;

  // 2. Normalize Access & Rules
  const safeAccess = property.access || {};
  const effectiveAccessCode = safeAccess.accessCode || "";
  const effectiveAlarmCode = safeAccess.alarmCode || "";
  const effectiveAccessSteps = safeAccess.accessSteps || [];
  const effectiveHasParking = safeAccess.hasParking || false;
  const effectiveParkingDetails = safeAccess.parkingDetails || "";

  const effectiveHouseRules = property.houseRules?.text || "";
  const effectiveAllowed = property.houseRules?.allowed || [];
  const effectiveProhibited = property.houseRules?.prohibited || [];

  // 3. Normalize Recommendations & Transport
  const recommendations = useMemo(
    () => property.recommendations || [],
    [property.recommendations],
  );

  // Filter categories for guide (excluding transport)
  const categories = useMemo(() => {
    return recommendations
      ? Array.from(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Set<string>(recommendations.map((r: any) => r.categoryType)),
        ).filter((c) => !TRANSPORT_TYPES.includes(c))
      : [];
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return recommendations?.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => !TRANSPORT_TYPES.includes(r.categoryType),
    );
  }, [recommendations]);

  // Transport Data Merging
  const transportRecommendations = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawTransport = property.transport || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedTransport = rawTransport.map((t: any) => ({
      title: t.name,
      description: t.description,
      categoryType: t.type || "taxi",
      originalType: t.type,
      formattedAddress: t.scheduleInfo || "",
      googleMapsLink: t.website || "",
      phone: t.phone,
      extraInfo: t.priceInfo,
      isTransport: true,
    }));

    const legacyTransport = recommendations?.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => TRANSPORT_TYPES.includes(r.categoryType),
    );

    return [...(legacyTransport || []), ...mappedTransport];
  }, [property.transport, recommendations]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transportCategories = useMemo(
    () =>
      transportRecommendations
        ? Array.from(
            new Set<string>(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              transportRecommendations.map((r: any) => r.categoryType),
            ),
          )
        : [],
    [transportRecommendations],
  );

  // Top Recommendations (One from each main category)
  const topRecommendations = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (filteredRecommendations || []).reduce((acc: any[], curr: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exists = acc.find((item: any) => item.categoryType === curr.categoryType);
      if (!exists && acc.length < 4) {
        acc.push(curr);
      }
      return acc;
    }, []);
  }, [filteredRecommendations]);

  const openLocation = () => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank",
      );
    }
  };

  return {
    // Core Info
    name,
    address,
    coverImageUrl,
    checkInTime,
    checkOutTime,
    wifiSsid,
    wifiPassword,
    hostName,
    hostImage,
    hostPhone,
    latitude,
    longitude,
    
    // Access & Rules
    safeAccess,
    effectiveAccessCode,
    effectiveAlarmCode,
    effectiveAccessSteps,
    effectiveHasParking,
    effectiveParkingDetails,
    effectiveHouseRules,
    effectiveAllowed,
    effectiveProhibited,

    // Recommendations
    recommendations,
    categories,
    filteredRecommendations,
    topRecommendations,

    // Transport
    transportRecommendations,
    transportCategories,

    // Actions
    openLocation,
  };
}
