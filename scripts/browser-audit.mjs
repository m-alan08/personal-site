import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4322";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => new URL(match[1]).pathname,
);
paths.push(`${paths[0]}404.html`);
await mkdir("reports/screenshots", { recursive: true });
const results = [];
const failures = [];
const descriptions = new Set();
const titles = new Set();

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [360, 768, 1280]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      for (const path of paths) {
        const label = `${path} ${width}px ${colorScheme}`;
        try {
          const response = await page.goto(`${origin}${path}`, {
            waitUntil: "networkidle",
          });
          assert.ok(
            response && response.status() === 200,
            `${label}: page did not load`,
          );
          const state = await page.evaluate(() => {
            const headings = [
              ...document.querySelectorAll("h1,h2,h3,h4,h5,h6"),
            ].map((element) => Number(element.tagName.slice(1)));
            const links = [...document.querySelectorAll("a")]
              .filter((element) => !element.classList.contains("sr-only"))
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  text: element.textContent.trim(),
                  width: rect.width,
                  height: rect.height,
                };
              });
            const metadata = [
              ...document.querySelectorAll(
                'script[type="application/ld+json"]',
              ),
            ].map((element) => JSON.parse(element.textContent));
            return {
              headings,
              links,
              metadata,
              title: document.title,
              description: document.querySelector('meta[name="description"]')
                .content,
              h1: document.querySelectorAll("h1").length,
              main: document.querySelectorAll("main").length,
              language: document.documentElement.lang,
              overflow:
                document.documentElement.scrollWidth > window.innerWidth,
              scripts: document.querySelectorAll(
                'script:not([type="application/ld+json"])',
              ).length,
              background: getComputedStyle(document.body).backgroundColor,
              fontSize: getComputedStyle(document.body).fontSize,
              scrollBehavior: getComputedStyle(document.documentElement)
                .scrollBehavior,
              noindex:
                document
                  .querySelector('meta[name="robots"]')
                  ?.content.includes("noindex") ?? false,
            };
          });
          assert.equal(state.h1, 1, `${label}: h1 count`);
          assert.equal(state.main, 1, `${label}: main count`);
          assert.equal(state.language, "en");
          assert.equal(state.scripts, 0, `${label}: executable script`);
          assert.equal(state.overflow, false, `${label}: horizontal overflow`);
          assert.equal(state.fontSize, "16px");
          assert.equal(
            state.scrollBehavior,
            "auto",
            `${label}: reduced-motion scrolling`,
          );
          assert.equal(
            state.background,
            colorScheme === "light" ? "rgb(255, 255, 255)" : "rgb(23, 37, 43)",
          );
          assert.ok(
            state.headings.every((heading, index) =>
              index === 0
                ? heading === 1
                : heading <= state.headings[index - 1] + 1,
            ),
            `${label}: heading order`,
          );
          assert.ok(
            state.links.every(
              (link) => link.width >= 43.9 && link.height >= 43.9,
            ),
            `${label}: undersized links: ${JSON.stringify(state.links.filter((link) => link.width < 43.9 || link.height < 43.9))}`,
          );
          if (width === 360 && colorScheme === "light") {
            assert.ok(!titles.has(state.title), `${label}: duplicate title`);
            assert.ok(
              !descriptions.has(state.description),
              `${label}: duplicate description`,
            );
            titles.add(state.title);
            descriptions.add(state.description);
          }
          if (!state.noindex)
            assert.ok(
              state.metadata[0]["@graph"].some(
                (item) => item["@type"] === "Person",
              ) &&
                state.metadata[0]["@graph"].some(
                  (item) => item["@type"] === "WebSite",
                ),
            );
          await page.keyboard.press("Tab");
          assert.equal(
            await page.locator(":focus").textContent(),
            "Skip to content",
            `${label}: first keyboard stop`,
          );
          assert.ok(
            await page
              .locator(":focus")
              .evaluate(
                (element) => getComputedStyle(element).outlineStyle !== "none",
              ),
            `${label}: focus outline`,
          );
          await page.keyboard.press("Enter");
          assert.equal(
            await page.locator(":focus").getAttribute("id"),
            "main-content",
            `${label}: skip target`,
          );
          await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
          const expectedOrder = await page
            .locator("a")
            .evaluateAll((elements) => elements.map((element) => element.href));
          for (const href of expectedOrder) {
            await page.keyboard.press("Tab");
            assert.equal(
              await page
                .locator(":focus")
                .getAttribute("href")
                .then((value) => new URL(value, `${origin}${path}`).href),
              href,
              `${label}: keyboard order`,
            );
          }
          await page.locator("body").click({ position: { x: 1, y: 1 } });
          await page.addScriptTag({ path: axePath });
          const audit = await page.evaluate(async () =>
            window.axe.run(document, {
              runOnly: {
                type: "tag",
                values: [
                  "wcag2a",
                  "wcag2aa",
                  "wcag21a",
                  "wcag21aa",
                  "best-practice",
                ],
              },
            }),
          );
          assert.equal(
            audit.violations.length,
            0,
            `${label}: axe violations: ${JSON.stringify(audit.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })))}`,
          );
          await page.screenshot({
            path: `reports/screenshots/${path === paths[0] ? "home" : path.replaceAll("/", "-")}-${width}-${colorScheme}.png`,
            fullPage: true,
          });
          results.push({
            path,
            width,
            colorScheme,
            violations: 0,
            headings: state.headings,
            links: state.links.length,
            overflow: false,
          });
        } catch (error) {
          failures.push({ label, error: error.message });
        }
      }
      assert.equal(
        consoleErrors.length,
        0,
        `Browser errors: ${consoleErrors.join("; ")}`,
      );
      await context.close();
    }
  }
  const page = await browser.newPage();
  await page.goto(`${origin}${paths[0]}`);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "smooth",
  );
  await page.emulateMedia({ media: "print", colorScheme: "dark" });
  assert.equal(
    await page
      .locator("header")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );
  assert.equal(
    await page
      .locator("footer")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );
  assert.equal(
    await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
    "rgb(255, 255, 255)",
  );
  await page.close();
  await writeFile(
    "reports/browser-audit.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        results,
        failures,
        print: "pass",
        motion: "pass",
      },
      null,
      2,
    ),
  );
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
  console.log(
    `Browser audit passed: ${results.length} page/viewport/color combinations; zero axe violations, horizontal overflow, executable scripts, or console errors. Keyboard order, focus, skip link, reduced motion, metadata, and print checks passed.`,
  );
} finally {
  await browser.close();
}
