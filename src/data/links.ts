export const links = {
  github: "https://github.com/m-alan08",
  xHandle: "",
  email: "",
  resumeFile: "",
};

export function localPath(path = ""): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export const localLinks = {
  home: localPath(),
  projects: localPath("projects/"),
  resume: localPath("resume/"),
  notFound: localPath("404.html"),
  favicon: localPath("favicon.svg"),
  sitemap: localPath("sitemap.xml"),
  skip: "#main-content",
};

export const optionalLinks = {
  x: links.xHandle ? `https://x.com/${links.xHandle.replace(/^@/, "")}` : "",
  email: links.email ? `mailto:${links.email}` : "",
};

export function projectLink(slug: string): string {
  return localPath(`projects/${slug}/`);
}

export function shareImageLink(slug: string): string {
  return localPath(`og/${slug}.png`);
}
