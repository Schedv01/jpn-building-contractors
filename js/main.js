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

  /* ---------------- Back to top (mobile only) ---------------- */
  var backToTop = document.getElementById('backToTop');

  function updateBackToTopVisibility() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  updateBackToTopVisibility();
  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

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

  /* ---------------- Lightbox / project slideshows ---------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCount = document.getElementById('lightboxCount');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');

  var slides = [];
  var slideTitle = '';
  var currentIndex = -1;
  var lastFocused = null;

  function showSlide(i) {
    currentIndex = (i + slides.length) % slides.length;
    lightboxImg.src = slides[currentIndex].src;
    lightboxImg.alt = slides[currentIndex].alt;
    lightboxCaption.textContent = slideTitle;
    lightboxCount.textContent = slides.length > 1 ? (currentIndex + 1) + ' / ' + slides.length : '';
    var multi = slides.length > 1;
    lightboxPrev.style.display = lightboxNext.style.display = multi ? '' : 'none';
  }

  function openLightbox(list, title, start) {
    slides = list;
    slideTitle = title;
    lastFocused = document.activeElement;
    showSlide(start || 0);
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

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var title = card.getAttribute('data-title');
      var list = card.getAttribute('data-images').split('|').map(function (src, n) {
        return { src: src, alt: title + ' — photo ' + (n + 1) };
      });
      openLightbox(list, title, 0);
    });
  });

  var droneLinks = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var droneSlides = droneLinks.map(function (el) {
    var img = el.querySelector('img');
    return { src: el.getAttribute('href'), alt: img ? img.alt : '', caption: el.getAttribute('data-caption') || '' };
  });
  droneLinks.forEach(function (el, i) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(droneSlides, 'Drone survey', i);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { showSlide(currentIndex - 1); });
  lightboxNext.addEventListener('click', function () { showSlide(currentIndex + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

  var touchX = null;
  lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null || slides.length < 2) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showSlide(currentIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
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
