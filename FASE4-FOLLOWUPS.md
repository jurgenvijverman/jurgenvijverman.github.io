# Fase 4 — opgeleverde resultaten en follow-ups

Deze pagina vat de uitkomsten van fase 4 samen en geeft concrete vervolgstappen voor de twee items die externe tooling of een grotere ingreep vereisen: Core Web Vitals-meting (4.4) en de URL-migratie (4.5).

## Wat in fase 4 is uitgevoerd

| Item | Status | Wijziging |
| --- | --- | --- |
| 4.1 Structured data valideren | Klaar | HIGH-severity bug gefixt op 7 blogs: breadcrumb `item`-URL voor "Blog" wees naar `/blog/` (zonder index) in plaats van `/blog.html`. MEDIUM-severity bug gefixt: `mainEntityOfPage` toegevoegd aan de 9 Article/BlogPosting-schemas die het misten. Resultaat: alle blogartikelen voldoen nu aan dezelfde minimale set velden. |
| 4.2 Title `airco.html` verbreden | Klaar | `<title>` en `<meta name="description">` (+ Open Graph + Twitter Card varianten) noemen nu Aalst, Denderleeuw én Ninove, conform `warmtepomp.html`. |
| 4.3 Image/performance pass | Geen werk nodig | Audit toonde dat alle img-tags al beschikken over `alt`, `width`, `height`, `loading`, `decoding`. Geen wijzigingen vereist. |
| 4.4 Core Web Vitals meten | Open — zie hieronder | Vereist live meting via Search Console of pagespeed.web.dev. Statische analyse leverde wel aanwijzingen op. |
| 4.5 URL-migratie | Open — zie hieronder | Niet uitgevoerd; te invasief zonder hosting/redirect-context. Concreet plan staat hieronder. |

## 4.4 Core Web Vitals — meetplan en aanwijzingen uit statische analyse

### Wat al wordt gemeten

De site laadt `https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js` en stuurt LCP, INP en CLS naar `gtag('event', ...)`. **Maar gtag/GA4 wordt nergens geladen** — alleen Plausible Analytics draait. De web-vitals data wordt dus stil weggegooid. Twee opties:

1. **GA4 toevoegen** als jullie die data willen vastleggen. Niet aanbevolen als jullie bewust voor privacy-vriendelijke Plausible kozen.
2. **Web-vitals fallback naar Plausible** door in het `sendToGA4`-functie ook `window.plausible('CWV', { props: { metric: metric.name, value: ... } })` aan te roepen. Plausible ondersteunt custom events.
3. **Web-vitals script verwijderen** als jullie de meting toch niet gebruiken — bespaart een externe CDN-call.

Mijn aanbeveling: optie 2 of 3, afhankelijk van of jullie LCP/INP/CLS actief willen volgen.

### Hoe te meten (geen tooling nodig)

Voor een eenmalige meting volstaat:

1. Ga naar `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Favyclima.be%2F` (en herhaal voor `/airco.html`, `/warmtepomp.html`, `/blog/premies-warmtepompen-vlaanderen.html`, `/kostenvergelijking-warmtepomp.html`).
2. Bekijk de "Field Data" als die beschikbaar is (komt uit CrUX, alleen als de site genoeg verkeer heeft). Anders kijk naar "Lab Data" via Lighthouse.
3. Doelen voor Goed: LCP < 2,5 s, INP < 200 ms, CLS < 0,1.

Voor doorlopende metingen: koppel de site aan Google Search Console (sectie "Ervaring → Core Web Vitals") als dat nog niet gebeurd is.

### Statische aanwijzingen die LCP kunnen hinderen

Drie afbeeldingen vallen op door hun bestandsgrootte:

| Bestand | Grootte | Risico |
| --- | --- | --- |
| `images/installations/daikin-buitenunit-fundering-detail.webp` | 854 KB | Hoog — fors voor een webp. Vermoedelijk in volle resolutie (>2000 px breed) opgeslagen terwijl hij in een card op ~400 px breedte wordt getoond. |
| `images/installations/avyclima-bedrijfswagen-locatie-1.webp` | 594 KB | Hoog — idem. |
| `images/installations/daikin-buitenunit-platdak-zijaanzicht.webp` | 421 KB | Middel. |
| `images/hero.jpg` | 232 KB | Middel — JPG i.p.v. webp; al lazy maar wordt mogelijk above-the-fold getoond. Check of het de LCP-image is. |
| `images/hero-over-ons.jpg` | 286 KB | Middel — JPG, alleen op `/over-ons.html`. |

