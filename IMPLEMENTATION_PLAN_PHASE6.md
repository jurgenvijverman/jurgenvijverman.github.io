# Implementation Plan — Phase 6: Quality review response

A focused content & language pass to fix the four issues called out in the second quality review:

1. **Founding-date inconsistency** — current copy claims "since 2013" + 100 years' experience + 3,500+ customers; reality is **founded in 2024**.
2. **Testimonials are not real** — every quoted customer (Peter D., Aalst; the implied gezin/koppel cases in portfolio; etc.) needs to be removed or relabelled "voorbeeldsituatie".
3. **Unverifiable certification claims** — Daikin D1+, KVB, VEA Erkenning are **not documented**, so they go.
4. **Inconsistent Dutch language quality** — HQ → thuisbasis, KMO → kmo, Daikin airco → Daikin-airco, Onze Diensten → Onze diensten, lucht/lucht → lucht-lucht, etc.

---

## Anchoring decisions (already resolved)

| Decision | Choice | Source |
|---|---|---|
| Brand age | **Founded in 2024** | Quality review section 1 + user confirmation |
| Testimonials | **All currently displayed are fake** — remove or relabel as "voorbeeldsituatie" | User explicit instruction at the top of the review |
| Certifications | **None of D1+/KVB/VEA are documented** — replace with generic "geschoolde HVAC-specialisten" wording | User answered "None are documented yet" |
| Team size | **2–3 people, but never name a number** — use "compact gespecialiseerd team" | User answered "2–3 people"; review section 5.8 advises against exact figure |
| Brand line | The review's section 16 recommended line is the canonical brand summary | Review section 16 |

---

## Verified findings (counted in the actual repo on 2026-05-03)

| Item | Where | Action |
|---|---|---|
| `"foundingDate": "2013"` in JSON-LD | `over-ons.html` (1×) | → `"2024"` |
| "Sinds 2013" / "In 2013" body copy | `over-ons.html` (3×) | Rewrite hero + ons-verhaal |
| "meer dan tien jaar ervaring" / "10 jaar" | `over-ons.html` (4×) | Remove |
| "3.500+ tevreden klanten" | `over-ons.html` (1×) | Remove — replace with value-based stats |
| "1.250+ installaties" | `over-ons.html` (1×) | Remove |
| "vijf gekwalificeerde / vijf HVAC-professionals" | `over-ons.html` (2×) | Remove — generic team description |
| "100 jaren HVAC-ervaring" | `over-ons.html` (1×) | Remove |
| "honderden airco's" | `airco.html` (1×) | Soften per review section 8.7 |
| Peter D. testimonial | `airco.html` (1×) | Remove or relabel "voorbeeldsituatie" |
| **HQ** (English) | **13 files, 15 occurrences** | → `thuisbasis` site-wide |
| `warranty` (English) | `over-ons.html` (1×) | → `garantie` |
| `state-of-the-art` | `over-ons.html` (1×) | → `actuele / moderne` |
| `KMO's` (caps) | `airco.html` (3×) | → `kmo's` |
| Title-case headings ("Onze Diensten" etc.) | `index.html` + `over-ons.html` (7×) | → sentence case |
| `Daikin Specialist` (capital S) | 3 files | → `Daikin-specialist` |
| Daikin D1+ / KVB / VEA mentions | `index.html` + `over-ons.html` (12×) | Replace with generic "geschoolde HVAC-specialisten" wording |
| `Daikin airco` (no hyphen) | 13 files (48×) | → `Daikin-airco` |
| `Daikin warmtepomp` (no hyphen) | 4 files (5×) | → `Daikin-warmtepomp` |
| `airco installatie` (no hyphen) | 9 files (36×) | → `airco-installatie` |
| `warmtepomp installatie` (no hyphen) | 7 files (8×) | → `warmtepompinstallatie` |
| `lucht/lucht` (slash) | 10 files (74×) | → `lucht-lucht` |
| `lucht/water` (slash) | 11 files (94×) | → `lucht-water` |
| `split airco` (no hyphen) | 6 files (29×) | → `split-airco` |
| `multisplit airco` (no hyphen) | 9 files (32×) | → `multisplit-airco` |
| `Openingstijden` (NL-NL) | `contact.html` (1×) | → `Openingsuren` (NL-BE) |
| Stale "since 2013" `foundingDate` | `over-ons.html` JSON-LD | → `"2024"` |

