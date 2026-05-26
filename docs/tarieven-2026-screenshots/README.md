# Fase 0 — Bronvalidatie werkblad

Doorloopwerkblad voor de visuele verificatie van elk cijfer dat in de calculator­module wordt gebruikt. Elke bron krijgt een rij; per rij staat de exacte URL, wat te controleren, het cijfer dat de eerste analyse opleverde, en ruimte voor het te bewaren screenshot-bestand.

> **Scope-wijziging 2026-05-24:** v1 sluit premies uit de berekening. B1 reduceert daarmee van een 3-stappen-validatie naar één deeplink-check. Het uitgebreide protocol blijft staan als **v2-werkblad** (sectie B1-v2) voor wanneer premie-integratie wordt opgepakt in Fase 8.

**Doel:** alle waarden in `data/vlaamse-tarieven-2026.json` zijn pas "ondertekend" als elke rij hieronder een ✓ heeft én er een screenshot in deze map staat. Pas dán mag Fase 1 (calculator-kern) starten.

**Werkwijze per bron:**

1. Open de URL in een browser.
2. Vergelijk het cijfer in de kolom **"Verwacht"** met wat de pagina toont.
3. Maak een screenshot waarin het cijfer of de regel zichtbaar staat (volledige pagina-screenshot is veiliger dan een crop — toont URL-balk en datum).
4. Sla op als `B{nr}-{kort}-{YYYY-MM-DD}.png` in deze map (voorbeelden in tabel).
5. Vink af én vul `checked-by.md` aan met datum + initialen + eventuele afwijking.

**Tijdsbudget v1:** ~30–45 minuten (B1/B2 zijn deeplink-checks, niet meer een volledige premie-tabel-verificatie). Het uitgebreide v2-protocol voor B1 staat onderaan in een uitklap-sectie, alleen relevant voor Fase 8.

---

## Premies — Mijn VerbouwPremie (v1: enkel deeplink)

### B1 — Footnote-deeplink (v1)

> **v1-scope:** premies vallen buiten de berekening. Deze bron-rij reduceert daarmee tot één check: werkt de deeplink-URL die in de premie-footnote van het resultatenpaneel staat?

- **URL:** https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie
- **Wat:** alleen bevestigen dat de URL nog actief is, naar een actuele pagina leidt, en dat een eindgebruiker van daaruit de officiële simulator kan starten.
- **Screenshot-naam:** `B1-footnote-deeplink-YYYY-MM-DD.png`
- **Status:**
  - [X] URL actief (geen 404, geen redirect naar foutpagina)
  - [X] Pagina toont actuele info (datum-vermelding herzien in 2026 of recenter)
  - [X] Simulator vanaf deze pagina bereikbaar binnen 2 kliks

**Tijdsbudget:** 5 minuten.

### B2 — Algemene MVP-pagina (v1)

- **URL:** https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie (zelfde als B1 — vaak één pagina volstaat voor beide checks)
- **Wat:** bevestigen dat de algemene info-pagina nog bestaat en dezelfde deeplink-functie vervult.
- **Screenshot-naam:** `B2-mvp-algemeen-YYYY-MM-DD.png` (mag samenvallen met B1 als één screenshot beide dekt)
- [X] **Status:** URL actief en consistent met B1

---

### B1-v2 — Premies warmtepomp per categorie & type (verschoven naar v2)

> **Niet uitvoeren in Fase 0 van v1.** Het onderstaande 3-stappen-protocol blijft als referentie staan voor wanneer **Fase 8 (premie-integratie)** wordt opgepakt. Op dat moment moet alles hieronder doorlopen worden vóór `data/vlaamse-tarieven-2026.json` een `premium`-blok kan krijgen.

<details>
<summary><b>Klik om het volledige v2-protocol te tonen</b></summary>

> **Aanpak vastgelegd op 2026-05-24.** De hoofdpagina `mijn-verbouwpremie-voor-warmtepomp` toont geen statische tabel meer, alleen een simulator. Daarom gebeurt de verificatie in drie stappen die elkaar onderling controleren. Pas verder als minstens twee van de drie stappen consistente bedragen opleveren.

#### Stap A — De "Wijzigingen vanaf 2026"-pagina (probeer eerst)

