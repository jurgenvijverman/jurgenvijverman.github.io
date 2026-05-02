---
name: avyclima-site-edits
description: Use this skill for any change to the avyclima.be static HTML site — bulk site-wide edits (nav, footer, cookie banner, copyright, year), SEO upkeep (titles, meta descriptions, canonical, OpenGraph, hreflang), schema.org/JSON-LD audits, sitemap.xml and llms.txt regeneration, internal linking, and structured-data fixes. Trigger this skill whenever the user mentions any avyclima page (airco.html, warmtepomp.html, onderhoud.html, any city page like airco-aalst.html, blog posts, portfolio entries), the sitemap, the llms.txt, schema.org, JSON-LD, meta tags, OG tags, or anything resembling "update the footer / nav / SEO across the site". Trigger even when the user is vague ("can you fix the SEO on this page", "the footer year is wrong", "regenerate the sitemap") — this site has 34 inlined HTML pages with no template engine, so almost every edit is a site-wide concern this skill is built to handle correctly.
---

# avyclima.be site editing

avyclima.be is a hand-coded static HTML site for a Belgian Daikin HVAC installer (airco + warmtepompen) covering the Aalst / Denderleeuw / Ninove / Dendermonde region. It has **no template engine, no build step, no SSG**: header, footer, nav, cookie banner, JSON-LD blocks and `<head>` boilerplate are **inlined per page across ~34 HTML files**. That fact drives almost every decision below.

The two workflows this skill handles:
1. **Per-page edits** — change content or SEO on a single page, while keeping it consistent with its peers (strict template-clone).
2. **Site-wide edits** — change something that lives identically on every page (footer year, nav link, cookie text, schema field, GA snippet, og:image). These require touching every file in the page set; missing a few silently rots the site.

Most user requests hide a site-wide edit inside a per-page-sounding request. Read the request twice before assuming it's a single-file change.

## Ground rules

- **Match an exemplar first, write from scratch never.** Every page type below has a canonical exemplar. Open it, mirror its `<head>`, schema blocks, breadcrumbs, header, footer, and cookie banner verbatim. Only change the page-specific content, meta values, schema content, and breadcrumb labels. Do not invent new structures unless the user explicitly asks for one.
- **Visual brand is locked.** Use the colors, typography, logo treatment, button styles, and hero gradient defined in `references/brand-identity.md`. Reference colors via the CSS custom properties (`var(--primary)`, `var(--accent)`, etc.), never bare hex codes. The logo wordmark is `AVY` in primary blue (`#0057a8`) + `clima` in cyan accent (`#00b4d8`); both header and footer logos must keep this split.
- **Dutch is Belgian Dutch with formal "u".** Never "je" or "jij". See `references/brand-voice.md`.
- **Daikin product names are exact.** `Daikin Perfera`, `Daikin Altherma 3 H HT`, `Daikin Multi NX 5MXM90N` — do not paraphrase.
- **Verify after editing.** Before declaring done, run through the per-page-type SEO checklist (`references/seo-checklist.md`). For site-wide edits, additionally `grep` across the whole site to confirm zero stragglers.
- **Treat the audit's known issues as live.** `references/known-issues.md` lists problems found in the site at the time the skill was created. If a user asks for something adjacent to a known issue, surface and fix it in the same change — don't wait to be asked twice.

## Page taxonomy and exemplars

The site has six page types. When you start any task, classify the target page first, then open its exemplar to anchor your edit.

| Page type | Pages | Canonical exemplar | Required JSON-LD |
|---|---|---|---|
| **Homepage** | `index.html` | `index.html` | HVACBusiness + Organization + LocalBusiness + Person + Review |
| **Service hub** | `airco.html`, `warmtepomp.html`, `onderhoud.html` | `airco.html` | Service + BreadcrumbList |
| **City landing** | `airco-{stad}.html`, `warmtepomp-{stad}.html`, `onderhoud-{stad}.html` | `airco-aalst.html` (airco), `warmtepomp-aalst.html` (warmtepomp) | LocalBusiness + BreadcrumbList + FAQPage |
| **Hub / index** | `werkgebied.html`, `portfolio.html`, `blog.html` | the file itself (each is unique) | varies — see file |
| **Info** | `over-ons.html`, `faq.html`, `contact.html`, `privacy.html` | the file itself | over-ons → Person; faq → FAQPage; contact → ContactPoint |
| **Blog post** | `blog/*.html` | `blog/airco-als-verwarming.html` | Article + BreadcrumbList |
| **Portfolio entry** | `portfolio/*.html` | `portfolio/airco-installatie-aalst.html` | Article + BreadcrumbList |

Service area: primary cities are **Aalst, Denderleeuw, Ninove, Dendermonde**; secondary are **Erpe-Mere, Haaltert, Lede**; extended are **Herzele, Zottegem, Geraardsbergen, Affligem, Liedekerke**. The extended set is referenced in schema and werkgebied.html but does not have dedicated city pages.

## Workflow: per-page edit (strict template-clone)

