# Custom domain cutover checklist

This is the plan for moving the site from `https://m-alan08.github.io/personal-site/` to a domain of your own. Nothing here has been done. No domain has been bought, no DNS record exists, and no repository setting has changed.

Everywhere below, **EXAMPLE.COM is a placeholder.** Replace it with the real domain once you have one. The ready pull request on the `overnight/domain-cutover` branch uses `https://example.com` in the same way and is labeled DO NOT MERGE until then.

## Recommendation: apex or www

Use the apex domain (`EXAMPLE.COM`, with no `www`) as the main address and also add the `www` record. GitHub Pages then sends visitors who type `www.EXAMPLE.COM` to `EXAMPLE.COM` automatically. A short address is easier to read on a resume and in an email signature, and setting up both means neither form breaks.

## Steps

1. **Buy the domain.** Use any registrar that lets you edit DNS records yourself (for example Cloudflare Registrar, Porkbun or Namecheap). Turn on auto renew and registrar lock. Do not buy hosting, email or website builder add ons; GitHub Pages does the hosting.

2. **Check the build for the new address on your computer.** Run, with the real domain:

   ```sh
   SITE_URL=https://EXAMPLE.COM SITE_BASE=/ npm run build
   SITE_URL=https://EXAMPLE.COM SITE_BASE=/ npm test
   ```

   Both should pass. This was already run overnight with `https://example.com`, and both passed.

3. **Verify the domain in your GitHub account first.** This stops anyone else from claiming it on GitHub Pages. Go to github.com, your profile picture, Settings, Pages, then "Add a domain". Enter `EXAMPLE.COM`. GitHub shows a `TXT` record with a name like `_github-pages-challenge-m-alan08`. Add that `TXT` record at your registrar, wait a few minutes, and press Verify.

4. **Add the DNS records at your registrar.** Delete any parking or forwarding records the registrar created, then add:

   | Type    | Name           | Value                 |
   | ------- | -------------- | --------------------- |
   | `A`     | `@` (the apex) | `185.199.108.153`     |
   | `A`     | `@`            | `185.199.109.153`     |
   | `A`     | `@`            | `185.199.110.153`     |
   | `A`     | `@`            | `185.199.111.153`     |
   | `AAAA`  | `@`            | `2606:50c0:8000::153` |
   | `AAAA`  | `@`            | `2606:50c0:8001::153` |
   | `AAAA`  | `@`            | `2606:50c0:8002::153` |
   | `AAAA`  | `@`            | `2606:50c0:8003::153` |
   | `CNAME` | `www`          | `m-alan08.github.io`  |

   The `AAAA` records are optional but recommended. Check these values against the current [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) before saving, in case GitHub has changed them. If the registrar is Cloudflare, set every record to "DNS only" (grey cloud) so GitHub can issue the certificate.

5. **Merge the domain pull request.** On the pull request from `overnight/domain-cutover`, replace `example.com` with the real domain in the three files it touches, let the checks pass, remove the DO NOT MERGE label and merge. The deploy that follows builds every canonical URL, share image link, sitemap entry and `robots.txt` line for the new domain.

6. **Point the repository at the domain.** Open the repository, Settings, Pages. Under "Custom domain" enter `EXAMPLE.COM` and press Save. Leave the source as GitHub Actions. You do not need a `CNAME` file in the repository, because the site deploys through GitHub Actions.

7. **Wait for the DNS check and the certificate.** The Pages settings page shows "DNS check successful" once the records resolve, which can take from a few minutes to a day. GitHub then issues a free HTTPS certificate, which can take up to an hour more.

8. **Tick Enforce HTTPS** on the same settings page as soon as the box is clickable.

9. **Check that it works.** In a private browser window, open each of these and confirm the page loads over https with no warning:
   - `https://EXAMPLE.COM/`
   - `https://www.EXAMPLE.COM/` (should land on `https://EXAMPLE.COM/`)
   - `http://EXAMPLE.COM/` (should switch to https)
   - `https://EXAMPLE.COM/projects/quantrl-fetch/`
   - `https://EXAMPLE.COM/robots.txt` and `https://EXAMPLE.COM/sitemap.xml` (both should mention `EXAMPLE.COM`, not `github.io`)
   - `https://m-alan08.github.io/personal-site/` (should redirect to the new domain, see below)

   Then paste `https://EXAMPLE.COM/` into a LinkedIn or X post draft (without posting) or a link preview tool and confirm the preview image appears.

10. **Update the places that link to the old address** (list below). Do this after step 9 works, not before.

## What happens to old links

GitHub Pages redirects a user site's project pages to the custom domain once one is set. Because `m-alan08.github.io` itself has no custom domain, the old address should keep working by redirecting `https://m-alan08.github.io/personal-site/...` to `https://EXAMPLE.COM/...`. **This was not verified overnight**, because it can only be tested after the domain is live. Check it in step 9. If it does not redirect, old links still reach the old deployment until the next deploy replaces it, so update the links in the list below promptly.

Page addresses stay the same apart from the domain: `/projects/<slug>/`, `/about/`, `/contact/`, `/resume/`, `/projects/` and `/resume.pdf` all keep their paths, and the home page anchors (`#about`, `#projects`, `#research`, `#writing`, `#experience`, `#contact`) are unchanged.

## Hardcoded GitHub Pages addresses in the repository

Searched every tracked file except `package-lock.json`. Outside `src/data/hosting.ts` (which holds the default), the old address appears only in:

- `README.md`: the live site link at the top and the first sentence of "Static hosting". Both are updated in the domain pull request.
- `AGENTS.md`: section 2, stack and constraints. Updated in the domain pull request.
- `README.md`: the `SITE_URL` default and the `www` `CNAME` target in "Moving to a custom domain". These are correct as written and stay.

No page, component, script or data file hardcodes the address.

## Places outside this repository to update later

These were not edited. Update them yourself once the domain works:

- The GitHub repository "About" box website field, and the website field on your GitHub profile.
- LinkedIn: the website on your profile intro and any Featured link.
- X: the website field in your profile.
- The resume PDF, if it lists the site address. It was not changed overnight.
- Email signatures for both addresses.
- Any README in your other repositories that links to the site.
- Applications, Devpost, Handshake and similar profiles where you have already submitted the old address.
