import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "reports/**"] },
  {
    files: ["scripts/*.mjs", "src/scripts/*.ts"],
    languageOptions: {
      globals: {
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDialogElement: "readonly",
        Event: "readonly",
        IntersectionObserver: "readonly",
        requestAnimationFrame: "readonly",
        performance: "readonly",
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
