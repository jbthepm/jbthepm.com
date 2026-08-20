/* =============================================================
   JB the PM — interaction layer

   IMPORTANT: this file adds motion only. It must never be the
   place where content lives — AI crawlers and search engines read
   the HTML, not the result of these functions. If you find
   yourself about to inject text here, put it in index.html instead.

   Contents:
     1. Reduced-motion guard
     2. Pointer tilt (spatial depth on cards)
     3. Ambient orb parallax
     4. Scroll reveal
     5. Sticky header state
     6. Contact form submit -> /api/contact
     7. Footer year
   ============================================================= */
(function () {
  'use strict';

  /* ---------- 1. Reduced-motion guard ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 2. Pointer tilt ----------
     Each [data-tilt] element rotates slightly toward the cursor.
     We only write two CSS custom properties; the transform itself
     is declared in styles.css so behaviour stays in one place. */
  var MAX_TILT = 5; // degrees — keep subtle. Above ~8 it reads as a gimmick.

  if (!reduceMotion && finePointer) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var raf = null;

      function apply(e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = el.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width  - 0.5; // -0.5 .. 0.5
          var y = (e.clientY - r.top)  / r.height - 0.5;
          el.style.setProperty('--tiltY', (x * MAX_TILT).toFixed(2) + 'deg');
          el.style.setProperty('--tiltX', (-y * MAX_TILT).toFixed(2) + 'deg');
        });
      }

      function reset() {
        el.style.setProperty('--tiltX', '0deg');
        el.style.setProperty('--tiltY', '0deg');
      }

      el.addEventListener('pointermove', apply);
      el.addEventListener('pointerleave', reset);
    });
  }

  /* ---------- 3. Ambient orb parallax ----------
     Orbs drift against the scroll to create atmospheric depth.
     data-depth on each orb controls how far it moves. */
  var orbs = Array.prototype.slice.call(document.querySelectorAll('.orb'));
  if (!reduceMotion && orbs.length) {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.scrollY;
        orbs.forEach(function (orb) {
          var d = parseFloat(orb.dataset.depth || '0.03');
          orb.style.setProperty('--py', (-y * d).toFixed(1) + 'px');
        });
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 4. Scroll reveal ---------- */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // Small stagger so siblings cascade instead of popping together
        setTimeout(function () { entry.target.classList.add('is-visible'); }, i * 70);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Sticky header state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var toggleStuck = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', toggleStuck, { passive: true });
    toggleStuck();
  }

  /* ---------- 6. Contact form ----------
     Posts JSON to the Cloudflare Pages Function at
     functions/api/contact.js. Falls back to a normal form POST
     if JavaScript fails, because the form has a real action. */
  var form   = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous validation state
      form.querySelectorAll('[aria-invalid]').forEach(function (el) {
        el.removeAttribute('aria-invalid');
      });

      var data = Object.fromEntries(new FormData(form).entries());

      // Client-side validation (the Function re-validates server-side)
      var problems = [];
      if (!data.name || !data.name.trim())       problems.push('name');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email || '')) problems.push('email');
      if (!data.message || data.message.trim().length < 10) problems.push('message');

      if (problems.length) {
        problems.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.setAttribute('aria-invalid', 'true');
        });
        document.getElementById(problems[0]).focus();
        setStatus('Please fill in your name, a valid email, and a few words about the project.', 'is-error');
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      setStatus('Sending…', '');

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (b) { return { ok: res.ok, body: b }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error(r.body.error || 'Something went wrong.');
          form.reset();
          setStatus("Got it. I'll reply within one business day.", 'is-ok');
        })
        .catch(function (err) {
          setStatus(err.message + ' You can also email jbthepm@gmail.com directly.', 'is-error');
        })
        .finally(function () { button.disabled = false; });
    });
  }

  function setStatus(msg, cls) {
    status.textContent = msg;
    status.className = 'form__status ' + (cls || '');
  }

  /* ---------- 7. Slide-in menu (mobile) ----------
     The sheet is a modal: it locks the page behind it, keeps Tab inside
     itself, and closes on Escape, backdrop click, or any link tap. */
  var menuToggle = document.querySelector(".menu-toggle");
  var sheet      = document.getElementById("mobile-menu");
  var backdrop   = document.querySelector(".sheet-backdrop");

  if (menuToggle && sheet && backdrop) {
    var openMenu = function () {
      backdrop.hidden = false;
      void backdrop.offsetWidth;          /* reflow so the fade actually runs */
      sheet.classList.add("is-open");
      backdrop.classList.add("is-open");
      sheet.setAttribute("aria-hidden", "false");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      var close = sheet.querySelector(".sheet__close");
      if (close) close.focus();
    };

    /* restoreFocus is false when a link closed the menu — sending focus back
       to the button would fight the anchor jump. */
    var closeMenu = function (restoreFocus) {
      sheet.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      sheet.setAttribute("aria-hidden", "true");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      window.setTimeout(function () {
        if (!sheet.classList.contains("is-open")) backdrop.hidden = true;
      }, 340);
      if (restoreFocus !== false) menuToggle.focus();
    };

    menuToggle.addEventListener("click", openMenu);

    Array.prototype.forEach.call(document.querySelectorAll("[data-menu-close]"), function (el) {
      el.addEventListener("click", function () { closeMenu(true); });
    });

    Array.prototype.forEach.call(sheet.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (!sheet.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeMenu(true); return; }
      if (e.key !== "Tab") return;
      var items = sheet.querySelectorAll("button, a[href]");
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 8. Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
