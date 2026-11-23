/* Veronica Carletti — script essenziale, nessuna libreria */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno corrente nel footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var toggleLabel = toggle ? toggle.querySelector('.sr-only') : null;

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 1025px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Voce di menu attiva ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var sections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Comparsa delicata ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Accordion FAQ ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));
  triggers.forEach(function (btn, i) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.classList.toggle('is-open', !open);
    });
    btn.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown') next = triggers[(i + 1) % triggers.length];
      else if (e.key === 'ArrowUp') next = triggers[(i - 1 + triggers.length) % triggers.length];
      else if (e.key === 'Home') next = triggers[0];
      else if (e.key === 'End') next = triggers[triggers.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  /* ---------- Come funziona: percorso che si "disegna" con lo scroll ---------- */
  var journey = document.getElementById('journey');
  if (journey) {
    var steps = Array.prototype.slice.call(journey.querySelectorAll('.journey-step'));
    var nodes = steps.map(function (s) { return s.querySelector('.journey-node'); });
    var verticalMq = window.matchMedia('(max-width: 860px)');

    if (reduceMotion) {
      journey.style.setProperty('--progress', '1');
      steps.forEach(function (s) { s.classList.add('is-active', 'is-shown'); });
    } else {
      var ticking = false;
      var updateJourney = function () {
        ticking = false;
        var vh = window.innerHeight;
        var rect = journey.getBoundingClientRect();
        var p;
        if (verticalMq.matches) {
          var first = nodes[0].getBoundingClientRect();
          var last = nodes[nodes.length - 1].getBoundingClientRect();
          var start = first.top + first.height / 2;
          var end = last.top + last.height / 2;
          p = (vh * 0.6 - start) / Math.max(end - start, 1);
        } else {
          p = (vh * 0.82 - rect.top) / (vh * 0.45);
        }
        p = Math.max(0, Math.min(1, p));
        journey.style.setProperty('--progress', p.toFixed(4));
        journey.style.setProperty('--dot', p > 0.01 && p < 0.999 ? '1' : '0');

        steps.forEach(function (step, i) {
          var threshold = steps.length > 1 ? i / (steps.length - 1) : 0;
          var active = p >= threshold - 0.001 && (i > 0 || p > 0.001);
          step.classList.toggle('is-active', active);
          if (rect.top < vh * 0.88 && !step.dataset.sched) {
            step.dataset.sched = '1';
            setTimeout(function () { step.classList.add('is-shown'); }, i * 140);
          }
        });
      };
      var requestJourney = function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(updateJourney); }
      };
      window.addEventListener('scroll', requestJourney, { passive: true });
      window.addEventListener('resize', requestJourney);
      updateJourney();
    }
  }

  /* ---------- Modulo contatti ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('.btn-submit');
  var EMAIL_FALLBACK = 'veronicac.pedagogista@gmail.com';

  var rules = [
    { id: 'f-nome', test: function (el) { return el.value.trim().length >= 2; }, msg: 'Inserisci il tuo nome.' },
    { id: 'f-email', test: function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()); }, msg: 'Inserisci un indirizzo email valido.' },
    { id: 'f-servizio', test: function (el) { return el.value !== ''; }, msg: 'Seleziona il servizio di interesse.' },
    { id: 'f-msg', test: function (el) { return el.value.trim().length >= 10; }, msg: 'Scrivi un breve messaggio (almeno 10 caratteri).' },
    { id: 'f-privacy', test: function (el) { return el.checked; }, msg: 'Per inviare la richiesta è necessario accettare l\'informativa privacy.' }
  ];

  function setError(el, msg) {
    var err = document.getElementById(el.id + '-err');
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; el.setAttribute('aria-errormessage', err.id); }
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-errormessage');
      if (err) err.textContent = '';
    }
  }

  function validate() {
    var firstInvalid = null;
    rules.forEach(function (r) {
      var el = document.getElementById(r.id);
      if (!el) return;
      var ok = r.test(el);
      setError(el, ok ? '' : r.msg);
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    return firstInvalid;
  }

  rules.forEach(function (r) {
    var el = document.getElementById(r.id);
    if (!el) return;
    var evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur';
    el.addEventListener(evt, function () {
      if (el.getAttribute('aria-invalid') === 'true' || evt === 'change') setError(el, r.test(el) ? '' : r.msg);
    });
  });

  function showStatus(type, html) {
    status.className = 'form-status is-' + type;
    status.innerHTML = html;
    status.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    var invalid = validate();
    if (invalid) { invalid.focus(); return; }

    // Antispam: se il campo trappola è compilato, non inviare
    var hp = form.querySelector('[name="_gotcha"]');
    if (hp && hp.value) return;

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    if (!endpoint) {
      // Nessun sistema di invio configurato: nessuna simulazione di invio riuscito.
      showStatus('info',
        'Il modulo online non è ancora attivo, quindi la richiesta <strong>non è stata inviata</strong>. ' +
        'Puoi scrivermi a <a href="mailto:' + EMAIL_FALLBACK + '">' + EMAIL_FALLBACK + '</a> ' +
        'oppure chiamare il <a href="tel:+393386445722">338 644 5722</a>.');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Invio in corso…';

    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        showStatus('success', 'Grazie, la tua richiesta è stata inviata. Ti risponderò il prima possibile.');
      })
      .catch(function () {
        showStatus('error',
          'Si è verificato un problema e la richiesta non è stata inviata. Riprova più tardi oppure scrivimi a ' +
          '<a href="mailto:' + EMAIL_FALLBACK + '">' + EMAIL_FALLBACK + '</a>.');
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = 'Invia la richiesta';
      });
  });
})();
