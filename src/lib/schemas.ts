
import { z } from "zod";

export const RecommendationSchema = z.object({
  id: z.number().optional(), // If present, update; else insert
  title: z.string().min(1, "Title is required"),
  formattedAddress: z.string().optional(),
  googleMapsLink: z.string().optional(),
  categoryType: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  
  // Auto-Discovery Fields
  rating: z.number().optional(),
  userRatingsTotal: z.number().optional(),
  googlePlaceId: z.string().optional(),
  externalSource: z.enum(["manual", "google", "osm"]).optional(),
  geometry: z.any().optional(),
});

export const EmergencyContactSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  type: z.string().default("other").optional(), // Relaxed
});

export const TransportInfoSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Provider name is required"),
  type: z.string().min(1, "Type is required").optional().or(z.literal("")), // Relaxed
  description: z.string().optional(),
  scheduleInfo: z.string().optional(),
  priceInfo: z.string().optional(),
});

export const CategorySchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  icon: z.string().optional(),
  type: z.string(),
  displayOrder: z.number().optional(),
  isSystemCategory: z.boolean().optional(),
  searchKeywords: z.string().optional(),
  propertyId: z.number().optional(),
});

export const PropertyFormSchema = z.object({
  // Basic
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  coverImageUrl: z.string().optional(),
  
  // Location
  address: z.string().min(5, "Address must be valid"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  
  // WiFi
  wifiSsid: z.string().optional(),
  wifiPassword: z.string().optional(),
  wifiQrCode: z.string().optional(),
  
  // Associations
  recommendations: z.array(RecommendationSchema).optional(),
  emergencyContacts: z.array(EmergencyContactSchema).optional(),
  transport: z.array(TransportInfoSchema).optional(),
  categories: z.array(CategorySchema).optional(),
  
  // Content
  houseRules: z.string().optional(),
  rulesAllowed: z.array(z.object({ value: z.string() })).optional(),
  rulesProhibited: z.array(z.object({ value: z.string() })).optional(),
  
  // Host Info
  hostName: z.string().optional(),
  hostImage: z.string().optional(),
  hostPhone: z.string().optional(),
  
  // Status
  status: z.enum(["active", "draft", "archived"]).optional(),
});

export type PropertyFormData = z.infer<typeof PropertyFormSchema>;

export interface CategoryFromDB {
  id: number;
  name: string;
  icon?: string | null;
  type: string;
  displayOrder?: number | null;
  isSystemCategory?: boolean | null;
  searchKeywords?: string | null;
  propertyId?: number | null;
}
