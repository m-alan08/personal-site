import { projects } from "./projects";
import { site } from "../content/site";

export const sharePages = [
  { path: "", slug: "home", title: site.name, description: site.introduction },
  ...projects.map((project) => ({
    path: `projects/${project.slug}/`,
    slug: `projects-${project.slug}`,
    title: project.title,
    description: `${project.ownership}. ${project.summary}`,
  })),
];

export const pagePaths = sharePages.map((page) => page.path);
