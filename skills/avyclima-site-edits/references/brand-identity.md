# Brand identity — avyclima.be

This file is the source of truth for the **visual** brand: colors, typography, logo treatment, imagery, button styles, and the gradients/effects that make the site recognisably AVYclima.

`brand-voice.md` covers *what to say*. This file covers *how it should look*. Read both whenever you write a new page or a section that's visible to the user. For any site-wide visual change (palette swap, font change, logo update), this file is the one to update first — then propagate to `css/style.css`, the `theme-color` meta tag, and any inline styles.

> **Source of truth: the live avyclima.be site.** This file was re-aligned to live on **2026-05-02** by directly inspecting `https://avyclima.be/` and `https://avyclima.be/privacy-policy`. The live site is currently a 2-page GoDaddy Website Builder 8.0 deployment; the in-progress repo is a much larger hand-coded redesign (34 HTML pages with city landings, blog, portfolio). Where the in-progress repo differs from live, **live wins** — and those differences are listed in the “Drift between in-progress repo and live brand” section at the bottom so they get a deliberate decision before propagation.

## Color palette

The live brand has **two layers** that don't fully agree, and the rebuild needs to know about both:

1. **The live site's CSS** is intentionally monochromatic — white + dark gray (`#3a3a3a`) with one chromatic accent, a medium cyan (`#54d2eb`). That's all the GoDaddy-generated CSS exposes.
2. **The actual logo art** (the PNG hosted on wsimg.com, now also at `images/logo.png` in the repo) carries **three colors**: black for the wordmark, an orange triangle inside the "A", and a lighter cyan triangle inside the "Y". Sampled from the source PNG: orange `#e84521`, light cyan `#9cd7eb`, wordmark `#000000`.

The two cyans are close but **not the same** — the logo's `#9cd7eb` is lighter and softer than the live CSS's `#54d2eb`. Treat that as "two cyans coexist on the brand": the deeper one for digital UI (links, accents), the lighter one trapped inside the logo art. **Don't try to recolor the logo to match the UI cyan** — keep the logo art untouched as the source of truth.

The orange (`#e84521`) currently appears **only** inside the logo art. The live site's CSS doesn't surface it anywhere else. It's available as a bold accent if a future redesign wants a warm complement to the cyan, but introducing it elsewhere is a brand move that needs Jurgen's sign-off — don't sprinkle it casually.

Declare the values below as CSS custom properties on `:root` in `css/style.css` and **reference them through the variable, not the hex value**, in any new CSS — that way a palette change only touches one file.

### Brand colors

| Variable | Hex | Used for |
|---|---|---|
| `--accent` | `#54d2eb` | The single chromatic accent in UI: link hover/active, accent buttons, focus ring, decorative highlights. The deeper of the two cyans. |
| `--logo-cyan` | `#9cd7eb` | The lighter cyan trapped inside the logo's "Y" triangle. Reserved for the logo asset; do not use elsewhere without an approved reason. |
| `--logo-orange` | `#e84521` | The orange triangle inside the logo's "A". Logo-only today; can become a complementary warm accent if a redesign justifies it (needs sign-off). |
| `--ink` | `#3a3a3a` | Default text color, dark hero overlay tint, `theme-color` meta tag. Most "dark" elements on the site land here. |
| `--ink-soft` | `#404040` | Secondary dark text, footer body copy. |
| `--ink-muted` | `#5e5e5e` | Captions, meta info, less-prominent text. |
| `--white` | `#ffffff` | Page background, hero text on the dark photo overlay, text on dark sections. |
| `--surface-soft` | `#f7f9fa` | Alternate section background — the only "off-white" used on the live site. |

There is **no primary blue on the live site.** If a redesign needs a primary brand color beyond the cyan accent (or the warm logo orange), get explicit approval from Jurgen first — don't reintroduce a deep blue (`#0057a8`, `#003d75`) or a secondary cyan (`#00b4d8`) on the assumption that the rebuild can deviate.

### Neutral grays (proposed for the rebuild)

The live site doesn't expose a formal gray scale (it's GoDaddy-generated CSS), but the rebuild needs one. These are safe extensions of the live ink colors:

