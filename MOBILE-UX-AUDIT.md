# Mobile UX-audit avyclima.be

Analyse van het mobiele gebruik van de site, met het mobiele menu-bug bovenaan. Bevindingen zijn gerangschikt naar prioriteit (Hoog / Middel / Laag) en bevatten waar relevant een concrete code-snippet als startpunt voor de fix.

---

## 1. Bug — mobiele menu lijkt transparant (Hoog)

### Vermoedelijke oorzaak

In `css/style.css` heeft het mobiele menu (regel 1541) wel degelijk een witte achtergrond:

```css
@media (max-width: 768px) {
  .nav {
    position: fixed;
    top: 72px; left: 0; right: 0; bottom: 0;
    background: var(--white);  /* = #ffffff */
    transform: translateX(100%);
    ...
  }
  .nav.active { transform: translateX(0); }
}
```

De `var(--white)` resolveert correct naar `#ffffff` (regel 41), en er is geen latere regel die de achtergrond op transparant zet. In theorie zou het menu dus ondoorzichtig moeten zijn.

In de praktijk zijn er drie samenlopende oorzaken die op **iOS Safari** (en in mindere mate Android Chrome bij splitscreen) een doorzichtig of "ghosted" menu opleveren:

1. **`backdrop-filter: blur(10px)` op de header** (regel 309). Het mobiele menu zit als `<nav>` *binnen* de `<header>` in de DOM. Op iOS Safari raken kinderen van een element met `backdrop-filter` soms hun eigen `background` kwijt als ze zelf een `transform` hebben (wat hier het geval is — `translateX`). Dit is een bekend Safari-rendering-issue.
2. **Geen expliciete `z-index` op `.nav`**. Het menu erft de stacking context van de header (`z-index: 1000`), maar krijgt zelf `z-index: auto`. In combinatie met de bug hierboven kan inhoud onder het menu door "lekken".
3. **Geen `isolation` of expliciete kleur**. De `background: var(--white)` wordt in iOS Safari soms genegeerd binnen een stacking context met backdrop-filter; expliciete `background-color` op een nieuw geïsoleerd compositielaag-element lost dit op.

### Voorgestelde fix (CSS — minimale wijziging)

Pas de bestaande `@media (max-width: 768px)`-block aan zodat het mobiele menu een eigen, expliciete stacking context krijgt met dichte achtergrond:

```css
@media (max-width: 768px) {
  .nav {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    /* Defensieve achtergrond: zowel CSS-variabele als expliciete fallback */
    background-color: #ffffff;
    background-image: none;
    /* Eigen stacking context, los van header's backdrop-filter */
    z-index: 999;
    isolation: isolate;
    /* Bestaande layout */
    flex-direction: column;
    padding: 2rem;
    gap: 0.5rem;
    transform: translateX(100%);
    transition: var(--transition);
    border-top: 1px solid var(--gray-200);
    /* Scrollbaar als menu groter is dan viewport */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

**Waarom werkt dit:**

- `z-index: 999` zet het menu boven alle pagina-inhoud (header blijft op 1000 voor hamburger-X)
- `isolation: isolate` maakt het menu een nieuw composite-layer, los van het backdrop-filter van de parent
- `background-color: #ffffff` (i.p.v. shorthand `background:` met `var(--white)`) wordt door iOS Safari betrouwbaarder gerespecteerd

### Snelle alternatieve fix als bovenstaande niet werkt

`backdrop-filter` van de header verwijderen:

```css
.header {
  background: rgba(255, 255, 255, 0.97);
  /* backdrop-filter: blur(10px);  ← verwijderen of becommentariëren */
}
```

Het effect is marginaal verschil bij het scrollen (geen onscherpte van content achter de header), maar de mobiele menu-bug verdwijnt zeker.

---

## 2. Toegevoegde mobiele UX-verbeteringen

### Hoge prioriteit

#### 2.1 Vaste bel-knop onderaan op mobiel

Op een installateurssite is bellen de primaire conversie-actie. Op mobiel scrollen bezoekers snel weg van de header, waarna de bel-CTA uit het zicht raakt. Een persistente "Bel ons"-knop onderaan houdt het belaanbod altijd één tap dichtbij.

Voorstel — voeg toe aan elke pagina vlak boven de footer:

```html
<!-- Mobile sticky call CTA -->
<a href="tel:+32472657647"
   class="mobile-cta-bar"
   aria-label="Bel AVYclima op +32 472 65 76 47">
  <span class="mobile-cta-icon" aria-hidden="true">📞</span>
  <span>Bel AVYclima</span>
</a>
```

