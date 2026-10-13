import { projects } from "./projects";

export const pagePaths = [
  "",
  "projects/",
  "about/",
  "contact/",
  ...projects.map((project) => `projects/${project.slug}/`),
];