---

## Phase 6.0 — Inventory checklist (already done)

The grep above is the inventory. Move directly to execution.

---

## Phase 6.1 — Rewrite `over-ons.html` end-to-end (HIGHEST PRIORITY)

The single biggest credibility issue. Every section gets new copy.

### 6.1.a Update JSON-LD `Person.hasCredential`
The Person schema for the founder lists three EducationalOccupationalCredentials we cannot back up. Replace the `hasCredential` array with:

```json
"hasCredential": [],
"description": "Oprichter en hoofdtechnicus van AVYclima, gespecialiseerd in Daikin-airco's en warmtepompen voor woningen en kmo's in de regio Aalst, Denderleeuw en Ninove."
```

Or remove `hasCredential` entirely. The `knowsAbout` array can stay since it's claim-free ("Daikin", "HVAC", "Air Conditioning", etc.).

### 6.1.b Update `Organization.foundingDate`
- `"foundingDate": "2013"` → `"foundingDate": "2024"`
- Remove `"description"` mentions of "10 jaar ervaring" or similar.

### 6.1.c Replace page hero
```
H1:  "Over AVYclima"
Lead: "Een jong HVAC-bedrijf uit Denderleeuw, opgericht in 2024,
       met focus op Daikin-airco's en warmtepompen, technische
       kwaliteit en verzorgde uitvoering."
```

### 6.1.d Replace "Ons verhaal" section
Use the review's section 5.3 ready-to-paste HTML verbatim. Three paragraphs:
1. AVYclima werd opgericht in 2024 vanuit een duidelijke overtuiging…
2. We willen het anders doen dan de snelle standaardaanpak…
3. Vanuit Denderleeuw werken we vooral in Aalst, Denderleeuw, Ninove…

### 6.1.e Replace "Waarom Daikin?" section
Per review section 5.4 — drop "warranty" (English), make claim less absolute.

### 6.1.f Replace "Onze aanpak" section
Per review section 5.5 — drops the typo phrase "standaard-afstrijfjassen".

### 6.1.g Replace stats cards
Per review section 5.6 — three cards: **2024** (Opgericht), **Daikin** (Specialisatie), **Regio** (Aalst, Denderleeuw, Ninove). No bogus numbers.

### 6.1.h Replace certifications section
Per review section 5.7 — three cards: Daikin-specialisatie / Koeltechnische kennis / Correcte dimensionering. **No specific certificate names.**

### 6.1.i Replace team section
Per review section 5.8 — generic "compact gespecialiseerd team". No headcount.

### 6.1.j Replace values section
Per review section 5.9 — four values: Technisch correct advies / Verzorgde afwerking / Stipte uitvoering / Persoonlijke opvolging.

### 6.1.k Add "Werkgebied" + CTA sections
Per review section 13's draft copy.

**Exit criteria for 6.1:**
- `grep -c '2013\|3500\|3\.500\|1250\|1\.250\|vijf gekwalificeerde\|100 jaren'` on `over-ons.html` returns **0**.
- `"foundingDate": "2024"` is in the Organization JSON-LD.
- A read-through by Jurgen confirms the page sounds like a 2024-founded company.

---

## Phase 6.2 — Site-wide language consistency (mechanical)

Pure search-and-replace, runnable as one script. Not creative work.

