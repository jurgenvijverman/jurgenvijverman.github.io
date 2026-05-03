# Known issues — outstanding things to fix

This is a live to-do list. When a user request is adjacent to one of these, fix it in the same change and tick the item off. When new drift is discovered, add it here.

> **Status legend:** ✅ resolved · ⏳ in progress · ⚠️ open · 📋 backlog
>
> Last reconciled with the actual repo state on **2026-05-03** after Phase 4 of `IMPLEMENTATION_PLAN.md` was completed.

---

## ✅ Resolved (Phases 1–4 of the implementation plan)

These are the audit items closed by the work since 2026-05-02. They're kept here as a closed-issue log so future audits don't re-discover them.

### ✅ 1. Footer copyright `© 2024` on most pages
**Status:** still open — the footer year is still `2024` site-wide. Bulk replace remains a Phase 4.x cleanup. (Not closed by Phase 1–4.) **DEMOTED** to ⚠️ open below.

### ✅ 2. "Werkgebied" link missing from footer of multiple pages
**Status:** Phase 2.4 footer overhaul aligned all 32 canonical-chrome pages to the same footer; the four drifted blog posts still have non-canonical chrome and remain open under #19 below.

### ✅ 3. `theme-color` meta missing on 8 pages
**Resolved Phase 1.3 (favicon block insertion) + earlier brand-alignment.** All 36 pages now have `<meta name="theme-color" content="#3a3a3a">`. QA gate enforces this.

### ✅ 4. `og:image` missing on 7 pages
**Resolved Phase 2 + 3 sweeps.** Verified by spot-check; QA gate doesn't enforce yet but passes when sampled.

### ✅ 5. Informal "je / jij / jouw" on 5 pages
**Resolved Phase 1.1 + 3.3b + 4.1 cleanup pass.** All city pages and service hubs now use formal "u". Single remaining offender: `blog/airco-als-verwarming.html` (entire post in informal voice — waivered in `scripts/site_qa.py` until full rewrite). See ⚠️ #19 below.

