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
    if (path.endsWith("/projects/")) {
      assert.equal(
        await page.locator("[data-project-category]:visible").count(),
        4,
      );
      await page
        .getByRole("button", { name: "Hackathons", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelectorAll("[data-project-category]:not([hidden])")
            .length === 2,
      );
      assert.equal(
        await page.locator("[data-project-category]:visible").count(),
        2,
      );
      await page
        .getByRole("button", { name: "All projects", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelectorAll("[data-project-category]:not([hidden])")
            .length === 4,
      );
      assert.equal(
        await page.locator("[data-project-category]:visible").count(),
        4,
      );
    }
    if (path === server.paths[0]) {
      await page.waitForFunction(
        () =>
          document.querySelector("[data-policy-hero]").dataset.ready === "true",
      );
      const edges = await page
        .locator("[data-policy-weight]")
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute("opacity")),
        );
      await page.locator('[data-policy-bits="2"]').click();
      assert.equal(
        await page
          .locator('[data-policy-bits="2"]')
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.notDeepEqual(
        await page
          .locator("[data-policy-weight]")
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute("opacity")),
          ),
        edges,
      );
    }
    if (path.endsWith("/constellation/")) {
      assert.equal(await page.locator("[data-connection-graph]").count(), 1);
      await page.locator("[data-connection-graph]").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () =>
          document.querySelector("[data-connection-graph]").dataset.ready ===
          "true",
      );
      const node = page.locator('[data-graph-node="0"]');
      const initialPosition = await node.getAttribute("transform");
      await page.locator('[data-graph-select="0"]').focus();
      await page.keyboard.press("Space");
      assert.equal(
        await page
          .locator('[data-graph-select="0"]')
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.match(
        await page.locator("[data-graph-status]").textContent(),
        /Node A: 2 illustrative connections/,
      );
      assert.match(
        await page.locator("[data-graph-status]").textContent(),
        /Linked examples: B, C/,
      );
      assert.match(
        await page.locator("#connection-graph-edges").textContent(),
        /Example A connects to Example C/,
      );
      await page.keyboard.press("ArrowRight");
      assert.notEqual(await node.getAttribute("transform"), initialPosition);
      await page.locator("[data-graph-reset]").click();
      assert.equal(await node.getAttribute("transform"), initialPosition);
      const box = await node.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        box.x + box.width / 2 + 15,
        box.y + box.height / 2 + 10,
        { steps: 4 },
      );
      await page.mouse.up();
      assert.notEqual(await node.getAttribute("transform"), initialPosition);
      await page.locator("[data-graph-reset]").click();
      assert.equal(await node.getAttribute("transform"), initialPosition);
    }
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