- **URL:** https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie/wijzigingen-mijn-verbouwpremie-vanaf-2026
- **Wat:** volgens secundaire bronnen staat hier de gestructureerde tabel met de nieuwe bedragen per categorie × type, in tegenstelling tot de hoofdpagina.
- **Screenshot-naam:** `B1v2-A-wijzigingen-2026-tabel-YYYY-MM-DD.png`
- **Status:**
  - [ ] Tabel gevonden op deze pagina (vul bedragen hieronder in)
  - [ ] Tabel NIET gevonden → ga door met Stap B, deze hele Stap A oversla

#### Stap B — Simulator-walkthroughs (autoritatief alternatief)

- **URL:** start vanaf https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie (klik door naar simulator)
- **Wat:** vul de simulator in voor onderstaande 7 representatieve klantprofielen en screenshot elke resultaat­pagina. De simulator-output IS de autoritatieve waarde voor dat profiel — sterker bewijs dan een tabel die kan verouderen.
- **Tip:** gebruik telkens dezelfde fictieve woning: bouwjaar 2005, hoofdverblijfplaats, factuurbedrag warmtepomp €15.000 excl. btw. Variëer enkel categorie en warmtepomp-type. Voor verhoging-test: ook variëren of woning in gebied zonder aardgas ligt.

| # | Profiel (categorie × type) | Verwacht resultaat | Screenshot-naam | Match? |
|---|---|---|---|---|
| 1 | Cat. 1 × lucht-water | €1.500 | `B1v2-B-sim1-cat1-luchtwater-YYYY-MM-DD.png` | [ ] |
| 2 | Cat. 2 × lucht-water | €1.500 | `B1v2-B-sim2-cat2-luchtwater-YYYY-MM-DD.png` | [ ] |
| 3 | Cat. 3 × lucht-water | €4.500 | `B1v2-B-sim3-cat3-luchtwater-YYYY-MM-DD.png` | [ ] |
| 4 | Cat. 4 × lucht-water | €6.000 | `B1v2-B-sim4-cat4-luchtwater-YYYY-MM-DD.png` | [ ] |
| 5 | Cat. 4 × geothermisch (standaard) | €8.000 | `B1v2-B-sim5-cat4-geothermisch-YYYY-MM-DD.png` | [ ] |
| 6 | Cat. 4 × geothermisch + gebied zonder aardgas (verhoging) | ~€9.600 (verifieer) | `B1v2-B-sim6-cat4-geo-verhoging-YYYY-MM-DD.png` | [ ] |
| 7 | Cat. 2 × hybride lucht-water | €800 | `B1v2-B-sim7-cat2-hybride-YYYY-MM-DD.png` | [ ] |

**Belangrijk bij Stap B:** als de simulator een ander bedrag toont dan "Verwacht", noteer dit verschil in `checked-by.md` — het kan een tussentijdse aanpassing van de regelgeving zijn.

#### Stap C — Cross-check via secundaire bronnen

- **Bron 1:** https://daco.be/blog/warmtepomp-premies-wijzigingen-vanaf-maart-2026/
- **Bron 2:** https://www.renovatie-gids.be/warmtepomp/premie/
- **Wat:** controleer dat beide secundaire bronnen dezelfde tabel-bedragen tonen als wat Stap A of B oplevert. Bij overeenkomst tussen 2-uit-3 bronnen: hoge confidence. Bij afwijking: kies de simulator (Stap B) als waarheid en noteer welke secundaire bron afwijkt.
- **Screenshot-naam:** `B1v2-C-crosscheck-daco-YYYY-MM-DD.png` en `B1v2-C-crosscheck-renovatiegids-YYYY-MM-DD.png`
- **Status:**
  - [ ] Beide bronnen consistent met Stap A/B
  - [ ] Eén bron afwijkt — gedocumenteerd in `checked-by.md`
  - [ ] Beide bronnen wijken af — STOP, escaleren

#### Synthese — vul in na alle stappen

| Categorie | Geothermisch | Lucht/water | Lucht/lucht | Hybride lucht/water | Plafond |
|---|---|---|---|---|---|
| Cat. 4 / verhuur woonmaatschappij | _____ | _____ | _____ | _____ | _____% excl. btw |
| Cat. 3 | _____ | _____ | _____ | _____ | _____% excl. btw |
| Cat. 2 | _____ | _____ | _____ | _____ | _____% excl. btw |
| Cat. 1 / meerdere eig. / andere investeerder | _____ | _____ | _____ | _____ | _____% excl. btw |
| Appartement gemeenschappelijke installatie | _____ | _____ | _____ | _____ | _____% excl. btw |
| Verhoging (gebied zonder aardgas / vervanging elektr. weerstand) | _____% extra of vast bedrag | | | | n.v.t. |

