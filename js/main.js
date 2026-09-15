(function () {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Header: transparent-on-hero, solid on scroll ---------------- */
  var siteHeader = document.querySelector('.site-header');

  function setHeaderHeightVar() {
    document.documentElement.style.setProperty('--header-h', siteHeader.offsetHeight + 'px');
  }

  function updateHeaderScrollState() {
    var scrolled = window.scrollY > 40;
    siteHeader.classList.toggle('scrolled', scrolled);
  }

  setHeaderHeightVar();
  updateHeaderScrollState();
  window.addEventListener('scroll', updateHeaderScrollState, { passive: true });
  window.addEventListener('resize', setHeaderHeightVar);

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primary-nav');

  function closeNav() {
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  primaryNav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------------- Services nav dropdown ---------------- */
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));

  function closeAllNavItems(except) {
    navItems.forEach(function (item) {
      if (item !== except) {
        item.classList.remove('open');
        var trigger = item.querySelector('.nav-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  navItems.forEach(function (item) {
    var trigger = item.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      closeAllNavItems(item);
    });
  });

  document.addEventListener('click', function (e) {
    navItems.forEach(function (item) {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        var trigger = item.querySelector('.nav-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllNavItems(null);
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- Gallery filter ---------------- */
  var tabs = document.querySelectorAll('.gallery-tab');
  var items = document.querySelectorAll('.gallery-item');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
      tab.setAttribute('aria-pressed', 'true');
      var filter = tab.getAttribute('data-filter');
      items.forEach(function (item) {
        var cats = (item.getAttribute('data-cat') || '').split(' ');
        var match = filter === 'all' || cats.indexOf(filter) !== -1;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');

  var lightboxTriggers = Array.prototype.slice.call(
    document.querySelectorAll('[data-full], [data-lightbox]')
  );
  var currentIndex = -1;
  var lastFocused = null;

  function sourceFor(el) {
    return el.getAttribute('data-full') || el.getAttribute('href');
  }

  function openLightbox(index) {
    currentIndex = index;
    var el = lightboxTriggers[index];
    if (!el) return;
    lastFocused = document.activeElement;
    lightboxImg.src = sourceFor(el);
    lightboxImg.alt = el.querySelector('img') ? el.querySelector('img').alt : '';
    lightboxCaption.textContent = el.getAttribute('data-caption') || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  function showRelative(delta) {
    if (currentIndex === -1) return;
    var next = (currentIndex + delta + lightboxTriggers.length) % lightboxTriggers.length;
    openLightbox(next);
  }

  lightboxTriggers.forEach(function (el, i) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(i);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { showRelative(-1); });
  lightboxNext.addEventListener('click', function () { showRelative(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  /* ---------------- Contact form validation ---------------- */
  var form = document.getElementById('quoteForm');
  var formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      var requiredFields = form.querySelectorAll('[required]');
      var firstInvalid = null;
      var allValid = true;

      requiredFields.forEach(function (field) {
        var wrapper = field.closest('.field');
        var valid = field.checkValidity();
        if (!valid) {
          allValid = false;
          if (wrapper) wrapper.classList.add('invalid');
          if (!firstInvalid) firstInvalid = field;
        } else if (wrapper) {
          wrapper.classList.remove('invalid');
        }
      });

      if (!allValid) {
        e.preventDefault();
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Please fill in all required fields before sending.';
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formStatus.className = 'form-status success';
      formStatus.textContent = 'Sending your enquiry…';
    });

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        if (wrapper && field.checkValidity()) wrapper.classList.remove('invalid');
      });
    });
  }
})();
