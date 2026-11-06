/* Interactive: "Carriers out of equilibrium: light on, light off" (Ch4, Case B, the illuminated surface).
   Physics: course Ch4 excess-carrier equation (4.26); edge value (4.27) Δp(0,t) = (τg0/2)(1−e^{−t/τ});
   exact switch-on solution (4.30) for x ≥ 0; steady profile (4.32) (τg0/2)e^{−x/Lp}; Case A (4.11) deep in the layer;
   return to equilibrium (4.6). Switch-off and repeated switching: superposition of (4.30) (the equation is linear and
   time-invariant), exact. Lit side x < 0 from the mirror argument of the course: Δp(x<0,t) = τg0(1−e^{−t/τ}) − Δp(−x,t). */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var ID = 'surface';
  var NS = 'http://www.w3.org/2000/svg';
  var inst = 0;
  var q = 1.602e-19;
  var DEF = { g0: 1e19, tau: 1e-5, Dp: 12, speed: 0.15, xr: 1 };   // speed: 0.15 tau per second at 1x (Handoff 4: 3.3x slower than v2)   // Ch4 reference values (Case B)
  var C = { ink: '#1d2430', grey: '#6B6B6B', navy: '#1F3A5F', acc: '#D9771A', line: '#dde3ea',
    el: '#1F4E9A', ho: '#C8641E', light: '#f5c542' };

  var CSS = [
    '.ix-surface{font-family:var(--sans,"DejaVu Sans",system-ui,sans-serif);color:#1d2430;font-size:14px;line-height:1.4}',
    '.ix-surface *{box-sizing:border-box}',
    '.ix-surface .ixs-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;margin:0 0 8px}',
    '.ix-surface .ixs-title{font-weight:700;color:#1F3A5F;font-size:16px}',
    '.ix-surface .ixs-sub{color:#6B6B6B;font-size:12.5px}',
    '.ix-surface .ixs-ctl{border:1px solid #dde3ea;border-radius:6px;background:#fafbfc;padding:10px 12px;margin-bottom:10px}',
    '.ix-surface .ixs-row{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center}',
    '.ix-surface .ixs-sl{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px 18px;margin-top:10px}',
    '.ix-surface .ixs-s{display:grid;grid-template-columns:auto minmax(60px,1fr) auto;gap:8px;align-items:center;font-size:13px}',
    '.ix-surface .ixs-s span.v{font-variant-numeric:tabular-nums;font-weight:700;color:#1F3A5F;min-width:84px;text-align:right;white-space:nowrap}',
    '.ix-surface input[type=range]{width:100%;min-width:0;accent-color:#1F3A5F}',
    '.ix-surface button{font:inherit;font-size:13px;padding:5px 11px;border:1px solid #c5ced9;border-radius:5px;background:#fff;color:#1F3A5F;cursor:pointer;white-space:nowrap}',
    '.ix-surface button:hover{border-color:#1F3A5F}',
    '.ix-surface button.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}',
    '.ix-surface button.lamp{font-weight:700;padding:6px 14px}',
    '.ix-surface button.lamp.on{background:#f5c542;color:#1d2430;border-color:#d4a11c;box-shadow:0 0 10px rgba(245,197,66,.7)}',
    '.ix-surface .ixs-clock{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:700;color:#1F3A5F}',
    '.ix-surface .ixs-panel{border:1px solid #dde3ea;border-radius:6px;background:#fff;padding:6px;min-width:0}',
    '.ix-surface .ixs-panel svg{display:block;width:100%;height:auto}',
    '.ix-surface svg text{font-family:inherit}',
    '.ix-surface .ixs-grid{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:12px;margin-top:12px;align-items:start}',
    '.ix-surface .ixs-grid.narrow{grid-template-columns:minmax(0,1fr)}',
    '.ix-surface .ixs-ro{display:grid;grid-template-columns:1fr auto;gap:3px 10px;font-size:12.5px;padding:8px 10px;margin:0}',
    '.ix-surface .ixs-ro dt{color:#6B6B6B}',
    '.ix-surface .ixs-ro dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}',
    '.ix-surface .ixs-ro .sep{grid-column:1/3;border-top:1px solid #eef1f5;margin:3px 0}',
    '.ix-surface .ixs-watch{margin-top:10px;padding:8px 12px;border-left:3px solid #D9771A;background:#fffaf4;font-size:13.5px;border-radius:0 6px 6px 0;min-height:2.6em}',
    '.ix-surface .ixs-watch b{color:#1F3A5F}',
    '.ix-surface .ixs-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:#444;margin:6px 2px 0}',
    '.ix-surface .ixs-legend>span{display:inline-flex;align-items:center;gap:5px}',
    '.ix-surface .ixs-cap{font-size:12px;color:#6B6B6B;margin-top:8px}',
    '.ix-surface sub,.ix-surface sup{font-size:.72em;line-height:0}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('ix-' + ID + '-css')) return;
    var s = document.createElement('style'); s.id = 'ix-' + ID + '-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html, parent) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e); return e;
  }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function supStr(n) { return String(n).split('').map(function (c) { return SUP[c] || c; }).join(''); }
  function sci(v, d) {
    if (d == null) d = 2;
    if (v === 0) return '0';
    var s = v < 0 ? '−' : ''; v = Math.abs(v);
    var e = Math.floor(Math.log10(v)); var m = v / Math.pow(10, e);
    var ms = m.toFixed(d - 1);
    if (parseFloat(ms) >= 10) { e += 1; ms = (m / 10).toFixed(d - 1); }
    if (e >= -2 && e <= 3) return s + String(parseFloat(v.toPrecision(d)));
    if (/^1(\.0+)?$/.test(ms)) return s + '10' + supStr(e);
    return s + ms + '×10' + supStr(e);
  }
  function setSub(t, main, sub, after) {
    while (t.firstChild) t.removeChild(t.firstChild);
    var a = el('tspan', { 'font-style': 'italic' }, t); a.textContent = main;
    if (sub) { var b = el('tspan', { 'baseline-shift': 'sub', 'font-size': '75%' }, t); b.textContent = sub; }
    if (after) { var c = el('tspan', { 'baseline-shift': '0' }, t); c.textContent = after; }
  }

  /* ---------- erfc (Numerical Recipes erfcc, rel. error < 1.2e-7), in log form ---------- */
  function lerfc(z) { // log erfc(z), z >= 0
    var t = 1 / (1 + 0.5 * z);
    return Math.log(t) - z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))));
  }
  function expErfc(a, z) { // e^a erfc(z) without overflow
    if (z >= 0) return Math.exp(a + lerfc(z));
    return Math.exp(a) * (2 - Math.exp(lerfc(-z)));
  }

  function mount(root) {
    injectCSS();
    inst++;
    var uid = 'ixs' + inst + '_';
    root.innerHTML = '';
    root.classList.add('ix-' + ID);
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var P = { g0: DEF.g0, tau: DEF.tau, Dp: DEF.Dp, speed: DEF.speed, xr: DEF.xr };
    var st = { t: 0, light: true, events: [{ t: 0, on: true }], playing: !reduced };
    function Lp() { return Math.sqrt(P.Dp * P.tau); }

    /* ---------- physics ---------- */
    // switch-on response for x >= 0 (cm), t (s): course eq (4.30)
    function uOn(x, t) {
      if (t <= 0) return 0;
      var tau = P.tau, L = Lp(), s = 2 * Math.sqrt(P.Dp * t), r = Math.sqrt(t / tau), A = tau * P.g0;
      return A / 4 * (expErfc(-x / L, x / s - r) + expErfc(x / L, x / s + r)) - A / 2 * Math.exp(-t / tau) * Math.exp(lerfc(x / s));
    }
    // full line: lit layer x < 0 from the mirror argument (Case A minus the image)
    function uFull(x, t) {
      if (t <= 0) return 0;
      if (x >= 0) return uOn(x, t);
      return P.tau * P.g0 * (1 - Math.exp(-t / P.tau)) - uOn(-x, t);
    }
    // superposition over switch events (on: +, off: −)
    function dp(x, t) {
      var s = 0, ev = st.events;
      for (var i = 0; i < ev.length; i++) if (t > ev[i].t) s += (ev[i].on ? 1 : -1) * uFull(x, t - ev[i].t);
      return Math.max(0, s);
    }
    function steadyFull(x) { var A = P.tau * P.g0, L = Lp(); return x >= 0 ? A / 2 * Math.exp(-x / L) : A - A / 2 * Math.exp(x / L); }
    function t90(x) { // switch-on time to reach 90 % of the final value at depth x
      var fin = steadyFull(x), lo = 0, hi = 30 * P.tau;
      for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (uOn(x, m) < 0.9 * fin) lo = m; else hi = m; }
      return lo;
    }

    /* ---------- DOM ---------- */
    var head = h('div', 'ixs-head', null, root);
    h('div', 'ixs-title', 'Carriers out of equilibrium: light on, light off', head);
    h('div', 'ixs-sub', 'Case B of Ch4: thick N-type Si, <i>N</i><sub>D</sub> = 10<sup>16</sup> cm<sup>−3</sup>, light absorbed in a surface layer (<i>x</i> &lt; 0), dark bulk (<i>x</i> &gt; 0)', head);
    var ctl = h('div', 'ixs-ctl', null, root);
    var row = h('div', 'ixs-row', null, ctl);
    var bLamp = h('button', 'lamp on', '', row);
    var bPlay = h('button', null, '', row);
    var bReset = h('button', null, '↺ Reset', row);
    var bDef = h('button', null, 'Course values', row);
    var clock = h('span', 'ixs-clock', '', row);
    var sls = h('div', 'ixs-sl', null, ctl);
    function slider(label, min, max, step, val, fmt, on) {
      var w = h('label', 'ixs-s', null, sls);
      h('span', null, label, w);
      var i = document.createElement('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val;
      w.appendChild(i);
      var v = h('span', 'v', '', w);
      function show() { v.innerHTML = fmt(parseFloat(i.value)); }
      i.addEventListener('input', function () { show(); on(parseFloat(i.value)); });
      show();
      return { input: i, show: show };
    }
    var sG = slider('<i>g</i><sub>0</sub>', 18, 20, 0.05, Math.log10(P.g0), function (v) { return sci(Math.pow(10, v), 2) + ' cm<sup>−3</sup>s<sup>−1</sup>'; }, function (v) { P.g0 = Math.pow(10, v); restart(); });
    var sT = slider('<i>τ</i>', 0, 2, 0.02, Math.log10(P.tau * 1e6), function (v) { return parseFloat(Math.pow(10, v).toPrecision(2)) + ' µs'; }, function (v) { P.tau = Math.pow(10, v) * 1e-6; restart(); });
    var sD = slider('<i>D</i><sub>p</sub>', 2, 35, 0.5, P.Dp, function (v) { return v.toFixed(1) + ' cm²/s'; }, function (v) { P.Dp = v; restart(); });
    var sX = slider('depth <i>x</i>', 0, 4, 0.05, P.xr, function (v) { return v.toFixed(2) + ' <i>L</i><sub>p</sub>'; }, function (v) { P.xr = v; draw(); });
    // Handoff 4: Speed (0.25x-2x of 0.15 tau per second) and the three regime buttons, with a copy under each panel
    st.mode = '';
    function lightOn() { st.mode = 'fwd'; st.light = true; restart(); if (!reduced) st.playing = true; draw(); }
    function dark() { st.mode = 'eq'; st.light = false; restart(); draw(); }
    function lightOff() { // from the steady state under light, switch the light off: return to equilibrium (4.6)
      st.mode = 'rev'; st.light = false; restart();
      st.events = [{ t: -40 * P.tau, on: true }, { t: 0, on: false }];
      if (geo.X) { st.light = true; for (var k = 0; k < 160; k++) stepParts(1, 0.05 * P.tau); st.light = false; } // the holes of the steady state
      if (!reduced) st.playing = true; draw();
    }
    var K = window.IX._kit, kctl = null;
    if (K) {
      kctl = K.controls({
        regimes: [
          { label: 'Forward: light on', title: 'Strong excitation from equilibrium: the light is switched on (g₀ as set), the excess builds up to its steady profile (4.32)', apply: lightOn, is: function () { return st.mode === 'fwd'; } },
          { label: 'Equilibrium: dark', title: 'Dark: thermal equilibrium, no excess carriers (Δp = 0)', apply: dark, is: function () { return st.mode === 'eq'; } },
          { label: 'Reverse: light off', title: 'From the steady state under light, the light is switched off: the excess decays back to equilibrium (return to equilibrium, eq 4.6)', apply: lightOff, is: function () { return st.mode === 'rev'; } }
        ],
        speed: { get: function () { return P.speed / DEF.speed; }, set: function (v) { P.speed = DEF.speed * v; } }
      });
    }

    var topP = h('div', 'ixs-panel', null, root);
    var svg = el('svg', { role: 'img', 'aria-label': 'Illuminated N-type sample and excess hole profile' }, topP);
    var grid = h('div', 'ixs-grid', null, root);
    var tP = h('div', 'ixs-panel', null, grid);
    var tsvg = el('svg', { role: 'img', 'aria-label': 'Excess hole density versus time at the chosen depth' }, tP);
    if (kctl) {
      ctl.appendChild(kctl.strip({ top: true }));
      topP.appendChild(kctl.strip({ inside: true, tag: '(a)–(b)' }));
      tP.appendChild(kctl.strip({ inside: true, tag: '(c)' }));
    }
    var roP = h('div', 'ixs-panel', null, grid);
    var ro = h('dl', 'ixs-ro', null, roP);
    var R = {};
    function addRO(k, label) { h('dt', null, label, ro); R[k] = h('dd', null, '', ro); }
    function sep() { h('div', 'sep', null, ro); }
    addRO('t', 'time <i>t</i>'); addRO('light', 'light');
    sep();
    addRO('Lp', '<i>L</i><sub>p</sub> = √(<i>D</i><sub>p</sub><i>τ</i>)');
    addRO('A', 'plateau <i>τg</i><sub>0</sub> (deep in layer)');
    addRO('A2', 'steady edge <i>τg</i><sub>0</sub>/2');
    addRO('JP', 'steady <i>J</i><sub>p</sub>(0) = <i>qg</i><sub>0</sub><i>L</i><sub>p</sub>/2');
    sep();
    addRO('x', 'depth <i>x</i>');
    addRO('dpx', 'Δ<i>p</i>(<i>x</i>, <i>t</i>)');
    addRO('dp0', 'Δ<i>p</i>(0, <i>t</i>) at the edge');
    addRO('fin', 'steady Δ<i>p</i>(<i>x</i>)');
    addRO('t90', '90 % after switch-on');
    var watch = h('div', 'ixs-watch', '', root);
    var legend = h('div', 'ixs-legend', null, root);
    legend.innerHTML =
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.3" fill="#fff" stroke="' + C.ho + '" stroke-width="1.8"/></svg><span>excess hole (minority)</span></span>' +
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="3.6" fill="' + C.el + '"/></svg><span>electron of a new pair</span></span>' +
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="2" fill="#9fb3d6"/></svg><span>majority electrons</span></span>' +
      '<span><svg width="14" height="14"><rect x="2" y="2" width="10" height="10" fill="#fdf1e6" stroke="#d99a66"/><path d="M4.5 7h5M7 4.5v5" stroke="#c8641e" stroke-width="1.2"/></svg><span>ionised donor</span></span>' +
      '<span><svg width="16" height="14"><circle cx="8" cy="7" r="5" fill="none" stroke="#f2b84b" stroke-width="1.5"/></svg><span>recombination</span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.navy + '" stroke-width="2"/></svg><span>Δ<i>p</i>(<i>x</i>, <i>t</i>), eq. (4.30)</span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.grey + '" stroke-width="1.5" stroke-dasharray="5 3"/></svg><span>steady profile (4.32)</span></span>';
    var cap = h('div', 'ixs-cap', '', root);
    cap.innerHTML = 'Computed from the course solution: Δ<i>p</i>(<i>x</i>,<i>t</i>) for <i>x</i> ≥ 0 is eq. (4.30), the exact switch-on solution of (4.28); the edge follows (4.27), Δ<i>p</i>(0,<i>t</i>) = (<i>τg</i><sub>0</sub>/2)(1 − e<sup>−<i>t</i>/<i>τ</i></sup>); the steady state is (4.32). ' +
      'The lit side <i>x</i> &lt; 0 uses the course mirror argument: Δ<i>p</i> = <i>τg</i><sub>0</sub>(1 − e<sup>−<i>t</i>/<i>τ</i></sup>) − Δ<i>p</i>(−<i>x</i>,<i>t</i>) (Case A (4.11) minus its image). ' +
      '<b>Switch-off</b> (and any switching sequence) is the exact superposition of (4.30) responses, one per switching, with sign + for on and − for off: the equation is linear. After a steady state the edge then decays exactly as e<sup>−<i>t</i>/<i>τ</i></sup>, the return to equilibrium (4.6); deeper points decay more slowly at first, fed by diffusion from the edge. ' +
      'Moving holes in (a): a random walk with the same <i>D</i><sub>p</sub> and lifetime <i>τ</i> (schematic count; one circle stands for many holes); the frame shows only part of the thick lit layer. Changing a parameter restarts from equilibrium.';

    /* ---------- layout / build ---------- */
    var geo = {}, G = {};
    function build() {
      var W = Math.max(280, topP.clientWidth - 12), narrow = W < 560;
      var ml = narrow ? 44 : 64, mr = narrow ? 10 : 24, fs = narrow ? 10 : 11.5;
      var hA = narrow ? 150 : 190, hB = narrow ? 190 : 240, gap = narrow ? 50 : 54, top = 26;
      var yA = top, yB = yA + hA + gap, H = yB + hB + 40;
      geo = { W: W, H: H, ml: ml, mr: mr, pw: W - ml - mr, fs: fs, narrow: narrow, yA: yA, hA: hA, yB: yB, hB: hB };
      // x window: from -1.5 Lp to +4.5 Lp (in cm)
      var L = Lp();
      geo.x0 = -1.5 * L; geo.x1 = 4.5 * L;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var defs = el('defs', null, svg);
      var lg = el('linearGradient', { id: uid + 'lit', x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
      el('stop', { offset: '0', 'stop-color': '#fff3c4' }, lg); el('stop', { offset: '1', 'stop-color': '#fff8dc' }, lg);
      var cpA = el('clipPath', { id: uid + 'cA' }, defs); el('rect', { x: ml, y: yA, width: geo.pw, height: hA }, cpA);
      var cpB = el('clipPath', { id: uid + 'cB' }, defs); el('rect', { x: ml, y: yB - 2, width: geo.pw, height: hB + 2 }, cpB);
      function X(x) { return ml + (x - geo.x0) / (geo.x1 - geo.x0) * geo.pw; }
      geo.X = X;
      var x0px = X(0);

      // titles
      var tA = el('text', { x: 4, y: yA - 10, 'font-size': fs, 'font-weight': 700, fill: C.navy }, svg); tA.textContent = '(a) the sample, live';
      var tB = el('text', { x: 4, y: yB - 26, 'font-size': fs, 'font-weight': 700, fill: C.navy }, svg); tB.textContent = '(b) excess holes Δp(x, t), linear';

      /* (a) sample */
      G.lit = el('rect', { x: ml, y: yA, width: x0px - ml, height: hA, fill: 'url(#' + uid + 'lit)' }, svg);
      el('rect', { x: x0px, y: yA, width: ml + geo.pw - x0px, height: hA, fill: '#f4f6f9' }, svg);
      el('rect', { x: ml, y: yA, width: geo.pw, height: hA, fill: 'none', stroke: '#b9c2cd' }, svg);
      el('line', { x1: x0px, y1: yA - 4, x2: x0px, y2: yB + hB, stroke: '#c9a227', 'stroke-dasharray': '4 3' }, svg);
      var gA = el('g', { 'clip-path': 'url(#' + uid + 'cA)' }, svg);
      // donors and majority electrons (static background, deterministic)
      var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      var nd = Math.round(geo.pw * hA / 2600);
      for (var i = 0; i < nd; i++) {
        var dx = ml + rnd() * geo.pw, dy = yA + 6 + rnd() * (hA - 12);
        el('rect', { x: dx - 3.5, y: dy - 3.5, width: 7, height: 7, fill: '#fdf1e6', stroke: '#e3b48a', 'stroke-width': 0.8 }, gA);
        el('path', { d: 'M' + (dx - 2) + ',' + dy + 'h4M' + dx + ',' + (dy - 2) + 'v4', stroke: '#d08a52', 'stroke-width': 0.9 }, gA);
      }
      G.maj = [];
      var nm = Math.round(geo.pw * hA / 1300);
      for (i = 0; i < nm; i++) {
        var c = el('circle', { cx: ml + rnd() * geo.pw, cy: yA + 4 + rnd() * (hA - 8), r: 1.8, fill: '#9fb3d6' }, gA);
        G.maj.push({ e: c, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), ph: rnd() * 6.28 });
      }
      G.photons = el('g', null, svg);
      G.partLayer = el('g', null, gA);
      // labels
      G.litLab = el('text', { x: ml + 6, y: yA + 14, 'font-size': fs, fill: '#8a6d00', 'font-weight': 700 }, svg);
      G.litLab.textContent = 'lit layer: g = g₀';
      var dk = el('text', { x: ml + geo.pw - 6, y: yA + 14, 'font-size': fs, fill: C.grey, 'font-weight': 700, 'text-anchor': 'end' }, svg);
      dk.textContent = narrow ? 'dark bulk' : 'dark N bulk: g = 0, holes diffuse and recombine';
      // axis break at left (lit layer continues to the surface)
      el('path', { d: 'M' + (ml - 5) + ',' + (yA + hA / 2 - 9) + 'l10,6M' + (ml - 5) + ',' + (yA + hA / 2 - 3) + 'l10,6', stroke: C.grey, fill: 'none', 'stroke-width': 1.2 }, svg);
      var sf = el('text', { x: ml - 6, y: yA + hA + 14, 'font-size': fs - 1.5, fill: C.grey, 'text-anchor': 'middle' }, svg);
      sf.textContent = narrow ? '← surface' : '← to the surface';

      /* (b) profile */
      el('rect', { x: ml, y: yB, width: x0px - ml, height: hB, fill: '#fffbea' }, svg);
      el('rect', { x: ml, y: yB, width: geo.pw, height: hB, fill: 'none', stroke: C.line }, svg);
      G.axB = el('g', null, svg);
      var gB = el('g', { 'clip-path': 'url(#' + uid + 'cB)' }, svg);
      G.steady = el('path', { fill: 'none', stroke: C.grey, 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }, gB);
      G.fill = el('path', { fill: 'rgba(200,100,30,0.13)' }, gB);
      G.curve = el('path', { fill: 'none', stroke: C.navy, 'stroke-width': 2.4 }, gB);
      G.LpLine = el('line', { stroke: C.grey, 'stroke-dasharray': '1 3', 'stroke-width': 1.3 }, gB);
      G.xLine = el('line', { stroke: C.acc, 'stroke-width': 1.5 }, gB);
      G.xDot = el('circle', { r: 5, fill: C.acc, stroke: '#fff', 'stroke-width': 1.5 }, svg);
      G.LpT = el('text', { 'font-size': fs, fill: C.grey, 'text-anchor': 'middle' }, svg); setSub(G.LpT, 'x = L', 'p');
      G.xT = el('text', { 'font-size': fs - 0.5, fill: C.acc, 'text-anchor': 'middle' }, svg);
      G.LpArrow = el('path', { stroke: C.grey, fill: 'none' }, svg);
      G.LpArrowT = el('text', { 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, svg);
      buildTime();
      parts = []; acc = 0; pool = []; flashes = []; photons = [];
      draw();
    }

    /* ---------- time panel ---------- */
    var T = {};
    function buildTime() {
      var W = Math.max(260, tP.clientWidth - 12), narrow = W < 440;
      var Hh = narrow ? 230 : 250, ml = narrow ? 50 : 62, mr = 12, mt = 30, mb = 34, fs = narrow ? 10 : 11;
      T = { W: W, H: Hh, ml: ml, mr: mr, mt: mt, mb: mb, pw: W - ml - mr, ph: Hh - mt - mb, fs: fs, narrow: narrow };
      tsvg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); tsvg.setAttribute('width', W); tsvg.setAttribute('height', Hh);
      while (tsvg.firstChild) tsvg.removeChild(tsvg.firstChild);
      var defs = el('defs', null, tsvg);
      var cp = el('clipPath', { id: uid + 'cT' }, defs); el('rect', { x: ml, y: mt - 2, width: T.pw, height: T.ph + 2 }, cp);
      var t = el('text', { x: 4, y: 14, 'font-size': fs + 0.5, 'font-weight': 700, fill: C.navy }, tsvg); t.textContent = '(c) Δp versus time';
      el('rect', { x: ml, y: mt, width: T.pw, height: T.ph, fill: 'none', stroke: C.line }, tsvg);
      T.ax = el('g', null, tsvg);
      var g = el('g', { 'clip-path': 'url(#' + uid + 'cT)' }, tsvg);
      T.lightBands = el('g', null, g);
      T.deep = el('path', { fill: 'none', stroke: '#b59a2c', 'stroke-width': 1.4, 'stroke-dasharray': '2 3' }, g);
      T.edge = el('path', { fill: 'none', stroke: C.ho, 'stroke-width': 1.8, 'stroke-dasharray': '6 3' }, g);
      T.cur = el('path', { fill: 'none', stroke: C.navy, 'stroke-width': 2.4 }, g);
      T.tauM = el('g', null, g);
      T.now = el('circle', { r: 4.5, fill: C.acc, stroke: '#fff', 'stroke-width': 1.5 }, tsvg);
      T.leg = el('g', { 'font-size': fs - 1 }, tsvg);
    }

    /* ---------- drawing ---------- */
    function yMax() { return P.tau * P.g0 * 1.12; }
    function draw() {
      var g = geo, X = g.X, L = Lp(), A = P.tau * P.g0, t = st.t, fs = g.fs, i;
      var yB0 = g.yB + g.hB, ym = yMax();
      function Y(v) { return yB0 - v / ym * g.hB; }
      // profile
      var N = 160, d = '', ds = '';
      for (i = 0; i <= N; i++) {
        var x = g.x0 + (g.x1 - g.x0) * i / N, px = X(x).toFixed(1);
        d += (i ? 'L' : 'M') + px + ',' + Y(dp(x, t)).toFixed(1);
        ds += (i ? 'L' : 'M') + px + ',' + Y(steadyFull(x)).toFixed(1);
      }
      G.curve.setAttribute('d', d);
      G.fill.setAttribute('d', d + 'L' + X(g.x1) + ',' + yB0 + 'L' + X(g.x0) + ',' + yB0 + 'Z');
      G.steady.setAttribute('d', ds);
      // axes (b)
      var ax = G.axB; while (ax.firstChild) ax.removeChild(ax.firstChild);
      var ticks = [[0, '0'], [A / 2, null, '/2'], [A, null, '']];
      ticks.forEach(function (tk) {
        var y = Y(tk[0]);
        el('line', { x1: g.ml - 4, x2: g.ml + g.pw, y1: y, y2: y, stroke: tk[0] ? '#eef1f5' : '#b9c2cd' }, ax);
        var tt = el('text', { x: g.ml - 6, y: y + 4, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, ax);
        if (tk[1]) tt.textContent = tk[1]; else setSub(tt, 'τg', '0', tk[2]);
      });
      var uL = el('text', { x: g.ml + g.pw, y: g.yB - 6, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, ax);
      uL.textContent = 'τg₀ = ' + sci(A, 2) + ' cm⁻³';
      // x ticks in µm
      var span = (g.x1 - g.x0) * 1e4, stepUm = niceStep(span / (g.narrow ? 4 : 7));
      for (var u = Math.ceil(g.x0 * 1e4 / stepUm) * stepUm; u <= g.x1 * 1e4 + 1e-9; u += stepUm) {
        var xx = X(u * 1e-4);
        el('line', { x1: xx, x2: xx, y1: yB0, y2: yB0 + 4, stroke: C.grey }, ax);
        var tx = el('text', { x: xx, y: yB0 + 16, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, ax);
        tx.textContent = (u < 0 ? '−' : '') + Math.abs(Math.round(u));
      }
      var xl = el('text', { x: g.ml + g.pw, y: yB0 + 30, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, ax); xl.textContent = 'x (µm)';
      var litT = el('text', { x: g.ml + 4, y: g.yB + 13, 'font-size': fs - 1, fill: '#8a6d00' }, ax); litT.textContent = 'lit layer';
      // Lp marker and depth marker
      var xL = X(L);
      G.LpLine.setAttribute('x1', xL); G.LpLine.setAttribute('x2', xL); G.LpLine.setAttribute('y1', g.yB); G.LpLine.setAttribute('y2', yB0);
      G.LpT.setAttribute('x', xL); G.LpT.setAttribute('y', g.yB - 8);
      var ya = g.yB + 22, x0p = X(0);
      G.LpArrow.setAttribute('d', 'M' + x0p + ',' + ya + 'H' + xL + 'M' + (x0p + 5) + ',' + (ya - 3) + 'L' + x0p + ',' + ya + 'L' + (x0p + 5) + ',' + (ya + 3) + 'M' + (xL - 5) + ',' + (ya - 3) + 'L' + xL + ',' + ya + 'L' + (xL - 5) + ',' + (ya + 3));
      G.LpArrowT.setAttribute('x', (x0p + xL) / 2); G.LpArrowT.setAttribute('y', ya - 4);
      G.LpArrowT.textContent = g.narrow ? 'Lₚ' : 'Lₚ = ' + (L * 1e4).toPrecision(3) + ' µm';
      var xo = P.xr * L, xop = X(xo), vo = dp(xo, t);
      G.xLine.setAttribute('x1', xop); G.xLine.setAttribute('x2', xop); G.xLine.setAttribute('y1', Y(vo)); G.xLine.setAttribute('y2', yB0);
      G.xDot.setAttribute('cx', xop); G.xDot.setAttribute('cy', Y(vo));
      G.xT.setAttribute('x', Math.min(g.ml + g.pw - 20, xop + (Math.abs(xop - xL) < 30 ? 0 : 0))); G.xT.setAttribute('y', yB0 - 6);
      G.xT.textContent = Math.abs(P.xr - 1) < 0.03 ? '' : 'x';
      G.lit.setAttribute('fill', st.light ? 'url(#' + uid + 'lit)' : '#f0f0ea');

      drawTime(xo);
      // readouts
      clock.textContent = 't = ' + fmtT(t) + '  (' + (t / P.tau).toFixed(2) + ' τ)';
      bLamp.textContent = st.light ? '☀ Light ON (click to switch off)' : '☾ Light OFF (click to switch on)';
      if (g.narrow) bLamp.textContent = st.light ? '☀ Light ON' : '☾ Light OFF';
      bLamp.classList.toggle('on', st.light);
      bPlay.textContent = st.playing ? '❚❚ Pause' : '▶ Play';
      bPlay.classList.toggle('on', st.playing);
      R.t.textContent = fmtT(t);
      R.light.textContent = st.light ? 'on' : 'off';
      R.Lp.textContent = (L * 1e4).toPrecision(3) + ' µm';
      R.A.textContent = sci(A, 2) + ' cm⁻³';
      R.A2.textContent = sci(A / 2, 2) + ' cm⁻³';
      R.JP.textContent = (q * P.g0 * L / 2 * 1e3).toPrecision(2) + ' mA/cm²';
      R.x.innerHTML = (xo * 1e4).toPrecision(3) + ' µm (' + P.xr.toFixed(2) + ' <i>L</i><sub>p</sub>)';
      R.dpx.textContent = sci(vo, 3) + ' cm⁻³';
      R.dp0.textContent = sci(dp(0, t), 3) + ' cm⁻³';
      R.fin.textContent = sci(steadyFull(xo), 3) + ' cm⁻³';
      R.t90.innerHTML = fmtT(t90cache()) + ' = ' + (t90cache() / P.tau).toFixed(1) + ' <i>τ</i>';
      // what to watch
      var last = st.events.length ? st.events[st.events.length - 1] : null, since = last ? (t - last.t) / P.tau : 99, w;
      if (st.light && since < 0.6) w = '<b>Switch-on, t ≪ τ:</b> pure diffusion, the front advances as √(<i>D</i><sub>p</sub><i>t</i>); the edge fills as (<i>τg</i><sub>0</sub>/2)(1 − e<sup>−<i>t</i>/<i>τ</i></sup>).';
      else if (st.light && since < 4) w = '<b>Recombination stops the front</b> near <i>L</i><sub>p</sub> = √(<i>D</i><sub>p</sub><i>τ</i>): carriers cannot carry the excess farther than they live. At <i>x</i> = <i>L</i><sub>p</sub>, 90 % is reached after 3.0 <i>τ</i>.';
      else if (st.light) w = '<b>Steady state, not equilibrium:</b> Δ<i>p</i> = (<i>τg</i><sub>0</sub>/2)e<sup>−<i>x</i>/<i>L</i><sub>p</sub></sup> no longer changes, but <i>np</i> ≠ <i>n</i><sub>i</sub>²; the holes entering the bulk are lost by recombination over the whole depth. Switch the light off.';
      else if (since < 5 && st.events.length) w = '<b>Light off, return to equilibrium:</b> the edge decays exactly as e<sup>−<i>t</i>/<i>τ</i></sup> (4.6); deeper points decay more slowly at first, still fed by diffusion from the edge.';
      else w = '<b>Equilibrium:</b> Δ<i>p</i> = 0 everywhere (<i>p</i><sub>0</sub> = 10<sup>4</sup> cm<sup>−3</sup>, invisible on this scale). Switch the light on.';
      watch.innerHTML = w;
    }
    var t90c = { key: '', v: 0 };
    function t90cache() {
      var key = P.g0 + '|' + P.tau + '|' + P.Dp + '|' + P.xr;
      if (key !== t90c.key) { t90c.key = key; t90c.v = t90(P.xr * Lp()); }
      return t90c.v;
    }
    function niceStep(x) { var e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }
    function fmtT(t) { var us = t * 1e6; return (us < 10 ? us.toFixed(2) : us < 100 ? us.toFixed(1) : us.toFixed(0)) + ' µs'; }

    function drawTime(xo) {
      var tau = P.tau, win = 8 * tau, t = st.t, A = P.tau * P.g0;
      var t0 = Math.max(0, t - win), t1 = t0 + win;
      function X(tt) { return T.ml + (tt - t0) / win * T.pw; }
      var ym = A * 1.12;
      function Y(v) { return T.mt + T.ph - v / ym * T.ph; }
      var N = 140, dc = '', de = '', dd = '', i;
      var tEnd = Math.min(t, t1);
      for (i = 0; i <= N; i++) {
        var tt = t0 + (tEnd - t0) * i / N, px = X(tt).toFixed(1);
        dc += (i ? 'L' : 'M') + px + ',' + Y(dp(xo, tt)).toFixed(1);
        de += (i ? 'L' : 'M') + px + ',' + Y(dp(0, tt)).toFixed(1);
        dd += (i ? 'L' : 'M') + px + ',' + Y(deep(tt)).toFixed(1);
      }
      T.cur.setAttribute('d', dc); T.edge.setAttribute('d', de); T.deep.setAttribute('d', dd);
      T.now.setAttribute('cx', X(tEnd)); T.now.setAttribute('cy', Y(dp(xo, tEnd)));
      // light-on bands
      var lb = T.lightBands; while (lb.firstChild) lb.removeChild(lb.firstChild);
      var ev = st.events;
      for (i = 0; i < ev.length; i++) if (ev[i].on) {
        var a = ev[i].t, b = (i + 1 < ev.length) ? ev[i + 1].t : t;
        if (b < t0) continue;
        el('rect', { x: X(Math.max(a, t0)), y: T.mt, width: Math.max(0, X(b) - X(Math.max(a, t0))), height: T.ph, fill: '#fff6d6' }, lb);
      }
      // tau marker after the most recent switching (on the edge curve, which is a pure exponential in tau)
      var tm = T.tauM; while (tm.firstChild) tm.removeChild(tm.firstChild);
      var last = ev.length ? ev[ev.length - 1] : null;
      if (last && last.t + tau >= t0) {
        var xa = X(last.t), xb = X(last.t + tau), v63 = dp(0, last.t + tau);
        el('line', { x1: xa, x2: xa, y1: T.mt, y2: T.mt + T.ph, stroke: '#c9a227', 'stroke-dasharray': '3 3' }, tm);
        if (t >= last.t + tau) {
          el('line', { x1: xb, x2: xb, y1: Y(v63), y2: T.mt + T.ph, stroke: C.ho, 'stroke-dasharray': '2 2' }, tm);
          el('circle', { cx: xb, cy: Y(v63), r: 3, fill: C.ho }, tm);
          var pc = el('text', { x: xb + 5, y: Y(v63) - 5, 'font-size': T.fs - 1, fill: C.ho }, tm);
          pc.textContent = last.on ? '63 % of τg₀/2' : '37 %: e⁻¹';
        }
        var yy = T.mt + T.ph - 10;
        el('path', { d: 'M' + xa + ',' + yy + 'H' + xb + 'M' + (xa + 4) + ',' + (yy - 3) + 'L' + xa + ',' + yy + 'L' + (xa + 4) + ',' + (yy + 3) + 'M' + (xb - 4) + ',' + (yy - 3) + 'L' + xb + ',' + yy + 'L' + (xb - 4) + ',' + (yy + 3), stroke: C.ink, fill: 'none' }, tm);
        var tt2 = el('text', { x: (xa + xb) / 2, y: yy - 4, 'font-size': T.fs, 'text-anchor': 'middle', 'font-style': 'italic', fill: C.ink }, tm); tt2.textContent = 'τ';
      }
      // axes
      var ax = T.ax; while (ax.firstChild) ax.removeChild(ax.firstChild);
      [[0, '0'], [A / 2, '/2'], [A, '']].forEach(function (tk) {
        var y = Y(tk[0]);
        el('line', { x1: T.ml - 4, x2: T.ml + T.pw, y1: y, y2: y, stroke: tk[0] ? '#eef1f5' : '#b9c2cd' }, ax);
        var te = el('text', { x: T.ml - 6, y: y + 4, 'font-size': T.fs - 1, fill: C.grey, 'text-anchor': 'end' }, ax);
        if (tk[0] === 0) te.textContent = '0'; else setSub(te, 'τg', '0', tk[1]);
      });
      var k0 = Math.ceil(t0 / tau), k;
      for (k = k0; k * tau <= t1 + 1e-12; k++) {
        var xx = X(k * tau);
        el('line', { x1: xx, x2: xx, y1: T.mt + T.ph, y2: T.mt + T.ph + 4, stroke: C.grey }, ax);
        if (T.narrow && k % 2) continue;
        var tx = el('text', { x: xx, y: T.mt + T.ph + 15, 'font-size': T.fs - 1, fill: C.grey, 'text-anchor': 'middle' }, ax);
        tx.textContent = k ? k + 'τ' : '0';
      }
      var xl = el('text', { x: T.ml + T.pw, y: T.mt + T.ph + 28, 'font-size': T.fs - 1, fill: C.grey, 'text-anchor': 'end' }, ax);
      xl.textContent = 't  (τ = ' + fmtT(tau) + ')';
      // legend
      var L = T.leg; while (L.firstChild) L.removeChild(L.firstChild);
      var items = [['M0,0h18', C.navy, '', 2.4, 'at depth x'], ['M0,0h18', C.ho, '6 3', 1.8, 'edge x = 0 (4.27)'], ['M0,0h18', '#b59a2c', '2 3', 1.4, 'deep in layer (4.11)']];
      var lx = T.ml + 6, ly = T.mt + 12;
      items.forEach(function (it, j) {
        var gx = el('g', { transform: 'translate(' + lx + ',' + (ly + j * 13) + ')' }, L);
        el('path', { d: it[0], stroke: it[1], 'stroke-dasharray': it[2], 'stroke-width': it[3] }, gx);
        var te = el('text', { x: 22, y: 4, fill: C.ink }, gx); te.textContent = it[4];
      });
    }
    function deep(t) { // Case A (4.11) deep inside the lit layer, with superposition
      var s = 0, ev = st.events;
      for (var i = 0; i < ev.length; i++) if (t > ev[i].t) s += (ev[i].on ? 1 : -1) * P.tau * P.g0 * (1 - Math.exp(-(t - ev[i].t) / P.tau));
      return Math.max(0, s);
    }

    /* ---------- particles (random walk with D_p and tau) ---------- */
    var parts = [], acc = 0, pool = [], flashes = [], photons = [];
    function circ(kind) {
      for (var i = 0; i < pool.length; i++) if (pool[i].free && pool[i].kind === kind) { pool[i].free = false; pool[i].e.setAttribute('visibility', 'visible'); return pool[i]; }
      var e = kind === 'h' ? el('circle', { r: 3.4, fill: '#fff', stroke: C.ho, 'stroke-width': 1.6 }, G.partLayer) :
        kind === 'e' ? el('circle', { r: 3, fill: C.el }, G.partLayer) :
          el('circle', { r: 2, fill: 'none', stroke: '#f2b84b', 'stroke-width': 1.6 }, G.partLayer);
      var c = { e: e, kind: kind, free: false }; pool.push(c); return c;
    }
    function rel(c) { c.free = true; c.e.setAttribute('visibility', 'hidden'); }
    function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); }
    function stepParts(dtR, dtS) {
      var g = geo, L = Lp(), Dum = P.Dp * 1e8; // µm²/s
      var x0 = g.x0 * 1e4, x1 = g.x1 * 1e4;
      // steady count target (schematic): ~ 110 * (tau g0 / 1e14), clamped
      var Ntar = Math.max(14, Math.min(300, 110 * P.tau * P.g0 / 1e14));
      if (st.light) {
        acc += Ntar / P.tau * dtS / 0.8;
        var nNew = Math.floor(acc); acc -= nNew;
        for (var k = 0; k < nNew && parts.length < 420; k++) {
          var x = x0 + Math.random() * (0 - x0), y = g.yA + 6 + Math.random() * (g.hA - 12);
          var hh = circ('h'), ee = circ('e');
          parts.push({ x: x, y: y, c: hh, e: ee, ex: x, ey: y + (Math.random() < 0.5 ? -5 : 5), eage: 0 });
        }
      }
      var sig = Math.sqrt(2 * Dum * dtS), pr = dtS / P.tau;
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.x += sig * gauss();
        p.y += gauss() * 0.8; if (p.y < g.yA + 5) p.y = g.yA + 5; if (p.y > g.yA + g.hA - 5) p.y = g.yA + g.hA - 5;
        if (p.x < x0) p.x = 2 * x0 - p.x;                 // the lit layer continues: reflect
        var dead = p.x > x1 + 20 ? 'out' : (Math.random() < pr ? 'rec' : false);
        var px = g.X(p.x * 1e-4);
        if (p.e) {
          p.eage += dtS / P.tau;
          p.ex += sig * 1.7 * gauss();
          var op = Math.max(0, 1 - p.eage / 0.35);
          if (op <= 0) { rel(p.e); p.e = null; }
          else { p.e.e.setAttribute('cx', g.X(p.ex * 1e-4).toFixed(1)); p.e.e.setAttribute('cy', p.ey.toFixed(1)); p.e.e.setAttribute('opacity', op.toFixed(2)); }
        }
        if (dead) {
          if (dead === 'rec' && flashes.length < 40) { var f = circ('f'); f.e.setAttribute('cx', px); f.e.setAttribute('cy', p.y); flashes.push({ c: f, t: 0 }); }
          rel(p.c); if (p.e) rel(p.e); parts.splice(i, 1); continue;
        }
        p.c.e.setAttribute('cx', px.toFixed(1)); p.c.e.setAttribute('cy', p.y.toFixed(1));
      }
      for (i = flashes.length - 1; i >= 0; i--) {
        var fl = flashes[i]; fl.t += dtR;
        if (fl.t > 0.4) { rel(fl.c); flashes.splice(i, 1); continue; }
        fl.c.e.setAttribute('r', (2 + fl.t * 16).toFixed(1)); fl.c.e.setAttribute('stroke-opacity', (1 - fl.t / 0.4).toFixed(2));
      }
      // majority electrons jitter
      G.maj.forEach(function (m) { m.ph += dtR * 2; m.e.setAttribute('cx', (m.x + Math.sin(m.ph) * 1.5).toFixed(1)); });
      // photons: wavy arrows entering the lit layer from the left
      stepPhotons(dtR);
    }
    var phAcc = 0;
    function stepPhotons(dtR) {
      var g = geo, layer = G.photons;
      if (st.light) {
        phAcc += dtR * (g.narrow ? 5 : 8);
        while (phAcc >= 1) {
          phAcc -= 1;
          var y = g.yA + 10 + Math.random() * (g.hA - 20);
          var p = el('path', { fill: 'none', stroke: C.light, 'stroke-width': 2, 'stroke-linecap': 'round' }, layer);
          photons.push({ e: p, y: y, x: g.ml - 30, stop: g.ml + Math.random() * (g.X(0) - g.ml) * 0.95 });
        }
      }
      for (var i = photons.length - 1; i >= 0; i--) {
        var ph = photons[i]; ph.x += dtR * 120;
        if (ph.x >= ph.stop) { layer.removeChild(ph.e); photons.splice(i, 1); continue; }
        var d = 'M' + (ph.x - 18).toFixed(1) + ',' + ph.y.toFixed(1);
        for (var k = 1; k <= 6; k++) d += 'L' + (ph.x - 18 + k * 3).toFixed(1) + ',' + (ph.y + (k % 2 ? -2.5 : 2.5)).toFixed(1);
        ph.e.setAttribute('d', d);
      }
    }
    function clearParts() {
      parts.forEach(function (p) { rel(p.c); if (p.e) rel(p.e); }); parts = [];
      flashes.forEach(function (f) { rel(f.c); }); flashes = [];
      photons.forEach(function (p) { if (p.e.parentNode) p.e.parentNode.removeChild(p.e); }); photons = [];
    }

    /* ---------- controls ---------- */
    function restart() {
      st.t = 0; st.events = st.light ? [{ t: 0, on: true }] : [];
      clearParts(); layout();
    }
    bLamp.addEventListener('click', function () {
      st.mode = '';
      st.light = !st.light; st.events.push({ t: st.t, on: st.light });
      if (!st.playing && !reduced) st.playing = true;
      draw();
    });
    bPlay.addEventListener('click', function () { st.playing = !st.playing; draw(); });
    bReset.addEventListener('click', function () { st.mode = ''; st.light = true; restart(); });
    bDef.addEventListener('click', function () {
      P.g0 = DEF.g0; P.tau = DEF.tau; P.Dp = DEF.Dp; P.xr = DEF.xr; P.speed = DEF.speed;
      sG.input.value = 19; sT.input.value = 1; sD.input.value = 12; sX.input.value = 1;
      [sG, sT, sD, sX].forEach(function (s) { s.show(); });
      st.light = true; restart();
    });

    function prune() { // drop on/off pairs that ended long ago (their contributions cancel to < e^-30)
      var ev = st.events;
      while (ev.length >= 2 && ev[0].on && !ev[1].on && st.t - ev[1].t > 30 * P.tau) ev.splice(0, 2);
    }

    var last = null, alive = true;
    function frame(ts) {
      if (!alive) return;
      if (!root.isConnected) { alive = false; return; }
      var dtR = last == null ? 0 : Math.min(0.05, (ts - last) / 1000); last = ts;
      if (st.playing && geo.X) {
        var dtS = dtR * P.speed * P.tau;
        st.t += dtS; prune();
        stepParts(dtR, dtS);
        draw();
      }
      if (kctl) kctl.refresh();
      requestAnimationFrame(frame);
    }
    var rt;
    function layout() {
      grid.classList.toggle('narrow', root.clientWidth < 760);
      clearParts();
      build();
    }
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
    layout();
    requestAnimationFrame(frame);
  }

  window.IX[ID] = mount;
})();
