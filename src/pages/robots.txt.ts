import type { APIRoute } from "astro";
import { localLinks } from "../data/links";

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL(localLinks.sitemap, site).href}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
