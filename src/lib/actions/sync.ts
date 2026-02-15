'use server';

import { db } from "@/db";
import { reservations, syncLogs, properties } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for data coming from the extension
const syncPayloadSchema = z.object({
  reservations: z.array(
    z.object({
      guestName: z.string(),
      reservationCode: z.string(),
      checkIn: z.string(),
      checkOut: z.string(),
      status: z.enum(["confirmed", "cancelled", "pending"]).optional().default("confirmed"),
      totalPrice: z.number().optional(),
      currency: z.string().optional(),
      platform: z.enum(["booking", "airbnb"]),
      listingName: z.string().optional(),
    })
  ),
});

/**
 * Called by the Dashboard UI to trigger a manual sync.
 * This creates a log entry which Supabase Realtime can broadcast to the extension,
 * or the extension can poll. The extension must have the panel open or be listening.
 */
export async function triggerSync(propertyId: number) {
  try {
    const [log] = await db
      .insert(syncLogs)
      .values({
        propertyId,
        status: "pending",
        triggeredBy: "manual",
      })
      .returning();

    if (!log) {
      return { success: false, error: "No se creó el registro de sincronización." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reservations");
    return { success: true, logId: log.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de base de datos";
    console.error("Error triggering sync:", error);
    // Mostrar error real para diagnosticar (ej. "relation sync_logs does not exist")
    return { success: false, error: message };
  }
}

/**
 * Called by the Extension to save scraped data.
 * Validates the API Key and updates the database.
 */
export async function saveSyncedData(apiKey: string, data: any) {
  // 1. Validate API Key
  const foundProperty = await db.query.properties.findFirst({
    where: eq(properties.syncApiKey, apiKey),
  });

  if (!foundProperty) {
    return { success: false, error: "Invalid API Key" };
  }

  // 2. Validate Payload
  const parsed = syncPayloadSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid data format", details: parsed.error.format() };
  }

  try {
    // 3. Upsert Reservations
    // Note: Drizzle's onConflictDoUpdate is useful here if we have a unique constraint on reservationCode + propertyId.
    // Assuming reservationCode is unique per property or globally? Using simple logic for now.
    
    // We'll filter out existing ones or just insert new ones?
    // User wants "Sincronización". For MVP, let's insert-ignore or overwrite specific fields if possible.
    // Current schema doesn't have unique constraint on reservationCode in definitions easily visible, 
    // but typically it should be unique.
    
    // Let's implement a simple loop for now to check existence (not most efficient but safe).
    // Better: Add unique index in schema later.
    
    const incomingReservations = parsed.data.reservations;
    let newCount = 0;
    let updatedCount = 0;

    for (const res of incomingReservations) {
        // Check if exists
        const existing = await db.query.reservations.findFirst({
            where: (reservations, { and, eq }) => 
                and(
                    eq(reservations.reservationCode, res.reservationCode),
                    eq(reservations.propertyId, foundProperty.id)
                )
        });

        if (existing) {
            // Update
            await db.update(reservations)
                .set({
                    status: res.status,
                    guestName: res.guestName,
                    checkIn: res.checkIn,
                    checkOut: res.checkOut,
                    totalPrice: res.totalPrice,
                    currency: res.currency,
                    updatedAt: new Date()
                })
                .where(eq(reservations.id, existing.id));
            updatedCount++;
        } else {
            // Insert
            await db.insert(reservations).values({
                propertyId: foundProperty.id,
                ...res,
                platform: res.platform as "booking" | "airbnb", // Cast to match schema type
                status: res.status,
            });
            newCount++;
        }
    }

    // 4. Update the LATEST pending sync log (if any) to success
    // Find the most recent pending log for this property
    const [latestLog] = await db.select()
        .from(syncLogs)
        .where(eq(syncLogs.propertyId, foundProperty.id))
        .orderBy(syncLogs.createdAt) // Should be desc?
        .limit(1); // Actually we might want desc to get the last one
    
    // Ideally we would pass the logId from the extension if it came from a trigger,
    // but for periodic sync we don't have a logId.
    // So we just create a new log entry for "success" if it was periodic, 
    // or update the pending one if it was manual.
    // For now, let's just log the success.
    
    await db.insert(syncLogs).values({
        propertyId: foundProperty.id,
        status: 'success',
        triggeredBy: 'system', // or extension
        log: `Processed ${newCount} new, ${updatedCount} updated.`,
        completedAt: new Date()
    });

    revalidatePath('/dashboard/reservations');
    return { success: true, count: newCount + updatedCount };

  } catch (error) {
    console.error("Error saving synced data:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Get the last successful sync time for a property
 */
export async function getLastSyncTime(propertyId: number): Promise<Date | null> {
  try {
    const [latestSync] = await db
      .select()
      .from(syncLogs)
      .where(
        and(
          eq(syncLogs.propertyId, propertyId),
          eq(syncLogs.status, 'success')
        )
      )
      .orderBy(desc(syncLogs.completedAt))
      .limit(1);

    return latestSync?.completedAt || latestSync?.createdAt || null;
  } catch (error) {
    console.error("Error fetching last sync time:", error);
    return null;
  }
}

export type SyncStatusItem = {
  propertyId: number;
  propertyName: string;
  hasSyncKey: boolean;
  lastSync: Date | null;
};

/**
 * Get sync status for all properties (last success sync per property).
 * Used by dashboard to show which properties are not updated.
 */
export async function getSyncStatusForAllProperties(
  properties: { id: number; name: string; syncApiKey?: string | null }[]
): Promise<SyncStatusItem[]> {
  if (properties.length === 0) return [];

  try {
    const successLogs = await db
      .select({
        propertyId: syncLogs.propertyId,
        completedAt: syncLogs.completedAt,
        createdAt: syncLogs.createdAt,
      })
      .from(syncLogs)
      .where(eq(syncLogs.status, 'success'))
      .orderBy(desc(syncLogs.completedAt));

    const lastSyncByProperty = new Map<number, Date | null>();
    for (const row of successLogs) {
      if (row.propertyId != null && !lastSyncByProperty.has(row.propertyId)) {
        lastSyncByProperty.set(
          row.propertyId,
          row.completedAt ?? row.createdAt
        );
      }
    }

    return properties.map((p) => ({
      propertyId: p.id,
      propertyName: p.name,
      hasSyncKey: !!p.syncApiKey,
      lastSync: lastSyncByProperty.get(p.id) ?? null,
    }));
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return properties.map((p) => ({
      propertyId: p.id,
      propertyName: p.name,
      hasSyncKey: !!p.syncApiKey,
      lastSync: null,
    }));
  }
}
