const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually from .env.production.local
const envPath = path.resolve(__dirname, '../.env.production.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
});

let connectionString = envVars.POSTGRES_URL_NON_POOLING || envVars.POSTGRES_URL;
if (!connectionString) {
  console.error('No POSTGRES_URL found in .env.production.local');
  process.exit(1);
}

// Strip sslmode=require if present to avoid conflicts with explicit SSL config
connectionString = connectionString.replace(/[?&]sslmode=require/, "");

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.');

    console.log('Running ALTER TABLE properties...');
    await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "wifi_qr_code" text;`);
    
    console.log('Running ALTER TABLE recommendations...');
    await client.query(`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS "google_place_id" text UNIQUE;`);
    await client.query(`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS "rating" real;`);
    await client.query(`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS "user_ratings_total" integer;`);
    await client.query(`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS "external_source" text DEFAULT 'manual';`);
    await client.query(`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS "geometry" json;`);

    console.log('Creating Bus Tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bus_lines" (
        "id" serial PRIMARY KEY NOT NULL,
        "line_number" text NOT NULL,
        "name" text,
        "color" text DEFAULT '#000000',
        "main_attractions" text
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bus_stops" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "latitude" real NOT NULL,
        "longitude" real NOT NULL,
        "is_hub" boolean DEFAULT false
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bus_route_stops" (
        "id" serial PRIMARY KEY NOT NULL,
        "line_id" integer REFERENCES "bus_lines"("id"),
        "stop_id" integer REFERENCES "bus_stops"("id"),
        "order" integer,
        "direction" text
      );
    `);

    console.log('✅ Schema updated successfully!');
  } catch (err) {
    console.error('❌ Error executing schema updates:', err);
  } finally {
    await client.end();
  }
}

main();
