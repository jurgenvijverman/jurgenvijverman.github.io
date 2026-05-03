# Implementation Plan — Site Review Response

Detailed, file-mapped plan to implement the site review proposals on avyclima.be (the in-progress hand-coded rebuild, 33 HTML pages).

**Plan author / scope:** built from the site review delivered 2026-05-02, anchored to the actual repo state on the same date. Decisions surfaced in the review have been resolved upfront (see "Anchoring decisions" below); the rest of the plan is execution.

---

## Anchoring decisions (already resolved)

| Decision | Choice | Rationale |
|---|---|---|
| Maintainability path | **Stay pure HTML + add QA scripts** | No framework migration. Existing convention is preserved; tooling absorbs the per-page-duplication risk. |
| Secondary city pages | **Tier them, keep them all** | Aalst / Denderleeuw / Ninove become the primary commercial focus; existing Dendermonde / Lede / Erpe-Mere / Haaltert pages stay live and remain in the sitemap. **Three new Denderleeuw pages are added** to bring it level. |
| Plan language | English | Matches the source review. |
| Brand alignment | **Already shipped** (commit ready) | Palette → live monochrome ink + cyan; Inter → Montserrat; logo PNG; favicons; theme-color; sitemap lastmod. Out of scope here. |

---

## Verified findings (anchoring the plan in repo reality)

Spot-checked against the actual repo on 2026-05-02 — every plan task below references one of these as its trigger:

| Claim from review | Repo state | Action |
|---|---|---|
| Typo "komfort" | Confirmed: 2 files | Fix in Phase 1 |
| "Laat ons u adviseert" | Confirmed: 1 file (`index.html`) | Fix in Phase 1 |
| "warmtepomp systemen" (should be one word) | Confirmed: 2 files | Fix in Phase 1 |
| "vrijblijvende advies" / "Onze werkgebied" / "uitgebreeid" | Confirmed: each 1 file (`contact.html`) | Fix in Phase 1 |
| "geluiddoos" / "slegers" / "huidiige" | Confirmed: each 1 file (`warmtepomp.html`) | Fix in Phase 1 |
| "elektrarisch" / "stille bedrijving" | Confirmed: each 1 file (`airco.html`) | Fix in Phase 1 |
| "geextraheerd" / "daglijkse" | Confirmed: each 1 file | Fix in Phase 1 |
| "budget-bewuste" | **Not present** in current repo | No action — proposal claim is stale or was already fixed |
| Denderleeuw city pages missing | Confirmed: zero `*denderleeuw*.html` files exist | Phase 2 creates 3 |
| Review JSON-LD on homepage | Confirmed: `index.html` only (1 page) | Phase 1 removes |
| `meta keywords` everywhere | Confirmed: 29 of 33 pages | Phase 4 strips |
| `airco.html` sidebar links to non-existent IDs | Confirmed: `#voor-wie`, `#types`, `#verwarming`, `#prijs`, `#werkwijze`, `#werkgebied` all referenced, none exist on the page (only `#main-content`) | Phase 1 adds IDs |
| `werkgebied.html` says "volledige Denderstreek" | Confirmed in `<meta description>` and OG | Phase 2 retiers |
| Every page has exactly one H1 | **Already true** | No action — proposal's QA item already passes |

---

## Conventions used by this plan

- **Effort** is rough developer time for a focused engineer using the existing `avyclima-site-edits` skill. Plan padding is not included.
- **Exit criteria** are testable — every phase has a "done when..." line. Don't move to the next phase until met.
- **Skill anchors** — almost every task here belongs in the `avyclima-site-edits` skill's site-wide-edit workflow. Use the skill's exemplar-clone pattern (see `skills/avyclima-site-edits/SKILL.md`) for any new page.
- **`known-issues.md`** in the skill should be updated as items here are completed; it's the single tracking surface for follow-on work.

---

## Phase 1 — Credibility cleanup (1–2 days)

**Goal:** Remove the most damaging credibility issues — typos, broken anchors, risky review schema, and the "Laat ons u adviseert" type AI-tells. After this phase, the site reads as professional even before deeper rewrites.

