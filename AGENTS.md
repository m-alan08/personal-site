# AGENTS.md

Instructions for the coding agent working in this repository. Read this file fully before every task. If anything here conflicts with a request in an issue or chat, stop and ask instead of guessing.

## 1. Project overview

This repository is the personal website of Alan Mozhoor, a Georgia Tech student focused on AI/ML, reinforcement learning, and research.

The site has one job: show real work and make it easy for recruiters, researchers, and collaborators to find Alan's projects, GitHub, X, and resume. It is a portfolio, not a product. Fast, clear, honest, and low maintenance beat impressive and complicated.

Audience, in priority order:
1. Recruiters and hiring managers scanning for under 60 seconds
2. Researchers and professors deciding whether to reply to an email
3. Peers and collaborators looking for project links

## 2. Stack and constraints

- Astro with static output
- Tailwind CSS for styling
- TypeScript where it adds safety, plain Astro components elsewhere
- Package manager: npm, with a committed lockfile
- Node version pinned in `.nvmrc` and the `engines` field of `package.json`
- Deploy target: Vercel or GitHub Pages, static only
- No backend, no database, no CMS, no server functions
- No UI component libraries, no animation libraries, no analytics, no tracking scripts, no third-party embeds
- Do not add a dependency without stating the name, size, and reason in the commit body. Prefer the platform and the standard library first

## 3. Scope: definition of done for v1

Version 1 ships when all of these exist, work, and are deployed at a public URL:

1. **Home**: one-line intro, a two to three sentence bio, links to GitHub, X, resume, and contact
2. **Projects**: one card per project with title, one-sentence summary, tech used, status, and a link to the repo. Team projects are labeled as team efforts and describe only Alan's own contribution
3. **About**: short, plain-language background, written in first person
4. **Contact**: a `mailto:` link. No form, no backend
5. **404 page**: simple, with a link home
6. **SEO basics**: page titles, meta descriptions, Open Graph tags, a favicon, `sitemap.xml`, and `robots.txt`
7. **Deployed** and reachable at a public URL

Everything not on this list is out of scope until v1 ships. Do not add a blog, a theme switcher beyond system preference, a command palette, page transitions, or a design system. If an idea seems valuable, open an issue labeled `idea` and do not build it.

## 4. Repository layout

```
.
├── AGENTS.md
├── README.md
├── LICENSE
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   ├── favicon.svg
│   ├── resume.pdf
│   └── robots.txt
└── src/
    ├── components/
    ├── content/
    │   └── site.ts
    ├── data/
    │   ├── projects.ts
    │   └── links.ts
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── index.astro
    │   ├── projects.astro
    │   ├── about.astro
    │   ├── contact.astro
    │   └── 404.astro
    └── styles/
        └── global.css
```

Rules for the layout:
- All copy and links live in `src/content/` and `src/data/`, never hardcoded in markup
- Adding a project means adding one entry to `src/data/projects.ts` and nothing else
- One component per file, named in PascalCase
- Pages stay thin and compose components

## 5. Design direction

- Minimal, readable, generous whitespace, one accent color, restrained use of it
- System font stack, or at most one self-hosted web font with `font-display: swap`
- Light and dark mode that follow `prefers-color-scheme`, with no flash on load
- Mobile first, then scale up. Test at 360px, 768px, and 1280px widths
- Maximum text line length around 65 to 75 characters
- Body text at least 16px with a line height of at least 1.5
- Interactive elements have visible focus states and a hit area of at least 44px
- No autoplay media, no carousels, no modals, no parallax

## 6. Quality bar

Every push to `main` must meet all of these first:

- **Accessibility**: semantic landmarks, one `h1` per page, logical heading order, alt text on all images, color contrast of at least 4.5:1 for body text, fully keyboard navigable, respects `prefers-reduced-motion`
- **Performance**: Lighthouse scores of 95 or higher in Performance, Accessibility, Best Practices, and SEO on mobile settings. Total page weight under 200KB excluding images. Images are sized correctly, compressed, and use modern formats with explicit width and height
- **SEO**: unique `title` and `meta description` per page, canonical URLs, valid Open Graph and Twitter card tags
- **Correctness**: `npm run build` passes with zero warnings, no broken internal or external links, no console errors in the browser

