/* Interactive: "Injection under bias and where the current goes" (Ch6, long reference diode).
   Physics: course Ch6 eqs (6.1) V_N-V_P=V_d-V, (6.2) W(V), (6.3) quasi-Fermi levels,
   (6.5) edge densities n_p0 e^{V/V_T}, p_n0 e^{V/V_T}, (6.7) long-diode profiles,
   (6.8) edge diffusion currents, (6.9)-(6.10) Shockley law and J0 (long diode),
   Section "The current inside the device" for J_n(x), J_p(x). */
(function () {
  'use strict';
  window.IX = window.IX || {};
  var ID = 'injection';
  var NS = 'http://www.w3.org/2000/svg';
  var inst = 0;

  /* ---------- course reference values (Ch5/Ch6 Table of notation) ---------- */
  var q = 1.602e-19, VT = 0.0259, ni = 1e10, NA = 1e18, ND = 1e16;
  var Vd = VT * Math.log(NA * ND / (ni * ni)); // 0.835 V, same V_d for the step and the quasi-Fermi levels
  var Dn = 35, Dp = 12, taun = 1e-7, taup = 1e-5, S = 1e-4, eps = 11.7 * 8.854e-14, Eg = 1.12;
  var Ln = Math.sqrt(Dn * taun), Lp = Math.sqrt(Dp * taup);         // cm: 18.7 um, 110 um
  var np0 = ni * ni / NA, pn0 = ni * ni / ND;                           // 1e2, 1e4 cm^-3
  var J0p = q * Dp * pn0 / Lp, J0n = q * Dn * np0 / Ln, J0 = J0p + J0n;  // (6.10)
  var shareP = J0p / J0, shareN = J0n / J0;                             // 0.854 / 0.146
  var I0 = S * J0;
  var EiN = -VT * Math.log(ND / ni);   // E_i - E_F(N) in eV (N side reference, E_F(N)=0)
  var VMIN = -2, VMAX = 0.75, DEPTH = 3.2; // neutral regions drawn over 3.2 diffusion lengths

  function Wof(V) { return Math.sqrt(2 * eps * (Vd - V) / q * (1 / NA + 1 / ND)); } // (6.2) cm
  var W0 = Wof(0);

  var C = { ink: '#1d2430', grey: '#6B6B6B', navy: '#1F3A5F', acc: '#D9771A', line: '#dde3ea',
    el: '#1F4E9A', ho: '#C8641E', field: '#2E7D4F', scr: '#eef1f5' };

  var CSS = [
    '.ix-injection{font-family:var(--sans,"DejaVu Sans",system-ui,sans-serif);color:#1d2430;font-size:14px;line-height:1.4}',
    '.ix-injection *{box-sizing:border-box}',
    '.ix-injection .ixj-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;margin:0 0 8px}',
    '.ix-injection .ixj-title{font-weight:700;color:#1F3A5F;font-size:16px}',
    '.ix-injection .ixj-sub{color:#6B6B6B;font-size:12.5px}',
    '.ix-injection .ixj-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:10px 12px;border:1px solid #dde3ea;border-radius:6px;background:#fafbfc;margin-bottom:10px}',
    '.ix-injection .ixj-vbox{display:flex;align-items:center;gap:10px;flex:1 1 320px;min-width:0}',
    '.ix-injection .ixj-vbox label{font-weight:600;white-space:nowrap}',
    '.ix-injection input[type=range]{flex:1 1 auto;min-width:0;accent-color:#1F3A5F;height:22px}',
    '.ix-injection .ixj-vval{font-variant-numeric:tabular-nums;min-width:74px;text-align:right;font-weight:700;color:#1F3A5F}',
    '.ix-injection button{font:inherit;font-size:13px;padding:5px 11px;border:1px solid #c5ced9;border-radius:5px;background:#fff;color:#1F3A5F;cursor:pointer;white-space:nowrap}',
    '.ix-injection button:hover{border-color:#1F3A5F}',
    '.ix-injection button.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}',
    '.ix-injection .ixj-presets{display:flex;gap:6px;flex-wrap:wrap}',
    '.ix-injection .ixj-presets button{padding:3px 8px;font-size:12px}',
    '.ix-injection .ixj-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:12px;align-items:start}',
    '.ix-injection .ixj-grid.narrow{grid-template-columns:minmax(0,1fr)}',
    '.ix-injection .ixj-panel{border:1px solid #dde3ea;border-radius:6px;background:#fff;padding:6px;min-width:0}',
    '.ix-injection .ixj-panel svg{display:block;width:100%;height:auto;overflow:visible}',
    '.ix-injection svg text{font-family:inherit}',
    '.ix-injection .ixj-side{display:flex;flex-direction:column;gap:12px;min-width:0}',
    '.ix-injection .ixj-ro{display:grid;grid-template-columns:1fr auto;gap:3px 10px;font-size:12.5px;padding:8px 10px}',
    '.ix-injection .ixj-ro dt{color:#6B6B6B}',
    '.ix-injection .ixj-ro dd{margin:0;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}',
    '.ix-injection .ixj-ro .sep{grid-column:1/3;border-top:1px solid #eef1f5;margin:3px 0}',
    '.ix-injection .ixj-watch{margin-top:10px;padding:8px 12px;border-left:3px solid #D9771A;background:#fffaf4;font-size:13.5px;border-radius:0 6px 6px 0;min-height:2.6em}',
    '.ix-injection .ixj-watch b{color:#1F3A5F}',
    '.ix-injection .ixj-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:#444;margin:6px 2px 0}',
    '.ix-injection .ixj-legend>span{display:inline-flex;align-items:center;gap:5px}',
    '.ix-injection .ixj-cap{font-size:12px;color:#6B6B6B;margin-top:8px}',
    '.ix-injection i{font-style:italic}',
    '.ix-injection sub,.ix-injection sup{font-size:.72em;line-height:0}'
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
  /* scientific string with unicode superscripts, e.g. 1.2×10¹⁴ */
  function sci(v, d) {
    if (d == null) d = 2;
    if (v === 0) return '0';
    var s = v < 0 ? '−' : ''; v = Math.abs(v);
    var e = Math.floor(Math.log10(v)); var m = v / Math.pow(10, e);
    var ms = m.toFixed(d - 1);
    if (parseFloat(ms) >= 10) { e += 1; ms = (m / 10).toFixed(d - 1); }
    if (e >= -2 && e <= 3) { return s + String(parseFloat(v.toPrecision(d))); }
    if (ms === '1' || ms === '1.0') return s + '10' + supStr(e);
    return s + ms + '×10' + supStr(e);
  }
  function fmtI(I) { // current in A with engineering unit
    var a = Math.abs(I), s = I < 0 ? '−' : '';
    if (a === 0) return '0 A';
    if (a >= 1e-3) return s + (a * 1e3).toPrecision(3) + ' mA';
    if (a >= 1e-6) return s + (a * 1e6).toPrecision(3) + ' µA';
    if (a >= 1e-9) return s + (a * 1e9).toPrecision(3) + ' nA';
    return s + sci(a, 2) + ' A';
  }
  function niceMax(x) { // returns {max, step}
    var e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e, st;
    if (m <= 1.2) st = 0.2; else if (m <= 2.5) st = 0.5; else if (m <= 5) st = 1; else st = 2;
    var step = st * e; var max = Math.ceil(x / step - 1e-9) * step;
    return { max: max, step: step };
  }

  function mount(root) {
    injectCSS();
    inst++;
    var uid = 'ixj' + inst + '_';
    root.innerHTML = '';
    root.classList.add('ix-' + ID);
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var st = { V: 0.6, playing: false, dir: 1, carriers: !reduced, Edisp: null, spd: 1 };
    var CARRIER = 0.3; // carriers 3.3x slower than in v2 (Handoff 4); the Speed control multiplies it

    /* ---------- DOM skeleton ---------- */
    var head = h('div', 'ixj-head', null, root);
    h('div', 'ixj-title', 'Injection under bias and where the current goes', head);
    h('div', 'ixj-sub', 'Long reference diode: <i>N</i><sub>A</sub> = 10<sup>18</sup> (P), <i>N</i><sub>D</sub> = 10<sup>16</sup> cm<sup>−3</sup> (N), <i>V</i> on P, N grounded', head);

    var ctl = h('div', 'ixj-ctl', null, root);
    var vbox = h('div', 'ixj-vbox', null, ctl);
    var vlab = h('label', null, '<i>V</i>', vbox);
    var slider = document.createElement('input');
    slider.type = 'range'; slider.min = VMIN; slider.max = VMAX; slider.step = 0.005; slider.value = st.V;
    slider.id = uid + 'v'; vlab.setAttribute('for', slider.id);
    slider.setAttribute('aria-label', 'Applied voltage V');
    vbox.appendChild(slider);
    var vval = h('span', 'ixj-vval', '', vbox);
    var bPlay = h('button', null, '▶ Sweep V', ctl);
    var bCar = h('button', st.carriers ? 'on' : '', st.carriers ? 'Carriers: moving' : 'Carriers: paused', ctl);
    var pres = h('div', 'ixj-presets', null, ctl);
    [[-2, '−2 V'], [-0.3, '−0.3 V'], [0, '0'], [0.06, '+0.06'], [0.4, '+0.4'], [0.6, '+0.6 V']].forEach(function (p) {
      var b = h('button', null, p[1], pres);
      b.addEventListener('click', function () { setV(p[0]); stopPlay(); });
    });

    // Handoff 4: regime buttons, Speed, and a synchronised copy of the V control next to each panel
    var K = window.IX._kit, kctl = null;
    if (K) {
      kctl = K.controls({
        sliders: [{ key: 'V', label: '<i>V</i>', aria: 'Applied voltage V (on P, N grounded)', min: VMIN, max: VMAX, step: 0.005,
          get: function () { return st.V; }, set: function (v) { stopPlay(); setV(v); },
          fmt: function (V) { return (V >= 0 ? '+' : '−') + Math.abs(V).toFixed(3) + ' V'; } }],
        regimes: [
          { label: 'Forward', title: 'Forward bias V = +0.6 V', apply: function () { stopPlay(); setV(0.6); }, is: function () { return Math.abs(st.V - 0.6) < 1e-6; } },
          { label: 'Equilibrium (0 V)', title: 'Equilibrium, V = 0: no current, flat E_F', apply: function () { stopPlay(); setV(0); }, is: function () { return Math.abs(st.V) < 1e-6; } },
          { label: 'Reverse', title: 'Reverse bias V = −2 V: the edges are emptied, I → −I₀', apply: function () { stopPlay(); setV(-2); }, is: function () { return Math.abs(st.V + 2) < 1e-6; } }
        ],
        speed: { get: function () { return st.spd; }, set: function (v) { st.spd = v; } }
      });
      ctl.appendChild(kctl.strip({ top: true, sliders: false }));
    }

    var grid = h('div', 'ixj-grid', null, root);
    var mainP = h('div', 'ixj-panel', null, grid);
    var side = h('div', 'ixj-side', null, grid);
    var ivP = h('div', 'ixj-panel', null, side);
    var roP = h('div', 'ixj-panel', null, side);
    var ro = h('dl', 'ixj-ro', null, roP);
    var R = {};
    function addRO(key, label) { h('dt', null, label, ro); R[key] = h('dd', null, '', ro); }
    function sep() { h('div', 'sep', null, ro); }
    addRO('V', 'Applied <i>V</i>');
    addRO('step', 'Step <i>q</i>(<i>V</i><sub>d</sub> − <i>V</i>)');
    addRO('W', 'SCR width <i>W</i>');
    sep();
    addRO('ex', 'e<sup><i>V</i>/<i>V</i><sub>T</sub></sup>');
    addRO('np', '<i>n</i><sub>p</sub>(<i>x</i><sub>p</sub>)');
    addRO('pn', '<i>p</i><sub>n</sub>(<i>x</i><sub>n</sub>)');
    sep();
    addRO('J', 'Current density <i>J</i>');
    addRO('I', 'Current <i>I</i> (<i>S</i> = 10<sup>−4</sup> cm²)');
    addRO('sh', '<i>J</i><sub>p</sub> : <i>J</i><sub>n</sub> at junction');

    var watch = h('div', 'ixj-watch', '', root);
    var legend = h('div', 'ixj-legend', null, root);
    legend.innerHTML =
      '<span><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="4.5" fill="' + C.el + '"/></svg><span>electron</span></span>' +
      '<span><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="4.3" fill="#fff" stroke="' + C.ho + '" stroke-width="1.8"/></svg><span>hole</span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="#1d2430" stroke-width="2"/></svg><span><i>E</i><sub>C</sub>, <i>E</i><sub>V</sub></span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.el + '" stroke-width="2" stroke-dasharray="5 3"/></svg><span><i>E</i><sub>Fn</sub></span></span>' +
      '<span><svg width="26" height="10"><line x1="1" y1="5" x2="25" y2="5" stroke="' + C.ho + '" stroke-width="2" stroke-dasharray="5 3"/></svg><span><i>E</i><sub>Fp</sub></span></span>' +
      '<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" fill="url(#' + uid + 'hb)" stroke="' + C.el + '"/></svg><span>minority diffusion</span></span>' +
      '<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" fill="#f7c9a1" stroke="' + C.ho + '"/></svg><span>majority current (drift far from the SCR)</span></span>';
    var cap = h('div', 'ixj-cap', '', root);
    cap.innerHTML = 'Computed from the course equations: edge densities <i>n</i><sub>p0</sub>e<sup><i>V</i>/<i>V</i><sub>T</sub></sup>, <i>p</i><sub>n0</sub>e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> (6.5), exponential profiles (6.7), <i>J</i> = <i>J</i><sub>0</sub>(e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> − 1) with <i>J</i><sub>0</sub> = <i>qn</i><sub>i</sub>²(<i>D</i><sub>p</sub>/<i>N</i><sub>D</sub><i>L</i><sub>p</sub> + <i>D</i><sub>n</sub>/<i>N</i><sub>A</sub><i>L</i><sub>n</sub>) = 2.1×10<sup>−12</sup> A/cm² (6.9–6.10); <i>L</i><sub>n</sub> = 18.7 µm, <i>L</i><sub>p</sub> = 110 µm, <i>V</i><sub>T</sub> = 25.9 mV. ' +
      'Shared <i>x</i> axis with three scales: the P side shows 3.2 <i>L</i><sub>n</sub> (60 µm), the N side 3.2 <i>L</i><sub>p</sub> (350 µm); the SCR (0.1–0.6 µm) is magnified, its drawn width following <i>W</i>(<i>V</i>) (6.2). Each density panel side has its own linear scale. Moving carriers are schematic: their rate grows with the injection and the electron/hole rates follow the 15 %/85 % current shares.';

    /* ---------- SVG main (shared x) ---------- */
    var svg = el('svg', { role: 'img', 'aria-label': 'Band diagram, minority densities and current distribution across the diode' }, mainP);
    var ivsvg = el('svg', { role: 'img', 'aria-label': 'I(V) characteristic with operating point' }, ivP);

    var G = {}; // handles
    var geo = {};

    function build() {
      var Wd = Math.max(260, mainP.clientWidth - 12);
      var narrow = Wd < 520;
      var ml = narrow ? 40 : 58, mr = narrow ? 44 : 62;
      var fs = narrow ? 10 : 11.5;
      var hA = narrow ? 200 : 250, hB = narrow ? 175 : 210, hC = narrow ? 120 : 140;
      var gap = 44, top = 40;
      var yA = top, yB = yA + hA + gap, yC = yB + hB + gap, H = yC + hC + 34;
      geo = { W: Wd, ml: ml, mr: mr, pw: Wd - ml - mr, fs: fs, narrow: narrow, yA: yA, hA: hA, yB: yB, hB: hB, yC: yC, hC: hC, H: H };
      geo.XP = ml + 0.34 * geo.pw;
      svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + H);
      svg.setAttribute('width', Wd); svg.setAttribute('height', H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var defs = el('defs', null, svg);
      var pat = el('pattern', { id: uid + 'hb', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      el('rect', { width: 6, height: 6, fill: '#c9d6ec' }, pat); el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: C.el, 'stroke-width': 1.6, 'stroke-opacity': .55 }, pat);
      var pat2 = el('pattern', { id: uid + 'ho', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      el('rect', { width: 6, height: 6, fill: '#fbe1c9' }, pat2); el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: C.ho, 'stroke-width': 1.6, 'stroke-opacity': .6 }, pat2);
      // legend pattern in HTML refers to uid+'hb' – it's in this svg defs, fine.
      ['A', 'B', 'C'].forEach(function (k) {
        var cp = el('clipPath', { id: uid + 'clip' + k }, defs);
        el('rect', { x: ml, y: geo['y' + k], width: geo.pw, height: geo['h' + k] }, cp);
      });

      // SCR band (spanning the three panels), drawn first
      G.scrRect = el('rect', { y: yA - 6, height: yC + hC - yA + 12, fill: C.scr }, svg);
      G.scrLab = el('text', { y: yA - 6, 'text-anchor': 'middle', 'font-size': fs, fill: C.grey }, svg); G.scrLab.textContent = 'SCR';
      var pl = el('text', { x: ml + 4, y: yA - 6, 'font-size': fs, fill: C.navy, 'font-weight': 700 }, svg); pl.textContent = 'P neutral';
      var nl = el('text', { x: ml + geo.pw - 4, y: yA - 6, 'font-size': fs, fill: C.navy, 'font-weight': 700, 'text-anchor': 'end' }, svg); nl.textContent = 'N neutral';

      // panel frames + titles
      function frame(k, title) {
        el('rect', { x: ml, y: geo['y' + k], width: geo.pw, height: geo['h' + k], fill: 'none', stroke: C.line }, svg);
        var t = el('text', { x: ml - (narrow ? 34 : 50), y: geo['y' + k] - (k === 'A' ? 24 : 20), 'font-size': fs, 'font-weight': 700, fill: C.navy }, svg);
        t.textContent = title;
        return t;
      }
      frame('A', '(a) bands');
      frame('B', '(b) minority densities (linear)');
      frame('C', '(c) where the current goes');

      /* (a) bands */
      var gA = el('g', { 'clip-path': 'url(#' + uid + 'clipA)' }, svg);
      G.bandFill = el('path', { fill: '#f3f5f8' }, gA);
      G.Ec = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 2 }, gA);
      G.Ev = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 2 }, gA);
      G.Efn = el('path', { fill: 'none', stroke: C.el, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, gA);
      G.Efp = el('path', { fill: 'none', stroke: C.ho, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, gA);
      G.stepArrow = el('path', { fill: 'none', stroke: C.grey, 'stroke-width': 1 }, gA);
      G.stepTxt = el('text', { 'font-size': fs, fill: C.ink }, gA);
      G.qvArrow = el('path', { fill: 'none', stroke: C.navy, 'stroke-width': 1.2 }, gA);
      G.qvTxt = el('text', { 'font-size': fs, fill: C.navy, 'font-weight': 700 }, gA);
      G.labEc = el('text', { 'font-size': fs, fill: C.ink }, svg); G.labEc.textContent = 'E';
      G.labEv = el('text', { 'font-size': fs, fill: C.ink }, svg);
      G.labFn = el('text', { 'font-size': fs, fill: C.el }, svg);
      G.labFp = el('text', { 'font-size': fs, fill: C.ho }, svg);
      setSubLabel(G.labEc, 'E', 'C'); setSubLabel(G.labEv, 'E', 'V'); setSubLabel(G.labFn, 'E', 'Fn'); setSubLabel(G.labFp, 'E', 'Fp');
      G.eBar = el('path', { stroke: C.grey, 'stroke-width': 1.5, fill: 'none' }, svg);
      G.eBarT = el('text', { 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, svg); G.eBarT.textContent = '1 eV';
      G.fieldArrow = el('path', { stroke: C.field, 'stroke-width': 2, fill: C.field }, svg);
      G.fieldTxt = el('text', { 'font-size': fs, fill: C.field, 'text-anchor': 'middle', 'font-style': 'italic' }, svg); G.fieldTxt.textContent = 'ℰ';

      /* (b) densities */
      var gB = el('g', { 'clip-path': 'url(#' + uid + 'clipB)' }, svg);
      G.fillP = el('path', { fill: '#dbe5f4' }, gB);
      G.fillN = el('path', { fill: '#fbe6d3' }, gB);
      G.eqP = el('path', { stroke: C.el, 'stroke-dasharray': '3 3', 'stroke-width': 1.2, fill: 'none' }, gB);
      G.eqN = el('path', { stroke: C.ho, 'stroke-dasharray': '3 3', 'stroke-width': 1.2, fill: 'none' }, gB);
      G.curP = el('path', { stroke: C.el, 'stroke-width': 2.2, fill: 'none' }, gB);
      G.curN = el('path', { stroke: C.ho, 'stroke-width': 2.2, fill: 'none' }, gB);
      G.LnMark = el('path', { stroke: C.grey, 'stroke-dasharray': '1 3', 'stroke-width': 1.2 }, gB);
      G.LpMark = el('path', { stroke: C.grey, 'stroke-dasharray': '1 3', 'stroke-width': 1.2 }, gB);
      G.LnT = el('text', { 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, gB);
      G.LpT = el('text', { 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, gB);
      setSubLabel(G.LnT, 'L', 'n'); setSubLabel(G.LpT, 'L', 'p');
      G.partLayer = el('g', null, gB);
      G.crossLayer = el('g', null, svg);
      G.axP = el('g', null, svg); G.axN = el('g', null, svg);
      G.npLab = el('text', { 'font-size': fs, fill: C.el, 'font-weight': 700 }, svg);
      G.pnLab = el('text', { 'font-size': fs, fill: C.ho, 'font-weight': 700, 'text-anchor': 'end' }, svg);
      setSubLabel(G.npLab, 'n', 'p', '(x)'); setSubLabel(G.pnLab, 'p', 'n', '(x)');
      G.edgeP = el('text', { 'font-size': fs, fill: C.el, 'text-anchor': 'end' }, svg);
      G.edgeN = el('text', { 'font-size': fs, fill: C.ho }, svg);

      /* (c) currents */
      var gC = el('g', { 'clip-path': 'url(#' + uid + 'clipC)' }, svg);
      G.jnMinP = el('path', { fill: 'url(#' + uid + 'hb)', stroke: 'none' }, gC);   // J_n in P (minority diffusion)
      G.jpMajP = el('path', { fill: '#f7c9a1', stroke: 'none' }, gC);               // J_p in P (majority)
      G.jnScr = el('path', { fill: '#c9d6ec', stroke: 'none' }, gC);
      G.jpScr = el('path', { fill: '#fbe1c9', stroke: 'none' }, gC);
      G.jpMinN = el('path', { fill: 'url(#' + uid + 'ho)', stroke: 'none' }, gC);   // J_p in N (minority diffusion)
      G.jnMajN = el('path', { fill: '#a9bfe2', stroke: 'none' }, gC);               // J_n in N (majority)
      G.jDiv = el('path', { stroke: '#fff', 'stroke-width': 1.5, fill: 'none' }, gC);
      G.jTot = el('path', { stroke: C.ink, 'stroke-width': 2.2, fill: 'none' }, gC);
      G.jZero = el('text', { 'font-size': fs + 1, fill: C.grey, 'text-anchor': 'middle', 'font-weight': 700 }, svg);
      G.jTxt = el('text', { 'font-size': fs, fill: C.ink, 'text-anchor': 'middle' }, svg);
      G.jLabs = el('g', { 'font-size': fs - 0.5 }, svg);
      G.axC = el('g', null, svg);
      // x scale bars under (c)
      G.xbar = el('g', null, svg);

      /* I(V) */
      buildIV();
      pool = [];
      update(true);
    }

    function setSubLabel(t, main, sub, after) {
      while (t.firstChild) t.removeChild(t.firstChild);
      var a = el('tspan', { 'font-style': 'italic' }, t); a.textContent = main;
      var b = el('tspan', { 'baseline-shift': 'sub', 'font-size': '75%' }, t); b.textContent = sub;
      if (after) { var c = el('tspan', {}, t); c.textContent = after; }
    }

    /* ---------- x mapping ---------- */
    function xmap(V) {
      var g = geo, wS = Math.max(10, g.pw * 0.075 * Wof(V) / W0);
      var xp = g.XP, xn = g.XP + wS, right = g.ml + g.pw;
      var sP = (xp - g.ml) / DEPTH, sN = (right - xn) / DEPTH; // px per diffusion length
      return { xp: xp, xn: xn, wS: wS, sP: sP, sN: sN, right: right,
        xj: xp + wS * ND / (NA + ND) };
    }

    /* ---------- physics at V ---------- */
    function phys(V) {
      var ev = Math.exp(V / VT);
      return { ev: ev, npE: np0 * ev, pnE: pn0 * ev, J: J0 * (ev - 1), I: I0 * (ev - 1), W: Wof(V) };
    }

    /* ---------- update everything for current V ---------- */
    function update() {
      var V = st.V, g = geo, m = xmap(V), P = phys(V), fs = g.fs;
      var NSAMP = 70, i, d, x, path;
      vval.textContent = (V >= 0 ? '+' : '−') + Math.abs(V).toFixed(3) + ' V';
      if (kctl) kctl.refresh();
      G.scrRect.setAttribute('x', m.xp); G.scrRect.setAttribute('width', m.wS);
      G.scrLab.setAttribute('x', m.xp + m.wS / 2);

      /* ---- (a) bands ---- energies in eV, N side: E_F(N)=0 */
      var EiP = EiN + (Vd - V);            // P side bands shifted by step q(V_d - V)
      var EcN = EiN + Eg / 2, EvN = EiN - Eg / 2, EcP = EiP + Eg / 2, EvP = EiP - Eg / 2;
      var tgtLo = EvN - 0.22, tgtHi = EcP + 0.22;
      if (!st.Edisp) st.Edisp = { lo: tgtLo, hi: tgtHi };
      st.Edisp.lo += (tgtLo - st.Edisp.lo) * 0.25; st.Edisp.hi += (tgtHi - st.Edisp.hi) * 0.25;
      if (Math.abs(st.Edisp.lo - tgtLo) < 1e-3) st.Edisp.lo = tgtLo;
      if (Math.abs(st.Edisp.hi - tgtHi) < 1e-3) st.Edisp.hi = tgtHi;
      var lo = st.Edisp.lo, hi = st.Edisp.hi;
      function yE(E) { return g.yA + g.hA - (E - lo) / (hi - lo) * g.hA; }
      var Vt = Vd - V, Vp = Vt * ND / (NA + ND), Vn = Vt * NA / (NA + ND);
      var Wp = m.xj - m.xp, Wn = m.xn - m.xj;
      function Ei(xx) { // intrinsic level along drawn x (depletion approx, two parabolas)
        if (xx <= m.xp) return EiP;
        if (xx >= m.xn) return EiN;
        if (xx <= m.xj) { var s = (xx - m.xp) / Wp; return EiP - Vp * s * s; }
        var u = (m.xn - xx) / Wn; return EiN + Vn * u * u;
      }
      var xs = [];
      for (x = g.ml; x < m.xp; x += 4) xs.push(x);
      for (i = 0; i <= 24; i++) xs.push(m.xp + m.wS * i / 24);
      for (x = m.xn + 4; x <= m.right; x += 4) xs.push(x);
      xs.push(m.right);
      var pc = '', pv = '', pf1 = '', pf2 = '';
      xs.forEach(function (xx, k) {
        var e = Ei(xx), c = (k ? 'L' : 'M') + xx.toFixed(1) + ',';
        pc += c + yE(e + Eg / 2).toFixed(1); pv += c + yE(e - Eg / 2).toFixed(1);
      });
      G.Ec.setAttribute('d', pc); G.Ev.setAttribute('d', pv);
      // band (gap) fill between Ec and Ev
      var rev = xs.slice().reverse().map(function (xx) { return 'L' + xx.toFixed(1) + ',' + yE(Ei(xx) - Eg / 2).toFixed(1); }).join('');
      G.bandFill.setAttribute('d', pc + rev + 'Z');
      // quasi-Fermi levels from the densities (6.3): E_Fn = E_i + kT ln(n/n_i), E_Fp = E_i - kT ln(p/n_i)
      var yBot = g.yA + g.hA + 40, yTop = g.yA - 40;
      function clampY(y) { return Math.max(yTop, Math.min(yBot, y)); }
      var fn = '', fp = '';
      // P neutral: electrons minority n = np0(1+(e^v-1)e^{-d/Ln}); holes majority p = NA
      for (i = 0; i <= NSAMP; i++) {
        d = DEPTH * (1 - i / NSAMP); x = m.xp - d * m.sP;
        var n = np0 * (1 + (P.ev - 1) * Math.exp(-d));
        var EfnP = n > 0 ? EiP + VT * Math.log(n / ni) : -50;
        fn += (i ? 'L' : 'M') + x.toFixed(1) + ',' + clampY(yE(EfnP)).toFixed(1);
        var EfpP = EiP - VT * Math.log(NA / ni);
        fp += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yE(EfpP).toFixed(1);
      }
      // SCR: flat (quasi-equilibrium): E_Fn = E_F(N) = 0 ; E_Fp = E_F(P) = -qV
      fn += 'L' + m.xp.toFixed(1) + ',' + yE(0).toFixed(1) + 'L' + m.xn.toFixed(1) + ',' + yE(0).toFixed(1);
      fp += 'L' + m.xn.toFixed(1) + ',' + yE(EiP - VT * Math.log(NA / ni)).toFixed(1);
      // N neutral: holes minority p = pn0(1+(e^v-1)e^{-d/Lp}); electrons majority n = ND
      for (i = 0; i <= NSAMP; i++) {
        d = DEPTH * i / NSAMP; x = m.xn + d * m.sN;
        var p = pn0 * (1 + (P.ev - 1) * Math.exp(-d));
        var EfpN = p > 0 ? EiN - VT * Math.log(p / ni) : 50;
        fp += 'L' + x.toFixed(1) + ',' + clampY(yE(EfpN)).toFixed(1);
        fn += 'L' + x.toFixed(1) + ',' + yE(EiN + VT * Math.log(ND / ni)).toFixed(1);
      }
      // the P-side part of E_Fn starts at x_p edge: connect P-edge value to SCR flat (already, via path)
      G.Efn.setAttribute('d', fn.replace(/L([\d.]+),([\d.]+)L/, function (s) { return s; }));
      G.Efp.setAttribute('d', fp);
      // labels at right/left edges
      var lx = g.ml + g.pw + 4;
      var yFnR = yE(0), yFpR = clampY(yE(EiN - VT * Math.log(pn0 * (1 + (P.ev - 1) * Math.exp(-DEPTH)) / ni)));
      var labs = [[G.labEc, yE(EcN)], [G.labFn, yFnR], [G.labFp, Math.min(g.yA + g.hA + 4, yFpR)], [G.labEv, yE(EvN)]];
      labs.sort(function (a, b) { return a[1] - b[1]; });
      var gapL = g.narrow ? 15 : 13; // labels with subscripts need this much room
      for (i = 1; i < labs.length; i++) if (labs[i][1] - labs[i - 1][1] < gapL) labs[i][1] = labs[i - 1][1] + gapL;
      labs.forEach(function (L) { L[0].setAttribute('x', lx); L[0].setAttribute('y', L[1] + 4); });
      // step arrow on the left: from EcN level to EcP at x = ml + 0.5*(xp-ml)... placed in the SCR right side
      var ax = Math.min(m.right - 30, m.xn + 26);
      var y1 = yE(EcN), y2 = yE(EcP);
      G.stepArrow.setAttribute('d', 'M' + (m.xp - 6) + ',' + y2 + 'H' + (ax + 6) + 'M' + ax + ',' + y2 + 'V' + y1 +
        'M' + (ax - 3) + ',' + (y2 + 5) + 'L' + ax + ',' + y2 + 'L' + (ax + 3) + ',' + (y2 + 5) +
        'M' + (ax - 3) + ',' + (y1 - 5) + 'L' + ax + ',' + y1 + 'L' + (ax + 3) + ',' + (y1 - 5));
      G.stepTxt.setAttribute('x', ax + 6); G.stepTxt.setAttribute('y', (y1 + y2) / 2 + 4);
      G.stepTxt.textContent = 'q(Vd−V) = ' + (Vd - V).toFixed(3) + ' eV';
      stepLabel(G.stepTxt, Vd - V, g.narrow);
      // qV between quasi-Fermi levels in the SCR
      var yF1 = yE(0), yF2 = yE(EiP - VT * Math.log(NA / ni)), qx = m.xp - Math.min(40, (m.xp - g.ml) * 0.35);
      if (Math.abs(V) > 0.004) {
        var big = Math.abs(yF1 - yF2) > 10;
        G.qvArrow.setAttribute('d', 'M' + qx + ',' + yF1 + 'V' + yF2 + (big ?
          'M' + (qx - 3) + ',' + (yF2 + (yF2 > yF1 ? -5 : 5)) + 'L' + qx + ',' + yF2 + 'L' + (qx + 3) + ',' + (yF2 + (yF2 > yF1 ? -5 : 5)) +
          'M' + (qx - 3) + ',' + (yF1 + (yF1 > yF2 ? -5 : 5)) + 'L' + qx + ',' + yF1 + 'L' + (qx + 3) + ',' + (yF1 + (yF1 > yF2 ? -5 : 5)) : ''));
        G.qvTxt.textContent = 'qV';
        G.qvTxt.setAttribute('x', qx - 22); G.qvTxt.setAttribute('y', (yF1 + yF2) / 2 + 4);
        G.qvTxt.setAttribute('text-anchor', 'start');
      } else { G.qvArrow.setAttribute('d', ''); G.qvTxt.textContent = ''; }
      // 1 eV scale bar (left of panel a)
      var bx = g.ml - (g.narrow ? 12 : 16), by0 = g.yA + g.hA - 8, by1 = by0 - g.hA / (hi - lo);
      G.eBar.setAttribute('d', 'M' + (bx - 3) + ',' + by0 + 'H' + (bx + 3) + 'M' + bx + ',' + by0 + 'V' + by1 + 'M' + (bx - 3) + ',' + by1 + 'H' + (bx + 3));
      G.eBarT.setAttribute('x', bx); G.eBarT.setAttribute('y', by1 - 4);
      // field arrow in SCR: points from N to P (towards -x), length ~ sqrt(Vd - V)
      var fy = g.yA + 14, fl = Math.min(m.wS * 0.8, 14 + 10 * Math.sqrt(Vd - V)), fcx = m.xp + m.wS / 2;
      G.fieldArrow.setAttribute('d', 'M' + (fcx + fl / 2) + ',' + fy + 'H' + (fcx - fl / 2 + 5) + 'M' + (fcx - fl / 2) + ',' + fy + 'l6,-3.5v7z');
      G.fieldTxt.setAttribute('x', fcx); G.fieldTxt.setAttribute('y', fy - 6);

      /* ---- (b) densities, linear, separate scales ---- */
      var yb0 = g.yB + g.hB;
      var mxP = niceMax(Math.max(P.npE, np0) * 1.12), mxN = niceMax(Math.max(P.pnE, pn0) * 1.12);
      geo.mxP = mxP.max; geo.mxN = mxN.max;
      function yP(v) { return yb0 - v / mxP.max * (g.hB - 6); }
      function yN(v) { return yb0 - v / mxN.max * (g.hB - 6); }
      var cp = '', cn = '';
      for (i = 0; i <= NSAMP; i++) {
        d = DEPTH * (1 - i / NSAMP); x = m.xp - d * m.sP;
        cp += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yP(np0 * (1 + (P.ev - 1) * Math.exp(-d))).toFixed(1);
      }
      for (i = 0; i <= NSAMP; i++) {
        d = DEPTH * i / NSAMP; x = m.xn + d * m.sN;
        cn += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yN(pn0 * (1 + (P.ev - 1) * Math.exp(-d))).toFixed(1);
      }
      G.curP.setAttribute('d', cp); G.curN.setAttribute('d', cn);
      G.fillP.setAttribute('d', cp + 'L' + m.xp + ',' + yb0 + 'L' + g.ml + ',' + yb0 + 'Z');
      G.fillN.setAttribute('d', cn + 'L' + m.right + ',' + yb0 + 'L' + m.xn + ',' + yb0 + 'Z');
      G.eqP.setAttribute('d', 'M' + g.ml + ',' + yP(np0) + 'H' + m.xp);
      G.eqN.setAttribute('d', 'M' + m.xn + ',' + yN(pn0) + 'H' + m.right);
      var lnx = m.xp - m.sP, lpx = m.xn + m.sN;
      G.LnMark.setAttribute('d', 'M' + lnx + ',' + (g.yB + 14) + 'V' + yb0);
      G.LpMark.setAttribute('d', 'M' + lpx + ',' + (g.yB + 14) + 'V' + yb0);
      G.LnT.setAttribute('x', lnx); G.LnT.setAttribute('y', g.yB + 11);
      G.LpT.setAttribute('x', lpx); G.LpT.setAttribute('y', g.yB + 11);
      axis(G.axP, mxP, yP, g.ml, -1, C.el);
      axis(G.axN, mxN, yN, g.ml + g.pw, 1, C.ho);
      G.npLab.setAttribute('x', g.ml + 4); G.npLab.setAttribute('y', g.yB + 14);
      G.pnLab.setAttribute('x', m.right - 4); G.pnLab.setAttribute('y', g.yB + 14);
      // edge value tags
      G.edgeP.textContent = sci(P.npE, 2); G.edgeN.textContent = sci(P.pnE, 2);
      G.edgeP.setAttribute('x', m.xp - 4); G.edgeP.setAttribute('y', Math.max(g.yB + 24, yP(P.npE) - 5));
      G.edgeN.setAttribute('x', m.xn + 4); G.edgeN.setAttribute('y', Math.max(g.yB + 24, yN(P.pnE) - 5));
      if (g.narrow) { G.edgeP.setAttribute('font-size', fs - 1); G.edgeN.setAttribute('font-size', fs - 1); }
      geo.yP = yP; geo.yN = yN; geo.m = m;

      /* ---- (c) current shares (normalised by the total J) ---- */
      var yc0 = g.yC + g.hC, hc = g.hC - 18;
      function yJ(f) { return yc0 - f * hc; }
      var a1 = '', a2top = [], bN1 = '', k2;
      // P side: J_n/J = shareN e^{-d/Ln} (minority diffusion), J_p/J = 1 - that
      var pts = [];
      for (i = 0; i <= NSAMP; i++) { d = DEPTH * (1 - i / NSAMP); pts.push([m.xp - d * m.sP, shareN * Math.exp(-d)]); }
      G.jnMinP.setAttribute('d', 'M' + g.ml + ',' + yc0 + pts.map(function (p) { return 'L' + p[0].toFixed(1) + ',' + yJ(p[1]).toFixed(1); }).join('') + 'L' + m.xp + ',' + yc0 + 'Z');
      G.jpMajP.setAttribute('d', 'M' + g.ml + ',' + yJ(1) + 'L' + m.xp + ',' + yJ(1) + pts.slice().reverse().map(function (p) { return 'L' + p[0].toFixed(1) + ',' + yJ(p[1]).toFixed(1); }).join('') + 'Z');
      G.jnScr.setAttribute('d', 'M' + m.xp + ',' + yc0 + 'V' + yJ(shareN) + 'H' + m.xn + 'V' + yc0 + 'Z');
      G.jpScr.setAttribute('d', 'M' + m.xp + ',' + yJ(shareN) + 'V' + yJ(1) + 'H' + m.xn + 'V' + yJ(shareN) + 'Z');
      var ptsN = [];
      for (i = 0; i <= NSAMP; i++) { d = DEPTH * i / NSAMP; ptsN.push([m.xn + d * m.sN, 1 - shareP * Math.exp(-d)]); }
      G.jnMajN.setAttribute('d', 'M' + m.xn + ',' + yc0 + ptsN.map(function (p) { return 'L' + p[0].toFixed(1) + ',' + yJ(p[1]).toFixed(1); }).join('') + 'L' + m.right + ',' + yc0 + 'Z');
      G.jpMinN.setAttribute('d', 'M' + m.xn + ',' + yJ(1) + 'L' + m.right + ',' + yJ(1) + ptsN.slice().reverse().map(function (p) { return 'L' + p[0].toFixed(1) + ',' + yJ(p[1]).toFixed(1); }).join('') + 'Z');
      G.jDiv.setAttribute('d', pts.map(function (p, k) { return (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + yJ(p[1]).toFixed(1); }).join('') +
        'L' + m.xn + ',' + yJ(shareN) + ptsN.map(function (p) { return 'L' + p[0].toFixed(1) + ',' + yJ(p[1]).toFixed(1); }).join(''));
      G.jTot.setAttribute('d', 'M' + g.ml + ',' + yJ(1) + 'H' + m.right);
      var zero = Math.abs(P.J) < J0 * 0.02;
      var op = zero ? 0.18 : 1;
      [G.jnMinP, G.jpMajP, G.jnScr, G.jpScr, G.jpMinN, G.jnMajN, G.jDiv, G.jTot, G.jLabs].forEach(function (e) { e.setAttribute('opacity', op); });
      G.jZero.textContent = zero ? 'J ≈ 0 at V ≈ 0: nothing flows' : '';
      G.jZero.setAttribute('x', g.ml + g.pw / 2); G.jZero.setAttribute('y', g.yC + g.hC / 2 + 4);
      var dirTxt = P.J > 0 ? 'from P to N →' : '← from N to P';
      G.jTxt.textContent = zero ? '' : 'total J = ' + sci(Math.abs(P.J), 2) + ' A/cm², ' + dirTxt + ', the same at every x';
      G.jTxt.setAttribute('x', g.ml + g.pw / 2); G.jTxt.setAttribute('y', g.yC + 11);
      if (g.narrow) G.jTxt.textContent = zero ? '' : 'J = ' + sci(Math.abs(P.J), 2) + ' A/cm² ' + (P.J > 0 ? '(P→N)' : '(N→P)') + ', same at all x';
      drawJLabels(m, yJ);
      // axis for (c)
      while (G.axC.firstChild) G.axC.removeChild(G.axC.firstChild);
      [[0, '0'], [0.5, '0.5'], [1, '1']].forEach(function (t) {
        el('path', { d: 'M' + (g.ml - 4) + ',' + yJ(t[0]) + 'H' + g.ml, stroke: C.grey }, G.axC);
        var tt = el('text', { x: g.ml - 6, y: yJ(t[0]) + 4, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, G.axC); tt.textContent = t[1];
      });
      var yl = el('text', { x: g.ml + g.pw + 6, y: yJ(shareN) + 4, 'font-size': fs - 1, fill: C.grey }, G.axC);
      yl.textContent = (shareP * 100).toFixed(0) + '/' + (shareN * 100).toFixed(0) + ' %';
      var yl2 = el('text', { x: g.ml - 6, y: g.yC + g.hC + 14, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, G.axC);
      yl2.textContent = '÷ J';
      // x scale bars
      while (G.xbar.firstChild) G.xbar.removeChild(G.xbar.firstChild);
      var yx = g.yC + g.hC + 16;
      function bar(x0, len, label) {
        el('path', { d: 'M' + x0 + ',' + (yx - 3) + 'v6M' + x0 + ',' + yx + 'h' + len + 'M' + (x0 + len) + ',' + (yx - 3) + 'v6', stroke: C.grey, fill: 'none' }, G.xbar);
        var t = el('text', { x: x0 + len / 2, y: yx + 13, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, G.xbar); t.textContent = label;
      }
      bar(g.ml + 4, m.sP * 20e-4 / Ln, '20 µm');
      bar(m.right - 4 - m.sN * 100e-4 / Lp, m.sN * 100e-4 / Lp, '100 µm');
      var scrT = el('text', { x: m.xp + m.wS / 2, y: yx + 13, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, G.xbar);
      scrT.textContent = 'W = ' + (P.W * 1e4).toFixed(2) + ' µm';
      scrT.setAttribute('y', yx + 26);
      // axis breaks at the SCR edges (scale changes)
      [m.xp, m.xn].forEach(function (xx) {
        el('path', { d: 'M' + (xx - 4) + ',' + (yx + 4) + 'l4,-8M' + xx + ',' + (yx + 4) + 'l4,-8', stroke: C.grey, fill: 'none' }, G.xbar);
      });

      /* ---- readouts ---- */
      R.V.textContent = (V >= 0 ? '+' : '−') + Math.abs(V).toFixed(3) + ' V';
      R.step.textContent = (Vd - V).toFixed(3) + ' eV';
      R.W.textContent = (P.W * 1e4).toFixed(3) + ' µm';
      R.ex.textContent = sci(P.ev, 3);
      R.np.textContent = sci(P.npE, 2) + ' cm⁻³';
      R.pn.textContent = sci(P.pnE, 2) + ' cm⁻³';
      R.J.textContent = (Math.abs(P.J) < 1e-30 ? '0' : sci(P.J, 3)) + ' A/cm²';
      R.I.textContent = Math.abs(P.I) < 1e-34 ? '0 A' : fmtI(P.I);
      R.sh.textContent = (shareP * 100).toFixed(1) + ' % : ' + (shareN * 100).toFixed(1) + ' %';

      var w;
      if (V < -0.1) w = '<b>Reverse:</b> the edges are emptied (×e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> ≈ 0), minority carriers within ~<i>L</i> diffuse to the SCR and are swept across; the current saturates at −<i>I</i><sub>0</sub> = −' + sci(I0, 2) + ' A, independent of <i>V</i>. <i>E</i><sub>Fn</sub>, <i>E</i><sub>Fp</sub> drop at the edges.';
      else if (V < 0.04) w = '<b>Near equilibrium:</b> <i>E</i><sub>Fn</sub> and <i>E</i><sub>Fp</sub> almost merge (split <i>qV</i>); edge densities change by e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> = ' + P.ev.toFixed(2) + '; the current is a few <i>I</i><sub>0</sub>.';
      else if (V <= 0.72) w = '<b>Forward:</b> edge densities ×e<sup><i>V</i>/<i>V</i><sub>T</sub></sup> (×10 every 59.6 mV) and decay over <i>L</i><sub>n</sub>, <i>L</i><sub>p</sub>. <b>Total current constant along the device:</b> the minority diffusion current decays as carriers recombine and the majority current takes over; holes carry ' + (shareP * 100).toFixed(0) + ' % at the junction.';
      else w = '<b>Beyond ≈ 0.72 V:</b> <i>p</i><sub>n</sub>(<i>x</i><sub>n</sub>) = ' + sci(P.pnE, 2) + ' cm<sup>−3</sup> approaches <i>N</i><sub>D</sub> = 10<sup>16</sup>: low injection fails and series resistance takes over; the model is stretched here.';
      watch.innerHTML = w;

      updateIV(V, P);
    }

    function stepLabel(t, val, short) {
      while (t.firstChild) t.removeChild(t.firstChild);
      var parts = short ? [[val.toFixed(3) + ' eV', '']] : [['q(', ''], ['V', 'i'], ['d', 's'], ['−', ''], ['V', 'i'], [') = ' + val.toFixed(3) + ' eV', '']];
      parts.forEach(function (p) {
        var a = el('tspan', p[1] === 'i' ? { 'font-style': 'italic' } : p[1] === 's' ? { 'baseline-shift': 'sub', 'font-size': '75%' } : {}, t);
        a.textContent = p[0];
      });
    }

    function drawJLabels(m, yJ) {
      var g = geo, L = G.jLabs, fs = g.fs;
      while (L.firstChild) L.removeChild(L.firstChild);
      function t(x, y, txt, col, anchor) {
        var e = el('text', { x: x, y: y, fill: col, 'text-anchor': anchor || 'middle', 'font-size': fs - 0.5 }, L);
        e.textContent = txt; return e;
      }
      var pMid = (g.ml + m.xp) / 2, nMid = (m.xn + m.right) / 2;
      var wide = !g.narrow;
      t(nMid + (m.right - m.xn) * 0.18, yJ(0.25) + 4, wide ? 'Jₙ: majority electrons (drift)' : 'Jₙ majority', '#173c78');
      t(m.xn + 6, yJ(0.62) + 4, wide ? 'Jₚ: hole diffusion' : 'Jₚ diff.', '#8a3f0e', 'start');
      t(pMid - (m.xp - g.ml) * 0.12, yJ(0.6) + 4, wide ? 'Jₚ: majority holes (drift)' : 'Jₚ majority', '#8a3f0e');
      if (wide) t(m.xp - 4, yJ(0.05) + 3, 'Jₙ diff.', '#173c78', 'end');
    }

    function axis(gr, mx, yf, x0, side, col) {
      var g = geo;
      while (gr.firstChild) gr.removeChild(gr.firstChild);
      var n = Math.round(mx.max / mx.step), k, every = n > 6 ? 2 : 1;
      for (k = 0; k <= n; k++) {
        var v = k * mx.step, y = yf(v);
        el('path', { d: 'M' + x0 + ',' + y + 'h' + (4 * side), stroke: col }, gr);
        if (k % every) continue;
        var t = el('text', { x: x0 + 6 * side, y: y + 3.5, 'font-size': g.fs - 1.5, fill: col, 'text-anchor': side < 0 ? 'end' : 'start' }, gr);
        t.textContent = sci(v, 2);
      }
      var u = el('text', { x: x0 + 6 * side, y: g.yB - 4, 'font-size': g.fs - 1.5, fill: col, 'text-anchor': side < 0 ? 'end' : 'start' }, gr);
      u.textContent = 'cm⁻³';
    }

    /* ---------- I(V) panel ---------- */
    var IV = {};
    function buildIV() {
      var Wd = Math.max(240, ivP.clientWidth - 12);
      var Hh = Math.round(Math.min(260, Wd * 0.78));
      var ml = 46, mr = 10, mt = 36, mb = 30, fs = 11;
      IV = { W: Wd, H: Hh, ml: ml, mr: mr, mt: mt, mb: mb, pw: Wd - ml - mr, ph: Hh - mt - mb, fs: fs, Imax: 0.9e-3 };
      ivsvg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + Hh); ivsvg.setAttribute('width', Wd); ivsvg.setAttribute('height', Hh);
      while (ivsvg.firstChild) ivsvg.removeChild(ivsvg.firstChild);
      var t = el('text', { x: 4, y: 14, 'font-size': fs + 0.5, 'font-weight': 700, fill: C.navy }, ivsvg); t.textContent = '(d) I(V), linear';
      function X(v) { return ml + (v - VMIN) / (VMAX - VMIN) * IV.pw; }
      function Y(I) { return mt + IV.ph - (I + 0.06e-3) / (IV.Imax + 0.06e-3) * IV.ph; }
      IV.X = X; IV.Y = Y;
      el('rect', { x: X(0.72), y: mt, width: X(VMAX) - X(0.72), height: IV.ph, fill: '#f4ecec' }, ivsvg);
      el('rect', { x: ml, y: mt, width: IV.pw, height: IV.ph, fill: 'none', stroke: C.line }, ivsvg);
      el('path', { d: 'M' + ml + ',' + Y(0) + 'H' + (ml + IV.pw), stroke: '#b9c2cd' }, ivsvg);
      el('path', { d: 'M' + X(0) + ',' + mt + 'V' + (mt + IV.ph), stroke: '#b9c2cd' }, ivsvg);
      [-2, -1, 0, 0.5].forEach(function (v) {
        el('path', { d: 'M' + X(v) + ',' + (mt + IV.ph) + 'v4', stroke: C.grey }, ivsvg);
        var tt = el('text', { x: X(v), y: mt + IV.ph + 15, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'middle' }, ivsvg);
        tt.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
      });
      var xl = el('text', { x: ml + IV.pw, y: mt + IV.ph + 27, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, ivsvg); xl.textContent = 'V (volts)';
      [0, 0.4e-3, 0.8e-3].forEach(function (I) {
        el('path', { d: 'M' + (ml - 4) + ',' + Y(I) + 'h4', stroke: C.grey }, ivsvg);
        var tt = el('text', { x: ml - 6, y: Y(I) + 4, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, ivsvg); tt.textContent = (I * 1e3).toFixed(1);
      });
      var yl = el('text', { x: ml - 6, y: mt - 4, 'font-size': fs - 1, fill: C.grey, 'text-anchor': 'end' }, ivsvg); yl.textContent = 'mA';
      var sh = el('text', { x: X(0.735), y: mt + 12, 'font-size': fs - 2, fill: '#9a6b6b', 'text-anchor': 'middle', transform: 'rotate(-90 ' + X(0.735) + ' ' + (mt + 40) + ')' }, ivsvg);
      sh.textContent = '';
      var d = '';
      for (var i = 0; i <= 300; i++) { var v = VMIN + (VMAX - VMIN) * i / 300; d += (i ? 'L' : 'M') + X(v).toFixed(1) + ',' + Y(I0 * (Math.exp(v / VT) - 1)).toFixed(1); }
      el('path', { d: d, stroke: C.navy, 'stroke-width': 2, fill: 'none' }, ivsvg);
      // inset: around the reverse branch, in units of I0
      var iw = IV.pw * 0.56, ih = IV.ph * 0.42, ix = ml + 6, iy = mt + 6;
      IV.inset = { x: ix, y: iy, w: iw, h: ih };
      el('rect', { x: ix, y: iy, width: iw, height: ih, fill: '#fff', stroke: '#b9c2cd' }, ivsvg);
      function Xi(v) { return ix + 4 + (v - VMIN) / (0.1 - VMIN) * (iw - 8); }
      function Yi(r) { return iy + ih - 6 - (r + 1.5) / (4 + 1.5) * (ih - 18); } // r = I/I0 from -1.5 to 4
      IV.Xi = Xi; IV.Yi = Yi;
      el('path', { d: 'M' + (ix + 2) + ',' + Yi(0) + 'H' + (ix + iw - 2), stroke: '#d5dbe2' }, ivsvg);
      el('path', { d: 'M' + (ix + 2) + ',' + Yi(-1) + 'H' + (ix + iw - 2), stroke: C.acc, 'stroke-dasharray': '3 2' }, ivsvg);
      var di = '';
      for (i = 0; i <= 200; i++) {
        var vv = VMIN + (0.1 - VMIN) * i / 200, r = Math.exp(vv / VT) - 1;
        if (r > 4) break;
        di += (i ? 'L' : 'M') + Xi(vv).toFixed(1) + ',' + Yi(r).toFixed(1);
      }
      el('path', { d: di, stroke: C.navy, 'stroke-width': 1.6, fill: 'none' }, ivsvg);
      var it = el('text', { x: ix + 5, y: iy + 11, 'font-size': fs - 2, fill: C.grey }, ivsvg); it.textContent = 'zoom: I in units of I₀ = ' + sci(I0, 2) + ' A';
      var i1 = el('text', { x: ix + 30, y: Yi(-1) + 11, 'font-size': fs - 1.5, fill: C.acc, 'text-anchor': 'end' }, ivsvg); i1.textContent = '−I₀';
      IV.dot = el('circle', { r: 5, fill: C.acc, stroke: '#fff', 'stroke-width': 1.5 }, ivsvg);
      IV.dotI = el('circle', { r: 3.5, fill: C.acc, stroke: '#fff', 'stroke-width': 1 }, ivsvg);
      IV.lab = el('text', { 'font-size': fs - 1, fill: C.ink }, ivsvg);
      var lt = el('text', { x: ml - 40, y: mt + IV.ph + 27, 'font-size': fs - 2, fill: '#9a6b6b' }, ivsvg); lt.textContent = 'shaded (> 0.72 V): low injection fails';
    }
    function updateIV(V, P) {
      var I = P.I, X = IV.X, Y = IV.Y;
      var yy = Math.max(IV.mt, Math.min(IV.mt + IV.ph, Y(I)));
      IV.dot.setAttribute('cx', X(V)); IV.dot.setAttribute('cy', yy);
      var r = I / I0;
      if (V <= 0.1 && r <= 4) { IV.dotI.setAttribute('cx', IV.Xi(V)); IV.dotI.setAttribute('cy', IV.Yi(r)); IV.dotI.setAttribute('opacity', 1); }
      else IV.dotI.setAttribute('opacity', 0);
      var lx = X(V) - 8, anchor = 'end';
      if (lx < IV.ml + IV.inset.w + 20 && yy < IV.inset.y + IV.inset.h + 14) { yy = IV.inset.y + IV.inset.h + 30; }
      IV.lab.setAttribute('x', lx); IV.lab.setAttribute('y', Math.max(IV.mt + IV.inset.h + 24, yy - 8)); IV.lab.setAttribute('text-anchor', anchor);
      IV.lab.textContent = 'I = ' + fmtI(I);
      if (V < -0.35) { IV.lab.setAttribute('text-anchor', 'start'); IV.lab.setAttribute('x', X(V) + 6); }
    }

    /* ---------- moving carriers ---------- */
    var pool = [], parts = [], flashes = [];
    function getCircle(kind) {
      var c;
      for (var i = 0; i < pool.length; i++) if (pool[i].free && pool[i].kind === kind) { c = pool[i]; break; }
      if (!c) {
        var e = kind === 'e' ? el('circle', { r: 3.2, fill: C.el }, G.partLayer) :
          kind === 'h' ? el('circle', { r: 3.3, fill: '#fff', stroke: C.ho, 'stroke-width': 1.6 }, G.partLayer) :
            el('circle', { r: 2, fill: 'none', stroke: '#f2b84b', 'stroke-width': 1.5 }, G.partLayer);
        c = { e: e, kind: kind, free: false }; pool.push(c);
      }
      c.free = false; c.e.setAttribute('visibility', 'visible');
      return c;
    }
    function release(c) { c.free = true; c.e.setAttribute('visibility', 'hidden'); }
    var acc = { P: 0, N: 0 };
    function stepCarriers(dt) {
      var V = st.V, P = phys(V), m = geo.m, g = geo;
      var v = V / VT, f;
      var R0 = g.narrow ? 26 : 40;
      var fwd = V > 0.012;
      if (fwd) f = Math.min(1, Math.pow(Math.min(v, 29) / 29, 2));
      else if (V < -0.012) f = 0.12 * (1 - P.ev);
      else f = 0;
      var rate = { P: R0 * f * 2 * shareN, N: R0 * f * 2 * shareP };
      ['P', 'N'].forEach(function (s) {
        acc[s] += rate[s] * dt;
        while (acc[s] >= 1 && parts.length < 260) {
          acc[s] -= 1;
          var p = { s: s, u: 0.12 + 0.8 * Math.random(), fwd: fwd };
          if (fwd) { p.ph = 'cross'; p.sx = 0; p.d = 0; }
          else { p.ph = 'in'; p.d = Math.min(DEPTH, -Math.log(1 - Math.random() * 0.96)); }
          p.c = getCircle(s === 'P' ? 'e' : 'h');
          parts.push(p);
        }
        if (acc[s] > 3) acc[s] = 0;
      });
      var speed = 0.85; // diffusion lengths per second (schematic)
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i], x, y, dead = false;
        if (p.ph === 'cross') {
          p.sx += dt * 2.2;
          if (p.sx >= 1) { p.ph = 'in'; p.d = 0; }
        } else if (p.fwd) {
          var dd = speed * dt * (0.6 + 0.8 * Math.random());
          p.d += dd + (Math.random() - 0.5) * 0.03;
          if (p.d < 0) p.d = 0;
          if (Math.random() < dd) { dead = 'rec'; }        // exponential survival e^{-d/L}
          if (p.d > DEPTH) dead = 'out';
        } else {
          p.d -= speed * dt * (0.6 + 0.8 * Math.random());
          if (p.d <= 0) { p.ph = 'swept'; p.sx = 0; }
        }
        if (p.ph === 'swept') { p.sx += dt * 3; if (p.sx >= 1) dead = 'out'; }
        // position
        if (p.ph === 'cross' || p.ph === 'swept') {
          var frac = p.ph === 'cross' ? p.sx : p.sx; // cross: from far edge to near edge; swept: near edge to far edge
          var a, b;
          if (p.ph === 'cross') { a = p.s === 'P' ? m.xn : m.xp; b = p.s === 'P' ? m.xp : m.xn; }
          else { a = p.s === 'P' ? m.xp : m.xn; b = p.s === 'P' ? m.xn + 10 : m.xp - 10; }
          x = a + (b - a) * frac;
          y = g.yB + g.hB * (0.35 + 0.4 * p.u);
        } else {
          x = p.s === 'P' ? m.xp - p.d * m.sP : m.xn + p.d * m.sN;
          var dens = p.s === 'P' ? np0 * (1 + (P.ev - 1) * Math.exp(-p.d)) : pn0 * (1 + (P.ev - 1) * Math.exp(-p.d));
          var yb = p.s === 'P' ? g.yP(dens) : g.yN(dens);
          var y0 = g.yB + g.hB;
          y = y0 - p.u * Math.max(6, (y0 - yb)) + 0;
          y = Math.max(g.yB + 4, Math.min(y0 - 3, y));
        }
        if (dead) {
          if (dead === 'rec') { var fl = getCircle('f'); fl.e.setAttribute('cx', x); fl.e.setAttribute('cy', y); flashes.push({ c: fl, t: 0 }); }
          release(p.c); parts.splice(i, 1); continue;
        }
        p.c.e.setAttribute('cx', x.toFixed(1)); p.c.e.setAttribute('cy', y.toFixed(1));
      }
      for (i = flashes.length - 1; i >= 0; i--) {
        var fl2 = flashes[i]; fl2.t += dt;
        if (fl2.t > 0.35) { release(fl2.c); flashes.splice(i, 1); continue; }
        fl2.c.e.setAttribute('r', 2 + fl2.t * 18); fl2.c.e.setAttribute('stroke-opacity', 1 - fl2.t / 0.35);
      }
    }
    function clearCarriers() { parts.forEach(function (p) { release(p.c); }); parts = []; flashes.forEach(function (f) { release(f.c); }); flashes = []; }

    /* ---------- controls ---------- */
    function setV(v) { st.V = Math.max(VMIN, Math.min(VMAX, v)); slider.value = st.V; update(); }
    slider.addEventListener('input', function () { st.V = parseFloat(slider.value); stopPlay(); update(); });
    function stopPlay() { st.playing = false; bPlay.classList.remove('on'); bPlay.textContent = '▶ Sweep V'; }
    bPlay.addEventListener('click', function () {
      st.playing = !st.playing;
      bPlay.classList.toggle('on', st.playing);
      bPlay.textContent = st.playing ? '❚❚ Pause sweep' : '▶ Sweep V';
      if (st.playing && st.V >= VMAX - 0.001) st.dir = -1;
      if (st.playing && st.V <= VMIN + 0.001) st.dir = 1;
    });
    bCar.addEventListener('click', function () {
      st.carriers = !st.carriers; bCar.classList.toggle('on', st.carriers);
      bCar.textContent = st.carriers ? 'Carriers: moving' : 'Carriers: paused';
    });

    var last = null, alive = true, rafId;
    function frame(ts) {
      if (!alive) return;
      if (!root.isConnected) { alive = false; return; }
      var dt = last == null ? 0 : Math.min(0.05, (ts - last) / 1000); last = ts;
      var needs = false;
      if (st.playing) {
        var rate = st.V > 0.25 ? 0.07 : 0.45;
        st.V += st.dir * rate * dt;
        if (st.V >= VMAX) { st.V = VMAX; st.dir = -1; }
        if (st.V <= VMIN) { st.V = VMIN; st.dir = 1; }
        slider.value = st.V; needs = true;
      }
      if (st.Edisp && (Math.abs(st.Edisp.hi - (EiN + Vd - st.V + Eg / 2 + 0.22)) > 1e-3)) needs = true;
      if (needs) update();
      if (st.carriers && geo.m) stepCarriers(dt * CARRIER * st.spd);
      rafId = requestAnimationFrame(frame);
    }

    var rt;
    function layout() {
      var w = root.clientWidth;
      grid.classList.toggle('narrow', w < 820);
      clearCarriers();
      build();
      if (kctl) {
        K.slice(svg, [geo.yB - 35, geo.yC - 35], function (k) { return kctl.strip({ inside: true, tag: ['(a)', '(b)', '(c)'][k] }); });
        if (!ivP._strip) { ivP._strip = kctl.strip({ inside: true, tag: '(d)' }); ivP.appendChild(ivP._strip); }
        update();
      }
    }
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
    layout();
    rafId = requestAnimationFrame(frame);
  }

  window.IX[ID] = mount;
})();