**Ook controleren (vink af na Stap A of B):**
- [ ] Geen MVP meer voor niet-woongebouwen vanaf 1 maart 2026
- [ ] Warmtepomp moet ruimteverwarming leveren (toestel dat enkel airco is komt niet in aanmerking)
- [ ] Voor lucht/water, hybride en geothermisch: actieve koeling toegestaan zonder bijkomende voorwaarden
- [ ] Voor lucht/lucht: strengere voorwaarden (enige centrale verwarming + woning fossielvrij; software-deactivatie volstaat niet)
- [ ] Verhoging cat. 3/4 + woonmaatschappij­verhuurders bij gebied zonder aardgas óf vervanging elektrische weerstand; bij hybride enkel bij vervanging elektrische weerstand
- [ ] Verwijderingskosten oude installatie + afgifte-elementen (vloerverwarming, radiatoren) tellen NIET mee
- [ ] Voor cat. 1/2 verdwijnt de verhoging vanaf 1 maart 2026 (geverifieerd in WebSearch — bevestigen op officiële bron)
- [ ] Maximum-uitbetaling bevestigd op €9.600 (cat. 4 geothermisch + verhoging) — of het exacte cijfer dat de simulator toont in Stap B6

</details>

---

## Capaciteitstarief

### B3 — VREG Vlaams gemiddelde capaciteitstarief 2026

> **Geverifieerd 2026-05-25 via directe fetch.** Officiële cijfer bevestigd op 53,39 (eerder geschatte 52,95 was niet accuraat).

- **URL:** https://www.vlaamsenutsregulator.be/elektriciteit-en-aardgas/nettarieven/capaciteitstarief
- **Wat:** gemiddelde tarief 2026 én datum laatste update.
- **Screenshot-naam:** `B3-vreg-capaciteitstarief-2026-05-25.png` (te bewaren)

| Item | Verwacht | Gevonden | Match? |
|---|---|---|---|
| Vlaams gemiddelde excl. btw — jaarbasis | 53,39 | **53,39 €/kW/jaar** | [x] |
| Vlaams gemiddelde excl. btw — maandbasis | 4,45 | **4,45 €/kW/maand** | [x] |
| Minimum aangerekend | 2,5 kW | **2,5 kW** | [x] |
| Methodiek | kwartierpiek → maandpiek → 12-maand-gemiddelde | bevestigd | [x] |
| Gemiddelde maandpiek Vlaanderen (nov 2025) | — | **4,24 kW** (nieuwe info — bruikbaar als default voor "huidige piek" in calculator) | [x] |
| Laatste update | 2026-04-23 | **23 april 2026** | [x] |

### B11 — Capaciteitstarief Fluvius Midden-Vlaanderen 2026

> **Belangrijk:** Fluvius zelf publiceert geen samenvattend tarief — alleen een uitleg-pagina. De **officiële goedgekeurde tarieven 2026** staan als PDF op de VREG-site, één PDF per Fluvius-netgebied. AVYclima-werkgebied (Aalst, Denderleeuw, Ninove) valt onder **Fluvius Midden-Vlaanderen**.

- **URL:** https://www.vlaamsenutsregulator.be/elektriciteit-en-aardgas/nettarieven/hoeveel-bedragen-de-distributienettarieven
- **Wat:** download de PDF "**Fluvius Midden-Vlaanderen 2026 Elektriciteit**" uit de lijst. Daarin vind je de **kostprijs piekvermogen** (€/kW/jaar) — dat is het capaciteitstarief.
- **Screenshot-naam:** `B11-fluvius-mv-capaciteit-2026-YYYY-MM-DD.png` (screenshot van de relevante rij in de PDF — of de PDF zelf bewaren als `B11-fluvius-mv-2026-elek.pdf`)

| Item | Gevonden | Match? |
|---|---|---|
| Fluvius Midden-Vlaanderen tarief excl. btw 2026 | 50,1239818 €/kW/jaar | [X] |
| Fluvius Midden-Vlaanderen tarief incl. btw 2026 | 53,13 €/kW/jaar | [X] |
| Vlaams gemiddelde (van B3, ter referentie in calculator-UI) | 53,39 €/kW/jaar | [X] |

**Twee cijfers nodig** want de calculator toont in v1 beide: Fluvius Midden-Vlaanderen als default én Vlaams gemiddelde als referentie ("Ter vergelijking: het Vlaams gemiddelde bedraagt ..."). Beslist 2026-05-25.

