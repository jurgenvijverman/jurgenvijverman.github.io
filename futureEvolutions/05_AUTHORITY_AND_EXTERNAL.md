# Increment 05 — Authority Building & External Presence

**Priority:** MEDIUM TERM (weeks 6–10)
**Effort:** Medium — ongoing, 2–3 days setup + recurring tasks
**Prerequisite:** Increments 01–04 (site is fully functional and technically optimized)
**Goal:** Build brand authority signals that AI systems and search engines use for entity resolution, trust scoring, and citation decisions.

---

## 5.1 Google Business Profile Setup & Optimization

**Problem:** GBP not claimed — the single highest-impact gap for local HVAC visibility.
**Requirement source:** GEO PDF — Critical Finding #3; SEO PDF — Local SEO Strategy.

### Tasks (External — not code changes)
- **Claim & verify** Google Business Profile for AVYclima at google.com/business.
- **Profile completion:**
  - Primary category: "HVAC Contractor" or "Air Conditioning Contractor"
  - Secondary categories: "Heat Pump Supplier", "Air Conditioning Repair Service"
  - Business name: AVYclima (exact match to site)
  - Address: Denderleeuw, 9200, België (match NAP exactly)
  - Phone: canonical phone number (from Increment 01)
  - Website: https://avyclima.be
  - Hours: Ma–Vr 8:00–18:00, Za 9:00–13:00
  - Service area: List all municipalities from werkgebied.html
  - Description: 750 characters summarizing services, Daikin specialization, region
- **Services list:** Add all services with descriptions (airco installatie, warmtepomp installatie, onderhoud, herstellingen, advies).
- **Photos:** Upload minimum 10 photos (storefront, team, installations, equipment, certificates).
- **Posts:** Publish first GBP post (tip, offer, or update).
- **Q&A:** Seed 5–10 questions with answers (matching FAQ page content).

### Code Changes Required
- Add GBP link to `sameAs` array in all JSON-LD schemas once profile is live.
- Add GBP review link/badge to footer or testimonials section (once reviews accumulate).

### Recurring Tasks
- Publish 1 GBP post per week (tip, seasonal offer, project photo).
- Respond to all reviews within 24 hours.
- Update photos monthly (new installations).
- Monitor GBP Insights: calls, direction requests, website clicks.

