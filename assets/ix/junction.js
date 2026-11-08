/* Interactive module "junction": The PN junction forms, a thought experiment (Ch5).
   Physics: depletion approximation (Ch5 eqs 5.15-5.19) with the barrier phi built so far in place of V_d;
   phi(t) evolves as d phi/dt ~ [diffusion over the barrier - minority drift] (Ch5 sec. 5.2-5.4, Ch6 four-flux picture),
   converging to V_d = (kT/q) ln(N_A N_D / n_i^2) (eq 5.13). Time is qualitative (logarithmic). */
(function () {
  'use strict';
  var ID = 'junction';
  var q = 1.602e-19, EPS = 11.7 * 8.854e-14, NI = 1e10, VT = 0.0259, EG = 1.12; // course values (Ch5 Table 5.1: kT/q = 25.9 mV)
  var XMIN = -0.3, XMAX = 0.5; // um, shared x axis of the physics panels
  var VB_MIN = -1, VB_MAX = 0.6; // V, bias applied after formation (Handoff 4)
  var CARRIER = 0.3, PACE = 0.6; // carriers 3.3x slower than in v2, formation pace 0.6 (Handoff 4)
  var LAMBDA = 0.06; // um, drawn decay length of the carriers that spill over (pedagogical, not to scale)
  var S_APART = 2.2, S_FORM = 22, S_HOLD = 1.5, S_END = S_APART + S_FORM + S_HOLD;
  var COL = { text: '#1d2430', grey: '#6B6B6B', navy: '#1F3A5F', acc: '#D9771A', el: '#1F4E9A', ho: '#C8641E',
    fld: '#2E7D4F', accep: '#5B6B82', donor: '#D9771A', border: '#dde3ea', scr: '#e9edf2' };
  var PRESETS = [
    { NA: 1e18, ND: 1e16, label: 'P⁺N: 10¹⁸ / 10¹⁶', note: 'running example' },
    { NA: 1e17, ND: 1e16, label: '10¹⁷ / 10¹⁶', note: '' },
    { NA: 1e16, ND: 1e16, label: 'symmetric 10¹⁶ / 10¹⁶', note: '' }
  ];
  var STAGES = [
    { f: -1, name: 'Apart', watch: 'Two neutral pieces, apart. N is full of electrons, P full of holes; their Fermi levels differ by q<i>V</i><sub>d</sub>. Nothing flows, no field.' },
    { f: 0, name: 'Contact', watch: 'Contact (t = 0): huge density gradients and no field yet. Diffusion is the only motion: holes P → N, electrons N → P.' },
    { f: 0.04, name: 'Diffusion & recombination', watch: 'Carriers that cross recombine (×) on the far side, so they are not replaced. Watch the ions they leave behind.' },
    { f: 0.18, name: 'Ions uncovered', watch: 'Uncovered ions: − acceptors on P, + donors on N, equal charges. They create a field ℰ pointing from N to P.' },
    { f: 0.45, name: 'Field builds', watch: 'The field grows with the charge: ρ blocks widen, the ℰ triangle and V(x) grow, the bands bend and the two E<sub>F</sub> approach.' },
    { f: 0.8, name: 'Drift grows', watch: 'Drift pushes carriers back; diffusion over the barrier falls as e<sup>−qφ/kT</sup>. The net crossing flux shrinks.' },
    { f: 1, name: 'Equilibrium', watch: 'Equilibrium: drift = diffusion for each carrier, net current zero. E<sub>F</sub> is flat, the step is q<i>V</i><sub>d</sub>.' }
  ];

  var CSS = '' +
    '.ix-junction{color:#1d2430;font-family:inherit;line-height:1.35;user-select:none;-webkit-user-select:none}' +
    '.ix-junction .ixj-top{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:0 0 8px}' +
    '.ix-junction .ixj-grp{display:flex;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.ix-junction button{font:inherit;font-size:13.5px;padding:5px 11px;border:1px solid #c9d2dd;border-radius:6px;background:#fff;color:#1F3A5F;cursor:pointer}' +
    '.ix-junction button:hover{border-color:#1F3A5F}' +
    '.ix-junction button.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}' +
    '.ix-junction button.play{min-width:76px;font-weight:600}' +
    '.ix-junction label{font-size:13px;color:#6B6B6B;display:flex;align-items:center;gap:6px}' +
    '.ix-junction input[type=range]{accent-color:#D9771A;width:110px}' +
    '.ix-junction .ixj-time{flex:1 1 220px;display:flex;align-items:center;gap:8px;font-size:13px;color:#6B6B6B}' +
    '.ix-junction .ixj-time input{flex:1;width:auto;min-width:100px}' +
    '.ix-junction .ixj-watch{background:#fbf3ea;border-left:4px solid #D9771A;border-radius:6px;padding:7px 11px;margin:4px 0 8px;font-size:14px;min-height:2.7em}' +
    '.ix-junction .ixj-watch b{color:#1F3A5F}' +
    '.ix-junction .ixj-read{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}' +
    '.ix-junction .ixj-read div{border:1px solid #dde3ea;border-radius:6px;padding:4px 9px;font-size:13px;background:#fff;min-width:88px}' +
    '.ix-junction .ixj-read span{display:block;color:#6B6B6B;font-size:11.5px}' +
    '.ix-junction .ixj-read strong{font-weight:600;color:#1d2430;font-variant-numeric:tabular-nums}' +
    '.ix-junction .ixj-svgwrap{border:1px solid #dde3ea;border-radius:6px;background:#fff;overflow:hidden}' +
    '.ix-junction svg{display:block;width:100%;height:auto;font-family:inherit}' +
    '.ix-junction .ixj-cap{font-size:12.5px;color:#6B6B6B;margin:6px 2px 0}' +
    '.ix-junction .ixj-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;color:#1d2430;margin:0 0 6px}' +
    '.ix-junction .ixj-legend svg{display:inline-block;width:auto;vertical-align:middle;margin-right:4px}' +
    '@media (max-width:520px){.ix-junction .ixj-read div{min-width:0;flex:1 1 30%}.ix-junction button{padding:5px 8px}}';

  function injectCSS() {
    if (document.getElementById('ix-' + ID + '-css')) return;
    var st = document.createElement('style');
    st.id = 'ix-' + ID + '-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // ---------- physics ----------
  function makeModel(p) {
    var NA = p.NA, ND = p.ND;
    var Vd = VT * Math.log(NA * ND / (NI * NI)); // eq 5.13
    var m = { NA: NA, ND: ND, Vd: Vd,
      dEn: VT * Math.log(ND / NI), dEp: VT * Math.log(NA / NI) }; // eq 5.4: E_F - E_i (N), E_i - E_F (P)
    m.geom = function (phi) { // eq 5.18, 5.19 with phi in place of V_d (cm)
      phi = Math.max(phi, 0);
      var W = Math.sqrt(2 * EPS * phi / q * (1 / NA + 1 / ND));
      var xn = W * NA / (NA + ND), xp = -W * ND / (NA + ND);
      return { phi: phi, W: W, xn: xn, xp: xp, Em: q * ND * xn / EPS };
    };
    m.eq = m.geom(Vd);
    m.V = function (g, xcm) { // eq 5.15, N side grounded, V_P = -phi
      if (xcm <= g.xp) return -g.phi;
      if (xcm >= g.xn) return 0;
      if (xcm < 0) return q * NA / (2 * EPS) * (xcm - g.xp) * (xcm - g.xp) - g.phi;
      return -q * ND / (2 * EPS) * (xcm - g.xn) * (xcm - g.xn);
    };
    m.E = function (g, xcm) { // field, V/cm (negative: points from N to P)
      if (xcm <= g.xp || xcm >= g.xn) return 0;
      if (xcm < 0) return -q * NA / EPS * (xcm - g.xp);
      return q * ND / EPS * (xcm - g.xn);
    };
    // fluxes in units of the minority drift flux at equilibrium (Ch6 four-flux picture)
    m.diff = function (phi) { return Math.exp((Vd - phi) / VT); };
    m.drift = function (phi) { return 1 - Math.exp(-phi / VT); };
    // phi(u), u = log10(t / t_relax): d phi/dT = VT sqrt(phi/Vd) [diff - drift]  (C(phi) ~ 1/sqrt(phi): Q ~ sqrt(phi), eq 5.18)
    var U0 = -(Vd / VT) / Math.LN10 - 0.7, U1 = 1.6, N = 2400;
    var tab = new Float64Array(N + 1), phi = 1e-7 * Vd, du = (U1 - U0) / N;
    function rate(u, f) { var T = Math.pow(10, u); return Math.LN10 * T * VT * Math.sqrt(Math.max(f, 0) / Vd) * (m.diff(f) - m.drift(f)); }
    tab[0] = phi;
    for (var i = 0; i < N; i++) {
      var u = U0 + i * du, sub = 16, h = du / sub;
      for (var k = 0; k < sub; k++) {
        var uu = u + k * h;
        var k1 = rate(uu, phi), k2 = rate(uu + h / 2, phi + h / 2 * k1), k3 = rate(uu + h / 2, phi + h / 2 * k2), k4 = rate(uu + h, phi + h * k3);
        phi += h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
        if (phi > Vd) phi = Vd;
      }
      tab[i + 1] = phi;
    }
    m.phiAtFrac = function (fr) { // fr in [0,1] of the formation
      if (fr <= 0) return 0;
      if (fr >= 1) return Vd;
      var x = fr * N, i = Math.floor(x), a = x - i;
      return tab[i] * (1 - a) + tab[Math.min(i + 1, N)] * a;
    };
    m.fracAtPhi = function (target) {
      for (var i = 0; i <= N; i++) if (tab[i] >= target) return i / N;
      return 1;
    };
    return m;
  }

  // ---------- helpers ----------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function fmt(x, d) { return x.toFixed(d).replace('-', '−'); }
  function it(s) { return '<tspan font-style="italic">' + s + '</tspan>'; }
  function sb(s) { return '<tspan baseline-shift="sub" font-size="72%">' + s + '</tspan>'; }
  function sp(s) { return '<tspan baseline-shift="super" font-size="72%">' + s + '</tspan>'; }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.fs || 12) + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + ' fill="' + (o.fill || COL.text) + '"' +
      (o.w ? ' font-weight="' + o.w + '"' : '') + (o.extra || '') + '>' + s + '</text>';
  }
  function line(x1, y1, x2, y2, st, w, dash) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
      '" stroke="' + st + '" stroke-width="' + (w || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function arrow(x1, y, x2, color, w, dash) { // horizontal arrow from x1 to x2
    var dir = x2 > x1 ? 1 : -1, len = Math.abs(x2 - x1);
    if (len < 1) return '';
    var hl = Math.min(8 + w, len * 0.9), hw = 3.2 + w;
    var xe = x2 - dir * hl;
    return line(x1, y, xe, y, color, w, dash) +
      '<path d="M' + x2.toFixed(1) + ' ' + y.toFixed(1) + 'L' + xe.toFixed(1) + ' ' + (y - hw).toFixed(1) + 'L' + xe.toFixed(1) + ' ' + (y + hw).toFixed(1) + 'Z" fill="' + color + '"/>';
  }
  function circ(x, y, r) { return 'M' + (x - r).toFixed(1) + ' ' + y.toFixed(1) + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0'; }
  function sq(x, y, a) { return 'M' + (x - a).toFixed(1) + ' ' + (y - a).toFixed(1) + 'h' + (2 * a) + 'v' + (2 * a) + 'h' + (-2 * a) + 'z'; }

  // ---------- mount ----------
  function mount(root) {
    injectCSS();
    root.innerHTML = '';
    root.classList.add('ix-' + ID);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var st = { preset: 0, s: 0, playing: !reduce, speed: 1, V: 0, model: null, last: 0, removed: 0, events: [], flashes: [], alt: 0, stage: -2 };
    st.model = makeModel(PRESETS[0]);

    // --- DOM ---
    var top = document.createElement('div'); top.className = 'ixj-top';
    top.innerHTML =
      '<div class="ixj-grp"><button class="play"></button><button data-a="step" title="Jump to the next stage">Step ▸|</button><button data-a="reset">Reset</button></div>' +
      '<div class="ixj-grp ixj-pre"></div>' +
      '<div class="ixj-time">time <input type="range" min="0" max="1000" step="1" value="0" data-a="time" aria-label="time (qualitative)"><span class="tl">apart</span></div>';
    root.appendChild(top);
    var pre = top.querySelector('.ixj-pre');
    PRESETS.forEach(function (p, i) {
      var b = document.createElement('button'); b.textContent = p.label; b.title = 'N_A = ' + p.NA.toExponential(0) + ', N_D = ' + p.ND.toExponential(0) + ' cm^-3' + (p.note ? ' (' + p.note + ')' : '');
      b.addEventListener('click', function () { setPreset(i); });
      pre.appendChild(b);
    });
    var watch = document.createElement('div'); watch.className = 'ixj-watch'; root.appendChild(watch);
    var read = document.createElement('div'); read.className = 'ixj-read'; root.appendChild(read);
    var legend = document.createElement('div'); legend.className = 'ixj-legend';
    legend.innerHTML =
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.5" fill="#fff" stroke="' + COL.ho + '" stroke-width="1.8"/></svg>hole</span>' +
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.5" fill="' + COL.el + '"/></svg>electron</span>' +
      '<span><svg width="16" height="14"><rect x="2" y="2" width="11" height="11" fill="#fff" stroke="' + COL.accep + '" stroke-width="1.5"/><line x1="4.5" y1="7.5" x2="10.5" y2="7.5" stroke="' + COL.accep + '" stroke-width="1.6"/></svg>acceptor ion N<sub>A</sub><sup>−</sup></span>' +
      '<span><svg width="16" height="14"><rect x="2" y="2" width="11" height="11" fill="#fff" stroke="' + COL.donor + '" stroke-width="1.5"/><path d="M4.5 7.5h6M7.5 4.5v6" stroke="' + COL.donor + '" stroke-width="1.6"/></svg>donor ion N<sub>D</sub><sup>+</sup></span>' +
      '<span><svg width="22" height="14"><path d="M20 7H6" stroke="' + COL.fld + '" stroke-width="2"/><path d="M2 7l6-4v8z" fill="' + COL.fld + '"/></svg>field ℰ</span>' +
      '<span><svg width="16" height="14"><path d="M3 3l9 9M12 3l-9 9" stroke="#8a1c1c" stroke-width="1.8"/></svg>recombination</span>';
    root.appendChild(legend);
    var wrap = document.createElement('div'); wrap.className = 'ixj-svgwrap'; root.appendChild(wrap);
    var cap = document.createElement('div'); cap.className = 'ixj-cap'; root.appendChild(cap);

    var btnPlay = top.querySelector('.play');
    var tsl = top.querySelector('[data-a=time]'), tlab = top.querySelector('.tl');
    btnPlay.addEventListener('click', function () { st.playing = !st.playing; if (st.playing && st.s >= S_END - 0.01) { st.V = 0; restart(); } syncButtons(); });
    top.querySelector('[data-a=step]').addEventListener('click', function () { st.playing = false; st.V = 0; stepStage(); syncButtons(); });
    top.querySelector('[data-a=reset]').addEventListener('click', function () { st.V = 0; restart(); st.playing = false; syncButtons(); frame(true); });
    tsl.addEventListener('input', function () { st.V = 0; setS(+tsl.value / 1000 * S_END, true); frame(true); });

    // --- Handoff 4: bias after formation, regime buttons and Speed, one synchronised copy next to each panel ---
    var K = window.IX._kit, ctl = null;
    function formed() { return st.s >= S_APART + S_FORM; }
    function setBias(v) { // the junction is formed first, then V is applied (V on P, N grounded)
      v = clamp(Math.round(v * 100) / 100, VB_MIN, VB_MAX);
      var was = formed();
      st.V = v; st.playing = false;
      if (!was) st.s = S_END;
      rebuildCarriers(); syncButtons(); frame(true);
    }
    if (K) {
      ctl = K.controls({
        sliders: [{ key: 'V', label: 'bias <i>V</i>', aria: 'Bias V applied to P after the junction has formed (N grounded)', title: 'Bias applied to P once the junction has formed (N grounded)',
          min: VB_MIN, max: VB_MAX, step: 0.01, get: function () { return st.V; }, set: setBias,
          fmt: function (v) { return (v > 0.004 ? '+' : v < -0.004 ? '−' : '') + Math.abs(v).toFixed(2) + ' V'; } }],
        regimes: [
          { label: 'Forward', title: 'Formed junction under forward bias V = +0.6 V: the barrier falls to V_d − V, diffusion beats drift', apply: function () { setBias(0.6); }, is: function () { return formed() && st.V === 0.6; } },
          { label: 'Equilibrium (0 V)', title: 'The junction fully formed, at equilibrium (V = 0): diffusion = drift, E_F flat', apply: function () { setBias(0); }, is: function () { return formed() && st.V === 0; } },
          { label: 'Reverse', title: 'Formed junction under reverse bias V = −1 V (the SCR then still fits in the drawn x range): the barrier rises to V_d + 1 V', apply: function () { setBias(-1); }, is: function () { return formed() && st.V === -1; } }
        ],
        speed: { get: function () { return st.speed; }, set: function (v) { st.speed = v; } }
      });
      top.appendChild(ctl.strip({ top: true, sliders: true }));
    }

    function syncButtons() {
      btnPlay.textContent = st.playing ? '❚❚ Pause' : '▶ Play';
      btnPlay.classList.toggle('on', st.playing);
      Array.prototype.forEach.call(pre.children, function (b, i) { b.classList.toggle('on', i === st.preset); });
    }

    // --- layout ---
    var L = {}, svg = null, gDyn = null;
    function layout() {
      var w = Math.max(300, Math.round(wrap.clientWidth || root.clientWidth || 760));
      var phone = w < 560;
      L.w = w; L.phone = phone;
      L.ML = phone ? 40 : 66; L.MR = phone ? 10 : 16;
      L.PW = w - L.ML - L.MR;
      L.ppu = L.PW / (XMAX - XMIN); // px per um
      L.J = L.ML + (0 - XMIN) * L.ppu;
      L.spN = clamp(L.PW / 34, 11, 28);
      var y = 8;
      // (a) cartoon
      L.a = { top: y }; y += 18; L.a.fy = y + 7; y += 16; L.a.by0 = y; L.BH = Math.round(Math.max(phone ? 92 : 100, L.spN * 4.6)); y += L.BH; L.a.by1 = y;
      y += 8; L.b = { top: y }; y += 14; L.b.r1 = y + 9; y += 22; L.b.r2 = y + 9; y += 24;
      // (c) rho, E, V
      var hc = phone ? 62 : 72, TS = 17;
      var hr = hc + (st.model.NA / st.model.ND > 1.5 ? 20 : 0);
      y += 4 + TS; L.rho = { top: y, h: hr }; y += hr + TS + 4;
      L.E = { top: y, h: hc }; y += hc + TS + 4;
      L.V = { top: y, h: hc }; y += hc + TS + 8;
      // (d) bands
      L.bd = { top: y, h: phone ? 170 : 200 }; y += L.bd.h + TS + 8;
      // (e) densities
      L.n = { top: y, h: phone ? 100 : 118 }; y += L.n.h;
      L.axis = y; y += 34;
      L.h = y;
      L.gapMax = phone ? 14 : 26;
      var r = st.model.NA / st.model.ND;
      L.rc = Math.min(r, L.spN >= 20 ? 4 : 2.25); // cartoon density ratio N_A/N_D (exaggeration)
      L.spP = L.spN / Math.sqrt(L.rc);
      L.kP = r / L.rc; // the P side (x < 0) of every panel is drawn stretched by kP, as the P part of the SCR in the cartoon
      buildSVG();
      initParticles();
    }
    function xpx(xum) { return L.J + xum * L.ppu * (xum < 0 ? L.kP : 1); } // stretched P side (L.kP), N side to scale
    function xLeft() { return XMIN / L.kP; } // true position (um) of the left edge of the panels

    function buildSVG() {
      var w = L.w, h = L.h, s = '';
      s += '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Formation of a PN junction: cartoon, fluxes, charge, field, potential, bands and densities on one x axis">';
      s += '<defs><clipPath id="ixjclip' + uid + '"><rect x="' + L.ML + '" y="0" width="' + L.PW + '" height="' + h + '"/></clipPath></defs>';
      s += '<g class="dyn"></g></svg>';
      wrap.innerHTML = s;
      svg = wrap.firstChild;
      gDyn = svg.querySelector('.dyn');
      if (window.IX._kit && ctl) window.IX._kit.slice(svg, [L.rho.top - 20, L.bd.top - 15, L.n.top - 16], function (k) {
        return ctl.strip({ inside: true, tag: ['(a)–(b)', '(c)', '(d)', '(e)'][k] });
      });
    }
    var uid = Math.random().toString(36).slice(2, 8);

    // --- particles ---
    var ionsN = [], ionsP = [], carriers = [];
    function initParticles() {
      ionsN = []; ionsP = [];
      var a = L.a, BH = L.BH;
      var nrN = Math.max(2, Math.floor(BH / L.spN)), offN = (BH - nrN * L.spN) / 2 + L.spN / 2;
      for (var x = L.J + L.spN / 2; x < L.ML + L.PW - 3; x += L.spN)
        for (var j = 0; j < nrN; j++) ionsN.push({ x: x, y: a.by0 + offN + j * L.spN });
      var nrP = Math.max(2, Math.floor(BH / L.spP)), offP = (BH - nrP * L.spP) / 2 + L.spP / 2;
      for (x = L.J - L.spP / 2; x > L.ML + 3; x -= L.spP)
        for (j = 0; j < nrP; j++) ionsP.push({ x: x, y: a.by0 + offP + j * L.spP });
      ionsN.sort(function (u, v) { return u.x - v.x || u.y - v.y; });
      ionsP.sort(function (u, v) { return v.x - u.x || u.y - v.y; });
      L.rN = clamp(L.spN * 0.2, 2.6, 5); L.rP = clamp(L.spP * 0.27, 2.4, 5);
      L.aN = clamp(L.spN * 0.2, 2.4, 5.2); L.aP = clamp(L.spP * 0.22, 1.8, 5.2);
      rebuildCarriers();
    }
    function targetRemoved(g) {
      var xnpx = g.xn * 1e4 * L.ppu, xppx = xnpx / L.rc, kn = 0, kp = 0, i;
      for (i = 0; i < ionsN.length; i++) if (ionsN[i].x < L.J + xnpx) kn++;
      for (i = 0; i < ionsP.length; i++) if (ionsP[i].x > L.J - xppx) kp++;
      return Math.round((kn + kp) / 2);
    }
    function rebuildCarriers() {
      var g = st.model.geom(curPhi());
      var R = st.s > S_APART ? targetRemoved(g) : 0;
      carriers = []; st.events = []; st.flashes = [];
      var xnpx = g.xn * 1e4 * L.ppu, xppx = xnpx / L.rc;
      var i, n = ionsN.length - R, p = ionsP.length - R;
      for (i = 0; i < n; i++) carriers.push(newCarrier('e', L.J + xnpx + 3 + Math.random() * (L.ML + L.PW - L.J - xnpx - 6)));
      for (i = 0; i < p; i++) carriers.push(newCarrier('h', L.ML + 3 + Math.random() * (L.J - xppx - L.ML - 6)));
      st.removed = R;
    }
    function newCarrier(t, x) {
      var ang = Math.random() * 6.283;
      return { t: t, x: x, y: L.a.by0 + 4 + Math.random() * (L.BH - 8), vx: Math.cos(ang) * 20, vy: Math.sin(ang) * 20, st: 0 };
    }

    // --- time / state ---
    function curFrac() { return clamp((st.s - S_APART) / S_FORM, 0, 1); }
    function curPhi() { if (st.s >= S_APART + S_FORM && st.V) return Math.max(st.model.Vd - st.V, 0.02); return st.s <= S_APART ? 0 : st.model.phiAtFrac(curFrac()); }
    function gapNow() { // pieces slide together before contact
      if (st.s >= S_APART) return 0;
      var a = clamp((st.s - 0.6) / (S_APART - 0.6), 0, 1);
      return L.gapMax * (1 - a * a * (3 - 2 * a));
    }
    function restart() { st.s = 0; rebuildCarriers(); }
    function setS(s, jump) {
      st.s = clamp(s, 0, S_END);
      if (jump) rebuildCarriers();
    }
    function sOfStage(k) {
      var f = STAGES[k].f;
      if (f < 0) return 0;
      if (f === 0) return S_APART + 0.001;
      if (f >= 1) return S_APART + S_FORM + 0.2;
      return S_APART + st.model.fracAtPhi(f * st.model.Vd) * S_FORM;
    }
    function stageIndex() {
      if (st.s < S_APART) return 0;
      if (st.s >= S_APART + S_FORM) return 6;
      var f = curPhi() / st.model.Vd, k = 1;
      for (var i = 2; i < 6; i++) if (f >= STAGES[i].f) k = i;
      if (f > 0.995) k = 6;
      return k;
    }
    function stepStage() {
      var k = stageIndex();
      var nk = k >= 6 ? 0 : k + 1;
      setS(sOfStage(nk), true);
      frame(true);
    }
    function setPreset(i) {
      st.preset = i; st.model = makeModel(PRESETS[i]); st.V = 0;
      layout(); setCaption(); restart(); syncButtons(); frame(true);
    }

    // --- particle dynamics ---
    function stepParticles(dt, g) {
      var xnpx = g.xn * 1e4 * L.ppu, xppx = xnpx / L.rc;
      var eN = L.J + xnpx, eP = L.J - xppx;
      var y0 = L.a.by0 + 3, y1 = L.a.by1 - 3, xL = L.ML + 3, xR = L.ML + L.PW - 3;
      var Erel = g.Em / st.model.eq.Em;
      var vth = 34, i, c, gapW = gapNow();
      // schedule recombination events
      if (st.s > S_APART) {
        var target = targetRemoved(g);
        var pending = st.events.length;
        var maxConc = L.phone ? 14 : 24;
        // lead: carriers already crossing before the charge they will leave behind is due; it follows the net flux
        // of panel (b) (diffusion over the barrier ~ e^{-q phi/kT}), so there is a burst at contact that dies away
        var lead = st.s < S_APART + S_FORM ? Math.round((L.phone ? 8 : 14) * Math.exp(-g.phi / VT)) : 0;
        while (st.removed + pending < target + lead && pending < maxConc) {
          if (!launchEvent(eN, eP)) break;
          pending = st.events.length;
        }
      }
      // forward bias: carriers injected over the lowered barrier (cartoon of the forward current)
      if (st.s >= S_APART + S_FORM && st.V > 0) {
        var nInj = 0;
        for (i = 0; i < carriers.length; i++) if (carriers[i].inj && !carriers[i].dead) nInj++;
        st.injAcc = (st.injAcc || 0) + dt * 10 * Math.pow(clamp((st.V - 0.2) / 0.4, 0, 1), 2);
        while (st.injAcc >= 1) { st.injAcc -= 1; if (nInj < (L.phone ? 5 : 8) && launchInjection(eN, eP)) nInj++; }
      } else st.injAcc = 0;
      for (i = 0; i < carriers.length; i++) {
        c = carriers[i];
        if (c.st === 0) { // free random walk
          c.vx += (Math.random() - 0.5) * 140 * dt * 6; c.vy += (Math.random() - 0.5) * 140 * dt * 6;
          var sp2 = Math.sqrt(c.vx * c.vx + c.vy * c.vy); if (sp2 > vth) { c.vx *= vth / sp2; c.vy *= vth / sp2; }
          if (c.t === 'e') {
            if (c.x < eN) { c.vx += (60 + 260 * Erel) * dt * (eN - c.x > 4 ? 1.6 : 1); } // drift pushes electrons back to N
            if (st.s <= S_APART && c.x < L.J + gapW + 3) { c.x = L.J + gapW + 3; c.vx = Math.abs(c.vx); }
          } else {
            if (c.x > eP) { c.vx -= (60 + 260 * Erel) * dt * (c.x - eP > 4 ? 1.6 : 1); } // drift pushes holes back to P
            if (st.s <= S_APART && c.x > L.J - gapW - 3) { c.x = L.J - gapW - 3; c.vx = -Math.abs(c.vx); }
          }
          c.x += c.vx * dt; c.y += c.vy * dt;
          if (c.t === 'e' && c.x < L.J + 1) { c.x = L.J + 1; c.vx = Math.abs(c.vx); }
          if (c.t === 'h' && c.x > L.J - 1) { c.x = L.J - 1; c.vx = -Math.abs(c.vx); }
        } else if (c.st === 1) { // crossing towards its partner
          var p = c.partner, dx = p.x - c.x, dy = p.y - c.y, d = Math.sqrt(dx * dx + dy * dy);
          var v = 70;
          if (d < 4) {
            c.st = 2; p.st = 2; st.flashes.push({ x: (c.x + p.x) / 2, y: (c.y + p.y) / 2, t: 0 }); c.dead = p.dead = true;
            if (c.inj) { // forward current: the contacts replace the pair that recombined
              carriers.push(newCarrier('e', xR - 2 - Math.random() * 12));
              carriers.push(newCarrier('h', xL + 2 + Math.random() * 12));
            } else st.removed++;
          }
          else { c.x += dx / d * v * dt; c.y += dy / d * v * dt; }
        } else if (c.st === 4) { // injected under forward bias: crosses the SCR, then looks for a partner
          var dir = c.tx > c.x ? 1 : -1;
          c.x += dir * (c.ev ? 120 : 180) * dt; c.y += (Math.random() - 0.5) * 60 * dt;
          if ((c.tx - c.x) * dir <= 0) {
            var other = c.t === 'e' ? 'h' : 'e', bestP = null, bd = 1e9;
            for (var q2 = 0; q2 < carriers.length; q2++) {
              var o2 = carriers[q2]; if (o2.st !== 0 || o2.t !== other) continue;
              var dd = Math.abs(o2.x - c.x) + 0.5 * Math.abs(o2.y - c.y); if (dd < bd) { bd = dd; bestP = o2; }
            }
            if (bestP) { c.st = 1; c.partner = bestP; bestP.st = 3; } else { c.st = 0; c.inj = false; if (c.ev) { c.ev = false; st.events = st.events.filter(function (e) { return e.a !== c; }); } }
          }
        } else if (c.st === 3) { // partner waiting: slow jitter
          c.x += (Math.random() - 0.5) * 6 * dt; c.y += (Math.random() - 0.5) * 6 * dt;
        }
        if (c.y < y0) { c.y = y0; c.vy = Math.abs(c.vy); }
        if (c.y > y1) { c.y = y1; c.vy = -Math.abs(c.vy); }
        if (c.x < xL) { c.x = xL; c.vx = Math.abs(c.vx); }
        if (c.x > xR) { c.x = xR; c.vx = -Math.abs(c.vx); }
      }
      // remove dead
      var before = carriers.length;
      carriers = carriers.filter(function (c) { return !c.dead; });
      if (carriers.length !== before) st.events = st.events.filter(function (e) { return !e.dead; });
      st.events.forEach(function (e) { if (e.a.dead) e.dead = true; });
      st.events = st.events.filter(function (e) { return !e.dead; });
      for (i = 0; i < st.flashes.length; i++) st.flashes[i].t += dt;
      st.flashes = st.flashes.filter(function (f) { return f.t < 1.4; });
    }
    function launchInjection(eN, eP) {
      // holes into N and electrons into P, in the ratio N_A : N_D as drawn in the cartoon (L.rc)
      var mover = Math.random() < L.rc / (1 + L.rc) ? 'h' : 'e', best = null, i, c;
      for (i = 0; i < carriers.length; i++) {
        c = carriers[i]; if (c.st !== 0 || c.t !== mover) continue;
        if (!best || (mover === 'e' ? c.x < best.x : c.x > best.x)) best = c;
      }
      if (!best) return false;
      best.st = 4; best.inj = true;
      best.tx = mover === 'e' ? eP - 4 - Math.random() * 2.5 * L.spP : eN + 4 + Math.random() * 2.5 * L.spN;
      return true;
    }
    function launchEvent(eN, eP) {
      // alternate: an electron crosses into P and recombines with a hole there, or a hole crosses into N
      var mover = st.alt % 2 === 0 ? 'e' : 'h';
      st.alt++;
      var best = null, i, c;
      for (i = 0; i < carriers.length; i++) {
        c = carriers[i]; if (c.st !== 0) continue;
        if (c.t === mover && (!best || (mover === 'e' ? c.x < best.x : c.x > best.x))) best = c;
      }
      if (!best) return false;
      // it diffuses a short drawn distance into the far side before it meets a majority carrier there (st 4, then st 1)
      best.st = 4; best.ev = true;
      best.tx = mover === 'e' ? Math.min(eP, L.J) - 6 - Math.random() * 2.5 * L.spP : Math.max(eN, L.J) + 6 + Math.random() * 2.5 * L.spN;
      st.events.push({ a: best });
      return true;
    }

    // --- drawing ---
    function frame(force) {
      if (!svg) return;
      var m = st.model, phi = curPhi(), g = m.geom(phi), gap = gapNow();
      var frac = phi / m.Vd, apart = st.s < S_APART, eq = st.s >= S_APART + S_FORM;
      var s = '';
      s += drawCartoon(g, gap, apart);
      s += drawGauge(g, apart);
      s += drawRho(g, apart);
      s += drawE(g, apart);
      s += drawV(g, apart);
      s += drawBands(g, gap, apart);
      s += drawDens(g, gap, apart);
      s += drawAxis(g);
      gDyn.innerHTML = s;
      // readouts
      var k = stageIndex();
      var wkey = k + '|' + (eq ? st.V : 0);
      if (wkey !== st.stage || force) {
        st.stage = wkey;
        if (eq && st.V > 0) watch.innerHTML = '<b>What to watch — forward bias V = +' + fmt(st.V, 2) + ' V:</b> the barrier falls to V<sub>d</sub> − V = ' + fmt(phi, 3) + ' V, the SCR narrows and E<sub>F</sub> splits by qV. Diffusion over the lower barrier grows as e<sup>V/V<sub>T</sub></sup>, drift does not change: a net current flows. In (e) the magnified minority edges n<sub>p0</sub>e<sup>V/V<sub>T</sub></sup> and p<sub>n0</sub>e<sup>V/V<sub>T</sub></sup> grow ×10 every 60 mV.';
        else if (eq && st.V < 0) watch.innerHTML = '<b>What to watch — reverse bias V = −' + fmt(-st.V, 2) + ' V:</b> the barrier rises to V<sub>d</sub> + |V| = ' + fmt(phi, 3) + ' V, the SCR widens and uncovers more ions, the field grows. Diffusion dies away; only the small drift of minority carriers is left (−I<sub>0</sub>).';
        else watch.innerHTML = '<b>What to watch — ' + STAGES[k].name + ':</b> ' + STAGES[k].watch;
      }
      var ratio = apart ? null : m.diff(phi) / Math.max(m.drift(phi), 1e-300);
      read.innerHTML =
        ro('barrier φ (V)', apart ? '0' : fmt(phi, 3), 'V<sub>d</sub> = ' + fmt(m.Vd, 3)) +
        ro('SCR width W (µm)', fmt(g.W * 1e4, 3), 'eq. ' + fmt(m.eq.W * 1e4, 3)) +
        ro('W<sub>n</sub> | W<sub>p</sub>', fmt(g.xn * 1e4, 3) + ' µm | ' + fmtLen(-g.xp), '') +
        ro('ℰ<sub>max</sub> (kV/cm)', fmt(g.Em / 1e3, 1), 'eq. ' + fmt(m.eq.Em / 1e3, 1)) +
        ro('diffusion / drift', apart ? '—' : ((eq && !st.V) || Math.abs(ratio - 1) < 0.0005 ? '1 (balanced)' : fmtPow(ratio)), apart ? 'no contact' : (eq && !st.V ? 'net current 0' : 'net flux ≠ 0')) +
        ro('n<sub>p</sub>(x<sub>p</sub>) | p<sub>n</sub>(x<sub>n</sub>)', apart ? '—' : fmtSci(m.ND * Math.exp(-phi / VT)) + ' | ' + fmtSci(m.NA * Math.exp(-phi / VT)), apart ? '' : (eq && st.V ? 'cm⁻³, eq. × e<sup>V/V<sub>T</sub></sup>' : 'cm⁻³, minority at the SCR edges')) +
        ro(eq && st.V ? 'bias V (on P)' : 'time', apart ? 'before contact' : (eq ? (st.V ? (st.V > 0 ? '+' : '−') + fmt(Math.abs(st.V), 2) + ' V' : 'equilibrium') : 'log t: ' + fmt(curFrac() * 100, 0) + ' %'), eq && st.V ? (st.V > 0 ? 'forward' : 'reverse') : 'qualitative');
      tsl.value = Math.round(st.s / S_END * 1000);
      tlab.textContent = apart ? 'apart' : eq ? (st.V ? 'formed, biased' : 'equilibrium') : 'forming';
    }
    function ro(lab, val, sub) { return '<div><span>' + lab + '</span><strong>' + val + '</strong>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }
    function fmtLen(cm) { var um = cm * 1e4; return um < 0.1 ? fmt(um * 1e3, 1) + ' nm' : fmt(um, 3) + ' µm'; }
    function fmtSci(v) { var e = Math.floor(Math.log10(v) + 1e-9), mn = v / Math.pow(10, e); if (mn >= 9.95) { mn /= 10; e++; } return mn.toFixed(1) + '×10' + supNum(e); }
    function fmtPow(r) {
      if (r < 1000 && r >= 0.01) return r.toFixed(r < 10 ? 2 : 0);
      var e = Math.floor(Math.log10(r)), mnt = r / Math.pow(10, e);
      return mnt.toFixed(1) + '×10' + supNum(e);
    }
    function supNum(n) { var m = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }; return String(n).split('').map(function (c) { return m[c]; }).join(''); }

    function title(y, s) { return txt(L.ML, y + 11, s, { fs: L.phone ? 11.5 : 12.5, w: 600, fill: COL.navy }); }

    function drawCartoon(g, gap, apart) {
      var a = L.a, s = '', BH = L.BH, by0 = a.by0, by1 = a.by1;
      var xnpx = g.xn * 1e4 * L.ppu, xppx = xnpx / L.rc;
      var xl = L.ML, xr = L.ML + L.PW;
      var wide = L.kP, wtag = wide > 1.5 ? '; P side stretched ×' + Math.round(wide) + ' as in (c)–(e)' : '';
      s += title(a.top, L.phone ? (wtag ? '(a) Cartoon (not to scale, P side ×' + Math.round(wide) + ')' : '(a) The bar (cartoon, not to scale)') : '(a) The bar: carriers and ions (cartoon, not to scale' + wtag + ')');
      // pieces
      s += '<rect x="' + xl.toFixed(1) + '" y="' + by0 + '" width="' + (L.J - gap - xl).toFixed(1) + '" height="' + BH + '" fill="#fdf6ef" stroke="#c9b9a8"/>';
      s += '<rect x="' + (L.J + gap).toFixed(1) + '" y="' + by0 + '" width="' + (xr - L.J - gap).toFixed(1) + '" height="' + BH + '" fill="#f1f5fb" stroke="#a9b8cc"/>';
      if (!apart && xnpx > 0.5) {
        s += '<rect x="' + (L.J - xppx).toFixed(1) + '" y="' + by0 + '" width="' + (xppx + xnpx).toFixed(1) + '" height="' + BH + '" fill="' + COL.scr + '" stroke="#9aa6b5" stroke-dasharray="3 3"/>';
      }
      // side labels
      s += txt(xl + 2, a.fy + 5, 'P', { fs: 14, w: 700, fill: COL.ho });
      s += txt(xr - 2, a.fy + 5, 'N', { anchor: 'end', fs: 14, w: 700, fill: COL.el });
      // ions
      var pc = '', pu = '', mc = '', mu = '', dc = '', du = '', pcov = '', pun = '';
      var i, o;
      for (i = 0; i < ionsP.length; i++) {
        o = ionsP[i]; if (o.x > L.J - gap - L.aP) continue;
        var unc = !apart && i < st.removed, X = o.x, A = L.aP; // ions are uncovered by the recombinations, one per pair
        if (unc) { pu += sq(X, o.y, A); mu += 'M' + (X - A * 0.6).toFixed(1) + ' ' + o.y.toFixed(1) + 'h' + (A * 1.2).toFixed(1); }
        else { pc += sq(X, o.y, A); mc += 'M' + (X - A * 0.6).toFixed(1) + ' ' + o.y.toFixed(1) + 'h' + (A * 1.2).toFixed(1); }
      }
      for (i = 0; i < ionsN.length; i++) {
        o = ionsN[i]; if (o.x < L.J + gap + L.aN) continue;
        var unc2 = !apart && i < st.removed, X2 = o.x, A2 = L.aN;
        var plus = 'M' + (X2 - A2 * 0.6).toFixed(1) + ' ' + o.y.toFixed(1) + 'h' + (A2 * 1.2).toFixed(1) + 'M' + X2.toFixed(1) + ' ' + (o.y - A2 * 0.6).toFixed(1) + 'v' + (A2 * 1.2).toFixed(1);
        if (unc2) { pun += sq(X2, o.y, A2); du += plus; } else { pcov += sq(X2, o.y, A2); dc += plus; }
      }
      s += '<path d="' + pc + '" fill="#fff" stroke="' + COL.accep + '" stroke-opacity="0.35" stroke-width="1"/><path d="' + mc + '" stroke="' + COL.accep + '" stroke-opacity="0.4" stroke-width="1.2"/>';
      s += '<path d="' + pcov + '" fill="#fff" stroke="' + COL.donor + '" stroke-opacity="0.35" stroke-width="1"/><path d="' + dc + '" stroke="' + COL.donor + '" stroke-opacity="0.4" stroke-width="1.2"/>';
      s += '<path d="' + pu + '" fill="#dfe5ee" stroke="' + COL.accep + '" stroke-width="1.5"/><path d="' + mu + '" stroke="' + COL.accep + '" stroke-width="1.7"/>';
      s += '<path d="' + pun + '" fill="#fbe7d3" stroke="' + COL.donor + '" stroke-width="1.5"/><path d="' + du + '" stroke="' + COL.donor + '" stroke-width="1.7"/>';
      // carriers
      var ph = '', pe = '';
      for (i = 0; i < carriers.length; i++) {
        var c = carriers[i], home = c.t === 'e' ? 1 : -1;
        var X3 = c.x;
        if (c.t === 'e') pe += circ(X3, c.y, L.rN); else ph += circ(X3, c.y, L.rP);
      }
      s += '<path d="' + ph + '" fill="#fff" fill-opacity="0.85" stroke="' + COL.ho + '" stroke-width="1.6"/>';
      s += '<path d="' + pe + '" fill="' + COL.el + '"/>';
      // recombination flashes
      st.flashes.forEach(function (f) {
        var k = f.t < 0.6 ? 1 : 1 - (f.t - 0.6) / 0.8, r = (f.t < 0.15 ? 3 + 30 * f.t : 7.5) * (L.phone ? 0.75 : 1);
        s += '<circle cx="' + f.x.toFixed(1) + '" cy="' + f.y.toFixed(1) + '" r="' + (r + 2.5).toFixed(1) + '" fill="#fff" opacity="' + (0.75 * k).toFixed(2) + '"/>';
        s += '<path d="M' + (f.x - r).toFixed(1) + ' ' + (f.y - r).toFixed(1) + 'l' + 2 * r + ' ' + 2 * r + 'M' + (f.x + r).toFixed(1) + ' ' + (f.y - r).toFixed(1) + 'l' + (-2 * r) + ' ' + 2 * r + '" stroke="#8a1c1c" stroke-width="2.6" stroke-linecap="round" opacity="' + k.toFixed(2) + '"/>';
      });
      // junction line
      if (!apart) s += line(L.J, by0 - 4, L.J, by1 + 4, '#7d8896', 1, '2 3');
      // field arrow above the bar
      if (!apart && g.Em > 0) {
        var Erel = g.Em / st.model.eq.Em;
        var x1 = L.J + xnpx, x0 = L.J - xppx, wA = 1 + 2.6 * Erel;
        if (x1 - x0 > 10) {
          s += '<g opacity="' + (0.35 + 0.65 * Erel).toFixed(2) + '">' + arrow(x1, a.fy, x0, COL.fld, wA) + '</g>';
          s += txt(x1 + 5, a.fy + 4, 'ℰ', { fs: 13, w: 700, fill: COL.fld });
          // small arrows inside the SCR
          var nr = Math.max(1, Math.floor(BH / (L.spN * 2)));
          for (var j = 0; j < nr; j++) {
            var yy = by0 + (j + 1) * BH / (nr + 1);
            var len = Math.min(x1 - x0 - 6, (x1 - x0) * (0.25 + 0.6 * Erel));
            if (len > 8) s += '<g opacity="' + (0.25 + 0.6 * Erel).toFixed(2) + '">' + arrow(L.J + len / 2 + (xnpx - xppx) / 4, yy + L.spN / 2, L.J - len / 2 + (xnpx - xppx) / 4, COL.fld, 1.4) + '</g>';
          }
        }
      }
      return s;
    }

    function drawGauge(g, apart) {
      var b = L.b, s = '', m = st.model;
      s += txt(L.ML, b.top + 9, (L.phone ? '(b) Crossing fluxes (log scale)' : '(b) Fluxes crossing the junction (log scale; unit: minority drift flux at equilibrium)'), { fs: L.phone ? 10.5 : 12, w: 600, fill: COL.navy });
      s += txt(L.ML - 6, b.r1 + 4, 'e⁻', { anchor: 'end', fs: 12, w: 600, fill: COL.el });
      s += txt(L.ML - 6, b.r2 + 4, 'h⁺', { anchor: 'end', fs: 12, w: 600, fill: COL.ho });
      s += line(L.J, b.r1 - 9, L.J, b.r2 + 9, '#9aa6b5', 1, '2 3');
      if (apart) {
        s += txt(L.J + 8, b.r1 + 13, 'no contact: no flux', { fs: 11.5, fill: COL.grey });
        return s;
      }
      var phi = g.phi, dec = m.Vd / VT / Math.LN10 + 1;
      var unit = (L.J - L.ML - 8) / dec;
      var lD = unit * Math.max(0, Math.log10(m.diff(phi)) + 1), lR = unit * Math.max(0, Math.log10(Math.max(m.drift(phi), 1e-30)) + 1);
      // electrons: diffusion N->P (towards -x), drift P->N
      s += arrow(L.J, b.r1 - 3, L.J - lD, COL.el, 2.4);
      s += arrow(L.J, b.r1 + 4, L.J + lR, COL.el, 2, '5 3');
      // holes: diffusion P->N, drift N->P
      s += arrow(L.J, b.r2 - 3, L.J + lD, COL.ho, 2.4);
      s += arrow(L.J, b.r2 + 4, L.J - lR, COL.ho, 2, '5 3');
      var fs = L.phone ? 10 : 11;
      var bal0 = (st.s >= S_APART + S_FORM && !st.V) || Math.abs(m.diff(phi) / m.drift(phi) - 1) < 0.0005;
      var dtxt = bal0 ? 'diffusion = drift' : 'diffusion 10' + supNum(Math.round(Math.log10(m.diff(phi) / m.drift(phi))));
      s += txt(L.J + Math.max(lD, lR) + 8, b.r2 + 1, dtxt, { fs: fs, fill: COL.ho });
      s += txt(L.J + lR + 8, b.r1 + 8, 'drift (dashed)', { fs: fs, fill: COL.el });
      var bal = bal0, rev = st.V < 0 && st.s >= S_APART + S_FORM;
      if (!L.phone || bal) s += txt(L.ML + L.PW, b.r1 + (L.phone ? 8 : 1), bal ? 'equilibrium: net current zero' : rev ? 'drift > diffusion: −I₀' : st.V > 0 ? 'diffusion > drift: forward current' : (phi < 3 * VT ? 'diffusion only' : 'diffusion > drift'), { anchor: 'end', fs: fs + 0.5, w: 600, fill: bal ? COL.fld : COL.acc });
      return s;
    }

    function axisFrame(P, lab, ticks, ymap, unit) {
      var s = '', y0 = P.top, y1 = P.top + P.h;
      s += '<rect x="' + L.ML + '" y="' + y0 + '" width="' + L.PW + '" height="' + P.h + '" fill="none" stroke="' + COL.border + '"/>';
      ticks.forEach(function (t) {
        var y = ymap(t.v);
        s += line(L.ML - 3, y, L.ML, y, '#9aa6b5', 1);
        s += txt(L.ML - 5, y + 3.5, t.l, { anchor: 'end', fs: L.phone ? 9.5 : 10.5, fill: COL.grey });
      });
      s += txt(L.ML, y0 - 5, lab, { fs: L.phone ? 11 : 12, w: 600, fill: COL.navy });
      return s;
    }
    function scrShade(P, g) {
      if (g.W <= 0) return '';
      var x0 = xpx(g.xp * 1e4), x1 = xpx(g.xn * 1e4);
      return '<rect x="' + x0.toFixed(1) + '" y="' + P.top + '" width="' + Math.max(0.5, x1 - x0).toFixed(1) + '" height="' + P.h + '" fill="' + COL.scr + '" opacity="0.7"/>';
    }
    function pathFrom(fx, fy, xs) {
      var d = '';
      for (var i = 0; i < xs.length; i++) d += (i ? 'L' : 'M') + fx(xs[i]).toFixed(1) + ' ' + fy(xs[i]).toFixed(1);
      return d;
    }
    function xsSCR(g, extra) { // sample points, dense in the SCR
      var xs = [], i, N = 160;
      var x0 = xLeft();
      for (i = 0; i <= 40; i++) xs.push(x0 + (g.xp * 1e4 - x0) * i / 40);
      for (i = 0; i <= N; i++) xs.push(g.xp * 1e4 + (g.xn - g.xp) * 1e4 * i / N);
      for (i = 0; i <= 40; i++) xs.push(g.xn * 1e4 + (XMAX - g.xn * 1e4) * i / 40);
      return xs;
    }

    function drawRho(g, apart) {
      var P = L.rho, m = st.model, s = '';
      var pmax = 1.35, nmax = Math.max(1.35, L.rc + 0.2), ymap = function (v) { return P.top + 4 + (pmax - clamp(v, -nmax, pmax)) / (pmax + nmax) * (P.h - 8); };
      s += scrShade(P, g);
      s += axisFrame(P, '(c) charge density ρ(x)', [{ v: 1, l: '+q' + 'N' }, { v: 0, l: '0' }, { v: -1, l: '−qN' }], ymap);
      s += line(L.ML, ymap(0), L.ML + L.PW, ymap(0), '#9aa6b5', 1);
      if (!apart && g.W > 0) {
        var r = m.NA / m.ND, x0 = xpx(g.xp * 1e4), x1 = xpx(g.xn * 1e4), yn = ymap(1), yp = ymap(-L.rc);
        s += '<rect x="' + L.J.toFixed(1) + '" y="' + yn.toFixed(1) + '" width="' + (x1 - L.J).toFixed(1) + '" height="' + (ymap(0) - yn).toFixed(1) + '" fill="' + COL.donor + '" fill-opacity="0.28" stroke="' + COL.donor + '" stroke-width="1.5"/>';
        var narrow = L.J - x0 < 5; if (narrow) x0 = L.J - 5; // a P block thinner than 5 px is drawn 5 px wide (true width in the label)
        s += '<rect x="' + x0.toFixed(1) + '" y="' + ymap(0).toFixed(1) + '" width="' + (L.J - x0).toFixed(1) + '" height="' + (yp - ymap(0)).toFixed(1) + '" fill="' + COL.accep + '" fill-opacity="0.3" stroke="' + COL.accep + '" stroke-width="1.5"/>';
        if (x1 - L.J > 36) s += txt((L.J + x1) / 2, yn + 13, '+qN' + sb('D'), { anchor: 'middle', fs: 11, fill: '#9a4f0c' });
        var lab = '−qN' + sb('A') + (r > L.rc ? (L.phone ? ' (drawn ×' + (+L.rc.toFixed(2)) + ', true ×' + Math.round(r) + ')' : ' (drawn ×' + (+L.rc.toFixed(2)) + ' over a ×' + Math.round(L.kP) + ' stretched width: true ×' + Math.round(r) + ', same charge)') : '');
        s += txt(L.J + 6, ymap(-0.8) + 3, lab, { fs: 10.5, fill: COL.accep });
      }
      s += txt(L.ML + L.PW, P.top - 5, 'N = N' + sb('D'), { anchor: 'end', fs: 10, fill: COL.grey });
      return s;
    }
    function drawE(g, apart) {
      var P = L.E, m = st.model, s = '';
      var Emax = Math.max(m.eq.Em, g.Em) / 1e3 * 1.12;
      var ymap = function (v) { return P.top + 6 + (0 - v) / Emax * (P.h - 12); };
      s += scrShade(P, g);
      var e = m.eq.Em / 1e3;
      s += axisFrame(P, '(c) field ℰ(x)', [{ v: 0, l: '0' }, { v: -e, l: fmt(-e, 0) }], ymap);
      s += txt(L.ML - 5, P.top + P.h + 9, 'kV/cm', { anchor: 'end', fs: 9, fill: COL.grey });
      s += line(L.ML, ymap(0), L.ML + L.PW, ymap(0), '#9aa6b5', 1);
      s += line(L.ML, ymap(-e), L.ML + L.PW, ymap(-e), '#cfd6df', 1, '3 3');
      if (!apart && g.W > 0) {
        var xs = [g.xp * 1e4, 0, g.xn * 1e4];
        var d = 'M' + xpx(xs[0]).toFixed(1) + ' ' + ymap(0).toFixed(1) + 'L' + L.J.toFixed(1) + ' ' + ymap(-g.Em / 1e3).toFixed(1) + 'L' + xpx(xs[2]).toFixed(1) + ' ' + ymap(0).toFixed(1);
        s += '<path d="' + d + 'Z" fill="' + COL.fld + '" fill-opacity="0.16" stroke="' + COL.fld + '" stroke-width="2"/>';
        var xnp = xpx(xs[2]) - L.J;
        s += txt(L.J + 0.55 * xnp + 7, ymap(-0.45 * g.Em / 1e3) + 4, (L.phone ? '' : 'ℰ(0) = ') + '−ℰ' + sb('max') + ' = ' + fmt(-g.Em / 1e3, 1), { fs: 10.5, fill: COL.fld });
      }
      s += txt(L.ML + L.PW, P.top - 5, L.phone ? 'ℰ < 0 (N → P); area = φ' : 'ℰ < 0: it points from N to P; shaded area = φ', { anchor: 'end', fs: 10, fill: COL.grey });
      return s;
    }
    function drawV(g, apart) {
      var P = L.V, m = st.model, s = '';
      var vmin = -Math.max(m.Vd, g.phi) * 1.12, vmax = 0.12 * m.Vd;
      var ymap = function (v) { return P.top + 5 + (vmax - v) / (vmax - vmin) * (P.h - 10); };
      s += scrShade(P, g);
      s += axisFrame(P, '(c) potential V(x)', [{ v: 0, l: '0' }, { v: -m.Vd, l: fmt(-m.Vd, 2) }], ymap);
      s += txt(L.ML - 5, P.top + P.h + 9, 'V', { anchor: 'end', fs: 9, fill: COL.grey });
      s += line(L.ML, ymap(-m.Vd), L.ML + L.PW, ymap(-m.Vd), '#cfd6df', 1, '3 3');
      if (!apart) {
        var xs = xsSCR(g);
        s += '<path d="' + pathFrom(xpx, function (x) { return ymap(m.V(g, x * 1e-4)); }, xs) + '" fill="none" stroke="' + COL.navy + '" stroke-width="2"/>';
        var yl = ymap(-g.phi) + 13 < P.top + P.h - 2 ? ymap(-g.phi) + 13 : ymap(-g.phi) - 5;
        s += txt(L.ML + 6, yl, 'V' + sb('P') + ' = −φ = ' + fmt(-g.phi, 3) + ' V', { fs: 10.5, fill: COL.navy });
        s += txt(L.ML + L.PW - 4, ymap(0) - 5, 'N grounded: V = 0', { anchor: 'end', fs: 10.5, fill: COL.navy });
      } else {
        s += txt(L.J, ymap(-m.Vd * 0.5), 'no field, no potential step', { anchor: 'middle', fs: 11, fill: COL.grey });
      }
      return s;
    }

    function drawBands(g, gap, apart) {
      var P = L.bd, m = st.model, s = '';
      var Ecn = EG / 2 - m.dEn; // E_C - E_F(N), energies from E_F(N) = 0
      var emin = -(EG - Ecn) - 0.12, emax = Ecn + Math.max(m.Vd, g.phi) + 0.16;
      var ymap = function (E) { return P.top + 8 + (emax - E) / (emax - emin) * (P.h - 16); };
      s += '<rect x="' + L.ML + '" y="' + P.top + '" width="' + L.PW + '" height="' + P.h + '" fill="none" stroke="' + COL.border + '"/>';
      if (!apart) s += scrShade(P, g);
      s += txt(L.ML, P.top - 5, '(d) band diagram (energies to scale)', { fs: L.phone ? 11 : 12, w: 600, fill: COL.navy });
      var fs = L.phone ? 10 : 11;
      var Ec = function (x) { return Ecn - (apart ? (x < 0 ? 0 : 0) : m.V(g, x * 1e-4)); };
      var xsh = function (x) { return xpx(x) + (x < 0 ? -gap : gap); };
      var xs = apart ? null : xsSCR(g);
      var EfP = -m.Vd + g.phi; // P-side Fermi level rises with the bands
      if (apart) {
        // two separate diagrams
        var xL0 = L.ML, xL1 = L.J - gap, xR0 = L.J + gap, xR1 = L.ML + L.PW;
        var EcP = Ecn, EfP0 = -m.Vd;
        s += line(xL0, ymap(EcP), xL1, ymap(EcP), COL.text, 2) + line(xR0, ymap(Ecn), xR1, ymap(Ecn), COL.text, 2);
        s += line(xL0, ymap(EcP - EG), xL1, ymap(EcP - EG), COL.text, 2) + line(xR0, ymap(Ecn - EG), xR1, ymap(Ecn - EG), COL.text, 2);
        s += line(xL0, ymap(EcP - EG / 2), xL1, ymap(EcP - EG / 2), COL.grey, 1, '1.5 3') + line(xR0, ymap(Ecn - EG / 2), xR1, ymap(Ecn - EG / 2), COL.grey, 1, '1.5 3');
        s += line(xL0, ymap(EfP0), xL1, ymap(EfP0), COL.ho, 2, '7 4') + line(xR0, ymap(0), xR1, ymap(0), COL.el, 2, '7 4');
        s += txt(xL0 + 4, ymap(EfP0) - 5, 'E' + sb('F') + '(P)', { fs: fs, fill: COL.ho });
        s += txt(xR1 - 4, ymap(0) + 14, 'E' + sb('F') + '(N)', { anchor: 'end', fs: fs, fill: COL.el });
        var xa = L.J + gap + 26;
        s += line(xR0 + 4, ymap(EfP0), xa + 6, ymap(EfP0), COL.ho, 1, '2 2');
        s += '<path d="M' + xa + ' ' + (ymap(0) + 2) + 'V' + (ymap(EfP0) - 2) + '" stroke="' + COL.navy + '" stroke-width="1.3"/>' +
          '<path d="M' + (xa - 3.5) + ' ' + (ymap(0) + 8) + 'l3.5 -6l3.5 6zM' + (xa - 3.5) + ' ' + (ymap(EfP0) - 8) + 'l3.5 6l3.5 -6z" fill="' + COL.navy + '"/>';
        s += txt(xa + 6, (ymap(0) + ymap(EfP0)) / 2 + 4, 'q' + it('V') + sb('d') + ' = ' + fmt(m.Vd, 3) + ' eV', { fs: fs + 0.5, w: 600, fill: COL.navy });
      } else {
        var dC = pathFrom(xpx, function (x) { return ymap(Ec(x)); }, xs);
        var dV = pathFrom(xpx, function (x) { return ymap(Ec(x) - EG); }, xs);
        var dI = pathFrom(xpx, function (x) { return ymap(Ec(x) - EG / 2); }, xs);
        s += '<path d="' + dI + '" fill="none" stroke="' + COL.grey + '" stroke-width="1" stroke-dasharray="1.5 3"/>';
        s += '<path d="' + dC + '" fill="none" stroke="' + COL.text + '" stroke-width="2"/>';
        s += '<path d="' + dV + '" fill="none" stroke="' + COL.text + '" stroke-width="2"/>';
        var xpE = xpx(g.xp * 1e4), xnE = xpx(g.xn * 1e4), done = st.s >= S_APART + S_FORM;
        if (done && st.V) { // bias: quasi-Fermi levels, flat across the SCR, split by qV (Ch6)
          var up = st.V > 0, yN = ymap(0), yP = ymap(-st.V);
          s += line(L.ML, yP, xnE, yP, COL.ho, 2, '7 4');
          s += line(xpE, yN, L.ML + L.PW, yN, COL.el, 2, '7 4');
          if (xnE + 34 < L.ML + L.PW) s += txt(xnE + 5, yP + 4, 'E' + sb('Fp'), { fs: fs, fill: COL.ho, w: 600 });
          else s += txt(L.ML + (L.J - L.ML) * 0.12, yP - 5, 'E' + sb('Fp'), { fs: fs, fill: COL.ho, w: 600 });
          s += txt(xpE - 5, yN + 4, 'E' + sb('Fn'), { anchor: 'end', fs: fs, fill: COL.el, w: 600 });
          var xg2 = L.ML + (L.J - L.ML) * (L.phone ? 0.42 : 0.5);
          if (Math.abs(yP - yN) > 14) {
            s += '<path d="M' + xg2 + ' ' + (Math.min(yN, yP) + 1) + 'V' + (Math.max(yN, yP) - 1) + '" stroke="' + COL.navy + '" stroke-width="1.2"/>';
            s += txt(xg2 + 4, (yN + yP) / 2 + 4, 'q|' + it('V') + '| = ' + fmt(Math.abs(st.V), 2) + ' eV', { fs: fs, fill: COL.navy });
          }
        } else if (done) {
          s += line(L.ML, ymap(0), L.ML + L.PW, ymap(0), COL.navy, 2, '7 4');
          s += txt(L.ML + L.PW - 4, ymap(0) + 14, 'E' + sb('F') + ' flat', { anchor: 'end', fs: fs, fill: COL.navy, w: 600 });
        } else {
          s += line(L.ML, ymap(EfP), xpE, ymap(EfP), COL.ho, 2, '7 4');
          s += line(xnE, ymap(0), L.ML + L.PW, ymap(0), COL.el, 2, '7 4');
          s += line(xpE, ymap(EfP), xnE, ymap(0), '#9aa6b5', 1, '1.5 3');
          s += txt(L.ML + 4, ymap(EfP) - 5, 'E' + sb('F') + '(P)', { fs: fs, fill: COL.ho });
          s += txt(L.ML + L.PW - 4, ymap(0) + 14, 'E' + sb('F') + '(N)', { anchor: 'end', fs: fs, fill: COL.el });
          // gap between Fermi levels
          var xg = L.ML + (L.J - L.ML) * (L.phone ? 0.42 : 0.5);
          if (ymap(EfP) - ymap(0) > 16 && xg < xpE - 10) {
            s += line(xg, ymap(0), xpE, ymap(0), '#b8c2cf', 1, '2 2');
            s += '<path d="M' + xg + ' ' + (ymap(0) + 1) + 'V' + (ymap(EfP) - 1) + '" stroke="' + COL.grey + '" stroke-width="1"/>';
            s += txt(xg + 4, (ymap(0) + ymap(EfP)) / 2 + 4, 'ΔE' + sb('F') + ' = ' + fmt(m.Vd - g.phi, 3) + ' eV', { fs: fs, fill: COL.grey });
          }
        }
        // step bracket qphi on the right of the P side / left of N side
        var xb = L.ML + L.PW - (done && st.V ? (L.phone ? 122 : 140) : (L.phone ? 92 : 110));
        s += line(L.ML, ymap(Ecn + g.phi), xb + 6, ymap(Ecn + g.phi), '#b8c2cf', 1, '2 2');
        if (ymap(Ecn) - ymap(Ecn + g.phi) > 12) {
          s += '<path d="M' + xb + ' ' + (ymap(Ecn + g.phi) + 2) + 'V' + (ymap(Ecn) - 2) + '" stroke="' + COL.navy + '" stroke-width="1.3"/>';
          s += '<path d="M' + (xb - 3.5) + ' ' + (ymap(Ecn + g.phi) + 8) + 'l3.5 -6l3.5 6zM' + (xb - 3.5) + ' ' + (ymap(Ecn) - 8) + 'l3.5 6l3.5 -6z" fill="' + COL.navy + '"/>';
        }
        var yq = ymap(Ecn) - ymap(Ecn + g.phi) > 18 ? (ymap(Ecn + g.phi) + ymap(Ecn)) / 2 + 4 : ymap(Ecn + g.phi) - 6;
        if (done && st.V < 0) yq = ymap(Ecn + 0.28 * g.phi) + 4; // keep clear of E_Fp, which crosses the bracket in reverse
        s += txt(xb + 6, yq, (done ? (st.V ? 'q(' + it('V') + sb('d') + '−' + it('V') + ')' : 'q' + it('V') + sb('d')) : 'qφ') + ' = ' + fmt(g.phi, 3) + ' eV', { fs: done && st.V && L.phone ? fs - 0.5 : fs + 0.5, w: 600, fill: COL.navy });
      }
      // band labels
      var ecL = apart ? Ecn : Ecn + g.phi;
      s += txt(L.ML - 5, ymap(ecL) + 4, 'E' + sb('C'), { anchor: 'end', fs: fs, fill: COL.text });
      s += txt(L.ML - 5, ymap(ecL - EG) + 4, 'E' + sb('V'), { anchor: 'end', fs: fs, fill: COL.text });
      s += txt(L.ML - 5, ymap(ecL - EG / 2) + 4, 'E' + sb('i'), { anchor: 'end', fs: fs, fill: COL.grey });
      return s;
    }

    function drawDens(g, gap, apart) {
      var P = L.n, s = '', m = st.model;
      var ymap = function (v) { return P.top + 8 + (1.15 - v) / 1.15 * (P.h - 12); };
      var formed = !apart && st.s >= S_APART + S_FORM;
      var ef = Math.exp(-g.phi / VT), ef0 = Math.exp(-m.Vd / VT); // edge value and equilibrium minority level (units of the majority on the other side)
      // formed junction: broken linear axis. Lower band [0, 0.45] = minority densities magnified by M (1, 2 or 5 x 10^k, level in 0.15-0.4);
      // upper band [0.55, 1.1] = the same densities to scale (majority level 1 at 1.1). One continuous curve per carrier.
      var M = 1, mtxt = '';
      if (formed) {
        var lev = Math.max(ef, ef0), ke = Math.floor(Math.log10(0.4 / lev)), mant = 1;
        if (lev * 5 * Math.pow(10, ke) <= 0.4) mant = 5; else if (lev * 2 * Math.pow(10, ke) <= 0.4) mant = 2;
        M = Math.max(1, mant * Math.pow(10, ke));
        mtxt = M < 1000 ? '×' + Math.round(M) : '×' + (mant > 1 ? mant + '·' : '') + '10' + supNum(ke);
      }
      var Y = formed ? function (v) { return v * M <= 0.45 ? v * M : 0.55 + 0.55 * v; } : function (v) { return v; }; // for label placement
      var yTop = formed ? 1.1 : 1;
      if (!apart) s += scrShade(P, g);
      var ticks = formed ? [{ v: 1.1, l: '1' }, { v: 0.825, l: '0.5' }, { v: 0, l: '0' }] : [{ v: 1, l: '1' }, { v: 0.5, l: '0.5' }, { v: 0, l: '0' }];
      if (formed && !L.phone) ticks.splice(2, 0, { v: 0.3, l: fmtSci(0.3 / M).replace('×', '·') });
      var ttl = formed ? (L.phone ? '(e) densities, linear (below the break ' + mtxt + ')' : '(e) carrier densities, linear: p/N' + sb('A') + ', n/N' + sb('D') + ' (below the break: minority ' + mtxt + ')') :
        '(e) carrier densities, linear: p/N' + sb('A') + ', n/N' + sb('D');
      s += axisFrame(P, ttl, ticks, ymap);
      var fs = L.phone ? 10 : 11;
      if (apart) {
        s += line(L.ML, ymap(1), L.J - gap, ymap(1), COL.ho, 2.2) + line(L.J + gap, ymap(0), L.ML + L.PW, ymap(0), COL.ho, 2.2);
        s += line(L.J + gap, ymap(1) + 1, L.ML + L.PW, ymap(1) + 1, COL.el, 2.2) + line(L.ML, ymap(0) + 1, L.J - gap, ymap(0) + 1, COL.el, 2.2);
      } else {
        var xs = xsSCR(g), xp = g.xp * 1e4, xn = g.xn * 1e4, XL = xLeft();
        // minority in a neutral region: edge value e^{-q phi/kT} (eq 5.14; = n_p0 e^{V/V_T}, p_n0 e^{V/V_T} under bias, eq 6.5),
        // relaxing to the equilibrium level over the drawn length LAMBDA (spill-over while forming, injection or extraction under bias)
        var tail = function (d) { return ef0 + (ef - ef0) * Math.exp(-d / LAMBDA); };
        var nf = function (x) { // n/N_D: Boltzmann in the SCR (eq 5.14 with phi), minority tail in P (drawn length on the stretched axis)
          if (x <= xp) return tail((xp - x) * L.kP);
          if (x >= xn) return 1;
          return Math.exp(m.V(g, x * 1e-4) / VT);
        };
        var pf = function (x) {
          if (x >= xn) return tail(x - xn);
          if (x <= xp) return 1;
          return Math.exp(-(m.V(g, x * 1e-4) + g.phi) / VT);
        };
        var seg = function (f, a, b, col, dash) {
          var pts = xs.filter(function (x) { return x >= a - 1e-12 && x <= b + 1e-12; });
          if (pts.length < 2) return '';
          if (!formed) return '<path d="' + pathFrom(xpx, function (x) { return ymap(f(x)); }, pts) + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="5 3"' : '') + '/>';
          // broken axis: upper band while the density is visible to scale, lower band while it fits magnified; in between the curve runs through the break
          var d = '', dl = '', pen = false, last = null, k;
          for (k = 0; k < pts.length; k++) {
            var v = f(pts[k]), yv = v * M <= 0.45 ? v * M : v >= 0.004 ? 0.55 + 0.55 * v : null;
            if (yv === null) { pen = false; continue; }
            var X = xpx(pts[k]).toFixed(1), Yp = ymap(yv).toFixed(1);
            d += (pen ? 'L' : 'M') + X + ' ' + Yp; pen = true; last = [X, Yp];
          }
          return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="5 3"' : '') + '/>' +
            (dl ? '<path d="' + dl + '" fill="none" stroke="' + col + '" stroke-width="1.2" stroke-dasharray="1.5 2.5" opacity="0.8"/>' : '');
        };
        if (formed) { // the break band
          s += '<rect x="' + L.ML + '" y="' + ymap(0.55).toFixed(1) + '" width="' + L.PW + '" height="' + (ymap(0.45) - ymap(0.55)).toFixed(1) + '" fill="#fff" opacity="0.85"/>';
          s += line(L.ML, ymap(0.55), L.ML + L.PW, ymap(0.55), '#cfd6df', 1, '3 3') + line(L.ML, ymap(0.45), L.ML + L.PW, ymap(0.45), '#cfd6df', 1, '3 3');
          var yb = ymap(0.5);
          s += '<path d="M' + (L.ML - 5) + ' ' + (yb + 1) + 'l10 -5M' + (L.ML - 5) + ' ' + (yb + 5) + 'l10 -5" stroke="#6B6B6B" stroke-width="1.2"/>';
        }
        s += seg(pf, XL, xp, COL.ho) + seg(pf, xp, xn, COL.ho, 1) + seg(pf, xn, XMAX, COL.ho);
        s += seg(nf, XL, xp, COL.el) + seg(nf, xp, xn, COL.el, 1) + seg(nf, xn, XMAX, COL.el);
        if (ef > 0.03 && !formed) s += txt(L.J - 8, ymap(0.55), 'spill-over ∝ e' + sp('−qφ/kT'), { anchor: 'end', fs: fs, fill: COL.grey });
        if (formed) {
          var lx = !L.phone && xpx(xp) - L.ML > 120, rx = !L.phone && L.ML + L.PW - xpx(xn) > 120;
          if (lx) s += txt(L.ML + 6, Math.max(ymap(Y(nf(XL))) - 6, ymap(0.45) + 11), 'n (minority) ' + mtxt, { fs: fs, fill: COL.el, w: 600 });
          if (rx) s += txt(L.ML + L.PW - 6, Math.max(ymap(Y(pf(XMAX))) - 6, ymap(0.45) + 11), 'p (minority) ' + mtxt, { anchor: 'end', fs: fs, fill: COL.ho, w: 600 });
        }
      }
      s += txt(L.ML + 6, ymap(yTop) + 14, 'p/N' + sb('A'), { fs: fs, fill: COL.ho, w: 600 });
      s += txt(L.ML + L.PW - 6, ymap(yTop) + 14, 'n/N' + sb('D'), { anchor: 'end', fs: fs, fill: COL.el, w: 600 });
      return s;
    }

    function drawAxis(g) {
      var s = '', y = L.axis;
      s += line(L.ML, y, L.ML + L.PW, y, '#9aa6b5', 1);
      var step = L.phone ? 0.2 : 0.1, x;
      for (x = 0; x <= XMAX + 1e-9; x += step) {
        var X = xpx(x);
        s += line(X, y, X, y + 4, '#9aa6b5', 1);
        s += txt(X, y + 15, fmt(Math.abs(x) < 1e-9 ? 0 : x, 1), { anchor: 'middle', fs: 10.5, fill: COL.grey });
      }
      if (L.kP > 1.5) { // stretched P side: ticks in nm
        var span = -xLeft() * 1e3, nt = L.phone ? 1 : 3, raw = span / nt, pw = Math.pow(10, Math.floor(Math.log10(raw))), stp = raw / pw < 2 ? pw : raw / pw < 5 ? 2 * pw : 5 * pw;
        for (x = stp; x <= span + 1e-9; x += stp) {
          var X2 = xpx(-x / 1e3);
          if (X2 < L.ML + 6) continue;
          s += line(X2, y, X2, y + 4, '#9aa6b5', 1);
          s += txt(X2, y + 15, '−' + (+x.toFixed(1)) + (X2 < L.ML + 40 || x + stp > span + 1e-9 ? ' nm' : ''), { anchor: 'middle', fs: 10.5, fill: COL.grey });
        }
        s += '<path d="M' + (L.J - 3) + ' ' + (y + 2) + 'l3 -6l3 6" fill="none" stroke="#6B6B6B" stroke-width="1"/>';
        s += txt(L.ML + L.PW, y + 28, L.phone ? 'x: µm on N, nm on P (P side ×' + Math.round(L.kP) + ')' : 'x (µm on the N side, nm on the P side, which is drawn stretched ×' + Math.round(L.kP) + '), junction at x = 0', { anchor: 'end', fs: 11, fill: COL.grey });
      } else {
        for (x = -step; x >= XMIN - 1e-9; x -= step) {
          var X3 = xpx(x);
          s += line(X3, y, X3, y + 4, '#9aa6b5', 1);
          s += txt(X3, y + 15, fmt(x, 1), { anchor: 'middle', fs: 10.5, fill: COL.grey });
        }
        s += txt(L.ML + L.PW, y + 28, 'x (µm), junction at x = 0', { anchor: 'end', fs: 11, fill: COL.grey });
      }
      // edge guides through (c)-(e)
      if (st.s >= S_APART && g.W > 0) {
        [g.xp, g.xn].forEach(function (xc, k) {
          var X = xpx(xc * 1e4);
          s += line(X, L.rho.top, X, L.axis, k ? '#7d8896' : '#7d8896', 0.8, '2 4');
        });
        var Xn = xpx(g.xn * 1e4);
        s += txt(Xn + 3, L.axis - 4, 'x' + sb('n'), { fs: 10.5, fill: COL.grey });
        s += txt(xpx(g.xp * 1e4) - 3, L.axis - 4, 'x' + sb('p'), { anchor: 'end', fs: 10.5, fill: COL.grey });
      }
      return s;
    }

    function setCaption() {
      var r = st.model.NA / st.model.ND;
      cap.innerHTML = 'Cartoon (a): numbers of carriers and ions are not to scale, motion is schematic; from contact on, each carrier that crosses recombines on the far side (×) and one ion is uncovered on each side per recombination' + (r > L.rc ? '; acceptor ions are drawn with N<sub>A</sub>/N<sub>D</sub> = ' +
        (+L.rc.toFixed(2)) + ' instead of ' + r + ', so the P part of the SCR is ×' + Math.round(L.kP) + ' wider than to scale. To keep every panel aligned with the cartoon, the P side (x &lt; 0) of all panels is drawn stretched ×' + Math.round(L.kP) + ' (x axis in nm there; true widths in the readouts), and in (c) the −qN<sub>A</sub> block is drawn ' + (+L.rc.toFixed(2)) + ' high so that the two charges have equal drawn areas' : '') + '. Panels (c)–(e) are computed on the shared x axis, in the depletion approximation (eqs 5.15–5.19) with the barrier φ built so far in place of V<sub>d</sub>; ' +
        'n and p follow eq 5.14 inside the SCR. φ grows as dφ/dt ∝ e<sup>(V<sub>d</sub>−φ)/V<sub>T</sub></sup> − (1 − e<sup>−φ/V<sub>T</sub></sup>): diffusion over the barrier minus the minority drift (Ch6 four fluxes), so φ → V<sub>d</sub> = (kT/q) ln(N<sub>A</sub>N<sub>D</sub>/n<sub>i</sub><sup>2</sup>) (eq 5.13), kT/q = 25.9 mV. ' +
        'Time is qualitative and logarithmic (the real transient lasts about a picosecond). The minority tails in (e) (spill-over while forming, injection or extraction under bias) use a drawn decay length of ' + LAMBDA + ' µm (pedagogical); their edge value is e<sup>−qφ/kT</sup> of the majority density on the other side (eq 5.14), i.e. n<sub>p0</sub>e<sup>V/V<sub>T</sub></sup> and p<sub>n0</sub>e<sup>V/V<sub>T</sub></sup> under bias (eq 6.5). Once the junction has formed, (e) uses a broken linear axis: below the break the minority densities are magnified (factor shown), above it the densities are to scale, so each carrier keeps one continuous profile. Under forward bias the cartoon shows carriers injected across the SCR that recombine on the far side and are replaced from the contacts. Si, 300 K, n<sub>i</sub> = 10<sup>10</sup> cm<sup>−3</sup>, ε = 11.7ε<sub>0</sub>.';
    }

    // --- loop ---
    var raf = 0, alive = true;
    function loop(ts) {
      if (!alive) return;
      if (!root.isConnected) { alive = false; return; }
      var dt = st.last ? Math.min(0.05, (ts - st.last) / 1000) : 0;
      st.last = ts;
      if (st.playing) {
        st.s += dt * st.speed * PACE;
        if (st.s >= S_END) { st.s = S_END; st.playing = false; syncButtons(); }
      }
      var g = st.model.geom(curPhi());
      stepParticles(dt * CARRIER * st.speed, g);
      if (ctl) ctl.refresh();
      frame(false);
      raf = requestAnimationFrame(loop);
    }

    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (!root.isConnected) return; var w = wrap.clientWidth; if (w && Math.abs(w - L.w) > 4) { layout(); setCaption(); frame(true); } }, 160);
    });

    layout(); setCaption(); syncButtons(); frame(true);
    raf = requestAnimationFrame(loop);
    // expose for tests (namespaced on the root element only)
    root._ixState = { st: st, frame: frame, setS: setS, setPreset: setPreset, model: function () { return st.model; } };
  }

  window.IX = window.IX || {};
  window.IX[ID] = mount;
})();
