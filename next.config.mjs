import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta absoluta al proyecto (evita que Turbopack/PostCSS resuelvan desde un padre)
const projectRoot = path.resolve(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lqkxpikgmrgadfynorny.supabase.co",
      },
      {
        protocol: "https",
        hostname: "sfdbjaykqqdwaiezsxxr.supabase.co",
      },
    ],
  },
};

export default nextConfig;
