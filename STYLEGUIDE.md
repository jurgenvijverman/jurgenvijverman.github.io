# AVYclima — content- en stijlgids

Doel: één bron van waarheid voor toon, taal, terminologie en componentconventies op avyclima.be, zodat de site sitebreed consistent en betrouwbaar overkomt. Deze gids ontstond uit de review van mei 2026 en de uitvoering van fase 1 en 2 van het bijhorende actieplan (`ACTIEPLAN-review-implementatie.md`).

## Toon en stem

AVYclima is een lokale Daikin-specialist die zich onderscheidt door technische diepgang, plaatsbezoek vóór offerte, correcte dimensionering, verzorgde afwerking en nazorg. De toon volgt daaruit:

- **Adviserend, niet opdringerig.** We helpen bezoekers beslissen, we verkopen niet.
- **Technisch onderbouwd zonder jargon.** Termen zoals "buitenunit", "warmtepompboiler", "lucht/water-warmtepomp" en "inkomenscategorie" mogen, maar leg ze één keer uit waar nodig.
- **Rustig en feitelijk.** Geen "GROOTSTE BESPARINGEN!" of "tienduizenden euro's premie" — we gebruiken concrete cijfers met de juiste nuance en altijd in lijn met de officiële bron.
- **Lokaal.** Verwijzingen naar Aalst, Denderleeuw, Ninove en omliggende gemeenten zijn gewenst waar ze logisch zijn; klink niet als een SEO-template dat alleen de gemeentenaam wisselt.

## Aanspreekvorm

Eén vorm sitebreed: **u** (formeel, zakelijk). Geen wisseling met "je/jij" binnen of tussen pagina's. Reden: B2C-investeringsbeslissingen van duizenden euro's hebben baat bij een zakelijke, respectvolle toon. Uitzondering: niet-publieke documenten of interne notities.

## Taal en spelling

- **Belgisch Nederlands** (Vlaamse standaardspelling). Geen Engelse of Duitse leenwoorden waar er een Nederlandse equivalent is ("Reiniging" niet "Reinigung", "Vaak" niet "Often", "Moderne" niet "Modern" als adjectief).
- **Adjectiefverbuiging:** check standaardregels. "Een langer**e** levensduur", "een kleiner**e** voetafdruk", "modern**e** aircosystemen" (plural altijd -e).
- **Hoofdletters in headings:** sentence case ("Wat bepaalt de airco-prijs in Aalst?"), géén Title Case.
- **Trema's** waar de standaardspelling dit voorschrijft: "allergie**ë**n", niet "allergieen".
- **Eigennamen** correct kapitaliseren: "Mijn VerbouwPremie" (de officiële schrijfwijze van Vlaanderen.be, niet "Mijn Verbouwpremie"), "Daikin", "Fluvius".

## Terminologie

| Gebruik | Niet | Reden |
| --- | --- | --- |
| buitenunit | extern blok / buiteneenheid (alleen in technische context) | gebruikersvriendelijker, sluit aan op installateurstaal |
| binnenunit | binneneenheid (alleen technisch) | idem |
| lucht/water-warmtepomp | lucht-water warmtepomp / lucht waterwarmtepomp | conform Vlaanderen.be schrijfwijze |
| lucht/lucht-warmtepomp | lucht-lucht warmtepomp | idem |
| Mijn VerbouwPremie | Mijn Verbouwpremie / mijnverbouwpremie | officiële schrijfwijze |
| Rescert-gecertificeerd | RESCERT / rescert | dit is hoe Vlaanderen.be het schrijft |
| eindfactuur | finale factuur / slotfactuur | terminologie sluit aan op het premiedossier |
| inkomenscategorie | inkomensschijf / inkomensklasse | dit is hoe Vlaanderen.be het noemt |

## Claims en cijfers

Wees terughoudend met absolute beloftes:

- **Geen "tot 80% besparing"** of vergelijkbare maxima zonder context. Werk met bandbreedtes: "afhankelijk van uw isolatie, gedrag en het type warmtepomp", "indicatief tussen X en Y".
- **Geen "tienduizenden euro's premie"** of "tot € 20.000". Voor warmtepompen ligt de basispremie van Mijn VerbouwPremie indicatief tussen € 300 en € 8.000, plus een mogelijke verhoging tot 50% in specifieke gevallen.
- **Verwijs altijd naar de officiële simulator** voor concrete bedragen: `https://apps.energiesparen.be/simulator-mijnverbouwpremie-2026`.

## Standaardtekst — premies

Op alle pagina's die premies noemen, hanteren we deze kern:

