#!/usr/bin/env node
/**
 * Prueba rápida de conexión a PostHog Query API.
 * Uso: node scripts/test-posthog.mjs
 * Carga .env.local automáticamente (requiere dotenv o Node 20+ --env-file).
 */

import { readFileSync } from "fs";
import { pathToFileURL } from "url";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Cargar .env.local manualmente (sin instalar dotenv)
try {
  const envPath = resolve(root, ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) {
      const value = m[2].replace(/^["']|["']$/g, "");
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  }
} catch (e) {
  console.warn("No .env.local found, using existing env");
}

const apiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const apiBase = host.replace(".i.posthog.com", ".posthog.com");

if (!apiKey || !projectId) {
  console.error("Faltan POSTHOG_API_KEY o POSTHOG_PROJECT_ID en .env.local");
  process.exit(1);
}

const url = `${apiBase}/api/projects/${projectId}/query/`;
const propertyIdArg = process.argv[2];
const baseFilter = propertyIdArg
  ? `toString(properties.property_id) = '${propertyIdArg}' AND timestamp > now() - interval 30 day`
  : "1=1";
const query = `SELECT count() as cnt FROM events WHERE event = 'guest_guide_viewed' AND ${baseFilter}`;

console.log("PostHog Query API test");
console.log("URL:", url.replace(apiKey, "***"));
if (propertyIdArg) console.log("Filtrando por property_id:", propertyIdArg);
console.log("Query:", query);
console.log("");

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    query: { kind: "HogQLQuery", query },
  }),
});

const data = await res.json();

if (!res.ok) {
  console.error("Error HTTP", res.status, data);
  process.exit(1);
}

if (data.query_status?.error) {
  console.error("Error HogQL:", data.query_status.error_message);
  process.exit(1);
}

console.log("OK. Resultado:", data.results);
console.log("La API de PostHog responde correctamente con tu API key.");
