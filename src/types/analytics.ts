export interface GuestGuideViewedEvent {
  property_id: number;
  device: "mobile" | "desktop";
}

export interface WifiPasswordCopiedEvent {
  property_id: number;
}

export interface RecommendationClickedEvent {
  property_id: number;
  recommendation_id?: number;
  recommendation_name: string;
  category: string;
  address?: string;
  rating?: number;
  price_range?: number;
}

export interface MapOpenedEvent {
  property_id: number;
}

export interface PropertyAnalytics {
  totalViews: number;
  avgTimeOnPage: number;
  mobilePercent: number;
  topActions: Array<{ action: string; count: number; percentage: number }>;
  topRecommendations: Array<{
    id?: number;
    name: string;
    category: string;
    clicks: number;
    firstClicked?: string;
    lastClicked?: string;
    address?: string;
    rating?: number;
    priceRange?: number;
  }>;
  viewsTimeline: Array<{ date: string; views: number }>;
}

/** Section keys for guest app usage (PostHog event names) */
export type GuestSectionKey =
  | "guest_guide_viewed"
  | "rules_viewed"
  | "transport_viewed"
  | "map_opened"
  | "wifi_password_copied";

export interface GuestUsageSection {
  sectionKey: GuestSectionKey;
  label: string;
  count: number;
  percentage: number;
}

export interface GuestUsageRecommendation {
  id?: number;
  name: string;
  category: string;
  clicks: number;
}

/** Result of getPropertyGuestUsage: usage stats from PostHog for the guest app */
export interface PropertyGuestUsage {
  topSections: GuestUsageSection[];
  peakUsageHour: number | null;
  topRecommendations: GuestUsageRecommendation[];
}
