import { site } from "../content/site";
import { links, localPath } from "./links";

export function structuredData(
  origin: URL,
  canonical: URL,
  title: string,
  description: string,
): string {
  const home = new URL(localPath(), origin).href;
  const person = {
    "@type": "Person",
    "@id": `${home}#person`,
    name: site.name,
    url: home,
    sameAs: [
      links.github,
      ...(links.xHandle
        ? [`https://x.com/${links.xHandle.replace(/^@/, "")}`]
        : []),
    ],
    ...(links.email ? { email: `mailto:${links.email}` } : {}),
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Georgia Institute of Technology",
    },
    knowsAbout: [
      "Artificial intelligence",
      "Machine learning",
      "Reinforcement learning",
    ],
  };
  const website = {
    "@type": "WebSite",
    "@id": `${home}#website`,
    name: site.name,
    url: home,
    inLanguage: "en",
    author: { "@id": person["@id"] },
  };
  const page = {
    "@type": "WebPage",
    "@id": canonical.href,
    url: canonical.href,
    name: title,
    description,
    inLanguage: "en",
    isPartOf: { "@id": website["@id"] },
    about: { "@id": person["@id"] },
  };
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [person, website, page],
  }).replace(/</g, "\\u003c");
}
