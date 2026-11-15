# Overnight report

## Summary

I audited the live state of `main` (after PR #90) at four widths with reduced motion on and off, and the site is in good shape: every gate passes, every indexed page scores 99 or 100 on mobile Lighthouse, nothing overflows, every image loads and the copy has no dashes or typos. The real first impression issues are content decisions rather than bugs: the Experience timeline still duplicates the list below it, "What I'm working on" repeats About, and the share images still use the old font. Because the brief forbids deleting content and inventing copy, I reported those for you to decide instead of changing them. I added a guard test to `npm test` that protects the empty space beside the hero portrait, the nav anchors, and the no dash and no comment rules. I also wrote the custom domain checklist and opened a ready, labeled DO NOT MERGE pull request that switches the build to a placeholder domain.

## Pull requests

- [#93](https://github.com/m-alan08/personal-site/pull/93) `overnight/audit`: docs only. This audit, this report, the domain checklist, and entries in PROGRESS, DECISIONS and content open questions.
- [#91](https://github.com/m-alan08/personal-site/pull/91) `overnight/tests`: adds `scripts/test-guards.mjs` to `npm test`. No visible change.
- [#92](https://github.com/m-alan08/personal-site/pull/92) `overnight/domain-cutover`: DO NOT MERGE. Deploy workflow env plus the live URL lines in README and AGENTS, with `example.com` as a placeholder.

Nothing was merged. Nothing was pushed to `main`. No DNS, Pages setting, secret or account setting was touched.

## How it was verified

- Every gate run locally with Node 22.23.3 from `.nvmrc` and Chrome through `CHROME_PATH`: `npm run lint`, `npm run format:check`, `npm run build`, `npm test`, `npm run audit:browser`, `npm run audit:contrast`, `npm run audit:lighthouse`. The real output is pasted in each pull request.
- 56 full page captures (7 pages, 4 widths, 2 motion settings) in headless Chrome, with console, overflow and image load data recorded per capture.
- A cold keyboard pass through the home page at 1440px, recording all 53 focus stops.
- All 17 external links requested live, with the GitHub API used where GitHub rate limited the script.
- The guard test was proven to fail by temporarily adding an em dash, a code comment and a "Now" link in the hero's right third, then restoring the files.
- `SITE_URL=https://example.com SITE_BASE=/ npm run build` and `npm test` both passed on the domain branch, and the built files contain no `github.io` address.

## What was not verified, and why

- Browsers other than Chrome, real phones and a real printer: only headless Chrome is available here.
- Anything on a real custom domain, including whether `m-alan08.github.io/personal-site/` redirects after cutover: no domain exists yet.
- Hands-on clicking by the testing agent: the overnight changes have no visible surface (a test file, docs, and a workflow env that only applies after merge), so there was nothing new to click.
- LinkedIn's page content: LinkedIn blocks scripted requests with status 999, so the profile link was checked only for shape.

## Assumptions

- Visual polish, copy edits, project card changes, print and image pipeline work were all listed as "only if the audit supports it". The audit found no defect in those areas, so I opened no pull request for them rather than make changes for their own sake.
- Removing the Experience timeline, or either half of the repeated "currently" content, counts as deleting content, which the brief rules out without you. Reported as questions.
- The portrait glow from PR #90 is a seventh glow location. I kept both the glow (you approved it) and the six item list in `docs/design-notes.md` (the brief says to keep it exactly as written), and flagged the mismatch.
- The domain checklist and report live on the audit pull request so the domain pull request can contain only the workflow and URL lines, as the brief requires.
- `example.com` in lowercase is used inside URLs and YAML, and `EXAMPLE.COM` in the checklist prose, as the placeholder.
- The `DO NOT MERGE` label did not exist, so I created it on the repository to label #92.

## New content open questions

Added to `docs/internal/content-open-questions.md`:

- Keep or remove the Experience timeline chart above the list.
- Keep both "What I'm working on" and About's "Currently", or drop one.
- Move the share images to Soria and Instrument Serif, or keep Geist there.
- Add the portrait glow to the allowed glow list in design notes.

## Top five things Alan should look at first

1. The Experience timeline question (audit finding 1). It is the first complaint in your original brief and it is still on the site.
2. The repeated "currently" content (finding 2), which is the easiest way to make the home page shorter without losing anything.
3. [#91](https://github.com/m-alan08/personal-site/pull/91), the guard test, since it now fails the build if anything is placed beside the hero portrait.
4. The share image font (finding 3), which is what people see when your link is posted.
5. `docs/internal/DOMAIN-CUTOVER.md` and [#92](https://github.com/m-alan08/personal-site/pull/92), ready for whenever you buy a domain.
