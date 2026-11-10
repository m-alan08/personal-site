import { site } from "../content/site";
import { localPath } from "./links";

const ids = [
  "about",
  "projects",
  "research",
  "writing",
  "experience",
  "contact",
] as const;

export type SectionId = (typeof ids)[number];

export const sections = ids.map((id) => ({ id, label: site.navigation[id] }));

export function sectionLink(id: SectionId): string {
  return `${localPath()}#${id}`;
}

export function sectionLabel(id: SectionId): string {
  return site.sections[id];
}

export function sectionNumber(id: SectionId): string {
  return String(ids.indexOf(id) + 1).padStart(2, "0");
}
