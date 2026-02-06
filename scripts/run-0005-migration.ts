/**
 * Run 0005_guest_tokens migration directly.
 * Use when drizzle-kit migrate fails due to journal/state issues.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing POSTGRES_URL or DATABASE_URL");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1 });

async function run() {
  const migrationPath = join(process.cwd(), "drizzle", "0005_guest_tokens.sql");
  const content = readFileSync(migrationPath, "utf-8");
  
  // Split by semicolons but preserve DO blocks
  const statements: string[] = [];
  let currentStmt = "";
  let inDoBlock = false;
  let dollarTag = "";
  
  const lines = content.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments
    if (trimmed.startsWith("--")) continue;
    
    // Detect DO $$ blocks
    if (trimmed.match(/^DO\s+\$\$/i)) {
      inDoBlock = true;
      const match = trimmed.match(/\$\$(\w*)/);
      dollarTag = match ? match[1] : "";
      currentStmt += line + "\n";
      continue;
    }
    
    // Detect END of DO block
    if (inDoBlock && trimmed.match(new RegExp(`END\\s+\\$\\$${dollarTag}\\s*;?`, "i"))) {
      currentStmt += line;
      statements.push(currentStmt.trim());
      currentStmt = "";
      inDoBlock = false;
      dollarTag = "";
      continue;
    }
    
    // Regular statement handling
    if (!inDoBlock) {
      if (trimmed.endsWith(";")) {
        currentStmt += line.replace(/;[\s]*$/, "");
        if (currentStmt.trim()) {
          statements.push(currentStmt.trim());
          currentStmt = "";
        }
      } else if (trimmed) {
        currentStmt += line + "\n";
      }
    } else {
      // Inside DO block, accumulate everything
      currentStmt += line + "\n";
    }
  }
  
  // Add any remaining statement
  if (currentStmt.trim()) {
    statements.push(currentStmt.trim());
  }

  for (const stmt of statements) {
    if (stmt) {
      console.log("Running:", stmt.slice(0, 60).replace(/\n/g, " ") + "...");
      await sql.unsafe(stmt + (stmt.endsWith(";") ? "" : ";"));
    }
  }
  console.log("Migration 0005 applied successfully.");
  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
