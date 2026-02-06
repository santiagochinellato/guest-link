 "use server";

import type { PropertyAnalytics } from "@/types/analytics";

const EMPTY_ANALYTICS: PropertyAnalytics = {
  totalViews: 0,
  avgTimeOnPage: 0,
  mobilePercent: 0,
  topActions: [],
  topRecommendations: [],
  viewsTimeline: [],
};

function getPosthogConfig() {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

  // API host: us.i.posthog.com -> us.posthog.com, eu.i.posthog.com -> eu.posthog.com
  const apiBase = host.replace(".i.posthog.com", ".posthog.com");

  return { apiKey, projectId, apiBase };
}

async function runHogQLQuery<T = unknown[]>(
  query: string,
  projectId: string,
  apiKey: string,
  apiBase: string,
): Promise<T> {
  const url = `${apiBase}/api/projects/${projectId}/query/`;
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
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Posthog API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    results?: T;
    query_status?: { error?: boolean; error_message?: string };
  };

  if (data.query_status?.error && data.query_status.error_message) {
    throw new Error(data.query_status.error_message);
  }

  return (data.results ?? []) as T;
}

export async function getPropertyAnalytics(
  propertyId: number,
): Promise<PropertyAnalytics> {
  const { apiKey, projectId, apiBase } = getPosthogConfig();

  if (!apiKey || !projectId) {
    console.warn(
      "Posthog analytics: POSTHOG_API_KEY or POSTHOG_PROJECT_ID not set",
    );
    return EMPTY_ANALYTICS;
  }

  if (typeof propertyId !== "number" || propertyId < 1) {
    return EMPTY_ANALYTICS;
  }

  const baseFilter = `properties.property_id = ${propertyId} AND timestamp > now() - interval 30 day`;

  try {
    const [totalViewsRes, mobileRes, actionsRes, recsRes, timelineRes] =
      await Promise.all([
        runHogQLQuery<[{ cnt: number }]>(
          `SELECT count() as cnt FROM events WHERE event = 'guest_guide_viewed' AND ${baseFilter}`,
          projectId,
          apiKey,
          apiBase,
        ),
        runHogQLQuery<[{ total: number; mobile: number }]>(
          `SELECT count() as total, countIf(properties.device = 'mobile') as mobile FROM events WHERE event = 'guest_guide_viewed' AND ${baseFilter}`,
          projectId,
          apiKey,
          apiBase,
        ),
        runHogQLQuery<Array<{ event: string; cnt: number }>>(
          `SELECT event, count() as cnt FROM events WHERE event IN ('wifi_password_copied', 'map_opened', 'rules_viewed', 'transport_viewed', 'recommendation_clicked') AND ${baseFilter} GROUP BY event`,
          projectId,
          apiKey,
          apiBase,
        ),
        runHogQLQuery<
          Array<{
            recommendation_name: string;
            category: string;
            clicks: number;
            first_clicked?: string;
            last_clicked?: string;
            recommendation_id?: number;
            address?: string;
            rating?: number;
            price_range?: number;
          }>
        >(
          `SELECT properties.recommendation_name as recommendation_name, properties.category as category, count() as clicks, min(timestamp) as first_clicked, max(timestamp) as last_clicked, any(properties.recommendation_id) as recommendation_id, any(properties.address) as address, any(properties.rating) as rating, any(properties.price_range) as price_range FROM events WHERE event = 'recommendation_clicked' AND ${baseFilter} GROUP BY recommendation_name, category ORDER BY clicks DESC LIMIT 10`,
          projectId,
          apiKey,
          apiBase,
        ),
        runHogQLQuery<Array<{ date: string; views: number }>>(
          `SELECT toDate(timestamp) as date, count() as views FROM events WHERE event = 'guest_guide_viewed' AND ${baseFilter} GROUP BY date ORDER BY date`,
          projectId,
          apiKey,
          apiBase,
        ),
      ]);

    const totalViews = totalViewsRes?.[0]?.cnt ?? 0;
    const mobileRow = mobileRes?.[0];
    const totalForMobile = mobileRow?.total ?? 0;
    const mobileCount = mobileRow?.mobile ?? 0;
    const mobilePercent =
      totalForMobile > 0 ? Math.round((mobileCount / totalForMobile) * 100) : 0;

    const actionMap: Record<string, string> = {
      wifi_password_copied: "WiFi copiado",
      map_opened: "Mapa abierto",
      rules_viewed: "Reglas vistas",
      transport_viewed: "Transporte visto",
      recommendation_clicked: "Recomendación clickeada",
    };

    const actions = Array.isArray(actionsRes) ? actionsRes : [];
    const totalActions = actions.reduce((sum, r) => sum + (r.cnt ?? 0), 0);
    const topActions = actions.map((r) => ({
      action: actionMap[r.event] ?? r.event,
      count: r.cnt ?? 0,
      percentage: totalActions > 0 ? Math.round(((r.cnt ?? 0) / totalActions) * 100) : 0,
    }));

    const topRecommendations = Array.isArray(recsRes)
      ? recsRes.map((r) => ({
          id: r.recommendation_id ? Number(r.recommendation_id) : undefined,
          name: String(r.recommendation_name ?? ""),
          category: String(r.category ?? ""),
          clicks: Number(r.clicks ?? 0),
          firstClicked: r.first_clicked
            ? new Date(r.first_clicked).toISOString()
            : undefined,
          lastClicked: r.last_clicked
            ? new Date(r.last_clicked).toISOString()
            : undefined,
          address: r.address ? String(r.address) : undefined,
          rating: r.rating != null ? Number(r.rating) : undefined,
          priceRange: r.price_range != null ? Number(r.price_range) : undefined,
        }))
      : [];

    const viewsTimeline = Array.isArray(timelineRes)
      ? timelineRes.map((r) => ({
          date: String(r.date ?? ""),
          views: Number(r.views ?? 0),
        }))
      : [];

    return {
      totalViews,
      avgTimeOnPage: 0,
      mobilePercent,
      topActions,
      topRecommendations,
      viewsTimeline,
    };
  } catch (error) {
    console.error("getPropertyAnalytics error:", error);
    return EMPTY_ANALYTICS;
  }
}
