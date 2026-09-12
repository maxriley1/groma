(function () {
  const G = window.GROMA = window.GROMA || {};
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  let inited = false;

  G.init = function (root) {
    if (inited) return; inited = true;
    root = root || document;
    const $ = (s, r) => Array.from((r || root).querySelectorAll(s));
    document.documentElement.classList.add('g-ready');

    // Reveal on view
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.hasAttribute('data-count')) count(e.target);
      io.unobserve(e.target);
    }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    $('[data-rv],[data-count]').forEach((el) => io.observe(el));

    // Count-up
    function count(el) {
      const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, t0 = performance.now(), dur = 1600;
      if (rm) { el.textContent = end.toFixed(dec); return; }
      (function tick(n) { const p = Math.min(1, (n - t0) / dur), k = 1 - Math.pow(1 - p, 3); el.textContent = (end * k).toFixed(dec); if (p < 1) requestAnimationFrame(tick); })(t0);
    }

    // Scroll-driven bits
    const scrub = $('[data-scrub]');
    const strips = $('[data-strip]');
    const bar = root.querySelector('[data-progress]');
    const hud = root.querySelector('[data-hud-ch]');
    const parallax = $('[data-parallax]');
    function onScroll() {
      const vh = innerHeight, sy = scrollY, max = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.transform = `scaleX(${Math.min(1, sy / max)})`;
      if (hud) hud.textContent = 'CH ' + (sy / max * 1256).toFixed(3) + ' m';
      scrub.forEach((el) => { const r = el.getBoundingClientRect(); const p = (vh * 0.85 - r.top) / (r.height + vh * 0.4); el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3)); });
      strips.forEach((el) => { const r = el.getBoundingClientRect(); const range = el.offsetHeight - vh; const p = Math.min(1, Math.max(0, -r.top / Math.max(1, range))); const tr = el.querySelector('[data-track]'); if (tr && innerWidth > 900) { const w = tr.scrollWidth - innerWidth; tr.style.transform = `translate3d(${-p * w}px,0,0)`; } el.style.setProperty('--p', p.toFixed(3)); });
      parallax.forEach((el) => { const r = el.getBoundingClientRect(); const c = (r.top + r.height / 2 - vh / 2) / vh; el.style.transform = `translate3d(0,${(c * parseFloat(el.dataset.parallax || 40)).toFixed(1)}px,0)`; });
    }
    if (!rm) { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); }
    onScroll();

    // Magnetic buttons
    if (fine && !rm) $('[data-magnet]').forEach((el) => {
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // Tilt cards
    if (fine && !rm) $('[data-tilt]').forEach((el) => {
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(1200px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`; el.style.setProperty('--mx', (x + .5) * 100 + '%'); el.style.setProperty('--my', (y + .5) * 100 + '%'); });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // Custom cursor
    const cur = root.querySelector('[data-cursor]');
    if (cur && fine && !rm) {
      let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
      addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; cur.style.opacity = 1; });
      document.addEventListener('mouseleave', () => { cur.style.opacity = 0; });
      $('a,button,[data-magnet]').forEach((a) => { a.addEventListener('mouseenter', () => cur.classList.add('is-on')); a.addEventListener('mouseleave', () => cur.classList.remove('is-on')); });
      (function loop() { x += (tx - x) * 0.18; y += (ty - y) * 0.18; cur.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); })();
    }

    // Hero canvas: survey field
    const cv = root.querySelector('[data-hero-canvas]');
    if (cv) field(cv);

    // Smooth anchor nav
    $('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const t = root.querySelector(a.getAttribute('hash') || a.hash); if (!t) return; e.preventDefault(); scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: rm ? 'auto' : 'smooth' }); }));
  };

  function field(cv) {
    const ctx = cv.getContext('2d'); let w, h, dpr, mx = 0, tx = 0, t0 = performance.now(), vis = true;
    const hash = (x, y) => { let n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
    const sm = (a, b, t) => a + (b - a) * (t * t * (3 - 2 * t));
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; return sm(sm(hash(xi, yi), hash(xi + 1, yi), xf), sm(hash(xi, yi + 1), hash(xi + 1, yi + 1), xf), yf); };
    const fbm = (x, y, o) => { let v = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { v += a * vn(x * f, y * f); a *= .5; f *= 2.03; } return v; };
    const FW = 512, FH = 256, fog = document.createElement('canvas'); fog.width = FW; fog.height = FH;
    { const g = fog.getContext('2d'), img = g.createImageData(FW, FH); for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const u = x / FW * 6, v = y / FH * 3; let n = fbm(u, v, 5) * fbm(u + 7.3, v + 2.1, 3) * 2; n = Math.max(0, (n - .22) * 1.6); const vy = Math.sin(y / FH * Math.PI); const i = (y * FW + x) * 4; img.data[i] = 225; img.data[i + 1] = 228; img.data[i + 2] = 226; img.data[i + 3] = Math.min(255, n * vy * 255); } g.putImageData(img, 0, 0); }
    function size() { dpr = Math.min(1.5, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('mousemove', (e) => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / w - 0.5; });
    cv.parentElement.addEventListener('mouseleave', () => { tx = 0; });
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(cv);
    const banks = [
      { y: .30, hh: .34, sp: 9, a: .34, sc: 1.9 },
      { y: .44, hh: .26, sp: -6, a: .30, sc: 1.4 },
      { y: .56, hh: .22, sp: 13, a: .38, sc: 1.1 },
      { y: .70, hh: .20, sp: -9, a: .30, sc: 1.6 },
      { y: .84, hh: .16, sp: 5, a: .22, sc: 2.2 },
    ];
    function draw(now) {
      requestAnimationFrame(draw); if (!vis) return;
      const t = (now - t0) / 1000, intro = rm ? 1 : Math.min(1, t / 2.6);
      mx += (tx - mx) * 0.04;
      ctx.clearRect(0, 0, w, h);
      banks.forEach((b, i) => {
        const bw = FW * b.sc, bh = h * b.hh, y = h * b.y - bh / 2 + Math.sin(t * .15 + i) * h * .012;
        const off = ((t * b.sp + i * 400 + mx * (30 + i * 25)) % bw + bw) % bw;
        ctx.globalAlpha = b.a * intro * (0.85 + .15 * Math.sin(t * .3 + i * 1.7));
        for (let k = -1; k <= Math.ceil(w / bw) + 1; k++) ctx.drawImage(fog, 0, 0, FW, FH, k * bw - off, y, bw, bh);
      });
      ctx.globalAlpha = 1;
      const ly = h * .74, lx = w * .5 + mx * 40;
      ctx.strokeStyle = 'rgba(224,88,74,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx - w * .5 * intro, ly); ctx.lineTo(lx + w * .5 * intro, ly); ctx.stroke();
      ctx.strokeStyle = 'rgba(235,231,223,.8)'; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - 40 * intro); ctx.stroke();
      ctx.fillStyle = '#e0584a'; ctx.fillRect(lx - 3, ly - 46 * intro, 6, 6);
      ctx.fillStyle = 'rgba(235,231,223,.6)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.fillText('STA 00 · FIXED POINT', lx + 12, ly - 38 * intro);
    }
    requestAnimationFrame(draw);
  }

  if (document.readyState !== 'loading' && !document.querySelector('x-dc')) G.init(); else if (!document.querySelector('x-dc')) document.addEventListener('DOMContentLoaded', () => G.init());
})();
