# Actieplan: implementatie review-aanbevelingen avyclima.be

**Datum:** 27 mei 2026
**Bron:** "Diepgaande review van avyclima.be" (ChatGPT-audit)
**Doel:** elke aanbeveling uit de review beoordelen op relevantie t.o.v. de werkelijke codebase, en alleen de relevante items inplannen voor uitvoering.

---

## Belangrijke kanttekening vooraf

De review is uitgevoerd zonder directe toegang tot de broncode of tooling. Veel onderdelen zijn daarom in de review als **unspecified** gemarkeerd. Na verificatie tegen de feitelijke bestanden in `/Users/jurgen/Projects/avyclima/` blijken **diverse "unspecified" items eigenlijk al goed geïmplementeerd te zijn** (meta descriptions, canonicals, structured data, `tel:`/`mailto:` links, skip link, sitemap, robots.txt). Die hoeven dus niet opnieuw gebouwd te worden — maximaal getoetst of bijgewerkt.

De **echte zwakke plekken** liggen op:

1. spellings- en grammaticafouten in templates (alle 18 in de PDF gerapporteerde gevallen op één na zijn nog aanwezig);
2. een gebroken breadcrumb-component op oudere blogartikelen (Werkgebied "lekt" zonder separator tussen Blog en de titel);
3. inconsistente hoofdnavigatie (Werkgebied alleen op `index.html` en `faq.html`, niet op `airco.html` / `warmtepomp.html` / `onderhoud.html`);
4. enkele templateblokken over premies/subsidies die generiek of mogelijk onnauwkeurig zijn;
5. een paar UX-detailproblemen op de contactpagina (calculator-heading altijd in DOM, locatieblok zonder begeleidende tekst).

---

## Relevantie-assessment per aanbeveling

Legenda — Relevantie:
- **Bevestigd** = issue is daadwerkelijk in de codebase aanwezig, aanpak nodig.
- **Deels bevestigd** = issue bestaat, maar minder breed of anders dan de review suggereert.
- **Achterhaald** = de review zat ernaast; item is al opgelost of nooit een probleem geweest.
- **Te verifiëren** = claim conflicteert met bronmateriaal en/of behoeft externe check (bv. Vlaanderen.be).