```css
.mobile-cta-bar { display: none; }

@media (max-width: 768px) {
  .mobile-cta-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    background: var(--primary);
    color: var(--white) !important;
    padding: 0.9rem 1rem;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.12);
    /* iOS safe-area voor toestellen met thuisbalk */
    padding-bottom: calc(0.9rem + env(safe-area-inset-bottom));
  }
  /* Geef de pagina voldoende ruimte onderaan zodat de bel-knop niet boven content valt */
  body { padding-bottom: 4rem; }
  /* Cookie-banner net boven de bel-knop schuiven als beide zichtbaar zijn */
  .cookie-banner.show { bottom: calc(56px + env(safe-area-inset-bottom)); }
}
```

#### 2.2 Tap-targets vergroten

Volgens Apple HIG (44×44 pt) en WCAG 2.5.8 (24×24 CSS px minimum, 44×44 aanbevolen) zijn enkele tap-targets nu te klein:

- **Nav-toggle (hamburger):** `padding: 0.5rem` op een 24px brede `<span>` geeft ~34×34px. Vergroot naar 44×44.
- **Mobiele nav-links:** `padding: 0.75rem 1rem` met `font-size: 1.05rem` geeft een tap-hoogte van ~42px. Net onder de drempel.
- **Footer-links** en breadcrumbs: vaak op de drempel.

```css
.nav-toggle {
  padding: 0.75rem;          /* was 0.5rem */
  min-width: 44px;
  min-height: 44px;
}

@media (max-width: 768px) {
  .nav a {
    padding: 1rem 1.25rem;    /* was 0.75rem 1rem */
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .footer a {
    padding: 0.5rem 0;
    display: inline-block;
  }
  .breadcrumb a {
    padding: 0.25rem 0;
    display: inline-block;
  }
}
```

#### 2.3 Scroll-locking robuuster maken bij open menu

De huidige JS-aanpak (`document.body.style.overflow = 'hidden'`) lijkt te werken maar laat op iOS Safari de pagina onder de menulaag tóch nog kortelings meescrollen. Dat geeft een "wiebelend" effect en soms een zichtbare scroll-jump bij sluiten.

Robuustere implementatie in `js/main.js` (rond regel 12–25):

```js
let scrollY = 0;

navToggle.addEventListener('click', function () {
  const willOpen = !nav.classList.contains('active');
  navToggle.classList.toggle('active');
  nav.classList.toggle('active');

  if (willOpen) {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  } else {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }
});

// Klikken op een link sluit het menu en herstelt scrollpositie
nav.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navToggle.classList.remove('active');
    nav.classList.remove('active');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
  });
});
```

Geen `scrollTo` na het sluiten via een link, omdat de gebruiker dan in de regel naar een andere pagina navigeert.

### Middelhoge prioriteit

#### 2.4 Kaart op contact.html verkleinen op mobiel

De `<iframe>` heeft een vaste `height="400"` plus inline CSS `height: 400px`. Op mobiel kost dat veel verticale ruimte vlak voor de footer en de CTA.

Wijzig in `contact.html` (rond regel 369) de inline style en voeg een CSS-regel toe:

```html
<div class="map-container">
```

```css
.map-container {
  height: 400px;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-top: 1.5rem;
}
@media (max-width: 768px) {
  .map-container,
  .map-container iframe { height: 260px; }
}
```

#### 2.5 Cookie-banner mobielvriendelijker

De banner stacked al verticaal op mobiel (`.cookie-inner` regel 1679), maar de twee knoppen staan nog horizontaal. Op smalle telefoons (Android Go, oudere iPhones < 375px) is dat krap.

```css
@media (max-width: 768px) {
  .cookie-inner { gap: 0.75rem; }
  .cookie-buttons { width: 100%; }
  .cookie-buttons .btn {
    flex: 1;
    min-height: 44px;
    justify-content: center;
  }
}
```

#### 2.6 Skip-to-content link visueel verstevigen

`.skip-to-content` (regel 6) is keyboard-only zichtbaar. Geef hem expliciet een focus-state met groter contrast:

```css
.skip-to-content {
  /* bestaande regels */
  font-size: 1rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.skip-to-content:focus {
  top: 0;
  outline: 3px solid var(--accent);
  outline-offset: 0;
}
```

#### 2.7 Hover-only styling tweaken voor touch

