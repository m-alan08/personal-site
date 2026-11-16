import type { APIRoute, GetStaticPaths } from "astro";
import { resolve } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { sharePages } from "../../data/routes";
import type { SharePage } from "../../data/routes";
import { localPath } from "../../data/links";
import { site } from "../../content/site";

export const getStaticPaths = (() =>
  sharePages.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }))) satisfies GetStaticPaths;

const width = 1200;
const height = 630;
const inset = 80;
const footerTop = 540;
const textWidth = width - inset * 2;
const colors = {
  canvas: "#0c0c0d",
  chrome: "#161618",
  ink: "#ececea",
  muted: "#9b9b9f",
  line: "#242427",
  accent: "#ef5a52",
};
const fonts = {
  display: resolve("src/assets/fonts/Soria.ttf"),
  serif: resolve("src/assets/fonts/InstrumentSerif-latin.ttf"),
  mono: resolve("src/assets/fonts/GeistMono-latin.ttf"),
};
const families = {
  display: "Soria, Instrument Serif",
  serif: "Instrument Serif",
  mono: "Geist Mono",
};

interface TextStyle {
  size: number;
  weight: number;
  color: string;
  lineHeight: number;
  tracking?: number;
  family: keyof typeof families;
}

function escapeMarkup(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/-/g, "-\u2060");
}

async function textLayer(text: string, style: TextStyle) {
  const spacing = Math.round((style.tracking ?? 0) * style.size * 1024);
  const markup = `<span foreground="${style.color}" font_weight="${style.weight}" letter_spacing="${spacing}" line_height="${style.lineHeight}">${escapeMarkup(text)}</span>`;
  const { data, info } = await sharp({
    text: {
      text: markup,
      font: `${families[style.family]} ${style.size}px`,
      fontfile: fonts[style.family],
      width: textWidth,
      dpi: 72,
      rgba: true,
      wrap: "word",
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, height: info.height };
}

const styles = {
  name: {
    size: 132,
    weight: 400,
    color: colors.ink,
    lineHeight: 1,
    tracking: -0.01,
    family: "display",
  },
  oneLiner: {
    size: 38,
    weight: 400,
    color: colors.muted,
    lineHeight: 1.2,
    family: "serif",
  },
  byline: {
    size: 34,
    weight: 400,
    color: colors.ink,
    lineHeight: 1.2,
    family: "display",
  },
  bylineDetail: {
    size: 24,
    weight: 400,
    color: colors.muted,
    lineHeight: 1.15,
    family: "serif",
  },
  title: {
    size: 66,
    weight: 400,
    color: colors.ink,
    lineHeight: 1,
    family: "display",
  },
  result: {
    size: 34,
    weight: 400,
    color: colors.accent,
    lineHeight: 1.15,
    family: "serif",
  },
  summary: {
    size: 32,
    weight: 400,
    color: colors.muted,
    lineHeight: 1.15,
    family: "serif",
  },
  label: {
    size: 20,
    weight: 500,
    color: colors.muted,
    lineHeight: 1,
    tracking: 0.06,
    family: "mono",
  },
} satisfies Record<string, TextStyle>;

function blocks(
  page: SharePage,
): { text: string; style: TextStyle; gap: number }[] {
  if (!page.project)
    return [
      { text: site.name, style: styles.name, gap: 0 },
      { text: site.description, style: styles.oneLiner, gap: 36 },
    ];
  return [
    { text: site.name, style: styles.byline, gap: 0 },
    { text: site.description, style: styles.bylineDetail, gap: 10 },
    { text: page.project.title, style: styles.title, gap: 44 },
    {
      text: page.project.highlight,
      style: page.project.isResult ? styles.result : styles.summary,
      gap: 28,
    },
  ];
}

function background(): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors.chrome}"/><stop offset="1" stop-color="${colors.canvas}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#fade)"/><rect x="${inset}" y="${inset - 24}" width="48" height="4" fill="${colors.accent}"/><rect x="${inset}" y="${footerTop}" width="${textWidth}" height="2" fill="${colors.line}"/></svg>`,
  );
}

const fontsReady = Promise.all(
  (["serif", "display", "mono"] as const).map((family) =>
    textLayer("a", {
      size: 10,
      weight: 400,
      color: colors.ink,
      lineHeight: 1,
      family,
    }),
  ),
);

export const GET: APIRoute = async ({ props, site: origin }) => {
  await fontsReady;
  const page = props.page as SharePage;
  const top = page.project ? inset + 16 : 184;
  const layers: OverlayOptions[] = [];
  let y = top;
  for (const block of blocks(page)) {
    const layer = await textLayer(block.text, block.style);
    y += block.gap;
    layers.push({ input: layer.data, left: inset, top: y });
    y += layer.height;
  }
  if (y > footerTop - 24)
    throw new Error(`Share image text for ${page.slug} overflows the footer.`);
  const address = new URL(localPath(page.path), origin).href
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const footer = await textLayer(address, styles.label);
  layers.push({ input: footer.data, left: inset, top: footerTop + 30 });
  const png = await sharp(background())
    .composite(layers)
    .png({ compressionLevel: 9, palette: true, quality: 100 })
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
