import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { browserOptions, serveBuild } from "./test-server.mjs";

const server = await serveBuild();
const browser = await chromium.launch(browserOptions());
const results = [];
try {
  for (const reducedMotion of ["reduce", "no-preference"]) {
    for (const feature of ["hero", "graph"]) {
      const page = await browser.newPage({
        viewport: { width: 360, height: 800 },
        colorScheme: "dark",
        reducedMotion,
      });
      const session = await page.context().newCDPSession(page);
      await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.addInitScript(() => {
        window.auditLongTasks = [];
        new PerformanceObserver((list) => {
          window.auditLongTasks.push(
            ...list.getEntries().map((entry) => ({
              start: entry.startTime,
              duration: entry.duration,
            })),
          );
        }).observe({ type: "longtask", buffered: true });
      });
      const path =
        feature === "hero"
          ? server.paths[0]
          : server.paths.find((path) => path.endsWith("/constellation/"));
      await page.goto(`${server.origin}${path}`, { waitUntil: "networkidle" });
      if (feature === "graph") {
        assert.equal(
          await page.evaluate(() =>
            performance
              .getEntriesByType("resource")
              .some((entry) => entry.name.includes("connection-graph.")),
          ),
          false,
          "Graph code must stay unloaded above the fold",
        );
        await page.locator("[data-connection-graph]").scrollIntoViewIfNeeded();
      }
      const selector =
        feature === "hero" ? "[data-policy-hero]" : "[data-connection-graph]";
      await page.waitForFunction(
        (selector) => document.querySelector(selector).dataset.ready === "true",
        selector,
      );
      const start = await page.evaluate(() => performance.now());
      const responseTimes = await page.evaluate(async (feature) => {
        const times = [];
        for (let index = 0; index < 20; index++) {
          const start = performance.now();
          if (feature === "hero")
            document.querySelectorAll("[data-policy-bits]")[index % 4].click();
          else {
            document.querySelectorAll("[data-graph-select]")[index % 8].click();
            document.querySelector("[data-graph-reset]").click();
          }
          await new Promise(requestAnimationFrame);
          times.push(performance.now() - start);
        }
        return times;
      }, feature);
      const position = await page
        .locator("[data-graph-node]")
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute("transform")),
        );
      await page.waitForTimeout(400);
      assert.deepEqual(
        await page
          .locator("[data-graph-node]")
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute("transform")),
          ),
        position,
        "Graph must stop moving while idle",
      );
      const measurements = await page.evaluate(
        (start) => ({
          longTasks: window.auditLongTasks.filter(
            (entry) => entry.start >= start,
          ),
          scriptBytes: performance
            .getEntriesByType("resource")
            .filter((entry) => new URL(entry.name).pathname.endsWith(".js"))
            .reduce((total, entry) => total + entry.encodedBodySize, 0),
        }),
        start,
      );
      assert.deepEqual(errors, []);
      assert.ok(
        Math.max(...responseTimes) < 100,
        "Interaction exceeded a 100ms next-frame budget at 4x CPU",
      );
      assert.equal(
        measurements.longTasks.length,
        0,
        "Interaction produced a long task",
      );
      const result = {
        feature,
        reducedMotion,
        cpuSlowdown: 4,
        repetitions: 20,
        maxNextFrameMs: Math.round(Math.max(...responseTimes) * 10) / 10,
        medianNextFrameMs:
          Math.round(responseTimes.sort((a, b) => a - b)[10] * 10) / 10,
        ...measurements,
        idleStable: true,
      };
      results.push(result);
      console.log(result);
      await page.close();
    }
  }
  await mkdir("reports", { recursive: true });
  await writeFile(
    "reports/interaction-audit.json",
    JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2),
  );
} finally {
  await browser.close();
  await server.close();
}
