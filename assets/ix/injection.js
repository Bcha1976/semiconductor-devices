/* Interactive module "injection": Injection and current, the bias story (Ch6).
   Version 3 prototype (CHANGES_REQUEST B3, 2026-11-08). It starts from the formed junction of "The junction forms" (Ch5),
   drawn with the same panels, and adds the bias V (on P, N grounded):
   - the step becomes q(V_d - V) and the SCR width follows sqrt(V_d - V) (eqs 6.1, 6.2), phi = V_d - V in the
     depletion formulas of Ch5 (eqs 5.15-5.19);
   - V(x) and the bands: approved band rule (gate 1G, option 3), Poisson on the charge as panel (c) draws it;
   - quasi-Fermi levels flat across the SCR, split by qV (eq 6.3); minority densities at the SCR edges from the law of
     the junction n_p0 e^{V/V_T}, p_n0 e^{V/V_T} (eq 6.5), straight lines to the contacts (short diode);
   - the carriers of the cartoon and of the band diagram cross the step at the rates of the four fluxes:
     diffusion x e^{V/V_T}, drift unchanged;
   - current: short diode of the Ch6 worked example, J = J_0 (e^{V/V_T} - 1), J_0 = q (D_n n_p0 / d_p + D_p p_n0 / d_n). */
