# SEO checklist for avyclima.be

Use this whenever you finish editing a page, before reporting done. The checklist is split by page type because the requirements diverge — a city page needs `LocalBusiness + FAQPage`, a blog post needs `Article`, etc.

For any check that fails, fix it inline rather than reporting "I noticed X is missing" — the user already knows the page needs SEO work, that's why they asked.

## Universal checks (every page)

These apply to **every** HTML file in the repo, regardless of type.

### `<head>` boilerplate
- [ ] `<meta charset="UTF-8">`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] `<meta name="theme-color" content="#0057a8">` — must match `--primary` from `css/style.css`. Many pages currently say `#0066cc` (drift); fix to `#0057a8` whenever you touch a page. See `references/brand-identity.md`.
- [ ] Apple mobile capable meta tags present
- [ ] Google Fonts preconnect + Inter preload (weights 400/500/600/700/800)
- [ ] `<link rel="stylesheet" href="css/style.css">` (or `../css/style.css` for blog/portfolio subdirectory pages)
- [ ] `<script src="js/main.js" defer></script>` at end of body (or `../js/main.js`)

### SEO meta
- [ ] `<title>` — 50–70 chars, ends with `– AVYclima`
- [ ] `<meta name="description">` — 140–160 chars, mentions the service AND a location signal AND a CTA hook (gratis offerte / advies / plaatsbezoek)
- [ ] `<meta name="keywords">` — present (legacy, but the site uses it consistently)
- [ ] `<link rel="canonical" href="https://avyclima.be/...">` — absolute, matches the actual page
- [ ] `<link rel="alternate" hreflang="nl-BE" href="...">` — same URL as canonical
- [ ] `<link rel="alternate" hreflang="x-default" href="...">` — same URL as canonical
- [ ] Open Graph: `og:type`, `og:url`, `og:title`, `og:description`, `og:image` (https://avyclima.be/og-image.jpg), `og:site_name`, `og:locale` (nl_BE)
- [ ] Twitter card: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`

### Title and description copy patterns
- City landing: `{Service} plaatsen in {Stad} | Daikin {variant} – AVYclima`
- Service hub: `{Service} plaatsen & onderhouden in Aalst | Daikin {variant} – AVYclima`
- Blog post: `{Article title} | AVYclima blog`
- Portfolio entry: `{Project title} – Realisatie | AVYclima`

### Shared chrome
- [ ] Skip-to-content link as first child of `<body>`: `<a href="#main-content" class="skip-to-content">Naar hoofdinhoud</a>`
- [ ] `<main id="main-content">` wraps the page content
- [ ] Header markup matches `references/chrome-templates.md` exactly (including all 9 nav items in order)
- [ ] Footer markup matches `references/chrome-templates.md` exactly
- [ ] Cookie banner present and matches the canonical snippet
- [ ] Web Vitals script present (with-attribution import from unpkg)
- [ ] Footer copyright year is the **current calendar year** (verify with `date +%Y`, not the bulk-stamped 2024)

## Service hub (`airco.html`, `warmtepomp.html`, `onderhoud.html`)

In addition to universal:

- [ ] JSON-LD blocks: **Service** + **BreadcrumbList**
- [ ] Service `provider` is `HVACBusiness` with full nested address/geo/contact (do not flatten to a string)
- [ ] Service `areaServed` is an **array** with all primary + secondary cities
- [ ] BreadcrumbList: 2 levels — Home → {Service}
- [ ] Page links to `werkgebied.html` and `contact.html` from the body, not just from the footer
- [ ] CTA buttons point to `contact.html` (not `mailto:` or `tel:` directly — those are for the footer)

## City landing (`airco-{stad}.html`, `warmtepomp-{stad}.html`, `onderhoud-{stad}.html`)

In addition to universal:

- [ ] JSON-LD blocks: **LocalBusiness** + **BreadcrumbList** + **FAQPage**
- [ ] LocalBusiness `name` is `AVYclima - {Service} {Stad}` (not just `AVYclima`)
- [ ] LocalBusiness `areaServed` is the single city (not the full list)
- [ ] LocalBusiness `url` matches the page URL (canonical)
- [ ] BreadcrumbList: 3 levels — Home → {Service hub} → {Stad}
- [ ] FAQPage has at least 4 Q&A pairs, each tied to the city (e.g. "Wat kost een airco-installatie in {Stad}?")
- [ ] Body mentions the city by name in the H1, the lead paragraph, at least one H2, and the FAQ section
- [ ] Includes a "Klaar om te starten?" CTA section with phone + offerte link
- [ ] Title and description follow the city-page format above

### City-page cross-linking
This is missing site-wide today (see `known-issues.md`). When editing a city page, add at minimum:
- A "Werkgebied" section linking back to `werkgebied.html`
- Sibling links to the same service in **2 nearby cities** (e.g. airco-aalst.html should link to airco-ninove.html and airco-dendermonde.html)

## Blog post (`blog/*.html`)

In addition to universal (note the `../` prefix on stylesheet/script paths):

- [ ] JSON-LD blocks: **Article** + **BreadcrumbList**
- [ ] Article: `headline` matches `<title>` minus the ` | AVYclima blog` suffix
- [ ] Article: `datePublished` and `dateModified` are valid ISO dates; `dateModified` ≥ `datePublished`
- [ ] Article: `author` is `Organization` with name `AVYclima`
- [ ] Article: `publisher` is `Organization` with `logo` ImageObject
- [ ] Article: `mainEntityOfPage` matches the canonical URL
- [ ] BreadcrumbList: 3 levels — Home → Blog → {Article title}
- [ ] Article body has at least one internal link to a service hub or city page
- [ ] Article body has a closing CTA section linking to `../contact.html`

## Portfolio entry (`portfolio/*.html`)

Same as blog posts, plus:
- [ ] Article body references the specific Daikin model installed (exact name)
- [ ] BreadcrumbList: Home → Realisaties → {Project title}
- [ ] Page links back to the relevant service hub and (if there is one) the matching city page

## Info pages

- **`over-ons.html`** — must include Person schema for the founder; mention the certificates (D1+, KVB, VEA) by exact name.
- **`faq.html`** — single FAQPage block covering all Q&A on the page; each `<details>` element in the HTML should map 1:1 to a `Question` in the schema.
- **`contact.html`** — ContactPoint schema; form action points to Formsubmit.co; success state triggers on `?verzonden=1`.
- **`privacy.html`** — sitemap priority is 0.3, changefreq yearly. No special schema.

## Sitemap (`sitemap.xml`)

After any edit:
- [ ] The edited page's `<lastmod>` is updated to today (`YYYY-MM-DD`)
- [ ] No URLs in the sitemap are missing from the file system
- [ ] No HTML files exist that aren't in the sitemap (except `404.html` if it exists)
- [ ] Priority hierarchy is intact: home 1.0; service hubs 0.9; werkgebied 0.8; city pages 0.7; blog index 0.7; blog posts 0.6; portfolio index 0.7; portfolio entries 0.6; info pages 0.5–0.7; privacy 0.3
- [ ] `changefreq`: home weekly; blog weekly; everything else monthly except privacy (yearly)

## llms.txt and llms-full.txt

- [ ] Page inventory matches `sitemap.xml` and the file system
- [ ] Section order: Diensten → Realisaties → Informatie → Werkgebied → Stadspagina's (Airco) → Stadspagina's (Warmtepompen) → Onderhoud per regio → Blog Artikelen → Contact
- [ ] Each link is fully qualified (`https://avyclima.be/...`), not relative
- [ ] llms-full.txt mirrors llms.txt but with one-paragraph descriptions of each service and section

## Quick site-wide audit (Bash)

Run from the repo root for a fast sanity sweep:

```bash
# Pages without canonical
grep -L 'rel="canonical"' *.html blog/*.html portfolio/*.html

# Pages without OG image
grep -L 'og:image' *.html blog/*.html portfolio/*.html

# Pages still claiming © 2024
grep -l '© 2024\|&copy; 2024' *.html blog/*.html portfolio/*.html

# Pages using "je" instead of "u"
grep -nE '\bje\b|\bjij\b|\bjouw\b' *.html blog/*.html portfolio/*.html

# Inventory drift between sitemap and filesystem
diff <(grep -oE 'https://avyclima\.be/[^<]*\.html' sitemap.xml | sed 's|https://avyclima.be/||' | sort) \
     <(find . -name '*.html' -not -path './.git/*' | sed 's|^\./||' | sort)
```
