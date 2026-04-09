# Increment 02 — Content Depth & Trust Signals

**Priority:** SHORT TERM (weeks 2–3)
**Effort:** Medium — 3–5 days
**Prerequisite:** Increment 01 completed (critical fixes)
**Goal:** Fill content gaps that block GEO visibility and E-E-A-T credibility.

---

## 2.1 Implement Blog Post Pages

**Problem:** 6 blog cards on blog.html all link to `#`; no actual blog content exists.
**Requirement source:** SEO PDF — Content Calendar (2–4 posts/month, 1,000–1,600 words each).

### Tasks
- Create a `blog/` subfolder with individual HTML pages for the 6 existing blog topics:
  1. `blog/airco-als-verwarming.html` — "Airco als verwarming: werkt dat echt?"
  2. `blog/prijs-airco-installatie.html` — "Wat bepaalt de prijs van een airco-installatie?"
  3. `blog/warmtepomp-renovatie.html` — "Welke warmtepomp past bij een renovatie?"
  4. `blog/onderhoud-airco-wanneer.html` — "Onderhoud: waarom en wanneer voor uw airco?"
  5. `blog/split-vs-multisplit.html` — "Split vs. multisplit airco: wat is het verschil?"
  6. `blog/premies-warmtepompen-vlaanderen.html` — "Premies voor warmtepompen in Vlaanderen: overzicht 2026"
- Each blog post page must include:
  - Full `<head>` section: unique title (topic + AVYclima), meta description, canonical URL, Open Graph, Twitter Card.
  - `Article` JSON-LD schema: headline, author (Organization: AVYclima), datePublished, dateModified, image, publisher.
  - Breadcrumb navigation: Home > Blog > [Article Title].
  - `BreadcrumbList` JSON-LD schema.
  - 1,000–1,600 words of substantive, original Dutch content.
  - Internal links to relevant service pages (e.g., blog about airco pricing links to airco.html).
  - CTA section at bottom linking to contact.html.
  - Same header/footer/design as other pages.
- Update `blog.html`: replace `href="#"` with actual blog post URLs.
- Add all 6 blog posts to `sitemap.xml` with appropriate priority (0.6) and changefreq (monthly).
- Update `robots.txt` if needed (currently allows all, should be fine).

### Content Guidelines per Post
- Write for a homeowner audience in the Aalst/Denderleeuw region.
- Include practical advice, not just sales pitch.
- Use question-based H2 headings (optimized for featured snippets / AI answers).
- Reference Daikin products where relevant.
- Include pricing ranges where appropriate (with "afhankelijk van" disclaimers).
- Mention relevant subsidies (Mijn Verbouwpremie) where applicable.

### Acceptance Criteria
- 6 blog post pages exist and are accessible.
- All links from blog.html navigate to actual posts.
- Each post has valid Article + BreadcrumbList JSON-LD.
- Each post is 1,000–1,600 words.
- All posts appear in sitemap.xml.
- Internal links connect blog posts to relevant service pages.

---

## 2.2 Add Customer Testimonials Section

**Problem:** Zero social proof anywhere on the site.
**Requirement source:** GEO PDF — Critical Finding #8 (no reviews); SEO PDF — Authority Building.

### Tasks
- Add a testimonials section to `index.html` between the process section and FAQ section:
  - 3–6 customer quotes with name (first name + last initial), location (e.g., "Aalst"), service type, and star rating.
  - Use `Review` JSON-LD schema with itemReviewed pointing to the AVYclima LocalBusiness.
  - Design: card-based layout matching existing design system.
- Add a smaller testimonial sidebar or quote block on each service page (airco.html, warmtepomp.html, onderhoud.html) with 1–2 relevant testimonials.
- Placeholder approach: prepare the HTML/CSS structure. Content should be replaced with real customer quotes when available. Use realistic but clearly marked placeholder content initially.

### Acceptance Criteria
- Testimonials section visible on homepage.
- Review schema validates in Rich Results Test.
- Each service page has at least 1 relevant testimonial.
- Design is consistent with existing card/section patterns.

---

## 2.3 Expand About Page with Team & Credentials

**Problem:** About page has company story but lacks specific team/owner information.
**Requirement source:** GEO PDF — Critical Finding #7 (no team/owner info); E-E-A-T expertise signals.

### Tasks
- Add a "Ons Team" section to `over-ons.html`:
  - Owner/founder profile: name, photo placeholder, role, brief bio, years of experience.
  - Key certifications displayed prominently (not just listed in schema):
    - Daikin D1/D1+ installer certification
    - Koeltechnisch bekwaamheidscertificaat
    - VEA erkenning
  - Placeholder for team photo.
