# Bronvalidatie — ondertekenlog

Eén regel per bevestigde bron. Bij afwijking tussen "verwacht" (zoals beschreven in `README.md`) en "gevonden": noteer het verschil expliciet. Geen rij = niet ondertekend = mag niet in `data/vlaamse-tarieven-2026.json` belanden.

**Formaat per rij:**
`YYYY-MM-DD | INITIALEN | bron-ID | screenshot-bestandsnaam | OK / afwijking: <korte beschrijving>`

---

## Sessie 1 — _datum_

| Datum | Init. | Bron | Screenshot | Status / opmerking |
|---|---|---|---|---|
| YYYY-MM-DD | JV | B1 footnote-deeplink (v1) | B1-footnote-deeplink-YYYY-MM-DD.png | _URL actief ja/nee_ |
| YYYY-MM-DD | JV | B2 MVP algemeen | B2-mvp-algemeen-YYYY-MM-DD.png | _mag overlappen met B1-screenshot_ |
| 2026-05-25 | claude (web_fetch) | B3 VREG Vlaams gemiddelde capaciteitstarief | B3-vreg-capaciteitstarief-2026-05-25.png (te bewaren) | **Vlaams gemiddelde: 53,39 €/kW/jaar excl. btw** (laatste update 23 april 2026 — matcht brondocument). Maandbasis 4,45 €/kW. Gemiddelde maandpiek Vlaanderen nov 2025: 4,24 kW. Minimum 2,5 kW. Eerdere schatting 52,95 was niet accuraat. |
| 2026-05-25 | JV (screenshot) | B4 V-test deeplink | B4-vtest-deeplink-2026-05-25.png (te bewaren) | URL actief, pagina toont V-check / V-test / Mijn V-test als drie vergelijkings­opties. Klaar voor gebruik als deeplink in tooltip. |
| YYYY-MM-DD | JV | B5 BTW-context deeplink | B5-btw-deeplink-YYYY-MM-DD.png | URL actief ja/nee |
| 2026-05-25 | claude (web_fetch) | B6 BTW 21% fossiel | B6-btw-21pct-fossiel-2026-05-25.png (nog te maken) | **Bevestigd via directe fetch FOD-pagina.** Alle 8 items geverifieerd. Verfijningen: tweede ingangsdatum 01.07.2025 voor heropgerichte woning; forfait 35%/65% concreet; onderhoud blijft 6%. Juridische basis: Circulaire 2025/C/47 + KB 20 rubrieken XXXI/XXXVII. |
| 2026-05-25 | claude (web_fetch) | B7 Fluvius m³→kWh | B7-fluvius-omzetting-2026-05-25.png (te bewaren) | Methodologie bevestigd (CBW × klimaatcorrectie). Geen enkel cijfer op publieke pagina — detail per GOS op partner-site. Default 11,5 kWh/m³ blijft sector­standaard voor H-gas Vlaanderen. |
| 2026-05-25 | claude (web_fetch) | B8 Synergrid graaddagen | B8-synergrid-graaddagen-2026-05-25.png (te bewaren) | **30-jaar norm = 2.187** (periode 1996-2025); 2024 = 1.942; 2025 = 1.973; gemiddelde recent 2 jaar = **1.958**. Default voor calculator op **1.960** (klimaat-gecorrigeerd). Equivalente graaddagen formule bevestigd. |
| 2026-05-25 | JV (screenshot) + claude (interpretatie) | B9 VREG elektriciteit | B9-vreg-elek-prijs-2026-05-25.png (te bewaren) | **Default 0,33 €/kWh** (Vlaams gemiddelde Nov 2025 voor 3.500 kWh-profiel). Eerdere schatting 0,25 was te laag. Volledige range gedocumenteerd: 0,21 (sociaal) – 0,39 (gewogen hoogste). |
| 2026-05-25 | JV (screenshot) + claude (interpretatie) | B10 VREG aardgas | B10-vreg-gas-prijs-2026-05-25.png (te bewaren) | **Default 0,10 €/kWh** (Vlaams gemiddelde april 2026 voor 17.000 kWh-profiel). Eerdere schatting 0,08 was te laag (lag op standaardtarief-niveau, niet gemiddelde). Volledige range: 0,05 (sociaal) – 0,12 (gewogen hoogste). |
| YYYY-MM-DD | JV | B11 Fluvius Midden-Vlaanderen | B11-fluvius-mv-capaciteit-2026-YYYY-MM-DD.png | tarief excl. btw: _____ €/kW/jaar; Vlaams gem.: _____ |
| 2026-05-25 | claude (web_fetch) | B12 VLAIO warmtepompen steun | B12-vlaio-steun-2026-05-25.png (te bewaren) | Bevestigt: alle aanvullende steun is voor ondernemingen, niet residentieel. Voor residentiële klanten blijft MVP de enige route (al gedekt in B1/B2). Geen impact op v1-tariefblad. |
| 2026-05-25 | claude (web_fetch) | B13 KMI klimaat 2025 | B13-kmi-jaaroverzicht-2025.pdf (te bewaren) | Officiële PDF opgehaald. 2025 = 4e warmste jaar in Ukkel (12,0°C, +1,0°C boven KMI-norm 1991-2020). Bevestigt klimaatopwarming-trend: 47 zomerse dagen (norm 30), 10 tropische dagen (norm 5). Versterkt onze HDD-default van 1.960 en de koeling-verkoopboodschap voor lucht-lucht. |

