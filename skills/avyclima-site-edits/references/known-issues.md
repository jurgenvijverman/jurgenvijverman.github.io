# Known issues — outstanding things to fix

This is a live to-do list of issues found during the initial site audit. Treat it as work-in-progress: when a user request is adjacent to one of these, fix it in the same change and tick the item off. When new drift is discovered, add it here.

The exact counts in parentheses are from the audit on **2026-05-02** — re-run the verification command before fixing to make sure nothing changed.

## High priority — site-wide drift

### 1. Footer copyright is hardcoded `© 2024` on 29/34 pages
Verify: `grep -l '© 2024\|&copy; 2024' *.html blog/*.html portfolio/*.html | wc -l`

Fix: bulk replace `&copy; 2024 AVYclima` → `&copy; 2026 AVYclima` (or whatever the current calendar year is). After fixing, also discuss with Jurgen whether the footer should switch to a JS-injected year so this doesn't recur next January 1.

### 2. "Werkgebied" link is missing from the footer of multiple pages
Verify: `for f in *.html; do grep -q 'href="werkgebied.html">Werkgebied' "$f" || echo "  $f"; done`

Pages without the Werkgebied footer link include service hubs (`airco.html`, `warmtepomp.html`, `onderhoud.html`) and most info pages. The canonical footer (in `index.html`) does include it. Fix: align all footers to `references/chrome-templates.md`.

### 3. `<meta name="theme-color" content="#0066cc">` missing on ~8 pages
Verify: `for f in *.html blog/*.html portfolio/*.html; do grep -q 'theme-color' "$f" || echo "  $f"; done`

Affected pages at audit time: `airco-dendermonde.html`, `airco-ninove.html`, `airco.html`, `onderhoud.html`, `warmtepomp-dendermonde.html`, `warmtepomp-ninove.html`, `warmtepomp.html`, `werkgebied.html`. Fix: add the meta tag to each.

### 4. `og:image` missing on 7 pages
Verify: `for f in *.html blog/*.html portfolio/*.html; do grep -q 'og:image' "$f" || echo "  $f"; done`

Affected at audit time: same set as theme-color minus a couple, plus `blog/warmtepomp-renovatie.html`. Fix: add `<meta property="og:image" content="https://avyclima.be/og-image.jpg">` and `<meta name="twitter:image" content="https://avyclima.be/og-image.jpg">`.

### 5. Informal "je / jij / jouw" appears on 5 pages
Verify: `grep -nE '\b(je|jij|jouw)\b' *.html blog/*.html portfolio/*.html`

The brand voice is formal "u" only. Affected at audit time: `airco-erpe-mere.html`, `airco-haaltert.html`, `airco-ninove.html`, `blog.html`, `onderhoud-aalst.html`. Fix: rewrite each occurrence in the canonical formal register (see `references/brand-voice.md`).

Caution: a `grep \bje\b` will match the surname "Verstraeten-Vander**je**ck" or similar — review hits before doing a blind replace.

## Medium priority — SEO / structured data

### 6. GA4 / `gtag.js` is never loaded
The Web Vitals snippet on every page calls `gtag(...)` but no page actually loads `https://www.googletagmanager.com/gtag/js`. Tracking events are silently dropped. Decide: do we want analytics? If yes, add the snippet from `chrome-templates.md` and gate it on cookie consent.

### 7. `werkgebied.html` lists 12 cities in `areaServed` schema but does not link to all of them in HTML
Verify: open `werkgebied.html` and compare the `areaServed` schema array to the visible city links. Cities in schema with no HTML anchor harm crawlability and click-through. Fix: add a clearly-visible "Steden waar we werken" section that links to every city page that exists, and lists the others as plain text (Herzele, Zottegem, Geraardsbergen, Affligem, Liedekerke do not have dedicated pages today).

### 8. City pages don't cross-link to nearby cities
Verify: open `airco-aalst.html` and grep for links to other city pages. There are none. Fix: on each city page, add a "Werkgebied" or "Ook actief in" section linking to **at least 2 nearby city pages of the same service**. This is one of the highest-impact SEO fixes available because Google reads sibling links as topical clustering.

### 9. Bulk `<lastmod>2026-04-09</lastmod>` in sitemap.xml
Verify: `grep -c '2026-04-09' sitemap.xml`

Most pages have the same lastmod from a bulk regen. Fix: regenerate from real `git log` or filesystem mtimes, not from a date constant. (See potential script idea in next section.)

