# Increment 04 — Technical SEO & GEO Optimization

**Priority:** MEDIUM TERM (weeks 4–6)
**Effort:** Medium — 3–4 days
**Prerequisite:** Increments 01–03 completed (site has full content base)
**Goal:** Maximize technical crawlability, AI discoverability, and Core Web Vitals performance.

---

## 4.1 Create llms.txt File

**Problem:** No llms.txt for AI crawler guidance.
**Requirement source:** GEO PDF — Finding #10 (minimal/missing llms.txt).

### Tasks
- Create `llms.txt` in the site root following the llms.txt specification:
  ```
  # AVYclima
  > Erkend Daikin specialist voor airconditioning en warmtepompen in de regio Aalst, Denderleeuw en omgeving. Installatie, onderhoud en herstellingen voor particulieren en KMO's.

  ## Diensten
  - [Airconditioning](https://avyclima.be/airco.html): Advies, installatie en onderhoud van Daikin split en multisplit aircosystemen.
  - [Warmtepompen](https://avyclima.be/warmtepomp.html): Installatie van lucht/lucht en lucht/water warmtepompen voor verwarming en koeling.
  - [Onderhoud & Herstellingen](https://avyclima.be/onderhoud.html): Periodiek onderhoud, reiniging, en storingsherstel.

  ## Informatie
  - [Over Ons](https://avyclima.be/over-ons.html): Bedrijfsinfo, certificaten, en ervaring sinds 2013.
  - [FAQ](https://avyclima.be/faq.html): Veelgestelde vragen over airco en warmtepompen.
  - [Contact](https://avyclima.be/contact.html): Offerte aanvragen of contact opnemen.
  - [Blog](https://avyclima.be/blog.html): Tips en advies over klimaatinstallaties.

  ## Werkgebied
  Aalst, Denderleeuw, Ninove, Dendermonde, Erpe-Mere, Haaltert, Lede, Herzele, Zottegem, Geraardsbergen, Wetteren, Gent.
  ```
- Also create `llms-full.txt` with more detailed content about services, pricing factors, and expertise.
- Add reference in `robots.txt`:
  ```
  # LLM guidance
  # See https://avyclima.be/llms.txt
  ```

### Acceptance Criteria
- `llms.txt` accessible at site root.
- Content accurately describes all site sections and services.
- File is well-structured and concise.

---

## 4.2 Add Hreflang Tags

**Problem:** No hreflang tags for multilingual Belgium.
**Requirement source:** GEO PDF — Finding #14.

### Tasks
- Add hreflang tags to all pages. Since the site is Dutch-only, add self-referencing hreflang and x-default:
  ```html
  <link rel="alternate" hreflang="nl-BE" href="https://avyclima.be/[page]" />
  <link rel="alternate" hreflang="x-default" href="https://avyclima.be/[page]" />
  ```
- Apply to all HTML pages (existing + new from increments 02–03).
- If a French version is planned in the future, document the pattern for adding `fr-BE` hreflang when French pages are created.

### Acceptance Criteria
- Every HTML page has hreflang `nl-BE` and `x-default` tags.
- Tags use absolute URLs matching canonical URLs.
- Validate with hreflang tag checker tool.

---

## 4.3 Core Web Vitals Optimization

**Problem:** No explicit CWV monitoring or optimization.
**Requirement source:** SEO PDF — KPIs (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1).

### Tasks
- **LCP (Largest Contentful Paint) ≤ 2.5s:**
  - Preload critical CSS: add `<link rel="preload" as="style" href="css/style.css">`.
  - Preload Google Fonts: already using `preconnect`, add `font-display: swap` via CSS.
  - Defer non-critical JavaScript: add `defer` attribute to `<script src="js/main.js">` if not already present.
  - Optimize images (when added): use WebP format, `loading="lazy"` on below-fold images, explicit `width`/`height` attributes.
  - Consider inlining critical CSS for above-the-fold content.

- **INP (Interaction to Next Paint) ≤ 200ms:**
  - Review main.js for long-running event handlers.
  - Ensure FAQ accordion uses CSS transitions (not JS animation).
  - Mobile nav toggle: verify no layout thrashing.

- **CLS (Cumulative Layout Shift) ≤ 0.1:**
  - Add explicit dimensions to all media elements (images, iframes, embeds).
  - Ensure font loading doesn't cause text shift (font-display: swap + preconnect already partially in place).
  - Set fixed height on Google Maps iframe container.
  - Cookie banner: ensure it doesn't shift page content (use fixed positioning).

- **Add Web Vitals monitoring script:**
  ```html
  <script type="module">
    import {onCLS, onINP, onLCP} from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module';
    function sendToGA4({name, delta, id}) {
      gtag('event', name, { value: Math.round(name === 'CLS' ? delta * 1000 : delta), event_label: id });
    }
    onCLS(sendToGA4);
    onINP(sendToGA4);
    onLCP(sendToGA4);
  </script>
  ```