| # | Aanbeveling uit review | Relevantie | Toelichting |
|---|---|---|---|
| 1 | 18 specifieke spelfouten in `/onderhoud.html`, `/faq.html`, lokale pagina's en oudere blogs | **Bevestigd** | 17 van 18 fouten zijn nog aanwezig in de bestanden. Eén ("circuleren koude lucht" in `/blog/prijs-airco-installatie.html`) is niet vindbaar — mogelijk al herschreven. Extra gevonden: "levensuur" (= levensduur) ergens in `onderhoud.html`. |
| 2 | Eén centrale stijlgids (u-vorm, sentence case, terminologie) | **Bevestigd** | Verschillen tussen templates zijn zichtbaar; stijlgids vastleggen is een zinvolle blokkering voor toekomstige drift. |
| 3 | Premie-content corrigeren in FAQ, lokale warmtepomp-pagina's en blog | **Deels bevestigd** | Het bestaande blogartikel (`/blog/premies-warmtepompen-vlaanderen.html`) zegt expliciet "Mijn VerbouwPremie: Aanvragen VOOR u begint." — dit is precies het **tegenovergestelde** van wat de review op basis van Vlaanderen.be claimt. Dit moet eerst tegen de officiële Vlaanderen.be-pagina worden geverifieerd voordat we rewriten. Het blok "Vlaams Subsidie voor Warmtepompen" op `warmtepomp-aalst.html` en `warmtepomp-denderleeuw.html` is wél vaag en kan worden vervangen. |
| 4 | Lokale warmtepomp-templates te generiek | **Bevestigd** | Diverse `warmtepomp-*.html` pagina's gebruiken sjablooncopy zonder duidelijke lokale invulling; afwijking per gemeente is dun. |
| 5 | Lokale airco-templates: taalfouten + generieke ankers + dunne differentiatie | **Bevestigd** | Bevestigd via grep — zie spelfouten en herhalende templatestructuur. |
| 6 | Oudere blogtemplates (maart–april 2026): inconsistente header/breadcrumb | **Bevestigd** | Hard bewijs: in `/blog/airco-als-verwarming.html` staat in de breadcrumb `Home / Blog <a href="../werkgebied.html">Werkgebied</a> / <span>Airco als verwarming</span>` — Werkgebied "lekt" tussen Blog en titel, zonder separator. Nieuwere mei-2026 blogs hebben een schone breadcrumb. |
| 7 | `/contact.html`: calculator-tekst lekt zichtbaar boven formulier | **Deels bevestigd** | De `<h3>Aanvraag komt vanuit terugverdientijd-calculator</h3>` zit binnen `<div class="calc-prefill-summary" hidden>`, dus is standaard niet zichtbaar. Maar de heading staat onvoorwaardelijk in de HTML — als de `hidden` ergens wegvalt of een screenreader hem leest, ontstaat het probleem dat de review beschrijft. Aanbeveling: conditioneel renderen of in elk geval een betere copy als hij wél zichtbaar wordt. |
| 8 | `/contact.html`: Locatie-sectie zonder begeleidende tekst | **Bevestigd** | Bevat alleen een `<iframe>` met `title="Locatie AVYclima in Denderleeuw"`, geen ondersteunende tekst boven of onder de kaart. |
| 9 | Sitebrede CTA-component: secundaire bel-CTA's niet altijd `tel:`-klikbaar | **Achterhaald** | Alle vindbare voorkomens van het telefoonnummer (`+32472657647`, `0472`) zijn ingebed in `<a href="tel:...">`. Idem `info@avyclima.be` zit consequent in `mailto:`. Niets te doen, behalve dit standaard borgen voor toekomstig werk. |
| 10 | Header/footer/breadcrumb partials standaardiseren | **Bevestigd** | Hoofdnav verschilt tussen pagina's: Werkgebied staat in `index.html` en `faq.html`, maar niet in `airco.html` / `warmtepomp.html` / `onderhoud.html`. Breadcrumb-bug op oudere blogs (zie #6) versterkt deze behoefte. |
| 11 | `/portfolio.html` hernoemen naar `/aanpak/` (URL-label-mismatch) | **Bevestigd** | URL is `portfolio.html`, maar zowel `<title>` ("Onze aanpak \| ...") als `<h1>` ("Onze aanpak") spreken van "aanpak". Verwarrende slug. Lage urgentie omdat dit een redirect-migratie vereist. |
| 12 | `/werkgebied.html`: generieke ankers ("Airco", "Warmtepomp") | **Deels bevestigd** | Voor de kerngemeenten Aalst/Denderleeuw/Ninove zijn de ankers al beschrijvend ("Airco in Aalst"). Voor secundaire gemeenten (Haaltert, Erpe-Mere, Lede) zijn ze nog generiek ("Airco", "Warmtepomp"). Alleen die laatste rij moet bij. |
| 13 | `/airco.html` + `/warmtepomp.html`: titles strakker op scope, Werkgebied in nav | **Deels bevestigd** | De huidige titles zijn redelijk; `airco.html` zegt "Airco plaatsen & onderhouden in Aalst \| Daikin-airco – AVYclima" — wat de review terecht aanstipt als "te eng op Aalst" terwijl `/warmtepomp.html` al wel de drie gemeenten noemt. Werkgebied toevoegen aan de nav van deze pagina's hoort bij item #10. |
| 14 | Nieuwere blogtemplates (mei 2026): zichtbare auteur + update-datum + bronblok | **Bevestigd** | Goed idee, vooral voor premies/regelgeving. Lage effort. |
| 15 | Sitebrede structured data: `Organization`/`LocalBusiness`, `BreadcrumbList`, `Article` | **Grotendeels achterhaald** | De site heeft al: `HVACBusiness` (home), `Service` + `HVACBusiness` provider + `BreadcrumbList` (dienstpagina's), `FAQPage` (faq.html), `LocalBusiness` + `BreadcrumbList` (lokale pagina's), `BlogPosting`/`Article` + `BreadcrumbList` (blog), `Blog` schema (blog.html), `ContactPoint` + `Organization` (contact.html). Te doen: alleen een Rich Results Test draaien en ontbrekende `BreadcrumbList`-elementen op enkele oudere templates aanvullen. De review hint dat `FAQPage` niet meer geprioriteerd moet worden voor rich results — daar kan de bestaande FAQPage-blob blijven, maar verwachtingen temperen. |
| 16 | Sitebrede media/performance: `loading="lazy"`, `width`/`height`, `decoding="async"`, alt-hygiëne | **Deels bevestigd** | Op de gecontroleerde portfolio-afbeeldingen al netjes geïmplementeerd (lazy, decoding, width/height, descriptieve alts). Verifiëren of dit overal in de blog + lokale pagina's net zo strak is. Geen Core Web Vitals-meting beschikbaar; staat als open verificatie. |
| 17 | Sitebrede URL-conventie: van `*.html` naar schone slugs (`/airco/`, `/warmtepompen/`, etc.) | **Bevestigd, lage prioriteit** | Klopt feitelijk, maar grote operatie met 301-redirects, sitemap-update, interne linkbijwerking en risico op tijdelijke rankingverlies. Pas oppakken als er een redesign of CMS-migratie komt. |
| 18 | Meta descriptions herschrijven volgens voorbeeld uit review | **Achterhaald als gat, optioneel als verfijning** | Alle gecontroleerde pagina's hebben een passende `<meta name="description">`. De voorbeeldteksten uit de review zijn niet beter dan wat er staat, alleen iets anders. Geen werk tenzij iemand inhoudelijk wil polijsten. |
| 19 | Canonical-tags, robots.txt, sitemap.xml controleren | **Achterhaald** | Alle aanwezig en netjes: canonical per pagina, `sitemap.xml` met ~50 URLs, `robots.txt` met expliciete allowlists voor AI-bots en uitsluiting van de bèta-calculator. |
| 20 | Image alt texts opschonen (decoratief vs. functioneel) | **Te verifiëren** | Op `portfolio.html` zijn alts feitelijk al descriptief — review's claim dat het ontbrak klopt niet. Wel een gerichte audit waard op blog- en lokale templates. |

