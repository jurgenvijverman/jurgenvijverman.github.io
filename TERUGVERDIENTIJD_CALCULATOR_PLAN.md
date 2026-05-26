# Calculator Terugverdientijd Warmtepomp — Analyse & Implementatieplan

Analyse en implementatieplan voor een nieuwe module op avyclima.be die (a) klanten een gedetailleerde, factueel correcte berekening laat maken van de terugverdientijd van een warmtepomp in Vlaanderen, en (b) tegelijk fungeert als leerplatform waar elke term, parameter en aanname duidelijk wordt uitgelegd.

**Auteur:** opgesteld 2026-05-24, op basis van het brondocument `terugverdientijd_warmtepomp_vlaanderen.docx` (versie 23 mei 2026) en een onafhankelijke verificatie van de tien bronnen die daarin geciteerd worden.

**Past in:** dit document is opgesteld in dezelfde stijl als `IMPLEMENTATION_PLAN.md` en `IMPLEMENTATION_PLAN_PHASE6.md`. De module is concreet voor te stellen als **Fase 7** van de lopende sitevernieuwing — niet eerder, omdat fase 0 (bronvalidatie) leunt op de credibility-cleanup uit fase 1 van het bestaande plan.

---

## Anchoring decisions (vooraf vastgelegd)

