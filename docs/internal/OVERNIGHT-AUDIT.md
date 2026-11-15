# Overnight audit

Audit of `main` at `fc18a74` (after the small portrait and crimson portrait glow from PR #90), run on November 15, 2026 before any overnight change. Findings are ranked by how much they affect a visitor's first impression. Each says what I saw, the evidence, and whether the overnight run fixed it, reported it, or left it alone on purpose.

## How it was checked

- Built with `npm run build` (0 errors, 0 warnings, 0 hints; internal link check passed: 11 HTML pages, 364 references) and served with `astro preview` on `127.0.0.1:4322`.
- Real Chrome (headless, through Playwright) loaded every page: home, the five case studies and `/404.html`, at 390, 768, 1440 and 1920px wide, once with `prefers-reduced-motion: reduce` and once with `no-preference`. Each page was scrolled top to bottom first so lazy images and reveal animations could trigger, then captured full page (56 screenshots, kept locally in `reports/overnight/audit/`, which is ignored by git). For every capture I recorded page height, horizontal scroll width, console errors and warnings, and every image's loaded state and size.
- Baseline gates on `main`, unchanged: `npm run lint` exit 0, `npm run format:check` clean, `npm test` passed (SEO 7 pages, policy normalizer, smoke 7 pages and 4 redirects), `npm run audit:browser` passed 21 combinations, `npm run audit:contrast` passed, `npm run audit:lighthouse` passed.
- Keyboard: tabbed through the whole home page at 1440px from a cold load and recorded every stop, its size and whether a focus ring showed.
- External links: every `http` link in the built HTML (17 unique) requested with `curl -L`, plus the GitHub API for links GitHub rate limited.
- Copy: extracted all visible text from the built pages and searched for em and en dashes, double spaces, repeated words, stray spaces before punctuation, and miscapitalized product names.
- SEO and sharing: read the generated `robots.txt`, sitemap, canonical tags and redirect pages, and looked at the generated share images as images.

## Lighthouse (mobile, every indexed page)

| Page                                | Performance | Accessibility | Best practices | SEO |
| ----------------------------------- | ----------- | ------------- | -------------- | --- |
| `/`                                 | 99          | 100           | 100            | 100 |
| `/projects/quantrl-fetch/`          | 100         | 100           | 100            | 100 |
| `/projects/ari-ai/`                 | 100         | 100           | 100            | 100 |
| `/projects/armlab/`                 | 100         | 100           | 100            | 100 |
| `/projects/vla-finetuning-scaling/` | 100         | 100           | 100            | 100 |
| `/projects/constellation/`          | 100         | 100           | 100            | 100 |

Nothing is under 95. The 404 page is `noindex` and is covered by the browser audit instead.

## First impression (five second test)

At 1440x900 and 1920x1080 the first screen shows the name, "Georgia Tech · RL for robotics", the one line headline ("I train reinforcement learning policies for robotics and measure how few bits they need before they stop working."), the availability line and four buttons (GitHub, X, LinkedIn, Email), with the portrait on the right and deliberate empty space beside it. A stranger can tell who Alan is, what he does and what to click. At 390x844 the same text and buttons fit on the first screen and the portrait follows below them. **No change recommended.** The hero's right side was left exactly as it is.

## Findings, ranked

### 1. Experience still shows a timeline chart directly above a list that says the same thing (reported, not changed)

The Experience section draws a four row Gantt style chart (Ascent Math, Ari AI, The Pert Group LLC, Georgia Southern University against 2025, 2026, now), then lists the same four roles with the same dates below it. This is the first item in Alan's original brief. The redesign that removed it (PR #58) was closed without merging today. Because Alan closed it, I did not reopen the decision overnight. **Question for Alan:** keep the chart, or remove it so the list stands alone?

### 2. "What I'm working on" repeats the About section (reported, not changed)

Right after the Playground, a four column strip (Research, Startup, Team, Teaching) says quantrl-fetch quantization sweeps are done and post training is next, and that Alan is CTO of Ari AI. About's "Currently" box, one screen lower, says the same two things. The "Agentic orchestration" card in Currently exploring also repeats the hero's intro sentence word for word ("It is the question under most of my projects: when a robot has a fast learned controller and a slower planner or VLA model, which one should make which call?"). Removing either would delete content, which the brief rules out without Alan's say. **Question for Alan:** keep both, or drop one of the repeats?

### 3. Share images still use the old Geist font (reported, not changed)

The generated Open Graph images (`dist/og/*.png`, 1200x630, 20KB to 33KB each) are clean, readable and unclipped, but are set in Geist Sans and Geist Mono while the site now uses Soria and Instrument Serif. A link shared on LinkedIn or X looks like the old site. Soria has no hyphen glyph, so a title such as "Quantization-aware RL for robotic arm control" would need a fallback, and the image renderer needs TTF files rather than the WOFF2 the site ships. This is a visual decision with tradeoffs, so I left it. The project card image crams the site name and the full site description above the project title, which reads busy but is not broken.

### 4. Home page length and rhythm (reported, nothing deleted)

The home page is 10,145px tall at 1440px and 12,802px at 390px. Order: hero, Playground ("Give it somewhere to reach"), "What I'm working on", About, Selected projects (three cards plus two in progress rows), Currently exploring (two cards), the bit width Explorer, Writing, Experience (chart plus list), Contact. Two interactive demos sit between the hero and the projects, so a recruiter scrolls past the Playground before reaching About and past About before reaching Projects. Section spacing is consistent (`py-section-normal` with numbered headers). The biggest wins without deleting anything would come from findings 1 and 2. Moving the Playground below Projects would put work first, but it is a deliberate earlier choice, so I did not move it.

### 5. Hyphens in Instrument Serif look wide (left alone)

Instrument Serif draws the hyphen as a long low stroke, so "quantrl-fetch", "Soft Actor-Critic" and "post-training" can read like dashes at a glance. The characters really are plain hyphens (`U+002D`); the copy check found no em or en dashes in any generated page. This is the typeface Alan chose, so it stays.

### 6. Unexplained jargon (left alone)

"SAC + HER" appears in the Playground intro before About explains Soft Actor-Critic and Hindsight Experience Replay; "ACT", "pi0", "LIBERO", "PTQ" and "QAT" appear on cards without expansion. These are standard in the field and every case study explains its own terms. For a recruiter they are noise but not errors, so no copy changed.

### 7. Original screenshots are copied into the build unused (reported)

`dist/_astro` contains the full size PNG originals of several project images (largest: `ari-ai-console.png` 618KB, `ari-ai-defense-lab.png` 466KB, `constellation-poster.png` 317KB) that no generated page references. Visitors never download them (every page serves WebP at its display size), so this only adds about 1.7MB to the deploy artifact. Not worth a change on its own.

### 8. Home HTML is large but compresses well (reported)

`index.html` is 120KB uncompressed (about 20KB gzipped), mostly the static result tables and the inline SVG drawings that serve as the no JavaScript fallback. With the stylesheet, the two preloaded fonts and the two small scripts the home page is about 217KB uncompressed before images. Transfer size is far smaller and Lighthouse performance is 99, so I left it.

### 9. Portrait is a 704x704 original (known, left alone)

The hero portrait renders at 240px with a 2x version at 480px, so the 704px source is enough today. A larger original would only matter if the portrait grows again.

## Checks with no problems found

- **Project media.** Every image on every page loaded at both motion settings and all four widths. There are no empty or dark gaps. The Ari AI card image is dark by design (it is a screenshot of a dark landing page with a red glow) and is captioned "the pipeline strip is an illustration". The VLA fine-tuning scaling case study has no images on purpose; it shows a status band because no experiments have run.
- **Layout.** No horizontal scroll at any captured width on any page. No console errors or warnings on any page.
- **Reduced motion.** Pages look the same with and without reduced motion once scrolled; reveal animations do not leave content hidden.
- **Keyboard.** 53 stops from "Skip to content" to "Back to top", in reading order, every one with a visible focus ring and at least 44px tall (the Playground and Explorer radio groups use visually hidden inputs whose labels show the ring). The Explorer controls are reachable on a cold pass.
- **Headings.** Exactly one `h1` on every indexed page.
- **External links.** 13 of 17 returned 200. The other four are fine: two GitHub file links returned 429 (rate limiting from the audit itself) and both files exist according to the GitHub API (`adamissac/constellation/ml/README.md`, `m-alan08/quantrl-fetch/ROADMAP.md`); LinkedIn returns its usual 999 to scripts. No robot arm team repository is linked, and Omen AI and ZeroDay Arena do not appear.
- **Copy.** No em or en dashes, double spaces, repeated words or miscapitalized GitHub, PyTorch, TypeScript or SmolVLA in any generated page.
- **SEO.** Titles and descriptions are unique on all six indexed pages. Canonical URLs, Open Graph, Twitter, JSON-LD, sitemap and `robots.txt` are generated from `SITE_URL` and `SITE_BASE` in `src/data/hosting.ts`; outside that file the GitHub Pages address appears only in `README.md` and `AGENTS.md`. A test build with `SITE_URL=https://example.com SITE_BASE=/` produced no `github.io` references at all.
- **Redirects and anchors.** `/about/`, `/contact/`, `/resume/` and `/projects/` redirect to their home anchors with `noindex` and a canonical link. The old `#research` anchor is kept as a hidden alias in front of Currently exploring, so old links land on that section. `/404.html` loads with a link home.
- **Fonts.** Instrument Serif and Soria are preloaded as WOFF2 from the site itself. No third party hosts.

## Design rule conflict to flag

`docs/design-notes.md` limits the warm glow to six places (the hero atmosphere, the playground pool, the robot eye, the section rule tips, the footer horizon and the button hover and focus shadow). The crimson glow behind the hero portrait that Alan approved and merged in PR #90 is a seventh. The overnight brief says to keep that list exactly as written, so I neither removed the glow nor edited the list. **Question for Alan:** should design notes list the portrait glow as a seventh allowed place?