### Acceptance Criteria
- Lighthouse Performance score ≥ 90 on mobile.
- LCP ≤ 2.5s on 3G throttled test.
- CLS ≤ 0.1 (no layout shifts from fonts, images, or embeds).
- INP ≤ 200ms (test with Lighthouse user flow or Chrome DevTools).
- Web Vitals data flowing to GA4.

---

## 4.4 Consolidate and Validate All Structured Data

**Problem:** Schema is implemented but inconsistent across pages and needs validation.
**Requirement source:** SEO PDF — Schema rollout; GEO PDF — Structured Data.

### Tasks
- Audit every page's JSON-LD for:
  - Consistent NAP (telephone, email, address must match everywhere).
  - Valid schema types (test each page with Google Rich Results Test).
  - No duplicate schemas on a single page.
  - Proper `@id` usage for entity linking across pages.
- Create a shared JSON-LD configuration approach:
  - Define a JavaScript object with the canonical business info.
  - Generate page-specific schema from the shared base.
  - This prevents future inconsistencies.
- Add `sameAs` links to all relevant schemas once external profiles exist (GBP, LinkedIn, Facebook, etc.).
- Implement `WebSite` schema on the homepage with `SearchAction` (if site search is planned).
- Add `AggregateRating` to LocalBusiness schema once Google Reviews reach 5+.

### Schema Checklist per Page
| Page | Required Schema Types |
|---|---|
| index.html | HVACBusiness, Organization, WebSite |
| airco.html | Service, LocalBusiness, BreadcrumbList |
| warmtepomp.html | Service, LocalBusiness, BreadcrumbList |
| onderhoud.html | Service, LocalBusiness, BreadcrumbList |
| over-ons.html | Organization, LocalBusiness, Person, BreadcrumbList |
| contact.html | ContactPoint, Organization, LocalBusiness |
| faq.html | FAQPage, Organization |
| blog.html | Blog, Organization |
| blog/*.html | Article, BreadcrumbList |
| portfolio.html | ItemList, Organization |
| portfolio/*.html | Article/CreativeWork, BreadcrumbList |
| City pages | LocalBusiness, FAQPage, BreadcrumbList, Service |
| werkgebied.html | LocalBusiness (full areaServed), BreadcrumbList |
| privacy.html | (none required) |

### Acceptance Criteria
- Every page passes Google Rich Results Test with no errors.
- NAP is identical across all schemas.
- No duplicate schema blocks on any page.
- Schema coverage table is 100% implemented.

---

## 4.5 Implement Canonical URL Consistency

**Problem:** Need to ensure canonical URLs are correct across all pages including new ones.
**Requirement source:** SEO PDF — Technical Checklist (consistent canonicalization).

### Tasks
- Define canonical URL policy:
  - Protocol: `https://`
  - Domain: `avyclima.be` (no www)
  - Trailing slashes: no (e.g., `https://avyclima.be/airco.html` not `https://avyclima.be/airco.html/`)
- Verify every page has a `<link rel="canonical">` tag matching this policy.
- Ensure canonical URLs in JSON-LD `@id` and `url` fields match.
- Ensure Open Graph `og:url` matches canonical.
- Redirect www → non-www and http → https at server level (document for hosting setup).

### Acceptance Criteria
- Grep for `rel="canonical"` returns one per page, all following the same URL pattern.
- No page has a canonical pointing to a different page (unless intentional).

---

## 4.6 Accessibility Audit (WCAG 2.1 AA)

**Problem:** Site accessibility not formally tested.
**Requirement source:** GEO PDF — accessibility impacts AI understanding; SEO PDF — best practice.

### Tasks
- Run automated audit (Lighthouse Accessibility, axe DevTools).
- Fix common issues:
  - Ensure all interactive elements have focus styles.
  - Verify color contrast ratios (primary blue #0057a8 on white = check).
  - Add `aria-label` to icon-only buttons (mobile nav toggle, etc.).
  - Ensure form labels are properly associated with inputs.
  - Add skip-to-content link.
  - Verify heading hierarchy has no skips (H1 → H2 → H3, no jumps).
- Test with keyboard navigation (tab order, enter/space activation).
- Test with screen reader on key flows (navigation, contact form).

### Acceptance Criteria
- Lighthouse Accessibility score ≥ 95.
- No critical axe violations.
- All forms are keyboard-navigable and screen-reader-friendly.
- Skip-to-content link present.

---

## Increment 04 Definition of Done
- [x] llms.txt and llms-full.txt created and accessible
- [x] Hreflang tags on all 33 pages (nl-BE + x-default)
- [x] Core Web Vitals optimizations applied: CSS preload, script defer, font preconnect on all pages
- [x] Web Vitals reporting to GA4 (web-vitals v4 module on all 33 pages)
- [x] All structured data validated: valid JSON, consistent NAP
- [x] NAP consistent across all schemas (tel: +32472657647, email: info@avyclima.be, postal: 9200)
- [x] Canonical URLs consistent across all pages (https://avyclima.be/, no www)
- [x] Accessibility: skip-to-content link, focus-visible styles, main landmark on all 33 pages
- [x] robots.txt updated with llms.txt references
