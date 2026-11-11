import type { APIRoute } from "astro";
import { resolve } from "node:path";
import sharp from "sharp";

const size = 180;

export const GET: APIRoute = async () => {
  const png = await sharp(resolve("public/favicon.svg"), { density: 72 * 8 })
    .resize(size, size)
    .flatten({ background: "#0c0c0d" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
