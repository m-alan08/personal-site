import type { APIRoute } from "astro";
import { pagePaths } from "../data/routes";
import { localPath } from "../data/links";

export const GET: APIRoute = ({ site }) => {
  const urls = pagePaths
    .map(
      (path) => `<url><loc>${new URL(localPath(path), site).href}</loc></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
