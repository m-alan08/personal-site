import { localPath } from "./links";

export const sections = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "writing", label: "Writing" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export function sectionLink(id: SectionId): string {
  return `${localPath()}#${id}`;
}

export function sectionLabel(id: SectionId): string {
  return sections.find((section) => section.id === id)?.label ?? id;
}
