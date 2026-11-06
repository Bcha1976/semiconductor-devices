/* Interactive module "boltzmann": the barrier reading, Boltzmann tails, the four crossing fluxes (Ch5 Fig 5.6, Ch6 Fig 6.2).
   Physics (course reference junction, Si 300 K): V_d = (kT/q) ln(N_A N_D / n_i^2) (eq 5.13); depletion approximation with
   the step V_d - V (eqs 5.15-5.19, 6.1-6.2), N side grounded, V applied to P; inside the SCR the Boltzmann relations hold
   with flat quasi-Fermi levels: n(x) = N_D e^{q psi(x)/kT}, p(x) = N_A e^{-q(psi(x) + V_d - V)/kT} (psi = potential, 0 in N);
   edges n_p0 e^{V/V_T}, p_n0 e^{V/V_T} (6.5) and long-diode profiles (6.7); climbing (diffusion) flux / rolling (drift) flux
   = e^{-q(V_d-V)/kT} N_D / n_p0 = e^{V/V_T}; J = J_0 (e^{V/V_T} - 1) (6.9-6.10). V_T = 25.9 mV. */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var ID = 'boltzmann';
  var q = 1.602e-19, EPS = 11.7 * 8.854e-14, NI = 1e10, VT = 0.0259, EG = 1.12;
  var NA = 1e18, ND = 1e16, Dn = 35, Dp = 12, taun = 1e-7, taup = 1e-5, S = 1e-4;
  var Vd = VT * Math.log(NA * ND / (NI * NI));                    // 0.835 V
  var Ln = Math.sqrt(Dn * taun), Lp = Math.sqrt(Dp * taup);        // 18.7 um, 110 um
  var np0 = NI * NI / NA, pn0 = NI * NI / ND;                      // 1e2, 1e4 cm^-3
  var J0 = q * Dp * pn0 / Lp + q * Dn * np0 / Ln;                  // 2.1e-12 A/cm2
  var dEn = VT * Math.log(ND / NI), Ecn = EG / 2 - dEn;           // E_C - E_F in N (E_F(N) = 0)
  var KTD = 10 * VT;                                               // drawn kT (x10, pedagogical, as in Figs 5.6 and 6.2)
  var VMIN = -2, VMAX = 0.7, XMIN = -0.25, XMAX = 0.75;            // V, um
  var C = { ink: '#1d2430', grey: '#6B6B6B', navy: '#1F3A5F', acc: '#D9771A', el: '#1F4E9A', ho: '#C8641E',
    fld: '#2E7D4F', line: '#dde3ea', scr: '#e9edf2', elL: '#c9d6ec', hoL: '#f6d9bf' };

  function geom(V) {
    var phi = Math.max(Vd - V, 1e-6);
    var W = Math.sqrt(2 * EPS * phi / q * (1 / NA + 1 / ND));
    var xn = W * NA / (NA + ND), xp = -W * ND / (NA + ND);
    return { V: V, phi: phi, W: W, xn: xn, xp: xp, Em: q * ND * xn / EPS };
  }
  function psi(g, x) { // potential (V), N grounded, x in cm (eq 5.15 with phi)
    if (x <= g.xp) return -g.phi;
    if (x >= g.xn) return 0;
    if (x < 0) return q * NA / (2 * EPS) * (x - g.xp) * (x - g.xp) - g.phi;
    return -q * ND / (2 * EPS) * (x - g.xn) * (x - g.xn);
  }
  function nOf(g, x) { // electrons, cm^-3
    if (x >= g.xp) return ND * Math.exp(psi(g, x) / VT);
    return np0 + np0 * (Math.exp(g.V / VT) - 1) * Math.exp((x - g.xp) / Ln);
  }
  function pOf(g, x) {
    if (x <= g.xn) return NA * Math.exp(-(psi(g, x) + g.phi) / VT);
    return pn0 + pn0 * (Math.exp(g.V / VT) - 1) * Math.exp(-(x - g.xn) / Lp);
  }

  var CSS = [
    '.ix-boltzmann{color:#1d2430;font-family:inherit;line-height:1.35}',
    '.ix-boltzmann .ixb-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 6px}',
    '.ix-boltzmann button.ixb-b{font:600 13px inherit;font-family:inherit;padding:5px 11px;border:1px solid #c6d2e0;border-radius:6px;background:#fff;color:#1F3A5F;cursor:pointer}',
    '.ix-boltzmann button.ixb-b.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}',
    '.ix-boltzmann .ixb-watch{background:#fbf3ea;border-left:4px solid #D9771A;border-radius:6px;padding:7px 11px;margin:4px 0 8px;font-size:14px;min-height:2.7em}',
    '.ix-boltzmann .ixb-read{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:6px;margin:0 0 8px}',
    '.ix-boltzmann .ixb-read div{border:1px solid #dde3ea;border-radius:6px;padding:4px 9px;font-size:13px;background:#fff;min-width:0}',
    '.ix-boltzmann .ixb-read span{display:block;color:#6B6B6B;font-size:11.5px}',
    '.ix-boltzmann .ixb-read strong{font-weight:600;font-variant-numeric:tabular-nums}',
    '.ix-boltzmann .ixb-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;margin:0 0 6px}',
    '.ix-boltzmann .ixb-legend>span{display:inline-flex;align-items:center;gap:5px}',
    '.ix-boltzmann .ixb-pan{border:1px solid #dde3ea;border-radius:6px;background:#fff;margin:8px 0 0;overflow:hidden}',
    '.ix-boltzmann .ixb-pt{font-size:13px;font-weight:700;color:#1F3A5F;padding:7px 10px 0}',
    '.ix-boltzmann .ixb-pt span{font-weight:400;color:#6B6B6B}',
    '.ix-boltzmann svg.ixb-svg{display:block;width:100%;height:auto}',
    '.ix-boltzmann .ixb-cap{font-size:12.5px;color:#6B6B6B;margin:8px 2px 0}',
    '.ix-boltzmann i{font-style:italic}.ix-boltzmann sub,.ix-boltzmann sup{font-size:.72em;line-height:0}',
    '@media (max-width:520px){.ix-boltzmann .ixb-read{grid-template-columns:1fr 1fr}.ix-boltzmann .ixb-pt{font-size:12.5px}}'
  ].join('\n');
  function injectCSS() {
    if (document.getElementById('ix-' + ID + '-css')) return;
    var s = document.createElement('style'); s.id = 'ix-' + ID + '-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  // ---- svg string helpers
  function f1(x) { return x.toFixed(1); }
  function sb(s) { return '<tspan baseline-shift="sub" font-size="72%">' + s + '</tspan>'; }
  function sp(s) { return '<tspan baseline-shift="super" font-size="72%">' + s + '</tspan>'; }
  function it(s) { return '<tspan font-style="italic">' + s + '</tspan>'; }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + (o.fs || 11) + '"' + (o.a ? ' text-anchor="' + o.a + '"' : '') +
      ' fill="' + (o.c || C.ink) + '"' + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  function ln(x1, y1, x2, y2, c, w, d) {
    return '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '" stroke="' + c + '" stroke-width="' + (w || 1) + '"' + (d ? ' stroke-dasharray="' + d + '"' : '') + '/>';
  }
  function harrow(x1, y, x2, c, w, d) {
    var dir = x2 > x1 ? 1 : -1, len = Math.abs(x2 - x1);
    if (len < 2) return '';
    var hl = Math.min(7 + w, len * 0.8), hw = 3 + w, xe = x2 - dir * hl;
    return ln(x1, y, xe, y, c, w, d) + '<path d="M' + f1(x2) + ' ' + f1(y) + 'L' + f1(xe) + ' ' + f1(y - hw) + 'L' + f1(xe) + ' ' + f1(y + hw) + 'Z" fill="' + c + '"/>';
  }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v, d) {
    if (d == null) d = 2;
    if (v === 0) return '0';
    var s = v < 0 ? '−' : ''; v = Math.abs(v);
    var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e), ms = m.toFixed(d - 1);
    if (parseFloat(ms) >= 10) { e += 1; ms = (m / 10).toFixed(d - 1); }
    if (e >= -2 && e <= 3) return s + String(parseFloat(v.toPrecision(d)));
    return s + (ms === '1' || ms === '1.0' ? '' : ms + '×') + '10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }
  function fmtV(v) { return (v > 0.0005 ? '+' : v < -0.0005 ? '−' : '') + Math.abs(v).toFixed(3) + ' V'; }
  function fmtI(I) {
    var a = Math.abs(I), s = I < 0 ? '−' : '';
    if (a < 1e-30) return '0';
    if (a >= 1e-3) return s + (a * 1e3).toPrecision(3) + ' mA';
    if (a >= 1e-6) return s + (a * 1e6).toPrecision(3) + ' µA';
    if (a >= 1e-9) return s + (a * 1e9).toPrecision(3) + ' nA';
    return s + sci(a, 2) + ' A';
  }

  function mount(root) {
    injectCSS();
    root.innerHTML = '';
    root.classList.add('ix-' + ID);
    var K = window.IX._kit;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = { V: 0, speed: 1, playing: !reduce, parts: [], acc: [0, 0, 0, 0], last: 0, dirty: true };

    function h(tag, cls, html, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
    function setV(v) { v = Math.max(VMIN, Math.min(VMAX, Math.round(v * 1000) / 1000)); if (v !== st.V) { st.V = v; st.dirty = true; } }
    var REG = [
      { label: 'Forward', title: 'Forward bias V = +0.6 V: the step falls to 0.235 eV, the climbing (diffusion) flux grows by e^(V/V_T) = 1.2×10¹⁰', apply: function () { setV(0.6); }, is: function () { return st.V === 0.6; } },
      { label: 'Equilibrium (0 V)', title: 'V = 0: step qV_d = 0.835 eV, diffusion = drift for each carrier, net current zero', apply: function () { setV(0); }, is: function () { return st.V === 0; } },
      { label: 'Reverse', title: 'Reverse bias V = −2 V: the step rises to 2.835 eV, nobody climbs it; only the drift (rolling down) is left, J → −J₀', apply: function () { setV(-2); }, is: function () { return st.V === -2; } }
    ];
    var ctl = K ? K.controls({
      sliders: [{ key: 'V', label: '<i>V</i>', aria: 'Applied voltage V (on P, N grounded)', title: 'Applied voltage V on P, N grounded', min: VMIN, max: VMAX, step: 0.005,
        get: function () { return st.V; }, set: setV, fmt: fmtV }],
      regimes: REG,
      speed: { get: function () { return st.speed; }, set: function (s) { st.speed = s; } }
    }) : null;
    function stripTo(parent, tag) { if (ctl) parent.appendChild(ctl.strip({ tag: tag, inside: true })); }

    // ---- DOM
    var top = h('div', 'ixb-row', null, root);
    var bPlay = h('button', 'ixb-b', '', top);
    bPlay.type = 'button';
    bPlay.addEventListener('click', function () { st.playing = !st.playing; syncPlay(); });
    function syncPlay() { bPlay.textContent = st.playing ? '❚❚ Pause carriers' : '▶ Move carriers'; bPlay.classList.toggle('on', st.playing); }
    if (ctl) root.appendChild(ctl.strip({ top: true }));
    var watch = h('div', 'ixb-watch', '', root);
    var read = h('div', 'ixb-read', '', root);
    var legend = h('div', 'ixb-legend', '', root);
    legend.innerHTML =
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.3" fill="' + C.el + '"/></svg>electron</span>' +
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.1" fill="#fff" stroke="' + C.ho + '" stroke-width="1.8"/></svg>hole</span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.ink + '" stroke-width="2"/></svg><span><i>E</i><sub>C</sub>, <i>E</i><sub>V</sub></span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.el + '" stroke-width="2" stroke-dasharray="5 3"/></svg><span><i>E</i><sub>Fn</sub></span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.ho + '" stroke-width="2" stroke-dasharray="5 3"/></svg><span><i>E</i><sub>Fp</sub></span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="20" y2="5" stroke="' + C.ink + '" stroke-width="2"/><path d="M25 5l-6 -3.5v7z" fill="' + C.ink + '"/></svg>diffusion (climbs)</span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="20" y2="5" stroke="' + C.ink + '" stroke-width="2" stroke-dasharray="4 3"/><path d="M25 5l-6 -3.5v7z" fill="' + C.ink + '"/></svg>drift (rolls down)</span>';
    function panel(title) {
      var p = h('div', 'ixb-pan', null, root);
      h('div', 'ixb-pt', title, p);
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 'ixb-svg'); s.setAttribute('role', 'img'); p.appendChild(s);
      return { box: p, svg: s };
    }
    var PA = panel('(a) The barrier reading <span>· bands to scale, Boltzmann tails drawn with <i>kT</i> ×10</span>');
    stripTo(PA.box);
    var PB = panel('(b) The four fluxes that cross the SCR <span>· each in units of its drift flux</span>');
    stripTo(PB.box);
    var PC = panel('(c) Injection and pumping in a short diode <span>· straight minority profiles, linear, in units of their equilibrium value; majority levels not to scale</span>');
    stripTo(PC.box);
    PA.svg.setAttribute('aria-label', 'Band diagram with the Boltzmann distributions of electrons and holes and the carriers crossing the step');
    PB.svg.setAttribute('aria-label', 'Diffusion and drift fluxes of electrons and holes, and the net current');
    PC.svg.setAttribute('aria-label', 'Short diode: majority levels and straight-line minority profiles, raised at the SCR edges in forward bias, pumped to zero in reverse');
    var cap = h('div', 'ixb-cap', '', root);
    cap.innerHTML = 'Reference junction of Ch5–6: Si, <i>N</i><sub>A</sub> = 10<sup>18</sup> (P), <i>N</i><sub>D</sub> = 10<sup>16</sup> cm<sup>−3</sup> (N), <i>n</i><sub>i</sub> = 10<sup>10</sup> cm<sup>−3</sup>, <i>kT</i>/<i>q</i> = 25.9 mV, <i>V</i><sub>d</sub> = 0.835 V (eq 5.13), <i>V</i> on P, N grounded. ' +
      'Bands, SCR width (eqs 5.18, 6.2) and densities are computed to scale in the depletion approximation with the step <i>V</i><sub>d</sub> − <i>V</i>. Inside the SCR the quasi-Fermi levels are flat, so the Boltzmann relations hold at every point: ' +
      '<i>n</i>(<i>x</i>) = <i>N</i><sub>D</sub> e<sup><i>qψ</i>(<i>x</i>)/<i>kT</i></sup> and <i>p</i>(<i>x</i>) = <i>N</i><sub>A</sub> e<sup>−<i>q</i>(<i>ψ</i>(<i>x</i>) + <i>V</i><sub>d</sub> − <i>V</i>)/<i>kT</i></sup> (<i>ψ</i> = potential, 0 in N); the edges follow <i>n</i><sub>p0</sub>e<sup><i>V</i>/<i>V</i><sub>T</sub></sup>, <i>p</i><sub>n0</sub>e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> (6.5), and <i>J</i> = <i>J</i><sub>0</sub>(e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> − 1) with <i>J</i><sub>0</sub> = 2.1×10<sup>−12</sup> A/cm² (6.9–6.10), <i>S</i> = 10<sup>−4</sup> cm². ' +
      'Pedagogical scales, as in Figs 5.6 and 6.2: in (a) the energy distributions <i>n</i>(<i>E</i>) ∝ √(<i>E</i> − <i>E</i><sub>C</sub>) e<sup>−(<i>E</i>−<i>E</i><sub>C</sub>)/<i>kT</i></sup> are drawn with <i>kT</i> ten times too large (the real climbing fraction is in the readouts: 10<sup>−14</sup> at equilibrium); the moving carriers are schematic, their rates compressed (logarithmic in forward bias). ' +
      'In (b) the arrows are on a compressed scale (linear below the drift level, then ×10 per step). ' +
      '(c) is the <b>short diode</b> of the Ch6 worked example (same doping and lifetimes, <i>d</i><sub>p</sub> = 2 µm ≪ <i>L</i><sub>n</sub>, <i>d</i><sub>n</sub> = 10 µm ≪ <i>L</i><sub>p</sub>, ohmic contacts at <i>x</i><sub>g</sub> and <i>x</i><sub>d</sub>), drawn as in the Ch8 cartoons: the majority levels at the top are not to scale; below, the minority densities are straight lines from the equilibrium value at the contact (dashed) to <i>n</i><sub>p0</sub>e<sup><i>V</i>/<i>V</i><sub>T</sub></sup>, <i>p</i><sub>n0</sub>e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> at the SCR edges, on a linear scale in units of the equilibrium value (0 … 1.3 e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> in forward, 0 … 1.3 at 0 V and in reverse). Their slopes give the diffusion currents, <i>J</i> = <i>J</i><sub>0</sub>(e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> − 1) with the short-diode <i>J</i><sub>0</sub> = 2.2×10<sup>−11</sup> A/cm² (ten times the long diode of (a)–(b) and the readouts). Lengths not to scale (the SCR is widened).';

    // ---- layout
    var L = {};
    function layout() {
      var w = Math.max(300, Math.round(PA.box.clientWidth || root.clientWidth || 760));
      var ph = w < 560;
      L.w = w; L.ph = ph; L.ML = ph ? 44 : 62; L.MR = ph ? 44 : 62; L.PW = w - L.ML - L.MR;
      L.ppu = L.PW / (XMAX - XMIN);
      L.fs = ph ? 10 : 11;
      L.a = { top: 26, h: ph ? 300 : 340 }; L.aH = L.a.top + L.a.h + 36;
      L.b = { h: ph ? 196 : 176 };
      L.c = { top: 18, bt: 74, bh: ph ? 170 : 190 }; L.cH = L.c.bt + L.c.bh + 54;
      [[PA.svg, L.aH], [PB.svg, L.b.h], [PC.svg, L.cH]].forEach(function (p) {
        p[0].setAttribute('viewBox', '0 0 ' + w + ' ' + p[1]); p[0].setAttribute('width', w); p[0].setAttribute('height', p[1]);
      });
      // energy scale of (a): fixed over the whole range of V
      L.emax = Ecn + (Vd - VMIN) + 0.12;
      L.emin = Ecn + (Vd - VMAX) - EG - 5.2 * KTD;
      st.parts = []; st.dirty = true;
    }
    function X(xum) { return L.ML + (xum - XMIN) * L.ppu; }
    function Ey(E) { return L.a.top + (L.emax - E) / (L.emax - L.emin) * L.a.h; }
    function xsSCR(g) {
      var xs = [], i, N = 140, a = g.xp * 1e4, b = g.xn * 1e4;
      for (i = 0; i <= 30; i++) xs.push(XMIN + (a - XMIN) * i / 30);
      for (i = 0; i <= 30; i++) xs.push(a + (0 - a) * i / 30);
      for (i = 0; i <= N; i++) xs.push(b * i / N);
      for (i = 0; i <= 30; i++) xs.push(b + (XMAX - b) * i / 30);
      return xs;
    }
    function Ec(g, xum) { return Ecn - psi(g, xum * 1e-4); }
    function pathOf(xs, fy) { var d = ''; for (var i = 0; i < xs.length; i++) d += (i ? 'L' : 'M') + f1(X(xs[i])) + ' ' + f1(fy(xs[i])); return d; }

    // ---- (a) static part (redrawn when V changes)
    var aStatic = '';
    function drawAStatic(g) {
      var s = '', fs = L.fs, xs = xsSCR(g), x0 = L.ML, x1 = L.ML + L.PW, P = L.a;
      var xpP = X(g.xp * 1e4), xnP = X(g.xn * 1e4);
      s += '<rect x="' + f1(xpP) + '" y="' + P.top + '" width="' + f1(Math.max(1, xnP - xpP)) + '" height="' + P.h + '" fill="' + C.scr + '"/>';
      s += '<rect x="' + x0 + '" y="' + P.top + '" width="' + L.PW + '" height="' + P.h + '" fill="none" stroke="' + C.line + '"/>';
      s += txt((xpP + xnP) / 2, P.top - 6, 'SCR', { a: 'middle', fs: fs, c: C.grey });
      s += txt(x0 + 4, P.top - 6, 'P', { fs: fs + 2, w: 700, c: C.ho });
      s += txt(x1 - 4, P.top - 6, 'N', { fs: fs + 2, w: 700, c: C.el, a: 'end' });
      // Boltzmann tails: electrons of N above E_C(N) (right), holes of P below E_V(P) (left)
      var top = Ecn + g.phi, EcP = Ecn + g.phi, EvP = EcP - EG, EvN = Ecn - EG;
      var wmax = Math.min(0.2 * L.PW, L.ph ? 64 : 104), fmax = Math.sqrt(0.5) * Math.exp(-0.5);
      var nE = 70, emaxT = 5.2 * KTD, i, e, f;
      var dAll = 'M' + x1 + ' ' + f1(Ey(Ecn)), dDark = '', darkStarted = false;
      var ptsDark = [];
      for (i = 0; i <= nE; i++) {
        e = emaxT * i / nE; f = Math.sqrt(e / KTD) * Math.exp(-e / KTD) / fmax;
        var xx = x1 - 2 - f * wmax, yy = Ey(Ecn + e);
        dAll += 'L' + f1(xx) + ' ' + f1(yy);
        if (Ecn + e >= top) ptsDark.push([xx, yy]);
      }
      dAll += 'L' + (x1 - 2) + ' ' + f1(Ey(Ecn + emaxT)) + 'Z';
      s += '<path d="' + dAll + '" fill="' + C.elL + '" fill-opacity="0.75" stroke="' + C.el + '" stroke-width="1"/>';
      if (ptsDark.length > 1) {
        dDark = 'M' + (x1 - 2) + ' ' + f1(ptsDark[0][1]);
        ptsDark.forEach(function (p) { dDark += 'L' + f1(p[0]) + ' ' + f1(p[1]); });
        dDark += 'L' + (x1 - 2) + ' ' + f1(ptsDark[ptsDark.length - 1][1]) + 'Z';
        s += '<path d="' + dDark + '" fill="' + C.el + '" fill-opacity="0.85"/>';
      }
      var hAll = 'M' + (x0 + 2) + ' ' + f1(Ey(EvP)), pts2 = [];
      for (i = 0; i <= nE; i++) {
        e = emaxT * i / nE; f = Math.sqrt(e / KTD) * Math.exp(-e / KTD) / fmax;
        var xh = x0 + 2 + f * wmax, yh = Ey(EvP - e);
        hAll += 'L' + f1(xh) + ' ' + f1(yh);
        if (EvP - e <= EvN) pts2.push([xh, yh]);
      }
      hAll += 'L' + (x0 + 2) + ' ' + f1(Ey(EvP - emaxT)) + 'Z';
      s += '<path d="' + hAll + '" fill="' + C.hoL + '" fill-opacity="0.8" stroke="' + C.ho + '" stroke-width="1"/>';
      if (pts2.length > 1) {
        var d2 = 'M' + (x0 + 2) + ' ' + f1(pts2[0][1]);
        pts2.forEach(function (p) { d2 += 'L' + f1(p[0]) + ' ' + f1(p[1]); });
        d2 += 'L' + (x0 + 2) + ' ' + f1(pts2[pts2.length - 1][1]) + 'Z';
        s += '<path d="' + d2 + '" fill="' + C.ho + '" fill-opacity="0.85"/>';
      }
      // bands
      s += '<path d="' + pathOf(xs, function (x) { return Ey(Ec(g, x)); }) + '" fill="none" stroke="' + C.ink + '" stroke-width="2"/>';
      s += '<path d="' + pathOf(xs, function (x) { return Ey(Ec(g, x) - EG); }) + '" fill="none" stroke="' + C.ink + '" stroke-width="2"/>';
      // top-of-step guide over the N side, bottom-of-step guide under the P side
      s += ln(xnP, Ey(top), x1, Ey(top), '#8c99a8', 1, '2 3');
      s += ln(x0, Ey(EvN), xpP, Ey(EvN), '#8c99a8', 1, '2 3');
      // quasi-Fermi levels (flat across the window: the window is much shorter than L_n, L_p)
      if (Math.abs(g.V) < 0.0005) {
        s += ln(x0, Ey(0), x1, Ey(0), C.navy, 2, '7 4');
        s += txt(X(-0.11), Ey(0) - 5, it('E') + sb('F') + ' flat', { fs: fs, c: C.navy, w: 600, a: 'middle' });
      } else {
        s += ln(x0, Ey(0), x1, Ey(0), C.el, 2, '7 4');
        s += ln(x0, Ey(-g.V), x1, Ey(-g.V), C.ho, 2, '7 4');
        var yq1 = Ey(0), yq2 = Ey(-g.V), xq = L.ML + L.PW * 0.45;
        var upN = g.V > 0; // upper level labelled on the P side above its line, lower level on the N side below its line
        s += txt(upN ? X(-0.11) : x0 + 4, Math.min(yq1, yq2) - 5, it('E') + sb(upN ? 'Fn' : 'Fp') + (upN ? '' : ' = ' + it('E') + sb('Fn') + ' + q|' + it('V') + '|'), { fs: fs, c: upN ? C.el : C.ho, w: 600, a: upN ? 'middle' : 'start' });
        s += txt(X(Math.max(g.xn * 1e4, 0.3) + 0.1), Math.max(yq1, yq2) + 13, it('E') + sb(upN ? 'Fp' : 'Fn'), { fs: fs, c: upN ? C.ho : C.el, w: 600, a: 'middle' });
        if (upN && Math.abs(yq2 - yq1) > 14) { // forward: the bracket sits in the gap of the N side; reverse: written in the label
          var xa = L.ML + L.PW * 0.56;
          s += ln(xa, Math.min(yq1, yq2) + 2, xa, Math.max(yq1, yq2) - 2, C.navy, 1.2);
          s += txt(xa + 5, (yq1 + yq2) / 2 + 4, 'q' + it('V'), { fs: fs, c: C.navy, w: 600 });
        }
      }
      // band labels
      s += txt(x1 + 4, Ey(Ecn) + 4, it('E') + sb('C'), { fs: fs }) + txt(x1 + 4, Ey(EvN) + 4, it('E') + sb('V'), { fs: fs });
      s += txt(x0 - 4, Ey(EcP) + 4, it('E') + sb('C'), { fs: fs, a: 'end' }) + txt(x0 - 4, Ey(EvP) + 4, it('E') + sb('V'), { fs: fs, a: 'end' });
      // the step q(Vd - V): bracket in the N region, left of the tail
      var xb = x1 - (L.ph ? 76 : 126) - 10;
      if (Ey(Ecn) - Ey(top) > 16) {
        s += ln(xb, Ey(top) + 2, xb, Ey(Ecn) - 2, C.navy, 1.3);
        s += '<path d="M' + f1(xb - 3.5) + ' ' + f1(Ey(top) + 8) + 'l3.5 -6l3.5 6zM' + f1(xb - 3.5) + ' ' + f1(Ey(Ecn) - 8) + 'l3.5 6l3.5 -6z" fill="' + C.navy + '"/>';
      }
      var stepT = (Math.abs(g.V) < 0.0005 ? 'q' + it('V') + sb('d') : 'q(' + it('V') + sb('d') + '−' + it('V') + ')') + ' = ' + g.phi.toFixed(3) + ' eV';
      var yst = Ey(Ecn) - Ey(top) > 30 && !L.ph ? (Ey(top) + Ey(Ecn)) / 2 + 4 : Ey(top + 0.4); // small step: above the band where the climbers travel
      if (g.V < -0.25) { // large step: two lines left of the bracket, under its top guide, clear of the bent bands
        s += txt(xb - 6, Ey(top) + 16, 'q(' + it('V') + sb('d') + '−' + it('V') + ')', { fs: fs + 0.5, c: C.navy, w: 600, a: 'end' });
        s += txt(xb - 6, Ey(top) + 30, '= ' + g.phi.toFixed(3) + ' eV', { fs: fs + 0.5, c: C.navy, w: 600, a: 'end' });
      }
      else s += txt(xb - 6, yst, stepT, { fs: fs + 0.5, c: C.navy, w: 600, a: 'end' });
      // tail labels
      var climbs = Math.exp(-g.phi / VT);
      s += txt(x1 - 4, Ey(Ecn + emaxT) - 6, L.ph ? 'e⁻ of N' : 'electrons of N: Boltzmann tail', { fs: fs - 0.5, c: C.el, a: 'end' });
      if (!L.ph) s += txt(x0 + wmax + 6, Ey(EvP - 1.6 * KTD), 'holes of P', { fs: fs - 0.5, c: C.ho });
      else if (Ey(EvP - emaxT) + 13 < P.top + P.h - 3) s += txt(x0 + 3, Ey(EvP - emaxT) + 12, 'h⁺ of P', { fs: fs - 0.5, c: C.ho });
      // climbing fraction
      var yCl = Ey(L.emin) - 6;
      s += txt(x1 - 4, yCl, (L.ph ? 'climbs: ' : 'fraction that can climb, e' + sp('−q(Vd−V)/kT') + ' = ') + sci(climbs, 2), { fs: fs, c: C.el, a: 'end', w: 600 });
      // x axis
      var ya = P.top + P.h;
      s += axisX(ya, true);
      return s;
    }
    function axisX(y, edges) {
      var s = '', step = L.ph ? 0.25 : 0.25, g = st.g;
      for (var x = XMIN; x <= XMAX + 1e-9; x += step) {
        var Xp = X(x);
        s += ln(Xp, y, Xp, y + 4, '#9aa6b5', 1);
        s += txt(Xp, y + 15, (Math.abs(x) < 1e-9 ? '0' : x.toFixed(2).replace('-', '−')), { a: 'middle', fs: L.fs - 0.5, c: C.grey });
      }
      s += txt(L.ML + L.PW, y + 29, 'x (µm), junction at 0', { a: 'end', fs: L.fs, c: C.grey });
      return s;
    }

    // ---- (a) moving carriers
    // kinds: 0 electron diffusion (climbs, N -> P), 1 electron drift (rolls down, P -> N), 2 hole diffusion (P -> N), 3 hole drift (N -> P)
    function spawn(kind, g) {
      var EcP = Ecn + g.phi, EvN = Ecn - EG, EvP = EcP - EG, p = { k: kind, a: 0 };
      var r = Math.random();
      if (kind === 0) { p.x = XMAX - 0.03 - 0.12 * Math.random(); p.E = EcP + 0.02 + KTD * 0.9 * (-Math.log(1 - 0.85 * r)) * 0.6; p.dir = -1; }
      else if (kind === 1) { p.x = XMIN + 0.18 + (g.xp * 1e4 - 0.02 - XMIN - 0.18) * Math.random(); p.dE = 0.04 + 0.08 * Math.random(); p.dir = 1; }
      else if (kind === 2) { p.x = XMIN + 0.03 + 0.12 * Math.random(); p.E = EvN - 0.02 - KTD * 0.9 * (-Math.log(1 - 0.85 * r)) * 0.6; p.dir = 1; }
      else { p.x = Math.min(XMAX - 0.2, g.xn * 1e4 + 0.04) + 0.12 * Math.random(); p.dE = 0.04 + 0.08 * Math.random(); p.dir = -1; }
      st.parts.push(p);
    }
    function rates(g) {
      var ratio = Math.exp(g.V / VT), r0 = 0.55;
      var rd = ratio <= 1 ? r0 * ratio : r0 * Math.min(1 + 1.5 * Math.log10(ratio), 17);
      if (rd < 0.004) rd = 0;
      return [rd, r0, rd, r0];
    }
    function stepParts(dt, g) {
      var R = rates(g), i;
      for (i = 0; i < 4; i++) {
        st.acc[i] += R[i] * dt;
        while (st.acc[i] >= 1) { st.acc[i] -= 1; spawn(i, g); }
      }
      var v = 0.085; // um per second at speed 1 (slow, easy to follow)
      st.parts.forEach(function (p) {
        p.x += p.dir * v * dt * (p.k === 1 || p.k === 3 ? (inSCR(g, p.x) ? 1.6 : 1) : 1);
        p.a += dt;
      });
      st.parts = st.parts.filter(function (p) { return p.x > XMIN + 0.005 && p.x < XMAX - 0.005; });
    }
    function inSCR(g, x) { return x > g.xp * 1e4 && x < g.xn * 1e4; }
    function drawParts(g) {
      var e = '', hh = '', r = L.ph ? 3.4 : 4;
      st.parts.forEach(function (p) {
        var y;
        if (p.k === 0) y = Ey(p.E);
        else if (p.k === 1) y = Ey(Ec(g, p.x) + p.dE);
        else if (p.k === 2) y = Ey(p.E);
        else y = Ey(Ec(g, p.x) - EG - p.dE);
        var fade = Math.min(1, p.a / 0.4), edgeFade = Math.min(1, (p.x - XMIN) / 0.05, (XMAX - p.x) / 0.05);
        var o = Math.max(0, Math.min(fade, edgeFade)).toFixed(2);
        if (p.k < 2) e += '<circle cx="' + f1(X(p.x)) + '" cy="' + f1(y) + '" r="' + r + '" fill="' + C.el + '" opacity="' + o + '"/>';
        else hh += '<circle cx="' + f1(X(p.x)) + '" cy="' + f1(y) + '" r="' + (r - 0.4) + '" fill="#fff" stroke="' + C.ho + '" stroke-width="1.7" opacity="' + o + '"/>';
      });
      return e + hh;
    }

    // ---- (b) fluxes
    function lenOf(f, base) { return f <= 1 ? base * f : base * (1 + Math.log10(f) / 1.0 * 0.32); }
    function drawB(g) {
      var s = '', fs = L.fs, w = L.w, xm = L.ML + L.PW / 2;
      var ratio = Math.exp(g.V / VT);
      var half = L.PW / 2 - 8, base = half / (1 + 12 * 0.32);
      var rows = L.ph ? [34, 62, 104, 132, 172] : [30, 54, 92, 116, 156];
      s += ln(xm, 14, xm, rows[3] + 12, '#9aa6b5', 1, '2 3');
      s += txt(xm - 4, 12, '← towards P', { a: 'end', fs: fs - 0.5, c: C.grey }) + txt(xm + 4, 12, 'towards N →', { fs: fs - 0.5, c: C.grey });
      var lD = Math.min(lenOf(ratio, base), half), lR = base;
      function lab(x, y, t, c, anchor) { return txt(x, y + 4, t, { fs: fs, c: c, a: anchor }); }
      var dTxt = ratio > 0.9995 && ratio < 1.0005 ? '= drift' : '×' + sci(ratio, 2);
      // electrons: diffusion N->P (left), drift P->N (right)
      s += txt(L.ML - 6, rows[0] + 4, 'e⁻', { a: 'end', fs: fs + 1, w: 700, c: C.el });
      s += harrow(xm, rows[0], xm - lD, C.el, 2.6);
      s += harrow(xm, rows[1], xm + lR, C.el, 2.2, '6 3');
      s += lab(Math.max(L.ML + 2, xm - lD - 6) , rows[0], '', C.el, 'end');
      s += txt(xm + 6, rows[0] + 4, 'diffusion ' + dTxt, { fs: fs, c: C.el });
      s += txt(xm - 6, rows[1] + 4, 'drift (1)', { fs: fs, c: C.el, a: 'end' });
      // holes: diffusion P->N (right), drift N->P (left)
      s += txt(L.ML - 6, rows[2] + 4, 'h⁺', { a: 'end', fs: fs + 1, w: 700, c: C.ho });
      s += harrow(xm, rows[2], xm + lD, C.ho, 2.6);
      s += harrow(xm, rows[3], xm - lR, C.ho, 2.2, '6 3');
      s += txt(xm - 6, rows[2] + 4, 'diffusion ' + dTxt, { fs: fs, c: C.ho, a: 'end' });
      s += txt(xm + 6, rows[3] + 4, 'drift (1)', { fs: fs, c: C.ho });
      // net current
      var J = J0 * (ratio - 1), I = J * S, y = rows[4];
      var eq = Math.abs(g.V) < 0.0005;
      s += '<rect x="' + L.ML + '" y="' + (y - 16) + '" width="' + L.PW + '" height="28" rx="5" fill="' + (eq ? '#eef6f1' : '#fdf3e7') + '" stroke="' + (eq ? '#b9d9c5' : '#ecd3b8') + '"/>';
      if (eq) {
        s += txt(xm, y + 3, L.ph ? 'balanced: net current J = 0' : 'equilibrium: each diffusion flux is balanced by its drift flux, net current J = 0', { a: 'middle', fs: fs + 0.5, w: 600, c: C.fld });
      } else {
        var dir = g.V > 0 ? 1 : -1, la = Math.min(L.ph ? 46 : 70, L.PW * 0.16);
        var ax = dir > 0 ? L.ML + 10 : L.ML + 10 + la;
        s += harrow(ax, y - 2, ax + dir * la, C.acc, 3);
        var t = (L.ph ? 'net ' : 'net current ') + 'I = ' + fmtI(I) + (g.V > 0 ? (L.ph ? ', P → N' : ', from P to N (diffusion wins)') : (L.ph ? ' ≈ −I₀' : ' ≈ −I₀: only the drift is left'));
        s += txt(L.ML + la + 20, y + 3, t, { fs: fs + 0.5, w: 600, c: '#a8530b' });
      }
      return s;
    }

    // ---- (c) short diode: majority levels (not to scale) and minority profiles in units of their equilibrium value (Ch6 sec 6.7, Ch8 cartoons)
    function fmtJ(J) {
      var a = Math.abs(J), s = J < 0 ? '−' : '';
      if (a < 1e-30) return '0';
      return s + sci(a, 2) + ' A/cm²';
    }
    function drawC(g) {
      var s = '', fs = L.fs, ph = L.ph, P = L.c;
      var ratio = Math.exp(g.V / VT), eq = Math.abs(g.V) < 0.0005, fwd = !eq && g.V > 0;
      var mg = ph ? 8 : 12, x0 = L.ML + mg, x3 = L.ML + L.PW - mg, PWc = x3 - x0, x1 = x0 + PWc * 0.34, x2 = x0 + PWc * 0.42;
      var bt = P.bt, bh = P.bh, yb = bt + bh;
      var ymax = fwd ? Math.max(ratio, 1) * 1.3 : 1.3;               // scale, in units of the equilibrium value
      function Y(v) { return yb - Math.min(v / ymax, 1.04) * bh; }
      function nrm(v) { return v / ymax; }
      function Yn(f) { return yb - f * bh; }                          // y of a normalised level
      // u: 0 at the ohmic contact, 1 at the SCR edge
      var SP = { X: function (u) { return x0 + u * (x1 - x0); }, w: x1 - x0, c: C.el, cL: '#e3eaf6', toC: 'start', toE: 'end', ce: x0, ee: x1 };
      var SN = { X: function (u) { return x3 - u * (x3 - x2); }, w: x3 - x2, c: C.ho, cL: '#fbe9da', toC: 'end', toE: 'start', ce: x3, ee: x2 };
      // frame, SCR strip, contacts
      s += '<rect x="' + f1(x1) + '" y="' + (P.top - 2) + '" width="' + f1(x2 - x1) + '" height="' + (yb - P.top + 2) + '" fill="' + C.scr + '"/>';
      s += '<rect x="' + f1(x0) + '" y="' + bt + '" width="' + f1(PWc) + '" height="' + bh + '" fill="none" stroke="' + C.line + '"/>';
      s += txt((x1 + x2) / 2, P.top - 6, 'SCR', { a: 'middle', fs: fs - 0.5, c: C.grey });
      [[x0 - 6, x0], [x3, x3 + 6]].forEach(function (c) {
        s += '<rect x="' + f1(c[0]) + '" y="' + (P.top - 2) + '" width="6" height="' + (yb - P.top + 2) + '" fill="#9aa6b5"/>';
      });
      // majority levels, not to scale, with break marks on the axes
      var yMP = P.top + 16, yMN = P.top + 34;
      s += ln(x0, yMP, x1, yMP, C.ho, 2.2) + ln(x2, yMN, x3, yMN, C.el, 2.2);
      s += txt(x0 + 5, yMP - 5, it('p') + ' = ' + it('N') + sb('A') + ' = 10¹⁸', { fs: fs, c: C.ho, w: 600 });
      s += txt(x3 - 5, yMN - 5, it('n') + ' = ' + it('N') + sb('D') + ' = 10¹⁶ cm⁻³', { fs: fs, c: C.el, w: 600, a: 'end' });
      var yBr = bt - 15;
      [x0, x3].forEach(function (x) {
        s += '<path d="M' + f1(x - 6) + ' ' + f1(yBr + 1) + 'l12 -5M' + f1(x - 6) + ' ' + f1(yBr + 6) + 'l12 -5" stroke="' + C.ink + '" stroke-width="1.2" fill="none"/>';
      });
      s += txt((x0 + x1) / 2 + (ph ? 0 : 20), yBr + 4, ph ? '⋮ not to scale' : 'majority: not to scale ⋮', { fs: fs - 1, c: C.grey, a: 'middle' });
      // minority axis (same scale both sides: n/n_p0 in P, p/p_n0 in N)
      var tk = [[0, '0'], [ymax, sci(ymax, 2)]];
      if (nrm(1) > 0.12) tk.push([1, '1']);
      tk.forEach(function (t) {
        var tf = ph && t[1].length > 3 ? fs - 2 : fs - 1;
        s += ln(x0 - 9, Y(t[0]), x0 - 6, Y(t[0]), '#9aa6b5') + txt(x0 - 10, Y(t[0]) + 3.5, t[1], { a: 'end', fs: tf, c: C.el });
        s += ln(x3 + 6, Y(t[0]), x3 + 9, Y(t[0]), '#9aa6b5') + txt(x3 + 10, Y(t[0]) + 3.5, t[1], { fs: tf, c: C.ho });
      });
      if (!ph) {
        var ym = bt + bh / 2;
        s += '<text x="14" y="' + f1(ym) + '" font-size="' + (fs - 0.5) + '" fill="' + C.el + '" text-anchor="middle" transform="rotate(-90 14 ' + f1(ym) + ')">' + it('n') + '/' + it('n') + sb('p0') + '</text>';
        s += '<text x="' + (L.w - 14) + '" y="' + f1(ym) + '" font-size="' + (fs - 0.5) + '" fill="' + C.ho + '" text-anchor="middle" transform="rotate(90 ' + (L.w - 14) + ' ' + f1(ym) + ')">' + it('p') + '/' + it('p') + sb('n0') + '</text>';
      }
      // the two sides
      function side(S, isP) {
        var o = '', X = S.X, c = S.c, edge = ratio;
        var lvl = function (u) { return 1 + (edge - 1) * u; };
        var car = isP ? it('n') : it('p'), eqn = isP ? it('n') + sb('p0') : it('p') + sb('n0'), eqv = isP ? '10²' : '10⁴';
        var xe = isP ? it('x') + sb('p') : it('x') + sb('n'), N0 = isP ? np0 : pn0;
        // dashed equilibrium level
        o += ln(Math.min(X(0), X(1)), Y(1), Math.max(X(0), X(1)), Y(1), c, 1.3, '5 4');
        // excess (forward) or deficit (reverse) shaded between profile and equilibrium
        if (!eq) o += '<path d="M' + f1(X(0)) + ' ' + f1(Y(1)) + 'L' + f1(X(1)) + ' ' + f1(Y(1)) + 'L' + f1(X(1)) + ' ' + f1(Y(edge)) + 'Z" fill="' + S.cL + '" fill-opacity="0.85"/>';
        // the profile: straight line (short region)
        o += ln(X(0), Y(1), X(1), Y(edge), c, 2.6);
        o += '<circle cx="' + f1(X(1)) + '" cy="' + f1(Y(edge)) + '" r="3.6" fill="' + (isP ? c : '#fff') + '" stroke="' + c + '" stroke-width="1.6"/>';
        o += '<circle cx="' + f1(X(0)) + '" cy="' + f1(Y(1)) + '" r="2.6" fill="' + c + '"/>';
        var fsl = ph ? fs - 1 : fs, wmax = S.w - 8;
        function at(u) { return isP ? X(u) : X(u); }
        function lbl(u, f, t, anc, o2) { o2 = o2 || {}; return txt(X(u), Yn(f), t, { fs: o2.fs || fsl, c: o2.c || c, w: o2.w, a: anc }); }
        if (fwd) {
          // edge value, written near the contact side at the top (the line is low there)
          var t1 = '×e' + sp(it('V') + '/' + it('V') + sb('T')) + ' = ' + sci(edge, 2), t2 = car + '(' + xe + ') = ' + sci(N0 * edge, 2) + (ph ? '' : ' cm⁻³');
          o += txt(isP ? X(0) + 5 : X(0) - 5, bt + 13, t1, { fs: fsl, c: c, w: 600, a: S.toC });
          o += txt(isP ? X(0) + 5 : X(0) - 5, bt + 26, t2, { fs: fsl, c: c, w: 600, a: S.toC });
          // diffusion flux: from the edge towards the contact, under the line
          o += harrow(X(0.9), Yn(0.27), X(0.58), c, 2);
          o += lbl(0.74, 0.27 - 13 / bh, 'diffusion flux', 'middle', { fs: fs - 1.5 });
          // equilibrium level, now at the bottom of the scale
          o += txt(isP ? X(1) - 4 : X(1) + 4, Y(1) - 4, eqn + ' = ' + eqv + (ph ? '' : ' (≈ 0 here)'), { fs: fs - 1.5, c: c, a: S.toE });
        } else if (!eq) {
          // reverse: pumped down to ≈ 0 at the edge
          o += txt(isP ? X(1) - 4 : X(1) + 4, Y(1) - 5, (ph ? eqn : 'equilibrium ' + eqn) + ' = ' + eqv, { fs: fs - 1, c: c, a: S.toE });
          o += txt(isP ? X(1) - 5 : X(1) + 5, Yn(0.6), 'pumped:', { fs: fsl, c: c, w: 600, a: S.toE });
          o += txt(isP ? X(1) - 5 : X(1) + 5, Yn(0.6) + 13, car + '(' + xe + ') ≈ 0', { fs: fsl, c: c, w: 600, a: S.toE });
          o += harrow(X(0.08), Yn(0.22), X(0.4), c, 2);
          o += lbl(0.08, 0.22 - 13 / bh, 'diffusion flux', S.toC, { fs: fs - 1.5 });
        } else {
          o += txt((X(0) + X(1)) / 2, Y(1) - 6, eqn + ' = ' + eqv + ' cm⁻³', { fs: fsl, c: c, w: 600, a: 'middle' });
          o += txt((X(0) + X(1)) / 2, Yn(0.4), ph && isP ? 'flat' : 'flat: no diffusion', { fs: fs - 1, c: c, a: 'middle' });
        }
        return o;
      }
      s += side(SP, true) + side(SN, false);
      // x axis: contacts, SCR edges, lengths
      var ya = yb;
      [[x0, it('x') + sb('g'), 'middle'], [x1, it('x') + sb('p'), 'end'], [x2, it('x') + sb('n'), 'start'], [x3, it('x') + sb('d'), 'middle']].forEach(function (t) {
        s += ln(t[0], ya, t[0], ya + 4, '#9aa6b5') + txt(t[0] + (t[2] === 'end' ? 2 : t[2] === 'start' ? -2 : 0), ya + 15, t[1], { a: t[2], fs: fs - 0.5, c: C.grey });
      });
      s += txt((x0 + x1) / 2, ya + 15, it('d') + sb('p') + ' = 2 µm', { a: 'middle', fs: fs - 0.5, c: C.ink });
      s += txt((x2 + x3) / 2, ya + 15, it('d') + sb('n') + ' = 10 µm', { a: 'middle', fs: fs - 0.5, c: C.ink });
      // axis note and slopes (short-diode currents)
      var Jn = q * Dn * np0 * (ratio - 1) / 2e-4, Jp = q * Dp * pn0 * (ratio - 1) / 1e-3;
      var note1 = 'minority scale: 0 … ' + sci(ymax, 2) + ' × the equilibrium value (' + it('n') + '/' + it('n') + sb('p0') + ' in P, ' + it('p') + '/' + it('p') + sb('n0') + ' in N)';
      var note2 = eq ? 'flat profiles: no gradient, no diffusion current' :
        'slopes: ' + it('J') + sb('n') + ' = ' + fmtJ(Jn) + ', ' + it('J') + sb('p') + ' = ' + fmtJ(Jp) + (fwd || ph ? '' : ' (−' + it('J') + sb('0') + ', short diode)');
      if (ph) {
        s += txt(x0, ya + 31, 'scale: 0 … ' + sci(ymax, 2) + ' × equilibrium value', { fs: fs - 0.5, c: C.grey });
        s += txt(x0, ya + 45, note2, { fs: fs - 0.5, c: C.grey });
      } else {
        s += txt(x0, ya + 31, note1, { fs: fs - 0.5, c: C.grey });
        s += txt(x0, ya + 45, note2, { fs: fs - 0.5, c: C.grey });
      }
      return s;
    }
    var uid = Math.random().toString(36).slice(2, 7);

    // ---- readouts and hint
    function ro(l, v, sub) { return '<div><span>' + l + '</span><strong>' + v + '</strong>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }
    function update() {
      var g = geom(st.V); st.g = g;
      aStatic = drawAStatic(g);
      PB.svg.innerHTML = drawB(g);
      PC.svg.innerHTML = drawC(g);
      var ratio = Math.exp(g.V / VT), J = J0 * (ratio - 1);
      read.innerHTML =
        ro('applied <i>V</i>', fmtV(g.V), 'on P, N grounded') +
        ro('step q(<i>V</i><sub>d</sub> − <i>V</i>)', g.phi.toFixed(3) + ' eV', '<i>V</i><sub>d</sub> = ' + Vd.toFixed(3) + ' V') +
        ro('SCR width <i>W</i>', (g.W * 1e4).toFixed(3) + ' µm', 'eq. 0.330 µm') +
        ro('climbing fraction', sci(Math.exp(-g.phi / VT), 2), 'e<sup>−q(<i>V</i><sub>d</sub>−<i>V</i>)/<i>kT</i></sup>') +
        ro('diffusion / drift', Math.abs(g.V) < 0.0005 ? '1 (balanced)' : sci(ratio, 2), 'e<sup><i>V</i>/<i>V</i><sub>T</sub></sup>') +
        ro('<i>n</i><sub>p</sub>(<i>x</i><sub>p</sub>)', sci(np0 * ratio, 2) + ' cm<sup>−3</sup>', '<i>n</i><sub>p0</sub> = 10²') +
        ro('<i>p</i><sub>n</sub>(<i>x</i><sub>n</sub>)', sci(pn0 * ratio, 2) + ' cm<sup>−3</sup>', '<i>p</i><sub>n0</sub> = 10⁴') +
        ro('current <i>I</i>', Math.abs(g.V) < 0.0005 ? '0' : fmtI(J * S), '<i>J</i><sub>0</sub>(e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> − 1)<i>S</i>');
      var w;
      if (Math.abs(g.V) < 0.0005) w = '<b>Equilibrium:</b> only the Boltzmann fraction e<sup>−q<i>V</i><sub>d</sub>/<i>kT</i></sup> = 10<sup>−14</sup> of the majority carriers can climb the step, and that flux equals the minority carriers that roll down. Diffusion = drift for each carrier: net current zero.';
      else if (g.V > 0) w = '<b>Forward:</b> the step is lower by q<i>V</i>, so e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> = ' + sci(ratio, 2) + ' times more carriers can climb it; the drift (rolling down) has not changed. The balance is broken: a net current flows from P to N, and the minority densities at the edges rise by the same factor.';
      else w = '<b>Reverse:</b> the step is higher by q|<i>V</i>|: practically nobody climbs (×' + sci(ratio, 2) + '); the drift is unchanged and is all that remains, a tiny current −<i>I</i><sub>0</sub>; the edges are emptied of minority carriers and the SCR widens.';
      watch.innerHTML = w;
      if (ctl) ctl.refresh();
      st.dirty = false;
    }

    // ---- loop
    var alive = true;
    function loop(ts) {
      if (!alive) return;
      if (!root.isConnected) { alive = false; return; }
      var dt = st.last ? Math.min(0.05, (ts - st.last) / 1000) : 0; st.last = ts;
      if (st.dirty) update();
      if (st.playing) stepParts(dt * st.speed, st.g);
      PA.svg.innerHTML = aStatic + drawParts(st.g);
      requestAnimationFrame(loop);
    }
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (!root.isConnected) return; var w = PA.box.clientWidth; if (w && Math.abs(w - L.w) > 4) { layout(); update(); } }, 160);
    });
    layout(); syncPlay(); update();
    if (!reduce) { // a few carriers already on their way, so the picture is alive at once
      for (var k = 0; k < 40; k++) stepParts(0.25, st.g);
    }
    requestAnimationFrame(loop);
    root._ixState = { st: st, setV: function (v) { setV(v); update(); }, geom: geom };
  }
  window.IX[ID] = mount;
})();