De hover-states (bv. `transform: translateY(-2px)` op `.btn--primary:hover`) hebben op touch-devices weinig zin en kunnen "vastplakken" — een eerste tap activeert hover, de tweede de actie. Verhul de hover op touchscreens:

```css
@media (hover: none) {
  .btn:hover,
  .card:hover,
  .nav a:hover {
    transform: none !important;
    box-shadow: inherit !important;
  }
}
```

#### 2.8 Tap-highlight overschrijven

Standaard krijgen tap-targets een grijze flash bij tap. Vervang door iets dat past:

```css
html { -webkit-tap-highlight-color: rgba(58, 58, 58, 0.1); }
.btn, .nav a, .card a {
  -webkit-tap-highlight-color: transparent;
}
```

### Lage prioriteit

#### 2.9 Hero op mobiel iets compacter

De `.hero` heeft op mobiel `padding: 7rem 0 3.5rem` (regel 1575). Met een H1 van 2rem (1.75rem op <480px) is dat goed leesbaar, maar de bovenmarge van 7rem (112px) is fors. Probeer `padding: 5.5rem 0 3rem` op `<768px` en `4.5rem 0 2.5rem` op `<480px`.

#### 2.10 Tabel met scroll op mobiel

De `.comparison-table` op `prijs-warmtepomp-installatie.html` en `kostenvergelijking-warmtepomp.html` wordt smaller met `font-size: 0.85rem`, maar kan op kleine schermen alsnog overlopen. Wrap in een scrollbare container:

```html
<div class="table-scroll">
  <table class="comparison-table">...</table>
</div>
```

```css
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -1rem;          /* doet de tabel vol over het scherm uitlopen op mobiel */
  padding: 0 1rem;
}
.comparison-table { min-width: 480px; }
```

#### 2.11 "Terug naar boven"-knop op lange pagina's

Op blogartikelen en de premiegids verdient een kleine floating "↑ Boven"-knop overweging. Optioneel, en alleen onthullen na bv. 600px scroll.

#### 2.12 Calculator-UI op mobiel

`/kostenvergelijking-warmtepomp.html` (de terugverdientijd-calculator) is met `grid-template-columns: 380px 1fr` op desktop ingericht; op `<960px` stapelt hij correct. Niet uitvoerig nagekeken in deze audit, maar de tap-targets in `.calc-toggle` (radio buttons) en `.calc-modus-btn` verdienen apart een controle op een echt toestel — die patronen hebben historisch de kleinste tap-targets.

---

## 3. Wat al goed is op mobiel

Geen werk nodig op deze punten:

- **Viewport-meta** is overal aanwezig en correct: `width=device-width, initial-scale=1.0`.
- **Form-inputs op `font-size: 1rem` (16px)** — voorkomt iOS auto-zoom bij focus.
- **Correcte `type=`-attributen** op contactformulier (`email`, `tel`, `text`) — mobiele toetsenborden tonen het juiste paneel.
- **Knoppen full-width op mobiel** via `.btn-group { flex-direction: column; align-items: stretch }` op `<768px`.
- **Cards en grids stapelen** (`grid--2`, `grid--3`, `services-grid` allemaal `1fr` op `<768px`).
- **Footer kolommen stapelen** naar één kolom op `<768px`.
- **Skip-to-content link** aanwezig op alle pagina's.
- **`tel:` en `mailto:` links** consequent gebruikt — direct tappen werkt.
- **Image hygiene** (zie fase 4): alle img's hebben `width`, `height`, `loading`, `decoding` — geen layout-shift op mobiel.

---

## 4. Aanbevolen volgorde

1. **Eerst (vandaag):** menu-bug fix (sectie 1). Eén CSS-blok, direct effect.
2. **Daarna (deze week):** sticky bel-knop (2.1) en tap-target vergroten (2.2). Beide laaghangend fruit met hoge conversie-impact.
3. **Volgende ronde:** scroll-lock-JS (2.3), kaart kleiner (2.4), cookie-banner (2.5), touch-hover (2.7), tap-highlight (2.8).
4. **Optioneel:** hero-compactheid (2.9), table-scroll (2.10), back-to-top (2.11), calculator nakijken op een toestel (2.12).

Alle voorgestelde fixes raken alleen `css/style.css`, `js/main.js` en (voor de sticky bel-knop) een snippet in elke pagina vlak boven `</main>` of in een include. Geen content of structured-data raakt aan.
