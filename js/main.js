/* ============================================
   AVYclima - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close nav when clicking a link
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
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

    // Check if returning from successful submission (Formsubmit.co redirect)
    if (window.location.search.indexOf('verzonden=1') !== -1) {
      var successMsg = document.createElement('div');
      successMsg.className = 'form-success-banner';
      successMsg.innerHTML = '<p><strong>Bedankt voor uw aanvraag!</strong> We nemen zo snel mogelijk contact met u op.</p>';
      contactForm.parentElement.insertBefore(successMsg, contactForm);
      contactForm.style.display = 'none';

      // Fire GA4 event on confirmed successful submission
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'contact',
          event_label: 'contact_form_submit'
        });
      }

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

      // Allow the native form POST to Formsubmit.co to proceed
    });
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

  // --- Phone click tracking (GA4 ready) ---
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'click_to_call', {
          event_category: 'contact',
          event_label: link.getAttribute('href')
        });
      }
    });
  });

  // --- Form submit tracking (GA4 ready) ---
  // Note: GA4 generate_lead event now fires on confirmed submission only
  // (via ?verzonden=1 redirect from Formsubmit.co), not on raw form submit.
  // This prevents false positives from validation failures or abandoned submissions.

});
