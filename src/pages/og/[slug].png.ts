import type { APIRoute, GetStaticPaths } from "astro";
import sharp from "sharp";
import { sharePages } from "../../data/routes";
import { site } from "../../content/site";

export const getStaticPaths = (() =>
  sharePages.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }))) satisfies GetStaticPaths;

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] ?? character,
  );
}

function wrapText(text: string, limit: number): string[] {
  return text.split(" ").reduce<string[]>((lines, word) => {
    const last = lines.length - 1;
    if (last < 0 || lines[last].length + word.length + 1 > limit)
      lines.push(word);
    else lines[last] += ` ${word}`;
    return lines;
  }, []);
}

export const GET: APIRoute = async ({ props }) => {
  const page = props.page as (typeof sharePages)[number];
  const title = wrapText(page.title, 29)
    .map(
      (line, index) =>
        `<tspan x="72" y="${240 + index * 76}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  const description = wrapText(page.description, 66)
    .slice(0, 3)
    .map(
      (line, index) =>
        `<tspan x="72" y="${390 + index * 42}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0c0c0d"/><text x="72" y="92" font-family="sans-serif" font-size="28" font-weight="500" fill="#9b9b9f">${escapeXml(site.name)}</text><text font-family="sans-serif" font-size="64" font-weight="600" fill="#ececea">${title}</text><text font-family="sans-serif" font-size="28" fill="#9b9b9f">${description}</text><line x1="72" y1="520" x2="1128" y2="520" stroke="#242427" stroke-width="2"/><text x="72" y="568" font-family="sans-serif" font-size="24" fill="#9b9b9f">${escapeXml(site.footer)}</text></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
