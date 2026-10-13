# Decisions

- The user authorizes autonomous work directly on main, resolves ambiguous choices without asking, and authorizes phase 2 before deployment. No deployment settings, secrets, or repository settings will change.
- Scope is tooling, src/, public/, scripts/, the CI workflow, README.md, DECISIONS.md, PROGRESS.md, the lockfile, and local QA reports. AGENTS.md remains byte-for-byte unchanged and is excluded from formatting.
- Node 22.23.3 matches the available local runtime and is pinned exactly in both required files. Astro and Tailwind use the current compatible releases. TypeScript 6 is selected because the Astro checker and TypeScript ESLint do not yet support TypeScript 7.
- Design: white (#ffffff), cool surface (#f4f7f8), ink (#172b34), muted (#4c626a), teal (#12665e), and borders (#cbd7db). A system sans-serif carries all text. Left aligned content puts the introduction beside a short research focus on desktop and above it on mobile. Project entries have separate ownership and status fields rather than decorative statistics. The signature is the clear question each project investigates. No client JavaScript is needed.
- Only facts from the request, AGENTS.md, and the quantrl-fetch README are used. No employer, award, hardware result, or quantified accomplishment is added.
- armlab could not be identified from the public owner repository list, accessible collaborator repositories, a global name search, or a targeted collaborator search. The team project uses the user's exact contribution scope and an empty repository URL. robotfpga is not silently substituted for armlab.
- The known GitHub Pages origin and repository path will be used as a provisional canonical target, not a claim of deployment. SITE_URL and SITE_BASE build environment inputs can replace it for another static host without editing secrets or settings.
- Build, lint, and format checks gate every commit and push. Browser and Lighthouse checks run after full pages exist. Missing input and deployment remain documented exceptions to v1 completeness.

- Astro CLI telemetry is disabled in the npm scripts. Its first build attempted a preferences write outside the workspace; disabling telemetry fixes this without modifying the system. An initial formatting attempt preceded completed installation and was rerun successfully after npm install finished.

- Open Graph previews are deterministic SVG compositions rasterized locally to 1200 by 630 PNGs by Sharp during Astro static generation. They use system sans-serif at build time, with no network services or browser runtime. Sharp is a direct build dependency rather than relying on Astro transitive internals.

- Browser QA uses the installed Chrome with a fresh temporary profile via playwright-core, and axe is injected only into the audit page. No audit code ships to visitors. Full keyboard and viewport assertions supplement automated accessibility scans. No browsers or global packages are installed.

- Lighthouse runs sequentially with real mobile settings against production preview to avoid competing browser workloads. The 404 stays noindex; SEO scores are reported for the seven indexable routes, while all eight routes receive the full accessibility and responsive audit. Charset is the first head element after Lighthouse identified its prior ordering.

- Final cleanup removes only unused data properties. Production output hashes are identical before and after cleanup, so the final Lighthouse reports describe exactly the shipped static output. Root-host and GitHub Pages base paths were both build-tested locally; no deployment or host settings were changed. The configured app project list did not resolve armlab, so its link remains empty.
