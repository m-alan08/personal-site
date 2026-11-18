import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";

const failures = [];
function fail(message) {
  failures.push(message);
}

async function filesUnder(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory())
      found.push(...(await filesUnder(path, extensions)));
    else if (extensions.some((extension) => entry.name.endsWith(extension)))
      found.push(path);
  }
  return found;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

async function checkDashes() {
  const files = [
    ...(await filesUnder("src", [".ts", ".astro", ".css", ".mjs", ".md"])),
    ...(await filesUnder("docs", [".md"])),
  ];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/[\u2013\u2014]/g)) {
      const name = match[0] === "\u2014" ? "an em dash" : "an en dash";
      fail(
        `${file} line ${lineOf(text, match.index)} contains ${name}. Use a comma, period, colon or parentheses instead.`,
      );
    }
  }
}

const commentPatterns = [
  { pattern: /^\s*\/\//m, kind: "a line comment" },
  { pattern: /(^|[\s;{}(,])\/\*/m, kind: "a block comment" },
  { pattern: new RegExp("<" + "!--"), kind: "an HTML comment" },
];

async function checkComments() {
  const files = [
    ...(await filesUnder("src", [".ts", ".astro", ".css", ".mjs", ".js"])),
    ...(await filesUnder("scripts", [".mjs"])),
    "astro.config.mjs",
    "prettier.config.mjs",
    "tailwind.config.mjs",
    "eslint.config.mjs",
  ];
  for (const file of files) {
    let text;
    try {
      text = await readFile(file, "utf8");
    } catch {
      continue;
    }
    for (const { pattern, kind } of commentPatterns) {
      const global = new RegExp(pattern.source, `${pattern.flags}g`);
      for (const match of text.matchAll(global)) {
        fail(
          `${file} line ${lineOf(text, match.index + match[0].length - 1)} has ${kind}. This repository does not allow code comments; express the intent in names instead.`,
        );
      }
    }
  }
}

async function checkExternalLinks() {
  const files = [
    ...(await filesUnder("src/data", [".ts"])),
    ...(await filesUnder("src/content", [".ts"])),
  ];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/["'`](https?:\/\/[^"'`]*)["'`]/g)) {
      const value = match[1];
      if (value.includes("${")) continue;
      const where = `${file} line ${lineOf(text, match.index)}`;
      let url;
      try {
        url = new URL(value);
      } catch {
        fail(`${where} has a link that is not a valid URL: ${value}`);
        continue;
      }
      if (url.protocol !== "https:")
        fail(`${where} links to ${value} over plain http. Use https.`);
      if (/\s/.test(value))
        fail(`${where} has a link with a space in it: ${value}`);
      if (!url.hostname.includes("."))
        fail(`${where} has a link without a real domain: ${value}`);
      if (/[.,;:)]$/.test(value))
        fail(
          `${where} has a link ending in punctuation, which is probably a typo: ${value}`,
        );
      if (
        url.hostname === "github.com" &&
        url.pathname.split("/").filter(Boolean).length === 0
      )
        fail(
          `${where} links to the GitHub home page instead of a profile or repository: ${value}`,
        );
    }
  }
}

async function checkNewTabLinks() {
  for (const file of await filesUnder("dist", [".html"])) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/<a\b[^>]*>/g)) {
      const tag = match[0];
      const href = tag.match(/href="(https?:[^"]*|[^"]*\.pdf)"/)?.[1];
      if (!href) continue;
      if (
        !/target="_blank"/.test(tag) ||
        !/rel="noopener noreferrer"/.test(tag)
      )
        fail(
          `${file} links to ${href} without opening a new tab. Use newTabAttrs from src/data/links.ts.`,
        );
    }
  }
}

async function checkHeroAndAnchors() {
  const server = await serveBuild();
  const browser = await chromium.launch(browserOptions());
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(`${server.origin}${server.paths[0]}`, {
      waitUntil: "load",
    });
    const hero = await page.evaluate(() => {
      const textRight = (element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return Math.max(
          ...[...range.getClientRects()].map((rect) => rect.right),
        );
      };
      const section = document.querySelector(
        "section[aria-labelledby='intro-heading']",
      );
      if (!section) return { missing: true };
      const heading = section.querySelector("h1");
      const portrait = section.querySelector("img");
      const box = section.getBoundingClientRect();
      const rightThird = box.left + (box.width * 2) / 3;
      const portraitFrame = portrait?.parentElement;
      const intruders = [];
      const walker = document.createTreeWalker(
        section,
        window.NodeFilter.SHOW_TEXT,
      );
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        if (portraitFrame?.contains(node)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.width > 0 && rect.right > rightThird)
            intruders.push(`text "${node.textContent.trim().slice(0, 40)}"`);
        }
      }
      for (const element of section.querySelectorAll(
        "img, svg, video, canvas, picture, iframe, a, button, input, select",
      )) {
        if (portraitFrame?.contains(element)) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.right > rightThird)
          intruders.push(
            `<${element.tagName.toLowerCase()}> ${(element.getAttribute("aria-label") || element.textContent || "").trim().slice(0, 40)}`,
          );
      }
      const portraitBox = portrait?.getBoundingClientRect();
      return {
        missing: false,
        heading: heading?.textContent.trim() ?? "",
        textBlocks: section.querySelectorAll("h1 ~ p").length,
        buttons: section.querySelectorAll("a[href]").length,
        portrait: portrait
          ? {
              alt: portrait.alt,
              loaded: portrait.complete && portrait.naturalWidth > 0,
              left: portraitBox.left,
              width: portraitBox.width,
            }
          : null,
        headingRight: heading ? textRight(heading) : 0,
        rightThird,
        intruders: [...new Set(intruders)],
      };
    });
    if (hero.missing) {
      fail(
        "The hero section (labelled by the intro heading) is missing from the home page.",
      );
    } else {
      if (!hero.heading) fail("The hero has no visible name heading.");
      if (hero.textBlocks < 2)
        fail(
          "The hero lost its headline or intro text; expected at least two paragraphs after the name.",
        );
      if (hero.buttons < 1)
        fail(
          "The hero has no links; the GitHub, X, LinkedIn and Email buttons are missing.",
        );
      if (!hero.portrait) fail("The hero portrait image is missing.");
      else {
        if (!hero.portrait.alt) fail("The hero portrait has no alt text.");
        if (!hero.portrait.loaded)
          fail("The hero portrait image did not load.");
        if (hero.portrait.left < hero.rightThird - 1)
          fail(
            `The hero portrait moved out of the right third at 1440px (its left edge is at ${Math.round(hero.portrait.left)}px, the right third starts at ${Math.round(hero.rightThird)}px). The empty space beside it is deliberate.`,
          );
      }
      if (hero.headingRight > hero.rightThird)
        fail(
          "The hero name now reaches into the right third at 1440px. The left column must stay on the left.",
        );
      for (const intruder of hero.intruders)
        fail(
          `Something other than the portrait sits in the right third of the hero at 1440px: ${intruder}. Alan wants that space left empty.`,
        );
    }

    for (const path of server.paths.slice(0, 2)) {
      await page.goto(`${server.origin}${path}`, { waitUntil: "load" });
      const navTargets = await page.evaluate(() =>
        [...document.querySelectorAll("header nav a[href*='#']")].map((link) =>
          link.getAttribute("href"),
        ),
      );
      if (navTargets.length === 0)
        fail(`The header on ${path} has no section links.`);
      for (const href of new Set(navTargets)) {
        const target = new URL(href, `${server.origin}${path}`);
        const targetPage = await browser.newPage();
        await targetPage.goto(target.href, { waitUntil: "load" });
        const exists = await targetPage.evaluate(
          (id) => Boolean(document.getElementById(id)),
          decodeURIComponent(target.hash.slice(1)),
        );
        if (!exists)
          fail(
            `The header link "${href}" on ${path} points to a section that does not exist.`,
          );
        await targetPage.close();
      }
    }
    await page.goto(`${server.origin}${server.paths[0]}`, {
      waitUntil: "load",
    });
    for (const id of [
      "about",
      "projects",
      "exploring",
      "research",
      "writing",
      "experience",
      "contact",
    ]) {
      const exists = await page.evaluate(
        (anchor) => Boolean(document.getElementById(anchor)),
        id,
      );
      if (!exists)
        fail(
          `The home page anchor #${id} is gone. Old links to it would now land at the top of the page.`,
        );
    }
    await page.close();
  } finally {
    await browser.close();
    await server.close();
  }
}

await checkDashes();
await checkComments();
await checkExternalLinks();
await checkNewTabLinks();
await checkHeroAndAnchors();

if (failures.length) {
  console.error(`Guard tests failed (${failures.length}):`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}
console.log(
  "Guard tests passed: no em or en dashes in src or docs, no code comments, external links well formed, external and resume links opening in a new tab, hero left column and portrait intact with the right third empty at 1440px, and every nav anchor resolves.",
);