| # | Find | Replace | Notes |
|---|---|---|---|
| 1 | `\bHQ\b` | `thuisbasis` | 15 instances across 13 files. Many are mine from Phase 2 ("vanuit onze HQ"). |
| 2 | `\bKMO['']?s\b` | `kmo's` | 3 instances in `airco.html` |
| 3 | `Daikin Specialist` | `Daikin-specialist` | 3 instances |
| 4 | `Daikin Installateur` | `Daikin-installateur` | per review style guide |
| 5 | `Daikin airco` | `Daikin-airco` | 48 instances, 13 files |
| 6 | `Daikin warmtepomp` | `Daikin-warmtepomp` | 5 instances, 4 files |
| 7 | `airco installatie` | `airco-installatie` | 36 instances, 9 files |
| 8 | `warmtepomp installatie` | `warmtepompinstallatie` | 8 instances, 7 files |
| 9 | `\bsplit airco` | `split-airco` | 29 instances, 6 files |
| 10 | `\bmultisplit airco` | `multisplit-airco` | 32 instances, 9 files |
| 11 | `lucht/lucht` | `lucht-lucht` | 74 instances, 10 files |
| 12 | `lucht/water` | `lucht-water` | 94 instances, 11 files |
| 13 | `lucht/lucht systemen` (already covered by 11) | — | — |
| 14 | `Openingstijden` | `Openingsuren` | 1 instance, `contact.html` |
| 15 | `Maandag t/m vrijdag` | `Maandag t.e.m. vrijdag` | 1 instance, `contact.html` |
| 16 | `\bwarranty\b` | `garantie` | 1 instance, `over-ons.html` |
| 17 | `state-of-the-art` | `actuele` | 1 instance, `over-ons.html` |
| 18 | `zone-control` | `zoneregeling` | check across files |
| 19 | `customer service` | `klantenservice` | check across files |

Risk: regex on `lucht/lucht` could match URLs or file paths — restrict to body text only (skip `<script>`/`<style>` blocks). Also note that JSON-LD `text` fields contain prose so they should be updated too — those need careful handling because they're inside `<script>` tags.

**One safer approach:** apply the substitutions in a Python script that:
- Splits each file into `<script type="application/ld+json">` blocks vs everything else.
- Applies prose substitutions to BOTH (because acceptedAnswer.text is customer-facing).
- Skips other `<script>`/`<style>` blocks.
- Validates that all 88 JSON-LD blocks still parse after the edits.

### Title-case headings → sentence case (10–15 instances)

| Find | Replace |
|---|---|
| `>Onze Diensten<` | `>Onze diensten<` |
| `>Ons Werkgebied<` | `>Ons werkgebied<` |
| `>Veelgestelde Vragen<` | `>Veelgestelde vragen<` |
| `>Persoonlijk Advies<` | `>Persoonlijk advies<` |
| `>Volledige Service<` | `>Volledige service<` |
| `>Daikin Specialist<` | `>Daikin-specialist<` |
| `>Certificaten & Erkenningen<` | `>Kennis en specialisatie<` |
| `>Ons Team<` | `>Ons team<` |
| `>Onze Waarden<` | `>Waar AVYclima voor staat<` |

**Exit criteria for 6.2:**
- Zero matches for the "find" column patterns above.
- `python3 scripts/site_qa.py` exit 0 after the edits.

---

## Phase 6.3 — Remove fake testimonials site-wide

### 6.3.a `airco.html` Peter D. testimonial
Per review section 8.8 — replace the testimonial section entirely with the "Voorbeeldsituatie: airco in een slaapkamer" block from review section 6 / option B.

### 6.3.b `portfolio.html` outcome claims
Per review section 10:
- Card 1 (Aalst rijwoning) — replace with the recommended copy
- Card 2 (Denderleeuw renovatie) — replace
- Card 3 (Ninove kantoor) — replace, drop "Productiviteit verbeterd, werknemers tevreden" claim

### 6.3.c Portfolio entry pages
The three `portfolio/*.html` pages also have customer-case framing. Add a "Voorbeeldproject" disclaimer at the top of each (or replace all customer-attribution language with method-explanation language).

