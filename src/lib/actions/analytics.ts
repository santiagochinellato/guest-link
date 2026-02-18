"use server";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { PropertyAnalytics } from "@/types/analytics";

/**
 * Returns analytics for a property. Stub implementation: uses property.views for totalViews,
 * rest are zeros/empty arrays until a real analytics backend exists.
 */
export async function getPropertyAnalytics(propertyId: number): Promise<PropertyAnalytics> {
  try {
    const [row] = await db
      .select({ views: properties.views })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    const totalViews = row?.views ?? 0;

    return {
      totalViews,
      avgTimeOnPage: 0,
      mobilePercent: 0,
      topActions: [],
      topRecommendations: [],
      viewsTimeline: [],
    };
  } catch {
    return {
      totalViews: 0,
      avgTimeOnPage: 0,
      mobilePercent: 0,
      topActions: [],
      topRecommendations: [],
      viewsTimeline: [],
    };
  }
}
