import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { siteOrigin, siteBase } from "./src/data/hosting.ts";

export default defineConfig({
  site: siteOrigin,
  base: siteBase,
  trailingSlash: "always",
  output: "static",
  vite: { plugins: [tailwindcss()] },
});