---

## Sessie 2 — 2026-05-25 — CO₂-emissiefactoren (kostenvergelijking-pivot)

Toegevoegd bij de pivot van terugverdientijd → operationele kostenvergelijking. Vier officiële bronnen gevalideerd voor de 5 emissiefactoren die de calculator gebruikt in `annualCo2Emissions()`.

| Datum | Init. | Bron | Screenshot | Status / opmerking |
|---|---|---|---|---|
| 2026-05-25 | claude (web_fetch) | B14 VEKA-VMM nota CO₂-factoren | B14-veka-vmm-co2-factoren.pdf (te bewaren) | Officiële Vlaamse referentienota januari 2022. **Aardgas 0,202**, **mazout 0,267**, **propaan 0,230** bevestigd. Pellets EPB-conventie = 0 (gebruiken we niet — zie B17). |
| 2026-05-25 | claude (web_fetch) | B15 CNC-NKC aardgas | B15-cnc-nkc-aardgas-co2.pdf (te bewaren) | Goedgekeurd 08-11-2021 door Fluxys + FOD Economie + 3 gewesten. Country-specific 56,40–56,53 t/TJ ≈ **0,202 kg/kWh** voor aardgas H. Dubbele bevestiging van B14-cijfer. |
| 2026-05-25 | claude (web_fetch) | B16 AIB residuele mix elektriciteit | B16-aib-vreg-elek-2024.png (te bewaren) | **0,132 kg/kWh** (AIB 2024-cijfer = 131,73 g/kWh). Cross-check via ENGIE Business pagina. **TODO 2026-06-01 ±:** AIB publiceert 2025-cijfer rond eind mei / begin juni — tariefblad updaten zodra beschikbaar. |
| 2026-05-25 | claude (web_fetch) | B17 VITO pellets LCA | B17-vito-pellets-lca.pdf (te bewaren) | Levenscyclus-factor 0,03–0,07 kg/kWh (productie + transport). Default in calculator: **0,040** (middenwaarde). Tooltip legt verschil met EPB-conventie (0) uit. |

---

## Ondertekening Fase 0

Als alle rijen hierboven ingevuld zijn (12 voor v1; meer voor v2 wanneer Fase 8 wordt opgepakt) én alle screenshots in deze map staan én `data/vlaamse-tarieven-2026.json` overeenkomstig bijgewerkt is:

> Ik bevestig dat alle cijfers in `data/vlaamse-tarieven-2026.json` v____________ visueel geverifieerd zijn op de officiële bronpagina's op bovenstaande datums.
>
> **Naam:** ______________________  
> **Datum:** _____________________  
> **Tariefblad-versie:** _________

---

## Latere herzieningen

Bij elke update van het tariefblad (jaarlijks op 1 januari + 1 maart, of ad hoc bij bekende wijziging): voeg een nieuwe **Sessie**-sectie toe boven deze regel. Oude sessies blijven staan als audit-trail.

### Vaste TODO's

- **2026-06-01 ± enkele weken** — AIB publiceert 2025-cijfer voor Belgische residuele mix. Tariefblad-veld `electricity_be_residual_mix` updaten + `electricity_be_residual_mix_year` op 2025 zetten + nieuwe Sessie-rij toevoegen. Huidige waarde geldt voor 2024.
- **2027-01-01** — VEKA-VMM nota herzien? Check of er een 2025/2026 herziening is op `assets.vlaanderen.be`. De huidige factoren (gas/mazout/propaan) zijn relatief stabiel (puur thermodynamica) maar het rapport zelf kan een update krijgen.
