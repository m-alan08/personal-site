import { chromium } from "playwright-core";
import sharp from "sharp";
import { browserOptions } from "./test-server.mjs";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4322";
const scanHeight = 1400;
const pages = ["/personal-site/", "/personal-site/projects/quantrl-fetch/"];
const widths = [390, 1440];
const minimum = 4.5;

const luminance = ([r, g, b]) =>
  [r, g, b]
    .map((c) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const median = (pixels) => {
  const channel = (i) => {
    const sorted = pixels.map((p) => p[i]).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  return [channel(0), channel(1), channel(2)];
};

const browser = await chromium.launch(browserOptions());
let worst = { ratio: Infinity, where: "", text: "" };
const failures = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: scanHeight },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const elements = await page.evaluate((limit) => {
      const parse = (value) => {
        const parts = value.match(/[\d.]+/g) ?? [0, 0, 0];
        return parts.slice(0, 3).map(Number);
      };
      return [...document.querySelectorAll("body *")]
        .filter(
          (element) =>
            element.checkVisibility({ checkVisibilityCSS: true }) &&
            [...element.childNodes].some(
              (node) => node.nodeType === 3 && node.textContent.trim(),
            ),
        )
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            text: element.textContent.trim().slice(0, 60),
            tag: element.tagName.toLowerCase(),
            color: parse(style.color),
            x: rect.x,
            y: rect.y,
            w: rect.width,
            h: rect.height,
          };
        })
        .filter(
          (element) =>
            element.y < limit &&
            element.y + element.h > 0 &&
            element.w > 0 &&
            element.h > 0,
        );
    }, scanHeight);
    const shot = await page.screenshot({
      clip: { x: 0, y: 0, width, height: scanHeight },
    });
    const { data, info } = await sharp(shot)
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (const element of elements) {
      const x0 = Math.max(0, Math.floor(element.x));
      const y0 = Math.max(0, Math.floor(element.y));
      const x1 = Math.min(info.width, Math.ceil(element.x + element.w));
      const y1 = Math.min(info.height, Math.ceil(element.y + element.h));
      const samples = [];
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = (y * info.width + x) * info.channels;
          const px = [data[i], data[i + 1], data[i + 2]];
          const distance = Math.hypot(
            px[0] - element.color[0],
            px[1] - element.color[1],
            px[2] - element.color[2],
          );
          if (distance > 45) samples.push(px);
        }
      }
      if (samples.length < 20) continue;
      const r = ratio(element.color, median(samples));
      if (r < worst.ratio) {
        worst = {
          ratio: r,
          where: `${path} ${width}px <${element.tag}>`,
          text: element.text,
        };
      }
      if (r < minimum) {
        failures.push(
          `${path} ${width}px <${element.tag}> "${element.text}" ratio ${r.toFixed(2)}`,
        );
      }
    }
  }
  await context.close();
}
await browser.close();

console.log(
  `Worst contrast: ${worst.ratio.toFixed(2)} at ${worst.where} "${worst.text}"`,
);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Contrast audit passed: ${pages.length} pages at ${widths.join("px, ")}px, all text ${minimum}:1 or better.`,
);
