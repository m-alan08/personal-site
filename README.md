# Alan Mozhoor's personal website

The personal website and project portfolio of Alan Mozhoor, a mathematics and computer science student at Georgia Tech working on reinforcement learning for robot control.

- **Live site:** [m-alan08.github.io/personal-site](https://m-alan08.github.io/personal-site/)
- **What is on it:** an about section, project case studies, what I'm currently exploring, writing, experience, and links to GitHub, X, LinkedIn, the resume and email.
- **Stack:** [Astro](https://astro.build/) static output, Tailwind CSS, strict TypeScript, self-hosted Geist fonts, deployed to GitHub Pages by GitHub Actions. No backend, analytics or third-party scripts.
- **Run it locally:** with Node 22.23.3, run `npm install` then `npm run dev`, and open the URL Astro prints.

## About this repository

A static, dark-only Astro personal homepage for my work on reinforcement learning for robotics, efficient policy deployment, and related projects. It uses Tailwind CSS, strict TypeScript, and two self-hosted variable fonts (Geist Sans and Geist Mono, Latin subset). Its only client JavaScript is the small, lazy script for the bit-width explorer; small, lazy scripts are allowed when a feature needs one. There are no third-party scripts, embeds, analytics, or tracking.

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
- `format` formats source and documentation. `format:check` verifies formatting without modifying files. `AGENTS.md` is excluded from formatting.

The scripts disable Astro CLI telemetry and use POSIX environment syntax, supported on macOS and Linux. All content and links work without JavaScript. Scrolling is native for wheel, trackpad, touch, keyboard and scrollbar input. Smooth anchor scrolling applies only under `prefers-reduced-motion: no-preference`.

## Open questions for Alan

Facts that are missing or unconfirmed are listed in [docs/internal/content-open-questions.md](docs/internal/content-open-questions.md). Check it before writing copy, and add to it instead of guessing.

## Content

- `src/content/profile.ts`: introduction, about copy, writing links, and experience.
- `src/data/exploring.ts`: the Currently exploring threads, their status, updated date and readings.
- `src/content/site.ts`: site metadata, section labels, and shared labels.
- `src/data/sections.ts`: home page section order used by navigation.
- `src/data/redirects.ts`: legacy `/about/`, `/contact/`, `/resume/` and `/projects/` redirects to home page anchors.
- `src/data/links.ts`: GitHub, X, LinkedIn, personal and Georgia Tech email, resume file, and the derived `socialLinks` list.
- `src/data/explorerData.ts`: quantrl-fetch success rates for the bit-width explorer, copied cell by cell from the README key results tables, with a `source` URL per dataset. Missing cells are `null` and show as "Not measured".
- `src/data/projects.ts`: the uniform project shape, categories, events, case studies, ownership, verified tools, diagrams, and sources.
- `src/data/hosting.ts`: provisional canonical origin and base path.
- `src/components/`: shared Astro components.
- `src/layouts/BaseLayout.astro`: head tags and page landmarks.

The home page is a single page with About, Projects, Currently exploring, Writing, Experience and Contact sections. Each project also has a case study at `/projects/<slug>/`. Projects with `featured: false` appear in a compact list below the featured ones, sorted by `order`.

All project additions go in `projects.ts`. Do not invent credentials, results, or links. Unconfirmed content is tracked in `docs/internal/content-open-questions.md`.

## Currently exploring

The Currently exploring section (`#exploring`) renders the threads in `src/data/exploring.ts`. Old `#research` links land on it through an invisible anchor. Each thread is an open question with a status (`Reading`, `Looking for gaps` or `Sketching`), an `updated` date and a `readings` list. A thread's reading list only appears once it has entries, and every reading needs a real title, authors, year and URL from Alan.

`npm run build` fails if any thread's `updated` date is missing, not a `YYYY-MM-DD` date, in the future, or more than 120 days old. The error names the thread. To refresh it, review the thread (question, status, directions and readings), edit anything that changed, then set its `updated` field in `src/data/exploring.ts` to today's date and rebuild.

The home page has one interactive component, the bit-width explorer in `src/components/sections/Explorer.astro`, placed after Currently exploring. The server renders a static table of every result, so it works without JavaScript. When the section scrolls into view, a small lazy script replaces the table with a slider, task and method toggles, and an inline SVG chart. It has no navigation entry.

## Static hosting

The site is hosted on GitHub Pages at `https://m-alan08.github.io/personal-site/`. The Deploy to GitHub Pages workflow builds `dist/` with the default base path and publishes it on every push to main. It can also be started by hand through workflow dispatch, but both jobs skip unless the selected branch is main. In the repository settings, Pages must use GitHub Actions as its source.

The origin and base path come from `src/data/hosting.ts`, which reads two build-time inputs: `SITE_URL` (default `https://m-alan08.github.io`) and `SITE_BASE` (default `/personal-site`). Canonical URLs, Open Graph and Twitter tags, JSON-LD, `sitemap.xml` and `robots.txt` are all generated from them, so nothing needs hand editing when the host changes. To build for a different host with a root path:

```sh
SITE_URL=https://your-confirmed-host.example SITE_BASE=/ npm run build
```

For Vercel, build with the confirmed production origin and a root base, then serve `dist/`. No backend, server functions, or database is required.

## Search and sharing

- `robots.txt` is generated by `src/pages/robots.txt.ts`. It allows all crawlers and points to the sitemap at the configured origin and base, for example `Sitemap: https://m-alan08.github.io/personal-site/sitemap.xml`.
- `sitemap.xml` lists the home page and every project case study.
- Each indexed page gets a unique title and description, a canonical URL, Open Graph and Twitter card tags, and Person, WebSite and WebPage JSON-LD from `src/data/structuredData.ts`. The home page description is the one-liner `description` in `src/content/site.ts`. Project pages use the project `summary` from `src/data/projects.ts`.
- `src/pages/og/[slug].png.ts` renders one 1200x630 PNG share image per page with sharp, using the Geist TTF files in `src/assets/fonts/` (converted from the Latin subset of `@fontsource-variable`, licensed under the SIL Open Font License). Project images show the project title and, when the project has a `headline` in `projects.ts`, that headline result. Otherwise they show the summary.
- `public/favicon.svg` is the AM monogram. `src/pages/apple-touch-icon.png.ts` renders the 180x180 Apple touch icon from it at build time.
- `npm test` runs `scripts/check-seo.mjs` first. It parses every JSON-LD block, checks titles, descriptions, canonical, Open Graph and Twitter tags, share image dimensions and weight (under 150KB), the icons and `robots.txt`, and prints a table of every page.

## Moving to a custom domain

These are the steps for when a domain is bought. None of them have been done yet.

1. Check the build for the new host locally, replacing `example.com` with the real domain:

   ```sh
   SITE_URL=https://example.com SITE_BASE=/ npm run build
   SITE_URL=https://example.com SITE_BASE=/ npm test
   ```

   The build runs the link checker. `npm test` checks canonical URLs, share images and `robots.txt` against the new origin.

2. In a pull request, set the same two values on the "Build static site" step of `.github/workflows/deploy.yml`:

   ```yaml
   - name: Build static site
     run: npm run build
     env:
       SITE_URL: https://example.com
       SITE_BASE: /
   ```

   Update the live URL at the top of this README and in `AGENTS.md` in the same pull request. Do not merge it until the DNS in step 4 resolves.

3. At the domain registrar, add DNS records. For the apex domain, four `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, and optionally four `AAAA` records pointing to `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`. For `www`, a `CNAME` record pointing to `m-alan08.github.io`. Check these against the current [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) before saving.

4. In GitHub, verify the domain under your account settings (Pages, verified domains), then open the repository Settings, Pages, enter the domain under Custom domain and save. A `CNAME` file is not needed because the site deploys through GitHub Actions.

5. Once the DNS check passes and the certificate is issued, tick Enforce HTTPS, merge the pull request from step 2, and confirm that `https://example.com/`, `https://example.com/robots.txt` and `https://example.com/sitemap.xml` load and that a shared link shows the preview image.

## Internal docs

- [AGENTS.md](AGENTS.md): rules for coding agents working in this repository.
- [docs/design-notes.md](docs/design-notes.md): fonts, type scale, color and spacing tokens, and the accent rule.
- [docs/internal/DECISIONS.md](docs/internal/DECISIONS.md): design and architecture decisions by round.
- [docs/internal/PROGRESS.md](docs/internal/PROGRESS.md): running progress log.
- [docs/internal/content-open-questions.md](docs/internal/content-open-questions.md): open content questions for Alan.
- `reports/`: ignored local output from audits and redesign screenshots, for example `reports/redesign/<task-id>/`.

## Maintenance

Redesign work goes through a branch and pull request against main, not direct pushes. Run build, lint, format and smoke tests before committing or pushing. Pull with rebase before every push and never force push. Keep changes small, log decisions in `docs/internal/DECISIONS.md`, and update `docs/internal/PROGRESS.md` at each step.

## Resume

The resume is `public/resume.pdf`, configured by `resumeFile` in `links.ts`. To replace it, overwrite the PDF. The contact links only include the resume when the configured PDF exists inside public/. Any link field set to an empty string is omitted.

## Continuous integration

The Portfolio checks workflow runs `npm ci`, lint, format verification, build, a pinned Playwright Chromium install, and `npm test` for every push to main and for every pull request against main. It has read-only contents permission and does not deploy. Official checkout v7.0.1 and setup-node v7.1.0 are pinned to their verified commit hashes. Node comes from `.nvmrc`.

## Internal links

`npm run build` also runs `npm run check:links`. The dependency-free checker validates all generated HTML links, asset references, share-image URLs, sitemap URLs, and local fragment targets against files in `dist/`. It honors the configured base path and fails on missing targets or empty references. External URLs are verified separately during QA; they are not fetched by the offline build check.

## Browser verification

After a build, start `npm run preview -- --host 127.0.0.1 --port 4322`, then run `npm run audit:browser`. The audit uses an installed Chrome browser with a fresh temporary profile; it does not download a browser or use your existing browsing profile. Set `CHROME_PATH` if Chrome is installed elsewhere, and `QA_ORIGIN` if preview uses another origin. It checks every route at 360px, 768px, and 1280px with axe, keyboard order, skip link, overflow, metadata, control sizes, reduced-motion and print assertions. The theme is always dark. Set `QA_SCHEMES=both` to verify it under both system preferences and `QA_PASS=pass-name` to retain a separate screenshot matrix. Reports and screenshots stay in ignored `reports/`. Browser tooling is development-only.

## Mobile Lighthouse

With the production preview running, `npm run audit:lighthouse` audits every indexed route using default mobile emulation and simulated mobile throttling. It writes real JSON and HTML reports in `reports/lighthouse/`, a summary in `reports/lighthouse-summary.json`, and fails if any category scores below 95. The intentionally noindex 404 is excluded from SEO scoring and is covered by the full browser accessibility matrix. Local preview scores do not measure a deployed host. The same `CHROME_PATH` and `QA_ORIGIN` inputs apply.

## Smoke tests

After `npm run build`, `npm test` runs the search and sharing check described above, then serves dist on an ephemeral loopback port and uses Playwright to test every generated page and the 404. It checks HTTP responses, one h1, browser errors, the six section anchors in order (`about`, `projects`, `exploring`, `writing`, `experience`, `contact`) and navigation, the old `#research` anchor landing on `#exploring`, project case study links, and the four legacy redirects. It also drives the robot playground: the policy weights must not load before a visitor shows intent, a click must end in a reach, a target under the table must be refused, and the 100-target benchmark in the browser must match the exported result. Before the browser tests, `scripts/test-policy.mjs` checks the browser actor against PyTorch reference actions for every precision. An existing Chrome installation works locally. Otherwise install the pinned package's browser with `npx playwright-core install chromium`; CI also installs its system dependencies.

## Robot playground policy

The playground section runs the FetchReach SAC + HER actor from [quantrl-fetch](https://github.com/m-alan08/quantrl-fetch) in the browser with plain TypeScript. `scripts/policy/export_fetch_reach.py` runs inside a quantrl-fetch checkout (`uv run python <path>/export_fetch_reach.py --fp32 <checkpoint> --qat <checkpoint> --out public/models/fetch-reach --vectors scripts/policy/fetch-reach-vectors.json`). It writes the actor weights, the normalizer, the post-training quantization calibration, a linear dynamics model fitted to MuJoCo rollouts, offline MuJoCo and surrogate results for 100 evaluation targets, and PyTorch reference vectors. The generated files are excluded from Prettier. The weights load only after a visitor points at, taps or focuses the playground.

## License

The code is released under the [MIT License](LICENSE). The Geist fonts are under the SIL Open Font License, included in `src/assets/fonts/`.
