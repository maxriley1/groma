'use strict';
(() => {
  const STATUS = {
    Live: { label: 'BOARDING', color: '#3ddc84' },
    Pending: { label: 'PENDING', color: '#ffc84a' },
    Beta: { label: 'ON TIME', color: '#ffc84a' },
    Building: { label: 'SCHEDULED', color: '#9aa0ad' },
  };
  const FILTERS = { ALL: null, BOARDING: 'Live', PENDING: 'Pending', 'ON TIME': 'Beta', SCHEDULED: 'Building' };
  const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // Catalogue values are data: only hex colours, two-colour gradients and http(s) links get through.
  const safeColor = (v, fallback = '#ffffff') => typeof v === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback;
  const safeBackground = v => typeof v === 'string' && /^linear-gradient\(\s*-?\d+(?:\.\d+)?deg\s*,\s*#[0-9a-f]{6}\s*,\s*#[0-9a-f]{6}\s*\)$/i.test(v) ? v : safeColor(v, '#11131b');
  const safeLink = (v, host = null) => {
    if (typeof v !== 'string' || !v || /[\u0000- \u007f]/.test(v)) return null;
    if (v.startsWith('#') && !host) return v;
    try {
      const u = new URL(v, document.baseURI);
      if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
      if (host && (u.protocol !== 'https:' || u.hostname !== host || u.port)) return null;
      return u.href;
    } catch { return null; }
  };
  const safeImage = v => typeof v === 'string' && /^img\/[\w.-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(v) ? v : null;
  const safeStore = (s, host) => {
    if (!s || typeof s !== 'object') return null;
    if (s.state === 'live') { const url = safeLink(s.url, host); return url ? { state: 'live', url } : null; }
    return { state: 'pending', note: String(s.note || 'Coming soon') };
  };

  const apps = (window.APPS || []).map((a, i) => ({
    id: String(a.id), name: String(a.name), code: String(a.code).toUpperCase().slice(0, 3),
    dest: String(a.dest || ''), tagline: String(a.tagline || ''), version: String(a.version || ''),
    status: STATUS[a.status] ? a.status : 'Building',
    url: safeLink(a.url), cta: a.cta ? String(a.cta) : null,
    ios: safeStore(a.ios, 'apps.apple.com'), android: safeStore(a.android, 'play.google.com'),
    bg: safeBackground(a.bg), ink: safeColor(a.ink), art: safeImage(a.art), artIcon: a.artFit === 'icon', shot: safeImage(a.shot),
    gate: String(i + 1).padStart(2, '0'),
  }));
  const st = a => STATUS[a.status];
  const inStore = a => (a.ios && a.ios.state === 'live') || (a.android && a.android.state === 'live');
  const storePending = a => (a.ios && a.ios.state === 'pending') || (a.android && a.android.state === 'pending');
  const storeCode = a => a.ios && a.android ? 'IOS+AND' : a.ios ? 'IOS' : a.android ? 'ANDROID' : 'WEB';
  const ctaLabel = a => a.cta || (a.status === 'Building' ? 'TRACK THE BUILD' : 'BOARD NOW');

  const state = { filter: 'ALL', query: '', sel: apps[0] && apps[0].id, top: 0 };
  const matches = a => { const q = state.query.trim().toLowerCase(); return !q || (a.name + a.tagline + a.dest).toLowerCase().includes(q); };

  // Contact
  const email = window.SITE && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(window.SITE.contactEmail || '') ? window.SITE.contactEmail : null;
  document.querySelectorAll('[data-contact]').forEach(a => { if (email) { if (a.id === 'contact-link') a.href = 'mailto:' + email; } else a.hidden = true; });

  // Clock
  const clock = $('clock');
  const tick = () => { const n = new Date(), p = v => String(v).padStart(2, '0'); clock.textContent = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`; };
  tick(); setInterval(tick, 1000);

  // Hero copy
  const live = apps.filter(a => a.status === 'Live').length;
  const pending = apps.filter(a => a.status === 'Pending').length;
  const stores = apps.filter(inStore).length;
  $('eyebrow-lead').textContent = live ? `${live} BOARDING` : `${pending} CHECKING IN`;
  $('eyebrow-rest').textContent = `· ${apps.length} ${apps.length === 1 ? 'APP' : 'APPS'} · ${stores ? stores + ' IN STORES' : 'IOS + ANDROID PENDING'}`;
  $('lede').textContent = stores
    ? 'Live apps are boarding now. Some are already on the App Store and Google Play, the rest are still being built.'
    : 'Jelly Drop is checking in for the App Store and Google Play. Play it in your browser while it waits at the gate.';

  // Ticket stack: real apps first, then "next flight" tickets so there's always a stack to shuffle.
  const stackEl = $('stack');
  const featured = apps.filter(a => a.status !== 'Building');
  while (featured.length < 3) featured.push({ placeholder: true, gate: '--', code: 'TBA', name: 'Next flight', tagline: 'Being scheduled', bg: 'linear-gradient(150deg,#4b5266,#1d212d)', ink: '#ffffff' });
  const tickets = featured.map(a => {
    const t = el('div', 'ticket');
    t.style.background = a.bg; t.style.color = a.ink;
    const main = el('div', 'ticket-main');
    const top = el('div', 'ticket-top'); top.append(el('span', null, 'BOARDING PASS'), el('span', null, 'GATE ' + a.gate));
    const route = el('div', 'ticket-route'); route.append(el('span', null, 'IDEA'), el('i'), el('span', null, a.code));
    const name = el('div'); name.append(el('div', 'ticket-name', a.name), el('div', 'ticket-tagline', a.tagline));
    main.append(top, route, name);
    const stub = el('div', 'ticket-stub'); stub.append(el('span', null, a.placeholder ? 'SCHEDULED' : st(a).label));
    t.append(main, stub);
    stackEl.insertBefore(t, stackEl.lastElementChild);
    return t;
  });
  const layoutStack = () => {
    const n = tickets.length, top = state.top % n;
    tickets.forEach((t, i) => {
      const d = (i - top + n) % n;
      t.style.transform = `translate(${d * 22}px, ${d * -26}px) rotate(${d * 3}deg) scale(${1 - d * 0.05})`;
      t.style.zIndex = 10 - d; t.style.opacity = d > 2 ? 0 : 1;
    });
  };
  const shuffle = () => { state.top++; layoutStack(); };
  stackEl.addEventListener('click', shuffle);
  stackEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shuffle(); } });
  layoutStack();
  if (!reducedMotion) setInterval(() => { if (!document.hidden) shuffle(); }, 3500);

  // Departure board with split-flap characters.
  const rowsEl = $('rows');
  let flaps = [], flapTimer;
  const pad = (s, n) => (s.toUpperCase() + ' '.repeat(n)).slice(0, n);
  const renderBoard = () => {
    const status = FILTERS[state.filter];
    const list = apps.filter(a => (!status || a.status === status) && matches(a));
    rowsEl.replaceChildren(); flaps = [];
    list.forEach((a, r) => {
      const row = el('button', 'row'); row.type = 'button';
      row.setAttribute('aria-label', `${a.name}, ${st(a).label}`);
      row.setAttribute('aria-current', String(a.id === state.sel));
      row.addEventListener('click', () => select(a.id, true));
      let k = 0;
      const storeColor = inStore(a) ? '#7fb8ff' : storePending(a) ? '#ffc84a' : '#6b7180';
      [[a.gate, 2, '#f4f5f7'], [a.name, 10, '#f4f5f7'], [storeCode(a), 7, storeColor], [a.dest, 10, '#f4f5f7'], [a.version, 4, '#9aa0ad'], [st(a).label, 9, st(a).color]].forEach(([txt, n, color]) => {
        const cell = el('div', 'cell'); cell.setAttribute('aria-hidden', 'true');
        for (const ch of pad(txt, n)) {
          const f = el('span', 'flap', ch); f.style.color = color; cell.append(f);
          const settle = 200 + r * 140 + (k++) * 22;
          flaps.push({ f, ch, settle: ch === ' ' ? settle - 200 : settle });
        }
        row.append(cell);
      });
      rowsEl.append(row);
    });
    $('board-empty').hidden = list.length > 0;
    animateFlaps();
  };
  const animateFlaps = () => {
    clearInterval(flapTimer);
    if (reducedMotion) return;
    const start = performance.now();
    const step = () => {
      const t = performance.now() - start;
      let done = true;
      for (const x of flaps) {
        if (t >= x.settle) { if (x.f.textContent !== x.ch) x.f.textContent = x.ch; }
        else { done = false; x.f.textContent = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]; }
      }
      if (done) clearInterval(flapTimer);
    };
    step(); flapTimer = setInterval(step, 45);
  };

  const filtersEl = $('filters');
  Object.keys(FILTERS).forEach(label => {
    const b = el('button', 'filter', label); b.type = 'button';
    b.addEventListener('click', () => { state.filter = label; syncFilters(); renderBoard(); });
    filtersEl.append(b);
  });
  const syncFilters = () => [...filtersEl.children].forEach(b => b.setAttribute('aria-pressed', String(b.textContent === state.filter)));
  syncFilters();

  // Boarding pass
  const storeButton = (s, top, label) => {
    if (s.state === 'live') { const a = el('a', 'store'); a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.append(el('small', null, top), el('b', null, label)); return a; }
    const d = el('div', 'store pending'); d.append(el('small', null, s.note.toUpperCase()), el('b', null, label)); return d;
  };
  const renderPass = () => {
    const a = apps.find(x => x.id === state.sel);
    if (!a) return;
    $('pass-gate').textContent = 'GATE ' + a.gate;
    $('pass-name').textContent = a.name;
    $('pass-tagline').textContent = a.tagline;
    $('pass-version').textContent = a.version ? 'v' + a.version.replace(/^v/i, '') : '—';
    $('pass-status').textContent = st(a).label; $('pass-status').style.color = st(a).color;
    const storesEl = $('pass-stores'); storesEl.replaceChildren();
    if (a.ios) storesEl.append(storeButton(a.ios, 'Download on the', 'App Store'));
    if (a.android) storesEl.append(storeButton(a.android, 'Get it on', 'Google Play'));
    if (!a.ios && !a.android) storesEl.append(el('div', 'web-only', 'WEB ONLY · STORES TBC'));
    const shot = $('pass-shot'); shot.replaceChildren();
    if (a.shot) { const img = el('img'); img.src = a.shot; img.alt = `${a.name} screenshot`; img.loading = 'lazy'; shot.append(img); }
    const stub = $('pass-stub'); stub.style.background = a.bg; stub.style.color = a.ink;
    $('pass-code').textContent = a.code;
    const cta = $('pass-cta'); $('pass-cta-label').textContent = ctaLabel(a);
    if (a.url) { cta.href = a.url; cta.hidden = false; } else cta.hidden = true;
  };
  const select = (id, scroll) => {
    state.sel = id;
    [...rowsEl.children].forEach(r => r.setAttribute('aria-current', String(r.getAttribute('aria-label').startsWith(apps.find(a => a.id === id).name + ','))));
    renderPass();
    if (scroll) $('pass').scrollIntoView({ block: 'start' });
  };

  // The lineup
  const cardsEl = $('cards');
  const renderCards = () => {
    cardsEl.replaceChildren();
    apps.filter(matches).forEach(a => {
      const c = el('button', 'card'); c.type = 'button';
      c.addEventListener('click', () => select(a.id, true));
      const art = el('div', 'card-art'); art.style.background = a.bg;
      if (a.art) { const img = el('img', a.artIcon ? 'icon' : null); img.src = a.art; img.alt = ''; img.loading = 'lazy'; art.append(img); }
      const gate = el('span', 'card-gate', a.gate); gate.style.color = a.ink;
      const pill = el('span', 'card-status'); const dot = el('span', 'dot'); dot.style.background = st(a).color; pill.append(dot, st(a).label);
      art.append(gate, pill);
      const body = el('div', 'card-body');
      const head = el('div', 'card-head'); head.append(el('div', 'card-name', a.name), el('div', 'card-version', a.version ? 'v' + a.version.replace(/^v/i, '') : ''));
      const chips = el('div', 'chips');
      const chip = (s, label) => chips.append(el('span', 'chip' + (s.state === 'pending' ? ' pending' : ''), s.state === 'pending' ? `${label} · soon` : label));
      if (a.ios) chip(a.ios, 'App Store');
      if (a.android) chip(a.android, 'Google Play');
      if (a.url) chips.append(el('span', 'chip', 'Web'));
      body.append(head, el('div', 'card-tagline', a.tagline), chips);
      c.append(art, body);
      cardsEl.append(c);
    });
  };

  $('search').addEventListener('input', e => { state.query = e.target.value; renderBoard(); renderCards(); });

  renderBoard(); renderPass(); renderCards();
})();