---

## Geprioriteerd implementatieplan

De fasering hieronder volgt de logica: eerst zichtbare vertrouwensschade dichten (taalfouten + feitelijke premie-claims), dan structurele componenten herstellen (nav, breadcrumb, contactpagina), dan inhoudelijke verdieping (lokale pagina's, blogs), en tot slot optionele optimalisaties.

### Fase 1 — Vertrouwensschade dichten (week 1)

| Taak | Pagina's | Effort | Acceptatiecriterium |
|---|---|---|---|
| 1.1 Copy-edit van alle 17 bevestigde taalfouten uit de review-tabel | `onderhoud.html`, `faq.html`, `airco-aalst.html`, `airco-denderleeuw.html`, `airco-ninove.html`, `warmtepomp-haaltert.html`, `blog/airco-als-verwarming.html`, `blog/onderhoud-airco-wanneer.html` | Klein | Geen van de 17 fouten meer in de HTML; spellingcheck loopt schoon |
| 1.2 Aanvullende taalpass op de genoemde pagina's voor de "naburige" fouten (zoals `levensuur`) die in dezelfde redactiegolf zijn ontstaan | Idem | Klein | Reviewer leest één keer volledig over en signaleert geen nieuwe fouten |
| 1.3 Vlaanderen.be officiële regels voor Mijn VerbouwPremie verifiëren: timing (vóór of na werken), inkomensvoorwaarden 2026, premiebedragen per type warmtepomp en doelgroep | n.v.t. — externe verificatie | Klein | Een korte interne notitie waarin per claim staat wat Vlaanderen.be vandaag zegt, met datum en URL |
| 1.4 Op basis van 1.3: corrigeren of bevestigen van premie-content in het blogartikel `/blog/premies-warmtepompen-vlaanderen.html` (review en site spreken elkaar nu tegen op het "voor/na" punt) | `blog/premies-warmtepompen-vlaanderen.html`, `kostenvergelijking-warmtepomp.html`, FAQ-vragen over premies in `faq.html` | Klein–Middel | Tekst is conform Vlaanderen.be 2026; bronlink staat in artikel zichtbaar; "datum laatst bijgewerkt" zichtbaar op de pagina |
| 1.5 Generieke blokken "Vlaams Subsidie voor Warmtepompen" en losse "gemeentelijke premies"-claims vervangen door de voorzichtige standaardtekst uit de review (met verwijzing naar de Mijn VerbouwPremie-simulator) | `warmtepomp-aalst.html`, `warmtepomp-denderleeuw.html`, `warmtepomp-ninove.html`, `warmtepomp-haaltert.html`, `warmtepomp-lede.html`, `warmtepomp-erpe-mere.html`, `warmtepomp-dendermonde.html` | Middel | Geen pagina meer verwijst naar een niet-bestaand "Vlaams Subsidie voor Warmtepompen"-programma; elke pagina linkt naar de officiële simulator |

### Fase 2 — Componenten herstellen (week 2)

| Taak | Pagina's | Effort | Acceptatiecriterium |
|---|---|---|---|
| 2.1 Hoofdnav harmoniseren: Werkgebied opnemen in álle templates of consequent weglaten | Alle pagina's; primaire fix in `airco.html`, `warmtepomp.html`, `onderhoud.html` | Klein | Hoofdnav is op elke pagina identiek; geen menu-itemverschil tussen templates |
| 2.2 Breadcrumb-bug op oudere blogartikelen herstellen — verwijderen van `<a href="../werkgebied.html">Werkgebied</a>` tussen Blog en de artikeltitel; uniform breadcrumb-component invoeren | Alle artikelen in `/blog/` die voor mei 2026 zijn gepubliceerd (m.n. `airco-slaapkamer.html`, `airco-als-verwarming.html`, `onderhoud-airco-wanneer.html`, `prijs-airco-installatie.html`, `buitenunit-burenhinder.html`) | Klein | Breadcrumb leest `Home / Blog / [Artikeltitel]` met consequente separators; geen Werkgebied-leak |
| 2.3 `contact.html` opschonen: `<h3>Aanvraag komt vanuit terugverdientijd-calculator</h3>` conditioneel laten renderen (alleen als `?bron=calculator` in URL zit), of als hij gewoon altijd in de DOM blijft een neutrale heading geven die ook zonder calculatorcontext klopt | `contact.html` | Klein | Bezoeker die direct naar `/contact.html` gaat ziet nooit een verwijzing naar de calculator; semantisch consistent |
| 2.4 `contact.html` Locatie-sectie: paragraaf toevoegen bij de kaart (adres, vestigingsstad, een zin context: bv. "We zijn gevestigd in Denderleeuw en werken in de regio Aalst, Ninove en omliggende gemeenten.") | `contact.html` | Klein | Locatieblok bevat tekst die ook zonder map begrijpelijk is |
| 2.5 Centrale stijlgids vastleggen (u-vorm, sentence case in headings, niet absolute claims, terminologie airco/buitenunit/binnenunit, hoofdregels voor links/CTA's) | Apart `STYLEGUIDE.md` in repo | Middel | Stijlgids is verbindend voor toekomstige content; eerste publicatie gereviewed door 2e persoon |

### Fase 3 — Inhoudelijke verdieping (week 3–4)

| Taak | Pagina's | Effort | Acceptatiecriterium |
|---|---|---|---|
| 3.1 Lokale aircopagina's uniek maken: unieke intro per gemeente, lokaal voorbeeld of case-verwijzing, beschrijvende anchor-CTA's i.p.v. "Meer informatie" | `airco-aalst.html` t/m `airco-erpe-mere.html` | Groot | Elke lokale pagina heeft minstens 2 alinea's unieke lokale content + ten minste 1 lokaal voorbeeld |
| 3.2 Lokale warmtepomp-pagina's uniek maken (vergelijkbaar met 3.1) | `warmtepomp-*.html` | Groot | Idem |
| 3.3 Oudere blogartikelen migreren naar nieuwe uniforme blogtemplate (zelfde header, breadcrumb, byline-structuur als mei-2026 artikelen) | Alle pre-mei-2026 blogs | Middel | Visueel en HTML-structureel zijn alle blogs identiek opgebouwd |
| 3.4 Op `/werkgebied.html` de generieke "Airco" / "Warmtepomp"-ankers voor Haaltert, Erpe-Mere, Lede vervangen door "Airco in Haaltert", "Warmtepomp in Lede" etc. | `werkgebied.html` | Klein | Elke link op de pagina is zelfstandig leesbaar |
| 3.5 Op blogartikelen over veranderlijke onderwerpen (premies, regelgeving) zichtbare auteur, publicatiedatum en update-datum tonen | `blog/premies-warmtepompen-vlaanderen.html` + andere relevante artikelen | Klein | Onder de titel staat een byline met auteur + datum laatst bijgewerkt |

### Fase 4 — SEO en techniek (optioneel, week 5)

| Taak | Pagina's | Effort | Acceptatiecriterium |
|---|---|---|---|
| 4.1 Bestaande structured data valideren in Google's Rich Results Test op een representatieve set (home, een dienstpagina, een lokale pagina, een blogartikel, FAQ) | n.v.t. | Klein | Rich Results Test geeft geen kritieke fouten |
| 4.2 Title van `airco.html` verbreden van "Airco plaatsen & onderhouden in Aalst" naar een variant met Aalst, Denderleeuw én Ninove, in lijn met `warmtepomp.html` | `airco.html` | Klein | Title noemt drie kerngemeenten |
| 4.3 Image/performance-pass: blog- en lokale templates controleren op `loading="lazy"`, `width`/`height`, `decoding="async"`; decoratieve symbolen in headings semantisch opruimen of in CSS verwerken | Alle pagina's met images of icoonkarakters in koppen | Middel | Lighthouse Performance ≥ 90 op mobiel; geen CLS-issues op afbeeldingen |
| 4.4 Core Web Vitals meten via PageSpeed Insights / Search Console en eventuele bottlenecks (LCP, INP, CLS) aanpakken | Site-breed | Middel | LCP < 2.5s mobiel; INP < 200ms; CLS < 0.1 |
| 4.5 (Lage prioriteit, optioneel) URL-migratie van `*.html` naar schone slugs (`/airco/`, `/aanpak/`, `/warmtepompen/`, etc.) met 301-redirects, sitemap-update en interne linkbijwerking | Site-breed | Groot | Alle oude URLs redirecten 301; geen 404's; Search Console toont stabiele dekking na 4 weken |

---

## Open verificaties (niet beslisbaar zonder externe bron)

De volgende punten konden niet eenduidig worden beslist op basis van de huidige codebase + review:

- **Mijn VerbouwPremie timing**: review zegt "aanvragen na uitvoering met eindfactuur", site zegt "aanvragen vóór werken". Vlaanderen.be is hier de waarheidsbron — open verificatie (taak 1.3).
- **Actuele premiebedragen per type warmtepomp per doelgroep sinds 1 maart 2026**: noteren in een aparte data-bron (bv. `/data/vlaamse-tarieven-2026.json` indien dat al de bron is) en periodiek hertoetsen.
- **Echte Core Web Vitals**: vereist meting via Search Console of CrUX, niet uit code te lezen.
- **Indexstatus en CTR per pagina**: alleen uit Search Console / Plausible analytics te halen.

---

## Aanbevolen volgorde (samengevat)

1. **Onmiddellijk (deze week):** Fase 1 — taalfouten + premie-verificatie + premie-blokken vervangen.
2. **Daarna (week 2):** Fase 2 — nav, breadcrumb, contactpagina, stijlgids.
3. **Week 3–4:** Fase 3 — lokale pagina's uniek maken, oudere blogs migreren.
4. **Optioneel (week 5+):** Fase 4 — SEO-validatie, performance, evt. URL-migratie.

De grote winst zit in Fase 1 en 2 — relatief weinig effort, direct zichtbare kwaliteitsverbetering, en raakt precies de plekken waar de review terecht risico op vertrouwensschade signaleert. Fase 3 is contentwerk dat best parallel kan lopen. Fase 4 is optimalisatie en pas zinvol als de eerste drie fases klaar zijn.
