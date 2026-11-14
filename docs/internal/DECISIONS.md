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

## Round 2

- Goal: add verified hackathon case studies, develop the dark technical portfolio, and validate every page and interaction. The new request explicitly authorizes dark only, lazy client JavaScript, the command palette, and page transitions. These override conflicting earlier theme, modal, and zero-JavaScript rules. No deployment, secrets, repository settings, analytics, embeds, or external scripts are in scope.
- The current main checkout has the initial site rather than a separate redesign. Implement the requested dark foundation and minimal native-dialog command palette here. Keep the system font stack to avoid an unnecessary font dependency or download.
- Scope: src/ components, data, copy, styles and client modules; scripts/ QA tools; package scripts; the existing checks workflow; README, PROGRESS and DECISIONS. Keep AGENTS unchanged. Local reports are ignored.
- Design tokens: midnight #10151e, layered slate #19222e, paper ink #f0f3f8, secondary ink #b2bed0, pale blue #9dc7ff, structural line #354358. Use left aligned system sans-serif with compact, readable metadata. The hero depicts a policy network as an explicitly illustrative interaction. Research entries and the hackathon timeline use distinct structures, not an undifferentiated card grid. Case studies pair a broad pipeline with narrow reading columns.
- Design review: a generic glowing dashboard would obscure the work. Keep glow confined to user interaction with the hero and graph. Use visible ownership and evidence boundaries instead of decorative statistics. Every connection and pipeline edge must communicate a real documented relationship.
- The palette loads its search module on first invocation. Native dialog provides focus trapping and Escape. A small entry script is justified by keyboard invocation. CSS view transitions are short and disabled for reduced motion.
- Use existing playwright-core and installed Chrome locally, and its pinned Chromium in CI. No dependency is added. npm test serves the built output on an ephemeral loopback port and tests all sitemap routes plus 404, including palette keyboard behavior.
- GitHub redirects confirm adamissac/hackgt13-project is now adamissac/constellation and adamissac/zeroday-arena is now adamissac/omen-ai. Both are public. Branch lists and READMEs identify distinct projects, not shared branches. Use canonical public URLs. Checked Constellation main 80d27d13682672619d02a076ad05a6ffe8277a68 and Omen AI main 393486c875d281a8e1e72466a03559b4c52421e1.

- Preserve the existing solo RL and armlab descriptions and project notes. Add case-study fields uniformly. Technical learning sections summarize documented engineering lessons without inventing personal anecdotes. armlab's undocumented approach, stack, lessons and pipeline stay empty. A diagram cannot be derived from a README that has not been identified, so omit that one and report the gap.
- Diagram nodes are limited to documented stages. Quantization evaluation is labeled pending. Constellation separates recommendations from encounter verification and mutual consent. Omen's diagram describes Alan's lab workflow and explicitly excludes the teammate's simulated RL engine.
- A Devpost URL must be present in source documentation before linking. Inspected local and public README/ML documentation and related markdown yielded no verified project submission URL. Keep fields empty. ZeroDay has a year-only event label because exact dates and location were not supplied.

- The hero uses hand-authored example weights, not model or experiment output. Its precision buttons update only an illustrative diagram. Constellation's graph uses eight fictional lettered nodes and ten invented links with explicit labels. These samples are visual explanations, not claimed project architecture or attendee data.
- Both interaction modules load when their figures enter the viewport. The graph solves only 64 small force iterations at initialization or reset, then stays still. Drag updates are coalesced to animation frames; keyboard arrow keys provide equivalent movement through 44px node buttons. No continuous simulation, autoplay motion or animation library is added.

- Manual graph accessibility review adds linked example letters to live selection status and a complete connection description to the SVG. This exposes the same sample relationships to screen readers without claiming real data. Use a distinct control-border token to meet non-text contrast while retaining quieter structural dividers.
- Final QA uses production preview for scoring and the page matrix, with the dev server also started and checked. Both system preferences must render dark. Screen reader labels, native-dialog focus trapping, DOM keyboard order, reduced motion, print and all route metadata are checked alongside axe. CI uses the same built-page smoke suite.

## Round 3: minimal redesign

