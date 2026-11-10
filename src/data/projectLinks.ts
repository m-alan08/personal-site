import type { Project, ProjectLink } from "./projects";
import { caseStudy, labels } from "../content/site";

export function externalLinks(
  project: Project,
): Pick<ProjectLink, "label" | "href">[] {
  const links = project.links?.length
    ? project.links
    : project.repository
      ? [{ label: labels.repository, href: project.repository }]
      : [];
  return project.devpost
    ? [...links, { label: caseStudy.devpost, href: project.devpost }]
    : links;
}
