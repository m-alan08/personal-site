import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import { browserOptions, pagePaths } from "./test-server.mjs";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4322";
const pass = process.env.QA_PASS || "final";
const schemes =
  process.env.QA_SCHEMES === "both" ? ["dark", "light"] : ["dark"];
const browser = await chromium.launch(browserOptions());
const paths = await pagePaths();
const directory = `reports/screenshots/${pass}`;
await mkdir(directory, { recursive: true });
const results = [];
const failures = [];
const descriptions = new Set();
const titles = new Set();
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];
async function scan(page, label) {
  const audit = await page.evaluate(
    async (values) =>
      window.axe.run(document, { runOnly: { type: "tag", values } }),
    tags,
  );
  assert.equal(
    audit.violations.length,
    0,
    `${label}: ${JSON.stringify(audit.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })))}`,
  );
}
try {
  for (const colorScheme of schemes) {
    for (const width of [360, 768, 1280]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      for (const path of paths) {
        const label = `${path} ${width}px ${colorScheme}`;
        const errors = [];
        const errorListener = (error) => errors.push(error.message);
        const consoleListener = (message) => {
          if (message.type() === "error") errors.push(message.text());
        };
        page.on("pageerror", errorListener);
        page.on("console", consoleListener);
        try {
          const response = await page.goto(`${origin}${path}`, {
            waitUntil: "networkidle",
          });
          assert.equal(response.status(), 200, `${label}: response`);
          const graph = page.locator("[data-connection-graph]");
          if (await graph.count()) {
            await graph.scrollIntoViewIfNeeded();
            await page.waitForFunction(
              () =>
                document.querySelector("[data-connection-graph]").dataset
                  .ready === "true",
            );
            await page.evaluate(() => window.scrollTo(0, 0));
          }
          const state = await page.evaluate(() => {
            const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
              .filter((element) => !element.closest("dialog"))
              .map((element) => Number(element.tagName.slice(1)));
            const targets = [
              ...document.querySelectorAll("a,button,input,summary"),
            ]
              .filter(
                (element) =>
                  element.getBoundingClientRect().width > 1 &&
                  element.getBoundingClientRect().height > 1,
              )
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  text: element.textContent.trim(),
                  width: rect.width,
                  height: rect.height,
                };
              });
            return {
              headings,
              targets,
              title: document.title,
              description: document.querySelector('meta[name="description"]')
                .content,
              h1: document.querySelectorAll("h1").length,
              main: document.querySelectorAll("main").length,
              language: document.documentElement.lang,
              overflow:
                document.documentElement.scrollWidth > window.innerWidth,
              background: getComputedStyle(document.body).backgroundColor,
              fontSize: getComputedStyle(document.body).fontSize,
              scrollBehavior: getComputedStyle(document.documentElement)
                .scrollBehavior,
              scripts: [...document.querySelectorAll("script[src]")].map(
                (script) => script.src,
              ),
              structured: document.querySelector(
                'script[type="application/ld+json"]',
              )?.textContent,
              noindex:
                document
                  .querySelector('meta[name="robots"]')
                  ?.content.includes("noindex") ?? false,
            };
          });
          assert.equal(state.h1, 1);
          assert.equal(state.main, 1);
          assert.equal(state.language, "en");
          assert.equal(state.overflow, false, `${label}: overflow`);
          assert.equal(
            state.background,
            "rgb(16, 21, 30)",
            `${label}: dark-only theme`,
          );
          assert.equal(state.fontSize, "16px");
          assert.equal(state.scrollBehavior, "auto");
          assert.ok(
            state.scripts.every((source) => new URL(source).origin === origin),
            `${label}: external scripts`,
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
            state.targets.every(
              (target) => target.width >= 43.9 && target.height >= 43.9,
            ),
            `${label}: undersized targets ${JSON.stringify(state.targets.filter((target) => target.width < 43.9 || target.height < 43.9))}`,
          );
          if (width === 360 && colorScheme === schemes[0]) {
            assert.ok(!titles.has(state.title));
            assert.ok(!descriptions.has(state.description));
            titles.add(state.title);
            descriptions.add(state.description);
          }
          if (!state.noindex) {
            const data = JSON.parse(state.structured)["@graph"];
            assert.ok(
              data.some((item) => item["@type"] === "Person") &&
                data.some((item) => item["@type"] === "WebSite"),
            );
          }
          await page.keyboard.press("Tab");
          assert.equal(
            await page.locator(":focus").textContent(),
            "Skip to content",
            `${label}: first stop`,
          );
          assert.notEqual(
            await page
              .locator(":focus")
              .evaluate((element) => getComputedStyle(element).outlineStyle),
            "none",
          );
          await page.keyboard.press("Enter");
          assert.equal(
            await page.locator(":focus").getAttribute("id"),
            "main-content",
          );
          await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
          if (await graph.count()) {
            await graph.scrollIntoViewIfNeeded();
            await page.waitForFunction(
              () =>
                document.querySelector("[data-connection-graph]").dataset
                  .ready === "true",
            );
            await page.evaluate(() => window.scrollTo(0, 0));
          }
          const focusables = await page
            .locator("a[href],button:not([disabled]),input,summary")
            .evaluateAll((elements) =>
              elements
                .filter(
                  (element) =>
                    !element.closest("dialog:not([open])") &&
                    element.getBoundingClientRect().width > 0 &&
                    element.getBoundingClientRect().height > 0,
                )
                .map((element, index) => {
                  element.dataset.auditFocus = String(index);
                  return String(index);
                }),
            );
          for (const index of focusables) {
            await page.keyboard.press("Tab");
            assert.equal(
              await page.locator(":focus").getAttribute("data-audit-focus"),
              index,
              `${label}: keyboard order`,
            );
            assert.notEqual(
              await page
                .locator(":focus")
                .evaluate((element) => getComputedStyle(element).outlineStyle),
              "none",
            );
          }
          await page.locator("[data-palette-open]").focus();
          await page.keyboard.press("Control+k");
          await page.waitForFunction(
            () => document.querySelector("#command-palette").open,
          );
          await page.addScriptTag({ path: axePath });
          await scan(page, `${label} palette open`);
          await page.keyboard.press("Tab");
          assert.ok(
            await page
              .locator(":focus")
              .evaluate((element) => Boolean(element.closest("dialog"))),
          );
          await page.keyboard.press("Escape");
          assert.ok(
            await page
              .locator("[data-palette-open]")
              .evaluate((element) => element === document.activeElement),
          );
          await scan(page, label);
          await page.locator("body").click({ position: { x: 1, y: 1 } });
          await page.evaluate(() => window.scrollTo(0, 0));
          const slug =
            path === paths[0]
              ? "home"
              : path
                  .slice(paths[0].length)
                  .replaceAll("/", "-")
                  .replace(/-$/, "");
          await page.screenshot({
            path: `${directory}/${slug}-${width}-${colorScheme}.png`,
            fullPage: true,
          });
          assert.deepEqual(errors, [], `${label}: console errors`);
          results.push({
            path,
            width,
            colorScheme,
            axeViolations: 0,
            overflow: false,
            keyboard: "pass",
            palette: "pass",
          });
          console.log(`PASS ${label}`);
        } catch (error) {
          failures.push({ label, error: error.message });
        }
        page.off("pageerror", errorListener);
        page.off("console", consoleListener);
      }
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
  for (const selector of ["header", "footer"])
    assert.equal(
      await page
        .locator(selector)
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
    `reports/browser-audit-${pass}.json`,
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        origin,
        pass,
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
    `Browser audit passed: ${results.length} combinations; dark theme, contrast, keyboard order, palette, skip link, reduced motion, metadata, targets and print.`,
  );
} finally {
  await browser.close();
}