- Goal: a minimal, single-page technical homepage. This request supersedes Round 2's dark technical portfolio direction and the old direct-to-main workflow. Work happens on `redesign/integration` and lands through a pull request against main. AGENTS.md is unchanged.
- Keep Astro, Tailwind CSS, strict TypeScript, static output, the content model, SEO metadata, JSON-LD, sitemap, share images, link checker, smoke tests, browser audit and Lighthouse audit.
- Remove the command palette, policy precision hero, connection graph, project filter, hackathon timeline, SVG pipeline diagrams, page transitions, gradient surfaces, glow and the blue accent. They conflict with the request for restraint and no excessive interactive widgets. Their client scripts and the interaction audit go with them. The site now ships no client JavaScript.
- Design tokens: canvas #0c0c0d, surface #141416, ink #ececea, muted #9b9b9f, line #242427, control #4a4a4f. System sans-serif, a 68ch reading width, a narrow left label column for section headings on wide screens, and thin dividers between sections and entries. Links are underlined; hover only changes underline or text color.
- One page with About, Projects, Research interests, Writing, Experience and Contact sections. Project case studies stay at `/projects/<slug>/` because they hold detailed, sourced project information. `/about/`, `/contact/`, `/resume/` and `/projects/` become static redirects to home page anchors so existing links keep working.
- Content is owned by a separate content agent on `content/structured-copy` and merged here after fact-checking by a QA agent. Inferred claims, such as an exact Ari AI role, are replaced with neutral wording. Private or unavailable repositories are not linked. Remaining questions for Alan are in `docs/internal/content-open-questions.md`.
- `uniqueFeature` is a `null` placeholder for one future interactive component. Nothing is designed or rendered for it yet; it will become its own home page section. Redesign task p7-explorer replaced it with the bit-width explorer.

## Redesign p7: bit-width explorer

- The `uniqueFeature` placeholder is removed. The home page gets one interactive component, the bit-width explorer, after Projects. It has no navigation entry, so the six section anchors and the navigation stay unchanged.
- Every value in `src/data/explorerData.ts` is copied from the FetchReach and FetchPush tables under Key results in the public quantrl-fetch README: the mean success rate and the lowest and highest seed. Nothing is interpolated, smoothed or estimated. A missing cell is `null` and shows as "Not measured". Final distance to the goal is left out to keep the component focused on success rate.
- The limitation note is the first quantrl-fetch case study limitation, read from `projects.ts`, so the wording stays identical.
- The server renders a static table of all results. A small loader script waits for the section to come within 200px of the viewport (IntersectionObserver), then imports the explorer module, which replaces the table with native radio fieldsets, a native range input, a result bar and an inline SVG chart. The chart and its points are server rendered from the same data; the script only shows, hides and highlights them. There are no transitions, so reduced motion needs no special case.
- The browser audit now scrolls each page once before the keyboard order check, so lazy content is present, and skips unchecked radio buttons, which are not Tab stops.

## Robot playground

- The playground sits right after the hero as the signature feature. It has a section anchor, `playground`, but no navigation entry, so the six navigation anchors stay unchanged.
- The arm is driven by the real FetchReach actor: the same 13 inputs (observation plus goal, normalized and clipped like `GoalObservationNormalizer`), the same 256 by 256 network, the deterministic `tanh` mean and the 0.05 action scale. `scripts/test-policy.mjs` requires the browser actions to match PyTorch within 1e-5 for every precision; the largest observed gap is 4.8e-7.
- MuJoCo does not run in the browser. The next state comes from a linear model fitted to MuJoCo rollouts of the same policy. The 100-target success rates of this surrogate are within 0.02 of MuJoCo for every precision, and the page says so. The side view drawing is stylized; elbow placement is geometry for the drawing only, the gripper position comes from the policy and the dynamics model.
- The repository has no published checkpoint, so FP32 (30,000 steps) and QAT 4-bit fine-tuning (10,000 steps) were retrained from the committed FetchReach config with seed 0. Their checksums and step counts are in `policy.json`. The page states that these numbers differ slightly from the README. This conflicts with the rule that every number must already exist in a README; the request asked for measured live and offline metrics, so the conflict is noted in the pull request. Alan approved publishing these retrained weights.
- Post-training quantization is computed in the browser from the FP32 weights and exported activation ranges, the same per-channel symmetric fake quantization as quantrl-fetch. QAT 4-bit ships integer weights and scales. Nothing claims integer hardware speed; latency is a JavaScript forward pass in the visitor's tab.
- The proportional controller is labeled scripted and runs on the same dynamics model, so it is a baseline, not a learned result.
- No dependency is added. ONNX Runtime Web would add megabytes for a 13 by 256 by 256 by 8 network. The section module loads on first intent (pointer, tap or focus) and the weights with it, so visitors who only scroll download 610 bytes of script for it. The precision control is a native select, which keeps the home page under 200KB before compression, excluding images.

