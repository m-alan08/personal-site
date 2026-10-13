# Alan Mozhoor's personal website

A static Astro portfolio for reinforcement learning, AI/ML, and robotics work. It uses Tailwind CSS, strict TypeScript, and system fonts. Production pages ship no client JavaScript and load no third-party scripts, embeds, or tracking.

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
```

- `dev` serves the site at the URL printed by Astro. The default path is `/personal-site/`.
- `build` checks Astro and TypeScript with zero errors, then emits static files to `dist/`.
- `preview` serves the production build for verification.
- `lint` requires zero warnings.
- `format` formats source and documentation. `format:check` verifies formatting without modifying files. `AGENTS.md` is excluded to preserve the exact supplied instructions.

The scripts disable Astro CLI telemetry and use POSIX environment syntax, supported on macOS and Linux. No client JavaScript is needed for theme preference, navigation, or page content.

## Content

- `src/content/site.ts`: page copy, navigation, and shared labels.
- `src/data/links.ts`: GitHub, optional X handle, optional email, and optional resume file.
- `src/data/projects.ts`: the project list, ownership labels, status, verified tools, and write-ups.
- `src/data/hosting.ts`: provisional canonical origin and base path.
- `src/components/`: shared Astro components.
- `src/layouts/BaseLayout.astro`: head tags and page landmarks.

All project additions go in `projects.ts`. Do not invent credentials, results, or links. The current solo project description comes from the quantrl-fetch README; the team project contribution comes from Alan's request. Missing fields are documented in `PROGRESS.md`.

## Static hosting

No deployment or hosting settings have been changed. The default canonical target is provisionally `https://m-alan08.github.io/personal-site/`. This is a configuration choice, not a claim that the site is live there.

To build for a confirmed host with a root path, supply build-time inputs:

```sh
SITE_URL=https://your-confirmed-host.example SITE_BASE=/ npm run build
```

For GitHub Pages project hosting, keep the default base path and serve the contents of `dist/` at `/personal-site/`. For Vercel, build with the confirmed production origin and a root base, then serve `dist/`. Hosting configuration and deployment require a separate owner-authorized task. No backend, server functions, or database is required.

## Maintenance

Work directly on main as instructed in `AGENTS.md`. Run build, lint, and format checks before committing or pushing. Pull with rebase before every push and never force push. Keep changes small, log decisions in `DECISIONS.md`, and update `PROGRESS.md` at each step.

## Resume

When the actual PDF is available, place it at `public/resume.pdf` and set `resumeFile` to `"resume.pdf"` in `links.ts`. The resume page only shows the download link when the configured PDF exists inside public/. Otherwise it shows a clear fallback and a link to projects. Email and X remain omitted until their fields are filled.

## Continuous integration

The Portfolio checks workflow runs `npm ci`, lint, format verification, and build for every push to main and for pull requests. It has read-only contents permission and does not deploy. Official checkout v7.0.1 and setup-node v7.1.0 are pinned to their verified commit hashes. Node comes from `.nvmrc`.

## Internal links

`npm run build` also runs `npm run check:links`. The dependency-free checker validates all generated HTML links, asset references, share-image URLs, sitemap URLs, and local fragment targets against files in `dist/`. It honors the configured base path and fails on missing targets or empty references. External URLs are verified separately during QA; they are not fetched by the offline build check.

## Browser verification

After a build, start `npm run preview -- --host 127.0.0.1 --port 4322`, then run `npm run audit:browser`. The audit uses an installed Chrome browser with a fresh temporary profile; it does not download a browser or use your existing browsing profile. Set `CHROME_PATH` if Chrome is installed elsewhere, and `QA_ORIGIN` if preview uses another origin. It checks every route at 360px, 768px, and 1280px in light and dark mode with axe, keyboard, overflow, script, metadata, reduced-motion, and print assertions. Reports and screenshots stay in ignored `reports/`. Browser tooling is development-only.

## Mobile Lighthouse

With the production preview running, `npm run audit:lighthouse` audits every indexed route using default mobile emulation and simulated mobile throttling. It writes real JSON and HTML reports in `reports/lighthouse/`, a summary in `reports/lighthouse-summary.json`, and fails if any category scores below 95. The intentionally noindex 404 is excluded from SEO scoring and is covered by the full browser accessibility matrix. Local preview scores do not measure a deployed host. The same `CHROME_PATH` and `QA_ORIGIN` inputs apply.
