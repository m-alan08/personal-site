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
