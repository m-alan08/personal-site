# Design notes

Shared design foundation for every redesign task. Tokens live in `tailwind.config.mjs` and `src/styles/global.css`. Use a token whenever one covers the value.

## Design idea

A calm, editorial lab notebook. The page is a dark field ruled by hairlines, lit by a warm ember glow that rises from above the fold and fades into the canvas (see the Atmosphere section below). Every section opens with a numbered header (`01` to `06`), and content sits in open space rather than nested boxes. The signature motif is the bit ladder, a short row of stepped ticks that descend like quantization levels (32 bits to 2). It appears only at section markers, the header wordmark and the footer (`Ticks.astro`).

Structure carries the hierarchy: index numbers, rules, whitespace and type contrast. Boxes, chips and color are reserved for things that need them.

## Theme

Dark only. There is no light mode. Print styles switch to black on white.

## Fonts

- Geist Sans (`font-sans`, also `font-display`) for all text. Self-hosted from `@fontsource-variable/geist`, Latin subset, preloaded, `font-display: swap`.
- Geist Mono (`font-mono`) only for genuinely technical text: data tables, numeric readouts and source URLs. Labels, tags, captions, chart axes and metrics use Geist Sans with `tabular-nums` where digits need to line up. Self-hosted from `@fontsource-variable/geist-mono`, Latin subset, `font-display: swap`, not preloaded. The browser only downloads it on pages that use `font-mono`.
- Size-adjusted fallbacks (`Geist Fallback`, `Geist Mono Fallback`) keep text from shifting while the fonts load.
- No italic face ships. `font-synthesis-style: none` keeps text upright, so do not rely on `italic` for emphasis.
- No more than two font families. No third-party font hosts.

## Type scale

| Token          | Use                          | Size                   | Line height | Tracking | Weight  |
| -------------- | ---------------------------- | ---------------------- | ----------- | -------- | ------- |
| `text-display` | Name and hero statement      | 48px to 72px, fluid    | 1           | -0.035em | 700     |
| `text-h1`      | Page titles                  | 36px to 44px, fluid    | 1.1         | -0.03em  | 700     |
| `text-h2`      | Section headings             | 24px to 30px, fluid    | 1.2         | -0.02em  | 600     |
| `text-h3`      | Entry headings               | 20px                   | 1.35        | -0.015em | 600     |
| `text-body`    | Body copy                    | 16px, 17px from 1024px | 1.65        | normal   | 400     |
| `text-small`   | Secondary copy and metadata  | 14px                   | 1.55        | normal   | inherit |
| `text-label`   | Tags, chips and chart labels | 12px                   | 16px        | 0.01em   | 500     |
| `text-eyebrow` | Uppercase labels and kickers | 12px                   | 16px        | 0.08em   | 500     |

The page body uses the `text-body` size by default. Body text never drops below 16px.

## Color

| Token       | Value                    | Use                                          |
| ----------- | ------------------------ | -------------------------------------------- |
| `canvas`    | `#0c0c0d`                | Page background field                        |
| `chrome`    | `#161618`                | Reserved for elevated chrome such as dialogs |
| `surface`   | `#141416`                | Cards and panels                             |
| `raised`    | `#1b1b1e`                | A surface that sits above `surface`          |
| `ink`       | `#ececea`                | Primary text                                 |
| `muted`     | `#a3a3a8`                | Secondary text                               |
| `line`      | `#242427`                | Dividers between sections and entries        |
| `hairline`  | `rgb(236 236 234 / 0.1)` | Thin borders on cards and figures            |
| `control`   | `#4a4a4f`                | Control outlines that need 3:1 contrast      |
| `accent`    | `#ef5a52`                | See the accent rule below                    |
| `glow`      | `rgb(255 110 60)`        | Atmosphere light only, see below             |
| `paper`     | `#f2efe9`                | Light panel for framed pale charts           |
| `paper-ink` | `#1d1c1a`                | Text and captions on `paper`                 |

### Accent rule

The accent color is allowed only on:

1. Link hover and focus states
2. The active navigation item
3. One key number or phrase per section

Everything else uses `ink`, `muted`, `line` or `hairline`. This rule is enforced across the site; check every new component against it.

In practice the one accent element per section is: the hero availability line (hover states only), the playground target, the first project card's headline number, the explorer's selected success rate (big number plus its chart marker), the experience "now" marker and each case study's key result. Chart series never use accent: the emphasized series is `ink`, the others are `chart-blue` and `chart-gold`. Arrows and icons inherit their parent's color rather than carrying accent on their own.

## Atmosphere

The ember glow is the one permitted decorative use of warm color. It uses the `glow` token (a warmer orange than `accent`), rendered by `Atmosphere.astro`: a fixed-height, absolute layer behind all content, painted once per page. The core is three stacked radials, each built from eight to ten eased alpha stops so every edge fades perfectly smoothly (tight core peaking near 0.4, wider falloff near 0.22, deep red to umber fringe near 0.16) over a faint neutral lift and the chrome to canvas fade. There are no hard stops or repeating gradients anywhere in the atmosphere; `atmosphere-grain` adds a fine inline-SVG noise tile at 0.05 opacity to prevent banding.

The glow may appear in exactly six places:

1. The hero atmosphere layer (the strongest, roughly 0.13 to 0.34 layer opacity)
2. A faint warm pool behind the playground stage (`atmo-pool`, around 0.11)
3. The playground robot's eye and its halo (solid `glow` pupil, radial halo fading to transparent)
4. The warm left segment of numbered section rules (`atmo-rule`, up to 0.5 at the tip fading to transparent)
5. A low warm horizon at the footer (`atmo-footer`, around 0.13)
6. A warm shadow on the primary button hover and focus state

Nothing else may use `glow` or any other warm decorative tint. The layer is `aria-hidden`, `pointer-events: none`, never prints, and renders fully without JavaScript. Under `prefers-reduced-motion` the breathing animation is off. Under `prefers-contrast: more` the whole layer drops to 0.45 opacity and the pool, footer and rule echoes dim or disappear.

## Section system

Every home page section uses `Section.astro`: a hairline top rule, a header row (two-digit index plus bit ladder ticks for the six documented sections, or an uppercase eyebrow for feature sections, above an `text-h2` title), then full-width content. An optional `aside` slot sits on the right of the header row. Sections never stack headings in a side rail or use one-off header styles.

## Interactive states

- Hover on links: accent text or fuller accent underline. Hover on clickable cards: slightly brighter border, a small rise and a soft shadow.
- Focus: `2px` ink outline offset `4px`, always visible.
- Pressed: buttons darken one step (`active:bg-line` or `active:brightness-90`).
- All transitions are 150ms to 200ms and removed under `prefers-reduced-motion`.

## Spacing rhythm

Section padding tokens, used as `py-section-compact`, `py-section-normal` or `py-section-spacious` (or any other spacing utility):

| Token              | Size                 | Use                                       |
| ------------------ | -------------------- | ----------------------------------------- |
| `section-compact`  | 40px to 56px, fluid  | Dense sections such as a proof strip      |
| `section-normal`   | 56px to 64px, fluid  | Default section padding (matches today)   |
| `section-spacious` | 72px to 112px, fluid | Sections that need room, such as the hero |

## Motion

Native scrolling only. Smooth anchor scrolling applies only under `prefers-reduced-motion: no-preference`. Under reduced motion, animations and transitions are off.

`data-reveal` elements fade and rise once on first view. The hidden state only exists when the script has marked the document `js-reveal`, so content is fully visible without JavaScript and under reduced motion.
