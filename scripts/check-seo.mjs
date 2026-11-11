import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("dist");
const maxShareImageBytes = 150 * 1024;

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)=(?:"([^"]*)"|'([^']*)')/g)].map((match) => [
      match[1],
      decode(match[2] ?? match[3]),
    ]),
  );
}

function head(html) {
  const meta = {};
  for (const match of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = attributes(match[0]);
    const key = tag.property ?? tag.name;
    if (key) meta[key] = tag.content;
  }
  const linkTags = [...html.matchAll(/<link\b[^>]*>/g)].map((match) =>
    attributes(match[0]),
  );
  const title = html.match(/<title>([^<]*)<\/title>/);
  const jsonLd = [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => match[1]);
  return {
    meta,
    title: title ? decode(title[1]) : "",
    canonical: linkTags.find((tag) => tag.rel === "canonical")?.href,
    icons: linkTags.filter((tag) => /icon/.test(tag.rel ?? "")),
    jsonLd,
  };
}

async function png(path) {
  const data = await readFile(path);
  assert.equal(
    data.subarray(1, 4).toString("ascii"),
    "PNG",
    `${path}: is a PNG`,
  );
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bytes: (await stat(path)).size,
  };
}

function localFile(url, root) {
  const target = new URL(url, root);
  assert.equal(target.origin, root.origin, `${url}: same origin`);
  assert.ok(target.pathname.startsWith(root.pathname), `${url}: inside base`);
  return resolve(output, target.pathname.slice(root.pathname.length));
}

function checkStructuredData(page, raw, root) {
  const data = JSON.parse(raw);
  assert.equal(data["@context"], "https://schema.org", `${page}: @context`);
  const graph = data["@graph"];
  assert.ok(Array.isArray(graph), `${page}: @graph`);
  const ids = new Map(graph.map((node) => [node["@id"], node]));
  const byType = (type) => graph.find((node) => node["@type"] === type);
  const person = byType("Person");
  const website = byType("WebSite");
  assert.ok(person?.name && person.url, `${page}: Person with name and url`);
  assert.ok(website?.name && website.url, `${page}: WebSite with name and url`);
  for (const node of graph) {
    assert.ok(node["@id"] && node["@type"], `${page}: node @id and @type`);
    if (node.url)
      assert.ok(node.url.startsWith(root.href), `${page}: ${node.url} in site`);
  }
  for (const reference of JSON.stringify(data).matchAll(/\{"@id":"([^"]+)"\}/g))
    assert.ok(ids.has(reference[1]), `${page}: resolves ${reference[1]}`);
  assert.equal(website.author["@id"], person["@id"], `${page}: author`);
  for (const link of person.sameAs ?? [])
    assert.match(link, /^https:\/\//, `${page}: sameAs ${link}`);
}

const sitemap = await readFile(resolve(output, "sitemap.xml"), "utf8");
const indexed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => new URL(decode(match[1])),
);
assert.ok(indexed.length > 0, "sitemap has pages");
const root = indexed[0];
const pages = [
  ...indexed.map((url) => ({ url, noindex: false })),
  { url: new URL("404.html", root), noindex: true },
];
const titles = new Set();
const descriptions = new Set();
const rows = [];

for (const { url, noindex } of pages) {
  const path = url.pathname;
  const file = localFile(url.href, root);
  const html = await readFile(
    path.endsWith("/") ? resolve(file, "index.html") : file,
    "utf8",
  );
  const { meta, title, canonical, icons, jsonLd } = head(html);
  const description = meta.description;
  assert.ok(title, `${path}: title`);
  assert.ok(description, `${path}: description`);
  assert.ok(!titles.has(title), `${path}: unique title`);
  assert.ok(!descriptions.has(description), `${path}: unique description`);
  titles.add(title);
  descriptions.add(description);
  assert.equal(canonical, url.href, `${path}: canonical`);
  assert.equal(meta["og:url"], canonical, `${path}: og:url`);
  assert.equal(meta["og:title"], title, `${path}: og:title`);
  assert.equal(meta["twitter:title"], title, `${path}: twitter:title`);
  assert.equal(meta["og:description"], description, `${path}: og:desc`);
  assert.equal(meta["twitter:description"], description, `${path}: tw:desc`);
  assert.equal(meta["og:type"], "website", `${path}: og:type`);
  assert.equal(meta["twitter:card"], "summary_large_image", `${path}: card`);
  assert.equal(meta["twitter:image"], meta["og:image"], `${path}: tw:image`);
  assert.ok(meta["og:image:alt"], `${path}: og:image:alt`);
  const image = await png(localFile(meta["og:image"], root));
  assert.equal(`${image.width}x${image.height}`, "1200x630", `${path}: size`);
  assert.equal(meta["og:image:width"], String(image.width), `${path}: width`);
  assert.equal(meta["og:image:height"], String(image.height), `${path}: h`);
  assert.ok(image.bytes < maxShareImageBytes, `${path}: share image weight`);
  for (const rel of ["icon", "apple-touch-icon"])
    assert.ok(
      icons.some((icon) => icon.rel === rel),
      `${path}: ${rel} link`,
    );
  if (noindex) {
    assert.equal(meta.robots, "noindex, follow", `${path}: noindex`);
    assert.equal(jsonLd.length, 0, `${path}: no structured data`);
  } else {
    assert.equal(meta.robots, undefined, `${path}: indexable`);
    assert.equal(jsonLd.length, 1, `${path}: one JSON-LD block`);
    checkStructuredData(path, jsonLd[0], root);
  }
  const cell = (value) => value.replace(/\|/g, "\\|");
  rows.push(
    `| ${path} | ${cell(title)} | ${cell(description)} | ${new URL(meta["og:image"]).pathname} | ${image.width}x${image.height} | ${(image.bytes / 1024).toFixed(1)} KB |`,
  );
}

const touchIcon = await png(resolve(output, "apple-touch-icon.png"));
assert.equal(`${touchIcon.width}x${touchIcon.height}`, "180x180", "touch icon");
const robots = await readFile(resolve(output, "robots.txt"), "utf8");
assert.match(robots, /^User-agent: \*$/m, "robots.txt user agent");
assert.ok(
  robots.split("\n").includes(`Sitemap: ${new URL("sitemap.xml", root).href}`),
  "robots.txt sitemap line",
);
const ogFiles = await readdir(resolve(output, "og"));
assert.equal(ogFiles.length, indexed.length, "one share image per page");

console.log(
  [
    "| Page | Title | Description | Share image | Dimensions | Size |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n"),
);
console.log(
  `SEO check passed: ${pages.length} pages, unique titles and descriptions, canonical, Open Graph, Twitter, JSON-LD, share images, icons and robots.txt.`,
);
