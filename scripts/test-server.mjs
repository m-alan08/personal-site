import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

export async function pagePaths() {
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  return [...paths, `${paths[0]}404.html`];
}
export function browserOptions() {
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return {
    headless: true,
    executablePath:
      process.env.CHROME_PATH ||
      (existsSync(chrome) ? chrome : chromium.executablePath()),
  };
}
export async function serveBuild() {
  const paths = await pagePaths();
  const base = paths[0];
  const root = resolve("dist");
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".xml": "application/xml",
    ".pdf": "application/pdf",
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      if (!pathname.startsWith(base)) throw new Error("Invalid base path");
      let file = resolve(root, pathname.slice(base.length));
      if (file !== root && !file.startsWith(`${root}/`))
        throw new Error("Invalid file path");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      response.setHeader(
        "Content-Type",
        types[extname(file)] || "application/octet-stream",
      );
      response.end(await readFile(file));
    } catch {
      response.statusCode = 404;
      response.end("Missing file");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin,
    paths,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}
