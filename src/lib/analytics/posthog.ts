import type {
  PropertyGuestUsage,
  GuestUsageSection,
  GuestSectionKey,
  GuestUsageRecommendation,
} from "@/types/analytics";

const GUEST_EVENTS: GuestSectionKey[] = [
  "guest_guide_viewed",
  "rules_viewed",
  "transport_viewed",
  "map_opened",
  "wifi_password_copied",
];

const SECTION_LABELS: Record<GuestSectionKey, string> = {
  guest_guide_viewed: "Guía",
  rules_viewed: "Reglas",
  transport_viewed: "Transporte",
  map_opened: "Mapa",
  wifi_password_copied: "WiFi copiado",
};

async function runHogQLQuery<T extends Record<string, unknown>>(
  query: string,
  name: string
): Promise<T[]> {
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (!projectId || !apiKey) {
    return [];
  }

  const url = `${host.replace(/\/$/, "")}/api/projects/${projectId}/query/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query,
      },
      name,
    }),
  });

  if (!res.ok) {
    console.error("[posthog] Query failed", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    results?: unknown[][];
    columns?: string[];
    query_status?: { results?: unknown[][] };
  };

  const rows = data.results ?? data.query_status?.results ?? [];
  const columns = data.columns ?? [];

  if (rows.length === 0 || columns.length === 0) {
    return [];
  }

  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}

/**
 * Fetches guest app usage stats for a property from PostHog:
 * - topSections: most viewed sections (rules, transport, map, etc.)
 * - peakUsageHour: hour (0-23) with most activity
 * - topRecommendations: most clicked recommendations
 */
export async function getPropertyGuestUsage(
  propertyId: number
): Promise<PropertyGuestUsage> {
  const empty: PropertyGuestUsage = {
    topSections: [],
    peakUsageHour: null,
    topRecommendations: [],
  };

  try {
    const eventList = GUEST_EVENTS.map((e) => `'${e}'`).join(", ");
    const propFilter = `properties.property_id = ${propertyId}`;

    // 1) Section counts (last 90 days)
    const sectionRows = await runHogQLQuery<{ event: string; cnt: number }>(
      `SELECT event, count() as cnt
       FROM events
       WHERE ${propFilter}
         AND event IN (${eventList})
         AND timestamp >= now() - INTERVAL 90 DAY
       GROUP BY event
       ORDER BY cnt DESC
       LIMIT 10`,
      "guest_sections"
    );

    const totalSection = sectionRows.reduce((s, r) => s + (r.cnt ?? 0), 0);
    const topSections: GuestUsageSection[] = sectionRows.map((r) => {
      const key = r.event as GuestSectionKey;
      const count = Number(r.cnt) ?? 0;
      const percentage = totalSection > 0 ? Math.round((count / totalSection) * 100) : 0;
      return {
        sectionKey: key,
        label: SECTION_LABELS[key] ?? key,
        count,
        percentage,
      };
    });

    // 2) Peak hour (0-23)
    const hourRows = await runHogQLQuery<{ h: number; cnt: number }>(
      `SELECT toHour(timestamp) as h, count() as cnt
       FROM events
       WHERE ${propFilter}
         AND event IN (${eventList})
         AND timestamp >= now() - INTERVAL 90 DAY
       GROUP BY h
       ORDER BY cnt DESC
       LIMIT 1`,
      "guest_peak_hour"
    );

    const peakUsageHour =
      hourRows.length > 0 && typeof hourRows[0].h === "number" ? hourRows[0].h : null;

    // 3) Top recommendations by clicks
    const recRows = await runHogQLQuery<{
      name: string;
      id: number | null;
      category: string;
      clicks: number;
    }>(
      `SELECT
         coalesce(properties.recommendation_name, 'Sin nombre') as name,
         toInt64OrNull(properties.recommendation_id) as id,
         coalesce(properties.category, '') as category,
         count() as clicks
       FROM events
       WHERE event = 'recommendation_clicked'
         AND ${propFilter}
         AND timestamp >= now() - INTERVAL 90 DAY
       GROUP BY name, id, category
       ORDER BY clicks DESC
       LIMIT 5`,
      "guest_top_recommendations"
    );

    const topRecommendations: GuestUsageRecommendation[] = recRows.map((r) => ({
      id: r.id ?? undefined,
      name: String(r.name ?? ""),
      category: String(r.category ?? ""),
      clicks: Number(r.clicks) ?? 0,
    }));

    return {
      topSections,
      peakUsageHour,
      topRecommendations,
    };
  } catch (err) {
    console.error("[getPropertyGuestUsage]", err);
    return empty;
  }
}