Voorgestelde stappen:

1. Open de drie webp's > 400 KB lokaal en exporteer ze opnieuw met een breedte rond 1200 px (genoeg voor desktop retina) en kwaliteit 75. Doel: < 150 KB per afbeelding.
2. Converteer `hero.jpg` en `hero-over-ons.jpg` naar webp (kwaliteit 80) en voeg een fallback `<picture>` toe, of vervang volledig als geen IE-support nodig is.
3. Overweeg `<picture>` met `srcset` voor mobiele varianten (bv. 600 px, 1200 px) — vooral op de homepage. Dat helpt LCP op mobiel het meest.

Andere kleine winsten:

- `terugverdientijd-*.js` (totaal ~86 KB) wordt geladen op 6 pagina's, waaronder `contact.html` (alleen nodig voor prefill bij `?bron=calculator`). De `contact.html`-include kan voorwaardelijk (`<script defer>` is al gebruikt; eventueel `loading` op de iframe-kaart). Niet kritiek.
- `css/style.css` is 52 KB ongeminified. Minify (bv. via `npx csso-cli`) levert ~30–35 % besparing op zonder content-impact.

### Resultaat dat je zou moeten zien na bovenstaande optimalisaties

Voor een tekst-zware site als avyclima.be met statische HTML zijn LCP < 2 s en CLS < 0,05 realistisch op mobiel. INP wordt vooral bepaald door de terugverdientijd-calculator; meet die los.

## 4.5 URL-migratie — concreet plan

### Waarom (terug uit het actieplan)

Het mengen van root-`*.html`-pagina's met nettere `/blog/*.html`-slugs oogt als een gefaseerde site zonder consistente conventie. `portfolio.html` heet inhoudelijk "Aanpak" en die mismatch is verwarrend. Migratie naar `/airco/`, `/warmtepompen/`, `/aanpak/`, etc. maakt URLs leesbaarder en consistenter.

### Risico's en randvoorwaarden

- **Tijdelijk rankingverlies** kan optreden als 301-redirects niet correct zijn opgezet — Google moet de nieuwe URLs opnieuw indexeren.
- **Hosting moet 301-redirects ondersteunen** (.htaccess voor Apache, `vercel.json` voor Vercel, `_redirects` voor Netlify, NGINX-config, etc.).
- **Interne links, sitemap.xml, structured data, canonical-tags en social share-URLs** moeten allemaal mee.
- **Externe backlinks** blijven werken via de 301-redirects, maar lopen één hop extra — dat is geen probleem.

Beste moment om dit te doen: niet vlak voor een drukke periode (eind voorjaar bij airco-installateurs); idealiter samen met een grotere release.

### Aanbevolen URL-mapping

| Huidige URL | Nieuwe URL | Reden |
| --- | --- | --- |
| `/portfolio.html` | `/aanpak/` | Pagina heet inhoudelijk "Aanpak"; URL moet matchen. |
| `/airco.html` | `/airco/` | Schoner, generiek dienstadres. |
| `/warmtepomp.html` | `/warmtepompen/` | Meervoud past beter bij "soorten warmtepompen". |
| `/onderhoud.html` | `/onderhoud/` | |
| `/faq.html` | `/veelgestelde-vragen/` | Nederlandstalige slug. |
| `/contact.html` | `/contact/` | |
| `/over-ons.html` | `/over-ons/` | |
| `/werkgebied.html` | `/werkgebied/` | |
| `/blog.html` | `/blog/` | Bestaat al als folder; vereist een `index.html` in `/blog/`. |
| `/airco-aalst.html` | `/airco/aalst/` | Hiërarchisch, leesbaar. |
| `/airco-denderleeuw.html` | `/airco/denderleeuw/` | |
| `/airco-ninove.html` | `/airco/ninove/` | |
| `/airco-haaltert.html` | `/airco/haaltert/` | |
| `/airco-lede.html` | `/airco/lede/` | |
| `/airco-erpe-mere.html` | `/airco/erpe-mere/` | |
| `/airco-dendermonde.html` | `/airco/dendermonde/` | |
| `/warmtepomp-aalst.html` | `/warmtepompen/aalst/` | Idem. |
| ... (overige `warmtepomp-*.html`) | `/warmtepompen/[gemeente]/` | |
| `/onderhoud-aalst.html` | `/onderhoud/aalst/` | |
| `/onderhoud-denderleeuw.html` | `/onderhoud/denderleeuw/` | |
| `/kostenvergelijking-warmtepomp.html` | `/warmtepompen/kostenvergelijking/` | Onder de warmtepompen-tak. |
| `/glossarium-warmtepomp.html` | `/warmtepompen/glossarium/` | Idem. |
| `/bedankt.html` | `/bedankt/` | |
| `/privacy.html` | `/privacy/` | |
| `/blog/*.html` | ongewijzigd | Blogartikelen zijn al netjes onder `/blog/`. |
| `/portfolio/*.html` | `/aanpak/[case]/` | Verplaatsen samen met `/portfolio.html → /aanpak/`. |