- Add a `Person` JSON-LD for the owner/lead technician with `jobTitle`, `worksFor`, `knowsAbout`.
- Enhance the existing stats section with sources/context (e.g., "Sinds 2013 actief" rather than just "10+ jaar").

### Acceptance Criteria
- About page includes named team member(s) with roles and credentials.
- Person schema is valid.
- Certifications are visually displayed (not just in invisible schema).

---

## 2.4 Create Portfolio / Case Studies Page

**Problem:** No real-world project evidence anywhere on the site.
**Requirement source:** SEO PDF — Content Calendar (case studies, 600–900 words, before/after images).

### Tasks
- Create `portfolio.html` with:
  - Full `<head>` section matching site standards.
  - Page structure: gallery of 3–6 project cards.
  - Each project card: title, location, service type, brief description, placeholder for images.
  - Filterable by service type (airco / warmtepomp / onderhoud) — CSS-only filter or simple JS toggle.
- Create 2–3 detailed case study pages in `portfolio/` subfolder:
  - `portfolio/airco-installatie-aalst.html`
  - `portfolio/warmtepomp-renovatie-denderleeuw.html`
  - `portfolio/multisplit-kantoor-ninove.html`
  - Each: 600–900 words, project details, challenge/solution/result structure, placeholder for before/after photos.
  - Include `Article` or `CreativeWork` JSON-LD schema.
- Add portfolio.html to navigation (between "Over Ons" and "FAQ" or as submenu).
- Add all portfolio pages to sitemap.xml.
- Add internal links from service pages to relevant case studies.

### Content Structure per Case Study
- **Situatie:** Client context, building type, location, problem/need.
- **Oplossing:** What was recommended and why, Daikin model specifics.
- **Resultaat:** Outcomes, energy savings, client satisfaction.
- **Technische details:** System specs, capacity, installation timeline.

### Acceptance Criteria
- portfolio.html is accessible from main navigation.
- 2–3 case study pages exist with 600–900 words each.
- Case studies are linked from relevant service pages.
- All new pages in sitemap.xml.

---

## 2.5 Embed Google Maps on Contact Page

**Problem:** Map section is a placeholder div.
**Requirement source:** GEO PDF — local presence; SEO PDF — Technical Checklist.

### Tasks
- Replace the map placeholder in `contact.html` with a Google Maps embed `<iframe>`:
  - Centered on Denderleeuw, 9200.
  - Appropriate zoom level showing service area.
  - Responsive sizing (100% width, ~400px height).
  - `loading="lazy"` attribute for performance.
- Alternative if Google Maps API key not available: use OpenStreetMap embed via iframe.

### Acceptance Criteria
- Interactive map visible on contact page.
- Map is responsive (works on mobile).
- No CLS (Cumulative Layout Shift) — map container has fixed height.

---

## 2.6 Add Image Alt Text & Real Image Strategy

**Problem:** Site uses only emoji icons — no real images, no alt text.
**Requirement source:** GEO PDF — Critical Finding #4 (missing alt text); SEO PDF — image optimization.

### Tasks
- Define image placeholder strategy:
  - Create `/images/` directory.
  - Define needed images: hero background, team photo, service icons (professional SVG/PNG), Daikin product images, installation photos, OG share image.
  - Create `og-image.jpg` (1200×630px) for social sharing — currently referenced but missing.
- Add alt text to any existing `<img>` tags (currently none, but prepare for when images are added).
- Document image requirements in a checklist for the client to provide real photos.
- Replace emoji icons with SVG icons (consider Lucide, Heroicons, or custom HVAC icons) for better accessibility and professional appearance.

### Acceptance Criteria
- `/images/` directory exists with at least `og-image.jpg`.
- Image requirements checklist document created.
- Any `<img>` tags added have descriptive Dutch alt text.

---

## Increment 02 Definition of Done
- [x] 6 blog post pages live with 1,000–1,600 words each
- [x] Testimonials section on homepage with Review schema
- [x] Testimonial quote on each service page (airco, warmtepomp, onderhoud)
- [x] About page expanded with team info and Person schema
- [x] Portfolio page and 2–3 case studies created
- [x] OpenStreetMap embedded on contact page
- [x] Image strategy defined and og-image.jpg created
- [x] All new pages added to sitemap.xml
- [x] All new pages have full `<head>` (title, meta, canonical, OG, schema)
- [x] Internal linking updated (service pages ↔ blog posts ↔ case studies)
