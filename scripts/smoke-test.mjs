import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";

const server = await serveBuild();
const browser = await chromium.launch(browserOptions());
const errors = [];
try {
  for (const path of server.paths) {
    const page = await browser.newPage({
      viewport: { width: 360, height: 800 },
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(`${path}: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${path}: ${message.text()}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${path}: HTTP ${response.status()} ${response.url()}`);
    });
    const response = await page.goto(`${server.origin}${path}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, `${path}: loads`);
    assert.equal(await page.locator("h1").count(), 1, `${path}: one h1`);
    await page.locator("[data-palette-open]").focus();
    await page.keyboard.press("Control+k");
    await page.waitForFunction(
      () => document.querySelector("#command-palette").open,
    );
    assert.equal(
      await page.locator(":focus").getAttribute("id"),
      "palette-query",
    );
    await page.locator("#palette-query").fill("projects");
    assert.ok(
      (await page.locator("[data-palette-entry]:not([hidden])").count()) > 0,
    );
    await page.keyboard.press("ArrowDown");
    assert.equal(
      await page.locator(":focus").evaluate((element) => element.tagName),
      "A",
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator("#command-palette")
        .evaluate((element) => element.open),
      false,
    );
    assert.ok(
      await page
        .locator("[data-palette-open]")
        .evaluate((element) => element === document.activeElement),
    );
    await page.keyboard.press("Meta+k");
    await page.waitForFunction(
      () => document.querySelector("#command-palette").open,
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator("#command-palette")
        .evaluate((element) => element.open),
      false,
    );
    await page.close();
    console.log(
      `PASS ${path}: load, one h1, keyboard palette, focus return, no errors`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(`Smoke tests passed: ${server.paths.length} pages.`);
} finally {
  await browser.close();
  await server.close();
}
