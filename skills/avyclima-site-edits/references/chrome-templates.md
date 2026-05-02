# Chrome templates — verbatim snippets

This file is the source of truth for the chrome that should be **byte-identical across every page**: the header/nav, the footer, the cookie banner, the skip-to-content link, the Web Vitals script, and the `<head>` boilerplate.

The site has drifted (see `known-issues.md`) — different pages have slightly different versions of the same chrome. When making site-wide edits, **align everything to the snippets below**. Use `index.html` as the canonical page; it is the most complete version.

> When updating chrome site-wide, the exact strings below are what every page should match. Diff them against the page you're editing and bring it into line.

## `<html>` opening

```html
<!DOCTYPE html>
<html lang="nl-BE">
```

`lang="nl-BE"` is required (Belgian Dutch). Never just `nl` or `en`.

## `<head>` baseline (every page must have this)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0057a8">

<!-- Apple mobile -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">

<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Stylesheet -->
<link rel="preload" as="style" href="css/style.css">
<link rel="stylesheet" href="css/style.css">
```

For pages in `blog/` or `portfolio/` subdirectories, change `css/style.css` to `../css/style.css`.

## Per-page SEO meta — pattern

Replace `{...}` placeholders. Always supply all of these.

```html
<title>{Title — see seo-checklist for format} – AVYclima</title>
<meta name="description" content="{140–160 char description}">
<meta name="keywords" content="{comma-separated, lowercased, includes brand + city + service}">
<link rel="canonical" href="https://avyclima.be/{path}">
<link rel="alternate" hreflang="nl-BE" href="https://avyclima.be/{path}">
<link rel="alternate" hreflang="x-default" href="https://avyclima.be/{path}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://avyclima.be/{path}">
<meta property="og:title" content="{same as <title>}">
<meta property="og:description" content="{same as meta description}">
<meta property="og:image" content="https://avyclima.be/og-image.jpg">
<meta property="og:site_name" content="AVYclima">
<meta property="og:locale" content="nl_BE">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{same as <title>}">
<meta name="twitter:description" content="{same as meta description}">
<meta name="twitter:image" content="https://avyclima.be/og-image.jpg">
```

For blog posts, use `og:type` of `article` and add `og:article:published_time`.

## Skip-to-content link (first child of `<body>`)

```html
<a href="#main-content" class="skip-to-content">Naar hoofdinhoud</a>
```

## Header / nav (canonical)

```html
<header class="header">
  <div class="container">
    <a href="index.html" class="logo">AVY<span>clima</span></a>
    <nav class="nav">
      <a href="index.html">Home</a>
      <a href="airco.html">Airco</a>
      <a href="warmtepomp.html">Warmtepomp</a>
      <a href="onderhoud.html">Onderhoud</a>
      <a href="over-ons.html">Over ons</a>
      <a href="portfolio.html">Realisaties</a>
      <a href="faq.html">FAQ</a>
      <a href="blog.html">Blog</a>
      <a href="contact.html">Contact</a>
    </nav>
    <button class="nav-toggle" aria-label="Menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</header>
