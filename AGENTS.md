# AGENTS.md

Instructions for coding agents working in this repository. Read this file fully before every task. Where a task request conflicts with this file, follow the request and note the conflict in your pull request. Do not stop to ask about it.

## 1. Project overview

This repository is the personal website of Alan Mozhoor, a Georgia Tech student working on reinforcement learning for robotics.

The site has one job: show real work and make it easy for recruiters, researchers and collaborators to find Alan's projects, GitHub, X, LinkedIn, resume and email. It is a portfolio, not a product. Fast, clear, honest and low maintenance beat impressive and complicated.

Audience, in priority order:

1. Recruiters and hiring managers scanning for under 60 seconds
2. Researchers and professors deciding whether to reply to an email
3. Peers and collaborators looking for project links

## 2. Stack and constraints

- Astro with static output, deployed to GitHub Pages at `https://m-alan08.github.io/personal-site/`
- Tailwind CSS for styling, strict TypeScript
- Package manager: npm, with a committed lockfile
- Node version pinned in `.nvmrc` and the `engines` field of `package.json`
- No backend, no database, no CMS, no server functions
- No UI, animation or charting libraries. No analytics, tracking scripts or third-party embeds
- Do not add a dependency without stating the name, size and reason in the commit body. Prefer the platform and the standard library first

## 3. Pages

The site is one home page plus project case studies plus redirects:

- `/`: home page with the hero, About, Projects, Research interests, Writing, Experience and Contact sections. Each section has a stable anchor: `about`, `projects`, `research`, `writing`, `experience`, `contact`
- `/projects/<slug>/`: one case study per entry in `src/data/projects.ts`
- `/about/`, `/contact/`, `/resume/` and `/projects/`: static redirects to home page anchors, defined in `src/data/redirects.ts`
- `/404.html`: not found page with a link home
- `sitemap.xml`, `robots.txt`, generated Open Graph images and JSON-LD structured data

## 4. Repository layout

```
.
├── AGENTS.md
├── README.md
├── docs/
│   ├── design-notes.md
│   └── internal/
│       ├── DECISIONS.md
│       ├── PROGRESS.md
│       └── content-open-questions.md
├── public/
├── scripts/
│   ├── browser-audit.mjs
│   ├── check-links.mjs
│   ├── lighthouse-audit.mjs
│   ├── smoke-test.mjs
│   └── test-server.mjs
├── src/
│   ├── assets/
│   ├── components/
│   │   └── sections/
│   ├── content/
│   ├── data/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── projects/[slug].astro
│   │   ├── og/[slug].png.ts
│   │   └── sitemap.xml.ts
│   └── styles/
│       └── global.css
└── tailwind.config.mjs
```

Rules for the layout:

- All copy and links live in `src/content/` and `src/data/`, never hardcoded in markup
- Adding a project means adding one entry to `src/data/projects.ts` and nothing else
- One component per file, named in PascalCase
- Each home page section is its own component in `src/components/sections/`. `src/pages/index.astro` only imports and renders them in order
- Pages stay thin and compose components

## 5. Design direction

- Dark only. There is no light mode and no theme switcher
- Minimal, readable, generous whitespace, one accent color used with restraint. The accent rule is in `docs/design-notes.md`
- Fonts: at most two self-hosted variable fonts, currently Geist Sans and Geist Mono. Latin subset only, `font-display: swap`, the sans font preloaded, a size-adjusted fallback so there is no layout shift. No third-party font hosts
- Use the type scale, color, surface and spacing tokens in `tailwind.config.mjs` and `src/styles/global.css`. Do not hardcode sizes or colors that a token already covers
- Mobile first. Test at 360px or 390px, 768px, and 1280px or 1440px widths
- Maximum text line length around 65 to 75 characters
- Body text at least 16px with a line height of at least 1.5
- Interactive elements have visible focus states and a hit area of at least 44px
- Native scrolling only. No scroll hijacking. Smooth anchor scrolling only under `prefers-reduced-motion: no-preference`
- No autoplay media, no carousels, no parallax

## 6. Quality bar

Every pull request must meet all of these before it is opened:

- **Accessibility**: semantic landmarks, one `h1` per page, logical heading order, alt text on all images, color contrast of at least 4.5:1 for body text, fully keyboard navigable, visible focus states, 44px touch targets, respects `prefers-reduced-motion`
- **Performance**: Lighthouse mobile scores of 95 or higher in Performance, Accessibility, Best Practices and SEO. Total page weight under 200KB excluding images. Images are sized correctly, compressed, and use modern formats with explicit width and height
- **SEO**: unique `title` and `meta description` per page, canonical URLs, valid Open Graph and Twitter card tags
- **Correctness**: `npm run build` passes with zero warnings, no broken internal or external links, no console errors in the browser