If a change drops any metric below the bar, fix it before pushing.

## 7. Content rules

- Never invent facts, metrics, employers, awards, dates, or project results
- If information is missing, leave the field out of the page and mention the gap in your final report
- Project descriptions come from each repo's README or from Alan, never from guesses
- Keep copy concise and concrete. Prefer specific verbs and numbers over adjectives
- Avoid buzzwords and filler such as "passionate", "cutting-edge", "leverage", "synergy", and "world-class"
- Write in first person for the bio and about page
- Never use em dashes anywhere: not in site copy, documentation, or commit messages. Use commas, periods, colons, or parentheses
- Use sentence case for headings
- Spell and capitalize product names correctly (GitHub, TypeScript, PyTorch)

## 8. Code standards

- Do not add comments to code. Express intent through clear names and small functions
- Prefer simple and readable over clever
- Keep functions short and single purpose
- No unused code, dead files, commented-out code, or leftover debug output
- Prefer Astro components and CSS over JavaScript. Ship zero client-side JavaScript unless a feature cannot work without it, and justify any in the commit body
- Use Tailwind utility classes. Extract a component, not a custom CSS class, when markup repeats
- Format with Prettier and lint with ESLint using the configs committed to the repo
- TypeScript strict mode on. No `any` without a stated reason in the commit body
- Name things by what they are: `ProjectCard`, `projects`, `socialLinks`

## 9. Git workflow

Push directly to `main`. Do not open pull requests unless Alan asks for one.

- Work from a GitHub issue when one exists, and reference it in the commit body (for example `Refs #4`)
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `test:`
- Write commit subjects in the imperative mood, under 72 characters, with no trailing period
- One logical change per commit. Commit early and often so history stays readable and each commit builds on its own
- Use the commit body to explain why when it is not obvious
- Run `git pull --rebase origin main` before every push so history stays linear
- Never force push and never rewrite history on `main`
- Never push a commit that fails the build, lint, or format checks. The site deploys from `main`, so a broken push breaks the live site
- If a change is large, risky, or experimental, work on a branch named `feat/short-name` and ask Alan before merging it into `main`
- Do not bundle unrelated changes into one commit

## 10. Commands

Use these exact commands and report their results in your final report:

```
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

If a script is missing, add it in a dedicated `chore:` commit rather than working around it.

## 11. How to approach each task

1. Read the issue or request and this file. Restate the goal in one sentence at the top of your work
2. Inspect the existing code before writing anything. Match its conventions
3. Make a short plan of the files you will touch. Stay inside that list
4. Implement the smallest change that satisfies the request
5. Run build, lint, and format. Fix every failure you introduced
6. Review your own diff line by line as if you were a stranger reviewing it. Remove anything unnecessary
7. Commit in small logical steps, pull with rebase, then push to `main`
8. Stop. Do not start unrelated work

When requirements are ambiguous, ask a specific question and wait. Do not choose silently.

## 12. Safety and boundaries

- Do not modify or delete files outside the scope of the current request
- Do not touch secrets, `.env` files, deployment settings, DNS, or repository settings. Ask first
- Do not commit credentials, tokens, or personal data beyond what Alan has explicitly listed in `src/data/links.ts`
- Do not add tracking, third-party scripts, or external embeds without written approval from Alan
- Do not install global packages or modify the system
- Do not work around a restriction in this file. If a rule blocks the task, say so and ask
- If a tool, command, or check fails, report the failure plainly. Never claim success without evidence

## 13. Reporting

When finishing a task, report:
- What was done, in two or three sentences
- The commits pushed to `main`
- The exact checks run and their results
- Anything not done and why
- One suggested next task, if there is a natural one

Be accurate over optimistic. A clear "this part is not finished" is better than a confident summary that hides a gap.

## 14. Definition of done for any task

- The build, lint, and format checks pass
- The change works at mobile and desktop widths and in light and dark mode
- Accessibility and performance bars in section 6 still hold
- The change matches the request and nothing outside its scope changed
- No comments in code, no em dashes in text, no invented content
- Commits are small, clearly named, and pushed to `main`