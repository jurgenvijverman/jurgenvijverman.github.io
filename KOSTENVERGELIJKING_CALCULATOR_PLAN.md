# Implementation Plan — Pivot naar Kostenvergelijking-calculator

**Status:** Draft voor validatie • **Auteur:** Claude met input Jurgen Vijverman • **Datum:** 2026-05-25

---

## 1. Anchoring decisions

Deze beslissingen zijn met de eigenaar gevalideerd vóór dit plan en mogen niet stilzwijgend worden teruggedraaid. Wanneer een fase of taak in conflict komt met een van deze regels, eerst expliciet de wijziging bevragen.

1. **Framing.** De calculator presenteert primair een **operationele kostenvergelijking** (jaarkost-huidig vs jaarkost-met-warmtepomp + jaarbesparing + CO₂-besparing). Terugverdientijd en NPV blijven beschikbaar maar zijn verhuisd naar een **collapsed sectie "Investeringsperspectief"** onderaan.
2. **URL.** De pagina verhuist naar `/kostenvergelijking-warmtepomp.html`. De oude `/terugverdientijd-warmtepomp.html` wordt **verwijderd (404)** — geen redirect. Eventuele beta-testers die de oude URL nog open hebben, krijgen een nieuwe link.
3. **Aandeel-input.** Het aandeel van de verwarmingsbehoefte dat de warmtepomp overneemt wordt een **prominente slider in de snelle modus** met sensible defaults per type (lucht/water 100%, lucht/lucht 40%). Dit is de belangrijkste eerlijkheids-verbetering — voor lucht-lucht-installaties naast bestaande verwarming is 100%-aanname misleidend.
4. **Beta-gating blijft.** Dezelfde sleutel `?preview=avy2026` + localStorage + noindex + robots Disallow + niet-in-sitemap. Alleen het pad in de gate verandert mee.
5. **Rekenkern hergebruiken.** Geen rebuild. De huidige `terugverdientijd-core.js` wordt **uitgebreid**, niet vervangen. Module-bestandsnamen blijven (rename in latere cleanup-pass indien gewenst).
6. **CO₂-cijfers verdedigbaar.** Alle CO₂-factoren komen uit VEKA-VMM, CNC-NKC, of AIB-via-VREG (zie sectie 3). Geen "schatting" zonder bron-URL.

---

## 2. Wat verandert vs wat blijft

### Verandert
- **Hoofd-KPI's** in de UI: van 4 TVT/NPV-KPI's → 4 operationele KPI's (jaarkost-huidig, jaarkost-WP, jaarbesparing-€, CO₂-besparing-kg).
- **Hero-grafiek:** van "cumulatieve besparing 0-20 jaar met TVT-asymptoot" → **comparison-bar-chart** "Huidig vs Met warmtepomp" + cumulatieve besparing 10 jaar als secundaire grafiek.
- **Nieuwe input "aandeel-overname"** (0-100% slider) — prominent in snelle modus.
- **CO₂-berekening** toegevoegd aan de rekenkern.
- **TVT/NPV/investeringskost/BTW/premie-footnote** verhuizen naar een collapsed sectie onderaan (default dicht, info-buttons blijven werken).
- **Tekst en framing** — page title, h1, meta description, JSON-LD, info-panels.
- **URL** en alle interne verwijzingen naar de calculator (slechts: gate-script in nieuw bestand; oude bestand wordt verwijderd; site_qa.py SITEMAP_EXCLUDE-entry update).

### Blijft ongewijzigd
- Datamodel grotendeels — alleen 1 nieuwe input + 4 emissiefactoren in tariefblad.
- `terugverdientijd-core.js` math voor brandstofconversie, weersnormalisatie, SPF-toepassing, capaciteitstarief-delta, effectieve elektriciteitsprijs, scenario-multipliers, plausibility-warnings.
- Scenario-banden (voorzichtig / realistisch / optimistisch) — zelfde driedeling toegepast op de operationele KPI's.
- Glossarium-pagina (publiek) — krijgt 2-3 nieuwe termen ("Emissiefactor", "Aandeel verwarming"), bestaande structuur ongewijzigd.
- Beta-gating, contact-form-prefill, plausible events, FormSubmit-fallback, print-stylesheet.
- Tariefblad bron-discipline: alle nieuwe waarden krijgen `source_url`, `verified_date`, `verified_by`.

