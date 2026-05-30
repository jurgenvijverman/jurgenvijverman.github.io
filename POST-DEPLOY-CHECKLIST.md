# Post-deploy validatie-checklist

Lijst om door te lopen ná de push naar `main`. GitHub Pages bouwt typisch binnen 30–60 seconden — wacht of volg op `https://github.com/jurgenvijverman/jurgenvijverman.github.io/actions`. Doe daarna **hard refresh** in elke browser (Cmd+Shift+R) om de cache te omzeilen.

Markeer items met ✅ als ze slagen, ❌ als ze falen.

---

## 1. Smoke test — site komt op (5 min)

- [ ] `https://avyclima.be/` laadt zonder console-errors (DevTools → Console)
- [ ] CSS laadt: layout ziet er correct uit, geen ongestylde tekstblokken
- [ ] Plausible analytics laadt (`Network` → filter "plausible")
- [ ] Geen 404's in `Network`-tab voor afbeeldingen of fonts

---

## 2. Mobiele menu-bug (de gerapporteerde fout) — primair

Test op **echte iPhone of Android** (niet alleen DevTools). DevTools mobile mode mist soms iOS Safari-specifieke renderbugs die de oorzaak van de bug waren.

### iOS Safari (iPhone)

- [ ] Open `https://avyclima.be/` in Safari
- [ ] Tap op de hamburger-knop (rechtsboven)
- [ ] **Menu schuift in van rechts met een ondoorzichtige witte achtergrond** ← was het bug-symptoom
- [ ] Menu-items zijn duidelijk leesbaar (donkere tekst op wit)
- [ ] Tap op de X (hamburger draait om) → menu sluit, scrollpositie blijft waar je was
- [ ] Tap hamburger opnieuw, tap dan op "Airco" → menu sluit, pagina navigeert naar `/airco.html`
- [ ] Herhaal op `https://avyclima.be/blog/premies-warmtepompen-vlaanderen.html` (lange pagina, scrol eerst halverwege)

### Android Chrome

- [ ] Zelfde test op een Android-telefoon
- [ ] Menu-achtergrond ondoorzichtig wit
- [ ] Geen visuele "glitch" bij openen/sluiten

### Desktop fallback

- [ ] Open op desktop, verklein browser tot < 768px breedte
- [ ] Hamburger-knop verschijnt, menu werkt zoals op telefoon
- [ ] Vergroot weer > 768px: hamburger verdwijnt, horizontale nav verschijnt

---

## 3. Sticky bel-knop onderaan (mobiel) — nieuw

- [ ] **iPhone**: open `avyclima.be/`, scrol naar onderen — een donkergrijze "📞 Bel AVYclima" balk blijft altijd onderaan staan
- [ ] Tap op de bel-knop → iOS toont "Bel +32 472 65 76 47" dialoog
- [ ] Test ook op `/contact.html`, `/airco.html`, `/blog/premies-warmtepompen-vlaanderen.html`
- [ ] **Verifieer dat de bel-knop NIET zichtbaar is op desktop** (browser > 768px breed)
- [ ] iPhone met thuisbalk-indicator (iPhone X+): bel-knop respecteert de safe-area (geen overlap met indicator-balk)
- [ ] Tap de cookie-banner "Weigeren" of "Accepteren" — cookie-banner verdwijnt en bel-knop blijft op zijn plek
- [ ] Met cookie-banner zichtbaar: bel-knop zit ónder de cookie-banner (cookie banner schuift omhoog t.o.v. de standaard onderkant zodat ze niet overlappen)

---

## 4. Tap-targets en touch (mobiel)

- [ ] Hamburger-knop voelt comfortabel groot om te tappen (44×44 minimum)
- [ ] Mobiele nav-items zijn niet meer "krap" om te tappen (1rem padding rondom)
- [ ] Footer-links zijn los van elkaar te tappen zonder per ongeluk de buurman te raken
- [ ] Breadcrumb-links zijn comfortabel
- [ ] Geen "vastplakkende hover" op knoppen op iOS: tap een primary-button één keer, er gebeurt direct iets (geen eerste-tap-doet-niets effect)