### Checklist voor de migratie

1. **Hosting controleren.** Identificeer de webserver (Apache, NGINX, Vercel, Netlify, ...). Voor Apache: `.htaccess` met `RewriteRule`. Voor Vercel: `vercel.json` `redirects`-blok. Voor Netlify: `_redirects`-bestand.
2. **301-redirects schrijven** voor elke mapping in bovenstaande tabel. Test elke redirect lokaal vóór deploy.
3. **Bestanden hernoemen of structuur omzetten.** Eén bestand per nieuwe URL: `/airco/index.html`, `/airco/aalst/index.html`, etc. Dat vermijdt issues met trailing-slash-canonicalization.
4. **Alle interne links updaten.** Grep en search-replace door alle HTML-bestanden voor patronen als `airco.html` → `/airco/`, `portfolio.html` → `/aanpak/`, etc. Vergeet de footers, navigaties, breadcrumbs (visueel én JSON-LD) en CTA-links niet.
5. **Canonical-tags bijwerken** in elke `<head>`: `<link rel="canonical" href="https://avyclima.be/[nieuwe-url]/">`.
6. **Structured-data URLs bijwerken**: in elke JSON-LD `"url"`, `"item"`, `"mainEntityOfPage"`, `"@id"`.
7. **Sitemap.xml regenereren** met de nieuwe URLs. Verwijder de oude URLs.
8. **OG/Twitter URLs bijwerken** in elke `<head>`: `og:url`, `twitter:url`.
9. **Lokaal grondig testen.** Tools zoals `wget --mirror --spider https://avyclima.be/` of `lychee` checken op gebroken interne links.
10. **Plausible-events** controleren — pageviews komen automatisch goed binnen, maar custom events (zoals "Lead from Calculator") moeten op de nieuwe URLs blijven werken.
11. **Deploy.** Bij Vercel/Netlify atomair; bij Apache kan `.htaccess` direct uploaden.
12. **Search Console "URL Inspection"** uitvoeren op de belangrijkste oude URLs: bevestig dat de 301-redirect correct wordt herkend en de nieuwe URL wordt geïndexeerd. Submit de nieuwe sitemap.
13. **Externe backlinks** (Google Business, Facebook, Instagram, LinkedIn bio, eventuele directory-listings) bijwerken naar de nieuwe URLs. Werkt ook via 301, maar één hop minder is sneller.
14. **Monitoring** voor de eerste 2–4 weken: kijk in Search Console naar dekking (verwacht: oude URLs status "geredirect", nieuwe URLs status "geïndexeerd") en eventuele 404's via je server-logs.

### Snel alternatief — alleen de meest hinderlijke mismatch

Als bovenstaande te groot voelt, is het minimum-werk dat veel oplevert:

1. `portfolio.html` hernoemen naar `aanpak.html` (of `aanpak/index.html`).
2. 301-redirect van de oude URL naar de nieuwe.
3. Alle interne links updaten (navigatie, footer, JSON-LD, sitemap, canonical).
4. Verifieer in Search Console.

Daarmee los je de meest in het oog springende label-URL-mismatch op zonder de hele site te raken.
