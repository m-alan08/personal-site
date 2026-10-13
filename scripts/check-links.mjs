import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";

const output = resolve("dist");
const failures = [];
const documents = new Map();

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.name.endsWith(".html"))
      documents.set(path, await readFile(path, "utf8"));
  }
}

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

await collect(output);
const home = documents.get(resolve(output, "index.html"));
if (!home) throw new Error("Build output is missing. Run npm run build first.");
const canonicalTag = [...home.matchAll(/<link\b[^>]*>/g)]
  .map((match) => attributes(match[0]))
  .find((tag) => tag.rel === "canonical");
if (!canonicalTag) throw new Error("Home canonical is missing.");
const root = new URL(canonicalTag.href);
let referenceCount = 0;

async function checkReference(reference, sourceUrl, sourcePath) {
  referenceCount += 1;
  if (!reference) {
    failures.push(`${sourcePath}: empty link or asset reference`);
    return;
  }
  const url = new URL(reference, sourceUrl);
  if (url.origin !== root.origin) return;
  if (!url.pathname.startsWith(root.pathname)) {
    failures.push(`${sourcePath}: path outside configured base: ${reference}`);
    return;
  }
  const path = decodeURIComponent(url.pathname.slice(root.pathname.length));
  const target = resolve(output, extname(path) ? path : `${path}index.html`);
  if (!target.startsWith(`${output}/`)) {
    failures.push(`${sourcePath}: invalid path: ${reference}`);
    return;
  }
  const exists = await stat(target)
    .then((value) => value.isFile())
    .catch(() => false);
  if (!exists) {
    failures.push(`${sourcePath}: missing target: ${reference}`);
    return;
  }
  if (url.hash && documents.has(target)) {
    const ids = [
      ...documents.get(target).matchAll(/\bid=(?:"([^"]*)"|'([^']*)')/g),
    ].map((match) => decode(match[1] ?? match[2]));
    if (!ids.includes(decodeURIComponent(url.hash.slice(1))))
      failures.push(`${sourcePath}: missing anchor: ${reference}`);
  }
}

for (const [path, html] of documents) {
  const name = relative(output, path);
  const source = new URL(name.replace(/index\.html$/, ""), root);
  for (const match of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/g)) {
    const tag = attributes(match[0]);
    for (const key of ["href", "src"])
      if (key in tag) await checkReference(tag[key], source, name);
    if (tag.srcset)
      for (const candidate of tag.srcset.split(","))
        await checkReference(candidate.trim().split(/\s+/)[0], source, name);
  }
  for (const match of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = attributes(match[0]);
    if (
      ["og:image", "og:url", "twitter:image"].includes(tag.property ?? tag.name)
    )
      await checkReference(tag.content, source, name);
  }
}
const sitemap = await readFile(resolve(output, "sitemap.xml"), "utf8");
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))
  await checkReference(decode(match[1]), root, "sitemap.xml");
if (failures.length) throw new Error(failures.join("\n"));
console.log(
  `Internal link check passed: ${documents.size} HTML pages, ${referenceCount} references, sitemap, assets, and fragment targets.`,
);
