# Alan Mozhoor's personal website

A static, dark-only Astro portfolio for reinforcement learning, robotics, matching, and cybersecurity work. It uses Tailwind CSS, strict TypeScript, and system fonts. Small local modules power keyboard navigation and illustrative interactions. No third-party scripts, embeds, analytics, tracking, or animation libraries load for visitors.

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

The scripts disable Astro CLI telemetry and use POSIX environment syntax, supported on macOS and Linux. All page content and ordinary links work without JavaScript. The palette search and project filter load on first use; the hero and graph modules load when their figures enter the viewport. Native CSS page transitions last 120ms and respect reduced motion.

## Content

- `src/content/site.ts`: page copy, navigation, and shared labels.
- `src/data/links.ts`: GitHub, optional X handle, optional email, and optional resume file.
- `src/data/projects.ts`: the uniform project shape, categories, events, case studies, ownership, verified tools, diagrams, and sources.
- `src/data/hosting.ts`: provisional canonical origin and base path.
- `src/components/`: shared Astro components.
- `src/layouts/BaseLayout.astro`: head tags and page landmarks.

All project additions go in `projects.ts`. Do not invent credentials, results, or links. Case studies use the quantrl-fetch, Constellation and Omen AI READMEs and documentation plus Alan's supplied event and contribution details. armlab's undocumented fields remain empty. Missing fields are documented in `PROGRESS.md`.

## Static hosting

No deployment or hosting settings have been changed. The default canonical target is provisionally `https://m-alan08.github.io/personal-site/`. This is a configuration choice, not a claim that the site is live there.

To build for a confirmed host with a root path, supply build-time inputs:

```sh
SITE_URL=https://your-confirmed-host.example SITE_BASE=/ npm run build
```

For GitHub Pages project hosting, keep the default base path and serve the contents of `dist/` at `/personal-site/`. For Vercel, build with the confirmed production origin and a root base, then serve `dist/`. Hosting configuration and deployment require a separate owner-authorized task. No backend, server functions, or database is required.

## Maintenance

Work directly on main as instructed in `AGENTS.md`. Run build, lint, format and smoke tests before committing or pushing. Pull with rebase before every push and never force push. Keep changes small, log decisions in `DECISIONS.md`, and update `PROGRESS.md` at each step.

## Resume

When the actual PDF is available, place it at `public/resume.pdf` and set `resumeFile` to `"resume.pdf"` in `links.ts`. The resume page only shows the download link when the configured PDF exists inside public/. Otherwise it shows a clear fallback and a link to projects. Email and X remain omitted until their fields are filled.

## Continuous integration

The Portfolio checks workflow runs `npm ci`, lint, format verification, build, a pinned Playwright Chromium install, and `npm test` for every push to main and for pull requests. It has read-only contents permission and does not deploy. Official checkout v7.0.1 and setup-node v7.1.0 are pinned to their verified commit hashes. Node comes from `.nvmrc`.

## Internal links

`npm run build` also runs `npm run check:links`. The dependency-free checker validates all generated HTML links, asset references, share-image URLs, sitemap URLs, and local fragment targets against files in `dist/`. It honors the configured base path and fails on missing targets or empty references. External URLs are verified separately during QA; they are not fetched by the offline build check.

## Browser verification

After a build, start `npm run preview -- --host 127.0.0.1 --port 4322`, then run `npm run audit:browser`. The audit uses an installed Chrome browser with a fresh temporary profile; it does not download a browser or use your existing browsing profile. Set `CHROME_PATH` if Chrome is installed elsewhere, and `QA_ORIGIN` if preview uses another origin. It checks every route at 360px, 768px, and 1280px with axe, keyboard order, palette state, overflow, metadata, control sizes, reduced-motion and print assertions. The theme is always dark. Set `QA_SCHEMES=both` to verify it under both system preferences and `QA_PASS=pass-name` to retain a separate screenshot matrix. Reports and screenshots stay in ignored `reports/`. Browser tooling is development-only.

## Mobile Lighthouse

With the production preview running, `npm run audit:lighthouse` audits every indexed route using default mobile emulation and simulated mobile throttling. It writes real JSON and HTML reports in `reports/lighthouse/`, a summary in `reports/lighthouse-summary.json`, and fails if any category scores below 95. The intentionally noindex 404 is excluded from SEO scoring and is covered by the full browser accessibility matrix. Local preview scores do not measure a deployed host. The same `CHROME_PATH` and `QA_ORIGIN` inputs apply.

## Smoke tests and interaction budgets

After `npm run build`, `npm test` serves dist on an ephemeral loopback port and uses Playwright to test every generated page and the 404. It checks HTTP responses, one h1, browser errors, Ctrl/Command K, Escape and focus return. It also exercises the project filter, illustrative precision buttons, and graph selection, keyboard movement, drag and reset. An existing Chrome installation works locally. Otherwise install the pinned package's browser with `npx playwright-core install chromium`; CI also installs its system dependencies.

`npm run audit:interactions` applies 4x CPU slowdown to the hero and graph in both motion preferences. It checks lazy graph loading, twenty repeated interactions, a next-frame budget below 100ms, absence of interaction long tasks, and stable idle positions. QA code never ships to visitors.

Illustrations are hand-authored static examples in src/data/illustrations.ts and src/content/illustrations.ts. The graph is explicitly fictional and is not attendee or model data. Project architecture diagrams are separate and derive only from verified source documentation. armlab has no invented diagram while its README is unavailable.
