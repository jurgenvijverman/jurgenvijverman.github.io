# AVYclima — Future Evolutions Roadmap

This folder contains the validation report and incremental spec documents for evolving the AVYclima website from its current state to full alignment with the SEO and GEO requirements defined in the `inspiration/` folder.

---

## Documents

| File | Description | Timeline |
|---|---|---|
| [00_VALIDATION_REPORT.md](00_VALIDATION_REPORT.md) | Gap analysis: current implementation vs. requirements | Baseline |
| [01_CRITICAL_FIXES.md](01_CRITICAL_FIXES.md) | Phone consistency, privacy policy, form backend, schema gaps, sitemap | Week 1 |
| [02_CONTENT_AND_TRUST.md](02_CONTENT_AND_TRUST.md) | Blog posts, testimonials, team info, portfolio, maps, images | Weeks 2–3 |
| [03_LOCAL_SEO_CITY_PAGES.md](03_LOCAL_SEO_CITY_PAGES.md) | 13+ city landing pages, service area hub, internal linking | Weeks 3–5 |
| [04_TECHNICAL_SEO_AND_GEO.md](04_TECHNICAL_SEO_AND_GEO.md) | llms.txt, hreflang, Core Web Vitals, schema audit, accessibility | Weeks 4–6 |
| [05_AUTHORITY_AND_EXTERNAL.md](05_AUTHORITY_AND_EXTERNAL.md) | GBP, LinkedIn, directory citations, reviews, backlinks, social | Weeks 6–10 |
| [06_ONGOING_CONTENT_STRATEGY.md](06_ONGOING_CONTENT_STRATEGY.md) | Blog calendar, seasonal strategy, analytics, resources, video | Months 2–6+ |

---

## Implementation Sequence

```
Increment 01 ─── Critical Fixes (IMMEDIATE)
     │
     ▼
Increment 02 ─── Content & Trust (SHORT TERM)
     │
     ├───────── Increment 03 ─── City Pages (can start in parallel with 02)
     │
     ▼
Increment 04 ─── Technical SEO & GEO
     │
     ▼
Increment 05 ─── Authority & External ──── (partially parallel with 03–04)
     │
     ▼
Increment 06 ─── Ongoing Content ────────── (continuous from month 2 onward)
```

Increment 01 is a hard prerequisite for all others (fixes broken foundations). Increments 02 and 03 can overlap. Increment 05 has external dependencies (GBP verification, directory approvals) so should be started early even if code changes come later.

---

## Current Implementation Score

| Category | Score | After Inc. 01 | After Inc. 03 | After Inc. 06 |
|---|---|---|---|---|
| Site Architecture | 70% | 70% | 95% | 95% |
| On-Page SEO | 85% | 90% | 95% | 95% |
| Structured Data | 60% | 80% | 90% | 95% |
| Content Depth | 70% | 70% | 85% | 95% |
| Technical SEO | 75% | 85% | 85% | 95% |
| Local SEO | 30% | 30% | 75% | 90% |
| Authority & Trust | 40% | 45% | 55% | 85% |
| **Overall** | **~60%** | **~67%** | **~83%** | **~93%** |

---

## Estimated Page Count Growth

| Milestone | Pages |
|---|---|
| Current | 8 |
| After Increment 02 | 17–20 (blog posts, portfolio, privacy) |
| After Increment 03 | 30–35 (city pages, werkgebied) |
| After Increment 06 | 45–50 (additional blog posts, resource pages) |
