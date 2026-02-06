import posthog from "posthog-js";

let initialized = false;

export function initPosthog() {
  if (typeof window === "undefined") return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    capture_pageview: false,
  });
  initialized = true;
}

// Singleton: siempre devuelve el mismo cliente posthog
export { posthog };