(function () {
  'use strict';
  var ID = 'injection';
  var q = 1.602e-19, EPS = 11.7 * 8.854e-14, NI = 1e10, VT = 0.0259, EG = 1.12; // course values (Ch5 Table 5.1: kT/q = 25.9 mV)
  var XMIN = -0.3, XMAX = 0.5; // um, shared x axis of the physics panels (set in layout from the SCR at V = VB_MIN)
  var VB_MIN = -2, VB_FINE = 0.1; // V: reverse limit of the bias; the fine slider spans +-0.1 V in 1 mV steps
  var DN = 35, DP = 12, DPS = 2e-4, DNS = 10e-4, AREA = 1e-4; // short diode of the Ch6 worked example: d_p 2 um, d_n 10 um, S 1e-4 cm2
  var LNC = Math.sqrt(DN * 1e-7), LPC = Math.sqrt(DP * 1e-5);   // long reference diode of Ch6: L_n 18.7 um, L_p 110 um (cm)
  var LDIV = 10; // long diode: drawn diffusion length = 1/10 of the drawn neutral region at V = 0 (visibility, not to scale)
  var KTD = 10 * VT; // drawn kT of the Boltzmann tails (x10, pedagogical, as in Figs 5.6 and 6.2)
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
    { f: 0.04, name: 'Diffusion & recombination', watch: 'Carriers that cross recombine on the far side (red dot that shrinks away), so they are not replaced. Watch the ions they leave behind.' },
    { f: 0.18, name: 'Ions uncovered', watch: 'Uncovered ions: − acceptors on P, + donors on N, equal charges. They create a field ℰ pointing from N to P.' },
    { f: 0.45, name: 'Field builds', watch: 'The field grows with the charge: ρ blocks widen, the ℰ triangle and V(x) grow, the bands bend and the gap between E<sub>Fn</sub> and E<sub>Fp</sub> closes.' },
    { f: 0.8, name: 'Drift grows', watch: 'Drift pushes carriers back; only the dark part of each Boltzmann tail, a fraction e<sup>−qφ/kT</sup>, can still climb the step. The net crossing flux shrinks.' },
    { f: 1, name: 'Equilibrium', watch: 'Equilibrium: drift = diffusion for each carrier, net current zero. E<sub>F</sub> is flat, the step is q<i>V</i><sub>d</sub>.' }
  ];

  var CSS = '' +
    '.ix-injection{color:#1d2430;font-family:inherit;line-height:1.35;user-select:none;-webkit-user-select:none}' +
    '.ix-injection .ixj-top{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:0 0 8px}' +
    '.ix-injection .ixj-grp{display:flex;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.ix-injection button{font:inherit;font-size:13.5px;padding:5px 11px;border:1px solid #c9d2dd;border-radius:6px;background:#fff;color:#1F3A5F;cursor:pointer}' +
    '.ix-injection button:hover{border-color:#1F3A5F}' +
    '.ix-injection button.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}' +
    '.ix-injection button.play{min-width:76px;font-weight:600}' +
    '.ix-injection label{font-size:13px;color:#6B6B6B;display:flex;align-items:center;gap:6px}' +
    '.ix-injection input[type=range]{accent-color:#D9771A;width:110px}' +
    '.ix-injection .ixj-time{flex:1 1 220px;display:flex;align-items:center;gap:8px;font-size:13px;color:#6B6B6B}' +
    '.ix-injection .ixj-time input{flex:1;width:auto;min-width:100px}' +
    '.ix-injection .ixj-watch{background:#fbf3ea;border-left:4px solid #D9771A;border-radius:6px;padding:7px 11px;margin:4px 0 8px;font-size:14px;min-height:2.7em}' +
    '.ix-injection .ixj-watch b{color:#1F3A5F}' +
    '.ix-injection .ixj-read{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}' +
    '.ix-injection .ixj-read div{border:1px solid #dde3ea;border-radius:6px;padding:4px 9px;font-size:13px;background:#fff;min-width:88px}' +
    '.ix-injection .ixj-read span{display:block;color:#6B6B6B;font-size:11.5px}' +
    '.ix-injection .ixj-read strong{font-weight:600;color:#1d2430;font-variant-numeric:tabular-nums}' +
    '.ix-injection .ixj-svgwrap{border:1px solid #dde3ea;border-radius:6px;background:#fff;overflow:hidden}' +
    '.ix-injection svg{display:block;width:100%;height:auto;font-family:inherit}' +
    '.ix-injection .ixj-cap{font-size:12.5px;color:#6B6B6B;margin:6px 2px 0}' +
    '.ix-injection .ixj-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;color:#1d2430;margin:0 0 6px}' +
    '.ix-injection .ixj-legend svg{display:inline-block;width:auto;vertical-align:middle;margin-right:4px}' +
    '@media (max-width:520px){.ix-injection .ixj-read div{min-width:0;flex:1 1 30%}.ix-injection button{padding:5px 8px}}';

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

    // the junction is already formed (s at the end of the formation of "The junction forms"); the bias V is the control
    var st = { preset: 0, s: S_END, V: 0, diode: 'short', playing: false, speed: reduce ? 0.25 : 1, model: null, last: 0, removed: 0, events: [], flashes: [], alt: 0, stage: '' };
    st.model = makeModel(PRESETS[0]);

    // --- DOM ---
    var top = document.createElement('div'); top.className = 'ixj-top';
    top.innerHTML = '<div class="ixj-grp ixj-pre"></div><div class="ixj-grp ixj-dio"></div>';
    root.appendChild(top);
    var pre = top.querySelector('.ixj-pre');
    PRESETS.forEach(function (p, i) {
      var b = document.createElement('button'); b.textContent = p.label; b.title = 'N_A = ' + p.NA.toExponential(0) + ', N_D = ' + p.ND.toExponential(0) + ' cm^-3' + (p.note ? ' (' + p.note + ')' : '');
      b.addEventListener('click', function () { setPreset(i); });
      pre.appendChild(b);
    });
    // short / long diode: the shape of the minority profiles in the neutral regions, (d) and (e) together
    var dio = top.querySelector('.ixj-dio');
    [['short', 'Short diode', 'Neutral regions much shorter than L: straight lines to the contacts (Ch6 worked example)'],
     ['long', 'Long diode', 'Neutral regions much longer than L: exponential decay over L (Ch6 reference diode); L drawn to be seen, not to scale']].forEach(function (d) {
      var b = document.createElement('button'); b.textContent = d[1]; b.title = d[2]; b.setAttribute('data-d', d[0]);
      b.addEventListener('click', function () { st.diode = d[0]; st.stage = ''; syncButtons(); setCaption(); frame(true); });
      dio.appendChild(b);
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
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.5" fill="#A33A3A"/></svg>recombination (the pair vanishes)</span>' +
      '<span><svg width="22" height="14"><path d="M20 13V1C17 6 9 9 3 12L20 13z" fill="#c9d6ec" stroke="' + COL.el + '" stroke-width="1"/><path d="M20 5.5V1C19 3 18 4.5 16.5 6z" fill="' + COL.el + '"/></svg>Boltzmann tail in (d): dark part can climb the step</span>' +
      '<span><svg width="18" height="14"><path d="M3 1V13" stroke="#555" stroke-width="4"/><circle cx="3" cy="7" r="4" fill="#fff" stroke="' + COL.el + '" stroke-width="2"/></svg>short diode: ohmic contact (grey bar); ring: E<sub>Fn</sub> meets E<sub>Fp</sub> there</span>';
    root.appendChild(legend);
    var wrap = document.createElement('div'); wrap.className = 'ixj-svgwrap'; root.appendChild(wrap);
    var cap = document.createElement('div'); cap.className = 'ixj-cap'; root.appendChild(cap);

    // --- bias: regime buttons, the bias slider, the fine slider (+-0.1 V in 1 mV steps, smooth passage through 0) and Speed,
    // one synchronised copy at the top and next to the panels ---
    var K = window.IX._kit, ctl = null;
    function vMax() { return Math.min(0.75, Math.floor((st.model.Vd - 0.08) * 100) / 100); } // the depletion model needs V < V_d
    function setBias(v, fine) {
      v = clamp(fine ? Math.round(v * 1000) / 1000 : Math.round(v * 100) / 100, VB_MIN, vMax());
      if (v === st.V) return;
      st.V = v;
      rebuildCartoon(); frame(true);
      if (ctl) ctl.refresh(); // every strip shows the new bias at once
    }
    function fmtV(v) { return (v > 0.0004 ? '+' : v < -0.0004 ? '−' : '') + Math.abs(v).toFixed(3) + ' V'; }
    if (K) {
      ctl = K.controls({
        sliders: [
          { key: 'V', label: 'bias <i>V</i>', aria: 'Bias V applied to P (N grounded)', title: 'Bias applied to P (N grounded), 10 mV steps',
            min: VB_MIN, max: 0.75, step: 0.01, get: function () { return st.V; }, set: function (v) { setBias(v); }, fmt: fmtV },
          { key: 'Vf', label: 'fine', aria: 'Fine bias, -0.1 to +0.1 V in 1 mV steps', title: 'Fine bias control around V = 0: ±0.1 V in 1 mV steps',
            min: -VB_FINE, max: VB_FINE, step: 0.001, get: function () { return clamp(st.V, -VB_FINE, VB_FINE); }, set: function (v) { setBias(v, true); },
            fmt: function () { return Math.abs(st.V) <= VB_FINE + 1e-9 ? fmtV(st.V) : '—'; } } // outside ±0.1 V the fine slider rests at its end
        ],
        regimes: [
          { label: 'Forward', title: 'Forward bias V = +0.6 V: the step falls to q(V_d − V), diffusion beats drift', apply: function () { setBias(0.6); }, is: function () { return Math.abs(st.V - 0.6) < 1e-9; } },
          { label: 'Equilibrium (0 V)', title: 'Equilibrium, V = 0: diffusion = drift, E_F flat, no current', apply: function () { setBias(0); }, is: function () { return Math.abs(st.V) < 1e-9; } },
          { label: 'Reverse', title: 'Reverse bias V = −2 V: the step rises to q(V_d + 2 V), only the drift is left', apply: function () { setBias(-2); }, is: function () { return Math.abs(st.V + 2) < 1e-9; } }
        ],
        speed: { get: function () { return st.speed; }, set: function (v) { st.speed = v; } }
      });
      top.appendChild(ctl.strip({ top: true }));
    }

    function syncButtons() {
      Array.prototype.forEach.call(pre.children, function (b, i) { b.classList.toggle('on', i === st.preset); });
      Array.prototype.forEach.call(dio.children, function (b) { b.classList.toggle('on', b.getAttribute('data-d') === st.diode); });
    }

    // --- layout ---
    var L = {}, svg = null, gDyn = null;
    function layout() {
      var w = Math.max(300, Math.round(wrap.clientWidth || root.clientWidth || 760));
      var phone = w < 560;
      L.w = w; L.phone = phone;
      L.ML = phone ? 40 : 66; L.MR = phone ? 30 : 38; // right margin: the N-side Fermi level labels of (d)
      L.PW = w - L.ML - L.MR;
      L.spN = clamp(L.PW / 34, 11, 28);
      // x range: the SCR at the reverse limit V = VB_MIN, plus 0.2 um (drawn) of neutral region on each side
      var r0 = st.model.NA / st.model.ND, rc0 = Math.min(r0, L.spN >= 20 ? 4 : 2.25), gw = st.model.geom(st.model.Vd - VB_MIN);
      XMAX = Math.round((gw.xn * 1e4 + 0.2) * 20) / 20;
      XMIN = -Math.round(((r0 / rc0) * (-gw.xp * 1e4) + 0.2) * 20) / 20;
      L.ppu = L.PW / (XMAX - XMIN); // px per um
      L.J = L.ML + (0 - XMIN) * L.ppu;
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
      // (d) bands, with the Boltzmann tails, the barrier and the carriers crossing it
      L.bd = { top: y, h: phone ? 230 : 270 }; y += L.bd.h + TS + 8;
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
    // Band rule (gate 1G, option 3): the potential drawn in every panel is Poisson applied to the charge as panel (c) draws it.
    // P block: rc*qN_D high over the stretched width kP*|x_p| (same charge as -qN_A over |x_p|); N block: qN_D over x_n.
    // Two parabolas in drawn x, zero slope at the SCR edges, continuous slope at x = 0, total step = phi (true).
    // The P share of the step is the drawn width share kP|x_p|/(kP|x_p| + x_n) = 1/(1 + rc) instead of N_D/(N_A + N_D).
    // minority densities in the neutral regions, short diode (B3): straight lines from the law of the junction at the SCR
    // edge, n_p0 e^{V/V_T} = N_D e^{-phi/V_T} (eq 6.5), to the equilibrium value at the contact (frame end). Units: n/N_D, p/N_A.
    // long diode: exponential decay from the edge value over a drawn diffusion length (1/LDIV of the neutral region at V = 0),
    // n = n_p0 + (n_p0 e^{V/V_T} - n_p0) e^{-d/L} (Ch6 long diode), written without cancellation. Units: n/N_D, p/N_A.
    function lamP() { return (-XMIN - L.kP * (-st.model.eq.xp * 1e4)) / LDIV; } // drawn um
    function lamN() { return (XMAX - st.model.eq.xn * 1e4) / LDIV; }
    function longP(x, g) { var e = Math.exp(-Math.max(0, g.xp * 1e4 - x) * L.kP / lamP()); return Math.exp(-st.model.Vd / VT) * (1 - e) + Math.exp(-g.phi / VT) * e; }
    function longN(x, g) { var e = Math.exp(-Math.max(0, x - g.xn * 1e4) / lamN()); return Math.exp(-st.model.Vd / VT) * (1 - e) + Math.exp(-g.phi / VT) * e; }
    function minP(x, g) { return st.diode === 'long' ? longP(x, g) : shortP(x, g); }
    function minN(x, g) { return st.diode === 'long' ? longN(x, g) : shortN(x, g); }
    function shortP(x, g) { var w = clamp((x - xLeft()) / (g.xp * 1e4 - xLeft()), 0, 1); return Math.exp(-st.model.Vd / VT) * (1 - w) + Math.exp(-g.phi / VT) * w; }
    function shortN(x, g) { var w = clamp((XMAX - x) / (XMAX - g.xn * 1e4), 0, 1); return Math.exp(-st.model.Vd / VT) * (1 - w) + Math.exp(-g.phi / VT) * w; }
    function Vdr(g, xum) { // xum: true position (um); returns V in volts, N side grounded, V_P = -phi
      var wP = L.kP * (-g.xp * 1e4), wN = g.xn * 1e4, Wd = wP + wN;
      if (!(Wd > 0)) return xum < 0 ? -g.phi : 0;
      var u = xum < 0 ? xum * L.kP : xum;
      if (u <= -wP) return -g.phi;
      if (u >= wN) return 0;
      if (u < 0) return g.phi * (u + wP) * (u + wP) / (wP * Wd) - g.phi;
      return -g.phi * (wN - u) * (wN - u) / (wN * Wd);
    }

    function buildSVG() {
      var w = L.w, h = L.h, s = '';
      s += '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Formation of a PN junction: cartoon, fluxes, charge, field, potential, bands and densities on one x axis">';
      s += '<defs><clipPath id="ixjclip' + uid + '"><rect x="' + L.ML + '" y="0" width="' + L.PW + '" height="' + h + '"/></clipPath></defs>';
      s += '<g class="dyn"></g></svg>';
      wrap.innerHTML = s;
      svg = wrap.firstChild;
      gDyn = svg.querySelector('.dyn');
      if (window.IX._kit && ctl) window.IX._kit.slice(svg, [L.rho.top - 20, L.bd.top - 15, L.n.top - 16], function (k) {
        // regimes and bias under every panel; Speed only under the panels with moving carriers, (a)-(b) and (d) (as in B1)
        return ctl.strip({ inside: true, tag: ['(a)–(b)', '(c)', '(d)', '(e)'][k], speed: k === 0 || k === 2 });
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
    // ---- carriers crossing the step in the band diagram (d), as in the Boltzmann balance panel:
    // k0 electrons of N climbing over the step (diffusion, N -> P, constant energy above the top of the step)
    // k1 minority electrons of P sliding down E_C (drift, P -> N)
    // k2 holes of P going under the step (diffusion, P -> N, constant energy below the bottom of the step)
    // k3 minority holes of N sliding up E_V (drift, N -> P)
    // Rates: drift r0 (it does not depend on the bias); diffusion r0 e^{V/V_T} (the climbing fraction of the tails,
    // log-compressed above 1 so that forward bias stays readable): equal at V = 0, net current zero; diffusion
    // dominates in forward, only the drift is left in reverse.
    var BR0 = 0.55, BV = 0.07; // spawns per second per kind, speed in drawn um per second (both at Speed 1x)
    function bandRates() {
      var dr = BR0, ratio = Math.exp(st.V / VT);
      var df = ratio <= 1 ? dr * ratio : dr * Math.min(1 + 1.5 * Math.log10(ratio), 17);
      if (df < 0.004) df = 0;
      return [df, dr, df, dr];
    }
    function bandSpawn(k, g) {
      var r = Math.random(), uP = L.kP * g.xp * 1e4, uN = g.xn * 1e4, p = { k: k, a: 0 };
      var Eoff = 0.02 + KTD * 0.9 * (-Math.log(1 - 0.85 * Math.random())) * 0.6;
      if (k === 0) { p.u = XMAX - 0.02 - 0.1 * r; p.Eoff = Eoff; p.dir = -1; }
      else if (k === 1) { p.u = XMIN + 0.03 + Math.max(0, uP - 0.02 - XMIN - 0.03) * r; p.dE = 0.04 + 0.08 * Math.random(); p.dir = 1; }
      else if (k === 2) { p.u = XMIN + 0.02 + 0.1 * r; p.Eoff = Eoff; p.dir = 1; }
      else { p.u = uN + 0.02 + Math.max(0, XMAX - 0.05 - uN - 0.02) * r; p.dE = 0.04 + 0.08 * Math.random(); p.dir = -1; }
      st.bp.push(p);
    }
    function bandStep(dt) {
      if (!st.bp) { st.bp = []; st.bacc = [0, 0, 0, 0]; }
      if (st.s < S_APART) { st.bp = []; return; }
      var g = st.model.geom(curPhi()), R = bandRates(), i;
      for (i = 0; i < 4; i++) {
        st.bacc[i] += R[i] * dt;
        while (st.bacc[i] >= 1) { st.bacc[i] -= 1; if (st.bp.length < 60) bandSpawn(i, g); }
      }
      var uP = L.kP * g.xp * 1e4, uN = g.xn * 1e4;
      st.bp.forEach(function (p) {
        var inS = p.u > uP && p.u < uN;
        p.u += p.dir * BV * dt * ((p.k === 1 || p.k === 3) && inS ? 1.6 : 1); p.a += dt;
      });
      st.bp = st.bp.filter(function (p) { return p.u > XMIN + 0.005 && p.u < XMAX - 0.005; });
    }
    function rebuildCarriers() { st.bp = []; st.bacc = [0, 0, 0, 0]; rebuildCartoon(); }
    function rebuildCartoon() { // cartoon (a) for the present SCR width; the band carriers keep moving
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
    function curFrac() { return 1; }
    function curPhi() { return Math.max(st.model.Vd - st.V, 0.02); } // the step q(V_d - V) (eq 6.1)
    function gapNow() { // pieces slide together before contact
      if (st.s >= S_APART) return 0;
      var a = clamp((st.s - 0.6) / (S_APART - 0.6), 0, 1);
      return L.gapMax * (1 - a * a * (3 - 2 * a));
    }
    function restart() { rebuildCarriers(); }
    function setPreset(i) {
      st.preset = i; st.model = makeModel(PRESETS[i]); st.V = Math.min(st.V, vMax());
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
      // forward bias: carriers injected over the lowered step, they recombine on the far side and the contacts replace them
      if (st.V > 0) {
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
        } else if (c.st === 4) { // crosses the SCR by diffusion, then looks for a partner on the far side
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
      var V = st.V, ev = Math.exp(V / VT), wkey = V > 0 ? 'f' : V < 0 ? 'r' : '0';
      if (wkey + st.diode !== st.stage || force) {
        st.stage = wkey + st.diode;
        watch.innerHTML = V > 0 ? '<b>What to watch — forward bias:</b> the step falls to q(V<sub>d</sub> − V), the SCR narrows and E<sub>Fn</sub>, E<sub>Fp</sub> split by qV. Many more carriers climb the step (diffusion × e<sup>V/V<sub>T</sub></sup>) while the drift does not change: a net current flows. The minority densities at the SCR edges rise as n<sub>p0</sub>e<sup>V/V<sub>T</sub></sup>, p<sub>n0</sub>e<sup>V/V<sub>T</sub></sup> ' + (st.diode === 'short' ? 'and fall in straight lines to the contacts (short diode), where E<sub>Fn</sub> meets E<sub>Fp</sub> (ringed).' : 'and decay over L<sub>n</sub>, L<sub>p</sub> (long diode): E<sub>Fn</sub> comes down to E<sub>Fp</sub> gradually, over a few L<sub>n</sub>.')
          : V < 0 ? '<b>What to watch — reverse bias:</b> the step rises to q(V<sub>d</sub> + |V|), the SCR widens and uncovers more ions, the field grows. Nobody climbs any more; only the drift of the minority carriers is left, a small current −I<sub>0</sub>. The minority densities at the SCR edges drop to almost zero.'
          : '<b>What to watch — equilibrium:</b> the formed junction of Chapter 5. As many carriers climb the step (diffusion) as slide down it (drift), for electrons and for holes: the net current is zero and E<sub>F</sub> is flat. Use the fine slider to cross V = 0 in 1 mV steps.';
      }
      var lg = st.diode === 'long', J0 = q * (DN * (NI * NI / m.NA) / (lg ? LNC : DPS) + DP * (NI * NI / m.ND) / (lg ? LPC : DNS)), J = J0 * (ev - 1); // (6.10) long, short: L -> d
      read.innerHTML =
        ro('bias V (on P)', fmtV(V), V > 0 ? 'forward' : V < 0 ? 'reverse' : 'equilibrium') +
        ro('step q(V<sub>d</sub> − V) (eV)', fmt(phi, 3), 'V<sub>d</sub> = ' + fmt(m.Vd, 3) + ' V') +
        ro('SCR width W (µm)', fmt(g.W * 1e4, 3), 'eq. ' + fmt(m.eq.W * 1e4, 3)) +
        ro('W<sub>n</sub> | W<sub>p</sub>', fmt(g.xn * 1e4, 3) + ' µm | ' + fmtLen(-g.xp), '') +
        ro('ℰ<sub>max</sub> (kV/cm)', fmt(g.Em / 1e3, 1), 'eq. ' + fmt(m.eq.Em / 1e3, 1)) +
        ro('diffusion / drift', Math.abs(V) < 1e-9 ? '1 (balanced)' : fmtPow(ev), 'e<sup>V/V<sub>T</sub></sup>') +
        ro('can climb the step', fmtSci(Math.exp(-phi / VT)), 'e<sup>−q(V<sub>d</sub>−V)/kT</sup>, dark part of a tail') +
        ro('n<sub>p</sub>(x<sub>p</sub>) | p<sub>n</sub>(x<sub>n</sub>)', fmtSci(m.ND * Math.exp(-phi / VT)) + ' | ' + fmtSci(m.NA * Math.exp(-phi / VT)), 'cm⁻³, n<sub>p0</sub>e<sup>V/V<sub>T</sub></sup>, p<sub>n0</sub>e<sup>V/V<sub>T</sub></sup>') +
        ro('J (A/cm²)', Math.abs(V) < 1e-9 ? '0' : (J < 0 ? '−' : '') + fmtSci(Math.abs(J)), 'J<sub>0</sub> = ' + fmtSci(J0) + (lg ? ', long diode' : ', short diode')) +
        ro('I', Math.abs(V) < 1e-9 ? '0' : fmtI(AREA * J), 'S = 10<sup>−4</sup> cm²');
    }
    function fmtI(I) {
      var a = Math.abs(I), u = [[1, 'A'], [1e-3, 'mA'], [1e-6, 'µA'], [1e-9, 'nA'], [1e-12, 'pA'], [1e-15, 'fA']], k;
      for (k = 0; k < u.length - 1 && a < u[k][0]; k++);
      var v = a / u[k][0]; return (I < 0 ? '−' : '') + (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + u[k][1];
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
      var wide = L.kP, wtag = wide > 1.5 ? '; P side stretched ×' + Math.round(wide) + ' as in (c)–(d)' : '';
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
      // recombination: a red ball of carrier size that implodes (author, 2026-11-08), lasting as the old × mark
      st.flashes.forEach(function (f) {
        var r0 = Math.max(L.rN, L.rP) + 0.6, r = f.t < 0.25 ? r0 : r0 * Math.max(0, 1 - (f.t - 0.25) / 1.0);
        if (r > 0.3) s += '<circle cx="' + f.x.toFixed(1) + '" cy="' + f.y.toFixed(1) + '" r="' + r.toFixed(2) + '" fill="#A33A3A"/>';
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
      var bal = Math.abs(st.V) < 1e-9, rat = m.diff(phi) / m.drift(phi), ex = Math.round(Math.log10(rat));
      var dtxt = bal ? 'diffusion = drift' : Math.abs(ex) < 1 ? 'diffusion ×' + rat.toFixed(2) : 'diffusion ×10' + supNum(ex);
      s += txt(L.J + Math.max(lD, lR) + 8, b.r2 + 1, dtxt, { fs: fs, fill: COL.ho });
      s += txt(L.J + lR + 8, b.r1 + 8, 'drift (dashed)', { fs: fs, fill: COL.el });
      if (!L.phone || bal) s += txt(L.ML + L.PW, b.r1 + (L.phone ? 8 : 1), bal ? 'equilibrium: net current zero' : st.V < 0 ? 'drift > diffusion: −I₀' : 'diffusion > drift: forward current', { anchor: 'end', fs: fs + 0.5, w: 600, fill: bal ? COL.fld : COL.acc });
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
      // the P part of the SCR is short in true x but drawn stretched: sample it on its own
      for (i = 1; i <= 60; i++) xs.push(g.xp * 1e4 * (1 - i / 60));
      for (i = 1; i <= N; i++) xs.push(g.xn * 1e4 * i / N);
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
        // -qN_A next to its block, clear of the SCR edge guides (the drawn/true ratio is in the panel's top line)
        var ctxR = { x0: L.ML, x1: L.ML + L.PW, y0: P.top, y1: P.top + P.h, boxes: [{ x: x0, y: ymap(0), w: L.J - x0, h: yp - ymap(0) }, { x: L.J, y: yn, w: x1 - L.J, h: ymap(0) - yn }],
          lines: [[[x0, P.top], [x0, P.top + P.h]], [[x1, P.top], [x1, P.top + P.h]], [[L.ML, ymap(0)], [L.ML + L.PW, ymap(0)]]] };
        s += place(['−qN' + sb('A')], [[L.J + 6, ymap(-0.6) + 4], [x0 - 6, ymap(-0.6) + 4, 'end'], [x1 + 6, ymap(-0.6) + 4]], { fs: 10.5, fill: COL.accep }, ctxR);
      }
      r = m.NA / m.ND;
      s += txt(L.ML + L.PW, P.top - 5, (r > L.rc ? (L.phone ? 'N' + sb('A') + ' drawn ×' + (+L.rc.toFixed(2)) :
        'N = N' + sb('D') + '; −qN' + sb('A') + ' drawn ×' + (+L.rc.toFixed(2)) + ' over a ×' + Math.round(L.kP) + ' stretched width (true ×' + Math.round(r) + ', same charge)') : 'N = N' + sb('D')), { anchor: 'end', fs: 10, fill: COL.grey });
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
        var xnp = xpx(xs[2]) - L.J, xP0 = xpx(xs[0]), xN1 = xpx(xs[2]), em = -g.Em / 1e3;
        var ctxE = { x0: L.ML, x1: L.ML + L.PW, y0: P.top, y1: P.top + P.h, boxes: [],
          lines: [[[xP0, ymap(0)], [L.J, ymap(em)], [xN1, ymap(0)]], [[xP0, P.top], [xP0, P.top + P.h]], [[xN1, P.top], [xN1, P.top + P.h]],
            [[L.ML, ymap(0)], [L.ML + L.PW, ymap(0)]], [[L.ML, ymap(-e)], [L.ML + L.PW, ymap(-e)]]] };
        var eTxt = ['ℰ(0) = −ℰ' + sb('max') + ' = ' + fmt(em, 1), '−ℰ' + sb('max') + ' = ' + fmt(em, 1), fmt(em, 1)];
        s += place(eTxt, [[L.J + 0.5 * xnp, ymap(0.78 * em) + 4], [L.J + 0.4 * xnp, ymap(0.85 * em) + 4], [xN1 + 6, ymap(0.5 * em) + 4], [xP0 - 6, ymap(0.5 * em) + 4, 'end'], [L.J + 6, ymap(em) + 15], [L.J + 6, Math.max(ymap(em), ymap(0) + 6) + 15], [xN1 + 6, ymap(0) + 17]], { fs: 10.5, fill: COL.fld }, ctxE);
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
        s += '<path d="' + pathFrom(xpx, function (x) { return ymap(Vdr(g, x)); }, xs) + '" fill="none" stroke="' + COL.navy + '" stroke-width="2"/>';
        // labels clear of the curve and of the SCR edge guides: scan along a row under the P level and over the N level
        var xP0 = xpx(g.xp * 1e4), xN1 = xpx(g.xn * 1e4);
        var ctxV = { x0: L.ML, x1: L.ML + L.PW, y0: P.top, y1: P.top + P.h, boxes: [],
          lines: [pts(xpx, function (x) { return ymap(Vdr(g, x)); }, xs), [[xP0, P.top], [xP0, P.top + P.h]], [[xN1, P.top], [xN1, P.top + P.h]], [[L.ML, ymap(-m.Vd)], [L.ML + L.PW, ymap(-m.Vd)]]] };
        var scan = function (y, a) { var c = []; for (var xx = L.ML + 6; xx < L.ML + L.PW - 6; xx += 6) c.push([a === 'end' ? L.ML + L.PW - 6 - (xx - L.ML - 6) : xx, y, a]); return c; };
        var yMid = (ymap(0) + ymap(-g.phi)) / 2 + 4;
        s += place(['V' + sb('P') + ' = −(V' + sb('d') + ' − V) = ' + fmt(-g.phi, 3) + ' V', 'V' + sb('P') + ' = ' + fmt(-g.phi, 3) + ' V', 'V' + sb('P')],
          scan(ymap(-g.phi) + 15).concat(scan(ymap(-g.phi) - 8), scan(yMid)), { fs: 10.5, fill: COL.navy, optional: L.phone }, ctxV);
        s += place(['N grounded: V = 0', 'V = 0'], scan(ymap(0) - 7, 'end').concat(scan(ymap(0) + 15, 'end'), scan(ymap(0) + 28, 'end'), scan(ymap(0) + 41, 'end')), { fs: 10.5, fill: COL.navy }, ctxV);
      } else {
        s += txt(L.J, ymap(-m.Vd * 0.5), 'no field, no potential step', { anchor: 'middle', fs: 11, fill: COL.grey });
      }
      return s;
    }

    // ---- label placement (no label on a line): candidate positions, first one whose box touches no line, no box, stays in the panel
    function textW(str, f, bold) { var t = str.replace(/<[^>]*>/g, ''); return t.length * f * (bold ? 0.68 : 0.62) + 3; }
    function boxOf(c, w, f) { // from the cap height to below the subscripts
      var a = c[2] || 'start', x = a === 'end' ? c[0] - w : a === 'middle' ? c[0] - w / 2 : c[0];
      return { x: x, y: c[1] - 0.9 * f, w: w, h: 1.4 * f };
    }
    function hitLines(b, lines) {
      for (var a = 0; a < lines.length; a++) {
        var Lp = lines[a];
        for (var k = 1; k < Lp.length; k++) {
          var xa = Lp[k - 1][0], ya = Lp[k - 1][1], xb = Lp[k][0], yb = Lp[k][1];
          if (Math.max(xa, xb) < b.x - 1 || Math.min(xa, xb) > b.x + b.w + 1 || Math.max(ya, yb) < b.y - 1 || Math.min(ya, yb) > b.y + b.h + 1) continue;
          var n = Math.max(2, Math.ceil(Math.hypot(xb - xa, yb - ya) / 2));
          for (var c = 0; c <= n; c++) {
            var xx = xa + (xb - xa) * c / n, yy = ya + (yb - ya) * c / n;
            if (xx >= b.x - 1 && xx <= b.x + b.w + 1 && yy >= b.y - 1 && yy <= b.y + b.h + 1) return true;
          }
        }
      }
      return false;
    }
    function hitBoxes(b, boxes) {
      for (var k = 0; k < boxes.length; k++) { var o = boxes[k]; if (b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y) return true; }
      return false;
    }
    // texts: [full, short] (short may be ''); returns the svg text, or '' when nothing fits (then st.ov counts it, for the tests)
    function place(texts, cands, o, ctx) {
      for (var t = 0; t < texts.length; t++) {
        if (!texts[t]) continue;
        var w = textW(texts[t], o.fs, o.w);
        for (var c = 0; c < cands.length; c++) {
          var b = boxOf(cands[c], w, o.fs);
          if (b.x < ctx.x0 + 1 || b.x + b.w > ctx.x1 - 1 || b.y < ctx.y0 + 1 || b.y + b.h > ctx.y1 - 1) continue;
          if (hitLines(b, ctx.lines) || hitBoxes(b, ctx.boxes)) continue;
          ctx.boxes.push(b);
          var oo = {}; for (var kk in o) oo[kk] = o[kk]; oo.anchor = cands[c][2] || 'start';
          return txt(cands[c][0], cands[c][1], texts[t], oo);
        }
      }
      if (o.optional) return ''; // a text that is also in the readouts: left out when there is no free place
      st.ov = (st.ov || 0) + 1; st.ovList = (st.ovList || []).concat([texts[0].replace(/<[^>]*>/g, '')]);
      return '';
    }
    function pts(fx, fy, xs) { return xs.map(function (x) { return [fx(x), fy(x)]; }); }
    function polyD(p) { var d = ''; for (var i = 0; i < p.length; i++) d += (i ? 'L' : 'M') + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1); return d; }

    function drawBands(g, gap, apart) {
      var P = L.bd, m = st.model, s = '', fs = L.phone ? 10 : 11;
      var Ecn = EG / 2 - m.dEn; // E_C - E_F(N), energies from E_F(N) = 0
      var emaxT = 5.2 * KTD;    // drawn height of a Boltzmann tail
      // energy window: it follows the step q(V_d - V), smoothly (energies stay to scale inside the frame)
      var tHi = Ecn + Math.max(g.phi, emaxT) + 0.28, tLo = Math.min(Ecn - EG - 0.2, Ecn + g.phi - EG - emaxT) - 0.12; // room under E_V(N) for a label
      if (!st.Ew || st.Ew.p !== st.preset) st.Ew = { lo: tLo, hi: tHi, p: st.preset };
      st.Ew.lo += (tLo - st.Ew.lo) * 0.2; st.Ew.hi += (tHi - st.Ew.hi) * 0.2;
      if (Math.abs(st.Ew.lo - tLo) < 2e-3) st.Ew.lo = tLo;
      if (Math.abs(st.Ew.hi - tHi) < 2e-3) st.Ew.hi = tHi;
      var emax = st.Ew.hi, emin = st.Ew.lo;
      var ymap = function (E) { return P.top + 6 + (emax - E) / (emax - emin) * (P.h - 12); };
      var x0 = L.ML, x1 = L.ML + L.PW;
      var ctx = { x0: x0, x1: x1, y0: P.top, y1: P.top + P.h, lines: [], boxes: [] };
      s += '<rect x="' + x0 + '" y="' + P.top + '" width="' + L.PW + '" height="' + P.h + '" fill="none" stroke="' + COL.border + '"/>';
      if (!apart) s += scrShade(P, g);
      // the longest title that fits the panel width (bold 12 px: about 7.6 px per character)
      var dT = ['(d) band diagram (energies to scale) with the Boltzmann tails (drawn with kT ×10) and the barrier', '(d) band diagram (energies to scale) with the Boltzmann tails (kT ×10)', '(d) bands (to scale; tails: kT ×10)'].filter(function (t) { return t.length * (L.phone ? 7 : 7.6) <= L.w - L.ML - 6; })[0] || '(d) bands';
      s += txt(L.ML, P.top - 5, dT, { fs: L.phone ? 11 : 12, w: 600, fill: COL.navy });
      if (apart) {
        // two separate diagrams, aligned on E_C (no contact yet)
        var xL0 = x0, xL1 = L.J - gap, xR0 = L.J + gap, xR1 = x1;
        var EcP = Ecn, EfP0 = -m.Vd;
        s += line(xL0, ymap(EcP), xL1, ymap(EcP), COL.text, 2) + line(xR0, ymap(Ecn), xR1, ymap(Ecn), COL.text, 2);
        s += line(xL0, ymap(EcP - EG), xL1, ymap(EcP - EG), COL.text, 2) + line(xR0, ymap(Ecn - EG), xR1, ymap(Ecn - EG), COL.text, 2);
        s += line(xL0, ymap(EfP0), xL1, ymap(EfP0), COL.ho, 2, '7 4') + line(xR0, ymap(0), xR1, ymap(0), COL.el, 2, '7 4');
        ctx.lines.push([[xL0, ymap(EcP)], [xL1, ymap(EcP)]], [[xR0, ymap(Ecn)], [xR1, ymap(Ecn)]], [[xL0, ymap(EcP - EG)], [xL1, ymap(EcP - EG)]],
          [[xR0, ymap(Ecn - EG)], [xR1, ymap(Ecn - EG)]], [[xL0, ymap(EfP0)], [xL1, ymap(EfP0)]], [[xR0, ymap(0)], [xR1, ymap(0)]]);
        var xa = L.J + gap + 26;
        s += line(xR0 + 4, ymap(EfP0), xa + 6, ymap(EfP0), COL.ho, 1, '2 2');
        ctx.lines.push([[xR0 + 4, ymap(EfP0)], [xa + 6, ymap(EfP0)]], [[xa, ymap(0)], [xa, ymap(EfP0)]]);
        s += '<path d="M' + xa + ' ' + (ymap(0) + 2) + 'V' + (ymap(EfP0) - 2) + '" stroke="' + COL.navy + '" stroke-width="1.3"/>' +
          '<path d="M' + (xa - 3.5) + ' ' + (ymap(0) + 8) + 'l3.5 -6l3.5 6zM' + (xa - 3.5) + ' ' + (ymap(EfP0) - 8) + 'l3.5 6l3.5 -6z" fill="' + COL.navy + '"/>';
        s += place(['E' + sb('F') + '(P)'], [[xL0 + 4, ymap(EfP0) - 8], [xL0 + 4, ymap(EfP0) + 15]], { fs: fs, fill: COL.ho }, ctx);
        s += place(['E' + sb('F') + '(N)'], [[xR1 - 4, ymap(0) + 15, 'end'], [xR1 - 4, ymap(0) - 8, 'end']], { fs: fs, fill: COL.el }, ctx);
        s += place(['q' + it('V') + sb('d') + ' = ' + fmt(m.Vd, 3) + ' eV', 'q' + it('V') + sb('d')], [[xa + 6, (ymap(0) + ymap(EfP0)) / 2 + 4]], { fs: fs + 0.5, w: 600, fill: COL.navy }, ctx);
        s += txt(L.ML - 5, ymap(Ecn) + 4, 'E' + sb('C'), { anchor: 'end', fs: fs, fill: COL.text });
        s += txt(L.ML - 5, ymap(Ecn - EG) + 4, 'E' + sb('V'), { anchor: 'end', fs: fs, fill: COL.text });
        return s;
      }
      var xs = xsSCR(g), xp = g.xp * 1e4, xn = g.xn * 1e4, XL = xLeft();
      var xpE = xpx(xp), xnE = xpx(xn), done = Math.abs(st.V) < 1e-9; // done: equilibrium, one flat E_F
      var Ec = function (x) { return Ecn - Vdr(g, x); };
      var top = Ecn + g.phi, EcP = top, EvP = top - EG, EvN = Ecn - EG, EfP = g.phi - m.Vd; // E_Fp = E_F(N) - qV
      // ---- Boltzmann tails (energy distributions of the majority carriers in each neutral region)
      var gW = m.geom(m.Vd - VB_MIN); // narrowest neutral regions (reverse limit): the tails fit at every bias
      var wmax = Math.min(L.phone ? 56 : 92, 0.55 * (xpx(gW.xp * 1e4) - x0), 0.55 * (x1 - xpx(gW.xn * 1e4)));
      var fmax = Math.sqrt(0.5) * Math.exp(-0.5), nE = 70, i, e, f;
      // the energy window is set for the formed junction: early in the formation the tails are clipped at the frame
      s += '<clipPath id="ixjbd' + uid + '"><rect x="' + x0 + '" y="' + P.top + '" width="' + L.PW + '" height="' + P.h + '"/></clipPath><g clip-path="url(#ixjbd' + uid + ')">';
      var dAll = 'M' + (x1 - 2) + ' ' + ymap(Ecn).toFixed(1), dark = [];
      for (i = 0; i <= nE; i++) {
        e = emaxT * i / nE; f = Math.sqrt(e / KTD) * Math.exp(-e / KTD) / fmax;
        var xx = x1 - 2 - f * wmax, yy = ymap(Ecn + e);
        dAll += 'L' + xx.toFixed(1) + ' ' + yy.toFixed(1);
        if (Ecn + e >= top) dark.push([xx, yy]);
      }
      dAll += 'L' + (x1 - 2) + ' ' + ymap(Ecn + emaxT).toFixed(1) + 'Z';
      s += '<path d="' + dAll + '" fill="#c9d6ec" fill-opacity="0.75" stroke="' + COL.el + '" stroke-width="1"/>';
      if (dark.length > 1) s += '<path d="M' + (x1 - 2) + ' ' + dark[0][1].toFixed(1) + polyD(dark).replace(/^M/, 'L') + 'L' + (x1 - 2) + ' ' + dark[dark.length - 1][1].toFixed(1) + 'Z" fill="' + COL.el + '" fill-opacity="0.85"/>';
      var hAll = 'M' + (x0 + 2) + ' ' + ymap(EvP).toFixed(1), dark2 = [];
      for (i = 0; i <= nE; i++) {
        e = emaxT * i / nE; f = Math.sqrt(e / KTD) * Math.exp(-e / KTD) / fmax;
        var xh = x0 + 2 + f * wmax, yh = ymap(EvP - e);
        hAll += 'L' + xh.toFixed(1) + ' ' + yh.toFixed(1);
        if (EvP - e <= EvN) dark2.push([xh, yh]);
      }
      hAll += 'L' + (x0 + 2) + ' ' + ymap(EvP - emaxT).toFixed(1) + 'Z';
      s += '<path d="' + hAll + '" fill="#f6d9bf" fill-opacity="0.8" stroke="' + COL.ho + '" stroke-width="1"/>';
      if (dark2.length > 1) s += '<path d="M' + (x0 + 2) + ' ' + dark2[0][1].toFixed(1) + polyD(dark2).replace(/^M/, 'L') + 'L' + (x0 + 2) + ' ' + dark2[dark2.length - 1][1].toFixed(1) + 'Z" fill="' + COL.ho + '" fill-opacity="0.85"/>';
      s += '</g>';
      var wTail = wmax; // the whole tail is kept free of labels
      ctx.boxes.push({ x: x1 - 2 - wTail, y: Math.max(ymap(Ecn + emaxT), P.top), w: wTail + 2, h: ymap(Ecn) - Math.max(ymap(Ecn + emaxT), P.top) });
      ctx.boxes.push({ x: x0, y: ymap(EvP), w: wTail + 2, h: Math.min(ymap(EvP - emaxT), P.top + P.h) - ymap(EvP) });
      // ---- barrier guides: top of the step over the N side, bottom of the step under the P side
      var gTop = [[xnE, ymap(top)], [x1, ymap(top)]], gBot = [[x0, ymap(EvN)], [xpE, ymap(EvN)]];
      s += '<path d="' + polyD(gTop) + '" stroke="#8c99a8" stroke-width="1" stroke-dasharray="2 3" fill="none"/>';
      s += '<path d="' + polyD(gBot) + '" stroke="#8c99a8" stroke-width="1" stroke-dasharray="2 3" fill="none"/>';
      ctx.lines.push(gTop, gBot);
      // ---- bands from the one drawn potential: E_C = E_C(N) - qV(x), E_V = E_C - E_g
      var pC = pts(xpx, function (x) { return ymap(Ec(x)); }, xs), pV = pts(xpx, function (x) { return ymap(Ec(x) - EG); }, xs);
      s += '<path d="' + polyD(pC) + '" fill="none" stroke="' + COL.text + '" stroke-width="2"/>';
      s += '<path d="' + polyD(pV) + '" fill="none" stroke="' + COL.text + '" stroke-width="2"/>';
      ctx.lines.push(pC, pV);
      // SCR edge guides of drawAxis run through this panel too
      ctx.lines.push([[xpE, P.top], [xpE, P.top + P.h]], [[xnE, P.top], [xnE, P.top + P.h]]);
      // ---- Fermi levels
      if (done) {
        var pF = [[x0, ymap(0)], [x1, ymap(0)]];
        s += '<path d="' + polyD(pF) + '" stroke="' + COL.navy + '" stroke-width="2" stroke-dasharray="7 4" fill="none"/>';
        ctx.lines.push(pF);
      } else {
        // quasi-Fermi levels from the minority densities of panel (e) (law of the junction at the SCR edges, eq 6.5,
        // straight lines to the contacts at the frame ends: short diode): E_Fn flat from the N side to x_p, E_Fp flat
        // from the P side to x_n; no joining line. Samples dense near the edges, where the logarithm turns fast in reverse.
        var xsP = [], xsN = [];
        for (i = 0; i <= 120; i++) { var w3 = 1 - Math.pow(1 - i / 120, 3); xsP.push(XL + (xp - XL) * w3); xsN.push(XMAX - (XMAX - xn) * w3); }
        xsN.reverse();
        var pFn = pts(xpx, function (x) { return ymap(EfP + VT * Math.log(minP(x, g) / Math.exp(-m.Vd / VT))); }, xsP).concat([[xnE, ymap(0)], [x1, ymap(0)]]);
        var pFp = [[x0, ymap(EfP)], [xpE, ymap(EfP)]].concat(pts(xpx, function (x) { return ymap(-VT * Math.log(minN(x, g) / Math.exp(-m.Vd / VT))); }, xsN));
        pFp.splice(2, 0, [xnE, ymap(EfP)]);
        s += '<path d="' + polyD(pFn) + '" stroke="' + COL.el + '" stroke-width="2" stroke-dasharray="7 4" fill="none"/>';
        s += '<path d="' + polyD(pFp) + '" stroke="' + COL.ho + '" stroke-width="2" stroke-dasharray="7 4" fill="none"/>';
        ctx.lines.push(pFn, pFp);
      }
      // ---- short diode: the ohmic contacts at the frame ends, where each minority level meets the majority level
      if (st.diode === 'short') {
        s += '<path d="M' + (x0 + 2) + ' ' + P.top + 'V' + (P.top + P.h) + 'M' + (x1 - 2) + ' ' + P.top + 'V' + (P.top + P.h) + '" stroke="#555" stroke-width="4"/>';
        ctx.lines.push([[x0 + 2, P.top], [x0 + 2, P.top + P.h]], [[x1 - 2, P.top], [x1 - 2, P.top + P.h]]);
        if (!done) {
          // the meeting points: a ring on each contact
          s += '<circle cx="' + (x0 + 2) + '" cy="' + ymap(EfP).toFixed(1) + '" r="4.5" fill="#fff" stroke="' + COL.el + '" stroke-width="2"/>';
          s += '<circle cx="' + (x1 - 2) + '" cy="' + ymap(0).toFixed(1) + '" r="4.5" fill="#fff" stroke="' + COL.ho + '" stroke-width="2"/>';
          ctx.boxes.push({ x: x0 - 3, y: ymap(EfP) - 7, w: 12, h: 14 }, { x: x1 - 9, y: ymap(0) - 7, w: 12, h: 14 });
        }
      }
      // ---- the carriers crossing the step (moving dots; electrons filled blue, holes open orange)
      if (st.bp && st.bp.length) {
        var rr = L.phone ? 3 : 3.6, de = '', dh = '';
        st.bp.forEach(function (p) {
          var x = p.u < 0 ? p.u / L.kP : p.u, Y;
          if (p.k === 0) Y = ymap(top + p.Eoff);
          else if (p.k === 1) Y = ymap(Ec(x) + p.dE);
          else if (p.k === 2) Y = ymap(EvN - p.Eoff);
          else Y = ymap(Ec(x) - EG - p.dE);
          var o = Math.max(0, Math.min(1, p.a / 0.4, (p.u - XMIN) / 0.05, (XMAX - p.u) / 0.05)).toFixed(2), X = L.J + p.u * L.ppu;
          if (p.k < 2) de += '<circle cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="' + rr + '" fill="' + COL.el + '" opacity="' + o + '"/>';
          else dh += '<circle cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="' + (rr - 0.4) + '" fill="#fff" stroke="' + COL.ho + '" stroke-width="1.7" opacity="' + o + '"/>';
        });
        s += '<g clip-path="url(#ixjbd' + uid + ')">' + de + dh + '</g>';
      }
      // ---- the step: measured in the neutral P region, from E_C(P) down to the level of E_C(N) (dotted guide from the N side)
      var gLev = [[x0 + 4, ymap(Ecn)], [xnE, ymap(Ecn)]];
      s += '<path d="' + polyD(gLev) + '" stroke="#8c99a8" stroke-width="1" stroke-dasharray="2 3" fill="none"/>';
      ctx.lines.push(gLev);
      var xb = x0 + Math.min(14, 0.12 * (xpE - x0));
      if (ymap(Ecn) - ymap(top) > 18) {
        s += '<path d="M' + xb + ' ' + (ymap(top) + 2) + 'V' + (ymap(Ecn) - 2) + '" stroke="' + COL.navy + '" stroke-width="1.3"/>';
        s += '<path d="M' + (xb - 3.5) + ' ' + (ymap(top) + 8) + 'l3.5 -6l3.5 6zM' + (xb - 3.5) + ' ' + (ymap(Ecn) - 8) + 'l3.5 6l3.5 -6z" fill="' + COL.navy + '"/>';
        ctx.lines.push([[xb, ymap(top)], [xb, ymap(Ecn)]]);
      }
      var stepName = done ? 'q' + it('V') + sb('d') : 'q(' + it('V') + sb('d') + ' − ' + it('V') + ')';
      var ym = (ymap(top) + ymap(Ecn)) / 2 + 4, yA = ymap(top), yB = ymap(Ecn);
      s += place([stepName + ' = ' + fmt(g.phi, 3) + ' eV', stepName],
        [[xb + 6, ym], [xb + 6, yA + 15], [xb + 6, yB - 8], [xb + 6, (yA + 3 * yB) / 4 + 4], [xb + 6, (3 * yA + yB) / 4 + 4], [xb + 6, yA - 9], [x0 + 4, yA - 9], [x0 + 4, yA - 26]],
        { fs: fs + 0.5, w: 600, fill: COL.navy, optional: L.phone }, ctx); // phone: the step is in the readouts
      // ---- the split qV of the quasi-Fermi levels: bracket in the SCR between the two flat levels
      if (!done) {
        var yN0 = Math.min(ymap(0), ymap(EfP)), yP0 = Math.max(ymap(0), ymap(EfP)), xq = st.V > 0 ? (xpE + xnE) / 2 : xpE + 0.2 * (xnE - xpE);
        if (yP0 - yN0 > 16 && xnE - xpE > 8) {
          s += '<path d="M' + xq + ' ' + (yN0 + 2) + 'V' + (yP0 - 2) + '" stroke="' + COL.grey + '" stroke-width="1.2"/>';
          s += '<path d="M' + (xq - 3) + ' ' + (yN0 + 7) + 'l3 -5l3 5zM' + (xq - 3) + ' ' + (yP0 - 7) + 'l3 5l3 -5z" fill="' + COL.grey + '"/>';
          ctx.lines.push([[xq, yN0], [xq, yP0]]);
          var yq = (yN0 + yP0) / 2 + 4;
          s += place([(st.V > 0 ? 'q' + it('V') : 'q|' + it('V') + '|') + ' = ' + fmt(Math.abs(st.V), 3) + ' eV', st.V > 0 ? 'q' + it('V') : 'q|' + it('V') + '|'],
            [[xq + 6, yq], [xq - 6, yq, 'end'], [xpE - 6, yq, 'end'], [xnE + 6, yq], [xq + 6, yq - 8], [xq + 6, yq + 8], [xq - 6, yq - 8, 'end'], [xq - 6, yq + 8, 'end'], [xpE - 6, yN0 - 8, 'end'], [xnE + 6, yP0 + 15]], { fs: fs, fill: COL.grey }, ctx);
        }
      }
      // Fermi level labels in the margins, each where its line is the majority level: E_Fp on the P side (left),
      // E_Fn on the N side (right); one E_F at equilibrium (right)
      var leftLabs = [{ y: ymap(EcP), t: 'E' + sb('C'), c: COL.text, w: 400 }, { y: ymap(EvP), t: 'E' + sb('V'), c: COL.text, w: 400 }];
      if (!done) leftLabs.push({ y: ymap(EfP), t: 'E' + sb('Fp'), c: COL.ho, w: 600 });
      leftLabs.sort(function (a, b) { return a.y - b.y; });
      for (i = 1; i < leftLabs.length; i++) if (leftLabs[i].y - leftLabs[i - 1].y < 17) leftLabs[i].y = leftLabs[i - 1].y + 17;
      leftLabs.forEach(function (o) { s += txt(L.ML - 5, o.y + 4, o.t, { anchor: 'end', fs: fs, fill: o.c, w: o.w }); });
      s += txt(x1 + 4, ymap(0) + 4, done ? 'E' + sb('F') : 'E' + sb('Fn'), { fs: fs, fill: done ? COL.navy : COL.el, w: 600 });
      // ---- contact labels (short diode, under bias): the minority quasi-Fermi level meets the majority one at the contact
      if (st.diode === 'short' && !done) {
        var yFp = ymap(EfP), yFn = ymap(0);
        s += place(['contact: E' + sb('Fn') + ' = E' + sb('Fp'), 'E' + sb('Fn') + ' = E' + sb('Fp')],
          [[x0 + 8, yFp + 16], [x0 + 8, yFp - 9], [x0 + 8, yFp + 30], [x0 + 8, yFp - 23]], { fs: fs - 0.5, fill: COL.el, optional: true }, ctx);
        s += place(['contact: E' + sb('Fp') + ' = E' + sb('Fn'), 'E' + sb('Fp') + ' = E' + sb('Fn')],
          [[x1 - 8, yFn - 9, 'end'], [x1 - 8, yFn + 16, 'end'], [x1 - 8, yFn - 23, 'end'], [x1 - 8, yFn + 30, 'end']], { fs: fs - 0.5, fill: COL.ho, optional: true }, ctx);
      }
      // ---- tail labels and the climbing fraction (desktop; on a phone they are in the legend and the readouts)
      if (L.phone) return s;
      s += place(['electrons of N: Boltzmann tail', 'e⁻ of N'], [[x1 - 4, ymap(Ecn + emaxT) - 6, 'end'], [x1 - wmax - 6, ymap(Ecn + 0.95 * emaxT), 'end'], [x1 - wmax - 6, ymap(Ecn + 0.8 * emaxT), 'end'], [x1 - wmax - 6, ymap(Ecn + 0.65 * emaxT), 'end'], [x1 - wmax - 6, ymap(Ecn + 0.5 * emaxT), 'end'], [x1 - wmax - 6, ymap(Ecn + 0.35 * emaxT), 'end'], [x1 - wmax - 6, ymap(Ecn + 0.2 * emaxT), 'end']], { fs: fs - 0.5, fill: COL.el }, ctx);
      s += place(['holes of P', 'h⁺ of P'], [[x0 + wTail + 6, ymap(EvP - 1.6 * KTD)], [x0 + wTail + 6, ymap(EvP - 0.7 * KTD)], [x0 + wTail + 6, ymap(EvP - 2.6 * KTD)], [x0 + wTail + 6, ymap(EvP - 3.6 * KTD)], [x0 + wTail + 6, ymap(EvP) + 15], [x0 + wTail + 6, P.top + P.h - 9], [x0 + 4, ymap(EvP - emaxT) + 15], [x0 + 4, ymap(EvP - emaxT) + 28], [x0 + 4, ymap(Ecn) + 16], [x0 + 4, ymap(Ecn) + 30]], { fs: fs - 0.5, fill: COL.ho }, ctx);
      var climbs = Math.exp(-g.phi / VT);
      s += place(['fraction that can climb the step, e' + sp('−qφ/kT') + ' = ' + fmtSci(climbs), 'climbs: ' + fmtSci(climbs)],
        [[x1 - 6, P.top + P.h - 9, 'end'], [x1 - wmax - 8, P.top + P.h - 9, 'end'], [xnE + 6, P.top + P.h - 9],
         [x1 - 6, ymap(Ecn + emaxT) - 26, 'end'], [x1 - 6, ymap(top) + 16, 'end'], [x1 - 6, ymap(top) + 32, 'end']], { fs: fs, fill: COL.el, w: 600, optional: true }, ctx);
      return s;
    }

    // (e) carrier densities (restored at the author's request, 2026-11-08): Boltzmann relation inside the SCR on the drawn potential Vdr, as the bands
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
        // minority in a neutral region: short diode, a straight line from the law of the junction at the edge,
        // n_p0 e^{V/V_T}, p_n0 e^{V/V_T} (eq 6.5), to the equilibrium value at the contact (frame end)
        var nf = function (x) { // n/N_D: Boltzmann in the SCR on the drawn potential (eq 5.14 with phi = V_d - V)
          if (x <= xp) return minP(x, g);
          if (x >= xn) return 1;
          return Math.exp(Vdr(g, x) / VT);
        };
        var pf = function (x) {
          if (x >= xn) return minN(x, g);
          if (x <= xp) return 1;
          return Math.exp(-(Vdr(g, x) + g.phi) / VT);
        };
        var seg = function (f, a, b, col, dash) {
          var pts = xs.filter(function (x) { return x >= a - 1e-12 && x <= b + 1e-12; });
          if (pts.length < 2) return '';
          if (!formed) return '<path d="' + pathFrom(xpx, function (x) { return ymap(f(x)); }, pts) + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="5 3"' : '') + '/>';
          // broken axis: upper band while the density is visible to scale, lower band while it fits magnified; in between the curve runs through the break
          // Under reverse bias the densities fall through the magnified window over a very short distance: the samples are
          // refined there (and the curve starts or ends exactly on the break), so the steep fall is drawn as a smooth curve.
          var band = function (v) { return v * M <= 0.45 ? v * M : v >= 0.004 ? 0.55 + 0.55 * v : null; };
          var d = '', dl = '', pen = false, last = null, k, j, prevX = null, prevY = null;
          var put = function (x, yv) { d += (pen ? 'L' : 'M') + xpx(x).toFixed(1) + ' ' + ymap(yv).toFixed(1); pen = true; };
          for (k = 0; k < pts.length; k++) {
            var x = pts[k], v = f(x), yv = band(v);
            if (prevX !== null && (yv === null) !== (prevY === null)) { // entering or leaving the break: find the crossing
              var a0 = prevX, a1 = x, inA = prevY !== null;
              for (j = 0; j < 40; j++) { var mid = (a0 + a1) / 2; if ((band(f(mid)) !== null) === inA) a0 = mid; else a1 = mid; }
              var xc = inA ? a0 : a1, yc = band(f(xc));
              if (yc !== null) put(xc, yc);
              if (yv === null) pen = false;
            } else if (yv !== null && prevY !== null && Math.abs(yv - prevY) > 0.02) { // steep: sub-samples
              var nsub = Math.min(60, Math.ceil(Math.abs(yv - prevY) / 0.01));
              for (j = 1; j < nsub; j++) { var xs2 = prevX + (x - prevX) * j / nsub, y2 = band(f(xs2)); if (y2 !== null) put(xs2, y2); }
            }
            if (yv !== null) put(x, yv);
            prevX = x; prevY = yv;
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
        // (the "n (minority) ×M" labels of v2 are left out: the magnification is in the panel title, and in B3 the profiles
        // run across the whole neutral regions, where those labels would cross them)
        var xa0 = L.ML, xa1 = L.ML + L.PW, yb = P.top + P.h;
        if (st.diode === 'short') { // the ohmic contacts, where the minority densities are back to n_p0, p_n0
          s += '<path d="M' + (xa0 + 2) + ' ' + P.top + 'V' + yb + 'M' + (xa1 - 2) + ' ' + P.top + 'V' + yb + '" stroke="#555" stroke-width="4"/>';
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
        [g.xp, g.xn].forEach(function (xc) { // inside each panel frame only: the titles between the panels stay clear
          var X = xpx(xc * 1e4);
          [L.rho, L.E, L.V, L.bd].forEach(function (P) { s += line(X, P.top, X, P.top + P.h, '#7d8896', 0.8, '2 4'); });
          s += line(X, L.n.top, X, L.axis, '#7d8896', 0.8, '2 4');
        });
        var Xn = xpx(g.xn * 1e4);
        s += txt(Xn + 3, L.axis - 4, 'x' + sb('n'), { fs: 10.5, fill: COL.grey });
        s += txt(xpx(g.xp * 1e4) - 3, L.axis - 4, 'x' + sb('p'), { anchor: 'end', fs: 10.5, fill: COL.grey });
      }
      return s;
    }

    function setCaption() {
      var r = st.model.NA / st.model.ND, gr = st.model.geom(st.model.Vd - VB_MIN);
      cap.innerHTML = 'The junction formed in "The junction forms" (Ch5), now biased: V on P, N grounded. Cartoon (a): numbers of carriers and ions are not to scale, motion is schematic; under forward bias carriers are injected across the SCR, recombine on the far side (red dot) and are replaced from the contacts; under reverse bias the SCR widens and uncovers more ions.' +
        (r > L.rc ? ' Acceptor ions are drawn with N<sub>A</sub>/N<sub>D</sub> = ' + (+L.rc.toFixed(2)) + ' instead of ' + r + ', so the P side (x &lt; 0) of every panel is drawn stretched ×' + Math.round(L.kP) + ' (x in nm there; true widths in the readouts); V(x) and the bands are obtained from the charge as drawn in (c), so they bend smoothly on both sides of x = 0: the total step q(V<sub>d</sub> − V) and the SCR edges are true, the share of the step on the P side is drawn (' + Math.round(100 / (1 + L.rc)) + ' % instead of ' + (100 * st.model.ND / (st.model.NA + st.model.ND)).toFixed(r > 50 ? 1 : 0) + ' %).' : '') +
        ' Depletion approximation with V<sub>d</sub> − V in place of V<sub>d</sub> (eqs 6.1, 6.2): W ∝ √(V<sub>d</sub> − V). Quasi-Fermi levels flat across the SCR, split by qV (eq 6.3). (b) and (d): diffusion over the step is multiplied by e<sup>V/V<sub>T</sub></sup>, the drift of the minority carriers does not change; in (d) the Boltzmann tails are drawn with kT ×10 and the moving carriers cross at these rates (log-compressed in forward). (e): minority densities at the SCR edges from the law of the junction, n<sub>p0</sub>e<sup>V/V<sub>T</sub></sup> and p<sub>n0</sub>e<sup>V/V<sub>T</sub></sup> (eq 6.5), then, for the short diode (Ch6 worked example, d<sub>p</sub> = 2 µm, d<sub>n</sub> = 10 µm), straight lines to the ohmic contacts at the frame ends (grey bars), where E<sub>Fn</sub> meets E<sub>Fp</sub>; for the long diode (Ch6 reference diode, L<sub>n</sub> = 18.7 µm, L<sub>p</sub> = 110 µm), an exponential decay over L, drawn as 1/' + LDIV + ' of the neutral region so that the decay and the gradual merging of E<sub>Fn</sub> into E<sub>Fp</sub> can be seen (lengths not to scale); broken linear axis with the minority densities magnified below the break. Current: J = J<sub>0</sub>(e<sup>V/V<sub>T</sub></sup> − 1), J<sub>0</sub> = q(D<sub>n</sub>n<sub>p0</sub>/d<sub>p</sub> + D<sub>p</sub>p<sub>n0</sub>/d<sub>n</sub>) for the short diode, d → L for the long one (eq 6.10), D<sub>n</sub> = 35, D<sub>p</sub> = 12 cm²/s, S = 10<sup>−4</sup> cm². Reverse limit −2 V: the SCR then spans ' + (gr.W * 1e4).toFixed(2) + ' µm. Si, 300 K, n<sub>i</sub> = 10<sup>10</sup> cm<sup>−3</sup>, ε = 11.7ε<sub>0</sub>, kT/q = 25.9 mV.';
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
      bandStep(dt * st.speed);
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
    root._ixState = { st: st, frame: frame, setPreset: setPreset, model: function () { return st.model; }, setV: function (v) { setBias(v, true); frame(true); },
      warm: function (sec) { for (var t = 0; t < sec; t += 0.05) bandStep(0.05); frame(true); } }; // tests: run the band carriers ahead
  }

  window.IX = window.IX || {};
  window.IX[ID] = mount;
})();
