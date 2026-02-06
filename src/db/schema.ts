import { pgTable, text, serial, integer, timestamp, boolean, real, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Added import

export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  },
  (account) => [
    {
      compoundKey: [account.provider, account.providerAccountId],
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    {
      compoundKey: [vt.identifier, vt.token],
    },
  ]
);

export const properties = pgTable("properties", {
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
  views: integer("views").default(0).notNull(),
  // Host Info removed to avoid migration requirement
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: text("status").default("draft"), // active, draft, archived
  syncApiKey: text("sync_api_key").unique(), // Key for extension synchronization
  autoSendGuide: boolean("auto_send_guide").default(true),
  autoCheckoutReminder: boolean("auto_checkout_reminder").default(true),
  autoReviewRequest: boolean("auto_review_request").default(true),
});

// Relations for properties


export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  type: text("type"), // restaurant, outdoor, kids, pharmacy, bank, supermarket, transport
  displayOrder: integer("display_order").default(0),
  isSystemCategory: boolean("is_system_category").default(false),
  searchKeywords: text("search_keywords"), // Comma-separated keywords for Google Places API
  propertyId: integer("property_id").references(() => properties.id),
});

// Relations for categories
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  property: one(properties, {
    fields: [categories.propertyId],
    references: [properties.id],
  }),
  recommendations: many(recommendations),
}));

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
  
  // New Auto-Discovery Fields
  googlePlaceId: text("google_place_id").unique(),
  rating: real("rating"),
  userRatingsTotal: integer("user_ratings_total"),
  externalSource: text("external_source").default("manual"), // manual, google, osm
  geometry: json("geometry"),
  openingHours: json("opening_hours"), // Stores Google Maps opening_hours structure
  
  categoryId: integer("category_id").references(() => categories.id),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for recommendations
export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  property: one(properties, {
    fields: [recommendations.propertyId],
    references: [properties.id],
  }),
  category: one(categories, {
    fields: [recommendations.categoryId],
    references: [categories.id],
  }),
}));

/** Idiomas soportados para el huésped: define mensajes WhatsApp/email y pantalla de la guía */
export const GUEST_LANGUAGES = ["es", "en", "pt"] as const;
export type GuestLanguage = (typeof GUEST_LANGUAGES)[number];

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  /** Idioma/nacionalidad del huésped: es, en, pt. Define idioma de mensajes y pantalla guía */
  guestLanguage: text("guest_language").default("es"),
  reservationCode: text("reservation_code").notNull(),
  checkIn: text("check_in").notNull(), // ISO Date String
  checkOut: text("check_out").notNull(), // ISO Date String
  status: text("status").notNull(), // confirmed, cancelled, pending
  totalPrice: real("total_price"),
  currency: text("currency"),
  platform: text("platform").notNull(), // booking, airbnb
  listingName: text("listing_name"),
  preArrivalSent: boolean("pre_arrival_sent").default(false),
  checkoutReminderSent: boolean("checkout_reminder_sent").default(false),
  reviewRequestSent: boolean("review_request_sent").default(false),
  notes: text("notes"),
  amountPaid: real("amount_paid"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const automationLogs = pgTable("automation_logs", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").references(() => reservations.id),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  error: text("error"),
});

// Relations for reservations
export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  property: one(properties, {
    fields: [reservations.propertyId],
    references: [properties.id],
  }),
  automationLogs: many(automationLogs),
  guestTokens: many(guestTokens),
}));

export const automationLogsRelations = relations(automationLogs, ({ one }) => ({
  reservation: one(reservations, {
    fields: [automationLogs.reservationId],
    references: [reservations.id],
  }),
}));

export const guestTokens = pgTable("guest_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  reservationId: integer("reservation_id").references(() => reservations.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

export const guestTokensRelations = relations(guestTokens, ({ one }) => ({
  reservation: one(reservations, {
    fields: [guestTokens.reservationId],
    references: [reservations.id],
  }),
}));

// ... existing relations ...

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  status: text("status").notNull(), // pending, success, error
  triggeredBy: text("triggered_by").notNull(), // auto, manual
  log: text("log"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const syncLogsRelations = relations(syncLogs, ({ one }) => ({
  property: one(properties, {
    fields: [syncLogs.propertyId],
    references: [properties.id],
  }),
}));

// Table for Emergency Contacts
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(), // police, hospital, fire, ambulance
  name: text("name"),
  phone: text("phone").notNull(),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isDefault: boolean("is_default").default(false),
});

// Relations for emergencyContacts
export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
  property: one(properties, {
    fields: [emergencyContacts.propertyId],
    references: [properties.id],
  }),
}));

export const transportInfo = pgTable("transport_info", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  type: text("type").notNull(), // bus, taxi, rental, train, airport
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone"),
  website: text("website"),
  scheduleInfo: text("schedule_info"),
  priceInfo: text("price_info"),
});

// Relations for transportInfo
export const transportInfoRelations = relations(transportInfo, ({ one }) => ({
  property: one(properties, {
    fields: [transportInfo.propertyId],
    references: [properties.id],
  }),
}));

// Transport / Transit System Tables

// 1. Maestro de Líneas (Ej: Línea 20, 55, 72)
export const busLines = pgTable("bus_lines", {
  id: serial("id").primaryKey(),
  lineNumber: text("line_number").notNull(), // "20", "55"
  name: text("name"), // "Terminal - Llao Llao"
  color: text("color").default("#000000"), // Para la UI
  mainAttractions: text("main_attractions"), // "Llao Llao, Pto Pañuelo"
});

// 2. Paradas de Colectivo (Geolocalizadas)
export const busStops = pgTable("bus_stops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Moreno y Beschedt"
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isHub: boolean("is_hub").default(false), // Si es parada clave (Centro)
});

// 3. Relación Línea <-> Parada (Muchos a muchos)
export const busRouteStops = pgTable("bus_route_stops", {
  id: serial("id").primaryKey(),
  lineId: integer("line_id").references(() => busLines.id),
  stopId: integer("stop_id").references(() => busStops.id),
  order: integer("order"), // Orden en el recorrido (1, 2, 3...)
  direction: text("direction"), // "ida" o "vuelta"
});

// Relations for Transit System
export const busLinesRelations = relations(busLines, ({ many }) => ({
  routeStops: many(busRouteStops),
}));

export const busStopsRelations = relations(busStops, ({ many }) => ({
  routeLines: many(busRouteStops),
}));

export const busRouteStopsRelations = relations(busRouteStops, ({ one }) => ({
  line: one(busLines, {
    fields: [busRouteStops.lineId],
    references: [busLines.id],
  }),
  stop: one(busStops, {
    fields: [busRouteStops.stopId],
    references: [busStops.id],
  }),
}));

// Final Relations (Moved to end to avoid reference errors)
export const propertiesRelations = relations(properties, ({ many }) => ({
  categories: many(categories),
  recommendations: many(recommendations),
  emergencyContacts: many(emergencyContacts),
  transportInfo: many(transportInfo),
  reservations: many(reservations),
  syncLogs: many(syncLogs),
}));
