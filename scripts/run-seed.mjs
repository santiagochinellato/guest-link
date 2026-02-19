/**
 * Carga .env y .env.local ANTES de ejecutar el seed, para que la DB sea la misma que en `npm run dev`.
 * Los import del seed se ejecutan antes que el código del archivo, por eso el seed no puede cargar env a tiempo.
 *
 * Uso: node scripts/run-seed.mjs   (o npm run db:seed, que llama a este script)
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });

const result = spawnSync("npx", ["tsx", "src/db/seed-demo.ts"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