---

## 5. Back-to-top knop

- [ ] Open een lange pagina (`/blog/premies-warmtepompen-vlaanderen.html` of `/kostenvergelijking-warmtepomp.html`)
- [ ] Scrol naar beneden (minstens 600px)
- [ ] Een ronde knop met "↑" verschijnt rechtsonder
- [ ] Op mobiel: knop staat ruim boven de sticky bel-knop (niet erop)
- [ ] Tap de knop → pagina scrolt smooth naar boven
- [ ] Bovenaan: knop verdwijnt weer

---

## 6. Contactpagina (mobiel)

- [ ] `/contact.html` op mobiel: de kaart van Denderleeuw is compacter (260px ipv 400px), neemt minder ruimte
- [ ] Formulier-velden zijn comfortabel groot om te tappen
- [ ] Bij focus op een input wordt er NIET ingezoomd op iOS (font-size moet 16px+ zijn — dat is al correct)
- [ ] Bij focus op `<input type="email">` toont iOS toetsenbord het @-symbool prominent
- [ ] Bij focus op `<input type="tel">` toont iOS het cijferpaneel
- [ ] Bij focus op `<select>` toont iOS de native scroll-picker
- [ ] Knoppen onderaan formulier ("Aanvraag verzenden") zijn full-width op mobiel
- [ ] Cookie-banner knoppen ("Weigeren"/"Accepteren") zijn beide even breed en groot tappable

---

## 7. Tabellen (mobiel)

- [ ] `/blog/prijs-warmtepomp-installatie.html` op mobiel: scrol naar de vergelijkingstabel
- [ ] Tabel scrolt horizontaal binnen zijn eigen container i.p.v. de hele pagina horizontaal uit te rekken
- [ ] Geen "horizontale scroll" van de hele pagina

---

## 8. Inhoud uit fase 1–4 nog steeds correct (steekproef)

### Premies (fase 1.4)
- [ ] `/blog/premies-warmtepompen-vlaanderen.html`: zoek "Wanneer dient u de aanvraag in?" — antwoord = **ná de werken, met eindfactuur**
- [ ] "Laatst bijgewerkt op 27 mei 2026" zichtbaar onder de titel
- [ ] Bronnen-blok onderaan met link naar Vlaanderen.be
- [ ] `/warmtepomp-aalst.html`: blok "Premies voor uw warmtepomp in Aalst" met simulator-link (en GEEN "Vlaams Subsidie voor Warmtepompen" of "Plaatselijke Steunmaatregelen Aalst" meer)
- [ ] `/warmtepomp-denderleeuw.html`: idem

### Navigatie (fase 2.1)
- [ ] `/airco.html`, `/warmtepomp.html`, `/onderhoud.html`: "Werkgebied" zit nu wél in de hoofdnav (desktop)
- [ ] Hoofdnav identiek op `/index.html`, `/faq.html`, `/airco.html`, `/over-ons.html` — zelfde items in zelfde volgorde

### Breadcrumbs (fase 2.2)
- [ ] `/blog/airco-als-verwarming.html`: breadcrumb leest "Home / Blog / Airco als verwarming" (geen Werkgebied tussenin)
- [ ] `/blog/premies-warmtepompen-vlaanderen.html`: idem clean
- [ ] `/blog/split-vs-multisplit.html`: idem
- [ ] `/blog/warmtepomp-renovatie.html`: idem

### Spelling (fase 1.1)
- [ ] `/onderhoud.html`: zoek "langere levensduur" (de oude "langer levensduur" mag niet meer)
- [ ] `/faq.html`: "moderne aircosystemen" en "buitenunit" (geen "modern aircosystemen" of "extern blok")
- [ ] `/airco-ninove.html`: "ondervindt", "allergenen", "Residentieel gebied"

### Title (fase 4.2)
- [ ] Tab-titel van `/airco.html` leest: "Airco plaatsen en onderhouden in Aalst, Denderleeuw en Ninove | Daikin-airco – AVYclima"