> Voor warmtepompen in Vlaanderen is **Mijn VerbouwPremie** de belangrijkste regeling. Het premiebedrag hangt af van het type warmtepomp (geothermisch, lucht-water, lucht-lucht of hybride) en van uw inkomenscategorie. De aanvraag gebeurt pas nadat de werken volledig zijn uitgevoerd en u over een eindfactuur beschikt. Daarnaast kunnen Fluvius-premies en eventuele lokale steunmaatregelen van toepassing zijn. Controleer uw concrete premie altijd via de [officiële simulator](https://apps.energiesparen.be/simulator-mijnverbouwpremie-2026).

Belangrijke regels rond premie-content:

1. **Aanvraag = na werken + eindfactuur.** Niet ervoor. Dit is het meestgemaakte fout in oudere content.
2. **Inkomenscategorieën bestaan nog** (categorie 1 t/m 4) en bepalen bedrag en maximumpercentage van de factuur.
3. **Sinds 1 maart 2026** geldt voor categorieën 1 en 2 geen +50% verhoging meer; categorieën 3 en 4 behouden die wel.
4. **Niet-woongebouwen** komen sinds 1 maart 2026 niet meer in aanmerking.
5. **Geen vage "gemeentelijke premies"-claims** zonder concrete onderbouwing. Schrijf: "Sommige gemeenten voorzien aanvullende steun — informeer hierover bij de gemeente [Naam]."

## CTA's en links

- **Bel-CTA's** altijd als `tel:`-link met het volledige nummer, plus een `aria-label` die het nummer voorleest:
  ```html
  <a href="tel:+32472657647" aria-label="Bel AVYclima op +32 472 65 76 47">
    Bel ons op +32 472 65 76 47
  </a>
  ```
- **E-mail-CTA's** als `mailto:`-link met het hele adres in de tekst.
- **Linkteksten beschrijvend, niet generiek.** Niet "Meer informatie", "Klik hier" of een losse "Airco" / "Warmtepomp" als anker. Wel "Airco in Aalst", "Warmtepomp in Lede", "Bekijk onze aanpak voor een split-airco".
- **Externe links** krijgen `rel="noopener" target="_blank"` waar relevant.

## Headings

- **H1 per pagina, één keer.** Beschrijvend en zoekintentiegericht.
- **H2 voor secties**, **H3 voor subsecties**. Geen H4 tenzij echt nodig.
- **Geen losstaande icoonkarakters** (📍, 🔧, etc.) als heading-tekst. Iconen mogen in `<span aria-hidden="true">` of via CSS, niet in de heading-string zelf.

## Breadcrumbs

Standaardstructuur voor blogartikelen:

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="../index.html">Home</a> <span>/</span> <a href="../blog.html">Blog</a> <span>/</span>
  <span aria-current="page">[Artikeltitel]</span>
</nav>
```

Voor lokale dienstpagina's:

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="index.html">Home</a> <span>/</span> <a href="airco.html">Airco</a> <span>/</span>
  <span aria-current="page">Airco in [Gemeente]</span>
</nav>
```

**Werkgebied hoort niet tussen Blog en het artikel** — die fout zat in oudere artikelen en is opgeruimd. Hou hem opgeruimd.

## Hoofdnavigatie

Canonieke volgorde sitewide:

1. Home
2. Airco
3. Warmtepomp
4. Onderhoud
5. Over ons
6. Aanpak (`portfolio.html`)
7. FAQ
8. Blog
9. Werkgebied
10. Contact

Op de pagina zelf krijgt het actieve item `class="active"`. Wijk hier niet van af zonder reden — verschillen tussen templates zijn een veelvoorkomende UX-zwakte.

## Structured data

De volgende JSON-LD-schemas zijn aanwezig en moeten op nieuwe pagina's aanwezig blijven:

- `HVACBusiness` (home).
- `Service` + `HVACBusiness` provider + `BreadcrumbList` (hoofddienstpagina's).
- `LocalBusiness` + `BreadcrumbList` (lokale pagina's).
- `BlogPosting` + `BreadcrumbList` (blogartikelen). Vergeet `dateModified` niet bij updates.
- `FAQPage` (faq.html).
- `Blog` (blog-overzicht).

Test wijzigingen via Google's [Rich Results Test](https://search.google.com/test/rich-results).

## Beelden

- **Functionele/informatieve beelden:** descriptieve alt-tekst die context geeft ("Daikin-buitenunit op zijgevel van halfopen woning in Ninove"), niet ("logo.png" of "afbeelding 1").
- **Decoratieve beelden of iconen:** `alt=""` of in CSS.
- **Altijd `width`, `height`, `loading="lazy"` (below the fold), `decoding="async"`** op img-tags om layout-shift en performance-issues te voorkomen.

## Auteur, datum, bron

Voor blogartikelen over veranderlijke onderwerpen (premies, regelgeving, prijzen):

- Toon publicatiedatum **én** "Laatst bijgewerkt op" zichtbaar onder de titel.
- Update `dateModified` in het Article-schema bij elke inhoudelijke wijziging.
- Link naar de officiële bron (Vlaanderen.be, Fluvius, etc.) bij elke claim die uit die bron komt.

## Checklist voor nieuwe pagina's

- [ ] H1 beschrijft de pagina-inhoud, niet alleen een SEO-keyword.
- [ ] Hoofdnav bevat alle 10 items in canonieke volgorde.
- [ ] Breadcrumb volgt de standaardstructuur, zonder Werkgebied-leak.
- [ ] Bel- en e-mail-CTA's zijn `tel:`/`mailto:`-links met beschrijvende tekst.
- [ ] Linkteksten zijn betekenisvol, geen "Meer info" of "Klik hier".
- [ ] Metadata (`<title>`, `<meta name="description">`, canonical, Open Graph) is uniek voor deze pagina.
- [ ] Eventuele premie-claims volgen de standaardtekst in deze gids.
- [ ] JSON-LD schema is aanwezig en gevalideerd in Rich Results Test.
- [ ] Beelden hebben alt, width, height, loading, decoding.
- [ ] Een eindredactionele lezing zonder spelfouten, in u-vorm, met Vlaamse spelling.