### 6.3.d Section title rules
Per review section 14 — adopt the labels:
- `Voorbeeldsituatie` (not testimonial)
- `Typische klantvraag` (not "Wat klanten zeggen")
- `Voorbeeldproject` (not "Realisatie")

Apply across portfolio pages, blog posts, and any city pages that still use case-study framing.

**Exit criteria for 6.3:**
- Zero named-customer attribution (`— Naam X., Stad`) anywhere.
- All `<cite>`/testimonial markup is either removed or labelled as illustration.
- The QA script gets a new check: "named-testimonial guard" that fails on any `<cite>` containing a first-name + initial pattern.

---

## Phase 6.4 — Update homepage trust block + CTAs

### 6.4.a Soften the certifications card
Currently: `"Erkende installateurs met de juiste certificaten — Daikin D1+ Installer, Koeltechnisch Bekwaamheidscertificaat (KVB) en VEA Erkenning."`

Replace with the review's section 4.5 wording:
> "AVYclima is een jong bedrijf, maar onze technische lat ligt hoog. We werken met geschoolde installateurs die vertrouwd zijn met Daikin-systemen, koeltechniek en energiezuinige HVAC-oplossingen. We blijven bijscholen omdat de techniek blijft evolueren."

### 6.4.b Fix the "Perfecte afwerking" copy
Per review section 4.6 — replace the "alsof we er nooit gewerkt hadden" line with the more concrete "leidingtrajecten / units / werf netjes" version.

### 6.4.c Smooth the "Stipte opvolging en nazorg" copy
Per review section 4.7.

### 6.4.d Fix homepage service cards
Per review section 4.3 — three cards (warmtepomp / airco / onderhoud) get tighter, less-salesy descriptions.

### 6.4.e Fix process section copy
Per review section 4.4 — four process steps get sharper rewrites.

### 6.4.f Fix "Onze regio" Denderleeuw card
Per review section 4.1 — replace `"Onze HQ. Centrum, Iddergem en Welle..."` with `"Onze thuisbasis. Korte aanrijtijden voor klanten in Denderleeuw, Iddergem, Welle en omgeving."`

---

## Phase 6.5 — `contact.html` polish

Per review section 7:
- Title + meta description: tighten per 7.1
- Hero subtitle: per 7.2
- Form intro: per 7.3 — softens "we plannen zo snel mogelijk een plaatsbezoek" to "indien nodig"
- Bericht placeholder: per 7.4
- `Openingstijden` → `Openingsuren`, `t/m` → `t.e.m.`
- "Why AVYclima" block: replace 6 USP cards per 7.6 (drop "Meer dan tien jaar expert kennis" / "verplichte verkoop" / "uw partner op lange termijn" wording)

---

## Phase 6.6 — `airco.html` polish

Per review section 8:
- Hero rewrite per 8.1
- First paragraph per 8.2
- Bullet corrections per 8.3 (`KMO's` → `kmo's`, `horeca-zaken` → `horecazaken`, etc.)
- Single-split section per 8.4
- Multisplit section per 8.5
- Airco-as-heating section per 8.6
- "Honderden airco's" claim softened per 8.7
- Testimonial removed per 8.8 (also covered in 6.3.a)

---

## Phase 6.7 — `warmtepomp.html` polish

Per review section 9:
- Apply hyphenation (lucht-lucht / lucht-water) consistently — overlaps with 6.2 #11+#12
- Rewrite "doorlopend voor capaciteit gestraft" per 9.2
- De-specify "Daikin Altherma 3 H HT" to "een Daikin Altherma-systeem" per 9.3
- Smooth "Geen offerte zonder…" per 9.4
- Soften FAQ "40-50 dB" claim per 9.5

---

## Phase 6.8 — Portfolio page polish