### Structured data (fase 4.1)
- [ ] Open `https://search.google.com/test/rich-results` in een nieuwe tab
- [ ] Test `https://avyclima.be/` → geen kritieke fouten op HVACBusiness
- [ ] Test `https://avyclima.be/blog/premies-warmtepompen-vlaanderen.html` → BlogPosting + BreadcrumbList geldig
- [ ] Test `https://avyclima.be/blog/airco-als-verwarming.html` → idem
- [ ] Test `https://avyclima.be/faq.html` → FAQPage geldig
- [ ] Test `https://avyclima.be/warmtepomp-aalst.html` → LocalBusiness + BreadcrumbList geldig

---

## 9. Visuele integriteit (desktop ≥ 992px)

- [ ] Homepage hero ziet er hetzelfde uit als voorheen (geen rare padding-shift)
- [ ] Sticky bel-knop **niet** zichtbaar op desktop
- [ ] Back-to-top knop **wel** zichtbaar op desktop (na 600px scroll)
- [ ] Geen ongebruikelijke spacing rond de nav
- [ ] Calculator op `/kostenvergelijking-warmtepomp.html` werkt en oogt zoals voorheen
- [ ] Geen horizontale scroll op desktop

---

## 10. Performance — snel handmatig check

Open `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Favyclima.be%2F` en `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Favyclima.be%2Fkostenvergelijking-warmtepomp.html` (de zwaarste pagina).

- [ ] Mobiel-score is ≥ 80 (goed) of ≥ 90 (uitstekend)
- [ ] LCP < 2,5s
- [ ] CLS < 0,1 (Should be near zero — alle images hebben width/height)
- [ ] Geen nieuwe waarschuwingen die er vóór de deploy nog niet stonden

Indien LCP > 2,5s op mobiel: bekijk `FASE4-FOLLOWUPS.md` § 4.4 voor de drie grote webp-afbeeldingen die nog comprimeerbaar zijn.

---

## 11. Toegankelijkheid

- [ ] Druk **Tab** op desktop vanaf homepage — eerste focus is "Naar hoofdinhoud" skip-link (zichtbaar in cyan onderlijning)
- [ ] Tab een paar keer door: focus-states zijn duidelijk zichtbaar (3px cyan outline)
- [ ] Screenreader-test (VoiceOver iOS of TalkBack Android): hamburger-knop wordt aangekondigd, status "Menu, dichtgevouwen/uitgevouwen" verandert correct (aria-expanded werkt)

---

## 12. Edge cases

- [ ] Telefoon in landscape mode (horizontaal): menu en bel-knop werken nog
- [ ] iPad (tablet, breedte rond 768–1024px): geen "tussen-toestand" waar nav half-mobiel half-desktop is
- [ ] Pagina met `?bron=calculator` parameter (bv. via calculator → "Vraag offerte"-knop): contact.html toont het prefill-blok correct
- [ ] Pagina-URL direct met `#anchor` (bv. `/onderhoud.html#waarom-onderhoud`): pagina scrolt naar dat anchor zonder dat de sticky bel-knop de inhoud verbergt

---

## Bij problemen

- **Menu nog steeds transparant op iOS**: probeer de alternatieve fix uit `MOBILE-UX-AUDIT.md` § 1 ("Snelle alternatieve fix") — verwijder `backdrop-filter` van `.header`.
- **Sticky bel-knop overlapt content**: pas `body { padding-bottom }` aan in `css/style.css` (zoek naar het MOBILE UX-blok). Verhoog van `4.5rem` naar bv. `5.5rem`.
- **Back-to-top valt over cookie-banner**: pas in CSS `.back-to-top { bottom }` op mobiel aan.
- **Iets compleet stuk**: rollback via `git revert HEAD && git push origin main` — site is binnen 1 minuut terug bij vorige versie.

---

## Volgorde van prioriteit bij fouten

1. **Showstoppers** (site werkt niet, console-errors): rollback eerst, debug daarna
2. **Bel-knop overlapt belangrijke content**: padding-bottom verhogen, snel fixen
3. **Menu-bug niet opgelost op iOS**: probeer alternatieve fix
4. **Cosmetische issues** (back-to-top te dichtbij iets, etc.): kunnen wachten op volgende commit
