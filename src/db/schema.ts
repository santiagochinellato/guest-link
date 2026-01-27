import { pgTable, text, serial, integer, timestamp, boolean, real, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Added import

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
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
});

// Relations for properties
export const propertiesRelations = relations(properties, ({ many }) => ({
  categories: many(categories),
  recommendations: many(recommendations),
  emergencyContacts: many(emergencyContacts),
  transportInfo: many(transportInfo),
}));

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
