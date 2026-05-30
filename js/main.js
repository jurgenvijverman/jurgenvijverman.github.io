/* ============================================
   AVYclima - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation Toggle ---
  // Robuuste scroll-lock: op iOS Safari werkt `overflow: hidden` op body niet
  // betrouwbaar; daarom maken we de body fixed en bewaren scrollpositie.
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  let savedScrollY = 0;

  function lockBodyScroll() {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll(restoreScroll) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    if (restoreScroll) window.scrollTo(0, savedScrollY);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var willOpen = !nav.classList.contains('active');
      navToggle.classList.toggle('active');
      nav.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

      if (willOpen) {
        lockBodyScroll();
      } else {
        unlockBodyScroll(true);
      }
    });

    // Sluiten via een nav-link: scroll-lock vrijgeven zonder de scrollpositie
    // te herstellen (de bezoeker navigeert vaak naar een andere pagina/anchor).
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        unlockBodyScroll(false);
      });
    });
  }

  // --- Header scroll effect ---
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    });
  }

  // --- Active nav link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.parentElement;
      const wasActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('active');
      });

      // Open clicked (if it wasn't already open)
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Scroll animations (Intersection Observer) ---
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Contact form handling ---
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {

    // ── Calculator-prefill ──────────────────────────────────────────────
    // Als de bezoeker via de terugverdientijd-calculator hier komt, tonen
    // we hun keuzes bovenaan en zetten ze als verborgen velden zodat de
    // installateur de context in de aanvraag-mail ziet.
    (function fillCalculatorContext() {
      var params = new URLSearchParams(window.location.search);
      if (params.get('bron') !== 'calculator') return;

      var WOONTYPE = { open:'Open bebouwing', halfopen:'Halfopen bebouwing', rij:'Rijwoning', appartement:'Appartement' };
      var BRANDSTOF = { gas:'Aardgas', mazout:'Stookolie (mazout)', elektrisch:'Elektrisch', pellets:'Pellets / hout' };
      var WPTYPE = {
        lucht_lucht:'Lucht / lucht (multisplit)',
        lucht_water:'Lucht / water (Altherma)',
        hybride_lucht_water:'Hybride lucht / water',
        geothermisch:'Geothermisch'
      };
      var VERVANGT = { yes:'Ja — volledige vervanging', no:'Nee — bestaand blijft' };

      var fields = [
        { key:'woning',   label:'Type woning',           map: WOONTYPE,  hiddenId:'hidden-calc-woning' },
        { key:'bouwjaar', label:'Bouwjaar',              map: null,      hiddenId:'hidden-calc-bouwjaar' },
        { key:'brandstof',label:'Huidige brandstof',     map: BRANDSTOF, hiddenId:'hidden-calc-brandstof' },
        { key:'verbruik', label:'Jaarverbruik (kWh)',    map: null,      hiddenId:'hidden-calc-verbruik' },
        { key:'type',     label:'Warmtepomp-type',       map: WPTYPE,    hiddenId:'hidden-calc-wp-type' },
        { key:'vervangt', label:'Vervangt huidig systeem', map: VERVANGT, hiddenId:'hidden-calc-vervangt' }
      ];

      var summary = document.getElementById('calc-prefill-summary');
      var list = document.getElementById('calc-prefill-list');
      if (!summary || !list) return;

      var bronInput = document.getElementById('hidden-calc-bron');
      if (bronInput) bronInput.value = 'calculator';

      var anyShown = false;
      fields.forEach(function (f) {
        var raw = params.get(f.key);
        if (!raw) return;
        var display = f.map ? (f.map[raw] || raw) : raw;

        var dt = document.createElement('dt');
        dt.textContent = f.label;
        var dd = document.createElement('dd');
        dd.textContent = display;
        list.appendChild(dt);
        list.appendChild(dd);

        var hidden = document.getElementById(f.hiddenId);
        if (hidden) hidden.value = display;
        anyShown = true;
      });

      if (anyShown) {
        summary.hidden = false;
        // Pre-set het onderwerp als type warmtepomp gekozen is
        var typeRaw = params.get('type');
        if (typeRaw) {
          var onderwerpEl = contactForm.querySelector('[name="onderwerp"]');
          if (onderwerpEl) {
            for (var i = 0; i < onderwerpEl.options.length; i++) {
              if (onderwerpEl.options[i].value === 'Offerte warmtepomp') {
                onderwerpEl.selectedIndex = i;
                break;
              }
            }
          }
        }
        // Plausible event
        if (typeof window.plausible === 'function') {
          window.plausible('Lead from Calculator');
        }
      }
    })();

    // Legacy fallback: cached/bookmarked links may still hit contact.html?verzonden=1.
    // The active success path is /bedankt.html, which fires the Lead event itself.
    // Here we only render the success banner for graceful degradation — no event
    // firing, to avoid double-counting if a user hits both URLs in sequence.
    if (window.location.search.indexOf('verzonden=1') !== -1) {
      var successMsg = document.createElement('div');
      successMsg.className = 'form-success-banner';
      successMsg.innerHTML = '<p><strong>Bedankt voor uw aanvraag!</strong> We nemen zo snel mogelijk contact met u op.</p>';
      contactForm.parentElement.insertBefore(successMsg, contactForm);
      contactForm.style.display = 'none';

      // Clean URL without reloading
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    contactForm.addEventListener('submit', function (e) {
      // Client-side validation before allowing Formsubmit.co submission
      var name = contactForm.querySelector('[name="naam"]');
      var email = contactForm.querySelector('[name="email"]');
      var phone = contactForm.querySelector('[name="telefoon"]');
      var message = contactForm.querySelector('[name="bericht"]');
      var privacy = contactForm.querySelector('[name="privacy"]');

      if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !message.value.trim()) {
        e.preventDefault();
        alert('Vul alle verplichte velden in.');
        return;
      }

      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        e.preventDefault();
        alert('Vul een geldig e-mailadres in.');
        return;
      }

      // Privacy checkbox
      if (!privacy.checked) {
        e.preventDefault();
        alert('U moet akkoord gaan met het privacybeleid.');
        return;
      }

      // Validation passed — show loading state while Formsubmit.co processes
      var submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.textContent = 'Bezig met verzenden...';
      submitBtn.disabled = true;

      // Allow the native form POST to Formsubmit.co to proceed.
      //
      // Watchdog-fallback: FormSubmit.co draait achter Cloudflare. Bij een outage
      // hangt de POST en zien klanten een lege pagina of timeout. We zetten een
      // 12-seconden timer; als de browser nog op contact.html staat, tonen we
      // een fallback-banner met telefoonnummer + mailto. Bij succes navigeert
      // de browser weg naar /bedankt.html en wordt deze timer gecanceld door
      // pagina-unload.
      setTimeout(function () {
        if (document.visibilityState !== 'hidden') {
          showFormFallbackBanner(contactForm);
        }
      }, 12000);
    });

    function showFormFallbackBanner(form) {
      // Restore submit-state zodat klant het opnieuw kan proberen
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Probeer opnieuw te verzenden';
        submitBtn.disabled = false;
      }

      // Voorkom dubbele banners
      if (document.querySelector('.form-fallback-banner')) return;

      var banner = document.createElement('div');
      banner.className = 'form-fallback-banner';
      banner.setAttribute('role', 'alert');
      banner.innerHTML = [
        '<h3>Het verzenden duurt langer dan verwacht</h3>',
        '<p>Ons formulier-systeem reageert traag of is mogelijk tijdelijk niet bereikbaar. ',
        'Uw aanvraag is misschien nog wel goed binnengekomen — als u binnen 5 minuten geen bevestiging in uw mailbox ziet, gebruik dan een van deze directe kanalen:</p>',
        '<ul>',
        '<li>📞 <a href="tel:+32472657647">Bellen: +32 472 65 76 47</a></li>',
        '<li>✉️ <a href="mailto:info@avyclima.be">Mailen: info@avyclima.be</a></li>',
        '</ul>',
        '<p><small>Onze excuses voor het ongemak. Form-storingen treden zelden op en duren typisch enkele minuten.</small></p>'
      ].join('');
      form.parentElement.insertBefore(banner, form);

      // Plausible event voor monitoring
      if (typeof window.plausible === 'function') {
        window.plausible('Form Fallback Triggered');
      }
    }
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Cookie banner ---
  var cookieBanner = document.querySelector('.cookie-banner');
  if (cookieBanner) {
    // Check if user already accepted
    if (!localStorage.getItem('avyclima_cookies_accepted')) {
      cookieBanner.classList.add('show');
    }

    var acceptBtn = cookieBanner.querySelector('.cookie-accept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem('avyclima_cookies_accepted', 'true');
        cookieBanner.classList.remove('show');
      });
    }

    var rejectBtn = cookieBanner.querySelector('.cookie-reject');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        localStorage.setItem('avyclima_cookies_accepted', 'false');
        cookieBanner.classList.remove('show');
      });
    }
  }

  // --- Phone + email click tracking (Plausible + legacy GA4) ---
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof plausible === 'function') {
        plausible('Phone Click', { props: { href: link.getAttribute('href') } });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'click_to_call', {
          event_category: 'contact',
          event_label: link.getAttribute('href')
        });
      }
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof plausible === 'function') {
        plausible('Email Click', { props: { href: link.getAttribute('href') } });
      }
      if (typeof gtag === 'function') {
        gtag('event', 'click_to_email', {
          event_category: 'contact',
          event_label: link.getAttribute('href')
        });
      }
    });
  });

  // --- Form submit tracking ---
  // Note: the 'Lead' event fires once, on bedankt.html (the Formsubmit.co _next
  // target) — not here on raw form submit. That prevents false positives from
  // validation failures, network errors, or abandoned submissions, and keeps
  // conversion attribution to a single, dedicated thank-you URL.

  // --- Brede tabellen automatisch in een scrollwrap zetten (mobiel) ---
  // Vermijdt dat .comparison-table de viewport overschrijdt op smalle schermen.
  document.querySelectorAll('.comparison-table').forEach(function (table) {
    if (table.parentElement.classList.contains('table-scroll')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // --- Back-to-top knop ---
  // Toont een 'naar boven'-knop nadat de bezoeker 600px heeft gescrold.
  var backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Terug naar boven');
  backToTop.innerHTML = '<span aria-hidden="true">↑</span>';
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

});
