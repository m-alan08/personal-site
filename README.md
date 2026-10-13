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
