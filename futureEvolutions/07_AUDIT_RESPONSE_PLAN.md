# Increment 07–12 — Response to ChatGPT SEO Audit (May 2026)

**Source:** `SEO and Lead Generation Audit for avyclima.be` (uploaded 2026-05-07)
**Approach:** Cross-checked every audit finding against the live codebase before deciding what to act on. The audit was a public-data review, so a number of its findings were already resolved in Phases 1–6 (commits up to `d032518`). Only the still-relevant items appear in the increments below.

---

## 1. Audit relevance assessment

### 1.1 Already done (audit is stale on these — ignore)

| Audit finding | Current state |
|---|---|
| Inconsistent phone numbers | Single canonical `+32 472 65 76 47` across HTML + JSON-LD + `tel:` links |
| Missing privacy policy | `privacy.html` live, dated 2026-04-09, GDPR-compliant |
| Form has no backend | Posts to `https://formsubmit.co/info@avyclima.be` with honeypot + captcha |
| `warmtepomp-aalst.html`, `warmtepomp-denderleeuw.html` may not exist | Both live, canonical-tagged, internally linked from `werkgebied.html`, in sitemap |
| Sitemap stale / incomplete | `sitemap.xml` lists all 22 city/service/portfolio/blog pages, `lastmod=2026-05-03` |
| No structured data on service pages | `airco.html`, `warmtepomp.html`, `onderhoud.html` all carry `Service` + `BreadcrumbList` + `HVACBusiness/LocalBusiness` |
| No `og-image`, `llms.txt`, hreflang | All present (hreflang `nl-BE` + `x-default`) |

### 1.2 Still relevant (act on these)

1. **Street-level NAP unresolved.** Footer + JSON-LD show `9470 Denderleeuw` only. Public records (Companyweb, Gouden Gids) show `Parochiestraat 48, 9472 Denderleeuw`. Audit cites this as the single biggest local-SEO weakness.
2. **Founding-date contradiction.** `llms.txt` line 3 says "Opgericht in 2013" but `over-ons.html` says 2024 and Phase 6 commit message confirms "founding-date 2024".
3. **Portfolio is explicitly labeled illustrative.** All three project pages contain "Voorbeeldproject — illustratief." Audit flags this as a major proof gap.
4. **Plausible-only analytics.** No GA4 / GTM / Google Consent Mode. Fine for cookieless reporting, but blocks Google Ads / Local Services Ads conversion import.
5. **Thin blog cluster** (5 posts). Audit suggests 12 commercially-adjacent topics tied to local + persona intent.
6. **No visible reviews / social proof** anywhere on the site.
7. **Stat claims (3500+ klanten, 1250+ installaties) on over-ons.html** — if these aren't really true for the 2024-founded BV, they're a trust risk and contradict the "young installer" positioning.
8. **External authority** (Daikin dealer locator, RESCert, Homeproved, Trustpilot) — not yet pursued.

### 1.3 Explicitly skipping (and why)

| Audit recommendation | Why we're not doing it |
|---|---|
| Hub-and-spoke folder restructure (`/warmtepompen/`, `/airco/`, …) | Flat URLs work fine for SEO. Restructure means ~30 redirects, breaks all inbound links and internal anchors until updated, and the upside is marginal at this site size. Reconsider only if migrating off static HTML. |
| FAQ schema as a traffic lever | Audit itself notes FAQ rich results are now restricted to gov/health sites. Existing `FAQPage` schema on `faq.html` is fine; don't expand expecting SERP wins. |
| French-language expansion + `fr-BE` hreflang | Audit explicitly defers this. Service area is Dutch-speaking East Flanders. |
| Mass blog production | Audit favours quality over cadence. We're capping at the 12 specific topics it lists. |

---

## 2. Incremental plan

Each increment ends with concrete acceptance criteria. Stop after each one to validate before starting the next.

### Increment 07 — Trust cleanup (1–2 days)

The cheapest, fastest wins. Do first.