```

The active link gets `class="active"` — but this is set by `js/main.js` from the URL pathname, **not** in the HTML. Do not hardcode `class="active"` (some pages do — that's drift to clean up).

For pages in `blog/` or `portfolio/` subdirectories, prefix every nav `href` with `../` (e.g. `../airco.html`).

## Footer (canonical — includes Werkgebied link)

```html
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-about">
        <a href="index.html" class="logo">AVY<span>clima</span></a>
        <p>Daikin specialist voor airconditioning en warmtepompen in Aalst en omgeving. Advies, installatie, onderhoud en herstellingen.</p>
      </div>
      <div class="footer-links">
        <h4>Diensten</h4>
        <a href="airco.html">Airconditioning</a>
        <a href="warmtepomp.html">Warmtepompen</a>
        <a href="onderhoud.html">Onderhoud</a>
        <a href="contact.html">Offerte aanvragen</a>
      </div>
      <div class="footer-links">
        <h4>Informatie</h4>
        <a href="over-ons.html">Over ons</a>
        <a href="portfolio.html">Realisaties</a>
        <a href="faq.html">Veelgestelde vragen</a>
        <a href="blog.html">Blog</a>
        <a href="werkgebied.html">Werkgebied</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="footer-contact">
        <h4>Contact</h4>
        <p>📍 Denderleeuw, België</p>
        <p>📞 <a href="tel:+32472657647">+32 472 65 76 47</a></p>
        <p>✉️ <a href="mailto:info@avyclima.be">info@avyclima.be</a></p>
        <p>🕐 Ma-Vr: 8:00-18:00, Za: 9:00-13:00</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {CURRENT_YEAR} AVYclima. Alle rechten voorbehouden.</p>
      <a href="privacy.html">Privacybeleid</a>
    </div>
  </div>
</footer>
```

`{CURRENT_YEAR}` should be the current calendar year (`date +%Y` in shell). Today most pages still say 2024 — see `known-issues.md`.

For pages in `blog/` or `portfolio/`, prefix every relative `href` with `../`.

## Cookie banner

```html
<div class="cookie-banner">
  <div class="cookie-inner">
    <p>Deze website gebruikt cookies om uw ervaring te verbeteren. <a href="privacy.html">Meer info</a></p>
    <div class="cookie-buttons">
      <button class="btn btn--sm cookie-reject">Weigeren</button>
      <button class="btn btn--sm btn--primary cookie-accept">Accepteren</button>
    </div>
  </div>
</div>
```

Goes immediately before the closing `</body>` tag. Behaviour is wired in `js/main.js` via `localStorage.avyclima_cookies_accepted`.

## Web Vitals script (every page, before `</body>`)

```html
<script type="module">
  import {onCLS, onINP, onLCP} from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module';
  function sendToGA4(metric) {
    if (typeof gtag === 'function') {
      gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        non_interaction: true
      });
    }
  }
  onCLS(sendToGA4);
  onINP(sendToGA4);
  onLCP(sendToGA4);
</script>
```

## Main script (last thing in `<body>`)

```html
<script src="js/main.js" defer></script>
```

For `blog/` and `portfolio/` pages: `<script src="../js/main.js" defer></script>`.

## GA4 (gtag) — currently MISSING

The Web Vitals snippet calls `gtag(...)` but no page actually loads `gtag.js`. This means tracking is silently dropped. Until the GA4 measurement ID is decided, leave the Web Vitals script in place but understand events are no-ops.

When adding GA4, the snippet goes in `<head>` (just before the JSON-LD blocks):

```html
<!-- GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id={MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{MEASUREMENT_ID}', { anonymize_ip: true });
</script>
```

If/when consent-mode is enabled, this needs to be gated on `localStorage.avyclima_cookies_accepted === 'true'`.

---

## JSON-LD scaffolds

Each page's JSON-LD goes inside `<head>`, after the meta tags and before the stylesheet links. One `<script type="application/ld+json">` block per schema entity (do not flatten with `@graph` — the existing site doesn't).

### HVACBusiness (homepage only)

```json
{
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  "name": "AVYclima",
  "url": "https://avyclima.be",
  "logo": "https://avyclima.be/logo.png",
  "description": "Daikin specialist voor airconditioning en warmtepompen in Aalst en omgeving",
  "telephone": "+32472657647",
  "email": "info@avyclima.be",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Denderleeuw",
    "addressLocality": "Denderleeuw",
    "postalCode": "9470",
    "addressCountry": "BE"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 50.9281, "longitude": 4.0677 },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "13:00" }
  ],
  "areaServed": { "@type": "City", "name": "Aalst" },
  "priceRange": "€€€",
  "sameAs": ["https://www.facebook.com/avyclima","https://www.instagram.com/avyclima","https://www.linkedin.com/company/avyclima"],
  "serviceType": ["Air Conditioning","Heat Pump Installation","HVAC Maintenance"],
  "knowsAbout": "Daikin"
}
```

### Service (service hub pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{e.g. Airconditioning installatie en onderhoud}",
  "description": "{1–2 sentences}",
  "url": "https://avyclima.be/{page}.html",
  "serviceType": ["{2–4 service types in English}"],
  "provider": {
    "@type": "HVACBusiness",
    "name": "AVYclima",
    "url": "https://avyclima.be",
    "logo": "https://avyclima.be/logo.png",
    "telephone": "+32472657647",
    "email": "info@avyclima.be",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Denderleeuw",
      "postalCode": "9470",
      "addressCountry": "BE"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 50.9281, "longitude": 4.0677 },
    "priceRange": "€€€",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "13:00" }
    ]
  },
  "areaServed": [
    { "@type": "City", "name": "Aalst" },
    { "@type": "City", "name": "Denderleeuw" },
    { "@type": "City", "name": "Ninove" },
    { "@type": "City", "name": "Dendermonde" },
    { "@type": "City", "name": "Haaltert" },
    { "@type": "City", "name": "Erpe-Mere" },
    { "@type": "City", "name": "Lede" },
    { "@type": "City", "name": "Herzele" },
    { "@type": "City", "name": "Geraardsbergen" },
    { "@type": "City", "name": "Zottegem" }
  ]
}
```

