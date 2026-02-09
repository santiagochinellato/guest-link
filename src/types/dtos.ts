
export interface GuestRecommendation {
  id?: number;
  title: string;
  description?: string;
  formattedAddress?: string;
  googleMapsLink?: string;
  latitude?: string;
  longitude?: string;
  website?: string;
  phone?: string;
  rating?: number;
  priceRange?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openingHours?: any;
  category: string;
  categoryType: string;
}

export interface GuestEmergencyContact {
  name: string;
  phone: string;
  type: string;
}

export interface GuestTransport {
  name: string;
  type: string;
  description?: string;
  scheduleInfo?: string;
  priceInfo?: string;
  website?: string;
  phone?: string;
}

export interface GuestAccess {
  instructions: string;
  accessCode: string;
  alarmCode?: string;
  accessSteps: { text: string }[];
  hasParking: boolean;
  parkingDetails?: string;
}

export interface GuestHouseRules {
  text: string;
  allowed: string[];
  prohibited: string[];
}

export interface GuestHost {
  name: string;
  image?: string;
  phone?: string;
}

export interface GuestPreCheckIn {
  steps: { text: string }[];
  notes?: string;
}

export interface GuestProperty {
  id?: number;
  name: string;
  address: string;
  city: string;
  country: string;
  wifiSsid?: string;
  wifiPassword?: string;
  wifiQrCode?: string;
  houseRules: GuestHouseRules;
  image?: string; // Cover Image
  coverImageUrl?: string; // Legacy/Alias
  checkIn?: string;
  checkInTime?: string; // Legacy/Alias
  checkOut?: string;
  checkOutTime?: string; // Legacy/Alias
  latitude?: string;
  longitude?: string;
  access: GuestAccess;
  preCheckIn?: GuestPreCheckIn;
  recommendations: GuestRecommendation[];
  emergencyContacts: GuestEmergencyContact[];
  transport: GuestTransport[];
  hostName?: string;
  hostImage?: string;
  hostPhone?: string;
}
