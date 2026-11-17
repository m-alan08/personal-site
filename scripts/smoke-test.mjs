import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";
import { heroSnapshot, heroWidths, wordsAfterHero } from "./home-snapshot.mjs";
import { bitWidths, datasets, methods } from "../src/data/explorerData.ts";
import { chartY } from "../src/components/explorer/chart.ts";
import { playgroundCopy } from "../src/content/playground.ts";
import { readFile } from "node:fs/promises";

const baseline = JSON.parse(
  await readFile("scripts/fixtures/home-baseline.json", "utf8"),
);
const navigationIds = ["projects", "writing", "experience", "contact"];
const homeOrder = ["playground", "experience", "projects", "writing"];
const removedSelectors = [
  "section#about",
  "section#exploring",
  "section#explorer",
  "section#contact",
  "#current-heading",
  "[data-hierarchy]",
];
const anchorTargets = {
  about: "experience",
  experience: "experience",
  projects: "projects",
  exploring: "writing",
  research: "writing",
  writing: "writing",
  contact: "contact",
};
const legacyRedirects = {
  about: "about",
  contact: "contact",
  resume: "contact",
};
function measured(task, method, bits) {
  return datasets.find((set) => set.task === task)?.results[method]?.[bits];
}
async function openAllDetails(page) {
  await page.evaluate(() => {
    for (const details of document.querySelectorAll("main details"))
      details.open = true;
  });
}
async function testTypography(page, label, checkBody) {
  const result = await page.evaluate(() => {
    const hero = document.querySelector("main > section:first-of-type");
    const small = [];
    const body = [];
    const walker = document.createTreeWalker(
      document.body,
      window.NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent.trim();
      const element = node.parentElement;
      if (!text || !element) continue;
      if (element.closest("script, style, noscript, .sr-only")) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if (![...range.getClientRects()].some((rect) => rect.width > 0)) continue;
      const style = getComputedStyle(element);
      let size = parseFloat(style.fontSize);
      if (element instanceof window.SVGElement) {
        const matrix = element.getScreenCTM();
        if (matrix) size *= Math.hypot(matrix.a, matrix.b);
      }
      const sample = `"${text.slice(0, 32)}" ${size.toFixed(1)}px`;
      if (size < 12.95) small.push(sample);
      const block = element.closest("p, li");
      if (
        block &&
        !hero?.contains(block) &&
        !element.closest("header, a, button, summary, label, figure, table") &&
        style.textTransform !== "uppercase" &&
        !style.fontFamily.includes("Mono") &&
        size < 17.95
      )
        body.push(sample);
    }
    return { small, body };
  });
  return [
    ...result.small.map((sample) => `${label}: under 13px ${sample}`),
    ...(checkBody
      ? result.body.map((sample) => `${label}: body under 18px ${sample}`)
      : []),
  ];
}
async function testExplorer(page) {
  const explorer = page.locator("[data-explorer]");
  assert.equal(await explorer.count(), 1, "explorer: panel");
  const ui = explorer.locator("[data-explorer-ui]");
  const tables = explorer.locator("[data-explorer-static] table");
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
    .evaluateAll((elements) =>
      elements.map((element) => ({
        ...element.dataset,
        text: element.textContent.replace(/\s+/g, " ").trim(),
      })),
    );
  assert.equal(
    cells.length,
    datasets.length * methods.length * bitWidths.length,
  );
  for (const cell of cells) {
    const expected = measured(cell.task, cell.method, cell.bits);
    assert.notEqual(expected, undefined, `explorer: table cell ${cell.bits}`);
    assert.equal(cell.value, expected ? String(expected[0]) : "");
    if (expected)
      assert.equal(
        cell.text,
        `${expected[0].toFixed(1)} (${expected[1]} to ${expected[2]})`,
        "explorer: cell reads mean (low to high)",
      );
  }
  await ui.waitFor({ state: "attached" });
  await page.waitForFunction(
    () => !document.querySelector("[data-explorer-ui]").hidden,
    null,
    { timeout: 5000 },
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
  const details = explorer.locator("xpath=ancestor::details[1]");
  await details.locator("summary").click();
  await ui.waitFor({ state: "visible" });
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
  await details.locator("summary").click();
  console.log(
    `PASS explorer: ${cells.length} table cells read "mean (low to high)" and ${points.length} plotted points match explorerData.ts, keyboard updates the value`,
  );
}
async function testToggles(page, label) {
  const toggles = page.locator("main details");
  const count = await toggles.count();
  assert.ok(count > 0, `${label}: toggles`);
  for (let index = 0; index < count; index += 1) {
    const toggle = toggles.nth(index);
    assert.equal(
      await toggle.evaluate((details) => details.open),
      false,
      `${label}: toggle ${index} closed by default`,
    );
    const summary = toggle.locator(":scope > summary");
    assert.match(
      (await summary.textContent()).trim(),
      /\S/,
      `${label}: toggle ${index} summary`,
    );
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    assert.equal(await toggle.evaluate((details) => details.open), true);
    const shown = toggle.locator(
      ":scope table:visible, :scope svg[role='img']:visible, :scope ol:visible, :scope [data-explorer-ui]:visible",
    );
    assert.ok(
      (await shown.count()) > 0,
      `${label}: toggle ${index} shows its chart, table or steps`,
    );
    const chart = toggle.locator(":scope [data-how-chart] svg");
    if (await chart.count())
      assert.equal(await chart.first().isVisible(), true, `${label}: chart`);
    await summary.click();
  }
  console.log(`PASS ${label}: ${count} How it works toggles closed, then open`);
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
  const visibleControls = await section
    .locator("button:visible, input:visible, select:visible")
    .count();
  assert.equal(visibleControls, 1, "playground: only precision is visible");
  const readout = section.locator('[data-metric="distance"]');
  assert.equal(await readout.isVisible(), true, "playground: one readout");
  const readoutBefore = await readout.textContent();
  const status = section.locator("[data-playground-status]");
  assert.equal(await status.textContent(), playgroundCopy.hint);
  const stage = section.locator("[data-playground-stage]");
  const target = section.locator("[data-playground-target]");
  const targetBefore = await target.getAttribute("transform");
  const box = await stage.boundingBox();
  await page.mouse.click(box.x + box.width * 0.72, box.y + box.height * 0.5);
  await page.waitForFunction(
    (text) =>
      document.querySelector("[data-playground-status]").textContent === text,
    playgroundCopy.status.reached,
    { timeout: 5000 },
  );
  assert.notEqual(
    await target.getAttribute("transform"),
    targetBefore,
    "playground: click places the target",
  );
  const readoutAfter = await readout.textContent();
  assert.notEqual(readoutAfter, readoutBefore, "playground: readout changes");
  const reached = await section.locator('[data-metric="steps"]').textContent();
  assert.match(reached, /^\d+ \/ 50$/, "playground: steps to reach");
  assert.ok(weights.some((url) => url.endsWith("actor-fp32.bin")));
  await stage.focus();
  const before = await target.getAttribute("transform");
  await page.keyboard.press("ArrowUp");
  assert.notEqual(
    await target.getAttribute("transform"),
    before,
    "playground: keyboard moves target",
  );
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.88);
  await page.waitForFunction(
    (text) =>
      document.querySelector("[data-playground-status]").textContent === text,
    playgroundCopy.status.table,
    { timeout: 1000 },
  );
  assert.equal(
    await section.locator('[data-metric="steps"]').textContent(),
    playgroundCopy.notYet,
    "playground: table target not attempted",
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
      .evaluate((select) => select.disabled),
    true,
    "playground: precision off for scripted controller",
  );
  await section.locator('label:has(input[value="policy"])').click();
  await section.locator("[data-playground-details] summary").click();
  console.log(
    `PASS playground: lazy weights, click moved the target and the readout went from "${readoutBefore}" to "${readoutAfter}", reach in ${reached} steps, browser benchmark ${success}`,
  );
}
async function testHomeStructure(page) {
  const order = await page
    .locator("main > section[id]")
    .evaluateAll((elements) => elements.map((element) => element.id));
  assert.deepEqual(order, homeOrder, "home: section order after the hero");
  assert.equal(
    await page
      .locator("main > section:first-of-type")
      .getAttribute("aria-labelledby"),
    "intro-heading",
    "home: hero comes first",
  );
  for (const selector of removedSelectors)
    assert.equal(await page.locator(selector).count(), 0, `home: ${selector}`);
  for (const id of [...homeOrder, "contact"]) {
    const block = page.locator(`#${id}`);
    assert.equal(await block.count(), 1, `home: #${id}`);
    assert.ok(
      (await block.locator("h2").count()) <= 1,
      `home: #${id} has at most one h2`,
    );
  }
  assert.equal(
    await page.locator("footer#contact").count(),
    1,
    "home: contact is the footer",
  );
  const emails = await page
    .locator('footer a[href^="mailto:"]')
    .evaluateAll((links) => links.map((link) => link.href));
  assert.equal(emails.length, 1, "footer: one email");
  for (const name of ["GitHub", "X", "LinkedIn", "Resume"])
    assert.equal(
      await page.locator("footer").getByRole("link", { name }).count(),
      1,
      `footer: ${name}`,
    );
  const words = await wordsAfterHero(page);
  console.log(
    `Words after the hero: before ${baseline.wordsAfterHero}, after ${words}`,
  );
  assert.ok(words < baseline.wordsAfterHero, "home: fewer words after hero");
  console.log(`PASS home: order ${homeOrder.join(", ")}, footer#contact`);
}
async function testHero(browser, origin, home) {
  for (const width of heroWidths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    await page.goto(`${origin}${home}`, { waitUntil: "networkidle" });
    const snapshot = await heroSnapshot(page);
    const expected = baseline.hero[width];
    assert.equal(snapshot.html, expected.html, `hero ${width}: HTML`);
    assert.deepEqual(snapshot.styles, expected.styles, `hero ${width}: styles`);
    await page.close();
  }
  console.log(
    `PASS hero: HTML and computed styles match main at ${heroWidths.join("px and ")}px`,
  );
}
const server = await serveBuild();
const browser = await chromium.launch(browserOptions());
const errors = [];
const home = server.paths[0];
const projectsPage = `${home}projects/`;
const caseStudies = server.paths.filter((path) =>
  /\/projects\/[^/]+\/$/.test(path),
);
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
  assert.ok(server.paths.includes(projectsPage), "sitemap: /projects/");
  await testHero(browser, server.origin, home);
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
    const menuToggle = navigation.locator("summary");
    assert.ok(await menuToggle.count(), `${path}: menu disclosure`);
    await menuToggle.click();
    const navLinks = navigation.getByRole("link");
    assert.deepEqual(
      await navLinks.evaluateAll((links) =>
        links.map((link) => new URL(link.href).hash.slice(1)),
      ),
      navigationIds,
      `${path}: navigation`,
    );
    assert.equal(
      await navigation.locator("details .tabular-nums").count(),
      0,
      `${path}: no numbers in the menu`,
    );
    await menuToggle.click();
    if (path === home) {
      await testHomeStructure(page);
      await testPlayground(page);
      await testToggles(page, "home");
      await page.evaluate(() => window.scrollTo(0, 0));
      await menuToggle.click();
      await navLinks.first().click();
      await page.waitForURL((url) => url.hash === "#projects");
      const details = page.locator('#projects h3 a[href*="/projects/"]');
      assert.equal(await details.count(), 3, "home: three selected projects");
      const href = await details.first().getAttribute("href");
      await details.first().click();
      await page.waitForURL((url) => url.pathname === href);
      assert.equal(await page.locator("h1").count(), 1, `${href}: one h1`);
    }
    if (path === projectsPage) {
      const entries = await page
        .locator("article[data-project-entry]")
        .evaluateAll((elements) => elements.map((element) => element.id));
      assert.deepEqual(
        [...entries].sort(),
        caseStudies.map((study) => study.split("/").at(-2)).sort(),
        "projects: every project has a row",
      );
      for (const id of entries) {
        const row = page.locator(`article#${id}`);
        assert.equal(await row.locator("h2").count(), 1, `projects: ${id} h2`);
        assert.ok(
          (await row.locator('a[href*="/projects/"]').count()) > 0,
          `projects: ${id} case study link`,
        );
      }
      await testToggles(page, "projects");
      await testExplorer(page);
      console.log(`PASS ${path}: ${entries.length} projects listed`);
    }
    await page.close();
    console.log(`PASS ${path}: load, one h1, navigation, no errors`);
  }
  const typeFailures = [];
  for (const width of [390, 1440]) {
    for (const path of server.paths) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: "dark",
        reducedMotion: "reduce",
      });
      await page.goto(`${server.origin}${path}`, { waitUntil: "networkidle" });
      await openAllDetails(page);
      typeFailures.push(
        ...(await testTypography(
          page,
          `${path} at ${width}px`,
          path === home || path === projectsPage,
        )),
      );
      await page.close();
    }
  }
  assert.deepEqual([...new Set(typeFailures)], [], "type sizes");
  console.log(
    "PASS type: no text under 13px on any page, body copy on home and /projects/ at least 18px",
  );
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
  for (const [anchor, target] of Object.entries(anchorTargets)) {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    watch(page, `${home}#${anchor}`);
    await page.goto(`${server.origin}${home}#${anchor}`, {
      waitUntil: "networkidle",
    });
    const position = await page.evaluate((id) => {
      const element = document.getElementById(id);
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, height: window.innerHeight };
    }, target);
    const landed =
      target === "contact"
        ? position.top < position.height && position.bottom > 0
        : position.top >= -1 && position.top < 120;
    assert.ok(landed, `#${anchor} lands on #${target} (${position.top})`);
    await page.close();
    console.log(`PASS ${home}#${anchor}: lands on #${target}`);
  }
  assert.deepEqual(errors, []);
  console.log(
    `Smoke tests passed: ${server.paths.length} pages, ${Object.keys(legacyRedirects).length} redirects, ${Object.keys(anchorTargets).length} anchors.`,
  );
} finally {
  await browser.close();
  await server.close();
}