### ✅ 9. Bulk `lastmod` in sitemap.xml
**Resolved Phases 1.5 / 2.6 / 3.6 / 4.x.** Sitemap now stamped 2026-05-03 across all 36 entries. **A regenerator script is still desirable** to prevent re-drift — see "Suggested helper scripts" below (the QA script's sitemap-drift check covers presence, not freshness of timestamps).

### ✅ 10. Breadcrumb inconsistency on blog posts
**Resolved.** The `Werkgebied` interleaving in some breadcrumbs was cleaned up during the Denderleeuw page work; remaining drift was contained to the four non-canonical blog posts (see #19).

### ✅ 12. Testimonials on `index.html` were placeholder
**Resolved Phase 1.3.** Review JSON-LD removed; visible testimonial section deleted; replaced with the "Waarom AVYclima" 4-card trust block. Reintroduce only when real Google Reviews are live.

### ✅ 16. `theme-color` value `#0066cc` ≠ brand primary
**Resolved by brand alignment.** All 36 pages now `#3a3a3a` (the live-site theme color, not the old `#0057a8` deep blue — see `brand-identity.md` for the rationale). QA gate enforces this.

### ✅ 17. `logo.png` / favicons missing
**Resolved by favicon-set work.** Local files: `images/logo.png` (600×231), `favicon.ico` (multi-res), `images/favicon-{16,32,48,96}x{...}.png`, `images/apple-touch-icon.png` (180), `images/icon-{192,512}.png`, `site.webmanifest`. JSON-LD `logo` references all corrected to `https://avyclima.be/images/logo.png`.

### ✅ 18. Hero is gradient-only — no photo
**Resolved.** `images/hero.jpg` (Daikin rooftop unit, Pic003-cropped) is the default hero. `images/hero-over-ons.jpg` (van+building, Pic005) overrides on `over-ons.html` via the `body.hero-over-ons` selector. The CSS pattern is photo + `rgba(58,58,58,0.8)` overlay, matching live brand.

---

## ⚠️ Open issues

### ⚠️ 1. Footer copyright is hardcoded `© 2024` site-wide
Verify: `grep -lE '© 2024|&copy; 2024' *.html blog/*.html portfolio/*.html | wc -l`

Fix: bulk replace `&copy; 2024 AVYclima` → `&copy; 2026 AVYclima`. Better fix: switch to JS-injected year so this never recurs (`document.querySelector('.footer-year').textContent = new Date().getFullYear()`).

### ⚠️ 6. GA4 / `gtag.js` is never loaded
The Web Vitals snippet on every page calls `gtag(...)` but no page actually loads `https://www.googletagmanager.com/gtag/js`. Tracking events are silently dropped. **Phase 5 decision:** GA4 vs Plausible (per IMPLEMENTATION_PLAN). Plausible is the recommendation in the open-decisions section of the plan.

### ⚠️ 7. `werkgebied.html` `areaServed` schema array has more cities than visible HTML
Verify: open `werkgebied.html`, compare the JSON-LD `areaServed` to the visible city cards.

The schema lists Dendermonde, Haaltert, Erpe-Mere, Lede, Herzele, Geraardsbergen, Zottegem, Affligem, Liedekerke. The visible body now lists everything in tiered cards — but verify the schema and the visible content stay in sync going forward.

### ⚠️ 8. City pages don't cross-link to nearby cities
Each city page should have a "Ook actief in" section linking to **at least 2 nearby city pages of the same service**. Today most city pages don't. High-impact SEO win — Google reads sibling links as topical clustering.

### ⚠️ 11. Blog post `og:image` is generic
Today every blog post uses `https://avyclima.be/og-image.jpg`. For blog posts, an article-specific image would help social sharing and the `Article.image` schema field. Enhancement, not a fix.

### ⚠️ 19. Four blog posts still have non-canonical chrome + content debt
`blog/onderhoud-airco-wanneer.html`, `blog/prijs-airco-installatie.html`, `blog/split-vs-multisplit.html`, `blog/warmtepomp-renovatie.html` use a different header/footer template (`<nav class="navbar">` instead of the canonical `<header class="header">`, etc.). The Phase 2 footer-copy update missed these. Fix: rewrite each to match the canonical exemplar in `chrome-templates.md`.

Additionally, `blog/airco-als-verwarming.html` is **content debt** — written entirely in informal "je"/"jouw" voice (48 instances). Currently waivered in `scripts/site_qa.py` (`INFORMAL_PRONOUN_WAIVERS`). Full rewrite needed; clear the waiver entry once done.

### ⚠️ 20. `Person` schema for the founder isn't graph-linked to `HVACBusiness`
Could improve entity linking by referencing the founder from the homepage `HVACBusiness` block via `founder` property. Optional polish.

---

## 📋 Backlog

### 📋 14. No `404.html`
If a user mistypes a URL they get the host's default 404. Adding a branded `404.html` is small polish.

### 📋 15. `robots.txt` allows all bots including AI scrapers
Intentional today (the site wants to be quoted by AI assistants). Periodic check that this is still desired as AI bot policies evolve.

---

## Things that look like issues but aren't

- **Dual usage of "airco" and "airconditioning"** — intentional, both terms get search volume in Belgian Dutch.
- **Single combined `style.css`** — the site is small, splitting wouldn't help.
- **`Formsubmit.co` for contact form** — known third-party dependency.
- **WebP files in `images/installations/` are larger than the source JPEGs** — source JPEGs were already heavily compressed, so WebP at quality 82 doesn't always shrink. Acceptable; the WebP versions are the canonical web-ready files with descriptive names.

---

## ✅ Helper scripts (now exist)

### `scripts/site_qa.py` — site-wide QA validator
Created in Phase 4.6. Runs 13 checks: typo blacklist, risky-claim blacklist, informal pronouns, single-H1, title/meta description, theme-color, canonicals, broken links, anchor targets, JSON-LD validity, sitemap drift, image alt-text, favicon block.

Wired to GitHub Actions in `.github/workflows/site-qa.yml` — runs on every push and PR.

Run locally: `python3 scripts/site_qa.py` from repo root. Exit 0 = all green.

## Suggested helper scripts (still TODO)

- **`audit_chrome.py`** — diff every page's `<head>`, footer, header, cookie banner against `index.html` and report deltas. Would catch issue #19 automatically.
- **`regenerate_sitemap.py`** — read every `*.html` in the repo, map to (URL, real mtime from `git log`, type-based priority/changefreq), write `sitemap.xml`. Kills the manual `lastmod` bumping forever.
- **`fix_year.py`** — bulk-update `&copy; YYYY AVYclima` everywhere. Trivial, but worth automating to remove drift between New Year and the next manual edit.

Propose to Jurgen if a request makes any of these timely.
