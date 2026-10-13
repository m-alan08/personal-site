import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { links, localPath } from "./links";

const publicDirectory = resolve("public");
const filePath = resolve(publicDirectory, links.resumeFile);
export const resumeAvailable = Boolean(
  links.resumeFile &&
  links.resumeFile.endsWith(".pdf") &&
  filePath.startsWith(`${publicDirectory}${sep}`) &&
  existsSync(filePath),
);
export const resumeHref = resumeAvailable ? localPath(links.resumeFile) : "";