---

## BTW

### B5 — BTW-context (deeplink voor tooltip)

> **Vereenvoudigd 2026-05-25.** Calculator-default is **21% btw** (past bij AVYclima's hoofdactiviteit lucht-lucht). 6% blijft selecteerbaar voor klanten die expliciet in 6%-regime vallen (lucht-water/geothermisch in renovatie ≥10 jaar, of nieuwe 2026-regeling). De **installateur stelt het btw-tarief vast op de offerte**, niet de calculator — de UI hoeft enkel een tooltip-deeplink te bieden.

- **URL:** https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/btw-tarief-van-6-bij-renovatie-en-sloop-en-heropbouw-van-woningen
- **Wat:** alleen bevestigen dat de URL nog actief is en de regels samenvat. Eén deeplink in de calculator-tooltip; geen volledige regelchecklist meer.
- **Screenshot-naam:** `B5-btw-deeplink-YYYY-MM-DD.png`
- **Status:**
  - [ ] URL actief
  - [ ] Pagina toont actuele info (2026-versie of recenter)

**Tijdsbudget:** 5 minuten.

### B6 — BTW 21% fossiele verwarmingsinstallaties

> **Geverifieerd 2026-05-25** via directe fetch van de officiële FOD-pagina. Alle items bevestigd, met verfijningen toegevoegd.

- **URL:** https://fin.belgium.be/nl/particulieren/woning/bouwen-verbouwen/verbouwen/gewijzigde-btw-tarieven-verwarmingsinstallaties-fossiele-brandstoffen
- **Juridische basis:** Circulaire **2025/C/47**, KB nr. 20 rubriek XXXI (renovatie) en XXXVII (afbraak/heropbouw)
- **Screenshot-naam:** `B6-btw-21pct-fossiel-2026-05-25.png` (te maken bij volgende doorloop)

| Item | Verwacht | Match? |
|---|---|---|
| Ingangsdatum 21% — renovatie / werk onroerende staat | 29.07.2025 | [x] |
| Ingangsdatum 21% — levering heropgerichte woning (apart!) | 01.07.2025 | [x] |
| Overgangsregeling oude offertes | tot 30.06.2026 voor btw-opeisbaarheid; aan te tonen met bv. bankafschrift dat verwijst naar offerte | [x] |
| Hybride installatie — factuur splitsen | Bij ontbreken splitsing → volledige factuur aan 21% | [x] |
| Forfaitaire verdeling bij globale prijs hybride | **35% specifiek deel ketel @ 21% / 65% warmtepomp + niet-specifiek @ 6%** (ter vereenvoudiging, niet verplicht) | [x] |
| Niet-specifieke onderdelen blijven 6% | hydraulische leidingen, vloerverwarming, radiatoren, externe circulatiepomp, expansievaten, ontluchters, thermostaten/EMS, energiemeters, buitensensoren | [x] |
| Onderhoud + herstellingen van fossiele installaties blijven 6% | ja — vallen volledig buiten de btw-verhoging | [x] |
| Werkuren volgen tarief onderdelen | bv. plaatsing gasketel = 21%, plaatsing radiatoren = 6% (mits overige voorwaarden) | [x] |

---

## Energie­prijzen (indicatief)

### B9 — VREG dashboard elektriciteit

> **Geverifieerd 2026-05-25** via screenshot van Jurgen. Default herzien.

- **URL:** https://www.vlaamsenutsregulator.be/cijfers/dashboard-afnameprijzen-elektriciteit-vooruitblik
- **Wat:** indicatieve all-in prijs typegezin 3.500 kWh/jaar — Tabel 2 toont maandelijkse evolutie per tariefscenario.
- **Screenshot-naam:** `B9-vreg-elek-prijs-2026-05-25.png` (te bewaren)
- **Meest recente data:** november 2025

| Tariefscenario voor 3.500 kWh/jaar | €/jaar | €/kWh all-in | Match? |
|---|---|---|---|
| Sociaal tarief | 749,95 | **0,2143** | [x] |
| Gewogen laagste contract | 1.008,02 | **0,2880** | [x] |
| **Gemiddelde (= default calculator)** | **1.161,06** | **0,3317** | [x] |
| Standaardtarief | 1.208,09 | 0,3452 | [x] |
| Gewogen hoogste contract | 1.374,02 | 0,3926 | [x] |

**Default voor `data/vlaamse-tarieven-2026.json`:** **0,33 €/kWh** (afgerond gemiddelde Nov 2025).
Scenarioband ×1,15 = 0,38 (≈ gewogen hoogste); ×0,90 = 0,30 (≈ gewogen laagste). Dekt de Vlaamse marktspreiding accuraat.

### B10 — VREG dashboard aardgas

> **Geverifieerd 2026-05-25** via screenshot van Jurgen. Default herzien.

- **URL:** https://www.vlaamsenutsregulator.be/cijfers/dashboard-afnameprijzen-aardgas-vooruitblik
- **Wat:** indicatieve all-in prijs typegezin 17.000 kWh/jaar — Tabel 2 toont maandelijkse evolutie per tariefscenario.
- **Screenshot-naam:** `B10-vreg-gas-prijs-2026-05-25.png` (te bewaren)
- **Meest recente data:** april 2026

| Tariefscenario voor 17.000 kWh/jaar | €/jaar | €/kWh all-in | Match? |
|---|---|---|---|
| Sociaal tarief | 856,86 | **0,0504** | [x] |
| Standaardtarief | 1.328,05 | 0,0781 | [x] |
| Gewogen laagste contract | 1.468,95 | **0,0864** | [x] |
| **Gemiddelde (= default calculator)** | **1.772,86** | **0,1043** | [x] |
| Gewogen hoogste contract | 2.070,99 | **0,1218** | [x] |

**Default voor `data/vlaamse-tarieven-2026.json`:** **0,10 €/kWh** (afgerond gemiddelde april 2026).
Scenarioband ×1,15 = 0,115 (≈ gewogen hoogste); ×0,85 = 0,085 (≈ gewogen laagste). Dekt de Vlaamse marktspreiding accuraat.

### B4 — V-test (deeplink)

> **Geverifieerd 2026-05-25** via screenshot van Jurgen. Pagina toont drie vergelijkings­opties: V-check (snel), V-test (gedetailleerd), Mijn V-test (notificatie bij besparingen).

- **URL:** https://www.vlaamsenutsregulator.be/elektriciteit-en-aardgas/energiecontracten-en-leveranciers/doe-de-v-testr
- **Wat:** alleen bevestigen dat URL nog werkt en doorlinkt naar `vtest.be`.
- **Screenshot-naam:** `B4-vtest-deeplink-2026-05-25.png` (te bewaren)
- [x] **Status:** URL actief — bevestigd

---

## Conversies

### B7 — Fluvius m³ → kWh omzettingscoëfficiënt

> **Geverifieerd 2026-05-25 via directe fetch.** Fluvius publiceert geen enkel samenvattend cijfer op de publieke pagina — methodologie wordt beschreven (m³ → m³(n) via CBW = Calorische Bovenwaarde × klimaatcorrectiefactor); detailwaarden per GOS staan op de partner-site.

- **URL:** https://www.fluvius.be/nl/factuur-en-tarieven/berekeningsparameters
- **Detail per GOS:** https://partner.fluvius.be/nl/thema/energieleveranciers#sectorinformatie (CBW-tabel per gasontvangststation)
- **Screenshot-naam:** `B7-fluvius-omzetting-2026-05-25.png` (te bewaren)

| Item | Default voor calculator | Bron | Match? |
|---|---|---|---|
| H-gas (Vlaanderen, dominant) | **11,5 kWh/m³** | Sector­standaard / Fluvius CBW-tabel | [x] |
| L-gas (uitfasering) | 10,25 kWh/m³ | Sector­standaard | [x] |
| Variabiliteit | per maand + per GOS | Bevestigd; veld overschrijfbaar | [x] |

**UI-implicatie:** veld blijft input-parameter met default 11,5; tooltip vermeldt "Exacte coëfficiënt staat op uw jaarafrekening (Fluvius doet de omrekening voor u)."

---

## Klimaat

### B8 — Synergrid graaddagen

> **Geverifieerd 2026-05-25 via directe fetch.** Exacte tabel met jaarcijfers gevonden — eerdere "~2.087 graaddagen" schatting bijgesteld naar werkelijke **2.187** (30-jaar norm 1996-2025).

- **URL:** https://www.synergrid.be/nl/documentencentrum/statistieken-gegevens/graaddagen
- **Screenshot-naam:** `B8-synergrid-graaddagen-2026-05-25.png` (te bewaren)

| Item | Gevonden | Match? |
|---|---|---|
| Definitie | 16,5°C − dagtemperatuur Ukkel (KMI); 0 als > 16,5°C | [x] |
| Equivalente graaddagen formule | GDeq = 0,6×GD(D) + 0,3×GD(D-1) + 0,1×GD(D-2) | [x] |
| **30-jaar norm (periode 1996-2025)** | **2.187 graaddagen/jaar** | [x] |
| 2024 (volledig jaar) | 1.942 | [x] |
| 2025 (volledig jaar) | 1.973 | [x] |
| **Gemiddelde 2024-2025** | **1.958** (= klimaat-gecorrigeerd recent 2-jaars gemiddelde) | [x] |
| 2026 cumul tot april | 1.027 | [x] |
| Update-frequentie 30-jaar norm | elke 5 jaar | [x] |

**Defaults voor `data/vlaamse-tarieven-2026.json`:**
- `hdd_reference_30y_norm`: **2.187** (officieel Synergrid-referentie)
- `hdd_reference_recent_2y`: **1.958** (klimaat-gecorrigeerd)
- **Default voor calculator**: **1.960** (afgerond recent 2-jaars gemiddelde) — eerlijker beeld voor huidige klimaatrealiteit dan de 30-jaar norm

### B13 — KMI klimatologisch jaaroverzicht 2025

> **Geverifieerd 2026-05-25 via directe PDF-fetch.** Officiële KMI-publicatie, 14 pagina's.

- **URL:** https://www.meteo.be/resources/climatology/pdf/klimatologisch_jaaroverzicht_2025.pdf
- **Wat:** recent klimaatbeeld; ondersteunt B8 (Synergrid graaddagen) en geeft context voor calculator leerplatform-deel.
- **Screenshot/PDF-naam:** `B13-kmi-jaaroverzicht-2025.pdf` (te bewaren in `docs/`)

**Geverifieerde 2025-cijfers Ukkel (referentie KMI: 1991-2020):**

| Item | 2025 | Normaal | Match? |
|---|---|---|---|
| Gemiddelde temperatuur | 12,0°C | 11,0°C | [x] (+1,0°C — 4e warmste jaar sinds 1833, samen met 2014) |
| Gemiddelde minimumtemperatuur | 8,0°C | 7,3°C | [x] |
| Gemiddelde maximumtemperatuur | 15,9°C | 14,7°C | [x] |
| Vorstdagen | 46 | 39,4 | [x] |
| Zomerse dagen (≥25°C) | 47 | 29,9 | [x] (+57% — relevant voor koeling) |
| Tropische dagen (≥30°C) | 10 | 5,3 | [x] (+89%) |
| Neerslagtotaal | 620,6 mm | 837,3 mm | [x] (droogste jaar van huidige referentieperiode 1991-2020) |
| Zonneschijnduur | 1841 uur | 1604 uur | [x] (4e zonnigste jaar) |
| Officiële hittegolven | 2 | — | [x] (28 juni–2 juli; 10–15 augustus) |

**Belangrijke nuance referentieperiodes (impact op calculator):**

| Bron | Referentieperiode | 2025 t.o.v. normaal |
|---|---|---|
| KMI klimaat | **1991-2020** | +1,0°C boven normaal |
| Synergrid graaddagen | **1996-2025** | 1.973 vs 2.187 = −214 graaddagen (≈10% minder) |

De **KMI gebruikt 1991-2020 als referentie** voor klimaatstatistieken; **Synergrid gebruikt 1996-2025** voor graaddagen. Klein verschil in referentie­venster, maar beide tonen consistent dat 2025 aanzienlijk warmer was dan het 30-jaars gemiddelde. Onze calculator-default van 1.960 graaddagen (recent 2-jaars gemiddelde) blijft consistent met deze trend.

**Implicatie voor calculator-leerplatform:**
- 47 zomerse + 10 tropische dagen → koeling-verkoopboodschap voor lucht-lucht versterkt
- Klimaatopwarming-trend → toekomstige verwarmingsbehoefte zal verder dalen → SCOP-realisatie van warmtepomp verbetert
- 30-jaar norm 2.187 graaddagen is verouderd t.o.v. praktijk; voor klanten die op recente facturen rekenen geeft 1.960 een eerlijker beeld

---

## CO₂-emissiefactoren

Toegevoegd 2026-05-25 voor de kostenvergelijking-pivot. Alle factoren zijn **finale energie** (kg CO₂ per kWh geleverd aan de woning, EPB-conventie). De calculator gebruikt deze in `annualCo2Emissions()`.

### B14 — VEKA-VMM nota CO₂-emissiefactoren (primaire bron brandstoffen)

> **Geverifieerd 2026-05-25 via directe PDF-fetch.** Officiële Vlaamse referentienota januari 2022, opgesteld door VEKA samen met VMM. Geldt als gezaghebbende bron voor brandstof-CO₂-factoren in Vlaamse beleidsdocumenten en EPB-software.

- **URL:** https://assets.vlaanderen.be/image/upload/v1667817909/2022-01-11_VEKA-VMM_nota_COW_emissiefactoren_en_soortelijk_gewicht_phgn1g.pdf
- **Publicatiedatum:** 11 januari 2022
- **Screenshot-naam:** `B14-veka-vmm-co2-factoren.pdf` (volledige PDF bewaren, 1-2 pagina's bevatten de tabel)

| Brandstof | Factor (kg CO₂/kWh) | Verwacht in calculator | Match? |
|---|---|---|---|
| Aardgas (verbranding, finaal) | 0,202 | 0,202 | [x] |
| Mazout / huisbrandolie | 0,267 | 0,267 | [x] |
| Propaan | 0,230 | 0,230 | [x] |
| Pellets (EPB-conventie, biogeen) | 0,000 | levenscyclus 0,040 (zie B17) | [x] |

**Implicatie:** VEKA-VMM gebruikt verbrandings-conventie (pellets = 0). Voor de calculator hanteren we de VITO levenscyclus-factor voor pellets (B17) omdat dat eerlijker vergelijkt met een warmtepomp. De gas/mazout/propaan-cijfers komen rechtstreeks uit deze nota.

### B15 — CNC-NKC technische nota aardgas

> **Geverifieerd 2026-05-25 via directe PDF-fetch.** CNC-NKC is de Nationale Klimaatcommissie. Deze nota werd door Fluxys + FOD Economie + de 3 gewesten gevalideerd en geeft de country-specific CO₂-factor voor aardgas in België.

- **URL:** https://www.cnc-nkc.be/sites/default/files/meeting/files/nota_emissiefactor_aardgas_incl_aanvullingen_evolutie_co2_en_impact_-_goedgekeurd.pdf
- **Goedkeuringsdatum:** 8 november 2021
- **Screenshot-naam:** `B15-cnc-nkc-aardgas-co2.pdf` (volledige PDF bewaren)

| Item | Gevonden | Verwacht in calculator | Match? |
|---|---|---|---|
| Country-specific factor 2017-2019 | 56,40 – 56,53 t CO₂/TJ | 0,202 kg/kWh | [x] |
| Conversie | 56,5 / 3.600 × 1000 ≈ 0,2014 | afgerond 0,202 | [x] |
| Geldigheid | nationaal, alle Vlaamse afnemers | bevestigd | [x] |

**Cross-check met B14:** beide bronnen geven hetzelfde cijfer ~0,202 voor aardgas H. Dubbele bevestiging.

### B16 — AIB residuele mix elektriciteit (via VREG)

> **Geverifieerd 2026-05-25 via directe fetch.** AIB (Association of Issuing Bodies) publiceert jaarlijks de Belgische residuele-mix-factor voor elektriciteit, op basis van de werkelijke stroomproductie. **Belangrijk: dit cijfer wordt jaarlijks bijgewerkt**, typisch eind mei / begin juni.

- **Primaire URL:** https://www.vreg.be/nl/energieverbruik
- **Secundaire bron (zelfde cijfer, met conversie van g/kWh naar kg/kWh):** https://business.engie.be/nl/faq/contract/co2-uitstoot/
- **Screenshot-naam:** `B16-aib-vreg-elek-2024.png` (te bewaren — toont 131,73 g/kWh of 0,132 kg/kWh)

| Item | Gevonden | Verwacht in calculator | Match? |
|---|---|---|---|
| Belgische residuele mix 2024 | 131,73 g CO₂/kWh = 0,132 kg/kWh | 0,132 | [x] |
| Update-frequentie | jaarlijks (eind mei / begin juni) | bevestigd | [x] |
| Type | finale energie, residuele mix (niet groene-stroom-certificaten) | bevestigd | [x] |
| Vlaams vs Belgisch | AIB publiceert Belgisch; VREG hanteert Belgisch ook voor Vlaanderen (geen aparte Vlaamse mix) | bevestigd | [x] |

**TODO 2026-06-01 ± enkele weken:** AIB publiceert 2025-cijfer rond eind mei / begin juni. Op dat moment het tariefblad updaten met de nieuwste waarde. Belangrijk: gebruik **niet** VEKA's "vermeden STEG-productie"-cijfer (381 g/kWh) — dat is voor PV-impact-berekeningen, niet voor verbruik.

### B17 — VITO pellets-studie (levenscyclus-factor)

> **Geverifieerd 2026-05-25 via directe PDF-fetch.** VITO (Vlaamse Instelling voor Technologisch Onderzoek) publiceerde een studie over pellets in Vlaanderen die levenscyclus-uitstoot (LCA) van pellets-productie + transport berekent. Wij gebruiken dit cijfer in plaats van EPB-conventie (0) voor een eerlijke vergelijking met warmtepompen.

- **URL:** https://emis.vito.be/sites/emis.vito.be/files/pages/migrated/energietechnologie_anre_studie_pellets_volledig_rapport.pdf
- **Screenshot-naam:** `B17-vito-pellets-lca.pdf` (volledige PDF bewaren)

| Item | Gevonden | Verwacht in calculator | Match? |
|---|---|---|---|
| Pellets LCA (productie + transport) | 0,03–0,07 kg CO₂/kWh | 0,040 (middenwaarde) | [x] |
| EPB-conventie (biogeen-neutraal) | 0,000 | gedocumenteerd in `_note` veld | [x] |

**Beslissing 2026-05-25:** we tonen LCA-factor (0,040) in de calculator-resultaten, met info-tooltip die uitlegt dat EPB-conventie 0 hanteert. Reden: bij een eerlijke vergelijking met een warmtepomp moet de productie- en transportketen meegerekend worden, anders lijken pellets oneerlijk "perfect" t.o.v. een warmtepomp die wel zijn elektriciteitsketen meekrijgt.

---

## Aanvullend

### B12 — VLAIO warmtepompen steun

> **Geverifieerd 2026-05-25 via directe fetch.** Pagina actief, laatste update 11 mei 2026.

- **URL:** https://www.vlaio.be/nl/subsidies-financiering/subsidiedatabank/maatregelen/warmtepompen-steun (redirect vanaf oudere URL)
- **PDF-versie:** https://www.vlaio.be/nl/download/pdf?file=generated-pdf/maatregelfiche-warmtepompen_steun-9565.pdf
- **Screenshot-naam:** `B12-vlaio-steun-2026-05-25.png` (te bewaren)

**Inhoud — alle steunmaatregelen zijn voor ONDERNEMINGEN, niet residentieel:**

| Regeling | Doelgroep | Voor calculator (v1)? |
|---|---|---|
| Ecoboostlening | KMO's, zelfstandigen | Niet relevant (residentieel) |
| Ecologiepremie+ | Ondernemingen | Niet relevant |
| GREEN investeringssteun | Ondernemingen | Niet relevant |
| Investeringsaftrek | Ondernemingen + zelfstandigen | Niet relevant |
| **Mijn Verbouwpremie** | **Particulieren + ondernemingen** | **Al gedekt in B1/B2** (footnote-deeplink) |
| Vergroeningsscan | Ondernemingen | Niet relevant |
| Call Groene Warmte | Grootschalig (>300 kWth) | Niet relevant |

- [x] **Status:** Geen aanvullende residentiële regelingen — VLAIO bevestigt dat Mijn Verbouwpremie de enige relevante is voor particulieren. Vlaams Energiehuis renteloze lening wordt **niet** door VLAIO genoemd op deze pagina, dus blijft in v3 / Fase 8 scope. Voor v1 geen actie nodig op het tariefblad.

---

## Afronding

Wanneer elke rij hierboven een ✓ heeft en alle screenshots in deze map staan:

1. Open `checked-by.md` en zet een ondertekenregel onderaan.
2. Update `data/vlaamse-tarieven-2026.json` met de bevestigde waarden + `lastUpdated: YYYY-MM-DD` + `reviewedBy: "JV"`.
3. Markeer Fase 0 als voltooid in `TERUGVERDIENTIJD_CALCULATOR_PLAN.md` Deel 5.
4. Fase 1 (calculator-kern) kan beginnen.

**Reviewer:** verlang dat elke significante afwijking tussen verwacht en gevonden cijfer eerst besproken wordt vóór update van de JSON — een bron die plots een ander cijfer toont dan een week eerder kan een tijdelijke fout zijn op de bronpagina.