1. **Classify the page.** Map it to a row in the taxonomy table.
2. **Open the exemplar in parallel.** Read both the target page and its exemplar end-to-end. Diff them mentally — anything in the exemplar's `<head>`, footer, header, cookie banner, or generic JSON-LD scaffolding that's missing from the target is almost certainly drift to fix while you're in there.
3. **Make the content change.** Edit body content, meta `<title>`, meta description, canonical, OG/Twitter, and the JSON-LD content fields (name, areaServed, url, etc.) — but keep structure, attribute order, and field names byte-identical to the exemplar.
4. **Bump `lastmod` in `sitemap.xml`** for the page you edited. Use today's date (`YYYY-MM-DD`).
5. **Update `llms.txt` and `llms-full.txt`** if the page's title or one-line description changed, or if you added/removed a page.
6. **Run the per-page checklist** in `references/seo-checklist.md` before reporting done.

## Workflow: site-wide edit

This is the workflow for nav changes, footer edits, cookie banner copy, copyright year, og:image swaps, gtag/analytics changes, schema field additions (e.g. adding a property to LocalBusiness everywhere), and similar.

1. **Enumerate the page set.** From the repo root:
   ```bash
   find . -name '*.html' -not -path './.git/*' | sort
   ```
   Expect ~34 files: 1 home + 3 service hubs + 13 city pages + 4 info + 1 werkgebied + blog index + ~6 blog posts + portfolio index + 3 portfolio entries + 1 privacy.
2. **Find the literal you're replacing.** Use `grep -rn "<old text>" --include='*.html'` to confirm scope. If counts don't match the page set, investigate before editing — drift is the rule on this site.
3. **Apply the edit.** Prefer `Edit(replace_all=true)` per file, or a small Python script for multi-line / multi-occurrence changes. Do not write a one-shot `sed` command without showing it first — irreversible bulk edits across HTML are easy to get wrong.
4. **Re-grep to confirm zero stragglers.** Both for the new literal (count == page count) and the old literal (count == 0).
5. **Bump `lastmod`** for every touched page in `sitemap.xml`.
6. **Smoke-check three pages of different types.** Open them, read the affected region, eyeball for collateral damage.

## Workflow: SEO / structured-data audit

When the user asks for an audit or "check the SEO":

1. Pick the scope: single page, page type, or whole site.
2. For each page in scope, walk through `references/seo-checklist.md` and report a punch list of misses.
3. For schema specifically, validate the JSON-LD parses (use a quick Python `json.loads` on each block) and that the `@type` matches what the taxonomy table prescribes for that page type.
4. Cross-check `sitemap.xml`, `llms.txt`, `llms-full.txt`, and the actual file inventory — they should all agree on which pages exist.
5. Report the findings as a punch list before fixing anything. Don't bundle "I found X" with "I already fixed X" — let the user steer.

## Reference files

- **`references/seo-checklist.md`** — per-page-type checklist for `<head>`, schema, breadcrumbs, internal links, sitemap, llms.txt. Read this whenever you finish an edit.
- **`references/brand-identity.md`** — colors (with the exact CSS custom properties), typography, logo treatment, button variants, hero gradient, imagery direction. Read this for any visual change or new component, and consult before introducing any new color, font, or graphic element.
- **`references/brand-voice.md`** — Dutch tone of voice, formal "u", terminology, CTA phrasing, certificate vocabulary, things the company emphasises. Read this when writing or rewriting body copy.
- **`references/chrome-templates.md`** — verbatim header, nav, footer, cookie banner, and `<head>` boilerplate, plus the exact JSON-LD scaffolds for each schema type. Read this for any site-wide chrome edit or when adding a new page from scratch.
- **`references/known-issues.md`** — outstanding issues found in the site audit (hardcoded copyright year, missing GA4 init, werkgebied schema/HTML mismatch, breadcrumb inconsistencies, theme-color drift, missing logo files, etc.). Treat these as a live to-do list — if a user request touches one, fix it opportunistically and mention it.

## A few sharp edges to avoid

- **Don't edit only the page the user named.** If they say "the footer year is wrong on contact.html", the year is wrong on every page — fix all of them and tell them you did.
- **Don't trust `lastmod` in `sitemap.xml` as ground truth.** It was bulk-stamped on 2026-04-09 for almost everything. Use real `git log` / file timestamps when regenerating.
- **Don't paraphrase Daikin model names or certificate names.** `D1+ Installer`, `Koeltechnisch Bekwaamheidscertificaat (KVB)`, `VEA Erkenning` are exact.
- **Don't introduce client-side JS that depends on `localStorage` for new features without checking** — the cookie banner already uses it (`avyclima_cookies_accepted`); be aware of the consent state before firing tracking.
- **Don't write "je" anywhere.** If you find one, it's a bug — fix it.
- **Don't introduce a new color, font, or button variant without checking `brand-identity.md` first.** The palette is small on purpose. If a request seems to need a new color (e.g. a "premium gold accent"), push back — it's almost always solvable with the existing tokens.
- **Don't reference `logo.png` or `logo.svg` in body markup.** They don't exist yet (image-requirements P4). The header/footer logo is HTML-rendered today; use that pattern.