### 1.1 Editorial pass — typos, awkward phrasing (4–6 hours)

Pure search-and-replace on the verified typos. Single dev with the skill's site-wide-edit workflow.

| File | Find | Replace |
|---|---|---|
| `index.html` | `Laat ons u adviseert` | `Laat ons u adviseren tijdens een vrijblijvend plaatsbezoek` |
| `index.html` | `installatie en onderhoud` (where contextually wrong) | `installatie en het onderhoud` |
| `index.html`, `warmtepomp.html` | `warmtepomp systemen` | `warmtepompsystemen` |
| `index.html` and others | `komfort` | `comfort` |
| `contact.html` | `vrijblijvende advies` | `vrijblijvend advies` |
| `contact.html` | `Onze werkgebied` | `Ons werkgebied` |
| `contact.html` | `uitgebreeid` | `uitgebreid` |
| `warmtepomp.html` | `geluiddoos` | `bijna geruisloos` |
| `warmtepomp.html` | `slegers` | `slapers` |
| `warmtepomp.html` | `huidiige` | `huidige` |
| `airco.html` | `elektrarisch` | `elektrisch` |
| `airco.html` | `stille bedrijving` | `stille werking` |
| `warmtepomp.html` | `geextraheerd` | `onttrokken` |
| `warmtepomp.html` | `daglijkse` | `dagelijkse` |
| `warmtepomp.html` | `Mochten we niet in uw onmiddellijke omgeving zitting hebben, informeer dan – we gaan graag uit elkaar gaat praten over mogelijkheden.` | `Woont u net buiten ons werkgebied? Neem gerust contact op. We bekijken graag of we u kunnen helpen.` |

**Verification:** `grep -rE 'komfort\|adviseert\|geluiddoos\|...'` returns zero matches across all 33 HTML files.

### 1.2 Add anchor IDs to airco.html (15 min)

Add `id="voor-wie"`, `id="types"`, `id="verwarming"`, `id="prijs"`, `id="werkwijze"`, `id="werkgebied"` to the matching `<h2>` elements so the existing sidebar nav actually works.

**Verification:** `grep -oE 'id="..."' airco.html` lists all six IDs; manually click each sidebar link in a browser and confirm scroll target.

### 1.3 Remove Review JSON-LD AND testimonial section from index.html, replace with trust block (2 hours)

Per the locked decision (testimonials are not real, so remove entirely):

