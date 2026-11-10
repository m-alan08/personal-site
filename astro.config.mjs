import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { siteOrigin, siteBase } from "./src/data/hosting.ts";
import { legacyRedirects } from "./src/data/redirects.ts";

export default defineConfig({
  site: siteOrigin,
  base: siteBase,
  trailingSlash: "always",
  output: "static",
  redirects: legacyRedirects,
  vite: { plugins: [tailwindcss()] },
});