| Beslissing | Keuze | Onderbouwing |
|---|---|---|
| Taal van calculator & uitleg | **Nederlands (nl-BE)** | Matcht site-conventie en doelgroep. Brondocument is reeds in NL. |
| Architectuur | **Pure HTML + vanilla JS, één module** | Sluit aan op `IMPLEMENTATION_PLAN.md` decision "Stay pure HTML"; geen build-step → blijft GitHub-Pages-deploybaar; rekenkern is unit-testbaar in pure Node. Trade-off met Alpine.js besproken in [Deel 2](#deel-2--architectuur-tradeoff--aanbeveling); voor één feature-pagina weegt de uniformiteit met de rest van de site zwaarder dan de DX-winst van een micro-framework. |
| Bron-van-waarheid voor tarieven | **Eén lokaal `data/vlaamse-tarieven-2026.json`** met `lastUpdated` + initialen | V-test heeft geen publieke API/embed; live feed is niet haalbaar zonder server. Een gestructureerd tariefblad met expliciete review-datum is robuuster dan hardcoded constants verspreid over de code. |
| **Premies in v1: BUITEN de berekening** *(beslist 2026-05-24)* | Calculator rekent op **bruto investering excl. premies**. Resultaten­paneel toont een prominente footnote met deeplink naar `vlaanderen.be/mijnverbouwpremie` voor de actuele premie-info. | (a) Premie­bedragen zijn de meest volatiele factor (recent gewijzigd op 1 maart 2026; categorieën, plafonds, verhogingen). (b) Cat. 3 en lucht-lucht-cijfers konden niet onafhankelijk bevestigd worden → aansprakelijkheids­risico bij verkeerd bedrag. (c) De officiële simulator beslist sowieso — de calculator zou enkel een schatting bovenop een schatting leggen. (d) v1-scope krimpt aanzienlijk: minder velden, minder onderhoud, minder Fase-0-werk. **Premie-integratie verschuift naar v2 ([Fase 8](#fase-8--vervolg-v2--later-optioneel)).** |
| **BTW: 21% default, 6% bij volledige vervanging** *(verfijnd 2026-05-25)* | Calculator vraagt in uitgebreide modus: *"Wordt de bestaande verwarming volledig vervangen door deze warmtepomp?"* (ja/nee). Combineert dit met het al gevraagde bouwjaar om automatisch het btw-tarief te bepalen: **ja → 6%** (renovatie­regime ≥10j óf nieuwe 2026-regeling <10j); **nee → 21%**. Veld blijft overschrijfbaar. | Bevestigd via KB 18-12-2025 (Belgisch Staatsblad): lucht-lucht warmtepompen vallen expliciet onder de 6%-regeling vanaf 1 januari 2026 als ze bestemd zijn voor verwarming en de bestaande hoofdverwarming vervangen. Voor de typische AVYclima-klant die enkel een lucht-lucht systeem laat plaatsen naast een bestaande gas-/mazoutketel = 21%. Voor de klant die volledig overstapt (fossielvrij) = 6%. Eén ja/nee-vraag dekt dat onderscheid eerlijk. |
| Capaciteitstarief | **Fluvius Midden-Vlaanderen als default + Vlaams gemiddelde als referentie naast het veld** *(beslist 2026-05-25)* | Werkgebied (Aalst, Denderleeuw, Ninove) zit volledig in netgebied Fluvius Midden-Vlaanderen — dat tarief is het meest accurate. Vlaams gemiddelde wordt ernaast getoond ter context ("Ter vergelijking: het Vlaams gemiddelde bedraagt..."). Veld blijft overschrijfbaar voor klanten met afwijkend contract. Beide cijfers komen uit het door VREG goedgekeurde Fluvius-MV-tariefdocument 2026 (zie [Bijlage A](#bijlage-a--tariefblad-template-datavlaamse-tarieven-2026json)). |
| Twee modi | **Snel (5 velden, 30 sec) + Uitgebreid (~20 velden, 5 min)** | Snel = SEO/leadmagnet voor bovenkant funnel; Uitgebreid = beslissingsondersteuning voor wie offerte overweegt. Beide produceren een vergelijkbare output-structuur (incl. scenario-banden) zodat ze samenvloeien in dezelfde rapportpagina. **Veldenaantal in uitgebreide modus daalt van ~25 naar ~20 door premie-velden te verwijderen.** |
| Output | **Vier KPI's + grafiek + jaarkost-tabel + onzekerheidsbanner + premie-footnote + CTA** | KPI's: eenvoudige TVT (cash, exclusief premies), eenvoudige TVT (incrementeel, exclusief premies), netto besparing jaar 1, NPV over 15 jaar. Alles met onzekerheidsmarges. **Premie-footnote** verschijnt prominent boven elke TVT-KPI: "Bedrag exclusief premies — bekijk uw premie via de officiële simulator". |
| Lead-flow | **`contact.html` met URL-prefill van inputs en samenvatting** | Houdt formulierlogica op één plaats; Plausible event `Lead from Calculator` voor attributie. |
| Niet doen in v1-scope | **Geen premies, geen NPV-curve met dynamische uurprijzen, geen PV-koppeling, geen automatische download van V-test-data** | Te complex of te volatiel voor MVP. Worden geplaatst in v2 / Fase 8 (later) als de basismodule blijkt te converteren. |

---

## Verified findings — bronnen 1 t/m 10

Onderstaande tabel toont per bron uit het brondocument: wat erover beweerd wordt, wat onafhankelijke verificatie opleverde, en welke actie de calculator nodig heeft. **Belangrijke kanttekening:** drie officiële domeinen (`vlaanderen.be`, `vlaamsenutsregulator.be`, `fin.belgium.be`) konden in deze sessie niet rechtstreeks worden opgehaald wegens fetch-restricties. De cross-check is gebeurd via betrouwbare secundaire bronnen (Bouwunie, KBC, Energiehuis SOLVA, 3wplus, Selectra, CREG-monitor). **Een visuele controle op de officiële pagina's blijft een verplichte Fase 0-stap** vóór go-live.

| Bron | Cijfer/regel in document | Onafhankelijke vondst | Match | Actie |
|---|---|---|---|---|
| **B1** Mijn VerbouwPremie warmtepomp | Tabel met premies per categorie/type, plafonds 20/25/35/40/50% excl. btw, ingangsdatum 1 maart 2026 | Cat. 4 en cat. 1-2 deels bevestigd via secundaire bronnen; cat. 3 en lucht-lucht niet onafhankelijk bevestigd. Officiële pagina toont sinds 2026 geen statische tabel meer, alleen simulator. | **Niet relevant voor v1** | **Premies vallen buiten v1-scope** (zie anchoring decision). Voor v1: enkel **deeplink-URL** verifiëren. Voor v2 (Fase 8): volledig 3-stappen-validatieprotocol gedocumenteerd in `docs/tarieven-2026-screenshots/README.md`. |
| **B2** Mijn VerbouwPremie algemeen | Simulator + algemene wijzigingen 2026 | Bevestigd; deeplink-URL actief. | **Ja** | Voor v1: alleen verifiëren dat de deeplink-URL werkt — wordt gebruikt in de footnote onder de TVT-KPI's. |
| **B3** VREG capaciteitstarief | 53,39 €/kW/jaar excl. btw (Vlaams gemiddelde 2026), minimum 2,5 kW, update 23 april 2026 | Geverifieerd 2026-05-25 via directe fetch VREG-pagina: **53,39 €/kW/jaar excl. btw** bevestigd (eerdere secundaire schatting 52,95 was niet accuraat). Maandbasis 4,45 €/kW. Gemiddelde maandpiek Vlaanderen nov 2025 = 4,24 kW. Methodologie kwartierpiek → maandpiek → 12-maand-gemiddelde → 2,5 kW minimum bevestigd. | **Ja, geverifieerd** | Vlaams gemiddelde **53,39** als referentie in UI naast Fluvius MV-default 50,12. Brondocument had het cijfer correct. |
| **B4** V-test | Niet-commerciële prijsvergelijker voor gezinnen en KMO's | Bevestigd. Tool draait op `vtest.be` (gezinnen) en `vtest.vreg.be`. Dynamische tarieven ondersteund via Mijn V-test (Fluvius-koppeling). **Geen publieke API of embed.** | **Ja** | Calculator gaat geen V-test-data ophalen. Toon enkel een deeplink: "Controleer uw actuele elektriciteitsprijs op de V-test". |
| **B5** BTW 6% renovatie | 6% bij privewoning ≥10 jaar oud | Bevestigd. Voorwaarden: woning ≥10 jaar (eerste ingebruikname), >50% privé, geregistreerde aannemer levert + plaatst, factuurvermelding volstaat. | **Ja** | OK voor defaults. UI moet uitdrukkelijk vermelden: "Bij twijfel — vraag uw installateur en/of boekhouder bevestigen." |
| **B5 bis** BTW 6% warmtepomp vanaf 2026 | **Niet expliciet vermeld** in document | Vanaf **1 januari 2026** geldt opnieuw 6% btw specifiek voor warmtepompen, voor minimum 5 jaar. Dit is een aparte regeling náást de renovatie-≥10-jaar-regel. | **Lacune in document** | Calculator moet deze regeling expliciet noemen — anders schat hij de btw te hoog in voor nieuwbouw-warmtepompen. |
| **B6** BTW 21% fossiele installaties | "Sinds 2025 strengere regels"; hybride moet opgesplitst | Bevestigd, exacte ingangsdatum is **29 juli 2025**. Overgangsregeling: offertes ondertekend vóór 28 juli 2025 mogen tot 30 juni 2026 nog aan 6%. Hybride: factuur uitsplitsen, anders volledige factuur aan 21%. Forfaitaire verdeelmethode toegelaten. | **Ja, met nuances** | Hybride-modus in calculator moet expliciet waarschuwen: "BTW-uitsplitsing op factuur is verplicht — zonder uitsplitsing wordt het volledige bedrag belast aan 21%." |
| **B7** Fluvius m³ → kWh | Coëfficiënt impliciet "rond 11,2" | Geverifieerd 2026-05-25 via fetch: Fluvius publiceert geen enkel cijfer op publieke pagina — methodologie beschreven (CBW × klimaatcorrectie); detailwaarden per GOS op partner.fluvius.be. Sector­standaard H-gas Vlaanderen blijft ~11,5 kWh/m³. | **Ja, geverifieerd** | Default **11,5 kWh/m³**. Veld overschrijfbaar. Tooltip: "Exacte coëfficiënt staat op uw jaarafrekening." |
| **B8** Synergrid graaddagen | 16,5/16,5 referentie | Geverifieerd 2026-05-25 via fetch: 30-jaar norm (periode 1996-2025) = **2.187** (niet 2.087 zoals geschat); 2024 = 1.942; 2025 = 1.973; gemiddelde 2024-2025 = **1.958**. Klimaatopwarming bevestigd: norm − recent = 245 graaddagen. Equivalente graaddagen formule bevestigd (GDeq = 0,6×GD(D) + 0,3×GD(D-1) + 0,1×GD(D-2)). | **Ja, geverifieerd; cijfer herzien** | Default `HDD_reference` = **1.960** (afgerond recent 2-jaars gemiddelde). 30-jaar norm 2.187 als alternatief in tariefblad. |
| **B9** VREG dashboard elektriciteit | (geen specifiek cijfer geciteerd in document; voorbeeld gebruikt 0,30 €/kWh) | Geverifieerd 2026-05-25 via screenshot: Nov 2025 voor 3.500 kWh-gezin geeft **0,3317 €/kWh** all-in (gemiddelde). Bandbreedte: sociaal tarief 0,21; gewogen laagste 0,29; standaardtarief 0,35; gewogen hoogste 0,39. | **Ja, geverifieerd** | Default elektriciteitsprijs op **0,33 €/kWh** (Vlaams gemiddelde Nov 2025). Eerdere schatting van 0,25 was te optimistisch. Voorzichtig scenario (×1,15) ≈ 0,38 ≈ gewogen hoogste; optimistisch (×0,90) ≈ 0,30 ≈ gewogen laagste — scenario-band dekt de markt. |
| **B10** VREG dashboard aardgas | (voorbeeld gebruikt 0,08 €/kWh) | Geverifieerd 2026-05-25 via screenshot: april 2026 voor 17.000 kWh-gezin geeft **gemiddelde 0,1043 €/kWh** all-in. Bandbreedte: sociaal tarief 0,0504; standaardtarief 0,0781; gewogen laagste 0,0864; gewogen hoogste 0,1218. | **Ja, geverifieerd; default herzien** | Default **0,10 €/kWh** (Vlaams gemiddelde april 2026, afgerond). Voorzichtig scenario (×1,15) ≈ 0,115 ≈ gewogen hoogste; optimistisch (×0,85) ≈ 0,085 ≈ gewogen laagste — scenario-band dekt de markt. |

**Drie hoofdrisico's voor v1 (premies buiten scope):**

1. **Capaciteitstarief** — één Vlaams gemiddelde tonen leidt tot tot 18% mis­leiding afhankelijk van netbeheerder. Mitigatie: één Fluvius-tarief (werkgebied AVYclima) + overschrijfbaar veld.
2. **Defaults energieprijzen** — versnelt verouderen (gas-accijns +1× per jaar vanaf 2026; ETS-2 vanaf 2027). Mitigatie: jaarlijkse review-momenten + zichtbare `lastUpdated` in de UI.
3. **BTW-regels hybride warmtepomp** — overgangsregeling tot 30 juni 2026 en forfaitaire verdeling worden in de praktijk vaak verkeerd toegepast. Mitigatie: in v1 wordt btw gevraagd als enkel-cijfer input ("uw factuur staat op 6% of 21%?"); expliciete UI-waarschuwing als hybride gekozen wordt.

(Premie-risico vervalt voor v1 — premies vallen buiten de berekening. Het risico verschuift naar de footnote-URL: die moet werken én naar een actuele pagina leiden. Verifieerbaar in Fase 0 met één klik.)

---

## Deel 1 — Validatie van het brondocument

Deze sectie kijkt kritisch naar het rekenmodel zelf — niet de tarieven (dat doet de tabel hierboven) maar de methodologie en formules.

### 1.1 Wat is sterk in het voorstel

Het brondocument is methodologisch een van de beste consumentgerichte beschrijvingen die in het Nederlandstalig gebied vindbaar zijn. Concreet:

- **Onderscheid tussen SCOP/SPF en COP.** De expliciete waarschuwing om COP niet voor een jaarberekening te gebruiken voorkomt een zeer veel gemaakte fout in concurrentie-calculators.
- **Onderscheid cash-out vs incrementele methode.** Voor een installateur die met een klant praat van wie de oude ketel sowieso vervangen moet worden, is de incrementele methode de eerlijke vergelijking. Veel commerciële calculators tonen alleen cash-out en doen warmtepompen daarmee onrecht.
- **Sanitair warm water apart modelleren.** Stap 2 in het algoritme (`E_space = E_total - E_DHW - E_cooking - E_other`) voorkomt overschatting van de warmtevraag, dé klassieke fout.
- **Graaddagcorrectie.** Stap 3 normaliseert voor warme/koude winters. Voor een eerlijk gesprek met een klant die net een uitzonderlijk warme winter achter de rug heeft is dit essentieel.
- **Capaciteitstarief expliciet in de jaarkost.** Veel concurrenten negeren dit; de extra maandpiek door een warmtepomp kan honderden euro's per jaar uitmaken.
- **Koeling apart van verwarming.** De drie situaties (geen bestaande koeling / vervanging airco / passieve/geothermische koeling) zijn correct gemodelleerd. Vooral het waarschuwen dat nieuwe koeling de "besparing" verlaagt is intellectueel eerlijk.
- **Scenarioanalyse (voorzichtig/realistisch/optimistisch).** Een terugverdientijd als puntgetal is misleidend; banden zijn de juiste presentatie.
- **Plausibiliteitscontroles + lijst van veelgemaakte fouten.** Direct te vertalen naar UI-warnings.

### 1.2 Wat moet bijgesteld worden

**Tarieven en defaults (zie ook Verified findings):**

- Default **elektriciteitsprijs van 0,30 → 0,33 €/kWh** (Vlaams gemiddelde voor 3.500 kWh-profiel, VREG Nov 2025, geverifieerd 2026-05-25). Eerdere schatting van 0,25 €/kWh bleek onder zelfs het 'gewogen laagste contract' (0,288) te liggen — niet realistisch voor een typische klant. Met 0,33 €/kWh staat de calculator op het werkelijke Vlaams gemiddelde.
- Default **gas-omzetting van 11,2 → 11,5 kWh/m³** (H-gas in Vlaanderen).
- Default **gasprijs van 0,08 → 0,10 €/kWh** (Vlaams gemiddelde voor 17.000 kWh-profiel, VREG april 2026, geverifieerd 2026-05-25). Standaardtarief ligt op 0,078; gemiddelde over alle contracten 0,104. Op het gemiddelde rekenen geeft een eerlijker beeld van wat een doorsnee klant betaalt dan op het standaardtarief.
- Default **HDD_reference van 2.087 → 1.960** (klimaat-gecorrigeerd 2-jaars gemiddelde 2024-2025; geverifieerd via Synergrid 2026-05-25). Echte 30-jaar norm (periode 1996-2025) is **2.187** (niet 2.087 zoals eerder geschat). Verschil tussen norm en recent gemiddelde = 245 graaddagen → bevestigt klimaatopwarming trend.
- Default **capaciteitstarief**: bevestigd op **53,39 €/kW/jaar excl. btw** (Vlaams gemiddelde, VREG officieel, laatst bijgewerkt 23 april 2026); voor AVYclima werkgebied specifiek **Fluvius Midden-Vlaanderen: 50,12 €/kW/jaar excl. btw** (uit goedgekeurde tariefkaart). Beide getoond in UI.
- **BTW** — in v1 één manuele dropdown (6% of 21%) op de bruto investering. Geen pogingen om hybride uit te splitsen of de overgangs­regeling voor oude offertes te modelleren — dat wordt in een tooltip uitgelegd ("bij twijfel — vraag uw installateur/boekhouder").

**Premies (verschoven naar v2):** alle premie-gerelateerde aanpassingen die in een eerdere versie van dit document stonden (cat. 3-validatie, lucht-lucht-bedragen, verhoging-logica, hybride-uitsluitingen, btw 6% specifieke warmtepompregeling vanaf 1 jan 2026) blijven gedocumenteerd in `docs/tarieven-2026-screenshots/README.md` als referentie voor wanneer Fase 8 (premie-integratie) wordt opgepakt.

**Formuleringsverbeteringen:**

- **Stap 4 — DHW-rendement apart.** Het document gebruikt impliciet hetzelfde `eta_old` voor ruimteverwarming en sanitair warm water. In de praktijk produceren combi-ketels DHW typisch aan ~75–85% rendement (lager dan voor verwarming) vanwege stilstandsverliezen en hertelden warmwater. Splits `eta_old_space` en `eta_old_DHW` in de inputstructuur.
- **Stap 7 — eenduidige naamgeving.** Het document gebruikt zowel `E_HP_total_heating` (stap 7) als `E_HP_total` (stap 9) en `E_HP_heating` (pseudocode). Eén consistente naam afspreken (`E_HP_heating_total`) is nodig vooraleer de pseudocode in code wordt vertaald.
- **Stap 9 — koeling-elektriciteit ontbreekt in C_new-formule.** De geschreven formule `C_new = E_HP_total * P_electricity + E_backup_fuel * P_backup + C_fixed_new + C_maintenance_new + Delta_C_capacity` neemt E_cooling impliciet mee als E_HP_total dat omvat — maar dat is uit de definitie van `E_HP_total_heating` in stap 7 (`= E_HP_space + E_HP_DHW + E_aux`) niet duidelijk. De pseudocode in sectie 9 doet het wél correct (`(E_HP_heating + E_cooling) * P_electricity`). Maak de hoofdformule symmetrisch.
- **Stap 6 — share_HP_space bij hybride is niet alleen één getal.** In de praktijk hangt de fractie die de warmtepomp dekt af van het bivalent punt en de buitentemperatuur-verdeling van het lokale klimaat. Voor MVP volstaat een instelbare fractie 0,7–0,9 met een tooltip; voor Fase 8 (geavanceerd) kan dit uit een stooklijn-tabel komen.

### 1.3 Wat ontbreekt — en waarom dat ertoe doet

**PV / zelfverbruik.** Het document vermeldt het maar werkt het niet uit. Voor een installateur in Vlaanderen is dit erg relevant: een gezin met PV en een warmtepomp heeft een fundamenteel andere effectieve elektriciteitsprijs dan een gezin zonder. Concreet:

```
P_eff = (1 - α) * P_grid + α * P_self_consumed
```

waarbij α de jaarlijkse zelfverbruiksfractie van de warmtepomp is (typisch 0,15–0,35 bij standaard PV zonder sturing; 0,30–0,55 met slimme sturing/buffervat). `P_self_consumed` ≈ `P_grid` − `P_injection_compensation`. Voor MVP volstaat een slider 0–50% met educatieve uitleg. Voor Fase 8: koppeling met een PV-installatiebestand.

**Dynamische tarieven (uurprijs).** Steeds meer gezinnen in Vlaanderen hebben dynamische contracten. Een warmtepomp kan ploeger ploegen met goedkope nachturen voor sanitair warm water en buffervat-laden. Voor MVP volstaat dezelfde slider als bij PV: "% verbruik op goedkope uren". Voor Fase 8: koppeling met Mijn V-test of een Belpex-curve.

**Vermeden CO₂-belasting / accijnzen op fossielen.** De Belgische gas-accijns stijgt vanaf 2026 jaarlijks volgens een vastgelegd pad. Een TCO over 15 jaar die deze stijging negeert overschat de aantrekkelijkheid van behoud van de gasketel. De prijs-escalatiefactor in stap 12 (`Cashflow_t = C_old_t − C_new_t`) moet voor gas hoger zijn dan voor elektriciteit, niet symmetrisch.

**ETS-2 / koolstofheffing 2027.** Vanaf 1 januari 2027 valt verwarmen op fossiele brandstoffen onder EU ETS-2 (apart van EU ETS-1). De startprijs is hoger dan de huidige nationale gas-accijns en de prijs is volatiel. Voor een NPV over 15 jaar is dit een belangrijke factor; het document negeert het. In de calculator: een lichtgrijze "scenario ETS-2"-toggle.

**Restwaarde van de installatie + vervangingen.** De warmtepomp (12–15 jaar levensduur), de gasketel (15–20 jaar), het buffervat, de circulatiepomp — elk heeft een eigen levensduur. Bij een TCO over 15 jaar moet ofwel een restwaarde getoond of een vervangingsmoment ingebouwd worden. Document negeert dit. Voor MVP: één kolom `restwaarde_jaar_15` met een lineaire afschrijvingsdefault.

**EPB-impact / waardestijging woning.** Een warmtepomp verlaagt het E-peil; in Vlaanderen kan dat zich vertalen in een hogere verkoopprijs en een toekomstige vrijstelling onroerende voorheffing (recent gewijzigd). Niet kwantificeerbaar per individueel geval, maar belangrijk om te vermelden in het leerplatform-deel.

**Comfort + geluid + koeling als comfortwaarde.** Niet financieel modelleerbaar maar wel cruciaal voor de aankoopbeslissing. Het brondocument noemt comfort terloops; voor het leerplatform moet er een aparte sectie over zijn (geen formule, wel uitleg).

**Vlaams Energiehuis renteloos lening / overheidskrediet.** Voor sommige categorieën kan een renteloos krediet bestaan dat de feitelijke investerings­kost verlaagt zonder dat het bedrag een "premie" is. **Buiten v1-scope** — wordt samen met premies in v3 / Fase 8 onderzocht. In het leerplatform-deel wel kort vermelden als "kijk ook naar renteloze leningen via uw gemeente of het Vlaams Energiehuis".

### 1.4 Doorlichting van het rekenvoorbeeld (v1, zonder premies)

Het brondocument geeft één uitgewerkt voorbeeld dat eindigt op een eenvoudige terugverdientijd die "oninteressant" wordt genoemd door een S_year van 42 €. Dat klopt rekenkundig — maar het maakt het voorbeeld pedagogisch slecht: een lezer die niet doorvoelt waarom alles zo on the edge zit haakt af. Twee correcties die we in de v1-calculator wél meenemen:

**Correctie A — defaults op mei 2026:**

| Parameter | Document | Plan v1 (geverifieerd) | Effect |
|---|---|---|---|
| P_electricity | 0,30 €/kWh | **0,33 €/kWh** (VREG Nov 2025 gemiddelde 3.500 kWh-profiel) | C_new stijgt licht t.o.v. document |
| P_gas | 0,08 €/kWh | **0,10 €/kWh** (VREG april 2026 gemiddelde 17.000 kWh-profiel) | C_old stijgt evenredig — ratio elek/gas blijft gunstig voor warmtepomp |
| SPF_space | 3,6 | 3,8 (realistisch voor nieuwe lucht/water op vloerverwarming) | E_HP daalt |
| eta_old (DHW apart) | 0,90 voor alles | 0,90 ruimte / 0,80 DHW | Q_DHW = 2500 × 0,80 = 2000 → E_HP_DHW = 800 kWh |

Met deze defaults én **zonder premie** (v1). Dit voorbeeld gebruikt **lucht-water** als systeem (zoals het brondocument) waarvoor 6% btw geldt onder het renovatie­regime (woning ≥10 jaar). Voor de typische AVYclima-klant met lucht-lucht zou 21% btw gelden — zie [Anchoring decisions](#anchoring-decisions-vooraf-vastgelegd).

```
Q_space      = 14500 × 0,90 = 13.050 kWh
Q_DHW        = 2.500 × 0,80 = 2.000  kWh
E_HP_space   = 13.050 / 3,8 = 3.434 kWh
E_HP_DHW     = 2.000  / 2,5 = 800   kWh
E_HP_total   = 4.234 kWh
C_old        = 17.000 × 0,10 + 340 = 2.040 €/jaar
C_new        = 4.234 × 0,33 + 300 = 1.697 €/jaar
S_year       = 343 €/jaar
I_cash       = 16.000 × 1,06 = 16.960 € (lucht-water + renovatie ≥10j → 6% btw, GEEN premie afgetrokken)
I_incremental = 16.960 − 7.000 (vermeden nieuwe gasketel) = 9.960 €
PB_cash       = 16.960 / 343 = 49,4 jaar — niet relevant; ketel moet sowieso vervangen worden
PB_incremental = 9.960 / 343 = 29,0 jaar
```

**Sanity check via prijsverhouding:** P_elek/P_gas = 0,33/0,10 = **3,3** versus SPF/eta_old = 3,8/0,9 = **4,22**. Verschil is **0,9 punten** in het voordeel van de warmtepomp — comfortabel boven break-even. Dit klopt met de marktrealiteit: gas-accijns stijgt jaarlijks vanaf 2026, elek-nettarieven dalen → ratio sluit zich verder de komende jaren, ten voordele van warmtepompen.

**Bij lucht-lucht + 21% btw** zou I_cash worden: `16.000 × 1,21 = 19.360 €`, I_incremental = 12.360 €, PB_incremental = 36,0 jaar. Nog steeds een lange terugverdientijd zonder premie. De verkoopboodschap voor lucht-lucht moet daarom **niet primair op TVT** rusten — wel op:
- Comfort (koeling + verwarming in één toestel)
- Toekomstige fossielprijs-stijging (gas-accijns omhoog vanaf 2026; ETS-2 vanaf 2027)
- CO₂-impact / EPB-verbetering
- Vermijden van vervangingsinvestering bij einde levensduur huidige ketel
- **Premies** (cat. 3 = €4.500 extra, cat. 4 = €6.000+ — kan de NPV duidelijk positief duwen)

Dit is precies waarom de premie-footnote prominent in het resultaten­paneel staat: zonder premie is de rekenkundige TVT lang; mét premie en escalatie verandert het verhaal dramatisch.

**Correctie B — escalatie inrekenen:**

Het document neemt **geen prijsescalatie** mee, terwijl de gas-accijns in Vlaanderen stijgt en het uitfaseren van fossiele subsidies de gasprijs over 15 jaar systematisch zal opdrijven. Met een conservatieve escalatie van +3% nominaal/jaar voor gas en +1% voor elektriciteit (geijkt op CREG-data):

```
NPV over 15 jaar bij r = 3%, S_year_0 = 343 €:
- zonder escalatie:                          NPV = 4.069  − 9.960 = −5.891 €
- met escalatie (S_year groeit ~2,5%/jaar):  NPV = 5.200  − 9.960 = −4.760 €
- met escalatie + premie €1.500 (later):     NPV = 5.200  − 8.460 = −3.260 €
- met escalatie + premie €4.500 (later):     NPV = 5.200  − 5.460 = −  260 €
```

**Conclusie:** zonder premie ligt de v1-uitkomst voor dit profiel duidelijk in negatief NPV-gebied. **Dat is het eerlijke verhaal** — en precies de reden om premies via een prominente footnote naar de officiële simulator te doorverwijzen, in plaats van ze in een tabel te smokkelen die de uitkomst over een drempel duwt. De klant ziet eerst de cijfers zónder hulp, en kan dan zelf de premie via de officiële kanalen toepassen op de getoonde bruto investering.

**Pedagogisch effect:** een voorzichtige eerlijke berekening die met een klik op de premie-simulator gunstiger kan worden uitvallen, is overtuigender dan een optimistisch geheel waarin we de premie zelf hebben gekozen. Het rechtvaardigt ook de scenario-banden (voorzichtig/realistisch/optimistisch) als hoofdpresentatie en de NPV over 15 jaar i.p.v. puntschattingen.

**Het rekenvoorbeeld in het brondocument vervangen** door deze variant — anders verlaat de lezer de pagina denkende dat warmtepompen financieel zelden de moeite zijn, terwijl het echte verhaal is: met realistischere defaults én een premie (die voor cat. 3 €4.500 kan bedragen) komt het NPV-niveau bijna op nul, en mét volledig verhoogde premie (cat. 4 / gebied zonder aardgas) duidelijk positief — vooral bij vervanging van een verouderde gasketel of mazoutketel.

---

## Deel 2 — Architectuur trade-off & aanbeveling

### 2.1 Vier opties vergeleken

| Optie | Build-step | Past bij IMPLEMENTATION_PLAN? | Onderhoudslast | Geschiktheid voor formulier-zware UI | Aanbevolen? |
|---|---|---|---|---|---|
| **A. Pure HTML + vanilla JS** (één module `js/terugverdientijd.js`) | Geen | Ja — match met "Stay pure HTML" decision | Laag | Voldoende mits goede architectuur (zie 2.2) | **Ja** |
| **B. Alpine.js via CDN** (~15 kB, declarative reactivity in HTML) | Geen | Bijna — voegt één externe dep toe maar geen build | Laag-medium | Uitstekend voor 20+ velden + scenario's | Tweede keuze |
| **C. Astro/Vue/SvelteKit** met build → static export | Ja (vereist CI) | Nee — breekt GitHub Pages deploy zonder Action | Medium-hoog (build-pipeline, dep-updates) | Uitstekend | Niet voor één feature |
| **D. Web Components (vanilla custom elements)** | Geen | Ja | Medium (veel boilerplate voor reactivity) | Voldoende, verbose | Niet aanbevolen |

### 2.2 Aanbeveling: Optie A — pure HTML + vanilla JS, gedisciplineerd opgebouwd

De `IMPLEMENTATION_PLAN.md` heeft "Stay pure HTML" expliciet als anchoring decision vastgelegd. Een framework introduceren voor één pagina is een precedent dat gevolgen heeft voor de overige 33 pagina's. **Daarom**: vanilla JS, maar gestructureerd alsof het wél een framework was. Concreet:

**Architecturale principes**

1. **Scheiden: kern, view, glue.**
   - **Kern** (`js/terugverdientijd-core.js`): pure rekenfuncties + tariefblad + defaults. Geen DOM-referenties. Volledig unit-testbaar via Node.
   - **View** (`js/terugverdientijd-view.js`): render-functies die een resultaat-object naar HTML mappen. Idempotent: zelfde input → zelfde HTML.
   - **Glue** (`js/terugverdientijd.js`): event-listeners, state-container, validatie. Linkt input-velden aan kern en kern-output aan view.

2. **Eén state-object, één render-functie.** Geen verspreide DOM-mutaties. Bij elke input-wijziging: lees alle velden → bouw state-object → bereken → render volledige resultaat-paneel opnieuw. Voor 30 inputs en een kleine output is dit ruim snel genoeg (<5 ms).

3. **Pure rekenfuncties zonder side effects.** Elke functie krijgt expliciet alle parameters die ze nodig heeft; geen lookups in globals. Maakt unit-tests triviaal.

4. **Tariefblad als datafile.** `data/vlaamse-tarieven-2026.json` met `lastUpdated`, `reviewedBy`, en alle veranderlijke cijfers. Code haalt dit één keer op bij page load en geeft het door aan de rekenkern. Update = JSON wijzigen + `lastUpdated` bijwerken.

5. **Geen build, geen transpilatie.** Schrijf in ES2020 (alle moderne browsers ondersteunen het). Optioneel: één Plausible custom event op resultaat­productie.

### 2.3 Bestandsstructuur

Plaats in de bestaande layout:

```
avyclima/
├── terugverdientijd-warmtepomp.html       # nieuwe pagina (calculator)
├── glossarium-warmtepomp.html              # nieuwe pagina (leerplatform-extensie, SEO-bonus)
├── data/
│   └── vlaamse-tarieven-2026.json          # nieuwe data-folder, single source of truth
├── js/
│   ├── main.js                             # bestaand (ongewijzigd)
│   ├── terugverdientijd-core.js            # rekenkern + tariefblad-loader
│   ├── terugverdientijd-view.js            # render-functies (HTML-templates als template strings)
│   └── terugverdientijd.js                 # state + glue
├── css/
│   └── style.css                           # bestaand; uitgebreid met `.calc-*` blok
└── docs/
    └── tarieven-2026-screenshots/          # visuele verificatie-snapshots (Fase 0)
        ├── README.md                       # bronvalidatie-werkblad (v1 + v2-uitklap)
        ├── B1-footnote-deeplink-2026-05-24.png      # v1: enkel deeplink-check
        ├── B3-vreg-capaciteitstarief-2026-05-24.png
        ├── B7-fluvius-omzetting-2026-05-24.png
        ├── B8-synergrid-graaddagen-2026-05-24.png
        └── checked-by.md                   # wie heeft wanneer welk cijfer bevestigd
```

**Geen wijziging aan bestaande globale assets.** `main.js` blijft ongemoeid (mobile nav, FAQ accordion, cookie banner, etc.). De drie nieuwe JS-files worden alleen geladen op de calculator-pagina.

---

## Deel 3 — UX & learning-flow ontwerp

De ambitie van de module is dubbel: rekenen én leren. Beide doelen botsen op de meeste calculator­pagina's: te veel uitleg en niemand begint, te weinig en de klant snapt het resultaat niet. Het ontwerp lost dat op met **progressive disclosure** als grondprincipe.

### 3.1 Twee modi op één pagina

| Modus | Inputs | Duur | Doel | Output |
|---|---|---|---|---|
| **Snel** | 5 velden: adres/postcode, woningtype + jaartal, huidig systeem + jaarverbruik, warmtepomp-type, scenario (3-stand slider) | ~30 sec | SEO/lead­magnet, bovenkant funnel | Indicatieve TVT-band (3 scenario's, exclusief premies), netto besparing jaar 1 |
| **Uitgebreid** | ~20 velden: zoals snel + isolatie, afgiftetemperatuur, DHW-verbruik, SPF-aanname, prijs-overrides, capaciteits­tarief, btw-tarief (6%/21%), escalatie, PV α | ~5 min | Beslissings­ondersteuning voor wie offerte over­weegt | Volledige rapportpagina met grafiek, jaarkost-tabel, NPV (excl. premies), comfort/CO₂-banner, premie-footnote |

**v1 sluit premies uit** (zie anchoring decision). Geen premie-categorie-dropdown, geen "gebied zonder aardgas"-toggle, geen "vervanging elektrische weerstand"-toggle. Alle premie-informatie staat in een prominente footnote onder de TVT-KPI's (zie [3.3](#33-resultatenpaneel)).

**Modus-toggle** bovenaan: één knop "Toon uitgebreide vragen" die niet de pagina vervangt maar de extra velden inschuift onder elke sectie. Snelle gebruikers worden niet gestoord; gevorderde gebruikers krijgen alles op één scroll.

### 3.2 Progressive disclosure pattern

**Elke input heeft drie lagen:**

1. **Label + veld** — de zichtbare basis.
2. **Tooltip ("i"-knop, 1–2 zinnen)** — verschijnt op klik of hover, beantwoordt "wat moet ik hier invullen?".
3. **Uitleg-paneel (klik op "Meer uitleg" link)** — een inschuif-panel met 1–2 alinea's: definitie + waarom dit cijfer ertoe doet + hoe je het terugvindt op je factuur/EPC + welke fout je het vaakst maakt.

**Voorbeeld voor SPF-veld:**
- Label: "Verwachte SPF voor ruimteverwarming"
- Tooltip: "Seizoensprestatie — gemiddeld rendement over een jaar. Hoger is beter."
- Uitleg-paneel: 
  > De SPF (Seasonal Performance Factor) zegt hoeveel kWh warmte uw warmtepomp gemiddeld per jaar produceert per kWh elektriciteit. Een SPF van 4 betekent dat 1 kWh elektriciteit 4 kWh warmte oplevert.
  >
  > Verwar SPF niet met de COP die op het toestel staat: de COP is een meetpunt, de SPF is de jaarprestatie in uw woning. Voor moderne lucht/water-warmtepompen op vloerverwarming is een realistische SPF tussen 3,5 en 4,2. Op hoge-temperatuur-radiatoren ligt dat eerder rond 2,8–3,3.
  >
  > De installateur kan een SPF schatten op basis van uw afgiftetemperatuur en woningberekening. Vraag dit expliciet — het is de belangrijkste parameter voor uw stookkost.

**Glossarium-pagina.** Naast de inline uitleg krijgt elke term in de uitleg-tekst een link naar `glossarium-warmtepomp.html` (één pagina, alle termen). SEO-bonus: deze pagina trekt long-tail zoekopdrachten ("wat is SPF warmtepomp", "hoe lees ik kWh op gasfactuur").

### 3.3 Resultaten-paneel

Vier KPI-kaarten boven de grafiek, elk met een kleine "**excl. premies**"-tag in de hoek:

| KPI | Wat het toont | Onzekerheid |
|---|---|---|
| **Eenvoudige terugverdientijd — cash** *(excl. premies)* | I_cash_bruto / S_year | Band: voorzichtig–optimistisch |
| **Eenvoudige terugverdientijd — incrementeel** *(excl. premies)* | I_incremental_bruto / S_year | Band: voorzichtig–optimistisch |
| **Netto besparing jaar 1** | C_old − C_new | Met scenario-band |
| **NPV over 15 jaar** *(excl. premies)* | met discontovoet, escalatie | Met scenario-band + tooltip "wat is NPV?" |

**Direct onder de KPI-strip — prominente premie-footnote (cyan banner):**

> 💡 **Premies zijn niet meegeteld in deze berekening.** Afhankelijk van uw inkomenscategorie, het type warmtepomp en de aanvraagdatum kan de Vlaamse overheid een premie van **€300 tot €9.600** uitbetalen (Mijn VerbouwPremie). Dit verlaagt uw netto investering en dus uw terugverdientijd. Voor uw concrete situatie — [bekijk de officiële simulator op vlaanderen.be →](https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie).

De banner is visueel prominent (cyan accent, niet weg te scrollen) zodat geen enkele klant per ongeluk gelooft dat dit het netto verhaal is. Klikgedrag op de deeplink wordt getrackt met Plausible event `Premie Simulator Click` voor latere conversie-analyse.

Onder de footnote:

- **Grafiek** — gecumuleerde besparing vs bruto investering, jaar 0 t/m 20. Drie lijnen (3 scenario's). Y-as in € (gecumuleerd). Snijpunt met x-as = TVT. Inline SVG, geen extra library nodig. Subtitel: "Premies kunnen deze curves verder verbeteren — niet weergegeven."
- **Tabel — jaarlijkse kost vergelijking.** Oud vs nieuw, gesplitst: energie, vaste kosten, onderhoud, capaciteitstarief. Toont waar het verschil zit.
- **Niet-financiële indicatoren.** Drie cards:
  - CO₂-impact: kg/jaar vermeden (uit standaard emissiefactoren).
  - Koeling: ja/nee met uitleg "extra comfort, extra elektriciteit".
  - Toekomstbestendigheid: korte tekst over ETS-2, gas-accijns, EPB.
- **Onzekerheidsbanner.** Lijst van inputs die op default staan (gebruiker heeft niet aangepast). "Uw resultaat is een goede schatting. De volgende velden staan op standaardwaarde — voor een offerte vragen we een plaatsbezoek waarbij we elk getal exact bepalen."
- **CTA-blok.** Twee knoppen: "Persoonlijke offerte aanvragen" (naar `contact.html` met URL-prefill) en "Bekijk officiële premie-simulator" (naar vlaanderen.be — zelfde deeplink als in de footnote, maar nu een primary button).
- **Print/PDF-knop.** `window.print()` met aparte print-stylesheet die het rapport opmaakt. Print-versie behoudt de premie-footnote prominent — zodat een uitgeprint rapport niet zonder context circuleert.

### 3.4 Mobiele flow

Op smal scherm (<768 px):
- Modus-toggle blijft bovenaan.
- Inputs in één kolom, op natuurlijke groepen gesplitst met sticky "Volgende sectie"-knop voor wie het sequentieel wil doorlopen.
- KPI-kaarten worden 2×2 grid → 1 kolom.
- Grafiek-hoogte aangepast voor portrait.
- Tooltips: op tap volledige modale (geen hover op touch).

### 3.5 CTA naar offerte met URL-prefill

`contact.html?bron=calculator&samenvatting=base64(...)` waar samenvatting een minimal subset is: postcode, woningtype, huidig systeem, warmtepomp-type, indicatieve TVT. Het bestaande contactformulier krijgt een verborgen veld dat dit toont aan AVYclima in de mail.

Plausible custom events:
- `Calculator Started` — bij eerste input
- `Calculator Completed` — bij volledige doorrekening (modus + scenario)
- `Lead from Calculator` — bij submit op contact-pagina met `bron=calculator`

### 3.6 Toegankelijkheid

- Semantische HTML — `<form>`, `<fieldset>` per sectie, `<label>` voor elk veld.
- Tooltips bereikbaar via toetsenbord (`<button>` met `aria-describedby`).
- Resultaten met `aria-live="polite"` zodat screenreaders updates aankondigen zonder elke wijziging te onderbreken.
- Kleurcontrast minimum AA — gebruik bestaande `--primary` en `--accent` uit `css/style.css`.
- Geen kritieke informatie alleen in kleur (groen/rood; voeg "✓" / "⚠" toe).
- Focus-management: na "bereken" springt focus naar de eerste KPI-kaart.
- Geen onverwachte tabverstoringen.

---

## Deel 4 — Datamodel & pseudocode

### 4.1 Input-schema (uitgebreide modus)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TerugverdientijdInput",
  "type": "object",
  "required": ["project", "building", "old_system", "heat_pump", "prices", "investment"],
  "properties": {
    "project": {
      "type": "object",
      "properties": {
        "region":           { "const": "Flanders" },
        "postal_code":      { "type": "string", "pattern": "^[1-9][0-9]{3}$" },
        "application_date": { "type": "string", "format": "date" },
        "calculation_mode": { "enum": ["quick", "detailed"] }
      },
      "required": ["postal_code", "application_date"]
    },
    "building": {
      "type": "object",
      "properties": {
        "type":             { "enum": ["open", "halfopen", "rij", "appartement"] },
        "heated_area_m2":   { "type": "number", "minimum": 20, "maximum": 1000 },
        "build_year":       { "type": "integer", "minimum": 1800, "maximum": 2030 },
        "insulation_level": { "enum": ["onbekend", "laag", "gemiddeld", "hoog", "passief"] },
        "hdd_actual":       { "type": "number", "minimum": 1000, "maximum": 3000 },
        "hdd_reference":    { "type": "number", "minimum": 1500, "maximum": 2500 }
      }
    },
    "old_system": {
      "type": "object",
      "properties": {
        "fuel":              { "enum": ["gas", "mazout", "pellets", "elektrisch", "stadsverwarming"] },
        "annual_consumption":{ "type": "number", "minimum": 0 },
        "unit":              { "enum": ["kWh", "m3", "liter", "kg"] },
        "conversion_factor": { "type": "number", "default": 11.5 },
        "dhw_share_fuel":    { "type": "number", "minimum": 0, "maximum": 1, "default": 0.15 },
        "cooking_share_fuel":{ "type": "number", "minimum": 0, "maximum": 1, "default": 0 },
        "efficiency_space":  { "type": "number", "minimum": 0.5, "maximum": 1.0, "default": 0.90 },
        "efficiency_dhw":    { "type": "number", "minimum": 0.5, "maximum": 1.0, "default": 0.80 },
        "fixed_costs":       { "type": "number", "minimum": 0, "default": 160 },
        "maintenance_costs": { "type": "number", "minimum": 0, "default": 180 },
        "remaining_life":    { "type": "integer", "minimum": 0, "default": 5 },
        "gas_for_cooking_dhw_after_switch": { "type": "boolean", "default": false }
      }
    },
    "heat_pump": {
      "type": "object",
      "properties": {
        "type":              { "enum": ["lucht_water", "lucht_lucht", "geothermisch", "hybride_lucht_water"] },
        "spf_space":         { "type": "number", "minimum": 1.5, "maximum": 6.0, "default": 3.8 },
        "spf_dhw":           { "type": "number", "minimum": 1.5, "maximum": 4.0, "default": 2.5 },
        "share_space":       { "type": "number", "minimum": 0, "maximum": 1, "default": 1.0 },
        "share_dhw":         { "type": "number", "minimum": 0, "maximum": 1, "default": 1.0 },
        "cooling_enabled":   { "type": "boolean", "default": false },
        "seer":              { "type": "number", "minimum": 2.0, "maximum": 8.0, "default": 4.0 },
        "cooling_demand_kwh":{ "type": "number", "minimum": 0, "default": 0 },
        "backup_efficiency": { "type": "number", "minimum": 0.5, "maximum": 1.0, "default": 0.90 },
        "aux_electricity_pct":{ "type": "number", "minimum": 0, "maximum": 0.10, "default": 0.03 },
        "peak_power_increase_kw": { "type": "number", "minimum": 0, "default": 1.5 },
        "smart_steering":    { "type": "boolean", "default": false }
      }
    },
    "prices": {
      "type": "object",
      "properties": {
        "electricity_eur_per_kwh": { "type": "number", "minimum": 0.05, "maximum": 1.0, "default": 0.33, "description": "Vlaams gemiddelde voor 3.500 kWh-gezin (VREG, Nov 2025). Geverifieerd 2026-05-25." },
        "gas_eur_per_kwh":         { "type": "number", "minimum": 0.02, "maximum": 0.50, "default": 0.10, "description": "Vlaams gemiddelde voor 17.000 kWh-gezin (VREG, april 2026). Geverifieerd 2026-05-25." },
        "oil_eur_per_liter":       { "type": "number", "minimum": 0.5, "maximum": 3.0, "default": 1.10 },
        "pellet_eur_per_kg":       { "type": "number", "minimum": 0.2, "maximum": 1.0, "default": 0.42 },
        "capacity_tariff_eur_per_kw_year": { "type": "number", "default": 52.95 },
        "electricity_escalation_pct": { "type": "number", "default": 0.01 },
        "gas_escalation_pct":         { "type": "number", "default": 0.03 },
        "discount_rate_pct":          { "type": "number", "default": 0.03 },
        "self_consumption_share":     { "type": "number", "minimum": 0, "maximum": 0.7, "default": 0 },
        "injection_compensation_eur_per_kwh": { "type": "number", "default": 0 }
      }
    },
    "investment": {
      "type": "object",
      "properties": {
        "gross_cost_excl_vat":         { "type": "number", "minimum": 0 },
        "replaces_existing_heating":   { "type": "boolean", "default": false, "description": "True als deze warmtepomp de bestaande hoofdverwarming volledig vervangt (gas-/mazoutketel weg, woning fossielvrij voor ruimteverwarming). Bepaalt mee de vat_rate via afgeleide logica." },
        "vat_rate":                    { "type": "number", "enum": [0.06, 0.21], "default": 0.21, "description": "Afgeleid: 0.06 als replaces_existing_heating=true; anders 0.21. Geldt voor alle warmtepomp-types (lucht-lucht, lucht-water, geothermisch). Voor woning ≥10j via renovatie­regime; voor <10j via nieuwe 2026-regeling (KB 18-12-2025, geldig tot eind 2030). Handmatig overschrijfbaar." },
        "avoided_replacement_cost":    { "type": "number", "minimum": 0, "default": 0 }
      }
    },
    "scenario": {
      "type": "object",
      "properties": {
        "preset": { "enum": ["voorzichtig", "realistisch", "optimistisch", "custom"], "default": "realistisch" }
      }
    }
  }
}
```

### 4.2 Output-schema

```json
{
  "title": "TerugverdientijdOutput",
  "type": "object",
  "properties": {
    "annual_savings_eur":          { "type": "number" },
    "annual_savings_band":         { "type": "object", "properties": { "low":{"type":"number"}, "mid":{"type":"number"}, "high":{"type":"number"} } },
    "payback_cash_years":          { "type": ["number","null"], "description": "exclusief premies" },
    "payback_cash_band":           { "type": "object" },
    "payback_incremental_years":   { "type": ["number","null"], "description": "exclusief premies" },
    "payback_incremental_band":    { "type": "object" },
    "npv_15y_eur":                 { "type": "number", "description": "exclusief premies" },
    "npv_15y_band":                { "type": "object" },
    "c_old_breakdown":             { "type": "object", "properties": { "energy":{}, "fixed":{}, "maintenance":{}, "capacity":{} } },
    "c_new_breakdown":             { "type": "object", "properties": { "energy":{}, "fixed":{}, "maintenance":{}, "capacity":{}, "backup_fuel":{}, "cooling":{} } },
    "e_hp_heating_kwh":            { "type": "number" },
    "e_hp_dhw_kwh":                { "type": "number" },
    "e_hp_cooling_kwh":            { "type": "number" },
    "co2_saved_kg_per_year":       { "type": "number" },
    "warnings":                    { "type": "array", "items": { "type": "string" } },
    "defaults_used":               { "type": "array", "items": { "type": "string" } },
    "cumulative_savings_per_year": { "type": "array", "items": { "type": "number" } }
  }
}
```

Geen `estimated_premium_eur` — premies vallen buiten v1-scope. De UI toont in de plaats een statische footnote met deeplink naar de officiële simulator.

### 4.3 Scenario-multipliers

Toegepast op een neutrale `realistic` basis-input:

| Parameter | Voorzichtig | Realistisch | Optimistisch |
|---|---|---|---|
| `electricity_eur_per_kwh` | × 1,15 | × 1,00 | × 0,90 (zelfverbruik) |
| `gas_eur_per_kwh` | × 0,85 | × 1,00 | × 1,15 |
| `spf_space` | × 0,90 | × 1,00 | × 1,10 |
| `gross_cost_excl_vat` | × 1,10 | × 1,00 | × 0,95 |
| `capacity_tariff_kw_addition` | × 1,30 (geen sturing) | × 1,00 | × 0,60 (slimme sturing) |
| `electricity_escalation_pct` | 0,00 | 0,01 | 0,01 |
| `gas_escalation_pct` | 0,02 | 0,03 | 0,05 (incl. ETS-2) |

(Geen `estimated_premium` scenario-multiplier — premies vallen buiten v1.)

### 4.4 Rekenfuncties — concrete implementatie (vereenvoudigd JS-pseudo)

Hieronder de **kern**-functies. Volledig DOM-vrij, direct unit-testbaar.

```javascript
// js/terugverdientijd-core.js  — pseudo

export function convertToKwh(quantity, unit, conv) {
  switch (unit) {
    case 'kWh':   return quantity;
    case 'm3':    return quantity * conv;           // default 11.5 voor H-gas Vlaanderen
    case 'liter': return quantity * 10.0;           // mazout ~10 kWh/L
    case 'kg':    return quantity * 4.8;            // pellets ~4.8 kWh/kg
    default: throw new Error('Onbekende eenheid: ' + unit);
  }
}

export function splitFuelByUse(eTotalKwh, dhwShare, cookingShare) {
  const eDhw     = eTotalKwh * dhwShare;
  const eCooking = eTotalKwh * cookingShare;
  const eSpace   = eTotalKwh - eDhw - eCooking;
  return { eSpace, eDhw, eCooking };
}

export function normalizeForWeather(eSpace, hddActual, hddReference) {
  if (!hddActual || !hddReference) return eSpace;
  return eSpace * (hddReference / hddActual);
}

export function usefulHeat(eFuelKwh, efficiency) {
  return eFuelKwh * efficiency;
}

export function heatPumpElectricity(qUseful, spf, auxPct) {
  const eBase = qUseful / spf;
  return eBase * (1 + auxPct);
}

export function effectiveElectricityPrice(pGrid, alpha, pInjection) {
  // alpha = jaarlijkse zelfverbruiks-fractie
  // p_self_consumed = pGrid - pInjection
  return (1 - alpha) * pGrid + alpha * (pGrid - pInjection);
}

export function capacityCostDelta(peakBeforeKw, peakIncreaseKw, smartSteering, tariffEurPerKwYear) {
  const reduction = smartSteering ? 0.4 : 0;
  const peakAfter = Math.max(2.5, peakBeforeKw + peakIncreaseKw * (1 - reduction));
  return (peakAfter - peakBeforeKw) * tariffEurPerKwYear;
}

// estimatePremium() — verschoven naar v2. v1 berekent op bruto investering excl. premies.

export function annualCosts(input, derived, tariff) {
  // C_old
  const cOldEnergy = derived.eFuelTotal * tariff.fuelPrice[input.old_system.fuel];
  const cOldFixed  = input.old_system.fixed_costs;
  const cOldMaint  = input.old_system.maintenance_costs;
  const cOld       = cOldEnergy + cOldFixed + cOldMaint;

  // C_new
  const pElecEff = effectiveElectricityPrice(
    input.prices.electricity_eur_per_kwh,
    input.prices.self_consumption_share,
    input.prices.injection_compensation_eur_per_kwh
  );
  const cNewEnergy   = (derived.eHpHeating + derived.eHpCooling) * pElecEff;
  const cNewBackup   = derived.eBackupFuel * tariff.fuelPrice[input.old_system.fuel];
  const cNewFixed    = derived.gasFixedRemaining;  // 0 als gasaansluiting volledig weg
  const cNewMaint    = 250;                         // typische warmtepomp jaarlijks onderhoud
  const cNewCapacity = capacityCostDelta(...);
  const cNew         = cNewEnergy + cNewBackup + cNewFixed + cNewMaint + cNewCapacity;

  return { cOld, cNew, sYear: cOld - cNew };
}

export function npv(sYear0, escalation, discount, years) {
  let total = 0;
  for (let t = 1; t <= years; t++) {
    const cf = sYear0 * Math.pow(1 + escalation, t - 1);
    total  += cf / Math.pow(1 + discount, t);
  }
  return total;
}

export function calculate(input, tariff) {
  // Stap 1
  const eFuelTotal = convertToKwh(
    input.old_system.annual_consumption,
    input.old_system.unit,
    input.old_system.conversion_factor
  );
  // Stap 2
  const { eSpace, eDhw } = splitFuelByUse(
    eFuelTotal,
    input.old_system.dhw_share_fuel,
    input.old_system.cooking_share_fuel
  );
  // Stap 3
  const eSpaceNorm = normalizeForWeather(
    eSpace,
    input.building.hdd_actual,
    input.building.hdd_reference
  );
  // Stap 4
  const qSpace = usefulHeat(eSpaceNorm, input.old_system.efficiency_space);
  const qDhw   = usefulHeat(eDhw,       input.old_system.efficiency_dhw);
  // Stappen 5–7
  const qHpSpace = qSpace * input.heat_pump.share_space;
  const qBackup  = qSpace - qHpSpace;
  const eHpSpace = heatPumpElectricity(qHpSpace, input.heat_pump.spf_space, input.heat_pump.aux_electricity_pct);
  const eHpDhw   = heatPumpElectricity(qDhw * input.heat_pump.share_dhw, input.heat_pump.spf_dhw, 0);
  const eHpHeating = eHpSpace + eHpDhw;
  // Stap 8
  const eBackupFuel = qBackup / input.heat_pump.backup_efficiency;
  // Koeling
  const eHpCooling = input.heat_pump.cooling_enabled
    ? input.heat_pump.cooling_demand_kwh / input.heat_pump.seer
    : 0;
  // Stap 9
  const derived = { eFuelTotal, eHpHeating, eHpCooling, eBackupFuel, /* ... */ };
  const { cOld, cNew, sYear } = annualCosts(input, derived, tariff);
  // Stap 10 — v1: GEEN premie afgetrokken
  const iCash      = input.investment.gross_cost_excl_vat * (1 + input.investment.vat_rate);
  const iIncr      = iCash - input.investment.avoided_replacement_cost;
  // Stap 11–12
  const pbCash     = sYear > 0 ? iCash / sYear : null;
  const pbIncr     = sYear > 0 ? iIncr / sYear : null;
  const npv15      = npv(sYear, input.prices.gas_escalation_pct, input.prices.discount_rate_pct, 15) - iIncr;

  return { sYear, pbCash, pbIncr, npv15, eHpHeating, eHpDhw, eHpCooling, cOld, cNew, /* breakdown */ };
}

export function calculateScenarios(input, tariff) {
  return {
    voorzichtig:  calculate(applyMultipliers(input, SCENARIO_MULT.voorzichtig), tariff),
    realistisch:  calculate(input, tariff),
    optimistisch: calculate(applyMultipliers(input, SCENARIO_MULT.optimistisch), tariff)
  };
}
```

### 4.5 Plausibiliteits-warnings (regels)

Iedere regel produceert een string in `output.warnings`. UI toont ze in een geel banner boven het resultaat.

| ID | Regel | Boodschap (NL) |
|---|---|---|
| W01 | `qSpace / heated_area_m2 < 30` of `> 200` | "De warmtevraag per m² ligt buiten een gebruikelijke band. Controleer uw verbruiks- of oppervlakte­invoer." |
| W02 | `spf_space > 4.3` én `afgiftetemperatuur > 45 °C` | "Een SPF van {spf} is optimistisch bij hoge afgifte­temperatuur. Een installateur kan dit valideren met een dimensionerings­berekening." |
| W03 | `old_system.gas_for_cooking_dhw_after_switch = false` én `dhw_share_fuel > 0` én vaste gaskost = 0 | "U heeft de vaste gaskosten op nul gezet, terwijl er nog gasverbruik voor sanitair warm water of koken is. De gasaansluiting blijft dan typisch behouden." |
| W04 | `cooling_enabled = true` én `cooling_demand_kwh = 0` | "Koeling is ingeschakeld zonder een geschatte koudevraag. Voor een eerlijke vergelijking moeten extra elektriciteitskosten opgenomen worden." |
| W05 *(verschoven naar v2)* | premie-gerelateerde warning — vervalt in v1 want premies vallen buiten scope | — |
| W06 | `hdd_actual` onbekend of `application_date` toont vorig jaar als uitzonderlijk warm/koud | "Geen graaddagcorrectie toegepast. Het resultaat kan ±10% afwijken bij een uitzonderlijke winter." |
| W07 | `vat_rate = 0.06` én `build_year > current_year - 10` | "BTW 6% bij renovatie geldt voor woningen ouder dan 10 jaar. Verifieer of de aparte warmtepompregeling van 1 januari 2026 in uw geval van toepassing is." |
| W08 *(verfijnd 2026-05-25)* | `heat_pump.type = 'hybride_lucht_water'` | "Voor een hybride installatie moet de factuur de uitsplitsing tussen 6%- en 21%-delen vermelden — anders wordt het volledige bedrag aan 21% belast. Bij globale prijs aanvaardt de fiscus een forfaitaire verdeling van **35% (specifiek deel ketel) aan 21% btw + 65% (warmtepomp en niet-specifiek deel) aan 6% btw**. Bron: FOD Financiën, Circulaire 2025/C/47." |
| W11 *(verfijnd 2026-05-25)* | `vat_rate = 0.06` én `replaces_existing_heating = false` | "U heeft 6% btw geselecteerd maar aangegeven dat de bestaande verwarming niet volledig wordt vervangen. Voor 6% btw moet de warmtepomp de bestaande hoofdverwarming vervangen (woning wordt fossielvrij). Anders geldt 21%. Bij twijfel — uw installateur bevestigt het tarief op de offerte." |
| W09 | Default elektriciteits- of gasprijs gebruikt (niet aangepast) | "Standaard prijzen toegepast — voor een precieze berekening, voer uw eigen kWh-prijs in (zie V-test of uw jaarafrekening)." |
| W10 | `sYear <= 0` | "De jaarlijkse financiële besparing is nul of negatief. Een warmtepomp kan nog steeds zinvol zijn (comfort, koeling, CO₂, toekomstige fossiele heffingen), maar dat is geen klassieke terugverdientijd." |

### 4.6 Errorhandling

- **Validatie vóór `calculate()`**: alle vereiste velden aanwezig, types correct, ranges binnen schema. Falen → toon inline veld-error, voorkom rendering van resultaten.
- **Numerieke randgevallen**: division-by-zero in `pbCash`/`pbIncr` → `null` + W10.
- **JSON-laad-fout** voor tariefblad: fallback op embedded defaults in code + waarschuwing in console; UI toont een banner "Tarievenblad kon niet geladen worden — werken met versie {compiled_date}".
- **Geen browser-storage**: state in geheugen, niet in localStorage (volgens artifacts-regels en privacy-vriendelijk).

---

## Deel 5 — Gefaseerde implementatieroadmap

Stijl en granulariteit conform `IMPLEMENTATION_PLAN.md`. Effort = developer-tijd voor één geconcentreerde dev. Iedere fase heeft een exit criterium dat falsifieerbaar is.

### Fase 0 — Bronvalidatie + tariefblad finaliseren (½–1 dag)

**Doel:** geen enkel cijfer in de calculator zonder dat het visueel bevestigd is op de officiële bron, en dat met datum/initialen vastgelegd. **v1 sluit premies uit** — Fase 0 daalt daarmee van 1–1,5 dagen naar ½–1 dag.

| # | Taak | Bron | Effort |
|---|---|---|---|
| ~~0.1~~ | ~~Screenshot Mijn VerbouwPremie warmtepomp-tabel~~ | **Verschoven naar v2 / Fase 8** | — |
| 0.1 (nieuw) | Verifieer deeplink premie-footnote werkt en leidt naar actuele pagina | vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie | 5 min |
| 0.2 | Verifieer Vlaams gemiddelde capaciteitstarief én Fluvius-specifiek tarief 2026 | vlaamsenutsregulator.be/elektriciteit-en-aardgas/nettarieven/capaciteitstarief + fluvius.be/nl/factuur-en-tarieven | 30 min |
| 0.3 | Verifieer Fluvius m³→kWh tabel (H-gas Vlaanderen), noteer typische maandcoëfficiënt | fluvius.be/nl/factuur-en-tarieven/berekeningsparameters | 30 min |
| 0.4 | Verifieer btw-regels: 6% renovatie ≥10 jaar; 21% fossiel sinds 29 juli 2025; hybride uitsplitsing — voor UI-tooltip | vlaanderen.be + fin.belgium.be | 30 min |
| 0.5 | Verifieer graaddagen — Synergrid normaaljaar én KMI 10-jaar gemiddelde | synergrid.be + meteo.be | 30 min |
| 0.6 | VREG dashboard elektriciteit + gas — actuele indicatieve prijzen | vlaamsenutsregulator.be/cijfers | 30 min |
| 0.7 | Maak `data/vlaamse-tarieven-2026.json` met alle gevalideerde waarden + `lastUpdated` + initialen (zonder premium-blok) | (lokaal) | 45 min |
| 0.8 | Zet alle screenshots in `docs/tarieven-2026-screenshots/` met `checked-by.md` log | (lokaal) | 20 min |
| 0.9 | Maak `data/vlaamse-tarieven.schema.json` als JSON-schema voor het tariefblad zelf (CI-validatie later) | (lokaal) | 30 min |

**Exit criteria:**
- [ ] Elk cijfer in `vlaamse-tarieven-2026.json` heeft een verwijzing naar de bron-URL én een screenshot in `docs/`
- [ ] Premie-deeplink getest en werkt
- [ ] `lastUpdated` ≤ 7 dagen oud
- [ ] `checked-by.md` toont wie wat heeft bevestigd
- [ ] Geen openstaande "TODO: verify" markers in het bestand

### Fase 1 — Calculator-kern (3–4 dagen)

**Doel:** een volledig DOM-loze rekenkern die de stappen 1–12 uit het brondocument correct uitvoert, met unit-tests.

| # | Taak | Effort |
|---|---|---|
| 1.1 | `js/terugverdientijd-core.js` aanmaken met functies uit Deel 4.4 (convertToKwh, splitFuelByUse, normalize, usefulHeat, heatPumpElectricity, capacityCostDelta, annualCosts, npv, calculate, calculateScenarios). **Geen `estimatePremium()`** — verschoven naar v2. | 1 d |
| 1.2 | Tariefblad-loader: fetch `data/vlaamse-tarieven-2026.json`, valideer tegen schema, fallback op embedded defaults | 0,5 d |
| 1.3 | Unit-tests via Node (`scripts/test-terugverdientijd.js` — geen jest/mocha nodig, raw Node assert) | 0,5 d |
| 1.4 | Test-vectoren: het rekenvoorbeeld uit het brondocument (exacte match, excl. premie), de "Correctie A"-variant uit Deel 1.4 (excl. premie), een randgeval met S_year ≤ 0, een hybride scenario | 0,5 d |
| 1.5 | Plausibiliteits-warnings (W01–W10, behalve W05) implementeren | 0,5 d |
| 1.6 | Documenteer publieke API van core-module in JSDoc | 0,5 d |

**Exit criteria:**
- [ ] `node scripts/test-terugverdientijd.js` slaagt 100%
- [ ] Test-vector "brondocument rekenvoorbeeld" matcht exact (binnen 1 € afronding) — uitgevoerd zonder premie-aftrek
- [ ] Test-vector "Correctie A" (excl. premies) toont een positief S_year (verifieerbaar tegen Deel 1.4 berekening: S_year = 341 €/jaar)
- [ ] Code-coverage manueel beoordeeld: elke rekenfunctie heeft minstens één test

### Fase 2 — UI shell + Snel-modus (2–3 dagen)

**Doel:** een werkende calculator-pagina met de 5 inputs van de snelle modus en de 4 KPI-kaarten + grafiek.

| # | Taak | Effort |
|---|---|---|
| 2.1 | `terugverdientijd-warmtepomp.html` opzetten — site-conventies (head, JSON-LD WebApplication, nav, footer, breadcrumb) | 0,5 d |
| 2.2 | `js/terugverdientijd-view.js` met render-functies voor 4 KPI's, gecumuleerde-besparing SVG-grafiek, jaarkost-tabel, onzekerheidsbanner | 1 d |
| 2.3 | `js/terugverdientijd.js` met state-container, input-binding voor 5 velden van de Snel-modus, debounced recalc | 0,5 d |
| 2.4 | CSS-uitbreiding in `css/style.css` — `.calc-*` blok, mobiele responsiveness | 0,5 d |
| 2.5 | JSON-LD: `WebApplication` schema toevoegen | 15 min |
| 2.6 | Lighthouse-pass op de pagina (perf, a11y, SEO ≥90) | 30 min |

**Exit criteria:**
- [ ] Bezoek pagina, vul 5 velden in, krijg resultaat zonder reload
- [ ] Resultaat verandert reactief bij wijzigen van scenario-slider
- [ ] Lighthouse: Performance ≥90, A11y ≥95, SEO ≥95, Best Practices ≥90
- [ ] Werkt op iPhone SE-breedte (375 px)
- [ ] `site_qa.py` script vindt geen nieuwe issues

### Fase 3 — Uitgebreide modus + scenario-banden (3–4 dagen)

**Doel:** alle 25 velden, drie scenario's tegelijk, plausibiliteits­warnings actief.

| # | Taak | Effort |
|---|---|---|
| 3.1 | Uitgebreide-modus toggle + ~15 extra velden, groepering in fieldsets (Woning / Huidig systeem / Warmtepomp / Prijzen / Investering / Scenario). **Geen premie-velden.** | 1 d |
| 3.2 | Per-veld validatie + inline foutmeldingen | 0,5 d |
| 3.3 | Scenarioband-rendering: KPI's tonen `low–mid–high`, grafiek toont 3 lijnen, "excl. premies"-tag op elke TVT-KPI | 1 d |
| 3.4 | Warnings W01–W10 (behalve W05) in geel banner, deeplink naar `glossarium-warmtepomp.html#term` | 0,5 d |
| 3.5 | **Premie-footnote-component** — cyan banner met deeplink naar vlaanderen.be, Plausible event `Premie Simulator Click`. Verschijnt onder KPI's én in print-versie. | 0,5 d |
| 3.6 | Capaciteitstarief-input met postcode→Fluvius lookup (eenvoudig: één tarief, want werkgebied = Fluvius) | 0,5 d |
| 3.7 *(nieuw)* | BTW-logica: nieuwe ja/nee vraag "Wordt de bestaande verwarming volledig vervangen?" + afgeleide vat_rate (6% als ja, 21% als nee) + W11 waarschuwing bij handmatige override. Tooltip met KB-18-12-2025 referentie. | 0,5 d |

**Exit criteria:**
- [ ] Alle ~20 inputs aanwezig en bedienbaar (snelle + uitgebreide modus samen)
- [ ] Alle 9 warnings (excl. W05) testbaar te triggeren
- [ ] Premie-footnote zichtbaar op zowel scherm als print, deeplink werkt, Plausible event gemeten
- [ ] Resultaat updatet bij scenario-switch zonder full reload
- [ ] Velden behouden waarde bij modus-toggle (geen reset)

### Fase 4 — Leerplatform-functies (2–3 dagen)

**Doel:** elke term, parameter en aanname uitgelegd; SEO-bonus via aparte glossariumpagina.

| # | Taak | Effort |
|---|---|---|
| 4.1 | Tooltip-component (HTML + JS, toetsenbord­toegankelijk) | 0,5 d |
| 4.2 | "Meer uitleg" inschuif-panels per veld (12 stuks voor begrippen-tabel uit brondocument + minstens 8 voor afgeleide begrippen) | 1 d |
| 4.3 | `glossarium-warmtepomp.html` — aparte SEO-pagina met alle termen alfabetisch, anchors, internal links naar calculator | 0,5 d |
| 4.4 | "Hoe lees ik mijn jaarafrekening" mini-illustratie/uitleg (1 SVG of foto-overlay) | 0,5 d |
| 4.5 | Print/PDF stylesheet (`@media print`) | 0,5 d |
| 4.6 | JSON-LD FAQPage op de calculator-pagina (top 8 FAQ's: "Wat is een SPF?", "Wat is mijn premie?", "Wat is capaciteitstarief?", etc.) | 30 min |

**Exit criteria:**
- [ ] Elk veld in uitgebreide modus heeft een tooltip ÉN een uitleg-paneel
- [ ] Alle 12 termen uit de "Basisbegrippen"-tabel in brondocument hebben een glossarium­entry met definitie + "waarom belangrijk" + "voorbeeld"
- [ ] Print-knop produceert een nette 1- of 2-pagina rapport-uitvoer
- [ ] Google Rich Results Test op de calculator-pagina toont FAQ-schema zonder errors

### Fase 5 — Integratie + lead-flow (1–2 dagen)

| # | Taak | Effort |
|---|---|---|
| 5.1 | URL-prefill naar `contact.html?bron=calculator&samenvatting=...` | 0,5 d |
| 5.2 | `contact.html`: verborgen veld "calculator­samenvatting" tonen aan ontvanger via Formsubmit | 0,5 d |
| 5.3 | Plausible events: `Calculator Started`, `Calculator Completed`, `Lead from Calculator` | 0,5 d |
| 5.4 | Nav-item toevoegen aan `header` op alle 33 pagina's (gebruik bestaande `avyclima-site-edits` skill site-wide-edit workflow) | 0,5 d |
| 5.5 | `sitemap.xml` updaten (lastmod + 2 nieuwe URL's) en `llms.txt` / `llms-full.txt` aanvullen | 30 min |
| 5.6 | Cross-links: warmtepomp.html, warmtepomp-aalst.html, blog/premies-warmtepompen-vlaanderen.html krijgen elk een "Bereken zelf uw terugverdientijd"-CTA-card linkend naar de calculator | 30 min |

**Exit criteria:**
- [ ] Lead-test: vul calculator in → klik "Persoonlijke offerte" → contact-pagina toont samenvatting → submit → AVYclima ontvangt mail met samenvatting in zichtbaar veld
- [ ] Plausible toont alle drie de events in dashboard na test­bezoek
- [ ] Sitemap.xml geldig (xmlint of online validator)
- [ ] Nav-item zichtbaar op alle 33 pagina's

### Fase 6 — QA & lancering (1 dag)

| # | Taak | Effort |
|---|---|---|
| 6.1 | `scripts/site_qa.py` uitbreiden voor nieuwe pagina's; run en fix issues | 0,5 d |
| 6.2 | Cross-browser test (Chrome, Firefox, Safari, Edge), iOS Safari, Android Chrome | 0,5 d |
| 6.3 | A11y audit: keyboard-only doorlopen, screenreader-test (VoiceOver of NVDA) | 0,5 d |
| 6.4 | Fase-0-screenshots opnieuw vergelijken met live bronpagina's (laatste check vóór go-live) | 30 min |
| 6.5 | `IMPLEMENTATION_PLAN.md` markeren met "Fase 7 voltooid" + datum + verwijzing naar dit document | 15 min |
| 6.6 | Eerste week post-launch: monitor Plausible-events; bij <3 `Calculator Completed`/week → UX-review | (lopend) |

**Exit criteria:**
- [ ] `scripts/site_qa.py` clean
- [ ] Manuele cross-browser test: geen layout-breaking issues
- [ ] A11y audit: geen blocker (level A/AA violations)
- [ ] Fase-0-bronnen herbevestigd ≤24 u vóór deploy
- [ ] Tariefblad `lastUpdated` ≤14 dagen
- [ ] Ondertekening door Jurgen op `docs/tarieven-2026-screenshots/checked-by.md`

**Totaal v1: 10–14 dagen developer-effort** (verlaagd van 12–17 door premies uit scope te halen).

### Fase 8 — Vervolg (v2 + later, optioneel)

Niet in v1. Te overwegen na 3–6 maanden, of zodra v1 een aantoonbare lead-conversie levert.

**v2 — Premie-integratie (geschat 3–5 dagen extra):**
- Volledige 3-stappen-validatie van premiebedragen (zie `docs/tarieven-2026-screenshots/README.md` B1)
- Premie-categorie-dropdown (cat. 1–4, appartements­gemeenschap, andere investeerder)
- Verhoging-vragen: "Woning in gebied zonder aardgas?" / "Vervanging elektrische weerstandverwarming?"
- `estimatePremium()` functie in core-module
- Nieuwe KPI-kaart "Geschatte premie" — naast de bestaande TVT-kaarten
- Aangepast tariefblad (`vlaamse-tarieven-2026.json` krijgt `premium`-blok)
- Plausibiliteits-warning W05 reactiveren
- UI behoudt premie-footnote als "officieel verifiëren via simulator" — premie blijft een schatting

**v3 — Geavanceerd (geschat 5–8 dagen extra):**
- Dynamische uurtarieven (Belpex-curve)
- Stooklijn + buitentemperatuur-verdeling per regio (voor hybride share-bepaling)
- PV-installatiebestand (kWp, oriëntatie, hellingshoek)
- Vergelijking met andere bronnen (mazout → warmtepomp, pellets → warmtepomp)
- Integratie met `data/` als CSV-export voor klant
- "Save & resume" via URL-hash (privacy-vriendelijk, geen storage)
- Vlaams Energiehuis renteloos lening / overheidskrediet als optie

---

## Deel 6 — Onderhoudsstrategie & data-versheid

Een calculator die fout-gaat-binnen-een-jaar is erger dan geen calculator. Het tariefblad moet **gestructureerd verouderen** en **gestructureerd verversen**.

### 6.1 Single source of truth

Alle veranderlijke cijfers staan **uitsluitend** in `data/vlaamse-tarieven-2026.json`. Code mag deze waarden niet hardcoded hebben — wél als fallback met expliciete "vervangen-vóór-versie" markering.

### 6.2 Vaste review-momenten

| Wanneer | Wat | Wie |
|---|---|---|
| Elke 1 januari | Volledige review tariefblad (energie­prijzen, capaciteitstarief, btw, accijnzen) | Jurgen |
| Elke 1 maart | Premie-review (jaarlijkse wijziging Mijn Verbouw­premie historisch op deze datum) | Jurgen |
| Bij elke bekende wijziging | Ad hoc update + `lastUpdated` bumpen + screenshot vernieuwen | Jurgen |

### 6.3 Versheids-indicator in UI

Onderaan elk resultaat: kleine grijze tekst **"Tarieven herzien op {lastUpdated}. Voor de zekerheid bevestigd via een vrijblijvend plaatsbezoek."** Met deeplink naar de bron-URL's.

### 6.4 Calculator als levend document

Voeg in de footer van de calculator-pagina een mini-changelog toe (laatste 3 wijzigingen): "Tarievenblad bijgewerkt op {datum} — wijziging in {wat}." Bevordert vertrouwen en is feitelijk transparant.

---

## Bijlage A — Tariefblad-template (`data/vlaamse-tarieven-2026.json`)

```json
{
  "lastUpdated": "2026-05-30",
  "reviewedBy": "JV",
  "version": "2026.1-v1",
  "scope": "v1 — premies vallen buiten de berekening",
  "source_url_general": "zie docs/tarieven-2026-screenshots/checked-by.md",
  "premium_link": {
    "url":  "https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie",
    "label_nl": "Bekijk uw premie op de officiële simulator",
    "verified_on": "2026-05-30"
  },
  "_comment_premium_v2": "Het premium-blok (met cat1..cat4 bedragen) komt terug in v2 — zie Fase 8 in TERUGVERDIENTIJD_CALCULATOR_PLAN.md en de 3-stappen-validatie in docs/tarieven-2026-screenshots/README.md.",
  "vat": {
    "renovation_6pct_min_age_years": 10,
    "heatpump_6pct_since": "2026-01-01",
    "fossil_21pct_since":  "2025-07-29",
    "transition_until":    "2026-06-30"
  },
  "capacity_tariff": {
    "fluvius_midden_vlaanderen_eur_per_kw_year_excl_vat": null,
    "fluvius_midden_vlaanderen_eur_per_kw_year_incl_vat": null,
    "fluvius_midden_vlaanderen_eur_per_kw_year_excl_vat_VERIFIED": 50.12,
    "average_flanders_eur_per_kw_year_excl_vat":          53.39,
    "average_flanders_eur_per_kw_month_excl_vat":          4.45,
    "average_household_monthly_peak_kw":                   4.24,
    "minimum_kw":                                         2.5,
    "vat_rate":                                           0.06,
    "_comment":                                           "Fluvius Midden-Vlaanderen = default voor werkgebied AVYclima (50,12 €/kW/jaar excl. btw, uit officiële tariefkaart 2026). Vlaams gemiddelde 53,39 €/kW/jaar excl. btw (VREG officieel, laatst bijgewerkt 23 april 2026) wordt in UI naast het veld getoond ter referentie. Gemiddelde maandpiek Vlaanderen nov 2025: 4,24 kW — bruikbaar als default voor 'huidige piek' input."
  },
  "energy": {
    "electricity_typical_eur_per_kwh": 0.33,
    "gas_typical_eur_per_kwh":         0.10,
    "oil_typical_eur_per_liter":       1.10,
    "pellet_typical_eur_per_kg":       0.42,
    "electricity_escalation_pct":      0.01,
    "gas_escalation_pct":              0.03
  },
  "conversions": {
    "gas_kwh_per_m3_H_gas":  11.5,
    "gas_kwh_per_m3_L_gas":  10.25,
    "oil_kwh_per_liter":     10.0,
    "pellet_kwh_per_kg":     4.8
  },
  "weather": {
    "hdd_reference_30y_norm":   2187,
    "hdd_reference_recent_2y":  1958,
    "default":                  1960,
    "_comment":                 "30-jaar norm uit Synergrid (periode 1996-2025). Recent 2-jaars gemiddelde uit Synergrid jaartabellen 2024-2025. Default afgerond op 1960 — klimaat-gecorrigeerd voor huidige realiteit. Geverifieerd 2026-05-25."
  },
  "co2_factors_kg_per_kwh": {
    "electricity_grid_belgium": 0.18,
    "natural_gas":              0.20,
    "heating_oil":              0.27,
    "pellets":                  0.04
  }
}
```

---

## Bijlage B — Bronnen met laatste verificatiedatum

| ID | Bron | URL | Laatste check |
|---|---|---|---|
| B1 | Vlaanderen.be — Mijn VerbouwPremie warmtepomp | https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie/mijn-verbouwpremie-voor-warmtepomp | Fase 0 |
| B2 | Vlaanderen.be — Mijn VerbouwPremie algemeen | https://www.vlaanderen.be/premies-voor-renovatie/mijn-verbouwpremie | Fase 0 |
| B3 | VREG — Capaciteitstarief | https://www.vlaamsenutsregulator.be/elektriciteit-en-aardgas/nettarieven/capaciteitstarief | Fase 0 |
| B4 | VREG — V-test | https://www.vlaamsenutsregulator.be/elektriciteit-en-aardgas/energiecontracten-en-leveranciers/doe-de-v-testr | Fase 0 |
| B5 | Vlaanderen.be — BTW 6% renovatie | https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/btw-tarief-van-6-bij-renovatie-en-sloop-en-heropbouw-van-woningen | Fase 0 |
| B6 | FOD Financiën — BTW fossiele verwarming | https://fin.belgium.be/nl/particulieren/woning/bouwen-verbouwen/verbouwen/gewijzigde-btw-tarieven-verwarmingsinstallaties-fossiele-brandstoffen | Fase 0 |
| B7 | Fluvius — Berekeningsparameters gas | https://www.fluvius.be/nl/factuur-en-tarieven/berekeningsparameters | Fase 0 |
| B8 | Synergrid — Graaddagen | https://www.synergrid.be/nl/documentencentrum/statistieken-gegevens/graaddagen | Fase 0 |
| B9 | VREG — Dashboard elektriciteit (vooruitblik) | https://www.vlaamsenutsregulator.be/cijfers/dashboard-afnameprijzen-elektriciteit-vooruitblik | Fase 0 |
| B10 | VREG — Dashboard aardgas (vooruitblik) | https://www.vlaamsenutsregulator.be/cijfers/dashboard-afnameprijzen-aardgas-vooruitblik | Fase 0 |
| B11 | Fluvius — Capaciteitstarief | https://www.fluvius.be/nl/factuur-en-tarieven/capaciteitstarief | Fase 0 |
| B12 | VLAIO — Warmtepompen steun | https://www.vlaio.be/nl/subsidies-financiering/subsidiedatabank/warmtepompen-steun | Fase 0 |
| B13 | KMI — Klimatologisch jaaroverzicht 2025 | https://www.meteo.be/resources/climatology/pdf/klimatologisch_jaaroverzicht_2025.pdf | Fase 0 |

---

## Bijlage C — Conversie-cheatsheet (uit te integreren in glossarium-pagina)

| Van | Naar | Coëfficiënt | Bron |
|---|---|---|---|
| 1 m³ aardgas (H-gas, Vlaanderen) | ~11,5 kWh | varieert per maand en GOS | Fluvius berekeningsparameters |
| 1 m³ aardgas (L-gas, uitfasering) | ~10,25 kWh | — | idem |
| 1 liter stookolie | ~10,0 kWh | — | sectorstandaard |
| 1 kg pellets | ~4,8 kWh | — | sectorstandaard |
| Graaddagen 16,5/16,5 | (16,5°C − dagtemp Ukkel) gesommeerd | normaal ~1.900 (10j) / ~2.087 (30j) | KMI / Synergrid |

---

## Open vragen — allen beantwoord 2026-05-24

1. ~~**Wie verzorgt Fase 0?**~~ **Beslist: Jurgen zelf.** Doorloop via [docs/tarieven-2026-screenshots/README.md](docs/tarieven-2026-screenshots/README.md) (~30–45 min).
2. ~~**Werkgebied = uitsluitend Fluvius?**~~ **Beslist: ja, en specifiek Fluvius Midden-Vlaanderen.** Aalst, Denderleeuw, Ninove vallen alle drie onder netgebied Fluvius Midden-Vlaanderen. Geen postcode-naar-netbeheerder lookup nodig. Capaciteitstarief: Fluvius MV als default + Vlaams gemiddelde als referentie ernaast (beslist 2026-05-25). Fase 3.6 wordt een eenvoudig invulveld met dual-tarief weergave.
3. ~~**Toon de calculator de categorie-specifieke premiebedragen?**~~ **Beslist: premies buiten v1.** Footnote met deeplink naar `vlaanderen.be/mijnverbouwpremie`. Volledige premie-integratie verschuift naar v2 / Fase 8.
4. ~~**PV/zelfverbruik in v1 of v2?**~~ **Beslist: slider in v1.** Eén veld `self_consumption_share` (0–50%, default 0) in uitgebreide modus, met tooltip-uitleg. Volledige PV-installatie­koppeling (kWp, oriëntatie, profiel) blijft v3.
5. ~~**NPV over 15 of 20 jaar?**~~ **Beslist: 15 jaar.** Matcht typische warmtepomp-levensduur. Eén constante in `terugverdientijd-core.js` zodat aanpassing in v2 of v3 triviaal is.
6. ~~**Footnote-tekst — definitieve formulering?**~~ **Goedgekeurd.** Definitieve tekst zoals in [Deel 3.3](#33-resultatenpaneel): "💡 Premies zijn niet meegeteld in deze berekening. Afhankelijk van uw inkomenscategorie, het type warmtepomp en de aanvraagdatum kan de Vlaamse overheid een premie van €300 tot €9.600 uitbetalen (Mijn VerbouwPremie). Dit verlaagt uw netto investering en dus uw terugverdientijd. Voor uw concrete situatie — bekijk de officiële simulator op vlaanderen.be →"

---

**Status: alle blokkers weg. Fase 0 kan starten.** v1-scope: premies buiten de berekening (footnote + deeplink), Fluvius-only capaciteitstarief, PV/zelfverbruik als enkele slider, NPV-horizon 15 jaar. v2 (premie-integratie) en v3 (geavanceerd) blijven beschreven in [Fase 8](#fase-8--vervolg-v2--later-optioneel).

*Einde van het analysedocument.*