1. Delete the `Review` + `Rating` JSON-LD blocks in `index.html` (per Google's review-snippet policy: business-controlled testimonials are not eligible for review rich results).
2. **Delete the visible `<section>` containing the testimonial cards** in `index.html`.
3. **Add the "Waarom AVYclima" trust block in its place** (4 cards — pulled forward from Phase 5.2 to avoid leaving the homepage with an empty gap):
   - Hoogopgeleide HVAC-experts
   - Correcte dimensionering
   - Perfecte afwerking
   - Stipte opvolging en nazorg

   Each card: brief 1-line title + 2–3 sentence description + a small icon (use lucide-style stroke icons via inline SVG, tinted `var(--accent)` cyan).

**Verification:** Google Rich Results Test on `index.html` shows no Review/Rating warnings; the homepage scrolls cleanly through the new trust block where the testimonials used to be; remaining schema (HVACBusiness, Organization, LocalBusiness, Person) all parse clean.

### 1.4 Soften unsupported claims across all pages (3–4 hours)

Every page mentioning savings %, subsidy %, COP figures, or "geluiddoos"/"praktisch geruisloos" needs a conditional rewrite. The pattern:

> ❌ "Bespaar 40-50% op verwarmingskosten."  
> ✅ "Afhankelijk van uw woning, isolatiegraad en huidig verwarmingssysteem kan een warmtepomp uw energieverbruik aanzienlijk verlagen. Tijdens het plaatsbezoek bekijken we wat realistisch is voor uw situatie."

> ❌ "De Vlaamse regering stimuleert het gebruik van warmtepompen actief met diverse subsidies."  
> ✅ "Voor warmtepompen kunnen in Vlaanderen premies of steunmaatregelen van toepassing zijn. De voorwaarden wijzigen regelmatig; we bekijken graag samen welke mogelijkheden op uw situatie van toepassing zijn."

**Files known to need this pass:** `warmtepomp.html`, `index.html`, `warmtepomp-aalst.html`, `warmtepomp-ninove.html`, `warmtepomp-haaltert.html`, `warmtepomp-erpe-mere.html`, `blog/premies-warmtepompen-vlaanderen.html`, `blog/warmtepomp-renovatie.html`, `airco.html`, `airco-ninove.html`. Do an explicit grep pass for `\d+\s*%`, `bespaar`, `gehalveerd`, `praktisch geruisloos`, `tot drie keer`, `Mijn Verbouwpremie 40` to find every occurrence.

**Verification:** A sampled paragraph from each touched page reads conditionally; no claim is asserted as a guarantee without context.

### 1.5 Update sitemap.xml lastmod for touched files (5 min)

Bump `lastmod` to today's date for every file touched in 1.1–1.4.

### Phase 1 exit criteria

- [ ] Zero typos from the verified list survive any grep
- [ ] All six airco.html sidebar links scroll to the right section
- [ ] Google Rich Results Test on `index.html` shows no Review-related warnings
- [ ] Sample read-through of `warmtepomp.html`, `warmtepomp-aalst.html`, `index.html` by Jurgen — no "AI-generated" feeling sentences flagged
- [ ] `sitemap.xml` lastmod reflects today for every touched file

---

## Phase 2 — Local SEO repositioning (2–4 days)

**Goal:** Recenter the site on Aalst / Denderleeuw / Ninove as the primary commercial focus while keeping the secondary city pages live.

### 2.1 Create three new Denderleeuw city pages (1 day)

Use the existing exemplars in the `avyclima-site-edits` skill — `airco-aalst.html`, `warmtepomp-aalst.html`, `onderhoud-aalst.html` — as strict template clones. The skill's per-page-edit workflow is built for exactly this.

| New file | Exemplar | Required JSON-LD |
|---|---|---|
| `airco-denderleeuw.html` | `airco-aalst.html` | LocalBusiness + BreadcrumbList + FAQPage |
| `warmtepomp-denderleeuw.html` | `warmtepomp-aalst.html` | LocalBusiness + BreadcrumbList + FAQPage |
| `onderhoud-denderleeuw.html` | `onderhoud-aalst.html` | LocalBusiness + BreadcrumbList + FAQPage |

**Content rules** for each page (avoid SEO-doorway flagging):

- Open with a **specific Denderleeuw observation** — postcode 9470, the location of the AVYclima HQ ("AVYclima BV, Denderleeuw, 9472"), the deelgemeenten (Iddergem, Welle, Wieze, etc.), housing mix (rijwoningen, halfopen).
- A **local case** paragraph — even a fictional-but-plausible one until real Denderleeuw projects exist. Mark as "voorbeeld" if not real.
- 3–4 **FAQs specific to Denderleeuw** — buitenunit op smalle tuin, stadszone vergunning, etc.
- **Internal link** to `werkgebied.html`, the relevant service hub (`airco.html` etc.), and `contact.html`.
- **Unique title and meta description** mentioning "Denderleeuw" + service.

**Add to** `sitemap.xml`, `llms.txt`, `llms-full.txt`. Add to relevant nav anchors and to `werkgebied.html`'s primary-region listing.

### 2.2 Retier werkgebied.html (3 hours)

Restructure into an explicit hierarchy:

> **Onze kernregio: Aalst, Denderleeuw, Ninove.**  
> **Daarnaast bedienen we ook:** Haaltert, Erpe-Mere, Lede, Liedekerke, Affligem.  
> **Ruimere regio:** Dendermonde, Geraardsbergen, Zottegem (op aanvraag).

Update:
- `<title>`, `<meta description>`, `<meta og:title>`, `<meta og:description>`, `<meta twitter:title>`, `<meta twitter:description>` — replace "volledige Denderstreek" with "Regio Aalst, Denderleeuw en Ninove".
- Visible H1 / intro copy.
- The city-card grid: tier visually (size/order) so the three primary cities are most prominent.
- The body copy paragraph that currently says "We helpen u graag in de hele Denderstreek".
- Internal links — make sure every primary city has descriptive anchor text (`Warmtepomp installateur in Aalst`, `Airco laten plaatsen in Denderleeuw`, `HVAC onderhoud in Ninove`).

### 2.3 Update homepage local positioning (2–3 hours)

In `index.html`:

- **H1** swap: `Klimaatcomfort op maat voor uw woning of bedrijf` → `Daikin airco en warmtepompen in Aalst, Denderleeuw en Ninove`
- **Intro paragraph** rewrite (from the review's recommended copy):
  > AVYclima installeert en onderhoudt energiezuinige Daikin airco's en warmtepompen voor woningen en kmo's in de regio Aalst, Denderleeuw en Ninove. U krijgt persoonlijk advies, een correcte dimensionering, stipte uitvoering en een verzorgde afwerking van begin tot einde.
- **Primary CTA** rewrite: `Vraag een offerte` → `Vraag een vrijblijvend plaatsbezoek aan`
- **Above-fold link block** — three "Onze regio" cards linking directly to `airco-aalst.html`, `airco-denderleeuw.html`, `airco-ninove.html` (and a parallel three-card block for warmtepomp). This concentrates internal-link weight on the primary cities.
- **`<title>`** swap: `Airco & warmtepompen in Aalst | AVYclima – Daikin specialist` → `Daikin airco en warmtepompen in Aalst, Denderleeuw en Ninove | AVYclima`
- **`<meta description>`** swap to the review's version: `AVYclima installeert en onderhoudt Daikin airco's en warmtepompen in Aalst, Denderleeuw, Ninove en omgeving. Persoonlijk advies, perfecte afwerking en stipte service. Vraag een vrijblijvend plaatsbezoek aan.`

### 2.4 Footer copy update site-wide (1–2 hours, 33 files)

The footer mentions service area on every page. Update the canonical footer (in the avyclima-site-edits skill's `chrome-templates.md`) with:

> **AVYclima — Daikin airco en warmtepompen voor de regio Aalst, Denderleeuw en Ninove.**

Then propagate to all 33 pages via the site-wide-edit workflow.

### 2.5 Add internal-linking density to primary city pages (2–3 hours)

On every blog post and portfolio entry, audit body copy for unlinked mentions of "Aalst", "Denderleeuw", "Ninove" and link the first instance to the corresponding city page. This concentrates link equity on the commercial pages.

### Phase 2 exit criteria

- [ ] `airco-denderleeuw.html`, `warmtepomp-denderleeuw.html`, `onderhoud-denderleeuw.html` exist, validate, and are in `sitemap.xml` + `llms.txt` + `llms-full.txt` + `werkgebied.html` + nav
- [ ] `werkgebied.html` shows three-tier hierarchy with Aalst/Denderleeuw/Ninove most prominent
- [ ] Homepage H1, intro, CTA, title, meta description match the new positioning
- [ ] Footer service-area copy updated on all 33 pages
- [ ] `grep -E 'volledige Denderstreek\|Denderstreek'` returns only intentional remaining mentions

---

## Phase 3 — Content quality upgrade (1 week)

**Goal:** Make the site feel expert-led, not SEO-generated. This is mostly rewriting, not coding.

### 3.1 Restructure warmtepomp.html (1 day)

Rewrite as a focused conversion page with these section stops (the review's recommended structure):

1. Warmtepomp laten plaatsen in regio Aalst
2. Welke warmtepomp past bij uw woning?
3. Lucht-lucht versus lucht-water
4. Waarom correcte dimensionering belangrijk is
5. Warmtepomp bij renovatie
6. Premies en voorwaarden (cautious wording from Phase 1.4)
7. Onze werkwijze
8. Veelgestelde vragen (with FAQPage JSON-LD)
9. Vraag een plaatsbezoek aan

Each section lead is rewritten in expert-installer voice (formal "u", Daikin model names exact per the skill's brand-voice rules). Strip every paragraph that has the AI-generated cadence.

### 3.2 Rewrite airco.html similarly (4–6 hours)

Apply the same expert-voice rewrite to `airco.html`. The structure is mostly fine; the language polish from Phase 1.1 + a section-by-section sweep for "machine-y" cadence is the work.

### 3.3 Rewrite city pages to break template duplication (3 days, ~13 pages)

Currently each city page reuses 80%+ template scaffolding. Goal: make each unique enough that Google doesn't flag them as doorway pages.

For each city page, add or rewrite:

- **Local housing context** (3–5 sentences specific to the deelgemeenten and housing types — not generic).
- **One concrete installation pattern** typical of that city ("split-airco met buitenunit op platdak voor de typische rijwoningen in centrum Aalst", etc.)
- **Local case** — fictional-but-plausible until real, marked "voorbeeld".
- **City-specific FAQ** — at least one FAQ unique to that location.
- **Cross-link** to the nearest two other city pages and the canonical service hub.

Track progress in a small checklist (per city, per service, per "unique paragraph added").

### 3.4 Add real project proof (ongoing — depends on Jurgen's input)

Replace placeholder testimonials with:

- Real project photos (the 7 JPEGs already in `pictures&logos/` are candidates, but they're not in git yet — they're working source material. Phase 4 will set up an `images/installations/` pipeline).
- Captions in expert-installer voice with city + Daikin model.
- Example: "Project in Denderleeuw: Daikin Altherma 3 H HT bij renovatie van een halfopen bebouwing — buitenunit ontkoppeld geplaatst voor minimale geluidsoverdracht."

### 3.5 Tighten FAQ pages (4 hours)

Audit `faq.html` and FAQ sections on city pages for:

- Cautious wording on all subsidy/savings answers.
- No "altijd / nooit / iedere woning" absolutes.
- Each Q&A short (≤3 sentences A) and useful — drop generic ones.

### Phase 3 exit criteria

- [ ] `warmtepomp.html` reads in 9 named sections; full text scanned for AI-tells, none flagged.
- [ ] Every city page has at least 200 words of city-unique content (not template-cloned).
- [ ] At least one real project photo lives in `images/installations/` and is referenced from a city page or portfolio entry.
- [ ] `faq.html` answers all phrased conditionally where applicable.

---

## Phase 4 — Technical SEO + maintainability (1 week)

**Goal:** Lock in the SEO and trust improvements, and add tooling so future drift is caught early. Per the chosen path: pure HTML + QA scripts, no SSG.

### 4.1 Strip meta keywords from 29 pages (15 min)

Bulk delete `<meta name="keywords" content="...">` from every page. Update `chrome-templates.md` exemplar to omit it.

### 4.2 Validate every JSON-LD block (3 hours)

Run a Python script (one-off, kept in `scripts/validate_jsonld.py`):
- Parse every `<script type="application/ld+json">` block; fail on JSON parse errors.
- Confirm `@type` matches the page-type taxonomy in `SKILL.md`.
- Confirm `Organization.logo` URL points at `https://avyclima.be/images/logo.png` (the brand-alignment commit already fixed this — recheck).
- Confirm `BreadcrumbList` items resolve to existing files.

### 4.3 Validate canonical URLs (1 hour)

Script: confirm every page's `<link rel="canonical">` matches its filename. Catches drift from copy-paste-clone errors.

### 4.4 Validate sitemap.xml against actual files (30 min)

Script: every `<loc>` in `sitemap.xml` must correspond to an existing file; every HTML file (except 404, etc.) must be in the sitemap. Add to CI / pre-commit hook.

### 4.5 Image alt-text + image optimization (3 hours)

Audit every `<img>` for descriptive Dutch `alt`. Add `loading="lazy"` to below-fold images. Convert installation JPEGs to WebP with JPG fallback (`pictures&logos/` source folder → `images/installations/` web folder; rename files to descriptive `daikin-perfera-rijwoning-aalst.webp` style per brand-identity.md).

### 4.6 Build the QA script suite (1 day)

Single script `scripts/site_qa.py` that runs all of:

- **Typo blacklist** — fail if any of `komfort`, `geluiddoos`, etc. resurface.
- **Broken internal link check** — every relative href resolves.
- **Anchor target check** — every `href="#id"` resolves to a real `id=` on that page.
- **Duplicate title / missing title check.**
- **Missing meta description check.**
- **Single H1 check.**
- **JSON-LD validity** (4.2).
- **Canonical drift** (4.3).
- **Sitemap drift** (4.4).
- **Image alt-text presence.**

Wire it into a GitHub Action (single workflow file: `.github/workflows/site-qa.yml`) so every PR runs it. Push happens already to `origin/main`; failing the action keeps drift out.

### 4.7 Update brand-identity.md drift table (15 min)

Mark the resolved drift items (palette, typeface, logo, theme-color, hero, cookie copy already done) as **completed**. Re-anchor the "Drift between in-progress repo and live brand" table to whatever is still open.

### 4.8 Update known-issues.md (30 min)

Move every Phase 1–3 item from "open" to "resolved" with the commit SHA. Add new items found during this work.

### Phase 4 exit criteria

- [ ] Zero `<meta name="keywords">` tags on any page.
- [ ] `python scripts/site_qa.py` exits 0 on `main`.
- [ ] GitHub Action runs `site_qa.py` on every push and PR.
- [ ] At least one real image renders in `images/installations/` with proper alt text and lazy loading.
- [ ] `brand-identity.md` "Drift" table reflects current state; `known-issues.md` reflects current open items.

---

## Phase 5 — Conversion + analytics (3–5 days)

**Goal:** Know what works once the cleaned-up site is live.

### 5.1 Add CTA language variants (2 hours)

Per the review, replace "Vraag een offerte" CTAs site-wide with conversion-focused alternatives:
- Primary: **Vraag een vrijblijvend plaatsbezoek aan**
- Phone CTA: **Bel voor advies**
- Inline body CTAs: **Plan advies aan huis** / **Bespreek uw project**

Vary across pages — homepage gets the primary-CTA treatment; service hubs get "Bespreek uw project"; city pages get "Plan advies aan huis"; contact gets the form.

### 5.2 Add "Waarom AVYclima" homepage block (3 hours)

Four cards as the review proposes:

1. Hoogopgeleide HVAC-experts
2. Correcte dimensionering
3. Perfecte afwerking
4. Stipte opvolging en nazorg

Place above the existing services section. Use the brand's `--accent` cyan for the icons.

### 5.3 Improve contact form for lead quality (4 hours)

Add fields to `contact.html`:
- **Type woning** (select): woning, appartement, kantoor, winkel, andere
- **Type project** (select): nieuwe installatie, vervanging, onderhoud, herstelling
- **Gemeente / postcode** (text — autocomplete from the 12 cities we serve)
- **Gewenste timing** (select): zo snel mogelijk, binnen 1 maand, binnen 3 maanden, alleen ter info
- **Foto's** (file upload, optional — Phase 5b once Formsubmit storage is figured out)

Update form validation, success message, and the form-submission handler in `js/main.js`.

### 5.4 Set up GA4 or privacy-conscious analytics (2 hours)

Add GA4 (or Plausible / Umami / Fathom — privacy-conscious alternative — Jurgen's call):

Track events:
- `contact_form_submit`
- `phone_click` (every `tel:` link)
- `email_click` (every `mailto:` link)
- `cta_click` (every primary-button click, with page + CTA-text payload)

Wire into the existing cookie-consent flow (`avyclima_cookies_accepted` localStorage flag is already in place). No tracking before consent.

### 5.5 Google Search Console setup (30 min)

- Add `avyclima.be` property.
- Verify via DNS or HTML meta tag.
- Submit `https://avyclima.be/sitemap.xml`.
- Set the international targeting to Belgium.
- Track core local keywords:
  - warmtepomp installateur Aalst
  - warmtepomp Denderleeuw
  - warmtepomp Ninove
  - airco installateur Aalst
  - Daikin installateur Aalst
  - HVAC Denderleeuw

### Phase 5 exit criteria

- [ ] All "Vraag een offerte" CTAs replaced.
- [ ] "Waarom AVYclima" block is on the homepage.
- [ ] Contact form has the four new fields and they appear in the Formsubmit email.
- [ ] GA4 (or chosen alternative) records `contact_form_submit` and `phone_click` events on a test visit.
- [ ] Google Search Console verifies `avyclima.be` and shows the sitemap as "Success".

---

## Cross-phase dependencies

- **Phase 2.1** (new Denderleeuw pages) depends on **Phase 1.4** (claim-softening copy) so the new pages are written with the right voice from day 1.
- **Phase 4.6** (QA script) depends on **Phase 1.1** (typo cleanup) so the typo-blacklist isn't immediately failing.
- **Phase 5.4** (analytics) depends on **Phase 5.3** (form changes) for the `contact_form_submit` event payload to include the new fields.

Otherwise phases are independent — Phase 3 and Phase 4 can run in parallel by two different people.

---

## Decisions resolved (2026-05-02 round 2)

1. **Testimonials — REMOVE.** Phase 1.3 removes the Review JSON-LD as already specified, **and additionally removes the visible testimonial section entirely from `index.html`**. The space is reclaimed for the "Waarom AVYclima" trust block from Phase 5.2 — pulled forward to Phase 1.3 so the homepage doesn't have a content gap. Reintroduce a testimonial section only when real Google Business Profile reviews land.
2. **Analytics vendor — open, info delivered.** See chat for the GA4 vs Plausible breakdown. Phase 5.4 placeholder; lock the choice before Phase 5 starts.
3. **Hero photo — open, info delivered.** Two viable candidates from existing `pictures&logos/` source identified (Pic003 rooftop Daikin and Pic007 indoor split). Final call needed before Phase 3.4. If commissioning a new landscape photo, that's a separate decision.
4. **City case studies — KEEP FICTIONAL** marked "Voorbeeld" until real Aalst / Denderleeuw / Ninove projects complete. Phase 3.3 uses this as the default. Each fictional case must:
   - Be plausible (real Daikin model, realistic specs for the housing type).
   - Be clearly marked `<p class="case-disclaimer"><em>Voorbeeldproject — illustratief.</em></p>` at the bottom.
   - Get swapped for a real one as projects land (no asterisk-tracking — just edit when ready).

---

## Out of scope (deliberately deferred)

- **Astro / SSG migration** — explicitly chosen against. Revisit in 6 months if QA scripts prove insufficient.
- **Pricing pages / quote calculator** — the review doesn't ask for it; Daikin pricing is install-dependent and would force soft claims again.
- **Multilingual (FR / EN)** — not requested. The current `hreflang="nl-BE"` is fine.
- **Blog content expansion beyond what exists** — review explicitly says "do not add many more pages yet".
- **Logo SVG export** — future task in `brand-identity.md`; nice-to-have, not blocking.

---

## Tracking

Each phase becomes one or more git branches: `phase-1-credibility`, `phase-2-local-seo`, `phase-3-content-quality`, `phase-4-technical-qa`, `phase-5-conversion`. Squash-merge into `main` on phase exit.

Use the `avyclima-site-edits` skill on every individual change — its site-wide-edit workflow already encodes "grep before, grep after, smoke-check three pages" hygiene that's referenced throughout this plan.

Update `skills/avyclima-site-edits/references/known-issues.md` as items close. That file is the running ledger; this plan is the contract.

---

## Effort summary

| Phase | Effort | Blocker for next phase? |
|---|---|---|
| 1. Credibility cleanup | 1–2 days | Yes (Phase 2 needs the cleaned voice) |
| 2. Local SEO repositioning | 2–4 days | No (Phase 3 + 4 can start in parallel) |
| 3. Content quality upgrade | ~1 week | No |
| 4. Technical SEO + QA tooling | ~1 week | No |
| 5. Conversion + analytics | 3–5 days | — |
| **Total** | **~3 weeks of focused work** | |

Compressible to ~2 weeks if Phase 3 and Phase 4 run in parallel.