Per review section 10 (overlaps with 6.3.b):
- Intro paragraph per 10's "Proposed portfolio intro"
- Three card rewrites per 10's "Proposed card rewrites"
- All three explicitly labelled as `Voorbeeldproject` (since they're not real)

---

## Phase 6.9 — Footer site-wide

Per review section 12.3 — update the footer about-text on all 32 canonical-chrome pages:
> Old: `"Daikin specialist voor airconditioning en warmtepompen in de regio Aalst, Denderleeuw en Ninove. Advies, installatie, onderhoud en herstellingen."`
>
> New: `"Daikin-specialist voor airco's en warmtepompen in Aalst, Denderleeuw en Ninove. Advies, plaatsing, onderhoud en herstellingen."`

(Note the hyphen on "Daikin-specialist" and the simpler "airco's" instead of "airconditioning".)

---

## Phase 6.10 — Update QA script + skill docs

### 6.10.a Add new checks to `scripts/site_qa.py`

Three new blacklist categories:

```python
# Add to TYPO_BLACKLIST:
"HQ"                    # English — should be "thuisbasis"
"warranty"              # English — should be "garantie"
"state-of-the-art"      # English — should be "actuele"
"3.500+"                # fake customer count
"1.250+"                # fake installation count
"meer dan tien jaar"    # contradicts 2024 founding
"meer dan 10 jaar"
"vijf gekwalificeerde"  # specific team-size claim
"vijf HVAC-professionals"
"Sinds 2013"
"In 2013"
"100 jaren"

# New pattern category — UNVERIFIED_CERT_BLACKLIST:
"Daikin D1+ Installer"
"Koeltechnisch Bekwaamheidscertificaat"
"VEA Erkenning"
"VEA erkenning"

# New pattern category — STYLE_BLACKLIST (with regex):
r"\bKMO['']?s\b"           # should be lowercase kmo's
r"Daikin Specialist"       # should be Daikin-specialist
r"Daikin airco\b"          # missing hyphen
r"Daikin warmtepomp\b"     # missing hyphen
r"\bairco installatie\b"   # missing hyphen
r"\bwarmtepomp installatie\b"
r"\blucht/lucht"           # should be lucht-lucht
r"\blucht/water"           # should be lucht-water
r"\bsplit airco\b"
r"\bmultisplit airco\b"
r"Openingstijden"          # NL-NL — use Openingsuren

# New check — NAMED_TESTIMONIAL_GUARD:
r'<cite>[^<]*[A-Z]\.[^<]*</cite>'   # any <cite> containing a name+initial
```

The named-testimonial guard fails on patterns like `<cite>— Peter D., Aalst</cite>`. Real testimonials (when added later) can use a different markup pattern (e.g. `data-real="true"` attribute) or be added to the existing waivers system.

### 6.10.b Update `brand-identity.md` and `known-issues.md`
- `brand-identity.md`: nothing structural to change (the Phase 4 close-out is still valid). Add a brief "language style" callout pointing at the QA script's STYLE_BLACKLIST.
- `known-issues.md`: close items related to Phase 6 work (testimonials, founding date, certifications); add new items if any drift surfaces during execution.

### 6.10.c Update `IMPLEMENTATION_PLAN.md`
Add a "Phase 6" close-out entry to the implementation-plan summary table.

---

## Phase 6.11 — Verify

1. Run `python3 scripts/site_qa.py` — exit 0 expected.
2. Eyeball `over-ons.html`, `index.html` trust block, `airco.html`, `contact.html`, `portfolio.html` in a browser.
3. Run Google Rich Results Test on `over-ons.html` to confirm the new schema parses (especially the empty `hasCredential` and updated `foundingDate`).
4. Bump `sitemap.xml` `lastmod` for every touched file.
5. Smoke-check the `Person` schema renders correctly.
6. Confirm no Plausible script regressions (Phase 5 work shouldn't be impacted).

---

## Decisions still open (low-blocker)

1. **Founder name in `Person` schema** — currently "Arne Vijverman" with `jobTitle: "Oprichter & Hoofdtechnicus"`. Confirm this is correct. Anything else (jobTitle wording, second person to add, etc.) would need a separate update.
2. **Portfolio cards: real or illustrative?** — review explicitly says don't mix labels. If any of the three (Aalst rijwoning, Denderleeuw renovatie, Ninove kantoor) are based on a real project, label them "Realisatie" with first-name + initial + city. If none are, all three become "Voorbeeldproject". **Default assumption: all illustrative** (matching the testimonial answer).
3. **`Voorbeeld` blog photos placeholder** — `og:image` per blog post is still the global `og-image.jpg`. Not a Phase 6 issue; tracked under known-issues.md #11.

---

## Out of scope for Phase 6 (deliberately deferred)

- The four drifted blog posts (`onderhoud-airco-wanneer.html`, `prijs-airco-installatie.html`, `split-vs-multisplit.html`, `warmtepomp-renovatie.html`) still have non-canonical chrome. Tracked as known-issues #19. Phase 6 will apply the language fixes to them via the bulk substitution but won't restructure the chrome.
- `blog/airco-als-verwarming.html` content debt (informal "je" voice throughout) is still waivered in `scripts/site_qa.py`. Full rewrite remains a separate content task.
- Real photos of installations (replacing the existing `images/installations/` working-source captions). Comes when real projects are documented and consented.

---

## Effort summary

| Sub-phase | Effort | Files touched | Risk |
|---|---|---|---|
| 6.1 over-ons rewrite | 2 hours | 1 (over-ons.html) | Low — content rewrite |
| 6.2 site-wide language substitutions | 1 hour | 36 (all HTML) | Medium — many regex; needs JSON-LD-safe script |
| 6.3 Remove fake testimonials | 30 min | airco.html, portfolio.html, 3× portfolio/* | Low |
| 6.4 Homepage trust block + CTAs | 30 min | index.html | Low |
| 6.5 contact.html polish | 30 min | contact.html | Low |
| 6.6 airco.html polish | 1 hour | airco.html | Low |
| 6.7 warmtepomp.html polish | 30 min | warmtepomp.html | Low |
| 6.8 portfolio.html polish | 30 min | portfolio.html | Low |
| 6.9 footer standardization | 15 min | 32 HTML files | Mechanical |
| 6.10 QA script + skill docs | 1 hour | scripts/site_qa.py, 2× skill md, IMPLEMENTATION_PLAN.md | Low |
| 6.11 verify | 30 min | — | — |
| **Total** | **~8 hours** | **all HTML + tooling** | **Mostly low-risk** |

Compressible to one focused day.

---

## Execution order (recommended)

1. **6.10.a first** — add the new blacklist entries to `site_qa.py` so we can see what the QA caught at every step. This drives the rest.
2. **6.2 next** — site-wide language substitutions clear out the bulk of the violations in one pass. After this, the QA output becomes manageable.
3. **6.3** — strip fake testimonials, set the labelling convention.
4. **6.1** — over-ons rewrite (the biggest single-file change).
5. **6.4 → 6.8** — per-page polish on the remaining canonical pages.
6. **6.9** — footer site-wide.
7. **6.10.b–c** — close out skill docs.
8. **6.11** — final QA + sitemap bump.

Order matters because 6.2 (bulk substitutions) will touch the same files as 6.4–6.8. Doing 6.2 first means each per-page polish step starts from a cleaner baseline.

---

## Brand line for everywhere it's needed

> **AVYclima is een jong HVAC-bedrijf uit Denderleeuw, opgericht in 2024. We installeren en onderhouden Daikin-airco's en warmtepompen in Aalst, Denderleeuw en Ninove, met technisch onderbouwd advies, stipte uitvoering en een verzorgde afwerking.**

Use this on the homepage hero intro, over-ons hero lead, and the contact-page meta description. Keeping one canonical sentence makes the brand voice instantly recognizable.
