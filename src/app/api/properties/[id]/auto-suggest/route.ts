import { NextRequest, NextResponse } from "next/server";
import { getAutoSuggestions } from "@/lib/services/places-service";
import { db } from "@/db";
import { properties, recommendations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Corrected context arg type for App Router
) {
  const { id } = await params;
  const propertyId = parseInt(id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
  }

  // Parse Body for overrides
  let lat = 0;
  let lng = 0;
  let searchQuery = "";

  try {
     const body = await request.json();
     if (body.latitude) lat = parseFloat(body.latitude);
     if (body.longitude) lng = parseFloat(body.longitude);
     
     // Construct search query fallback
     const parts = [];
     if (body.city) parts.push(body.city);
     if (body.address) parts.push(body.address);
     if (body.country) parts.push(body.country);
     if (parts.length > 0) searchQuery = parts.join(", ");
  } catch(e) {
     // ignore params if json invalid
  }

  // If provided in body, prefer that. If not, fallback to DB.
  if (lat === 0 || lng === 0) {
      const property = await db.query.properties.findFirst({
        where: eq(properties.id, propertyId),
      });
      
      if (property && property.latitude && property.longitude) {
          lat = parseFloat(property.latitude);
          lng = parseFloat(property.longitude);
      } else if (!searchQuery && (!property || !property.address)) {
          // No location data anywhere
          return NextResponse.json({ error: "Property location (Coordinates or Address) not found. Please fill in the address or location." }, { status: 400 });
      } else if (!searchQuery && property) {
          // Use property address properties if body didn't have them
           const parts = [];
           if (property.city) parts.push(property.city);
           if (property.address) parts.push(property.address);
           if (property.country) parts.push(property.country);
           searchQuery = parts.join(", ");
      }
  }

  // Call Service
  const result = await getAutoSuggestions(
    propertyId, 
    lat, 
    lng,
    searchQuery
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 429 });
  }

  // Save to DB
  if (result.data && result.data.length > 0) {
     // Fetch/Ensure minimal categories exist or map them?
     // For this iteration, we just insert the recommendations linked to the property.
     // Optimization: We could look up category IDs by name/type.
     
     await db.transaction(async (tx) => {
        for (const place of result.data!) {
           // Basic duplicate check by title + property
           const existing = await tx.query.recommendations.findFirst({
              where: (recs, { and, eq }) => and(
                 eq(recs.propertyId, propertyId),
                 eq(recs.title, place.title)
              )
           });

           if (!existing) {
              await tx.insert(recommendations).values({
                 title: place.title,
                 description: place.description,
                 formattedAddress: place.formattedAddress,
                 googleMapsLink: place.googleMapsLink,
                 latitude: place.latitude,
                 longitude: place.longitude,
                 phone: place.phone,
                 website: place.website,
                 priceRange: place.priceRange,
                 propertyId: propertyId,
                 isAutoSuggested: true
              });
           }
        }
     });
  }

  return NextResponse.json({ 
    message: "Suggestions generated and saved successfully", 
    count: result.data?.length,
    suggestions: result.data 
  });
}
