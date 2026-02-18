import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  json,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Idiomas soportados para la guía del huésped
export const GUEST_LANGUAGES = ["es", "en", "pt", "fr", "de", "it"] as const;

// ---- Auth (tabla "user" en DB, exportada como users)
export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { withTimezone: true }),
  image: text("image"),
  password: text("password"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const account = pgTable("account", {
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const session = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationToken = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});

// ---- Properties
export const properties = pgTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address"),
    city: text("city"),
    country: text("country"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    wifiSsid: text("wifi_ssid"),
    wifiPassword: text("wifi_password"),
    wifiQrCode: text("wifi_qr_code"),
    houseRules: text("house_rules_text"),
    coverImageUrl: text("cover_image_url"),
    checkInTime: text("check_in_time"),
    checkOutTime: text("check_out_time"),
    ownerId: integer("owner_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    views: integer("views").default(0).notNull(),
    status: text("status").default("draft"),
    autoSendGuide: boolean("auto_send_guide").default(true),
    autoCheckoutReminder: boolean("auto_checkout_reminder").default(true),
    autoReviewRequest: boolean("auto_review_request").default(true),
    syncApiKey: text("sync_api_key").unique(),
  },
  (t) => [uniqueIndex("properties_slug_unique").on(t.slug)]
);

// ---- Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  type: text("type"),
  displayOrder: integer("display_order").default(0),
  isSystemCategory: boolean("is_system_category").default(false),
  propertyId: integer("property_id").references(() => properties.id),
  searchKeywords: text("search_keywords"),
});

// ---- Recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  googleMapsLink: text("google_maps_link"),
  website: text("website"),
  imageUrl: text("image_url"),
  phone: text("phone"),
  formattedAddress: text("formatted_address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  priceRange: integer("price_range"),
  isAutoSuggested: boolean("is_auto_suggested").default(false),
  isFavorite: boolean("is_favorite").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  googlePlaceId: text("google_place_id").unique(),
  rating: real("rating"),
  userRatingsTotal: integer("user_ratings_total"),
  externalSource: text("external_source").default("manual"),
  geometry: json("geometry"),
});

// ---- Emergency contacts
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(),
  name: text("name"),
  phone: text("phone").notNull(),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isDefault: boolean("is_default").default(false),
});

// ---- Transport info
export const transportInfo = pgTable("transport_info", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone"),
  website: text("website"),
  scheduleInfo: text("schedule_info"),
  priceInfo: text("price_info"),
});

// ---- Reservations
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  guestName: text("guest_name").notNull(),
  reservationCode: text("reservation_code").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  status: text("status").notNull(),
  totalPrice: real("total_price"),
  currency: text("currency"),
  platform: text("platform").notNull(),
  listingName: text("listing_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  guestLanguage: text("guest_language"),
  preArrivalSent: boolean("pre_arrival_sent").default(false),
  checkoutReminderSent: boolean("checkout_reminder_sent").default(false),
  reviewRequestSent: boolean("review_request_sent").default(false),
  notes: text("notes"),
  amountPaid: real("amount_paid"),
});

// ---- Guest tokens
export const guestTokens = pgTable(
  "guest_tokens",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull().unique(),
    reservationId: integer("reservation_id").references(() => reservations.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("guest_tokens_token_unique").on(t.token)]
);

// ---- Automation logs
export const automationLogs = pgTable("automation_logs", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").references(() => reservations.id),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
  error: text("error"),
});

// ---- Bus (transit)
export const busStops = pgTable("bus_stops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isHub: boolean("is_hub").default(false),
});

export const busLines = pgTable("bus_lines", {
  id: serial("id").primaryKey(),
  lineNumber: text("line_number").notNull(),
  name: text("name"),
  color: text("color").default("#000000"),
  mainAttractions: text("main_attractions"),
});

export const busRouteStops = pgTable("bus_route_stops", {
  id: serial("id").primaryKey(),
  lineId: integer("line_id").references(() => busLines.id),
  stopId: integer("stop_id").references(() => busStops.id),
  order: integer("order"),
  direction: text("direction"),
});

// ---- Relations (for db.query)
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users),
  categories: many(categories),
  recommendations: many(recommendations),
  emergencyContacts: many(emergencyContacts),
  transportInfo: many(transportInfo),
  reservations: many(reservations),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  property: one(properties),
  recommendations: many(recommendations),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  category: one(categories),
  property: one(properties),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  property: one(properties),
  guestTokens: many(guestTokens),
  automationLogs: many(automationLogs),
}));

export const guestTokensRelations = relations(guestTokens, ({ one }) => ({
  reservation: one(reservations),
}));

export const automationLogsRelations = relations(automationLogs, ({ one }) => ({
  reservation: one(reservations),
}));
