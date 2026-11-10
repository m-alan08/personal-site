export const links = {
  github: "https://github.com/m-alan08",
  xHandle: "alanmozhoor",
  linkedin: "https://www.linkedin.com/in/alan-mozhoor/",
  email: "alanmozhoor@gmail.com",
  schoolEmail: "amozhoor7@gatech.edu",
  resumeFile: "resume.pdf",
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
  schoolEmail: links.schoolEmail ? `mailto:${links.schoolEmail}` : "",
};

export interface SocialLink {
  kind: "github" | "x" | "linkedin" | "email" | "resume";
  label: string;
  href: string;
  display: string;
}

export const socialLinks: SocialLink[] = (
  [
    {
      kind: "github",
      label: "GitHub",
      href: links.github,
      display: "github.com/m-alan08",
    },
    {
      kind: "x",
      label: "X",
      href: optionalLinks.x,
      display: links.xHandle ? `@${links.xHandle.replace(/^@/, "")}` : "",
    },
    {
      kind: "linkedin",
      label: "LinkedIn",
      href: links.linkedin,
      display: "linkedin.com/in/alan-mozhoor",
    },
    {
      kind: "email",
      label: "Email",
      href: optionalLinks.email,
      display: links.email,
    },
    {
      kind: "email",
      label: "Georgia Tech email",
      href: optionalLinks.schoolEmail,
      display: links.schoolEmail,
    },
    {
      kind: "resume",
      label: "Resume",
      href: links.resumeFile ? localPath(links.resumeFile) : "",
      display: "PDF",
    },
  ] satisfies SocialLink[]
).filter((link) => link.href);

export function projectLink(slug: string): string {
  return localPath(`projects/${slug}/`);
}

export function shareImageLink(slug: string): string {
  return localPath(`og/${slug}.png`);
}

export function projectAnchor(slug: string): string {
  return `project-${slug}`;
}