### 10. Breadcrumb inconsistency on blog posts
The audit flagged that some blog post breadcrumbs include `Werkgebied` between `Blog` and the article title. That's wrong — blog breadcrumbs are `Home → Blog → {title}`. Verify by reading each `blog/*.html` and fix any deviation.

### 11. Blog post `og:image` should be a unique hero image, not the global og-image.jpg
Today every page uses `https://avyclima.be/og-image.jpg`. For blog posts, an article-specific image is better for social sharing and for the `Article.image` schema field. This is an enhancement, not a fix — flag to Jurgen before doing.

### 12. Testimonials on `index.html` are placeholder
The testimonials section on the homepage states they're representative-but-not-actual. Once real Google reviews are live, replace these with actual reviewers + link to Google Business Profile. Until then, leave as-is.

## Low priority — nice-to-haves

### 13. The `Person` schema for the founder appears on `over-ons.html` but not in graph relation to `HVACBusiness`
Could improve entity linking by referencing the founder from the homepage `HVACBusiness` block via `founder` property. Optional.

### 14. No `404.html`
If a user mistypes a URL they get the host's default 404. Adding a branded `404.html` is a small polish item.

### 15. `robots.txt` allows all bots including AI scrapers
This is intentional (the site wants to be quoted by AI assistants) — but worth a periodic check that this is still desired, especially as AI bot policies evolve.

## High priority — brand identity

### 16. `theme-color` meta value is `#0066cc`, but the actual brand primary is `#0057a8`
Verify: `grep -l 'theme-color" content="#0066cc"' *.html blog/*.html portfolio/*.html`

`css/style.css` declares `--primary: #0057a8` and the logo, buttons, links all use that. The `<meta name="theme-color">` tag (which controls the mobile browser chrome / address bar) says `#0066cc` on every page that has the tag at all. Fix: bulk replace `#0066cc` → `#0057a8` in every HTML file's theme-color tag. While you're at it, add the missing tag on the 8 pages from issue #3.

### 17. `logo.png` and `logo.svg` don't exist, but JSON-LD references them on every page
Verify: `ls /sessions/cool-kind-brown/mnt/avyclima/logo.png 2>&1` and `grep '"logo": "https://avyclima.be/logo.png"' *.html | wc -l`

The `Organization`, `HVACBusiness`, and `LocalBusiness` schema blocks all reference `https://avyclima.be/logo.png`. The file doesn't exist in the repo, and presumably 404s on the live site too — Google may flag this. This blocks `images/IMAGE_REQUIREMENTS.md` P4 ("Logo (SVG + PNG)"). Until the file is produced, the schema reference is dead.

When the logo files are added, also add favicon declarations (`<link rel="icon" ...>` plus 192×192 for Apple) — they're missing from every page's `<head>`.

### 18. Hero is gradient-only — no background photography yet
Verify: `grep 'hero' index.html | head` and inspect.

The homepage hero is a CSS gradient (`linear-gradient(135deg, var(--primary), #003d75)`) with cyan/white radial glows. `IMAGE_REQUIREMENTS.md` P1 calls for "Hero background — Wide shot of a finished installation" (1920×800). When that asset arrives, the hero treatment will probably switch to image-with-gradient-overlay; until then, the gradient-only version is the canonical look.

## Things that look like issues but aren't

- **Dual usage of "airco" and "airconditioning"** — intentional, both terms get search volume in Belgian Dutch.
- **Single combined `style.css`** — the site is small, splitting wouldn't help. Don't refactor without a reason.
- **`Formsubmit.co` for contact form** — known third-party dependency. Migrate only if it breaks.
- **Single `og-image.jpg` for all pages** — acceptable globally; only blog posts would really benefit from per-page images (see #11).

## Suggested helper scripts (not yet created)

If these issues come up repeatedly, consider adding to `scripts/`:

- **`audit_chrome.py`** — diff every page's `<head>`, footer, header, cookie banner against `index.html` and report deltas.
- **`regenerate_sitemap.py`** — read every `*.html` in the repo, map to (URL, real mtime, type-based priority/changefreq), write `sitemap.xml`. This kills issue #9 permanently.
- **`fix_year.py`** — bulk-update `&copy; YYYY AVYclima` everywhere.
- **`check_seo.py`** — programmatic version of `references/seo-checklist.md`'s universal section. Run as a pre-commit / CI step.

These don't exist yet — propose them to Jurgen if a request makes one feel timely.
