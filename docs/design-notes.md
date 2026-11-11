# Design notes

Shared design foundation for every redesign task. Tokens live in `tailwind.config.mjs` and `src/styles/global.css`. Use a token whenever one covers the value.

## Theme

Dark only. There is no light mode. Print styles switch to black on white.

## Fonts

- Geist Sans (`font-sans`, also `font-display`) for all text. Self-hosted from `@fontsource-variable/geist`, Latin subset, preloaded, `font-display: swap`.
- Geist Mono (`font-mono`) for data labels, numbers and small captions. Self-hosted from `@fontsource-variable/geist-mono`, Latin subset, `font-display: swap`, not preloaded. The browser only downloads it on pages that use `font-mono`.
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
| `text-label`   | Data labels with `font-mono` | 12px                   | 16px        | 0.06em   | 500     |

The page body uses the `text-body` size by default. Body text never drops below 16px.

## Color

| Token      | Value                    | Use                                     |
| ---------- | ------------------------ | --------------------------------------- |
| `canvas`   | `#0c0c0d`                | Page background                         |
| `chrome`   | `#161618`                | Header and top of page gradient         |
| `surface`  | `#141416`                | Cards and panels                        |
| `raised`   | `#1b1b1e`                | A surface that sits above `surface`     |
| `ink`      | `#ececea`                | Primary text                            |
| `muted`    | `#9b9b9f`                | Secondary text                          |
| `line`     | `#242427`                | Dividers between sections and entries   |
| `hairline` | `rgb(236 236 234 / 0.1)` | Thin borders on cards and figures       |
| `control`  | `#4a4a4f`                | Control outlines that need 3:1 contrast |
| `accent`   | `#ef5a52`                | See the accent rule below               |

### Accent rule

The accent color is allowed only on:

1. Link hover and focus states
2. The active navigation item
3. One key number or phrase per section

Everything else uses `ink`, `muted`, `line` or `hairline`. This rule is not yet enforced across existing components; later tasks bring each section into line with it.

## Spacing rhythm

Section padding tokens, used as `py-section-compact`, `py-section-normal` or `py-section-spacious` (or any other spacing utility):

| Token              | Size                 | Use                                       |
| ------------------ | -------------------- | ----------------------------------------- |
| `section-compact`  | 40px to 56px, fluid  | Dense sections such as a proof strip      |
| `section-normal`   | 56px to 64px, fluid  | Default section padding (matches today)   |
| `section-spacious` | 72px to 112px, fluid | Sections that need room, such as the hero |

## Motion

Native scrolling only. Smooth anchor scrolling applies only under `prefers-reduced-motion: no-preference`. Under reduced motion, animations and transitions are off.
