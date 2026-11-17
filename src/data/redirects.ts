import { siteBase } from "./hosting";

const home = `${siteBase.replace(/\/$/, "")}/`;

export const legacyRedirects = Object.fromEntries(
  (["about", "contact", "resume"] as const).map((page) => [
    `/${page}`,
    `${home}#${page === "resume" ? "contact" : page}`,
  ]),
);