## Polish pass: ambient gradient and active navigation

- The page background replaces the single flat linear fade with a layered treatment: a faint warm radial glow and a broader neutral light centered above the fold over the existing chrome to canvas linear fade. The light is visible but soft, and print styles still remove every background image.
- A small bundled header script marks the matching nav link with `aria-current="location"` while scrolling. The active item takes the accent color, a use the accent rule already allows. Scroll work is coalesced through animation frames, the last section activates at the page foot, and the script does nothing on pages without the section anchors.
- Clickable cards lift slightly and gain a soft shadow on hover so they read as pressable. The motion is gated behind `prefers-reduced-motion` and removed entirely under reduced motion.
- Text links keep the accent underline but start quieter and reach full strength on hover. Icon links nudge upward on hover.

## Redesign f1: foundation

- One visual idea for the whole site: an editorial lab notebook on a dark canvas field. Sections open with a hairline rule, a two digit index and the bit ladder motif, a short row of stepped ticks that descend like quantization levels (32 bits to 2). The motif appears only at section markers, the header wordmark and the footer.
- The layered top glow from the polish pass was removed in this branch, then restored at Alan's request before merge of the follow on work. The faint warm radial and neutral radial over a short chrome to canvas fade stay.
- `muted` lifts from #9b9b9f to #a3a3a8 for a little more secondary contrast. New `paper` (#f2efe9) and `paper-ink` (#1d1c1a) tokens reserve a light panel for framed pale charts on later tasks.
- One `Section` component owns every home page section header: hairline top rule, index plus ticks or an uppercase eyebrow, an `text-h2` title and an optional aside slot. The old stacked and left column variants are gone.
- The header gains a hand drawn AM monogram wordmark, a native details disclosure menu on small screens with numbered links and 44px rows, and an IntersectionObserver scroll spy that sets `aria-current` on the active item. The menu closes on link pick, Escape (focus returns to the summary) and outside pointerdown.
- `data-reveal` elements fade and rise once on first view through a tiny bundled observer. The hidden state only exists after a synchronous head script marks the document `js-reveal`, so content is fully visible without JavaScript, under reduced motion and if the script never runs.
- Shared primitives for later tasks: `Ticks`, `Eyebrow`, `ButtonLink`, `Chip`, `Stat` and `Card`. The accent rule now applies to every new component.

## Redesign q1: accent allocation

- Chart series encode emphasis with `ink` rather than accent, matching the explorer's selected series convention; `chart-blue` and `chart-gold` stay for the other series. This keeps accent rare enough to mean something while keeping the key series readable.
- Each section's single accent element is fixed and documented in design-notes.md. Arrows and icons always inherit the parent color so accent appears only through real hover, focus and active states.

## Redesign g1: ember atmosphere

- The glow moved off `body` into `Atmosphere.astro` so it sizes with the viewport (clamp 38rem to 60rem against 95svh), covers the hero and fades before the playground instead of cutting off at a fixed rem, and never repaints on long pages. `z-index: -1` on a `relative` body keeps it behind all content without affecting stacking.
- A separate `glow` token (255 110 60) carries the warm light so `accent` keeps its interactive meaning. The accent rule is unchanged; the glow is the one permitted decorative warm color and design notes enumerate its five locations.
- The banding artifact of low opacity dark gradients is used on purpose: the outer falloff ring is a repeating radial with hard stops, a quantization contour that echoes the bit ladder, masked to an annulus so the core stays smooth. Three strengths were compared at 390px, 768px and 1440px; the medium scale shipped because subtle read as the old layer and strong made the rings dominate the hero.
- Motion is compositor only: one 18s transform plus opacity breathe on the core, gated behind `prefers-reduced-motion`. The pointer response is a lazy listener that arms on first pointermove, sets two custom properties through rAF, and only runs with a fine pointer and no reduced motion preference. Nothing moves without JavaScript.
