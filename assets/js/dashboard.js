/* ==========================================================
   LUMEN STUDIO - dashboard.js
   Client dashboard (front-end only, mock data).
   TODO: replace MOCK data with real API calls to your backend.
   ========================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- MOCK DATA (TODO: replace with server data) ----
  const MOCK = {
    user: { name: 'Alex Morgan', email: 'alex@example.com' },
    bookings: [
      { id: 'B-1042', type: 'Family Session', date: '2026-12-14', time: '10:00', status: 'confirmed', upcoming: true },
      { id: 'B-0988', type: 'Maternity Session', date: '2026-10-02', time: '16:30', status: 'completed', upcoming: false },
      { id: 'B-0911', type: 'Portrait Session', date: '2026-08-19', time: '11:00', status: 'completed', upcoming: false }
    ],
    galleries: [
      { id: 'G-1', title: 'Maternity Session - 2 Oct 2026', limit: 20, photos: 24, seed: 'mat' },
      { id: 'G-2', title: 'Portrait Session - 19 Aug 2026', limit: 10, photos: 16, seed: 'por' }
    ],
    orders: [
      { id: 'O-3301', date: '2026-10-20', items: '2 prints, 1 canvas', total: 184, status: 'delivered' },
      { id: 'O-3377', date: '2026-11-08', items: 'Album (20 pages)', total: 220, status: 'shipped' },
      { id: 'O-3402', date: '2026-11-18', items: '4 prints', total: 64, status: 'processing' }
    ],
    messages: [{ from: 'studio', text: 'Hi Alex! Your proofs are ready. Pick your favourites whenever you like.' }]
  };
  const PRICES = { print: { '5x7': 12, '8x10': 20, '11x14': 35 }, canvas: { '8x10': 60, '11x14': 95, '16x20': 140 }, album: { '8x10': 180, '11x14': 260, '16x20': 340 } };

  const state = { favs: JSON.parse(localStorage.getItem('favs') || '{}'), cart: [], activeGallery: 'G-1' };
  const save = () => localStorage.setItem('favs', JSON.stringify(state.favs));
  const fmt = d => new Date(d + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  // Proof photos: real studio images, each frame cropped a little differently
  const PROOF = {
    mat: ['1538678867871-8a43e7487746', '1763106377335-578cf40ce82e', '1457342813143-a1ae27448a82'],
    por: ['1688681637923-ecd02b7ce81b', '1649688132557-a80cc2d3d99d', '1671365205045-b9deb2602c51', '1649688132879-f3a14f580507']
  };
  const photoUrl = (g, i, w = 400) => {
    const pool = PROOF[g.seed] || PROOF.por, id = pool[i % pool.length], r = Math.floor(i / pool.length);
    const crop = `&crop=focalpoint&fp-x=${[.5, .35, .65, .45, .6][r % 5]}&fp-y=${[.45, .35, .55, .6, .4][r % 5]}&fp-z=${[1, 1.3, 1.6, 1.2, 1.5][r % 5]}`;
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${w}&q=70${crop}`;
  };
  const gal = id => MOCK.galleries.find(g => g.id === id);

  /** Switch between dashboard sections */
  function show(name) {
    $$('.dash-panel').forEach(p => p.classList.toggle('active', p.id === 'p-' + name));
    $$('.nav-item-d[data-panel]').forEach(b => { b.classList.toggle('active', b.dataset.panel === name); b.toggleAttribute('aria-current', b.dataset.panel === name); });
    $('#dash-side').classList.remove('open');
    history.replaceState(null, '', '#' + name);
    const h = $('#p-' + name + ' h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }

  const totalFavs = () => Object.values(state.favs).reduce((a, l) => a + l.length, 0);

  /** Overview: stats, next session, latest gallery, recent orders */
  function renderOverview() {
    const next = MOCK.bookings.find(b => b.upcoming);
    if (next) {
      const d = new Date(next.date + 'T00:00');
      const days = Math.max(0, Math.round((d - new Date().setHours(0, 0, 0, 0)) / 864e5));
      $('#next-session').innerHTML = `<div class="next-session">
        <div class="date-tile" aria-hidden="true"><small>${d.toLocaleDateString(undefined, { month: 'short' })}</small><b>${d.getDate()}</b></div>
        <div class="next-info"><h3>${next.type}</h3>
          <p><i class="bi bi-clock"></i> ${d.toLocaleDateString(undefined, { weekday: 'long' })} at ${next.time}</p>
          <div class="next-meta"><span class="badge-status status-${next.status}">${next.status}</span><span class="next-count">${days > 0 ? 'In ' + days + (days === 1 ? ' day' : ' days') : 'Today'}</span></div></div>
        <button class="btn btn-outline-primary btn-sm" data-panel="bookings">Manage</button></div>`;
    } else {
      $('#next-session').innerHTML = `<div class="empty"><i class="bi bi-calendar-plus"></i>No upcoming session yet.<br><a href="booking.html" class="btn btn-accent mt-3">Book a session</a></div>`;
    }
    $('#stat-sessions').textContent = MOCK.bookings.length;
    $('#stat-galleries').textContent = MOCK.galleries.length;
    $('#stat-favs').textContent = totalFavs();
    $('#stat-orders').textContent = MOCK.orders.length;
    $('#nav-name').textContent = MOCK.user.name.split(' ')[0];

    const g = MOCK.galleries[0];
    if (g) {
      const n = (state.favs[g.id] || []).length, pct = Math.min(100, Math.round(n / g.limit * 100));
      $('#latest-gallery').innerHTML = `<div class="latest-gallery">
        <img loading="lazy" src="${photoUrl(g, 1, 360)}" alt="Cover photo for ${g.title}">
        <div><h3>${g.title}</h3><p>${g.photos} photos ready to review</p>
          <div class="dash-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${g.limit}" aria-valuenow="${n}" aria-label="Favourites picked"><span style="width:${pct}%"></span></div>
          <small>${n} of ${g.limit} favourites picked</small>
          <div><button class="btn btn-primary btn-sm mt-3" data-open="${g.id}" data-panel="galleries">Choose favourites</button></div></div></div>`;
    }
    $('#recent-orders').innerHTML = MOCK.orders.slice().reverse().map(o => `<li><span class="ro-ico"><i class="bi bi-box-seam"></i></span><span class="ro-text"><strong>${o.items}</strong><small>${o.id} &middot; ${fmt(o.date)}</small></span><span class="badge-status status-${o.status}">${o.status}</span></li>`).join('');

    const h = new Date().getHours();
    $('#dash-greet').textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    $('#dash-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  }

  /** My Bookings */
  function renderBookings() {
    const rows = MOCK.bookings.map(b => `<tr><td data-label="Session">${b.type}</td><td data-label="Date">${fmt(b.date)} ${b.time}</td><td data-label="Status"><span class="badge-status status-${b.status}">${b.status}</span></td>
      <td data-label="Actions">${b.upcoming ? `<button class="btn btn-sm btn-outline-primary me-1" data-resched="${b.id}">Reschedule</button><button class="btn btn-sm btn-outline-primary" data-cancel="${b.id}">Cancel</button>` : '<span class="text-muted">-</span>'}</td></tr>`).join('');
    $('#bookings-body').innerHTML = rows || '<tr><td colspan="4"><div class="empty"><i class="bi bi-calendar"></i>No bookings yet.</div></td></tr>';
  }

  /** Proof galleries + favourites counter */
  function renderGalleries() {
    $('#gallery-list').innerHTML = MOCK.galleries.map(g => {
      const n = (state.favs[g.id] || []).length;
      return `<div class="col-md-6"><div class="card-studio"><img loading="lazy" src="${photoUrl(g, 1, 600)}" alt="Cover photo for ${g.title}"><div class="card-body"><h3 class="h5">${g.title}</h3><p class="text-muted mb-3">${g.photos} photos &middot; ${n} of ${g.limit} favourites picked</p><button class="btn btn-primary" data-open="${g.id}">Open gallery</button></div></div></div>`;
    }).join('');
  }

  function openGallery(id) {
    state.activeGallery = id; const g = gal(id);
    $('#gallery-view').hidden = false; $('#gallery-list').hidden = true;
    $('#gv-title').textContent = g.title;
    $('#gv-grid').innerHTML = Array.from({ length: g.photos }, (_, i) => {
      const on = (state.favs[id] || []).includes(i);
      return `<div class="proof" data-lightbox><img loading="lazy" src="${photoUrl(g, i)}" data-full="${photoUrl(g, i, 1400)}" alt="Proof photo ${i + 1}"><button class="heart ${on ? 'on' : ''}" data-fav="${i}" aria-pressed="${on}" aria-label="${on ? 'Remove photo ' + (i + 1) + ' from favourites' : 'Add photo ' + (i + 1) + ' to favourites'}"><i class="bi bi-heart${on ? '-fill' : ''}"></i></button></div>`;
    }).join('');
    counter();
  }

  function counter() {
    const g = gal(state.activeGallery), n = (state.favs[g.id] || []).length;
    $('#fav-counter').textContent = `${n} of ${g.limit} selected`;
  }

  function toggleFav(i) {
    const id = state.activeGallery, g = gal(id), list = state.favs[id] = state.favs[id] || [];
    const at = list.indexOf(i);
    if (at > -1) list.splice(at, 1);
    else if (list.length >= g.limit) { window.toast(`You can pick up to ${g.limit} photos in this gallery. Remove one to add another.`); return; }
    else list.push(i);
    save(); openGallery(id); renderOverview(); renderFavorites();
  }

  /** Favourites page */
  function renderFavorites() {
    const html = MOCK.galleries.flatMap(g => (state.favs[g.id] || []).map(i => `<div class="proof" data-lightbox><img loading="lazy" src="${photoUrl(g, i)}" data-full="${photoUrl(g, i, 1400)}" alt="Favourite photo ${i + 1} from ${g.title}"><button class="heart on" data-unfav="${g.id}:${i}" aria-label="Remove from favourites"><i class="bi bi-x-lg"></i></button></div>`)).join('');
    $('#fav-grid').innerHTML = html || '<div class="empty" style="grid-column:1/-1"><i class="bi bi-heart"></i>No favourites yet. Open a gallery and tap the heart on photos you love.</div>';
    // photo picker for orders
    const opts = MOCK.galleries.flatMap(g => (state.favs[g.id] || []).map(i => `<option value="${g.id}:${i}">${g.title.split(' - ')[0]} - photo ${i + 1}</option>`)).join('');
    $('#o-photo').innerHTML = opts || '<option value="">Pick favourites first</option>';
  }

  /** Orders: cart + history */
  function renderCart() {
    const total = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
    $('#cart-list').innerHTML = state.cart.length
      ? state.cart.map((c, i) => `<li class="d-flex justify-content-between align-items-center py-2 border-bottom"><span>${c.qty} x ${c.product} ${c.size} <small class="text-muted d-block">${c.photo}</small></span><span>$${c.price * c.qty} <button class="btn btn-sm" data-rm="${i}" aria-label="Remove item"><i class="bi bi-trash"></i></button></span></li>`).join('')
      : '<li class="empty">Your cart is empty. Choose a photo, size and quantity, then press "Add to cart".</li>';
    $('#cart-total').textContent = '$' + total;
    $('#checkout').disabled = !state.cart.length;
  }
  function renderOrders() {
    $('#orders-body').innerHTML = MOCK.orders.map(o => `<tr><td data-label="Order">${o.id}</td><td data-label="Date">${fmt(o.date)}</td><td data-label="Items">${o.items}</td><td data-label="Total">$${o.total}</td><td data-label="Status"><span class="badge-status status-${o.status}">${o.status}</span></td></tr>`).join('');
  }
  function updateSizes() {
    const p = $('#o-product').value;
    $('#o-size').innerHTML = Object.entries(PRICES[p]).map(([s, pr]) => `<option value="${s}">${s} in - $${pr}</option>`).join('');
  }

  /** Messages */
  function renderMessages() {
    $('#chat').innerHTML = MOCK.messages.map(m => `<div class="d-flex ${m.from === 'me' ? 'justify-content-end' : ''} mb-2"><div class="bubble ${m.from === 'me' ? 'me' : ''}">${m.text.replace(/</g, '&lt;')}</div></div>`).join('');
    $('#chat').scrollTop = 1e6;
  }

  function init() {
    if (!$('#dash-side')) return;
    // skeleton -> content
    setTimeout(() => { $$('.skeleton-wrap').forEach(s => s.remove()); $('#dash-content').hidden = false; }, 700);
    renderOverview(); renderBookings(); renderGalleries(); renderFavorites(); renderOrders(); updateSizes(); renderCart(); renderMessages();

    document.addEventListener('click', e => {
      const t = e.target;
      const nav = t.closest('[data-panel]'); if (nav) { e.preventDefault(); show(nav.dataset.panel); }
      const op = t.closest('[data-open]'); if (op) openGallery(op.dataset.open);
      if (t.closest('#gv-back')) { $('#gallery-view').hidden = true; $('#gallery-list').hidden = false; renderGalleries(); }
      const fav = t.closest('[data-fav]'); if (fav) { e.stopPropagation(); toggleFav(+fav.dataset.fav); }
      const un = t.closest('[data-unfav]'); if (un) { e.stopPropagation(); const [g, i] = un.dataset.unfav.split(':'); state.favs[g] = (state.favs[g] || []).filter(x => x !== +i); save(); renderFavorites(); renderOverview(); renderGalleries(); }
      if (t.closest('#submit-favs')) window.toast('Selections sent to your photographer. Thank you!');
      const rs = t.closest('[data-resched]'); if (rs) window.toast('Reschedule request sent. We will confirm by email.');
      const cn = t.closest('[data-cancel]'); if (cn && confirm('Cancel this session?')) { const b = MOCK.bookings.find(x => x.id === cn.dataset.cancel); b.upcoming = false; b.status = 'completed'; MOCK.bookings = MOCK.bookings.filter(x => x !== b); renderBookings(); renderOverview(); window.toast('Session cancelled.'); }
      const rm = t.closest('[data-rm]'); if (rm) { state.cart.splice(+rm.dataset.rm, 1); renderCart(); }
      if (t.closest('#side-toggle')) $('#dash-side').classList.toggle('open');
      if (t.closest('#logout')) { location.href = 'login.html'; }
      if (t.closest('#checkout')) { /* TODO: Stripe / PayPal checkout goes here */ window.toast('Demo only: payment buttons are placeholders.'); }
    });
    $('#o-product').addEventListener('change', updateSizes);
    $('#add-cart').addEventListener('click', () => {
      const photo = $('#o-photo').value; if (!photo) { window.toast('Please pick favourites first, then choose a photo to print.'); return; }
      const product = $('#o-product').value, size = $('#o-size').value, qty = Math.max(1, +$('#o-qty').value || 1);
      state.cart.push({ photo: $('#o-photo').selectedOptions[0].text, product, size, qty, price: PRICES[product][size] });
      renderCart(); window.toast('Added to your cart.');
    });
    $('#chat-form').addEventListener('submit', e => {
      e.preventDefault(); const v = $('#chat-input').value.trim(); if (!v) return;
      MOCK.messages.push({ from: 'me', text: v }); renderMessages(); $('#chat-input').value = '';
      setTimeout(() => { MOCK.messages.push({ from: 'studio', text: 'Thanks! We will reply within one working day.' }); renderMessages(); }, 1000);
    });
    $('#settings-form').addEventListener('submit', e => { e.preventDefault(); window.toast('Settings saved.'); });
    show(location.hash.replace('#', '') && $('#p-' + location.hash.slice(1)) ? location.hash.slice(1) : 'overview');
  }
  document.addEventListener('DOMContentLoaded', init);
})();