`--gray-50` `#f7f9fa` (matches live `--surface-soft`) · `--gray-100` `#f1f3f5` · `--gray-200` `#e9ecef` · `--gray-300` `#dee2e6` · `--gray-400` `#adb5bd` · `--gray-500` `#6c757d` · `--gray-600` `#5e5e5e` · `--gray-700` `#404040` · `--gray-800` `#3a3a3a`

Default body text color is `--gray-800` (`#3a3a3a`). H1/H2/H3 headings inherit the same. Captions and meta info use `--gray-600` or `--gray-500`.

### Status colors

`--success` `#28a745` · `--warning` `#f0ad4e` · `--danger` `#dc3545`

Reserved for form states (validation), success banners (`?verzonden=1`), and warning badges. Not present on the live site today, but standard Bootstrap-adjacent values. Don't use them for general decorative purposes.

### `theme-color` meta tag

The live site uses `<meta name="theme-color" content="#3A3a3a">` — a dark gray, matching the dominant ink color. Use the same on every page in the rebuild:

```html
<meta name="theme-color" content="#3a3a3a">
```

The in-progress repo currently has `#0066cc` on most pages; that value is wrong on two counts (doesn't match live, and doesn't even match the in-progress repo's own old `--primary`). Standardise to `#3a3a3a` everywhere — issue #16 in `known-issues.md` should be updated accordingly.

## Typography

- **Family:** **Montserrat** loaded from Google Fonts in weights `400, 600, 700`. Fallback stack: `'Montserrat', arial, sans-serif`.
- **Body:** Montserrat 400, 16px base, comfortable line-height (~1.5–1.7), color `--gray-800` (`#3a3a3a`), antialiased.
- **Headings:** same family, weight 700. Some accents/CTAs use `text-transform: uppercase` (live site does this on small accent labels).
- **Hero H1:** large white-on-dark-photo treatment. The live hero shows the tagline "Klimaatcomfort op maat, van advies tot installatie" centered over a dimmed photo.
- **Section headings:** typically `2rem`–`2.5rem`, `--gray-800`, weight 700.
- **Logo wordmark:** the live logo is an image (see "Logo" below), not a text wordmark — so no font-weight to declare for it.
- **Buttons:** weight 600.
- **Nav links:** weight 500–600, color `--gray-800` default, `--accent` (`#54d2eb`) on hover/active.

When adding new copy, use the existing semantic elements (`<h1>`–`<h4>`, `<p>`, `<small>`) — they pick up the right styling automatically. Don't introduce custom font-size declarations unless there's a real reason.

> **Important deviation from the in-progress repo.** The repo currently loads Inter (weights 400–800). Live is Montserrat (400/600/700). The rebuild's `css/style.css` and the Google Fonts `<link>` on every HTML page need to swap from Inter to Montserrat as part of the brand alignment — see "Drift" section.

## Logo

The logo is a **PNG image**, not an HTML wordmark. It's a stacked two-line lockup: large bold "AVY" on the top row with a small orange triangle inside the "A" and a small light-cyan triangle inside the "Y", and a thinner "CLIMA" on the bottom row. The wordmark is black on transparent. The live site's CDN reference is:

```
https://img1.wsimg.com/isteam/ip/dc0e5d37-77ce-4705-a95f-e602dcd05b0f/AVYLOGOweb_Tekengebied%201%20kopie%205.png
```

Local source files in this repo:
- `img/logo.png` — the high-res master (11708×4500 RGBA, ~440 KB). Tight content crop is roughly 1.95:1.
- `images/logo.png` — the optimised 600×231 web version (~21 KB) referenced by every page's `<a class="logo">`.
- `images/favicon-16x16.png`, `images/favicon-32x32.png`, `images/favicon-48x48.png`, `images/favicon-96x96.png`
- `images/apple-touch-icon.png` (180×180, white background per Apple convention)
- `images/icon-192.png`, `images/icon-512.png` (transparent, used by `site.webmanifest` and Organization JSON-LD)
- `favicon.ico` at site root (multi-resolution 16/32/48 with white background, for legacy browsers)

Header markup pattern (canonical exemplar):

```html
<a href="index.html" class="logo">
  <img src="images/logo.png" alt="AVYclima" width="193" height="74" loading="eager" decoding="async">
</a>
```

(From `blog/` and `portfolio/` use `../index.html` and `../images/logo.png`.) The declared `width`/`height` of 193×74 mirror the live site's CSS pixel render box; the actual file is 600×231 so the browser gets a sharp render at @3x without shipping the multi-megabyte master.

`<head>` icon block (root-absolute paths so the same snippet works from `blog/` and `portfolio/`):

```html
<!-- Favicons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

`site.webmanifest` lives at site root and points at `icon-192.png` + `icon-512.png` for Android/PWA installs.

### Rules for the logo

- **Treat the PNG as the canonical logo.** Do not substitute an HTML wordmark with `AVY` in one color and `clima` in another — that pattern (which an earlier version of this file described) is not what the brand actually is.
- **Don't recolor the logo art.** The lighter logo cyan (`#9cd7eb`) and the orange (`#e84521`) are part of the asset; leaving them as-is keeps the brand consistent across the site, marketing collateral, and the live deployment. If a redesign needs a darker cyan or no orange, that's a brand decision — get sign-off, don't quietly recolor.
- **JSON-LD `logo` URL must be `https://avyclima.be/images/logo.png`** (not the bare `/logo.png`). Schema validators will 404 the bare path — every page in this repo has been corrected.
- **An SVG version is still missing.** Production target: a transparent SVG of the same wordmark for inline use (e.g. emails, future componentry). When produced, drop it at `images/logo.svg` and consider swapping the header `<img>` to it for crispness at any size.
- **Maintain ≥10% negative space** in any new export of the logo file.

## Imagery and photography

The live site shows **one hero photo** dimmed by a dark gray overlay (`linear-gradient(to bottom, rgba(58,58,58,0.8), rgba(58,58,58,0.8))` over the JPEG), plus the logo and a few decorative crops. The aesthetic is: a single strong hero image, white sections below, no decorative illustration.

The rebuild plan is in `images/IMAGE_REQUIREMENTS.md`. Until those photos exist, **do not use random stock photos as filler** — they will look generic and dilute the local-specialist positioning the brand stands on.

When photography is added, the style guidance is:
- **Real installations only.** Daikin units actually installed in Belgian homes — no rendered or stock indoor unit images.
- **Bright, natural lighting.** No moody / dark / dramatic photography. The brand reads as professional, calm, helpful. (The live hero is dim only because of the overlay tint, not because the underlying photo is dark.)
- **Belgian rijwoning / fermette / nieuwbouw context** in any home shot — the audience needs to see installations in homes that look like theirs.
- **Daikin equipment visible and identifiable** in product shots. The Daikin specialist positioning is a core differentiator and must be visually obvious.
- **Filenames descriptive in Dutch + city** when relevant: `daikin-perfera-split-airco-aalst.webp`, not `IMG_4523.jpg`.
- **WebP with JPG fallback** ideally. Always include `width`, `height`, `alt` (descriptive Dutch), and `loading="lazy"` for below-fold.

The rebuild's `og-image.jpg` (also at `images/og-image.jpg`) is used for all social sharing. Per `IMAGE_REQUIREMENTS.md` P4, this is meant to be replaced with a branded version (1200×630). The live site reuses the hero JPEG (`E57973F9-7AD1-47AB-AE94-3D6F5EF7B984.jpeg`) as both `og:image` and `twitter:image` — the rebuild can do better with a purpose-built 1200×630.

## Buttons

The live site is GoDaddy-generated and exposes several button shapes (border-radius mix of 4px, 7px, 12px, 48px). For the rebuild, normalise to a small set with consistent tokens:

| Class | Background | Text | Hover | Use when |
|---|---|---|---|---|
| `.btn .btn--primary` | `--ink` (#3a3a3a) | white | darker ink | Default CTA — "Vrijblijvende offerte", "Plan plaatsbezoek". The site's main solid button. |
| `.btn .btn--accent` | `--accent` (#54d2eb) | `--ink` | darker accent | Secondary highlight CTA — used sparingly to bring the brand cyan into the page. |
| `.btn .btn--outline` | transparent | inherit | (per-variant) | Tertiary action; sits on a colored or photographic background where a filled button would be too heavy. |

Modifiers: `.btn--sm` for compact (e.g. cookie banner buttons), `.btn--lg` for hero CTAs, `.btn--white` for use on dark / hero backgrounds.

Buttons always have `font-weight: 600`, `border-radius: 12px` (`var(--border-radius)` — chosen to match the live site's most-used radius), and `transition: all 0.3s ease`. Don't recreate them from scratch — extend with modifiers if you need a new variant.

## Hero / page-top treatment

The live hero is a **photo with a dark gray overlay**, not a blue gradient. The pattern:

```css
.hero {
  padding: 8rem 0 5rem;
  position: relative;
  overflow: hidden;
  color: var(--white);
  background-image:
    linear-gradient(rgba(58, 58, 58, 0.8), rgba(58, 58, 58, 0.8)),
    url("../images/hero.jpg");
  background-size: cover;
  background-position: center;
}
```

The hero copy is white, centered, with the tagline "Klimaatcomfort op maat, van advies tot installatie" as the primary line and a subline like "Gespecialiseerd in Daikin airco & warmtepompen voor particulieren en KMO's".

**Do not invent new hero gradients.** The earlier version of this file described a diagonal blue gradient with cyan/white radial overlays — that pattern is from the in-progress repo, **not** from the live brand. If a sub-page needs a different feel, swap the hero photo, not the treatment.

## Layout tokens

| Token | Value | Notes |
|---|---|---|
| `--container-width` | `1200px` | Maximum content width for the rebuild. `.container` centers and applies `0 1.5rem` side padding. (Live is GoDaddy-generated and uses its own grid; this is a rebuild-side decision.) |
| `--section-padding` | `5rem 0` | Default top/bottom padding for `<section>` blocks. |
| `--border-radius` | `12px` | Default radius for buttons, cards, inputs — matches the dominant live radius. |
| `--border-radius-lg` | `16px` | Used on larger cards and the hero CTA box. |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Header on scroll. |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Card / button hover. |
| `--shadow-lg` | `0 8px 30px rgba(0,0,0,0.12)` | Modal / featured card. |
| `--transition` | `all 0.3s ease` | Universal default. |

Header is fixed at top, height `72px`, white at 97% with backdrop-blur — it floats over content. The first section on every page must allow for that 72px overlap (the hero handles it with `padding: 8rem 0 5rem`; other sections can use a `padding-top` of `7rem` or rely on `<section>` offset rules).

## Section backgrounds

The site alternates between `--white` and `--surface-soft` (`#f7f9fa`) for adjacent sections. Use `<section class="section--soft">` to flag the off-white variant. Never use a hard color block — keep value contrast subtle so the page reads as one continuous brand experience.

## Form styling

Form inputs (in `contact.html`):
- Border: `1px solid var(--gray-300)`
- Focus: outline replaced by `border-color: var(--accent)` + a soft `box-shadow: 0 0 0 3px rgba(84, 210, 235, 0.18)`
- Border-radius: `12px`
- Padding: matches button padding for visual rhythm

Form errors use `--danger` for both border and message text. Form success uses `--success`.

The live form labels are: Naam · Email* · Tel. Nummer · Adres (optioneel) · Bestanden toevoegen / Bijlagen (0). Submit label: **Verstuur**. The form uses Google reCAPTCHA — if the rebuild keeps that dependency, add the reCAPTCHA legalese ("Deze site wordt beschermd via reCAPTCHA…") below the submit button verbatim, matching the live copy.

## Cookie banner

Visual placement: fixed at bottom, full width, white background with `--shadow-lg`. The Accept button is `.btn--primary` (dark ink filled), the Reject button is `.btn` with no fill (outline-style). The cookie banner shouldn't compete with the hero for attention — keep the copy short and the buttons compact (`.btn--sm`).

Live copy:
- **Body:** "Deze website maakt gebruik van cookies. We gebruiken cookies om websiteverkeer te analyseren en de ervaring op je website te optimaliseren. Als je het gebruik van cookies accepteert, worden je gegevens gecombineerd met de gegevens van alle andere gebruikers."
- **Buttons:** **Afwijzen** / **Accepteren**

⚠️ The live cookie body uses informal "je" twice ("je website", "Als je het gebruik…"). This contradicts the brand-voice "always-u" rule. Treat the live copy as a bug to fix in the rebuild — switch to "uw website" / "Als u het gebruik…" — and flag it to Jurgen so the live site can be updated to match. Do not propagate the "je" version into the rebuild just because it's on live.

## Quick verification — does a page match?

When you finish a visual edit, eyeball these:

- [ ] Logo is the AVYLOGO PNG (header + footer + favicons + apple-touch), not an HTML wordmark.
- [ ] Primary CTAs use `.btn--primary` (dark `#3a3a3a` filled), accent moments use `.btn--accent` (`#54d2eb`).
- [ ] Headings on white sections are `--gray-800` (`#3a3a3a`), body is the same.
- [ ] Headings on the dark hero overlay are white.
- [ ] Active nav link uses `--accent` (`#54d2eb`) — no `--primary-light` blue tint anywhere.
- [ ] No bare hex codes in newly-written CSS — only CSS variables.
- [ ] `theme-color` meta on the page reads `#3a3a3a` (not `#0066cc`, not `#0057a8`).
- [ ] Typography is Montserrat (400/600/700), not Inter.

## Drift between in-progress repo and live brand

This table tracked deliberate divergences between the rebuild and the live brand at the time `brand-identity.md` was first written (2026-05-02). After Phases 1–4 of `IMPLEMENTATION_PLAN.md`, every drift item has been resolved. Kept here as a closed-issue log.

| # | Drift | Status | Resolution |
|---|---|---|---|
| 1 | Inter typeface | ✅ resolved | Swapped to Montserrat (400/600/700) on all 36 HTML pages + `css/style.css`. Enforced by `scripts/site_qa.py` (font check via Google Fonts link). |
| 2 | Deep blue palette (`#0057a8`/`#003d75`/`#00b4d8`/`#e8f1fa`) | ✅ resolved | `:root` tokens redefined: `--primary: #3a3a3a`, `--accent: #54d2eb`, `--primary-light: #f7f9fa`. The ~120 CSS rules that referenced the old tokens now pick up the new values automatically. Hard-coded blues removed. |
| 3 | HTML wordmark `AVY`+`<span>clima</span>` | ✅ resolved | Replaced with `<img src="images/logo.png" ...>` site-wide. `images/logo.png` is the optimised 600×231 web version; `img/logo.png` is the 11708×4500 master. Three logo colors now documented in this file: black wordmark, orange triangle (`#e84521`), light cyan triangle (`#9cd7eb`). |
| 4 | `theme-color` mismatch | ✅ resolved | All 36 pages now `<meta name="theme-color" content="#3a3a3a">`. QA gate enforces this. |
| 5 | Diagonal blue-gradient hero | ✅ resolved | Replaced with photo + `rgba(58,58,58,0.8)` overlay pattern. Default photo: `images/hero.jpg` (Daikin rooftop unit). Per-page override: `body.hero-over-ons` swaps to `images/hero-over-ons.jpg`. |
| 6 | Cookie banner "je" wording | ✅ resolved (rebuild side) | All rebuild pages use formal "u" in the cookie banner. The live GoDaddy site still has "je" — Jurgen's call whether to update live too. |
| 7 | Scope mismatch (live 2 pages vs rebuild 34) | ✅ resolved by clear documentation | The rebuild is now 36 pages (added 3 Denderleeuw + already had Aalst-area + blog/portfolio). All in `sitemap.xml`, `llms.txt`, and `llms-full.txt`. The rebuild is the future-state site; the live GoDaddy is the legacy. |

The brand alignment work is **complete**. Open items for the rebuild are tracked in `known-issues.md`, not here.

## What to do if the live site changes again

If Jurgen confirms the live avyclima.be site has shifted (palette swap, font change, logo update, hero rework) since this file's snapshot date:

1. Re-run a live capture: `curl -sL https://avyclima.be/ | grep -E 'theme-color|font-family|#[0-9a-fA-F]{6}'` and inspect the result.
2. Update this file with the new live values first (don't propagate before agreeing).
3. Update `css/style.css` `:root` block to match.
4. Update every `theme-color` meta tag (currently 26+ HTML files in the rebuild).
5. If the logo art changed, update `logo.png` / `logo.svg` and re-export favicons.
6. Smoke-check the homepage, a service hub, a city page, and a blog post.
7. Bump the snapshot date at the top of this file.