**07.1 Reconcile founding date**
- Update `llms.txt` line 3: "Opgericht in 2013" → "Opgericht in 2024"
- Bump footer copyright across all pages: `© 2024 AVYclima` → `© 2026 AVYclima` (it is May 2026)

**07.2 Reconcile address** *(decision required — see §3.1)*
- If publishing street: update `over-ons.html`, `contact.html`, all footers, all JSON-LD `PostalAddress` blocks (`streetAddress`, `postalCode`, `addressLocality`, `addressCountry`)
- If staying service-area-only: pick one postal code (9470 vs 9472) and use it consistently; update directory listings to match

**07.3 Reconcile stat claims**
- Replace `3500+ tevreden klanten` / `1250+ installaties` on `over-ons.html` with honest numbers, or remove until accurate. Phase 6 already removed fake testimonials; this is the same hygiene.

**07.4 Trigger recrawl**
- Update `<lastmod>` in sitemap.xml for any page touched
- Submit URL inspection in Search Console for `/`, `/over-ons.html`, `/contact.html`

**Acceptance:** `grep -rE "2013|3500|1250" *.html llms.txt` returns no contradictions. All addresses and copyright years are consistent.

---

### Increment 08 — Real proof & reviews (1–2 weeks)

**08.1 Resolve the portfolio framing** *(decision required — see §3.2)*
- Either: convert each `portfolio/*.html` into a real case study with photo, real municipality, system, duration, outcome (requires customer permission)
- Or: rebrand the section as "Hoe wij projecten aanpakken" and strip the "Voorbeeldproject — illustratief" lines so it stops reading as a fake portfolio

**08.2 Photo set**
- 5–10 real install photos: outdoor unit, indoor unit, controller, neat cable routing, before/after where possible
- 2–3 lines of story per project (system type, room/building, municipality, install time)

**08.3 Reviews block**
- New section on homepage and each service hub
- Source from Google Business Profile, Trustpilot, or Homeproved (real only)
- Add first-party `Review` schema; never fabricate

**Acceptance:** Grep across `portfolio/` for `voorbeeld|illustratief` returns zero hits. At least 3 real reviews displayed on the home + service hubs.

---

### Increment 09 — Measurement upgrade (½–1 day)

**Decision (2026-05-07): Path A — Plausible-only**, with Path B (GA4 + GTM + Consent Mode v2) deferred until a Google Ads or Local Services Ads campaign brief is on the table. GBP doesn't exist yet, so the LSA/Ads prerequisite chain hasn't started; layering GA4 in now would be setup cost for value that won't be drawn on for months. Trigger to revisit Path B: when paid acquisition is scoped, allowing ~30 days lead time for Smart Bidding conversion warm-up.

**09.1 Thank-you page**
- New `bedankt.html` with confirmation copy, expected response time, fallback phone CTA
- Configure Formsubmit `_next` field to redirect to it
- Fire `form_submit_success` event only on this page (not in JS handler)

**09.2 Event spec (both paths)**
- `phone_click`, `email_click`, `lead_form_start`, `lead_form_submit`, `thank_you_view`, `file_download`
- Mark `lead_form_submit` and `thank_you_view` as Key events (GA4) or `Lead` goal (Plausible)

**09.3 Path B only**
- GA4 property + GTM container
- Google Consent Mode v2: defaults to `denied` for `analytics_storage` and `ad_storage`; existing cookie banner pushes `consent` updates
- Import conversions into Google Ads (precondition for LSA)

**Acceptance:** A real form submission shows up as a single Key event in the chosen analytics tool. Thank-you page exists at a stable URL.

---

### Increment 10 — Topical content expansion (3–6 weeks)

Adopt the audit's twelve content angles in two waves.

**Wave 1 (weeks 1–3) — buyer intent & subsidies**
1. Warmtepomp premie Vlaanderen 2026 — stappenplan per type woning
2. Hoeveel kost een warmtepomp installatie?
3. Welke warmtepomp bij renovatie met radiatoren?
4. Airco in de slaapkamer: geluid, plaatsing, verbruik

