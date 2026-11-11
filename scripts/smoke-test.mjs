import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";

const sectionIds = [
  "about",
  "projects",
  "exploring",
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
      colorScheme: "dark",
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
      assert.deepEqual(
        await page
          .locator("main section[id]")
          .evaluateAll((elements) => elements.map((element) => element.id))
          .then((ids) => ids.filter((id) => sectionIds.includes(id))),
        sectionIds,
        "home: section order",
      );
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
  {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    watch(page, `${home}#research`);
    await page.goto(`${server.origin}${home}#research`, {
      waitUntil: "networkidle",
    });
    const gap = await page.evaluate(() => {
      const anchor = document.getElementById("research");
      const section = document.getElementById("exploring");
      return Math.abs(
        section.getBoundingClientRect().top -
          anchor.getBoundingClientRect().bottom,
      );
    });
    const top = await page
      .locator("#exploring")
      .evaluate((element) => element.getBoundingClientRect().top);
    assert.ok(gap < 1, "#research anchor touches #exploring");
    assert.ok(
      top >= 0 && top < 120,
      `#research scrolls to #exploring (${top})`,
    );
    await page.close();
    console.log(`PASS ${home}#research: scrolls to #exploring`);
  }
  assert.deepEqual(errors, []);
  console.log(
    `Smoke tests passed: ${server.paths.length} pages, ${Object.keys(legacyRedirects).length} redirects.`,
  );
} finally {
  await browser.close();
  await server.close();
}
