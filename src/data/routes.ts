import { projects } from "./projects";

export const pagePaths = [
  "",
  "projects/",
  "about/",
  "contact/",
  "resume/",
  ...projects.map((project) => `projects/${project.slug}/`),
];
