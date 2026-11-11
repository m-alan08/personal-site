import { projects } from "./projects";
import { site } from "../content/site";

export interface SharePage {
  path: string;
  slug: string;
  title: string;
  description: string;
  project?: { title: string; highlight: string; isResult: boolean };
}

export const sharePages: SharePage[] = [
  { path: "", slug: "home", title: site.name, description: site.description },
  ...projects.map((project) => ({
    path: `projects/${project.slug}/`,
    slug: `projects-${project.slug}`,
    title: project.title,
    description: project.summary,
    project: {
      title: project.title,
      highlight: project.headline ?? project.summary,
      isResult: Boolean(project.headline),
    },
  })),
];

export const pagePaths = sharePages.map((page) => page.path);
