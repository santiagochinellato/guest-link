import { GuestProperty, GuestRecommendation, GuestTransport, GuestEmergencyContact } from "@/types/dtos";

// Helper for safe JSON parsing
const safeJsonParse = (str: string | null | undefined, fallback = {}) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPropertyToGuestDTO(prop: any, recs: any[], emergency: any[], transport: any[]): GuestProperty {
  const parsedRules = safeJsonParse(prop.houseRules, { text: "" });
  const parsedAccess = parsedRules.access || {};
  const parsedPreCheckIn = parsedRules.preCheckIn || {};
  const parsedHost = parsedRules.host || {};

  // Map Recommendations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recommendations: GuestRecommendation[] = recs.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    formattedAddress: r.formattedAddress,
    googleMapsLink: r.googleMapsLink,
    latitude: r.latitude,
    longitude: r.longitude,
    website: r.website,
    phone: r.phone,
    rating: r.rating,
    priceRange: r.priceRange,
    openingHours: r.openingHours,
    category: r.categoryName || "Other",
    categoryType: r.categoryType
  }));

  // Map Emergency Contacts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emergencyContacts: GuestEmergencyContact[] = emergency.map((e: any) => ({
    name: e.name,
    phone: e.phone,
    type: e.type || "other"
  }));

  // Map Transport
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transportList: GuestTransport[] = transport.map((t: any) => ({
    name: t.name,
    type: t.type,
    description: t.description,
    scheduleInfo: t.scheduleInfo,
    priceInfo: t.priceInfo,
    website: t.website,
    phone: t.phone
  }));

  return {
    id: prop.id,
    name: prop.name,
    address: prop.address || "",
    city: prop.city || "",
    country: prop.country || "",
    wifiSsid: prop.wifiSsid,
    wifiPassword: prop.wifiPassword,
    wifiQrCode: prop.wifiQrCode || "",
    
    houseRules: {
      text: parsedRules.text || "",
      allowed: parsedRules.allowed || [],
      prohibited: parsedRules.prohibited || []
    },

    image: prop.coverImageUrl, // Legacy support mapped to image in DTO if needed or just coverImageUrl
    coverImageUrl: prop.coverImageUrl,

    checkIn: prop.checkInTime, // Legacy
    checkInTime: prop.checkInTime,
    
    checkOut: prop.checkOutTime, // Legacy
    checkOutTime: prop.checkOutTime,

    latitude: prop.latitude,
    longitude: prop.longitude,

    access: {
      instructions: parsedAccess.instructions || "",
      accessCode: parsedAccess.accessCode || "",
      alarmCode: parsedAccess.alarmCode || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accessSteps: (parsedAccess.accessSteps || []).map((s: any) => 
        typeof s === 'string' ? { text: s } : s
      ),
      hasParking: parsedAccess.hasParking || false,
      parkingDetails: parsedAccess.parkingDetails || ""
    },

    preCheckIn: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: (parsedPreCheckIn.steps || []).map((s: any) => 
        typeof s === 'string' ? { text: s } : s
      ),
      notes: parsedPreCheckIn.notes || ""
    },

    recommendations,
    emergencyContacts,
    transport: transportList,

    hostName: parsedHost.name || "",
    hostImage: parsedHost.image || "",
    hostPhone: parsedHost.phone || ""
  };
}
