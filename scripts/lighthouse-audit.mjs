import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4322";
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => new URL(match[1]).pathname,
);
const categories = ["performance", "accessibility", "best-practices", "seo"];
const summary = [];
await mkdir("reports/lighthouse", { recursive: true });

for (const [index, path] of paths.entries()) {
  const reportPath = resolve(
    `reports/lighthouse/${index === 0 ? "home" : path.split("/").filter(Boolean).join("-")}`,
  );
  await run(
    process.execPath,
    [
      resolve("node_modules/lighthouse/cli/index.js"),
      `${origin}${path}`,
      "--quiet",
      "--output=json",
      "--output=html",
      `--output-path=${reportPath}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--form-factor=mobile",
      "--throttling-method=simulate",
      "--chrome-flags=--headless --disable-gpu --no-first-run --no-default-browser-check",
    ],
    {
      env: {
        ...process.env,
        CHROME_PATH:
          process.env.CHROME_PATH ||
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      },
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const report = JSON.parse(
    await readFile(`${reportPath}.report.json`, "utf8"),
  );
  assert.equal(report.configSettings.formFactor, "mobile");
  assert.ok(!report.runtimeError, JSON.stringify(report.runtimeError));
  const scores = Object.fromEntries(
    categories.map((category) => [
      category,
      Math.round(report.categories[category].score * 100),
    ]),
  );
  const failedAudits = Object.values(report.audits)
    .filter((audit) => audit.score !== null && audit.score < 1)
    .map((audit) => ({
      id: audit.id,
      title: audit.title,
      score: audit.score,
      description: audit.description,
    }));
  summary.push({
    path,
    scores,
    lighthouseVersion: report.lighthouseVersion,
    fetchTime: report.fetchTime,
    formFactor: report.configSettings.formFactor,
    throttling: report.configSettings.throttling,
    failedAudits,
    lcp: report.audits["largest-contentful-paint"].numericValue,
    cls: report.audits["cumulative-layout-shift"].numericValue,
    totalBytes: report.audits["total-byte-weight"].numericValue,
  });
  console.log(
    `${path}: ${categories.map((category) => `${category} ${scores[category]}`).join(", ")}`,
  );
}
await writeFile(
  "reports/lighthouse-summary.json",
  JSON.stringify(summary, null, 2),
);
assert.ok(
  summary.every((page) =>
    Object.values(page.scores).every((score) => score >= 95),
  ),
  "One or more mobile Lighthouse categories scored below 95. Inspect reports/lighthouse-summary.json.",
);
console.log(
  `Mobile Lighthouse passed: ${summary.length} indexed pages at 95 or higher in all four categories. The intentionally noindex 404 page is excluded from SEO scoring and covered by browser accessibility QA.`,
);
