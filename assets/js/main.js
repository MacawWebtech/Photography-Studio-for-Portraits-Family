/* ==========================================================
   LUMEN STUDIO - main.js
   Shared behaviour for every page.
   Modules: theme, rtl, shared header/footer buttons, reveal, filters,
            lightbox, validation, pricing tabs, booking wizard,
            countdown, skeleton loaders
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /** Theme: saved choice > system preference */
  function initTheme() {
    const saved = localStorage.getItem('theme');
    const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    const dir = localStorage.getItem('dir');
    if (dir) document.documentElement.setAttribute('dir', dir);
  }
  initTheme();

  /** Toggle light/dark and remember it */
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateToggleIcons();
  }

  /** Toggle left-to-right / right-to-left */
  function toggleDir() {
    const next = document.documentElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    document.documentElement.setAttribute('dir', next);
    localStorage.setItem('dir', next);
    updateDirLabels();
  }

  /** The button names the direction you will switch TO */
  function updateDirLabels() {
    const rtl = document.documentElement.getAttribute('dir') === 'rtl';
    $$('[data-action="dir"] .dir-label').forEach(l => { l.textContent = rtl ? 'LTR' : 'RTL'; });
  }

  function updateToggleIcons() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    $$('[data-action="theme"] i').forEach(i => { i.className = dark ? 'bi bi-sun' : 'bi bi-moon-stars'; });
  }

  /** Header and footer are plain HTML in every page; wire up their buttons here */
  function initChrome() {
    $$('[data-action="theme"]').forEach(b => b.addEventListener('click', toggleTheme));
    $$('[data-action="dir"]').forEach(b => b.addEventListener('click', toggleDir));
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    updateToggleIcons();
    updateDirLabels();
  }

  /** Fade-in on scroll */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: .1 });
    els.forEach(e => io.observe(e));
  }

  /** Category filter: buttons [data-filter] filter items [data-cat] */
  function initFilters() {
    $$('.filter-bar').forEach(bar => {
      const scope = bar.dataset.target ? $(bar.dataset.target) : document;
      bar.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn'); if (!btn) return;
        $$('.filter-btn', bar).forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn); });
        const f = btn.dataset.filter;
        $$('[data-cat]', scope).forEach(it => { it.hidden = !(f === 'all' || it.dataset.cat === f); });
      });
    });
  }

  /** Lightbox for any <button class="item"> or img with data-lightbox */
  function initLightbox() {
    let box = $('#lightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'lightbox'; box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo viewer');
      box.innerHTML = '<button class="lb-close" aria-label="Close photo"><i class="bi bi-x-lg"></i></button><button class="lb-nav lb-prev" aria-label="Previous photo"><i class="bi bi-chevron-left"></i></button><img alt=""><button class="lb-nav lb-next" aria-label="Next photo"><i class="bi bi-chevron-right"></i></button>';
      document.body.appendChild(box);
    }
    const img = $('img', box); let list = [], idx = 0, opener = null;
    const show = i => { idx = (i + list.length) % list.length; img.src = list[idx].dataset.full || list[idx].src; img.alt = list[idx].alt; };
    const close = () => { box.classList.remove('open'); if (opener) opener.focus(); };
    document.addEventListener('click', e => {
      if (e.target.closest('button.heart')) return;
      const t = e.target.closest('[data-lightbox]'); if (!t) return;
      const img0 = t.tagName === 'IMG' ? t : $('img', t); if (!img0) return;
      const group = t.closest('[data-lightbox-group]') || document;
      list = $$('[data-lightbox] img, img[data-lightbox]', group).filter(i => !i.closest('[hidden]'));
      idx = list.indexOf(img0); opener = t; show(idx); box.classList.add('open'); $('.lb-close', box).focus();
    });
    box.addEventListener('click', e => {
      if (e.target === box || e.target.closest('.lb-close')) close();
      else if (e.target.closest('.lb-prev')) show(idx - 1);
      else if (e.target.closest('.lb-next')) show(idx + 1);
    });
    document.addEventListener('keydown', e => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /** Client-side validation for every <form data-validate> */
  function initForms() {
    $$('form[data-validate]').forEach(form => {
      form.noValidate = true;
      const check = el => {
        let msg = '';
        const v = el.value.trim();
        if (el.required && !v) msg = el.dataset.msg || 'This field is required.';
        else if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Please enter a valid email, like name@example.com.';
        else if (el.type === 'tel' && v && !/^[+\d][\d\s()-]{6,}$/.test(v)) msg = 'Please enter a valid phone number.';
        else if (el.type === 'password' && el.dataset.strength && v && !(v.length >= 8 && /\d/.test(v) && /[A-Za-z]/.test(v))) msg = 'Use at least 8 characters with letters and numbers.';
        else if (el.type === 'date' && el.dataset.future && v && new Date(v) <= new Date(new Date().toDateString())) msg = 'Please choose a date in the future.';
        else if (el.dataset.match && v !== $(el.dataset.match).value) msg = 'Passwords do not match.';
        else if (el.type === 'checkbox' && el.required && !el.checked) msg = 'Please tick this box to continue.';
        el.classList.toggle('is-invalid', !!msg);
        el.classList.toggle('is-valid', !msg && !!v);
        let fb = el.parentElement.querySelector('.invalid-feedback');
        if (!fb) { fb = document.createElement('div'); fb.className = 'invalid-feedback'; fb.id = el.id + '-err'; el.insertAdjacentElement('afterend', fb); }
        fb.textContent = msg; el.setAttribute('aria-invalid', !!msg); if (msg) el.setAttribute('aria-describedby', fb.id);
        return !msg;
      };
      form.addEventListener('blur', e => { if (e.target.matches('input,select,textarea')) check(e.target); }, true);
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fields = $$('input,select,textarea', form).filter(f => f.offsetParent !== null || f.type === 'hidden');
        const bad = fields.filter(f => !check(f));
        if (bad.length) { bad[0].focus(); return; }
        // TODO: connect to Formspree / Netlify Forms / Mailchimp by setting form action and calling form.submit()
        if (form.dataset.redirect) { location.href = form.dataset.redirect; return; }
        const ok = $('.form-success', form.parentElement) || $('.form-success');
        if (ok) { ok.hidden = false; ok.focus && ok.focus(); }
        form.reset(); $$('.is-valid', form).forEach(f => f.classList.remove('is-valid'));
        window.toast && window.toast(form.dataset.success || 'Thank you! We got your message.');
      });
    });
    // show/hide password
    $$('[data-toggle-pass]').forEach(btn => btn.addEventListener('click', () => {
      const input = $(btn.dataset.togglePass); const show = input.type === 'password';
      input.type = show ? 'text' : 'password'; btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      $('i', btn).className = show ? 'bi bi-eye-slash' : 'bi bi-eye';
    }));
  }

  /** Small message at the bottom of the screen */
  window.toast = msg => {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast-note'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3500);
  };

  /** Packages page: swap prices by session type */
  function initPricing() {
    const tabs = $$('[data-session]'); if (!tabs.length) return;
    const prices = { portrait: [149, 299, 499], family: [199, 379, 599], maternity: [179, 349, 549] };
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t); });
      $$('[data-price]').forEach((el, i) => { el.textContent = '$' + prices[t.dataset.session][i]; });
    }));
  }

  /** Booking wizard: 5 steps with validation */
  function initBooking() {
    const wiz = $('#booking-wizard'); if (!wiz) return;
    const steps = $$('.wiz-step', wiz), ps = $$('.progress-steps .ps'); let cur = 0;
    const go = n => {
      cur = n; steps.forEach((s, i) => s.hidden = i !== n);
      ps.forEach((p, i) => { p.classList.toggle('active', i === n); p.classList.toggle('done', i < n); });
      $('#wiz-title').focus(); summary();
    };
    const val = name => { const c = $(`input[name="${name}"]:checked`, wiz); return c ? c.dataset.label || c.value : ''; };
    const summary = () => {
      $('#sum-type').textContent = val('type') || 'Not chosen yet';
      $('#sum-pack').textContent = val('pack') || 'Not chosen yet';
      $('#sum-when').textContent = ($('#b-date').value && $('#b-time').value) ? `${$('#b-date').value} at ${$('#b-time').value}` : 'Not chosen yet';
    };
    wiz.addEventListener('change', summary);
    wiz.addEventListener('click', e => {
      const next = e.target.closest('[data-next]'), prev = e.target.closest('[data-prev]');
      if (prev) go(cur - 1);
      if (next) {
        const step = steps[cur]; let ok = true;
        const err = $('.step-error', step);
        if (cur === 0 && !val('type')) { ok = false; err.textContent = 'Please pick a session type to continue.'; }
        if (cur === 1 && !val('pack')) { ok = false; err.textContent = 'Please pick a package to continue.'; }
        if (cur === 2) {
          const d = $('#b-date').value;
          if (!d || new Date(d) <= new Date(new Date().toDateString())) { ok = false; err.textContent = 'Please choose a date in the future.'; }
          else if (!$('#b-time').value) { ok = false; err.textContent = 'Please choose a time.'; }
        }
        if (cur === 3) {
          const f = $('#details-form'); const req = $$('[required]', f);
          req.forEach(x => x.dispatchEvent(new Event('blur')));
          ok = !req.some(x => x.classList.contains('is-invalid') || !x.value.trim());
          if (!ok) err.textContent = 'Please fill in the highlighted fields.';
        }
        if (!ok) { err.hidden = false; return; }
        if (err) err.hidden = true;
        go(cur + 1);
      }
    });
    // TODO: connect a real calendar (Calendly / Cal.com / Google Calendar) at #calendar-placeholder
    const d = $('#b-date'); if (d) d.min = new Date(Date.now() + 864e5).toISOString().split('T')[0];
    const q = new URLSearchParams(location.search).get('type');
    if (q) { const r = $(`input[name="type"][value="${q}"]`); if (r) r.checked = true; }
    go(0);
  }

  /** Coming soon countdown */
  function initCountdown() {
    const c = $('#countdown'); if (!c) return;
    // TODO: set the launch date
    const end = new Date(c.dataset.date || Date.now() + 30 * 864e5).getTime();
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const parts = { days: Math.floor(s / 86400), hours: Math.floor(s % 86400 / 3600), minutes: Math.floor(s % 3600 / 60), seconds: s % 60 };
      Object.entries(parts).forEach(([k, v]) => { const el = $(`[data-unit="${k}"]`, c); if (el) el.textContent = String(v).padStart(2, '0'); });
    };
    tick(); setInterval(tick, 1000);
  }

  /** "Load more" with skeletons on the portfolio page */
  function initLoadMore() {
    const btn = $('#load-more'); if (!btn) return;
    const grid = $('#portfolio-grid');
    const cats = [['portraits', 'Portraits'], ['family', 'Family'], ['maternity', 'Maternity']];
    const POOL = { portraits: ['1688681637923-ecd02b7ce81b', '1649688132557-a80cc2d3d99d', '1671365205045-b9deb2602c51', '1649688132879-f3a14f580507'], family: ['1761839258657-457dda39b5cc', '1588979355313-6711a095465f', '1624272864537-8ecc72b67958', '1770871821382-60ea99b0a941'], maternity: ['1538678867871-8a43e7487746', '1763106377335-578cf40ce82e', '1457342813143-a1ae27448a82'] };
    const unsplash = (id, w, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? '&h=' + h : ''}&q=70`;
    let n = 0;
    btn.addEventListener('click', () => {
      btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Loading...';
      const sk = document.createElement('div'); sk.className = 'skeleton mb-3'; sk.style.height = '260px'; sk.setAttribute('aria-hidden', 'true');
      grid.appendChild(sk);
      setTimeout(() => {
        sk.remove();
        for (let i = 0; i < 6; i++) {
          const [c, label] = cats[(n + i) % 3]; const id = POOL[c][Math.floor((n + i) / 3) % POOL[c].length];
          const b = document.createElement('button'); b.className = 'item'; b.dataset.cat = c; b.dataset.lightbox = '';
          b.innerHTML = `<img loading="lazy" src="${unsplash(id, 800, 700)}" data-full="${unsplash(id, 1600)}" alt="${label} photo ${n + i + 1}"><span class="tag">${label}</span>`;
          grid.appendChild(b);
        }
        n += 6; btn.disabled = false; btn.textContent = 'Load more'; if (n >= 12) btn.hidden = true;
      }, 900);
    });
  }


  /** Count-up numbers: <span data-count="1200" data-suffix="+"> */
  function initCounters() {
    const els = $$('[data-count]'); if (!els.length) return;
    const run = el => {
      const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, suf = el.dataset.suffix || '';
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = end.toFixed(dec) + suf; return; }
      const t0 = performance.now(), dur = 1600;
      const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = (end * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .4 });
    els.forEach(e => io.observe(e));
  }

  /** Before / after slider: .compare > input[type=range] */
  function initCompare() {
    $$('.compare').forEach(c => {
      const r = $('input[type="range"]', c);
      const set = () => c.style.setProperty('--pos', r.value + '%');
      r.addEventListener('input', set); set();
    });
  }

  /** Services list on Home 2: hover/focus swaps the preview photo */
  function initServiceList() {
    const rows = $$('.svc-row'); const img = $('#svc-img'), cap = $('#svc-cap'); if (!rows.length || !img) return;
    const pick = row => {
      rows.forEach(r => r.classList.toggle('active', r === row));
      if (img.getAttribute('src') !== row.dataset.img) { img.style.opacity = 0; setTimeout(() => { img.src = row.dataset.img; img.alt = row.dataset.alt || ''; img.style.opacity = 1; }, 150); }
      if (cap) cap.textContent = row.dataset.cap || '';
    };
    rows.forEach(r => { ['mouseenter', 'focus'].forEach(ev => r.addEventListener(ev, () => pick(r))); });
  }

  /** Keep the mobile menu toggle icon and accessible label in sync. */
  function initMobileNavState() {
    const nav = $('#mainNav');
    const toggle = $('[data-bs-target="#mainNav"]');
    if (!nav || !toggle) return;
    const icon = $('i', toggle);
    nav.addEventListener('show.bs.collapse', () => {
      toggle.setAttribute('aria-label', 'Close menu');
      if (icon) icon.className = 'bi bi-x-lg';
    });
    nav.addEventListener('hide.bs.collapse', () => {
      toggle.setAttribute('aria-label', 'Open menu');
      if (icon) icon.className = 'bi bi-list';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initChrome(); initReveal(); initFilters(); initLightbox(); initForms();
    initPricing(); initBooking(); initCountdown(); initLoadMore();
    initCounters(); initCompare(); initServiceList(); initMobileNavState();
  });
})();
