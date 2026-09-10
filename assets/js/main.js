/* =========================================================
   AP-Bau UG – Meisterbetrieb
   main.js · Vanilla JS, keine Abhängigkeiten
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------
     Jahreszahl im Footer
     --------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------
     Sticky Header – Schatten ab etwas Scroll
     --------------------------------------------------- */
  var header = $('#header');
  var toTop  = $('#toTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop)  toTop.classList.toggle('is-visible', y > 600);
    markActiveSection();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------
     Mobiles Menü
     --------------------------------------------------- */
  var burger = $('#burger');
  var nav    = $('#nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeNav();
    });
  }

  /* ---------------------------------------------------
     Aktiver Navigationspunkt beim Scrollen
     --------------------------------------------------- */
  var navLinks = $$('#nav a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function markActiveSection() {
    if (!sections.length) return;
    var pos = (window.pageYOffset || document.documentElement.scrollTop) + 140;
    var current = null;

    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });

    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ---------------------------------------------------
     Reveal-Animation beim Scrollen
     --------------------------------------------------- */
  var revealItems = $$('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('is-in'); }, Math.min(i * 70, 280));
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------
     Öffnungszeiten: Status + heutigen Tag hervorheben
     Zeiten in Minuten seit Mitternacht, Index = getDay()
     --------------------------------------------------- */
  var HOURS = {
    0: null,                    // Sonntag – geschlossen
    1: { open: 420, close: 1020 },
    2: { open: 420, close: 1020 },
    3: { open: 420, close: 1020 },
    4: { open: 420, close: 1020 },
    5: { open: 420, close: 900 },  // Freitag bis 15:00
    6: null                     // Samstag – nur nach Vereinbarung
  };
  var DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }

  function nextOpening(fromDay) {
    for (var i = 1; i <= 7; i++) {
      var d = (fromDay + i) % 7;
      if (HOURS[d]) {
        return { label: i === 1 ? 'morgen' : DAY_NAMES[d], time: fmt(HOURS[d].open) };
      }
    }
    return null;
  }

  function updateStatus() {
    var dot  = $('#statusDot');
    var text = $('#statusText');
    if (!dot || !text) return;

    var now   = new Date();
    var day   = now.getDay();
    var mins  = now.getHours() * 60 + now.getMinutes();
    var today = HOURS[day];

    dot.classList.remove('dot--open', 'dot--closed');

    if (today && mins >= today.open && mins < today.close) {
      dot.classList.add('dot--open');
      var left = today.close - mins;
      text.textContent = left <= 60
        ? 'Jetzt geöffnet · schließt um ' + fmt(today.close)
        : 'Jetzt geöffnet · bis ' + fmt(today.close) + ' Uhr';
      return;
    }

    dot.classList.add('dot--closed');

    if (today && mins < today.open) {
      text.textContent = 'Geschlossen · öffnet heute um ' + fmt(today.open);
      return;
    }

    var next = nextOpening(day);
    text.textContent = next
      ? 'Geschlossen · öffnet ' + next.label + ' um ' + next.time
      : 'Aktuell geschlossen';
  }

  updateStatus();
  setInterval(updateStatus, 60000);

  // Heutigen Tag in der Öffnungszeiten-Tabelle markieren
  var todayRow = $('#hours li[data-day="' + new Date().getDay() + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  /* ---------------------------------------------------
     Zahlen-Animation in der "In Zahlen"-Box
     --------------------------------------------------- */
  var statNums = $$('.stats__n');
  if (statNums.length && 'IntersectionObserver' in window && !reduceMotion) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var raw = el.textContent.trim();
        var num = parseInt(raw.replace(/\D/g, ''), 10);
        if (isNaN(num)) { sio.unobserve(el); return; }

        var suffix = raw.replace(/^[\d\s.]+/, '');
        var start = null, dur = 1100;

        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(num * eased) + (suffix ? ' ' + suffix.trim() : '');
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        }
        requestAnimationFrame(tick);
        sio.unobserve(el);
      });
    }, { threshold: 0.5 });

    statNums.forEach(function (el) { sio.observe(el); });
  }

  /* ---------------------------------------------------
     Kontaktformular
     Ohne Server-Backend: die Anfrage wird als fertige
     E-Mail im Mailprogramm des Besuchers geöffnet.
     Für echten Versand siehe README.md (Formspree o. ä.).
     --------------------------------------------------- */
  var EMPFAENGER = 'info@ap-bau-ug.de';

  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot – von Bots ausgefüllt, von Menschen nie
      if (form.website && form.website.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var v = function (name) {
        var el = form.elements[name];
        return el ? String(el.value).trim() : '';
      };

      var betreff = 'Bauanfrage: ' + (v('topic') || 'Allgemein') + ' – ' + v('name');

      var body = [
        'Neue Anfrage über die Website',
        '',
        'Name:      ' + v('name'),
        'Telefon:   ' + v('phone'),
        'E-Mail:    ' + (v('email') || '–'),
        'Leistung:  ' + v('topic'),
        'Bauort:    ' + (v('place') || '–'),
        '',
        'Vorhaben:',
        v('message'),
        '',
        '—',
        'Gesendet am ' + new Date().toLocaleString('de-DE')
      ].join('\n');

      window.location.href = 'mailto:' + EMPFAENGER +
        '?subject=' + encodeURIComponent(betreff) +
        '&body=' + encodeURIComponent(body);

      var msg = $('#formMsg');
      if (msg) {
        msg.classList.add('is-visible');
        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* Initialer Lauf */
  onScroll();
})();
