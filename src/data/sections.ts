import { site } from "../content/site";
import { localPath } from "./links";

const ids = [
  "about",
  "projects",
  "exploring",
  "writing",
  "experience",
  "contact",
] as const;

export type SectionId = (typeof ids)[number];

export const sections = ids.map((id, position) => ({
  id,
  label: site.navigation[id],
  index: String(position + 1).padStart(2, "0"),
}));

export function sectionLink(id: SectionId): string {
  return `${localPath()}#${id}`;
}

export function sectionLabel(id: SectionId): string {
  return site.sections[id];
}

export function sectionIndex(id: SectionId): string {
  return String(ids.indexOf(id) + 1).padStart(2, "0");
}