### LocalBusiness (city landing pages)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "AVYclima - {Service} {Stad}",
  "url": "https://avyclima.be/{page}.html",
  "image": "https://avyclima.be/logo.png",
  "description": "{e.g. Professionele airco installatie in {Stad} - Daikin specialist}",
  "telephone": "+32472657647",
  "email": "info@avyclima.be",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Denderleeuw",
    "postalCode": "9470",
    "addressCountry": "BE"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 50.9281, "longitude": 4.0677 },
  "areaServed": { "@type": "City", "name": "{Stad}" },
  "priceRange": "€€€",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "13:00" }
  ]
}
```

### BreadcrumbList

City landing (3 levels):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://avyclima.be/" },
    { "@type": "ListItem", "position": 2, "name": "{Service hub name}", "item": "https://avyclima.be/{service}.html" },
    { "@type": "ListItem", "position": 3, "name": "{Stad}", "item": "https://avyclima.be/{service}-{stad}.html" }
  ]
}
```

Service hub (2 levels): drop the third `ListItem`.
Blog post: positions are Home → Blog → {Article title}, items are `/`, `/blog.html`, `/blog/{slug}.html`.
Portfolio entry: Home → Realisaties → {Project title}, items are `/`, `/portfolio.html`, `/portfolio/{slug}.html`.

### FAQPage (city pages and `faq.html`)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Question 1 — same wording as the visible <h3> on the page}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{Plain-text answer; HTML stripped}"
      }
    }
  ]
}
```

Each FAQ on the page must have a corresponding `Question` entry (and vice versa). When adding/removing a FAQ, update both the HTML and the JSON-LD in the same change.

### Article (blog posts and portfolio entries)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Article title}",
  "description": "{1-sentence summary, same as meta description}",
  "image": "https://avyclima.be/{path-to-hero-image-or-og-image.jpg}",
  "url": "https://avyclima.be/{path}",
  "datePublished": "{YYYY-MM-DD}",
  "dateModified": "{YYYY-MM-DD}",
  "author": {
    "@type": "Organization",
    "name": "AVYclima",
    "url": "https://avyclima.be"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AVYclima",
    "logo": {
      "@type": "ImageObject",
      "url": "https://avyclima.be/logo.png"
    }
  },
  "mainEntityOfPage": "https://avyclima.be/{path}"
}
```

`dateModified` ≥ `datePublished`. Bump `dateModified` whenever the article body changes meaningfully.
