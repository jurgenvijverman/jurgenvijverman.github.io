# Increment 01 — Critical Fixes

**Priority:** IMMEDIATE (this week)
**Effort:** Small — 1–2 days
**Prerequisite:** None (start here)
**Goal:** Fix broken functionality and legal compliance issues before any new features.

---

## 1.1 Standardize Phone Number

**Problem:** 4+ different phone numbers across pages; some are placeholders.
**Requirement source:** GEO PDF — NAP consistency; SEO PDF — Local SEO.

### Tasks
- Define the single canonical phone number for AVYclima.
- Search and replace ALL phone number occurrences across every HTML file:
  - `index.html` — hero CTA, footer, JSON-LD schema
  - `airco.html` — sidebar, CTA button, footer
  - `warmtepomp.html` — sidebar, CTA button, footer
  - `onderhoud.html` — sidebar, CTA button, footer
  - `over-ons.html` — CTA, JSON-LD schema, footer
  - `contact.html` — contact details section, JSON-LD schema, footer
  - `faq.html` — footer
  - `blog.html` — footer
- Use consistent formatting: display format `+32 XXX XX XX XX` and tel: link format `tel:+32XXXXXXXXX`.
- Update all JSON-LD `telephone` fields to match.

### Acceptance Criteria
- Grep for phone patterns returns exactly 1 unique number across all files.
- All `tel:` links use the same E.164 format number.
- JSON-LD telephone fields match the canonical number.

---

## 1.2 Create Privacy Policy Page

**Problem:** GDPR violation — site collects personal data without valid privacy policy.
**Requirement source:** GEO PDF — Critical Finding #1.

### Tasks
- Create `privacy.html` with full Dutch (nl-BE) privacy policy covering:
  - Identity of data controller (AVYclima, address, contact)
  - Types of personal data collected (name, email, phone, address via contact form)
  - Purpose and legal basis for processing (legitimate interest / consent)
  - Cookie usage (analytics cookies, functional cookies)
  - Third-party services (Google Analytics GA4, Google reCAPTCHA if used)
  - Data retention periods
  - Rights of data subjects (access, rectification, erasure, portability, objection)
  - Right to lodge complaint with Belgian DPA (Gegevensbeschermingsautoriteit)
  - Last updated date
- Match the existing site design (same header, footer, CSS).
- Include proper `<head>` with title, meta description, canonical URL, Open Graph tags.
- Add to sitemap.xml.
- Verify all existing `privacy.html` links in footers and cookie banners resolve correctly.

### Acceptance Criteria
- `privacy.html` loads with complete policy content.
- All footer "Privacybeleid" links across 8 pages navigate to the page.
- Cookie banner "Meer info" link navigates to the page.
- Page appears in sitemap.xml.

---

## 1.3 Fix Contact Form Submission

**Problem:** Form shows success but sends data nowhere (`action="#"`).
**Requirement source:** SEO PDF — Measurement Plan (generate_lead events); GEO PDF — functional site.

### Tasks
- Choose and implement a form backend. Options for a static site:
  - **Option A (Recommended):** Formspree.io or Formsubmit.co — zero backend needed, add `action` URL.
  - **Option B:** Netlify Forms — if hosted on Netlify, add `netlify` attribute.
  - **Option C:** Custom serverless function (AWS Lambda / Cloudflare Worker) + email sending.
- Update `contact.html`:
  - Set form `action` to the chosen endpoint.
  - Add hidden `_subject` field for email subject.
  - Add honeypot field for spam protection.
  - Keep existing client-side validation in main.js.
- Update `main.js`:
  - Adjust form submit handler to work with real submission (e.g., fetch POST, handle response).
  - Fire GA4 `generate_lead` event only on confirmed successful submission (not on client-side-only validation pass).
- Test: submit form, verify email is received, verify GA4 event fires.

### Acceptance Criteria
- Form submission sends data to a real endpoint.
- Submitter receives confirmation (on-page message or redirect).
- Site owner receives email with form data.
- GA4 `generate_lead` event fires on successful submission.
- Spam protection is active (honeypot or reCAPTCHA).

---

## 1.4 Add JSON-LD Schema to Service Pages

**Problem:** airco.html, warmtepomp.html, onderhoud.html have zero structured data.
**Requirement source:** SEO PDF — Schema rollout; GEO PDF — Structured Data (scored 0/100 baseline).

### Tasks
- Add `Service` + `LocalBusiness` JSON-LD to each service page:
  - **airco.html:** Service type "Air Conditioning Installation", "Air Conditioning Maintenance"; provider: AVYclima LocalBusiness; areaServed; priceRange.
  - **warmtepomp.html:** Service type "Heat Pump Installation", "Heat Pump Maintenance"; same provider block.
  - **onderhoud.html:** Service type "HVAC Maintenance", "HVAC Repair"; same provider block.
- Add `BreadcrumbList` schema to pages that have breadcrumb navigation (airco, warmtepomp, over-ons).
- Ensure all schema telephone/email/address fields use the canonical contact info from task 1.1.

### Acceptance Criteria
- Each service page has valid JSON-LD (test with Google Rich Results Test).
- Schema includes: @type Service, name, description, provider (LocalBusiness), areaServed, url.
- BreadcrumbList schema matches visible breadcrumb navigation.

---

## 1.5 Update Sitemap Dates

**Problem:** All `<lastmod>` dates are `2024-04-09` (2 years stale).
**Requirement source:** SEO PDF — Technical Checklist.

### Tasks
- Update all `<lastmod>` values in `sitemap.xml` to the actual last-modified date of each page.
- If all pages are current: set to today's date `2026-04-09`.
- As pages are modified in subsequent increments, update their sitemap entry.

### Acceptance Criteria
- No `<lastmod>` date older than the actual file modification date.
- sitemap.xml validates against the sitemap protocol schema.

---

## 1.6 Fix Missing Meta Keywords on onderhoud.html

**Problem:** onderhoud.html is the only page missing the meta keywords tag.
**Requirement source:** Consistency across all pages.

### Tasks
- Add `<meta name="keywords" content="onderhoud airco, onderhoud warmtepomp, airco reiniging, HVAC service, herstellingen, Aalst, Denderleeuw">` to onderhoud.html `<head>`.

### Acceptance Criteria
- All 8 pages have meta keywords tags.

---

## Increment 01 Definition of Done
- [ ] Single phone number across all files (grep confirms)
- [ ] privacy.html live and linked from all pages
- [ ] Contact form submits to real backend and owner receives email
- [ ] JSON-LD present on all service pages (validate with Rich Results Test)
- [ ] sitemap.xml dates are current
- [ ] onderhoud.html has meta keywords
- [ ] All changes tested in browser (links work, form submits, pages render)
