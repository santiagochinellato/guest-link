import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore scripts directories (utility scripts, not production code)
    "scripts/**",
    "src/scripts/**",
  ]),
  {
    files: [
      "src/lib/actions/**",
      "src/lib/services/**",
      "src/config/recommendations.ts",
      "src/components/admin/qr-flyer/**",
      "src/components/guest/views/**",
      "src/components/guest/wifi-card.tsx",
      "src/components/guest/emergency-modal.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