If a change drops any metric below the bar, fix it before opening the pull request.

## 7. Content rules

- Never invent facts, metrics, employers, awards, dates or project results. Every number must already exist in the site data or in a public README of Alan's repositories
- If information is missing, leave it out of the page and add it to `docs/internal/content-open-questions.md`
- Project descriptions come from each repository's README or from Alan, never from guesses
- Keep copy concise and concrete. Prefer specific verbs and numbers over adjectives
- Avoid buzzwords and filler such as "passionate", "cutting-edge", "leverage", "synergy" and "world-class"
- Write in first person for the bio and about copy
- Never use em dashes or en dashes anywhere: not in site copy, documentation or commit messages. Use commas, periods, colons or parentheses
- Use sentence case for headings
- Spell and capitalize product names correctly (GitHub, TypeScript, PyTorch, SmolVLA)

## 8. Code standards

- Do not add comments to code. Express intent through clear names and small components
- Prefer simple and readable over clever
- No unused code, dead files, commented-out code or leftover debug output
- Prefer Astro components and CSS over JavaScript. Client JavaScript is allowed when a feature needs it. Keep each script small, load it lazily, and justify it in the commit body
- Use Tailwind utility classes. Extract a component, not a custom CSS class, when markup repeats
- Format with Prettier and lint with ESLint using the configs committed to the repo
- TypeScript strict mode on. No `any` without a stated reason in the commit body

## 9. Git workflow

Work on a branch and open a pull request against `main`. Never push directly to `main`.

- Name the branch after the task id, for example `redesign/p1-hero`
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `test:`
- Write commit subjects in the imperative mood, under 72 characters, with no trailing period
- One logical change per commit. Each commit builds on its own
- Use the commit body to explain why when it is not obvious
- Rebase on `main` before opening the pull request
- Never force push and never rewrite history on `main`
- Stay inside the files your task owns. If you must change another file, make the smallest change possible and name it in the pull request

## 10. Commands

```
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
npm test
npm run audit:browser
npm run audit:lighthouse
npm run audit:contrast
```

`audit:browser`, `audit:lighthouse` and `audit:contrast` need `npm run preview -- --host 127.0.0.1 --port 4322` running. If a script is missing, add it in a dedicated `chore:` commit rather than working around it.

## 11. How to approach each task

1. Read the request, this file, `README.md` and `docs/internal/content-open-questions.md`
2. Inspect the existing code before writing anything. Match its conventions
3. List the files you will touch. Stay inside that list
4. Implement the smallest change that satisfies the request
5. Run build, lint, format check and tests. Fix every failure you introduced
6. Review your own diff line by line. Remove anything unnecessary
7. Take before and after screenshots of every page you changed at 1440px, 768px and 390px, saved under `reports/redesign/<task-id>/`
8. Rebase on `main`, push the branch and open a pull request

## 12. Safety and boundaries

- Do not modify or delete files outside the scope of the current request
- Do not touch secrets, `.env` files, deployment settings, DNS or repository settings
- Do not commit credentials, tokens or personal data beyond what Alan has listed in `src/data/links.ts`
- Do not add tracking, third-party scripts or external embeds
- Do not install global packages or modify the system
- If a tool, command or check fails, report the failure plainly. Never claim success without evidence

## 13. Reporting

Alan reads the pull request, not the code. Write it so the work can be checked without reading code:

- Report the result of `npm run build`, `npm run lint`, `npm run format:check` and `npm test`
- Attach the before and after screenshots
- Describe in plain language what a visitor now sees that they did not before, what was removed, and what was left alone on purpose
- State what you verified, with evidence, and what you did not verify
- Name any file changed outside the task's owned files
- End with any questions for Alan

Be accurate over optimistic. A clear "this part is not finished" is better than a confident summary that hides a gap.

## 14. Definition of done for any task

- Build, lint, format check and tests pass
- The change works at mobile, tablet and desktop widths
- The accessibility and performance bars in section 6 still hold
- The change matches the request and nothing outside its scope changed
- No comments in code, no em dashes or en dashes in text, no invented content
- Commits are small and clearly named, on a branch, with a pull request against `main`
