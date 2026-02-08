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
    // Additional ignores
    ".vscode/**",
    "_bmad/**",
    "_bmad-output/**",
    "docs/**",
    ".bmad/**",
    ".claude/**",
    // Auto-generated PWA files
    "public/sw.js",
    "public/workbox-*.js",
  ]),
]);

export default eslintConfig;
