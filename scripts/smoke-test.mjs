import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";

const sectionIds = [
  "about",
  "projects",
  "research",
  "writing",
  "experience",
  "contact",
];
const legacyRedirects = {
  about: "about",
  contact: "contact",
  resume: "contact",
  projects: "projects",
};
const server = await serveBuild();
const browser = await chromium.launch(browserOptions());
const errors = [];
const home = server.paths[0];
function watch(page, path) {
  page.on("pageerror", (error) => errors.push(`${path}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${path}: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${path}: HTTP ${response.status()} ${response.url()}`);
  });
}
try {
  for (const path of server.paths) {
    const page = await browser.newPage({
      viewport: { width: 360, height: 800 },
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    watch(page, path);
    const response = await page.goto(`${server.origin}${path}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, `${path}: loads`);
    assert.equal(await page.locator("h1").count(), 1, `${path}: one h1`);
    assert.equal(await page.locator("dialog").count(), 0, `${path}: dialogs`);
    const navigation = page.getByRole("navigation", { name: "Main" });
    assert.equal(
      await navigation.getByRole("link").count(),
      sectionIds.length,
      `${path}: navigation`,
    );
    if (path === home) {
      for (const id of sectionIds) {
        const section = page.locator(`section#${id}`);
        assert.equal(await section.count(), 1, `home: #${id}`);
        assert.equal(await section.locator("h2").count(), 1, `home: #${id} h2`);
      }
      await navigation.getByRole("link").nth(1).click();
      await page.waitForURL((url) => url.hash === "#projects");
      const details = page.locator('#projects a[href*="/projects/"]');
      assert.ok((await details.count()) > 0, "home: project detail links");
      const href = await details.first().getAttribute("href");
      await details.first().click();
      await page.waitForURL((url) => url.pathname === href);
      assert.equal(await page.locator("h1").count(), 1, `${href}: one h1`);
    }
    await page.close();
    console.log(`PASS ${path}: load, one h1, navigation, no errors`);
  }
  for (const [legacy, id] of Object.entries(legacyRedirects)) {
    const path = `${home}${legacy}/`;
    const page = await browser.newPage();
    page.on("pageerror", (error) => errors.push(`${path}: ${error.message}`));
    const response = await page.goto(`${server.origin}${path}`);
    assert.equal(response.status(), 200, `${path}: loads`);
    await page.waitForURL(
      (url) => url.pathname === home && url.hash === `#${id}`,
    );
    await page.close();
    console.log(`PASS ${path}: redirects to #${id}`);
  }
  assert.deepEqual(errors, []);
  console.log(
    `Smoke tests passed: ${server.paths.length} pages, ${Object.keys(legacyRedirects).length} redirects.`,
  );
} finally {
  await browser.close();
  await server.close();
}
