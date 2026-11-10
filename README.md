# Alan Mozhoor's personal website

A static, light-only Astro personal homepage for my work on reinforcement learning for robotics, efficient policy deployment, and related projects. It uses Tailwind CSS, strict TypeScript, and system fonts, with a system serif stack for headings. The site ships no client JavaScript, third-party scripts, embeds, analytics, or tracking.

## Setup

Node **22.23.3** is pinned in `.nvmrc` and `package.json`. With nvm installed:

```sh
nvm install
nvm use
npm install
```

The npm lockfile is committed. Use `npm ci` for reproducible clean installs in CI. Tooling runs locally; do not install global packages.

## Development and checks

```sh
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
npm test
```

- `dev` serves the site at the URL printed by Astro. The default path is `/personal-site/`.
- `build` checks Astro and TypeScript with zero errors, then emits static files to `dist/`.
- `preview` serves the production build for verification.
- `lint` requires zero warnings.
- `format` formats source and documentation. `format:check` verifies formatting without modifying files. `AGENTS.md` is excluded to preserve the exact supplied instructions.

The scripts disable Astro CLI telemetry and use POSIX environment syntax, supported on macOS and Linux. All content and links work without JavaScript. Smooth anchor scrolling is disabled under reduced motion.

## Content

- `src/content/profile.ts`: introduction, about copy, research interests, writing links, experience, and the `uniqueFeature` placeholder.
- `src/content/site.ts`: site metadata, section labels, and shared labels.
- `src/data/sections.ts`: home page section order used by navigation.
- `src/data/redirects.ts`: legacy `/about/`, `/contact/`, `/resume/` and `/projects/` redirects to home page anchors.
- `src/data/links.ts`: GitHub, X, LinkedIn, personal and Georgia Tech email, resume file, and the derived `socialLinks` list.
- `src/data/projects.ts`: the uniform project shape, categories, events, case studies, ownership, verified tools, diagrams, and sources.
- `src/data/hosting.ts`: provisional canonical origin and base path.
- `src/components/`: shared Astro components.
- `src/layouts/BaseLayout.astro`: head tags and page landmarks.

The home page is a single page with About, Projects, Research interests, Writing, Experience and Contact sections. Each project also has a case study at `/projects/<slug>/`. Projects with `featured: false` appear in a compact list below the featured ones, sorted by `order`.

All project additions go in `projects.ts`. Do not invent credentials, results, or links. Unconfirmed content is tracked in `docs/content-open-questions.md`.

`uniqueFeature` in `profile.ts` is reserved for one future interactive component. It is `null` and nothing renders it yet. Add the component as its own `Section` on the home page when it is defined.

## Static hosting

The site is hosted on GitHub Pages at `https://m-alan08.github.io/personal-site/`. The Deploy to GitHub Pages workflow builds `dist/` with the default base path and publishes it on every push to main, or on demand through workflow dispatch. In the repository settings, Pages must use GitHub Actions as its source.

To build for a different host with a root path, supply build-time inputs:

```sh
SITE_URL=https://your-confirmed-host.example SITE_BASE=/ npm run build
```

For Vercel, build with the confirmed production origin and a root base, then serve `dist/`. No backend, server functions, or database is required.

## Maintenance

Redesign work goes through a branch and pull request against main, not direct pushes. Run build, lint, format and smoke tests before committing or pushing. Pull with rebase before every push and never force push. Keep changes small, log decisions in `DECISIONS.md`, and update `PROGRESS.md` at each step.

## Resume

The resume is `public/resume.pdf`, configured by `resumeFile` in `links.ts`. To replace it, overwrite the PDF. The contact links only include the resume when the configured PDF exists inside public/. Any link field set to an empty string is omitted.

## Continuous integration

The Portfolio checks workflow runs `npm ci`, lint, format verification, build, a pinned Playwright Chromium install, and `npm test` for every push to main and for pull requests. It has read-only contents permission and does not deploy. Official checkout v7.0.1 and setup-node v7.1.0 are pinned to their verified commit hashes. Node comes from `.nvmrc`.

## Internal links

`npm run build` also runs `npm run check:links`. The dependency-free checker validates all generated HTML links, asset references, share-image URLs, sitemap URLs, and local fragment targets against files in `dist/`. It honors the configured base path and fails on missing targets or empty references. External URLs are verified separately during QA; they are not fetched by the offline build check.

## Browser verification

After a build, start `npm run preview -- --host 127.0.0.1 --port 4322`, then run `npm run audit:browser`. The audit uses an installed Chrome browser with a fresh temporary profile; it does not download a browser or use your existing browsing profile. Set `CHROME_PATH` if Chrome is installed elsewhere, and `QA_ORIGIN` if preview uses another origin. It checks every route at 360px, 768px, and 1280px with axe, keyboard order, skip link, overflow, metadata, control sizes, reduced-motion and print assertions. The theme is always light. Set `QA_SCHEMES=both` to verify it under both system preferences and `QA_PASS=pass-name` to retain a separate screenshot matrix. Reports and screenshots stay in ignored `reports/`. Browser tooling is development-only.

## Mobile Lighthouse

With the production preview running, `npm run audit:lighthouse` audits every indexed route using default mobile emulation and simulated mobile throttling. It writes real JSON and HTML reports in `reports/lighthouse/`, a summary in `reports/lighthouse-summary.json`, and fails if any category scores below 95. The intentionally noindex 404 is excluded from SEO scoring and is covered by the full browser accessibility matrix. Local preview scores do not measure a deployed host. The same `CHROME_PATH` and `QA_ORIGIN` inputs apply.

## Smoke tests

After `npm run build`, `npm test` serves dist on an ephemeral loopback port and uses Playwright to test every generated page and the 404. It checks HTTP responses, one h1, browser errors, the six section anchors and navigation, project case study links, and the four legacy redirects. An existing Chrome installation works locally. Otherwise install the pinned package's browser with `npx playwright-core install chromium`; CI also installs its system dependencies.
