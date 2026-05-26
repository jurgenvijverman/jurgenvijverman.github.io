# Plausible Analytics — Event Catalogus

Volledige lijst van custom events die de avyclima.be code triggert op Plausible (`plausible.io`). Configureer deze events in het Plausible-dashboard onder **Goals** om conversie-rapportage en funnels te kunnen draaien.

Laatst bijgewerkt: 2026-05-26 (kostenvergelijking-pivot)

---

## Events uit de kostenvergelijking-calculator

Triggered door `js/terugverdientijd.js`. Calculator is tijdens beta-test verborgen achter `?preview=avy2026` op `/kostenvergelijking-warmtepomp.html`.

| Event-naam | Wanneer | Properties | Doel meten |
|---|---|---|---|
| `Vergelijking Started` | Eerste keer dat een gebruiker iets in het formulier wijzigt (1× per sessie) | — | Reach: hoeveel bezoekers beginnen daadwerkelijk te rekenen |
| `Vergelijking Completed` | Wanneer de scenario-slider (voorzichtig/realistisch/optimistisch) bewogen wordt (1× per sessie) | `scenario` (str) | Engagement: completion-rate na start |
| `Aandeel Slider Gebruikt` | Eerste keer dat de gebruiker de aandeel-slider zelf beweegt (los van type-defaults) | — | Gebruikt iemand de share-input expliciet? |
| `Uitgebreide Modus Geopend` | Klik op "Toon uitgebreide opties" | — | Power-user-flow |
| `Investeringsperspectief Geopend` | Klik op de collapsed `<details>` "Investeringsperspectief" (1× per sessie) | — | Hoeveel mensen interesseren zich nog in TVT/NPV |
| `Info Panel Geopend` | Klik op een (i)-icoontje naast een veld | `veld` (str: panel-id) | Welke termen verwarren bezoekers het meest |
| `Premie Simulator Click` | Klik op de externe link naar `vlaanderen.be/.../mijn-verbouwpremie` | — | Hoeveel bezoekers volgen door naar premie-info |
| `Calculator Printed` | Klik op "Print of bewaar als PDF" | — | Wie wil het rapport meenemen offline |

## Events uit het contact-form

Triggered door `js/main.js`. Helpt te begrijpen of leads van de calculator-context komen.

| Event-naam | Wanneer | Properties | Doel meten |
|---|---|---|---|
| `Lead from Calculator` | Form-submit op `/contact.html?bron=calculator` (pre-fill via calculator-CTA) | — | Conversie van calculator → offerte-aanvraag |
| `Form Fallback Triggered` | FormSubmit.co laadt niet binnen 12s (typisch Cloudflare-storing) | — | Hoe vaak faalt de externe form-service |
| `Phone Click` | Klik op een `tel:` link | `href` (str) | Telefoon-conversie tracken |
| `Email Click` | Klik op een `mailto:` link | `href` (str) | E-mail-conversie tracken |

---

## Aanbevolen Goals in Plausible

Configureer deze als **Goals** in je dashboard:

1. **`Vergelijking Started`** — top-of-funnel (calculator-interesse)
2. **`Vergelijking Completed`** — mid-funnel (volledige interactie)
3. **`Lead from Calculator`** — bottom-of-funnel (conversie)
4. **`Phone Click`** — directe conversie
5. **`Email Click`** — directe conversie

Funnel-volgorde: Vergelijking Started → Vergelijking Completed → Lead from Calculator.

Bezoekers die direct doorklikken naar **Premie Simulator Click** zijn ook waardevol — ze gaan op zoek naar concrete premiebedragen en komen mogelijk later terug.

---

## Buiten scope tot publieke lancering

Tijdens beta-test is de calculator-URL gated. Plausible meet wel events, maar het bezoekersvolume zal nog laag zijn (alleen test-publiek met de `?preview=avy2026` sleutel). Pas na publieke lancering (gate uit, sitemap toevoegen, nav-link terug, llms.txt updaten) zal het volume reëel zijn.

## Privacy

Plausible verzamelt geen persoonlijke data (geen cookies, geen tracking IDs, geen IP-opslag). Alle events hierboven zijn anoniem-geaggregeerde tellingen. Geen extra GDPR-actie nodig boven wat al in `/privacy.html` beschreven staat.
