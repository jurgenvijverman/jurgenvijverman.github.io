# Increment 03 — Local SEO & City Landing Pages

**Priority:** SHORT TERM (weeks 3–5)
**Effort:** Medium-Large — 5–7 days
**Prerequisite:** Increment 01 (critical fixes) and Increment 02 (content base established)
**Goal:** Capture city + service keyword combinations; establish local authority for the Aalst region.

---

## 3.1 Create City Landing Page Template

**Problem:** Zero localized landing pages; all content targets "Aalst" generically.
**Requirement source:** SEO PDF — Architecture (2-layer: service hubs + city pages); Keyword Strategy (city + service modifiers).

### Tasks
- Design a reusable city landing page template with these sections:
  1. **Hero:** City-specific headline (e.g., "Airco installatie in Ninove"), service + city CTA.
  2. **Local intro:** 150–200 words about the city/area, housing types, climate needs.
  3. **Services available:** Cards linking to main service pages (airco, warmtepomp, onderhoud).
  4. **Local case study:** 1 embedded reference to a relevant case study (or placeholder).
  5. **Pricing factors:** Brief section on what affects pricing in this specific area.
  6. **Service area detail:** Neighborhoods/deelgemeenten served within this municipality.
  7. **FAQ:** 3–5 locally relevant questions.
  8. **CTA:** Contact form link / phone.
- Template must include:
  - Full `<head>` with city-specific title, meta description, canonical, OG tags.
  - `LocalBusiness` JSON-LD with `areaServed` specific to the city.
  - `FAQPage` JSON-LD for the local FAQ section.
  - `BreadcrumbList` JSON-LD: Home > [Service] > [City].
  - Internal links to the parent service hub page.

### Acceptance Criteria
- Template HTML file created and documented.
- All required sections and schema blocks defined.
- Template produces valid HTML and schema when populated.

---

## 3.2 Priority 1 City Pages — Aalst (Service-Specific)

**Requirement source:** SEO PDF — P1 keywords: "airco plaatsen aalst", "warmtepomp installateur aalst", "airco onderhoud aalst" (50–200 monthly searches each).

### Pages to Create
1. **`airco-aalst.html`** — "Airco plaatsen & onderhouden in Aalst"
   - Title: "Airco plaatsen in Aalst | Daikin split & multisplit – AVYclima"
   - 600–1,000 words; reference Aalst neighborhoods (centrum, Hofstade, Erembodegem, Gijzegem, Herdersem, Nieuwerkerken, Meldert, Baardegem).
   - Housing types: rijwoningen, appartementen, KMO-gebouwen in Aalst context.
   - Link to main airco.html for full details.

2. **`warmtepomp-aalst.html`** — "Warmtepomp installateur in Aalst"
   - Title: "Warmtepomp installateur Aalst | Lucht/lucht & lucht/water – AVYclima"
   - 600–1,000 words; renovation focus (older Aalst housing stock).
   - Mention subsidies applicable in Aalst (Mijn Verbouwpremie).
   - Link to main warmtepomp.html.

3. **`onderhoud-aalst.html`** — "Airco & warmtepomp onderhoud in Aalst"
   - Title: "Airco onderhoud Aalst | Service & reiniging – AVYclima"
   - 600–1,000 words; maintenance and repair in Aalst area.
   - Link to main onderhoud.html.

### Content Differentiation Rules
- Each city page MUST contain genuinely localized content — NOT copies of the service hub with "Aalst" inserted.
- Include: local neighborhood names, typical building types in that municipality, relevant local regulations or permits, distance/travel time from Denderleeuw base.
- Avoid: duplicate content penalties by ensuring unique paragraphs and locally-specific information.

### Acceptance Criteria
- 3 Aalst-specific pages exist with 600–1,000 words each.
- Each has unique content (not duplicated from service hubs).
- Each has LocalBusiness + FAQPage + BreadcrumbList JSON-LD.
- Internal links connect city pages ↔ service hubs bidirectionally.
- Pages added to sitemap.xml.

---

## 3.3 Priority 2 City Pages — Ninove

**Requirement source:** SEO PDF — Content Calendar Month 2 (Ninove city pages).

### Pages to Create
1. **`airco-ninove.html`** — "Airco installatie in Ninove"
   - Title: "Airco plaatsen in Ninove | Daikin airco – AVYclima"
   - Reference: Ninove centrum, Appelterre, Denderwindeke, Meerbeke, Okegem, Pollare.
   - 600–1,000 words.

2. **`warmtepomp-ninove.html`** — "Warmtepomp installateur in Ninove"
   - Title: "Warmtepomp Ninove | Installatie & advies – AVYclima"
   - 600–1,000 words.