---

## 3. Verified findings — CO₂-emissiefactoren

Onderzoek 2026-05-25, primaire bron VEKA-VMM nota januari 2022 + CNC-NKC + AIB-2024.

| Brandstof | kg CO₂/kWh (finaal) | Primaire bron | Geldig sinds |
|---|---|---|---|
| Aardgas H-gas | **0,202** | [CNC-NKC technische nota aardgas (2021-11)](https://www.cnc-nkc.be/sites/default/files/meeting/files/nota_emissiefactor_aardgas_incl_aanvullingen_evolutie_co2_en_impact_-_goedgekeurd.pdf) | 2021 |
| Elektriciteit (BE residuele mix) | **0,132** | [AIB via VREG energieverbruik](https://www.vreg.be/nl/energieverbruik); waarde via [ENGIE Business 2024](https://business.engie.be/nl/faq/contract/co2-uitstoot/) | 2024 (jaarlijks geactualiseerd) |
| Mazout (extra-lichte stookolie) | **0,267** | [VEKA-VMM nota CO₂-factoren (jan 2022)](https://assets.vlaanderen.be/image/upload/v1667817909/2022-01-11_VEKA-VMM_nota_COW_emissiefactoren_en_soortelijk_gewicht_phgn1g.pdf) | 2022 |
| Propaan | **0,230** | [VEKA-VMM nota (jan 2022)](https://assets.vlaanderen.be/image/upload/v1667817909/2022-01-11_VEKA-VMM_nota_COW_emissiefactoren_en_soortelijk_gewicht_phgn1g.pdf) + IPCC default | 2022 |
| Pellets (EPB-conventie, biogeen) | **0,000** | VEKA EPB-methodologie | actueel |
| Pellets (levenscyclus, transport + productie) | **0,040** | [VITO pellets-studie](https://emis.vito.be/sites/emis.vito.be/files/pages/migrated/energietechnologie_anre_studie_pellets_volledig_rapport.pdf) | 2010+ |

**Beslissingen:**
- Voor de hoofd-CO₂-berekening gebruiken we de **EPB/verbrandings-factoren** (de getallen in de tabel hierboven). Dit is consistent met hoe Vlaamse instanties het rapporteren en is verdedigbaar.
- Pellets in v1: we tonen **0,040 kg/kWh** (levenscyclus) met info-tooltip die uitlegt dat EPB-conventie 0 hanteert. Reden: levenscyclus is eerlijker tegenover een warmtepomp-vergelijking (anders lijken pellets oneerlijk "perfect").
- Elektriciteits-factor wordt **jaarlijks vernieuwd** door AIB. We zetten een TODO in `tarieven-2026-screenshots/checked-by.md`: "vernieuw elek CO₂ rond eind juni 2026 wanneer AIB 2025-cijfer publiceert".

Geen waarde wordt zelf geïnterpoleerd of geschat. Alle cijfers staan in `data/vlaamse-tarieven-2026.json` onder een nieuwe `emission_factors_kg_co2_per_kwh` sleutel met `_source` en `_verified_date`.

---

## 4. Datamodel-veranderingen

### 4.1 Tariefblad (`data/vlaamse-tarieven-2026.json`)

Nieuwe top-level sleutel:

```json
{
  ...,
  "emission_factors_kg_co2_per_kwh": {
    "natural_gas_h": 0.202,
    "natural_gas_h_source": "https://www.cnc-nkc.be/.../nota_emissiefactor_aardgas...",
    "natural_gas_h_verified_date": "2026-05-25",
    "electricity_be_residual_mix": 0.132,
    "electricity_be_residual_mix_source": "https://www.vreg.be/nl/energieverbruik (AIB 2024)",
    "electricity_be_residual_mix_verified_date": "2026-05-25",
    "electricity_be_residual_mix_note": "Jaarlijks gepubliceerd door AIB rond eind mei/juni. Vernieuwen.",
    "fuel_oil": 0.267,
    "fuel_oil_source": "https://assets.vlaanderen.be/.../VEKA-VMM_nota_COW_emissiefactoren...",
    "fuel_oil_verified_date": "2026-05-25",
    "propane": 0.230,
    "propane_source": "https://assets.vlaanderen.be/.../VEKA-VMM_nota_COW_emissiefactoren...",
    "propane_verified_date": "2026-05-25",
    "pellets_lifecycle": 0.040,
    "pellets_lifecycle_source": "https://emis.vito.be/.../studie_pellets_volledig_rapport.pdf",
    "pellets_lifecycle_verified_date": "2026-05-25",
    "pellets_lifecycle_note": "Levenscyclus inclusief productie + transport. EPB-conventie hanteert 0 (biogeen)."
  }
}
```

Schema (`vlaamse-tarieven.schema.json`) krijgt overeenkomstige uitbreiding (required: alle 5 hoofd-getallen + source-URLs).

### 4.2 Input-uitbreiding

Eén nieuwe input toevoegen aan het input-object dat `calculate()` accepteert:

| Field | Type | Range | Default (snelle modus) |
|---|---|---|---|
| `heatpump_share` | number (0..1) | 0-1 | 1,0 als `hp_type == "lucht_water"`; 0,4 als `hp_type == "lucht_lucht"`; 1,0 als `replaces_existing_heating == true` (override) |

### 4.3 Rekenkern (`js/terugverdientijd-core.js`)

Twee nieuwe afgeleiden, beide pure functions:

```js
// Splits de totale nuttige warmte over warmtepomp + bestaand systeem
export function splitUsefulHeatByShare(usefulHeatKwh, heatpumpShare) {
  return {
    byHeatPump: usefulHeatKwh * heatpumpShare,
    byExisting: usefulHeatKwh * (1 - heatpumpShare),
  };
}

// CO₂-besparing per jaar
export function annualCo2Emissions(input, tariffs) {
  // co2_huidig = totale brandstof × emissionfactor_brandstof
  // co2_nieuw  = brandstof_resterend × emissionfactor_brandstof
  //            + elektriciteit_wp     × emissionfactor_elek
  // co2_savings = co2_huidig - co2_nieuw
  ...
}
```

`annualCosts()` wordt uitgebreid om partial-share te ondersteunen: wanneer `heatpump_share < 1`, blijft een fractie van de brandstofkost (en de bijhorende ketel-onderhoudskost) staan, en dragen alleen de WP-uren bij aan elektriciteitsverbruik + capaciteitstarief-delta.

### 4.4 Backwards compatibility

`calculate(input)` blijft hetzelfde signature aanvaarden. Wanneer `heatpump_share` ontbreekt, default = 1,0 (huidig gedrag). Zo blijft de bestaande unit-test suite werken; nieuwe tests voor partial-share worden apart toegevoegd.

---

## 5. UI-veranderingen

### 5.1 Hoofd-layout `kostenvergelijking-warmtepomp.html`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER + intro                                              │
├─────────────────────────────────────────────────────────────┤
│ SNELLE MODUS — inputs (6 velden)                            │
│  - Woningtype + bouwjaar                                    │
│  - Huidige brandstof + jaarverbruik                         │
│  - Warmtepomp-type (lucht/lucht / lucht/water / hybride)    │
│  - 🆕 Aandeel-overname slider 0-100%                        │
│  - 🆕 Vervangt bestaande verwarming? (toggle)               │
│  - Scenario-slider (voorzichtig / realistisch / optimistisch)│
│                                                             │
│  [Knop: Uitgebreide modus →]                                │
├─────────────────────────────────────────────────────────────┤
│ HOOFD-KPI's (4 cards, scenario-banden)                      │
│                                                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│ │ Huidig     │ │ Met WP     │ │ Besparing  │ │ CO₂ minder ││
│ │ €1.420/jr  │ │ €820/jr    │ │ €600/jr    │ │ 1.480 kg/jr││
│ │ (€1.300-   │ │ (€720-     │ │ (€470-     │ │ (1.280-    ││
│ │  1.560)    │ │  940)      │ │  720)      │ │  1.620)    ││
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘│
├─────────────────────────────────────────────────────────────┤
│ GRAFIEK — comparison-bar (huidig vs nieuw) + cumul 10 jr    │
├─────────────────────────────────────────────────────────────┤
│ INFO-CARDS — uitleg per veld + glossarium-links             │
├─────────────────────────────────────────────────────────────┤
│ ⬇ INVESTERINGSPERSPECTIEF (collapsed, klikken om te openen) │
│    Wanneer geopend:                                         │
│    - Bruto investeringskost-input (uitgebreide modus alleen)│
│    - BTW (logica blijft, info-button blijft)                │
│    - Premie-footnote (verwijst naar Mijn VerbouwPremie)     │
│    - TVT cash + TVT incrementeel KPI's                      │
│    - NPV 15 jaar KPI                                        │
│    - Cumulatieve-besparing-grafiek 0-20 jaar (oude versie)  │
├─────────────────────────────────────────────────────────────┤
│ "HOE LEES IK MIJN JAARAFREKENING" — SVG illustratie (blijft)│
├─────────────────────────────────────────────────────────────┤
│ PRINT-KNOP — afdrukbaar 1-2p A4 rapport                     │
├─────────────────────────────────────────────────────────────┤
│ CTA — Vraag een plaatsbezoek (prefill via contact-form)     │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Plausible-events update

Hernoemen + uitbreiding:

| Oude event | Nieuwe event | Wanneer |
|---|---|---|
| Calculator Started | Vergelijking Started | eerste field gewijzigd |
| Calculator Completed | Vergelijking Completed | eerste succesvolle berekening |
| Calculator Uitgebreid Geopend | Uitgebreide Modus Geopend | toggle |
| — (nieuw) | Investeringsperspectief Geopend | collapsed section opent |
| — (nieuw) | Aandeel Slider Gebruikt | slider value changed |
| Premie Simulator Click | Premie Simulator Click | unchanged (binnen invest-sectie) |

### 5.3 JSON-LD

- `WebApplication.name`: "Kostenvergelijking-calculator warmtepomp"
- `WebApplication.description`: "Vergelijk jaarlijkse verwarmingskost van een warmtepomp met uw huidige installatie. Gebaseerd op actuele Vlaamse tarieven (VREG, Fluvius) en officiële CO₂-factoren (VEKA-VMM, AIB)."
- `BreadcrumbList`: laatste item wordt "Kostenvergelijking warmtepomp" / URL `/kostenvergelijking-warmtepomp.html`
- `FAQPage`: bestaande FAQ-vragen blijven; voeg 2 toe ("Hoe bereken ik mijn CO₂-besparing?", "Wat betekent aandeel-overname?")

---

## 6. Faseplan

Vijf gefaseerde stappen met expliciete exit-criteria. Na elke fase wordt status gerapporteerd en validatie gevraagd voordat de volgende fase start.

### Fase 1 — Datamodel + rekenkern (1 dag)
- Voeg CO₂-emissiefactoren toe aan `data/vlaamse-tarieven-2026.json`
- Update `data/vlaamse-tarieven.schema.json` (5 required emission-factor velden + sources)
- Update `js/terugverdientijd-core.js`:
  - Nieuwe export `splitUsefulHeatByShare`
  - Nieuwe export `annualCo2Emissions`
  - `annualCosts()` aanpassen voor partial-share
  - `calculate()` accepteert `heatpump_share` (default 1.0)
- Update `scripts/test-terugverdientijd.mjs`:
  - Bestaande 18 tests blijven slagen (regression)
  - 6 nieuwe tests: split-share, CO₂-berekening, partial-share-kosten, default-share-per-type

**Exit:** alle (18 + 6) = 24 tests slagen.

### Fase 2 — Nieuwe pagina + UI (1 dag)
- Maak `kostenvergelijking-warmtepomp.html` (gekopieerd van bestaande, aangepast)
- Nieuwe titel, h1, meta-description, JSON-LD, breadcrumbs
- Gate-script identiek met SECRET ongewijzigd
- Snelle modus UI: heatpump_share slider toegevoegd met dynamische defaults
- Hoofd-KPI's herzien (4 nieuwe cards)
- Hero-grafiek: comparison-bar via SVG (gebruikt `renderGraph` van `terugverdientijd-view.js`)
- Investeringsperspectief-sectie collapsed met de oude TVT/NPV-KPI's en grafiek
- Update `js/terugverdientijd-view.js`: nieuwe `renderCostComparison()` functie
- Update `js/terugverdientijd.js`: heatpump_share state, default-resolution per WP-type
- CSS-blok in `css/style.css` voor de nieuwe layout (re-use `.calc-*` waar mogelijk)

**Exit:** lokale browse-test toont nieuwe KPI's correct, slider werkt, investeringsperspectief opent/sluit, scenario-banden tonen op alle KPI's.

### Fase 3 — Oude URL opruimen + sitewide updates (0,5 dag)
- Verwijder `terugverdientijd-warmtepomp.html` (404 voor oude beta-testers)
- Update `robots.txt`: Disallow oude → nieuwe pad
- Update `scripts/site_qa.py` `SITEMAP_EXCLUDE`: oude → nieuwe filename
- Glossarium-update: voeg 2 termen toe ("Emissiefactor", "Aandeel verwarming")
- llms.txt / llms-full.txt: blijven onveranderd (calculator is hidden)
- Sitemap.xml: ongewijzigd (calculator blijft eruit)

**Exit:** `python3 scripts/site_qa.py` → 18/18 checks pass; oude URL retourneert 404; gate-script werkt op nieuwe URL.

### Fase 4 — Bron-werkblad bijwerken (0,25 dag)
- Update `docs/tarieven-2026-screenshots/README.md`: nieuwe sectie "B14: CO₂-emissiefactoren"
- Update `docs/tarieven-2026-screenshots/checked-by.md`: sign-off voor 5 CO₂-bronnen
- TODO-flag: vernieuw elek CO₂ rond juni 2026 wanneer AIB 2025 publiceert

**Exit:** werkblad volledig, ondertekend, met links.

### Fase 5 — End-to-end test + lancering (0,5 dag)
- Browser-test in Chrome, Firefox, Safari (desktop + mobile)
- Lighthouse-score check ≥ 90 op performance, accessibility, best-practices, SEO
- Print-stylesheet test (1-2p A4)
- A11y: keyboard nav, screenreader test op de nieuwe KPI-cards
- Plausible-events firing check via DevTools console
- Beta-link delen met test-publiek

**Exit:** 0 console-errors, Lighthouse score behaald, gate-script gateway-test geslaagd.

---

## 7. Open vragen / aannames die nog gevalideerd moeten worden

Geen blokkerende vragen. Maar drie kleine keuzes die we tijdens fase 1 of 2 mogelijk willen heroverwegen:

1. **Pellets-CO₂ — EPB (0) of LCA (0,04)?** Mijn voorstel = 0,04 (levenscyclus, eerlijker vergelijken). Voorgesteld als info-tooltip die beide noemt. Bevestigen voor we het tariefblad afsluiten.
2. **Hybride warmtepomp default-share.** Een hybride systeem gebruikt typisch ~80-90% van de uren de warmtepomp en valt op koudste dagen terug op de ketel. Voorstel: default-share 0,85 voor `hp_type == "hybride"`. Geen externe bron, wel realistisch.
3. **Cumulatieve grafiek-horizon.** Hero-grafiek toont nu 10 jaar; investeringssectie behoudt 20 jaar. Volstaat dit, of liever 5 + 15? Mijn voorstel: 10 + 20 (intuïtief voor klanten, blijft 1-decade-eenheden).

Indien geen van deze drie commentaar krijgt, ga ik door met de hierboven voorgestelde defaults.

---

## 8. Buiten scope (expliciet)

- Geen herwerking van glossarium-stijl of -indeling, alleen 2 nieuwe termen toevoegen.
- Geen nieuwe blog-post die de calculator promoot. Calculator blijft beta tot Jurgen lanceert.
- Geen PV/zelfverbruik herziening — slider blijft zoals nu (0-50% in uitgebreide modus).
- Geen wijziging aan FormSubmit-fallback, contact-form-prefill, of beta-gating logica.
- Geen rename van JS-modulebestanden (`terugverdientijd-core.js` etc.). Cleanup-pass mogelijk later.
- Geen mobile-only redesign — bestaande responsive CSS volstaat met minimale tweaks.

---

## 9. Geschat tijdsbudget

| Fase | Beschrijving | Tijd |
|---|---|---|
| 1 | Datamodel + rekenkern + tests | 1 dag |
| 2 | Nieuwe pagina + UI + view-functies | 1 dag |
| 3 | Cleanup oude URL + sitewide updates | 0,5 dag |
| 4 | Bron-werkblad bijwerken | 0,25 dag |
| 5 | End-to-end + lancering | 0,5 dag |
| **Totaal** | | **~3 dagen** |
