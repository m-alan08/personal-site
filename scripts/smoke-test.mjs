import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";
import { bitWidths, datasets, methods } from "../src/data/explorerData.ts";
import { chartY } from "../src/components/explorer/chart.ts";
import { playgroundCopy } from "../src/content/playground.ts";
import { readFile } from "node:fs/promises";

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
function measured(task, method, bits) {
  return datasets.find((set) => set.task === task)?.results[method]?.[bits];
}
async function testExplorer(page) {
  const explorer = page.locator("section#explorer");
  assert.equal(await explorer.count(), 1, "explorer: section");
  assert.equal(await explorer.locator("h2").count(), 1, "explorer: h2");
  const ui = explorer.locator("[data-explorer-ui]");
  const tables = explorer.locator("[data-explorer-static] table");
  assert.equal(await ui.isHidden(), true, "explorer: lazy before scroll");
  assert.equal(await tables.count(), datasets.length, "explorer: tables");
  for (let index = 0; index < datasets.length; index += 1) {
    assert.equal(
      await tables.nth(index).locator("tbody tr").count(),
      bitWidths.length,
      `explorer: ${datasets[index].task} table rows`,
    );
  }
  const cells = await explorer
    .locator("td[data-value]")
    .evaluateAll((elements) => elements.map((element) => element.dataset));
  assert.equal(
    cells.length,
    datasets.length * methods.length * bitWidths.length,
  );
  for (const cell of cells) {
    const expected = measured(cell.task, cell.method, cell.bits);
    assert.notEqual(expected, undefined, `explorer: table cell ${cell.bits}`);
    assert.equal(cell.value, expected ? String(expected[0]) : "");
  }
  await explorer.scrollIntoViewIfNeeded();
  await ui.waitFor({ state: "visible" });
  assert.equal(
    await tables.first().isHidden(),
    true,
    "explorer: table replaced",
  );
  const points = await explorer
    .locator("[data-point]")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        ...element.dataset,
        cy: Number(element.getAttribute("cy")),
      })),
    );
  const expectedPoints = datasets.flatMap((set) =>
    methods.flatMap((method) =>
      bitWidths.filter((bits) => set.results[method.id][bits] !== null),
    ),
  );
  assert.equal(points.length, expectedPoints.length, "explorer: plotted count");
  for (const point of points) {
    const expected = measured(point.task, point.method, point.bits);
    assert.ok(expected, `explorer: plotted ${point.task} ${point.bits}`);
    assert.equal(Number(point.value), expected[0], "explorer: plotted value");
    assert.ok(Math.abs(point.cy - chartY(expected[0])) < 0.01);
  }
  const value = explorer.locator("[data-explorer-value]");
  const status = explorer.locator("[data-explorer-status]");
  async function expectShown(task, method, bits) {
    const expected = measured(task, method, bits);
    const text = expected ? `${expected[0].toFixed(1)}%` : "Not measured";
    assert.equal(
      await value.textContent(),
      text,
      `explorer: ${task} ${method} ${bits}`,
    );
    assert.ok(
      (await status.textContent()).includes(text),
      "explorer: live status",
    );
  }
  assert.equal(await status.getAttribute("aria-live"), "polite");
  await expectShown("fetch-push", "qat-scratch", "5");
  await explorer.locator('input[type="range"]').focus();
  await page.keyboard.press("ArrowRight");
  await expectShown("fetch-push", "qat-scratch", "4");
  await explorer.locator('input[name="explorer-method"]:checked').focus();
  await page.keyboard.press("ArrowLeft");
  await expectShown("fetch-push", "qat-finetune", "4");
  const outline = await explorer
    .locator('input[name="explorer-method"]:checked')
    .evaluate((input) => getComputedStyle(input.closest("label")).outlineStyle);
  assert.notEqual(outline, "none", "explorer: visible focus");
  await explorer.locator('input[name="explorer-task"]:checked').focus();
  await page.keyboard.press("ArrowLeft");
  await expectShown("fetch-reach", "qat-finetune", "4");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("End");
  await expectShown("fetch-reach", "qat-finetune", "2");
  console.log(
    `PASS explorer: ${cells.length} table cells and ${points.length} plotted points match explorerData.ts, keyboard updates the value`,
  );
}
async function testPlayground(page) {
  const section = page.locator("section#playground");
  assert.equal(await section.count(), 1, "playground: section");
  assert.equal(await section.locator("h2").count(), 1, "playground: h2");
  const weights = [];
  page.on("request", (request) => {
    if (request.url().includes("/models/fetch-reach/"))
      weights.push(request.url());
  });
  await section.scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  assert.deepEqual(weights, [], "playground: policy waits for intent");
  assert.equal(
    await section.evaluate((element) => "playgroundReady" in element.dataset),
    false,
    "playground: script waits for intent",
  );
  const status = section.locator("[data-playground-status]");
  assert.equal(await status.textContent(), playgroundCopy.hint);
  const stage = section.locator("[data-playground-stage]");
  const box = await stage.boundingBox();
  await page.mouse.click(box.x + box.width * 0.72, box.y + box.height * 0.5);
  await page.waitForFunction(
    (text) =>
      document.querySelector("[data-playground-status]").textContent === text,
    playgroundCopy.status.reached,
    { timeout: 5000 },
  );
  const reached = await section.locator('[data-metric="steps"]').textContent();
  assert.match(reached, /^\d+ \/ 50$/, "playground: steps to reach");
  assert.ok(weights.some((url) => url.endsWith("actor-fp32.bin")));
  await stage.focus();
  const before = await section
    .locator("[data-playground-target]")
    .getAttribute("transform");
  await page.keyboard.press("ArrowUp");
  assert.notEqual(
    await section.locator("[data-playground-target]").getAttribute("transform"),
    before,
    "playground: keyboard moves target",
  );
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.88);
  await page.waitForFunction(
    (text) =>
      document.querySelector("[data-playground-status]").textContent === text,
    playgroundCopy.status.table,
    { timeout: 5000 },
  );
  await section.locator("[data-playground-details] summary").click();
  const manifest = JSON.parse(
    await readFile("public/models/fetch-reach/policy.json", "utf8"),
  );
  const fp32 = manifest.variants.find((variant) => variant.id === "fp32");
  await section.locator("[data-playground-benchmark]").click();
  await page.waitForFunction(
    () => !document.querySelector("[data-playground-benchmark]").disabled,
    null,
    { timeout: 30000 },
  );
  const success = await section
    .locator('[data-benchmark-row="browser"] [data-cell="success"]')
    .textContent();
  assert.equal(
    success,
    `${Math.round(fp32.validation.surrogate.successRate * 100)}%`,
    "playground: browser benchmark matches export",
  );
  await section.locator('label:has(input[value="proportional"])').click();
  assert.equal(
    await section
      .locator("[data-playground-precision]")
      .evaluate((fieldset) => fieldset.disabled),
    true,
    "playground: precision off for scripted controller",
  );
  console.log(
    `PASS playground: lazy weights, reach in ${reached} steps, table target refused, browser benchmark ${success}`,
  );
}
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
      await testPlayground(page);
      await testExplorer(page);
      await page.evaluate(() => window.scrollTo(0, 0));
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