### Acceptance Criteria
- Same standards as 3.2 but for Ninove.
- Unique local content per page.

---

## 3.4 Priority 3 City Pages — Dendermonde

**Requirement source:** SEO PDF — Content Calendar Month 3.

### Pages to Create
1. **`airco-dendermonde.html`** — "Airco installatie in Dendermonde"
   - Reference: Dendermonde centrum, Baasrode, Grembergen, Appels, Sint-Gillis-bij-Dendermonde.
   - 600–1,000 words.

2. **`warmtepomp-dendermonde.html`** — "Warmtepomp Dendermonde"
   - 600–1,000 words.

### Acceptance Criteria
- Same standards as 3.2 but for Dendermonde.

---

## 3.5 Priority 4 City Pages — Erpe-Mere, Haaltert, Lede

**Requirement source:** SEO PDF — Content Calendar Month 4 (secondary municipalities).

### Pages to Create
1. **`airco-erpe-mere.html`** — "Airco installatie in Erpe-Mere"
2. **`warmtepomp-erpe-mere.html`** — "Warmtepomp Erpe-Mere"
3. **`airco-haaltert.html`** — "Airco installatie in Haaltert"
4. **`warmtepomp-haaltert.html`** — "Warmtepomp Haaltert"
5. **`airco-lede.html`** — "Airco installatie in Lede"
6. **`warmtepomp-lede.html`** — "Warmtepomp Lede"

Each: 600–800 words, same template, genuine local content.

### Acceptance Criteria
- 6 additional city pages.
- No duplicate content across city pages (check with diff tool).

---

## 3.6 Service Area Hub Page

**Problem:** Service area is mentioned in sections across pages but has no dedicated page.
**Requirement source:** SEO PDF — internal linking (every page reachable within 3 clicks).

### Tasks
- Create `werkgebied.html` — "Ons werkgebied: Aalst, Ninove, Dendermonde en regio"
  - Overview map or list of all serviced municipalities.
  - Links to all city-specific landing pages.
  - Brief description of each area.
  - Distance/travel time from Denderleeuw.
  - `LocalBusiness` JSON-LD with full `areaServed` array.
- Add to main navigation (could replace or supplement existing service area sections).
- Add to sitemap.xml.

### Acceptance Criteria
- werkgebied.html acts as a hub linking to all city pages.
- Every city page is reachable within 3 clicks from homepage.
- Service area JSON-LD includes all municipalities.

---

## 3.7 Update Internal Linking Strategy

**Requirement source:** SEO PDF — Internal linking: every important page reachable within 3 clicks.

### Tasks
- Add contextual links from service hub pages to relevant city pages:
  - airco.html → "Bekijk onze airco-diensten in [Aalst](airco-aalst.html), [Ninove](airco-ninove.html), [Dendermonde](airco-dendermonde.html)..."
  - warmtepomp.html → similar pattern.
  - onderhoud.html → link to onderhoud-aalst.html.
- Add city page links in footer under "Werkgebied" section.
- Add breadcrumb navigation on all city pages.
- Update sitemap.xml with all new pages.

### Acceptance Criteria
- No city page is more than 3 clicks from homepage.
- Footer includes city page links.
- All breadcrumbs are accurate and functional.
- sitemap.xml is complete and up-to-date.

---

## 3.8 Update Sitemap and Robots

### Tasks
- Add all new city pages (estimated 13–15 new URLs) to sitemap.xml.
- Set priority: city pages 0.7, werkgebied.html 0.8.
- Verify robots.txt still allows all paths.
- Validate sitemap against XML schema.

### Acceptance Criteria
- sitemap.xml includes every HTML page on the site.
- No orphan pages (pages not in sitemap or not linked from anywhere).

---

## Increment 03 Definition of Done
- [x] City landing page template created and documented
- [x] 3 Aalst-specific pages live (airco, warmtepomp, onderhoud)
- [x] 2 Ninove-specific pages live
- [x] 2 Dendermonde-specific pages live
- [x] 6 secondary city pages live (Erpe-Mere, Haaltert, Lede)
- [x] werkgebied.html hub page created
- [x] All city pages have unique, localized content (no duplication)
- [x] All city pages have LocalBusiness + FAQPage + BreadcrumbList JSON-LD
- [x] Internal linking updated across all existing pages
- [x] Footer updated with city page links (werkgebied.html linked from all 33 pages)
- [x] sitemap.xml updated with all new URLs (33 total)
- [x] Total site: 33 pages (exceeded target of 25–28)