**Wave 2 (weeks 4–6) — practical & comparison**
5. Buitenunit plaatsen zonder burenhinder
6. Split vs multisplit in een halfopen woning
7. Daikin Altherma voor renovatie: wanneer zinvol?
8. Checklist vóór het plaatsbezoek

Remaining four (Aalst rijwoning, Denderleeuw renovatie, Ninove kantoor, airco-of-warmtepomp-bijverwarming) deferred to Increment 13+ at monthly cadence.

**10.x Internal linking**
- Each post links to relevant city pages and service hub
- Each city page gets a "Recente artikelen" block
- Each service hub gets a "Veelgestelde vragen & gidsen" block

**Acceptance:** 8 new posts live (~1,200–1,600 words each), all with bidirectional internal links to city + service pages, sitemap updated.

---

### Increment 11 — Conversion polish (1–2 weeks)

**11.1 Sticky mobile CTA bar** — bottom-fixed below 768px with "Bel nu" + "Vraag offerte"; hidden on `contact.html` and `bedankt.html`.
**11.2 Two-step form on mobile** — step 1: name, phone, service, postcode. Step 2 (revealed after step 1): property type, project type, message. Lead quality preserved, perceived length halved.
**11.3 Trust strip above the form** — three icons: "Daikin specialist" / "Lokaal team in Denderleeuw" / "Gratis plaatsbezoek".

**Acceptance:** Mobile contact-page conversion (event from Inc. 09) improves over a 2-week pre/post comparison.

---

### Increment 12 — Authority & citations (rolling, 4–8 weeks)

Mostly external. Existing `05_AUTHORITY_AND_EXTERNAL.md` covers the broad picture; the audit-driven additions are:

- Submit to Daikin BE dealer locator (`daikin.be/nl_be/dealerlocator.html`)
- RESCert installer profile (if eligible — check criteria first)
- Cleanup pass on Companyweb / Gouden Gids / Kompass so external NAP exactly matches the site after Inc. 07
- Homeproved + Trustpilot review acquisition flow (Inc. 08 makes the on-site display ready)

**Acceptance:** ≥3 high-signal external citations match site NAP exactly, ≥10 verified reviews across one or more platforms.

---

## 3. Decisions you need to make before Inc 07/08/09

### 3.1 Address visibility (blocks Inc 07.2)
- **A.** Publish full street address (Parochiestraat 48, 9472 Denderleeuw) — strongest local-SEO signal, audit-recommended
- **B.** Stay service-area-only with city + postal — simpler if you don't want walk-ins, but pick 9470 *or* 9472 and align everywhere

### 3.2 Portfolio framing (blocks Inc 08.1)
- **A.** I have real completed installs and customer permission → convert to real case studies
- **B.** Not yet → rebrand the section as "Hoe wij werken" and strip illustrative language

### 3.3 Analytics direction (blocks Inc 09)
- **A.** Stay on Plausible only → cookieless, GDPR-easy, but no Google Ads conversion import
- **B.** Add GA4 + GTM + Consent Mode v2 alongside Plausible → +2–3 days work, but unlocks Google Ads / Local Services Ads conversion bidding

---

## 4. Sequencing

```
Inc 07 (1–2d)  ──┐
                 ├──→ Inc 09 (3–5d)
Inc 08 (1–2w)  ──┘            │
                              ▼
                  Inc 10 (3–6w) ──┐
                                  ├──→ Inc 11 (1–2w)
                  Inc 12 (rolling)┘
```

Inc 07 has zero dependencies — ship it first, validate, then move on. Inc 08 and Inc 09 can run in parallel. Inc 10 depends on Inc 09 (so the new posts produce measurable conversions). Inc 11 depends on Inc 09 (need the events to A/B test). Inc 12 is rolling and can start any time after Inc 07 finishes (NAP needs to be stable before pushing it to external directories).
