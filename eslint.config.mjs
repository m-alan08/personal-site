import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "reports/**"] },
  {
    files: ["scripts/browser-audit.mjs"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        getComputedStyle: "readonly",
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.mjs", "**/*.ts", "**/*.astro"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        URL: "readonly",
      },
    },
  },
];