### Acceptance Criteria
- GBP is verified and fully completed (100% profile completion in Google's dashboard).
- Profile appears in Google Maps searches for "airco Aalst", "warmtepomp Denderleeuw".
- sameAs links updated in site schemas.

---

## 5.2 LinkedIn Company Page

**Problem:** No LinkedIn presence — AI systems (ChatGPT, Bing Copilot) use LinkedIn for entity verification.
**Requirement source:** GEO PDF — Critical Finding #9.

### Tasks (External)
- Create LinkedIn company page: AVYclima.
- Complete all fields: industry (HVAC), size, location, description, website, specialties.
- Add company logo and banner image.
- Publish 1 introductory post.
- Connect owner/team personal profiles to company page.

### Code Changes Required
- Add LinkedIn URL to `sameAs` array in JSON-LD schemas.
- Add LinkedIn icon/link to site footer social links section.

### Acceptance Criteria
- LinkedIn page is live and discoverable.
- sameAs updated across site schemas.
- Footer social links include LinkedIn.

---

## 5.3 Directory Citations (NAP Consistency)

**Problem:** No business directory listings — limits entity authority for AI and search.
**Requirement source:** SEO PDF — Citation consistency; GEO PDF — Brand Authority (6/100).

### Tasks (External)
Register AVYclima with consistent NAP on:

**Priority 1 — Belgian Business Directories:**
1. Gouden Gids (goldenpages.be) — HVAC category
2. Witte Gids (whitepages.be)
3. Infobel.be
4. Kompass.com (B2B directory)

**Priority 2 — Home Services Platforms:**
5. Homeproved.be — request profile + reviews
6. Bobex.be — HVAC contractor profile
7. Werkspot.be / Zoofy.be — if applicable to region

**Priority 3 — Industry-Specific:**
8. Daikin dealer directory (partner submission)
9. Koeltechniek.be or relevant HVAC associations
10. Belgian Chamber of Commerce (KBO listing verification)

**Priority 4 — Social & Review Platforms:**
11. Facebook business page
12. Trustpilot business page

### NAP Standard (use EXACTLY this format everywhere):
```
Name:    AVYclima
Address: [Street], 9200 Denderleeuw, België
Phone:   [canonical number in +32 format]
Website: https://avyclima.be
```

### Code Changes Required
- Add `sameAs` links for each directory listing URL to JSON-LD.
- Consider adding a "Bekijk ons op" section in footer with directory badges/links.

### Acceptance Criteria
- Minimum 8 directory listings live with identical NAP.
- All listing URLs added to sameAs in JSON-LD.
- NAP audit: search for business name and verify no conflicting information.

---

## 5.4 Review Collection System

**Problem:** Zero customer reviews anywhere.
**Requirement source:** GEO PDF — Critical Finding #8; SEO PDF — review systematization.

### Tasks
- **Create review request workflow:**
  - After installation handover: send email/SMS with direct Google Review link.
  - After maintenance visit: follow-up email with review request.
  - Template messages (Dutch) for email/WhatsApp review requests.
- **Generate Google Review short link:** `https://g.page/r/[PLACE_ID]/review`
- **Add review prompt to post-service communication** (email template or automated follow-up).
- **Display reviews on site:**
  - Once 5+ Google Reviews exist, add `AggregateRating` to LocalBusiness schema.
  - Embed Google Reviews widget or manually curate testimonials with attribution.
  - Update Review schema on homepage testimonials section.

### Code Changes Required (when reviews reach 5+)
- Add `AggregateRating` to `LocalBusiness` JSON-LD:
  ```json
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "12"
  }
  ```
- Add Google Reviews badge/widget to homepage and contact page.

### Goal Timeline
- Month 1: 5 reviews (ask recent customers)
- Month 3: 15 reviews
- Month 6: 30+ reviews (sustainable review velocity)

### Acceptance Criteria
- Review request process documented and ready to use.
- Google Review short link generated and shared with team.
- Review display infrastructure on site ready to activate.

---

## 5.5 Backlink Strategy — First Links

**Problem:** Zero backlinks (new domain).
**Requirement source:** SEO PDF — Authority Building; GEO PDF — Brand Authority.

### Tasks (External — outreach activities)

**Quick wins (weeks 6–8):**
1. Daikin partner/dealer page — submit for inclusion.
2. Local press release: "Nieuw HVAC-bedrijf biedt Daikin-expertise in regio Aalst" → send to Het Laatste Nieuws (regionaal), Denderstreek.be, Aalst Centraal.
3. B2B partner links: reach out to local electricians, architects, vastgoedkantoren for mutual referral links.
4. Belgian HVAC association membership page link.
5. Local municipality website: sponsor/partner of local events or sustainability initiatives.

**Content-driven links (months 3–6):**
6. Create "Warmtepomp subsidie-gids Vlaanderen 2026" — linkable resource.
7. Create "Airco prijzengids: wat kost een airco in 2026?" — linkable resource.
8. Infographic: "Wanneer zoeken Belgen naar airco?" (seasonal search data) — pitch to HVAC/energy blogs.
9. Guest post on BouwInfo.be or Livios.be forums/blogs.

### Code Changes Required
- Create dedicated landing pages for linkable resources (subsidie-gids, prijzengids) — these also serve as content marketing.
- Ensure these pages are structured for maximum link appeal (comprehensive, unique data, shareable format).

### Acceptance Criteria
- 5+ referring domains within 3 months.
- Daikin dealer directory link acquired.
- 1+ local press mention.
- 2+ B2B partner reciprocal links.

---

## 5.6 Social Media Foundation

**Problem:** No active social presence.
**Requirement source:** GEO PDF — Platform Optimization; SEO PDF — sameAs signals.

### Tasks (External)
- Create Facebook business page (with same NAP).
- Create Instagram business account (visual: installation photos, before/after).
- Post 1–2 times per week (share blog posts, project photos, tips, seasonal content).
- Link social profiles from site footer.

### Code Changes Required
- Add Facebook and Instagram URLs to `sameAs` in JSON-LD.
- Ensure footer social links section includes all active profiles.
- Add Open Graph and Twitter Card meta to any new pages.

### Acceptance Criteria
- Facebook and Instagram pages live with complete business info.
- sameAs array includes all social profile URLs.
- Footer has working social media links.

---

## Increment 05 Definition of Done
- [ ] Google Business Profile verified and 100% complete
- [ ] LinkedIn company page live
- [ ] Minimum 8 directory citations with consistent NAP
- [ ] Review collection process documented and active
- [ ] 5+ Google Reviews acquired (initial target)
- [ ] sameAs arrays updated across all JSON-LD schemas
- [ ] Footer social links section complete
- [ ] First backlink acquisition efforts underway
- [ ] Facebook and Instagram pages created
- [ ] All external profile URLs documented in a reference list
