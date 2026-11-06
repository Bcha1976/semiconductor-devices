/* Interactive module "caps": The junction stores charge, C_T and C_D (Ch7).
   Reference long diode of Ch6-7: Si 300 K, N_A = 1e18, N_D = 1e16 cm^-3, S = 1e-4 cm^2, D_p = 12, D_n = 35 cm^2/s,
   tau_p = 10 us, tau_n = 0.1 us. Equations: W (7.3), C_T = eps S / W (7.5), C_T = C_T0/sqrt(1 - V/V_d) (7.6),
   1/C_T^2 (7.7), Q_p (7.10), Q = tau_bar I (7.12), C_D = (q/kT) tau_bar I (7.13, 7.14), Shockley law (6.9, 6.10). */
(function () {
  'use strict';
  var ID = 'caps';
  var q = 1.602e-19, EPS = 11.7 * 8.854e-14, NI = 1e10, VT = 0.0259;
  var NA = 1e18, ND = 1e16, S = 1e-4, DP = 12, DN = 35, TAUP = 10e-6, TAUN = 0.1e-6;
  var VD = VT * Math.log(NA * ND / (NI * NI));             // eq 5.13: 0.835 V
  var LP = Math.sqrt(DP * TAUP), LN = Math.sqrt(DN * TAUN); // 110 um, 18.7 um
  var PN0 = NI * NI / ND, NP0 = NI * NI / NA;
  var J0P = q * NI * NI * DP / (ND * LP), J0N = q * NI * NI * DN / (NA * LN), J0 = J0P + J0N; // eq 6.10
  var I0 = S * J0;
  var TAUB = (TAUP * J0P + TAUN * J0N) / J0;               // eq 7.12: 8.56 us
  var CT0 = S * Math.sqrt(EPS * q * ND / (2 * VD));        // eq 7.6: 3.15 pF
  var VMIN = -10, VMAX = 0.75, VLI = 0.72;                 // low injection ends near 0.72 V (Ch6/Ch7)
  var COL = { text: '#1d2430', grey: '#6B6B6B', navy: '#1F3A5F', acc: '#D9771A', el: '#1F4E9A', ho: '#C8641E',
    fld: '#2E7D4F', accep: '#5B6B82', donor: '#D9771A', border: '#dde3ea', scr: '#e9edf2', ct: '#1d2430', cd: '#D9771A' };

  function Wof(V) { return Math.sqrt(2 * EPS * (VD - V) / q * (1 / NA + 1 / ND)); } // eq 7.3 (cm)
  function Wn(V) { return Wof(V) * NA / (NA + ND); }
  function CT(V) { return CT0 / Math.sqrt(1 - V / VD); }   // eq 7.6
  function CTplate(V) { return EPS * S / Wof(V); }         // eq 7.5
  function Iof(V) { return I0 * (Math.exp(V / VT) - 1); }  // eq 6.9 times S
  function CD(V) { return TAUB / VT * I0 * Math.exp(V / VT); } // eq 7.14 = (q/kT) tau_bar (I + I0); eq 7.13 in forward bias
  function Qp(V) { return q * S * LP * PN0 * (Math.exp(V / VT) - 1); } // eq 7.10
  function Qn(V) { return q * S * LN * NP0 * (Math.exp(V / VT) - 1); }
  var VX = (function () { var a = 0.3, b = 0.65; for (var i = 0; i < 60; i++) { var m = (a + b) / 2; if (CD(m) > CT(m)) b = m; else a = m; } return (a + b) / 2; })();

  var PRESETS = [
    { v: -10, l: '−10 V' }, { v: -5, l: '−5 V' }, { v: -1, l: '−1 V' }, { v: 0, l: '0' }, { v: 0.4, l: '+0.4 V' },
    { v: +VX.toFixed(3), l: 'C_T = C_D' }, { v: 0.578, l: '1 µA' }, { v: 0.637, l: '10 µA' }, { v: 0.697, l: '100 µA' }
  ];

  var CSS = '' +
    '.ix-caps{color:#1d2430;font-family:inherit;line-height:1.35}' +
    '.ix-caps .ixc-top{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin:0 0 8px}' +
    '.ix-caps .ixc-v{flex:1 1 300px;display:flex;align-items:center;gap:10px;font-size:14px}' +
    '.ix-caps .ixc-v input{flex:1;min-width:120px;accent-color:#D9771A}' +
    '.ix-caps .ixc-v .vl{white-space:nowrap}.ix-caps .ixc-v small{font-size:12px;color:#6B6B6B}' +
    '.ix-caps .ixc-v b{font-variant-numeric:tabular-nums;min-width:78px;color:#1F3A5F}' +
    '.ix-caps .ixc-grp{display:flex;flex-wrap:wrap;gap:5px;align-items:center}' +
    '.ix-caps button{font:inherit;font-size:13px;padding:4px 9px;border:1px solid #c9d2dd;border-radius:6px;background:#fff;color:#1F3A5F;cursor:pointer}' +
    '.ix-caps button:hover{border-color:#1F3A5F}' +
    '.ix-caps button.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}' +
    '.ix-caps label{font-size:13px;color:#6B6B6B;display:flex;align-items:center;gap:6px}' +
    '.ix-caps label input[type=range]{accent-color:#D9771A;width:110px}' +
    '.ix-caps .ixc-watch{background:#fbf3ea;border-left:4px solid #D9771A;border-radius:6px;padding:7px 11px;margin:4px 0 8px;font-size:14px;min-height:2.7em}' +
    '.ix-caps .ixc-watch b{color:#1F3A5F}' +
    '.ix-caps .ixc-read{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}' +
    '.ix-caps .ixc-read div{border:1px solid #dde3ea;border-radius:6px;padding:4px 9px;font-size:13px;background:#fff;min-width:92px}' +
    '.ix-caps .ixc-read span{display:block;color:#6B6B6B;font-size:11.5px}' +
    '.ix-caps .ixc-read strong{font-weight:600;font-variant-numeric:tabular-nums}' +
    '.ix-caps .ixc-read div.hl{border-color:#D9771A;background:#fffaf4}' +
    '.ix-caps .ixc-box{border:1px solid #dde3ea;border-radius:6px;background:#fff;overflow:hidden}' +
    '.ix-caps .ixc-row{display:grid;grid-template-columns:3fr 2fr;gap:10px;margin-top:10px}' +
    '.ix-caps .ixc-col{min-width:0}.ix-caps .ixc-col .ixk-strip{margin-bottom:0}' +
    '.ix-caps svg{display:block;width:100%;height:auto;font-family:inherit;touch-action:pan-y}' +
    '.ix-caps .ixc-plot{cursor:crosshair}' +
    '.ix-caps .ixc-cap{font-size:12.5px;color:#6B6B6B;margin:6px 2px 0}' +
    '.ix-caps .ixc-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;margin:0 0 6px}' +
    '.ix-caps .ixc-legend svg{display:inline-block;width:auto;vertical-align:middle;margin-right:4px}' +
    '@media (max-width:640px){.ix-caps .ixc-v small{display:none}.ix-caps .ixc-row{grid-template-columns:1fr}.ix-caps .ixc-read div{min-width:0;flex:1 1 30%}}';

  function injectCSS() {
    if (document.getElementById('ix-' + ID + '-css')) return;
    var st = document.createElement('style'); st.id = 'ix-' + ID + '-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function mn(s) { return String(s).replace(/-/g, '−'); }
  function fmt(x, d) { return mn(x.toFixed(d)); }
  function sb(s) { return '<tspan baseline-shift="sub" font-size="72%">' + s + '</tspan>'; }
  function it(s) { return '<tspan font-style="italic">' + s + '</tspan>'; }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.fs || 12) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') +
      ' fill="' + (o.fill || COL.text) + '"' + (o.w ? ' font-weight="' + o.w + '"' : '') + '>' + s + '</text>';
  }
  function line(x1, y1, x2, y2, st, w, dash) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + st + '" stroke-width="' + (w || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function circ(x, y, r) { return 'M' + (x - r).toFixed(1) + ' ' + y.toFixed(1) + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0'; }
  function sq(x, y, a) { return 'M' + (x - a).toFixed(1) + ' ' + (y - a).toFixed(1) + 'h' + (2 * a) + 'v' + (2 * a) + 'h' + (-2 * a) + 'z'; }
  // engineering formatting
  function eng(x, unit, d) {
    if (x === 0) return '0 ' + unit;
    var ax = Math.abs(x), pre = [['', 1], ['m', 1e-3], ['µ', 1e-6], ['n', 1e-9], ['p', 1e-12], ['f', 1e-15], ['a', 1e-18]];
    for (var i = 0; i < pre.length; i++) if (ax >= pre[i][1] * 0.9995) { var v = x / pre[i][1], t = v.toPrecision(d || 3); if (t.indexOf('e') >= 0) t = String(Math.round(v)); return mn(t) + ' ' + pre[i][0] + unit; }
    return expo(x, 1) + ' ' + unit;
  }
  function expo(x, d) { // 1.2×10⁻⁵
    if (x === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
    var sup = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    return mn(m.toFixed(d === undefined ? 1 : d)) + '×10' + String(e).split('').map(function (c) { return sup[c]; }).join('');
  }
  function nice125(x) { var e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function mount(root) {
    injectCSS();
    root.innerHTML = '';
    root.classList.add('ix-' + ID);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = { V: 0, wig: !reduce, dV: 0.02, t: 0, tc: 0, spd: 1, last: 0 };
    var CARRIER = 0.3; // carrier jitter 3.3x slower than in v2 (Handoff 4); Speed multiplies it

    var top = document.createElement('div'); top.className = 'ixc-top';
    top.innerHTML =
      '<div class="ixc-v"><span class="vl">Bias <i>V</i><small> (on P, N grounded)</small></span><input type="range" min="' + VMIN + '" max="' + VMAX + '" step="0.001" value="0" aria-label="bias voltage V"><b class="vv"></b></div>' +
      '<div class="ixc-grp"><button class="wig">∿ Wiggle dV</button><label>d<i>V</i> <input type="range" class="dv" min="5" max="100" step="1" value="20"><b class="dvv">20 mV</b></label></div>' +
      '<div class="ixc-grp ixc-pre" style="flex-basis:100%"><span style="font-size:12.5px;color:#6B6B6B">Course values:</span></div>';
    root.appendChild(top);
    var vs = top.querySelector('input[type=range]'), vv = top.querySelector('.vv');
    var bw = top.querySelector('.wig'), dvs = top.querySelector('.dv'), dvv = top.querySelector('.dvv');
    var pre = top.querySelector('.ixc-pre');
    PRESETS.forEach(function (p) {
      var b = document.createElement('button');
      b.innerHTML = p.l.replace('C_T', 'C<sub>T</sub>').replace('C_D', 'C<sub>D</sub>');
      b.addEventListener('click', function () { setV(p.v); });
      b._v = p.v; pre.appendChild(b);
    });
    var watch = document.createElement('div'); watch.className = 'ixc-watch'; root.appendChild(watch);
    var read = document.createElement('div'); read.className = 'ixc-read'; root.appendChild(read);
    var legend = document.createElement('div'); legend.className = 'ixc-legend';
    legend.innerHTML =
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.5" fill="#fff" stroke="' + COL.ho + '" stroke-width="1.8"/></svg>hole</span>' +
      '<span><svg width="14" height="14"><circle cx="7" cy="7" r="4.5" fill="' + COL.el + '"/></svg>electron</span>' +
      '<span><svg width="16" height="14"><rect x="2" y="2" width="11" height="11" fill="#fff" stroke="' + COL.accep + '" stroke-width="1.5"/><line x1="4.5" y1="7.5" x2="10.5" y2="7.5" stroke="' + COL.accep + '" stroke-width="1.6"/></svg>acceptor ion</span>' +
      '<span><svg width="16" height="14"><rect x="2" y="2" width="11" height="11" fill="#fff" stroke="' + COL.donor + '" stroke-width="1.5"/><path d="M4.5 7.5h6M7.5 4.5v6" stroke="' + COL.donor + '" stroke-width="1.6"/></svg>donor ion</span>' +
      '<span><svg width="22" height="14"><path d="M20 7H6" stroke="' + COL.fld + '" stroke-width="2"/><path d="M2 7l6-4v8z" fill="' + COL.fld + '"/></svg>field ℰ</span>' +
      '<span><svg width="18" height="14"><rect x="1" y="2" width="16" height="10" fill="' + COL.ho + '" fill-opacity="0.25"/></svg>stored minority charge</span>';
    root.appendChild(legend);
    var boxA = document.createElement('div'); boxA.className = 'ixc-box'; root.appendChild(boxA);
    var row = document.createElement('div'); row.className = 'ixc-row'; root.appendChild(row);
    var colB = document.createElement('div'); colB.className = 'ixc-col'; row.appendChild(colB);
    var colC = document.createElement('div'); colC.className = 'ixc-col'; row.appendChild(colC);
    var boxB = document.createElement('div'); boxB.className = 'ixc-box ixc-plot'; colB.appendChild(boxB);
    var boxC = document.createElement('div'); boxC.className = 'ixc-box ixc-plot'; colC.appendChild(boxC);
    // Handoff 4: regime buttons, Speed, and a synchronised copy of the V control under each panel
    var K = window.IX._kit, kctl = null;
    if (K) {
      kctl = K.controls({
        sliders: [{ key: 'V', label: '<i>V</i>', aria: 'Bias V (on P, N grounded)', min: VMIN, max: VMAX, step: 0.001, get: function () { return st.V; }, set: function (v) { setV(v); },
          fmt: function (v) { return (v > 0 ? '+' : '') + fmt(v, 3) + ' V'; } }],
        regimes: [
          { label: 'Forward', title: 'Forward bias V = +0.6 V: C_D (stored minority charge) dominates', apply: function () { setV(0.6); }, is: function () { return st.V === 0.6; } },
          { label: 'Equilibrium (0 V)', title: 'V = 0: C_T = 3.15 pF only, no stored charge', apply: function () { setV(0); }, is: function () { return st.V === 0; } },
          { label: 'Reverse', title: 'Reverse bias V = −2 V: the SCR widens, C_T falls, C_D = 0', apply: function () { setV(-2); }, is: function () { return st.V === -2; } }
        ],
        speed: { get: function () { return st.spd; }, set: function (v) { st.spd = v; } }
      });
      top.appendChild(kctl.strip({ top: true, sliders: false }));
      root.insertBefore(kctl.strip({ tag: '(a)' }), row);
      colB.appendChild(kctl.strip({ tag: '(b)' }));
      colC.appendChild(kctl.strip({ tag: '(c)' }));
    }
    var cap = document.createElement('div'); cap.className = 'ixc-cap'; root.appendChild(cap);

    vs.addEventListener('input', function () { setV(+vs.value); });
    bw.addEventListener('click', function () { st.wig = !st.wig; st.t = 0; sync(); });
    dvs.addEventListener('input', function () { st.dV = +dvs.value / 1000; dvv.textContent = dvs.value + ' mV'; draw(); });

    function setV(v) { st.V = clamp(Math.round(v * 1000) / 1000, VMIN, VMAX); vs.value = st.V; sync(); }
    function sync() {
      vv.textContent = (st.V > 0 ? '+' : '') + fmt(st.V, 3) + ' V';
      bw.classList.toggle('on', st.wig);
      Array.prototype.forEach.call(pre.querySelectorAll('button'), function (b) { b.classList.toggle('on', Math.abs(b._v - st.V) < 0.0006); });
      readouts(); draw();
      if (kctl) kctl.refresh();
    }

    // ---------- layout ----------
    var LA = {}, LB = {}, LC = {}, svgA, svgB, svgC, gA, gB, gC, pool = null;
    function layout() {
      var wA = Math.max(300, boxA.clientWidth || 760);
      LA.w = wA; LA.phone = wA < 560;
      LA.ML = LA.phone ? 10 : 18; LA.MR = LA.phone ? 10 : 18; LA.PW = wA - LA.ML - LA.MR;
      LA.top = 22; LA.BH = LA.phone ? 100 : 128; LA.by0 = LA.top + 22; LA.by1 = LA.by0 + LA.BH;
      LA.pTop = LA.by1 + 46; LA.pH = LA.phone ? 80 : 100; LA.h = LA.pTop + LA.pH + 40;
      LA.J = LA.ML + LA.PW * 0.30;
      LA.ppu = (LA.PW * 0.36) / 1.25 / 1e-4;  // px per cm in the SCR zone (W up to 1.19 um at -10 V)
      LA.rc = 4;                               // P part of the SCR drawn with N_A/N_D = 4 (exaggerated)
      LA.Lp = LA.PW * 0.11; LA.Ln = LA.PW * 0.065; // drawn diffusion lengths (compressed, not to scale)
      LA.sp = clamp(LA.PW / 40, 10, 22);
      svgA = mk(boxA, LA.w, LA.h, 'Junction cartoon: SCR ions and stored minority charge');
      gA = svgA.querySelectorAll('g')[1];
      var wB = Math.max(280, boxB.clientWidth || 450), wC = Math.max(240, boxC.clientWidth || 300);
      LB.w = wB; LB.ML = 52; LB.MR = 12; LB.top = 26; LB.h = LA.phone ? 250 : 290; LB.PH = LB.h - LB.top - 40; LB.PW = wB - LB.ML - LB.MR;
      LC.w = wC; LC.ML = 46; LC.MR = 12; LC.top = 26; LC.h = LB.h; LC.PH = LC.h - LC.top - 40; LC.PW = wC - LC.ML - LC.MR;
      svgB = mk(boxB, LB.w, LB.h, 'C_T and C_D versus V, log scale'); gB = svgB.querySelectorAll('g')[1];
      svgC = mk(boxC, LC.w, LC.h, '1/C_T squared versus V'); gC = svgC.querySelectorAll('g')[1];
      attachDrag(svgB, function (x) { return LB.inv(x); });
      attachDrag(svgC, function (x) { return LC.inv(x); });
      // particle pools (deterministic)
      var R = rng(7);
      pool = { maj: [], injH: [], injE: [] };
      for (var i = 0; i < 200; i++) pool.injH.push({ d: -Math.log(1 - R() * 0.995), y: R(), ph: R() * 6.28 });
      for (i = 0; i < 120; i++) pool.injE.push({ d: -Math.log(1 - R() * 0.995), y: R(), ph: R() * 6.28 });
      for (i = 0; i < 400; i++) pool.maj.push({ x: R(), y: R(), ph: R() * 6.28 });
      drawStaticB(); drawStaticC();
    }
    function mk(box, w, h, label) {
      box.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + label + '"><g class="st"></g><g></g></svg>';
      var s = box.firstChild; s._st = s.querySelector('.st'); return s;
    }
    function attachDrag(svg, inv) {
      var down = false;
      function at(e) {
        var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (svg.viewBox.baseVal.width / r.width);
        var v = inv(x); if (v !== null) setV(v);
      }
      svg.addEventListener('pointerdown', function (e) { down = true; at(e); });
      svg.addEventListener('pointermove', function (e) { if (down) at(e); });
      window.addEventListener('pointerup', function () { down = false; });
    }

    // ---------- plot (b): C_T and C_D, log C ----------
    var CMIN = 1e-13, CMAX = 1e-7, XBRK = 0.36; // piecewise V axis: [-10,0] -> [0,0.36], [0,0.75] -> [0.36,1]
    function bx(V) { var f = V <= 0 ? XBRK * (V - VMIN) / (0 - VMIN) : XBRK + (1 - XBRK) * V / VMAX; return LB.ML + f * LB.PW; }
    function by(C) { return LB.top + (Math.log10(CMAX) - Math.log10(clamp(C, CMIN, CMAX))) / (Math.log10(CMAX) - Math.log10(CMIN)) * LB.PH; }
    LB.inv = function (x) { var f = (x - LB.ML) / LB.PW; if (f < -0.05 || f > 1.05) return null; f = clamp(f, 0, 1); return f <= XBRK ? VMIN + f / XBRK * (0 - VMIN) : (f - XBRK) / (1 - XBRK) * VMAX; };
    function drawStaticB() {
      var s = '', y0 = LB.top, y1 = LB.top + LB.PH, x0 = LB.ML, x1 = LB.ML + LB.PW;
      s += txt(LB.ML - 44, 16, '(b) C' + sb('T') + ' and C' + sb('D') + ' versus V (log C)', { fs: 12.5, w: 600, fill: COL.navy });
      s += '<rect x="' + bx(VLI) + '" y="' + y0 + '" width="' + (x1 - bx(VLI)) + '" height="' + LB.PH + '" fill="#eef0f3"/>';
      s += '<rect x="' + bx(VD / 2) + '" y="' + y0 + '" width="' + (bx(VLI) - bx(VD / 2)) + '" height="' + LB.PH + '" fill="#f6f7f9"/>';
      var labs = ['0.1 pF', '1 pF', '10 pF', '100 pF', '1 nF', '10 nF', '100 nF'];
      for (var k = -13; k <= -7; k++) {
        var y = by(Math.pow(10, k));
        s += line(x0, y, x1, y, '#edf0f4', 1) + txt(x0 - 4, y + 3.5, labs[k + 13], { anchor: 'end', fs: 10, fill: COL.grey });
      }
      (LB.PW < 400 ? [-10, -5, 0, 0.2, 0.4, 0.6] : [-10, -8, -6, -4, -2, 0, 0.2, 0.4, 0.6]).forEach(function (v) {
        var x = bx(v); s += line(x, y1, x, y1 + 4, '#9aa6b5', 1) + txt(x, y1 + 15, v === 0 ? '0' : fmt(v, v % 1 ? 1 : 0), { anchor: 'middle', fs: 10, fill: COL.grey });
      });
      s += line(bx(0), y0, bx(0), y1, '#c4ccd6', 1, '2 3');
      s += txt(x1, y1 + 30, 'V (V); scale changes at 0', { anchor: 'end', fs: 10.5, fill: COL.grey });
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + LB.PW + '" height="' + LB.PH + '" fill="none" stroke="' + COL.border + '"/>';
      // curves
      var dT1 = '', dT2 = '', dD = '', i, v, first = true;
      for (i = 0; i <= 400; i++) {
        v = i <= 200 ? VMIN + (0 - VMIN) * i / 200 : VMAX * (i - 200) / 200;
        var c = CT(v), X = bx(v), Y = by(c);
        if (v <= VD / 2) dT1 += (dT1 ? 'L' : 'M') + X.toFixed(1) + ' ' + Y.toFixed(1);
        if (v >= VD / 2 - 1e-9) dT2 += (dT2 ? 'L' : 'M') + X.toFixed(1) + ' ' + Y.toFixed(1);
        var cd = CD(v);
        if (cd >= CMIN && cd <= CMAX) { dD += (first ? 'M' : 'L') + X.toFixed(1) + ' ' + by(cd).toFixed(1); first = false; }
      }
      s += '<g clip-path="url(#ixcclipb' + uid + ')">';
      s += '<path d="' + dT1 + '" fill="none" stroke="' + COL.ct + '" stroke-width="2.2"/>';
      s += '<path d="' + dT2 + '" fill="none" stroke="' + COL.ct + '" stroke-width="2.2" stroke-dasharray="5 3"/>';
      s += '<path d="' + dD + '" fill="none" stroke="' + COL.cd + '" stroke-width="2.4"/>';
      s += '</g>';
      s += '<defs><clipPath id="ixcclipb' + uid + '"><rect x="' + x0 + '" y="' + y0 + '" width="' + LB.PW + '" height="' + LB.PH + '"/></clipPath></defs>';
      // crossing
      var xc = bx(VX), yc = by(CT(VX));
      s += '<circle cx="' + xc.toFixed(1) + '" cy="' + yc.toFixed(1) + '" r="5" fill="#fff" stroke="' + COL.navy + '" stroke-width="1.6"/>';
      s += txt(xc - 8, yc - 9, 'C' + sb('T') + ' = C' + sb('D') + ': ' + fmt(VX, 2) + ' V, ' + fmt(CT(VX) * 1e12, 1) + ' pF', { anchor: 'end', fs: 10.5, fill: COL.navy });
      s += txt(bx(-9.6), by(CT(-9.6)) - 7, 'C' + sb('T'), { fs: 12, w: 700, fill: COL.ct });
      s += txt(bx(0.6) - 7, by(CD(0.6)) + 4, 'C' + sb('D'), { anchor: 'end', fs: 12, w: 700, fill: COL.cd });
      s += txt(bx(VD / 2) + 3, y0 + 12, 'C' + sb('T') + ' doubtful', { fs: 9.5, fill: COL.grey });
      svgB._st.innerHTML = s;
    }
    // ---------- plot (c): 1/C_T^2 ----------
    var CVMIN = -10, CVMAX = 1.2, YMAX = 1.45; // pF^-2
    function cx(V) { return LC.ML + (V - CVMIN) / (CVMAX - CVMIN) * LC.PW; }
    function cy(y) { return LC.top + (YMAX - y) / YMAX * LC.PH; }
    LC.inv = function (x) { var v = CVMIN + (x - LC.ML) / LC.PW * (CVMAX - CVMIN); if (v < VMIN - 0.5 || v > CVMAX) return null; return clamp(v, VMIN, VMAX); };
    function inv2(V) { var c = CT(V) * 1e12; return 1 / (c * c); }
    function drawStaticC() {
      var s = '', y0 = LC.top, y1 = LC.top + LC.PH, x0 = LC.ML, x1 = LC.ML + LC.PW;
      s += txt(LC.ML - 40, 16, '(c) 1/C' + sb('T') + '² (pF⁻²) versus V', { fs: 12.5, w: 600, fill: COL.navy });
      [0, 0.5, 1].forEach(function (v) { var y = cy(v); s += line(x0, y, x1, y, '#edf0f4', 1) + txt(x0 - 4, y + 3.5, String(v), { anchor: 'end', fs: 10, fill: COL.grey }); });
      [-10, -8, -6, -4, -2, 0].forEach(function (v) { var x = cx(v); s += line(x, y1, x, y1 + 4, '#9aa6b5', 1) + txt(x, y1 + 15, fmt(v, 0), { anchor: 'middle', fs: 10, fill: COL.grey }); });
      s += txt(x1, y1 + 30, 'V (V)', { anchor: 'end', fs: 10.5, fill: COL.grey });
      s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + LC.PW + '" height="' + LC.PH + '" fill="none" stroke="' + COL.border + '"/>';
      s += line(x0, cy(0), x1, cy(0), '#9aa6b5', 1);
      s += '<path d="M' + cx(-10).toFixed(1) + ' ' + cy(inv2(-10)).toFixed(1) + 'L' + cx(VD / 2).toFixed(1) + ' ' + cy(inv2(VD / 2)).toFixed(1) + '" stroke="' + COL.ct + '" stroke-width="2.2" fill="none"/>';
      s += '<path d="M' + cx(VD / 2).toFixed(1) + ' ' + cy(inv2(VD / 2)).toFixed(1) + 'L' + cx(VD).toFixed(1) + ' ' + cy(0).toFixed(1) + '" stroke="' + COL.ct + '" stroke-width="2.2" stroke-dasharray="5 3" fill="none"/>';
      s += '<circle cx="' + cx(VD).toFixed(1) + '" cy="' + cy(0).toFixed(1) + '" r="4.5" fill="#fff" stroke="' + COL.navy + '" stroke-width="1.8"/>';
      s += line(cx(VD), cy(0) - 5, cx(VD), cy(0.42), COL.navy, 0.8, '2 2');
      s += txt(cx(VD) + 4, cy(0.42) - 5, 'V' + sb('d') + ' = ' + fmt(VD, 3) + ' V', { anchor: 'end', fs: 10.5, w: 600, fill: COL.navy });
      var slope = 2 / (q * EPS * ND * S * S) * 1e-24;
      s += txt(x1 - 4, y0 + 14, 'slope −' + slope.toFixed(3) + ' pF⁻²/V', { anchor: 'end', fs: 10.5, fill: COL.grey });
      s += txt(x1 - 4, y0 + 28, '→ N' + sb('D') + ' = 10¹⁶ cm⁻³', { anchor: 'end', fs: 10.5, fill: COL.grey });
      svgC._st.innerHTML = s;
    }

    // ---------- dynamic drawing ----------
    function vInst() { return st.wig ? clamp(st.V + st.dV * Math.sin(st.t * 2 * Math.PI * 0.7), VMIN - 0.2, 0.8) : st.V; }
    function draw() {
      if (!gA) return;
      var v = vInst();
      gA.innerHTML = drawCartoon(v);
      gB.innerHTML = drawOpB(v);
      gC.innerHTML = drawOpC(v);
    }
    function drawOpB(v) {
      var s = '', V = st.V;
      var x = bx(V);
      s += line(x, LB.top, x, LB.top + LB.PH, COL.navy, 1, '3 3');
      if (st.wig) {
        var a = bx(clamp(V - st.dV, VMIN, 0.8)), b = bx(clamp(V + st.dV, VMIN, 0.8));
        s += '<rect x="' + Math.min(a, b).toFixed(1) + '" y="' + LB.top + '" width="' + Math.abs(b - a).toFixed(1) + '" height="' + LB.PH + '" fill="' + COL.acc + '" fill-opacity="0.12"/>';
      }
      var xv = bx(clamp(v, VMIN, VMAX));
      s += '<circle cx="' + xv.toFixed(1) + '" cy="' + by(CT(Math.min(v, 0.83))).toFixed(1) + '" r="5.5" fill="' + COL.ct + '" stroke="#fff" stroke-width="1.5"/>';
      var cd = CD(v);
      if (cd > CMIN) s += '<circle cx="' + xv.toFixed(1) + '" cy="' + by(cd).toFixed(1) + '" r="5.5" fill="' + COL.cd + '" stroke="#fff" stroke-width="1.5"/>';
      var lab = 'V = ' + (V > 0 ? '+' : '') + fmt(V, 3);
      var right = x > LB.ML + LB.PW * 0.6;
      s += txt(x + (right ? -5 : 5), LB.top + LB.PH - 6, lab, { anchor: right ? 'end' : 'start', fs: 10.5, w: 600, fill: COL.navy });
      return s;
    }
    function drawOpC(v) {
      var s = '', V = st.V;
      var vv2 = Math.min(V, VD - 1e-6);
      var x = cx(V), y = cy(V < VD ? inv2(V) : 0);
      s += line(x, LC.top, x, LC.top + LC.PH, COL.navy, 1, '3 3');
      var xv = cx(clamp(v, VMIN, VMAX)), yv = cy(clamp(v, VMIN, VMAX) < VD ? inv2(clamp(v, VMIN, VMAX)) : 0);
      s += '<circle cx="' + xv.toFixed(1) + '" cy="' + yv.toFixed(1) + '" r="5.5" fill="' + COL.ct + '" stroke="#fff" stroke-width="1.5"/>';
      var right = x > LC.ML + LC.PW * 0.55;
      s += txt(xv + (right ? -9 : 9), yv + (right ? -9 : -6), fmt(inv2(vv2), 3) + ' pF⁻²', { anchor: right ? 'end' : 'start', fs: 10.5, fill: COL.navy });
      return s;
    }

    function drawCartoon(v) {
      var s = '', A = LA, by0 = A.by0, by1 = A.by1, BH = A.BH;
      var xl = A.ML, xr = A.ML + A.PW;
      s += txt(xl, 15, A.phone ? '(a) The junction at V (cartoon)' : '(a) The junction at V: the two stores of charge that change with V (cartoon, x not to scale)', { fs: A.phone ? 11.5 : 12.5, w: 600, fill: COL.navy });
      // SCR geometry at V (DC) and instantaneous v
      var wn = Wn(Math.min(v, 0.83)) * A.ppu, wp = wn / A.rc;
      var wnDC = Wn(st.V) * A.ppu;
      var xN = A.J + wn, xP = A.J - wp;
      // magnification of the edge motion for visibility
      var dWpx = Math.abs(Wn(st.V - st.dV) - Wn(Math.min(st.V + st.dV, 0.83))) * A.ppu / 2;
      var M = 1;
      if (st.wig && dWpx < 4) { M = nice125(4 / Math.max(dWpx, 1e-3)); }
      if (M > 1) { wn = wnDC + (wn - wnDC) * M; wp = wn / A.rc; xN = A.J + wn; xP = A.J - wp; }
      var wnMin = wnDC + (Wn(Math.min(st.V + st.dV, 0.83)) * A.ppu - wnDC) * M, wnMax = wnDC + (Wn(st.V - st.dV) * A.ppu - wnDC) * M;
      // regions
      s += '<rect x="' + xl + '" y="' + by0 + '" width="' + (A.J - xl) + '" height="' + BH + '" fill="#fdf6ef" stroke="#c9b9a8"/>';
      s += '<rect x="' + A.J + '" y="' + by0 + '" width="' + (xr - A.J) + '" height="' + BH + '" fill="#f1f5fb" stroke="#a9b8cc"/>';
      s += '<rect x="' + xP.toFixed(1) + '" y="' + by0 + '" width="' + (xN - xP).toFixed(1) + '" height="' + BH + '" fill="' + COL.scr + '" stroke="#9aa6b5" stroke-dasharray="3 3"/>';
      if (st.wig) { // the slabs +-dQ swept by the edges
        s += '<rect x="' + (A.J + wnMin).toFixed(1) + '" y="' + by0 + '" width="' + Math.max(1, wnMax - wnMin).toFixed(1) + '" height="' + BH + '" fill="' + COL.donor + '" fill-opacity="0.22"/>';
        s += '<rect x="' + (A.J - wnMax / A.rc).toFixed(1) + '" y="' + by0 + '" width="' + Math.max(1, (wnMax - wnMin) / A.rc).toFixed(1) + '" height="' + BH + '" fill="' + COL.accep + '" fill-opacity="0.3"/>';
      }
      s += txt(xl + 3, by0 - 6, 'P⁺', { fs: 13, w: 700, fill: COL.ho });
      s += txt(xr - 3, by0 - 6, 'N', { anchor: 'end', fs: 13, w: 700, fill: COL.el });
      // ions
      var spN = A.sp, spP = A.sp / 2, i, x, y;
      var pd = '', ps = '', pdU = '', psU = '', ad = '', as = '', adU = '', asU = '';
      var aN = clamp(spN * 0.2, 2.2, 4.4), aP = clamp(spP * 0.24, 1.6, 3.6);
      var nr = Math.floor(BH / spN), off = (BH - nr * spN) / 2 + spN / 2;
      for (x = A.J + spN / 2; x < xr - 2; x += spN) for (i = 0; i < nr; i++) {
        y = by0 + off + i * spN; var u = x < xN;
        var pl = 'M' + (x - aN * 0.6).toFixed(1) + ' ' + y.toFixed(1) + 'h' + (aN * 1.2).toFixed(1) + 'M' + x.toFixed(1) + ' ' + (y - aN * 0.6).toFixed(1) + 'v' + (aN * 1.2).toFixed(1);
        if (u) { pdU += sq(x, y, aN); psU += pl; } else { pd += sq(x, y, aN); ps += pl; }
      }
      var nrp = Math.floor(BH / spP), offp = (BH - nrp * spP) / 2 + spP / 2;
      for (x = A.J - spP / 2; x > xl + 2; x -= spP) for (i = 0; i < nrp; i++) {
        y = by0 + offp + i * spP; var u2 = x > xP;
        var mi = 'M' + (x - aP * 0.6).toFixed(1) + ' ' + y.toFixed(1) + 'h' + (aP * 1.2).toFixed(1);
        if (u2) { adU += sq(x, y, aP); asU += mi; } else { ad += sq(x, y, aP); as += mi; }
      }
      s += '<path d="' + pd + '" fill="#fff" stroke="' + COL.donor + '" stroke-opacity="0.35"/><path d="' + ps + '" stroke="' + COL.donor + '" stroke-opacity="0.4" stroke-width="1.2"/>';
      s += '<path d="' + ad + '" fill="#fff" stroke="' + COL.accep + '" stroke-opacity="0.3"/><path d="' + as + '" stroke="' + COL.accep + '" stroke-opacity="0.35" stroke-width="1"/>';
      s += '<path d="' + pdU + '" fill="#fbe7d3" stroke="' + COL.donor + '" stroke-width="1.4"/><path d="' + psU + '" stroke="' + COL.donor + '" stroke-width="1.6"/>';
      s += '<path d="' + adU + '" fill="#dfe5ee" stroke="' + COL.accep + '" stroke-width="1.2"/><path d="' + asU + '" stroke="' + COL.accep + '" stroke-width="1.4"/>';
      // majority carriers (faint), jittering
      var t = st.tc, eM = '', hM = '', k;
      var rE = clamp(spN * 0.17, 2, 3.6), rH = clamp(spP * 0.3, 1.8, 3.2);
      var nE = A.phone ? 40 : 70, nH = A.phone ? 70 : 130;
      for (k = 0; k < nE; k++) { var p = pool.maj[k]; var X = xN + 4 + p.x * (xr - xN - 8); if (X > xr - 3) continue; eM += circ(X + 1.5 * Math.sin(t * 3 + p.ph), by0 + 4 + p.y * (BH - 8) + 1.5 * Math.cos(t * 2.6 + p.ph), rE); }
      for (k = 0; k < nH; k++) { var p2 = pool.maj[200 + k]; var X2 = xl + 4 + p2.x * (xP - xl - 8); hM += circ(X2 + 1.2 * Math.sin(t * 3 + p2.ph), by0 + 4 + p2.y * (BH - 8) + 1.2 * Math.cos(t * 2.4 + p2.ph), rH); }
      s += '<path d="' + eM + '" fill="' + COL.el + '" fill-opacity="0.45"/>';
      s += '<path d="' + hM + '" fill="#fff" stroke="' + COL.ho + '" stroke-opacity="0.45" stroke-width="1.2"/>';
      // injected minority carriers: count proportional to the stored charge (auto-scaled to the DC operating point)
      var ex = Math.exp(v / VT) - 1, exDC = Math.exp(st.V / VT) - 1;
      var fr = exDC > 0.5 ? clamp(ex / exDC, 0, 3) : 0;
      var nInjH = Math.round((A.phone ? 26 : 46) * fr), nInjE = Math.round((A.phone ? 8 : 14) * fr);
      var ih = '', ie = '';
      for (k = 0; k < Math.min(nInjH, pool.injH.length); k++) { var q1 = pool.injH[k]; var X3 = xN + 3 + q1.d * A.Lp; if (X3 > xr - 3) continue; ih += circ(X3 + 1.5 * Math.sin(t * 3.3 + q1.ph), by0 + 4 + q1.y * (BH - 8), clamp(spN * 0.2, 2.2, 4)); }
      for (k = 0; k < Math.min(nInjE, pool.injE.length); k++) { var q2 = pool.injE[k]; var X4 = xP - 3 - q2.d * A.Ln; if (X4 < xl + 3) continue; ie += circ(X4 + 1.2 * Math.sin(t * 3 + q2.ph), by0 + 4 + q2.y * (BH - 8), clamp(spN * 0.16, 2, 3.4)); }
      s += '<path d="' + ih + '" fill="#fff" stroke="' + COL.ho + '" stroke-width="2"/>';
      s += '<path d="' + ie + '" fill="' + COL.el + '"/>';
      // field arrow and W bracket
      var Erel = Math.sqrt(Math.max(VD - v, 0) / (VD + 10));
      if (xN - xP > 14) {
        var ya = by0 - 8;
        s += '<g opacity="0.9">' + line(xN, ya, xP + 8, ya, COL.fld, 1 + 2 * Erel) + '<path d="M' + xP.toFixed(1) + ' ' + ya + 'l8 -4.5v9z" fill="' + COL.fld + '"/></g>';
        s += txt(xN + 4, ya + 4, 'ℰ', { fs: 12, w: 700, fill: COL.fld });
      }
      var yb = by1 + 13;
      s += line(xP, by1 + 3, xP, yb + 3, '#7d8896', 1) + line(xN, by1 + 3, xN, yb + 3, '#7d8896', 1) + line(xP, yb, xN, yb, '#7d8896', 1);
      var wlab = 'W = ' + fmt(Wof(st.V) * 1e4, 3) + ' µm';
      s += txt((xP + xN) / 2, yb + 11, wlab + (A.phone ? '' : '  →  C' + sb('T') + ' = εS/W'), { anchor: 'middle', fs: 10.5, fill: COL.text });
      if (st.wig) {
        s += txt(A.J + wnMax + 3, by0 + 12, '+dQ', { fs: 11, w: 700, fill: '#9a4f0c' });
        s += txt(A.J - wnMax / A.rc - 3, by0 + 12, '−dQ', { anchor: 'end', fs: 11, w: 700, fill: COL.accep });
        if (M > 1) s += txt(A.J + wnMax + 3, by1 - 5, 'edge motion ×' + M, { fs: 9.5, fill: COL.grey });
      }
      // ---- profile strip: stored minority charge ----
      var pT = A.pTop, pH = A.pH, base = pT + pH;
      s += txt(xl, pT - 6, A.phone ? 'Stored minority charge (excess, linear)' : 'Stored minority charge: excess densities Δn(x) in P (×100) and Δp(x) in N, linear, auto-scaled', { fs: A.phone ? 10.5 : 11.5, w: 600, fill: COL.navy });
      s += line(xl, base, xr, base, '#9aa6b5', 1);
      s += '<rect x="' + xP.toFixed(1) + '" y="' + pT + '" width="' + (xN - xP).toFixed(1) + '" height="' + pH + '" fill="' + COL.scr + '"/>';
      var dpDC = PN0 * exDC, dp = PN0 * ex;
      if (exDC > 0.5) {
        var full = nice125(dpDC * 1.45), hs = (pH - 8) / full;
        var prof = function (amp, x0, L, dir) { // path of amp*exp(-d/L)
          var d = 'M' + x0.toFixed(1) + ' ' + base, n = 60;
          for (var j = 0; j <= n; j++) { var dd = j / n * 4.5 * L, xx = x0 + dir * dd; if (xx > xr || xx < xl) break; d += 'L' + xx.toFixed(1) + ' ' + (base - Math.min(amp * Math.exp(-dd / L) * hs, pH + 6)).toFixed(1); }
          return d + 'L' + (x0 + dir * Math.min(4.5 * L, dir > 0 ? xr - x0 : x0 - xl)).toFixed(1) + ' ' + base + 'Z';
        };
        s += '<g clip-path="url(#ixcclipa' + uid + ')">';
        // DC outline and the swing
        if (st.wig) {
          var dpHi = PN0 * (Math.exp((st.V + st.dV) / VT) - 1), dpLo = PN0 * (Math.exp((st.V - st.dV) / VT) - 1);
          s += '<path d="' + prof(dpHi, xN, A.Lp, 1) + '" fill="' + COL.ho + '" fill-opacity="0.12" stroke="none"/>';
          s += '<path d="' + prof(dpHi * 100 * NP0 / PN0, xP, A.Ln, -1) + '" fill="' + COL.el + '" fill-opacity="0.10" stroke="none"/>';
          s += '<path d="' + prof(dpLo, xN, A.Lp, 1) + '" fill="#fff" fill-opacity="0.6" stroke="none"/>';
        }
        s += '<path d="' + prof(dp, xN, A.Lp, 1) + '" fill="' + COL.ho + '" fill-opacity="0.28" stroke="' + COL.ho + '" stroke-width="2"/>';
        s += '<path d="' + prof(dp * 100 * NP0 / PN0, xP, A.Ln, -1) + '" fill="' + COL.el + '" fill-opacity="0.22" stroke="' + COL.el + '" stroke-width="2"/>';
        s += '<path d="' + prof(dpDC, xN, A.Lp, 1) + '" fill="none" stroke="' + COL.ho + '" stroke-width="1" stroke-dasharray="3 3"/>';
        s += '</g><defs><clipPath id="ixcclipa' + uid + '"><rect x="' + xl + '" y="' + (pT - 4) + '" width="' + A.PW + '" height="' + (pH + 4) + '"/></clipPath></defs>';
        // labels
        s += txt(xN + A.Lp * 0.5 + 6, base - Math.min(dp * Math.exp(-0.5) * hs, pH) - 4, 'Q' + sb('p') + ' = ' + eng(Qp(v), 'C', 2), { fs: 10.5, w: 600, fill: '#9a4f0c' }).replace('<text ', '<text paint-order="stroke" stroke="#fff" stroke-width="3" ');
        s += txt(xP - 6, pT + 10, 'Q' + sb('n') + ' = ' + eng(Qn(v), 'C', 2), { anchor: 'end', fs: 10.5, fill: COL.el });
        s += txt(xr - 2, pT + 10, 'full scale ' + expo(full, 0) + ' cm⁻³', { anchor: 'end', fs: 9.5, fill: COL.grey });
        // L markers
        s += line(xN + A.Lp, base, xN + A.Lp, base + 5, '#7d8896', 1) + txt(xN + A.Lp, base + 15, 'L' + sb('p') + ' = 110 µm', { anchor: 'middle', fs: 9.5, fill: COL.grey });
        s += line(xP - A.Ln, base, xP - A.Ln, base + 5, '#7d8896', 1) + txt(xP - A.Ln, base + 15, 'L' + sb('n') + ' = 18.7 µm', { anchor: 'middle', fs: 9.5, fill: COL.grey });
      } else {
        s += txt((xl + xr) / 2, base - pH / 2 + 4, st.V < 0 ? 'Reverse bias: no stored charge (the edges are emptied: deficit −qSL' + sb('p') + 'p' + sb('n0') + ' ≈ ' + eng(Qp(st.V), 'C', 2) + ')' : 'No stored charge at V ≈ 0 (Q ∝ e' + '<tspan baseline-shift="super" font-size="72%">qV/kT</tspan>' + ' − 1)', { anchor: 'middle', fs: A.phone ? 10 : 11.5, fill: COL.grey });
      }
      s += txt(xr, base + 30, A.phone ? 'SCR (µm) and L (compressed): not to scale' : 'x not to scale: the SCR is drawn in µm, the neutral regions compressed (Lₙ, Lₚ: tens of µm)', { anchor: 'end', fs: 9.5, fill: COL.grey });
      return s;
    }

    // ---------- readouts ----------
    function readouts() {
      var V = st.V, W = Wof(V), ct = CT(V), ctp = CTplate(V), I = Iof(V), cd = CD(V), Q = TAUB * I;
      var ratio = cd / ct, dom;
      if (ratio < 0.01) dom = 'C<sub>T</sub> alone';
      else if (ratio < 1) dom = 'C<sub>T</sub> (C<sub>D</sub>/C<sub>T</sub> = ' + ratio.toPrecision(2) + ')';
      else dom = 'C<sub>D</sub> ×' + (ratio < 100 ? ratio.toPrecision(2) : Math.round(ratio)) + '';
      var cdTxt = cd < 1e-15 ? expo(cd, 1) + ' F' : eng(cd, 'F', 3);
      var iTxt = Math.abs(I) < 1e-12 ? (V === 0 ? '0' : mn(I.toExponential(2)) + ' A') : eng(I, 'A', 3);
      read.innerHTML =
        ro('W (µm)', fmt(W * 1e4, 3), 'eq 7.3') +
        ro('C<sub>T</sub> (pF)', fmt(ct * 1e12, 2), 'εS/W = ' + fmt(ctp * 1e12, 2), ratio < 1) +
        ro('current I', iTxt, 'I<sub>0</sub> = ' + expo(I0, 2) + ' A') +
        ro('stored Q = τ̄I', Math.abs(Q) < 1e-15 ? '≈ 0' : eng(Q, 'C', 2), 'τ̄ = ' + (TAUB * 1e6).toFixed(2) + ' µs') +
        ro('C<sub>D</sub>', cdTxt, cd < 1e-15 ? 'negligible' : '(q/kT)τ̄I', ratio >= 1) +
        ro('dominant', dom, st.wig ? 'dQ<sub>T</sub> ' + eng(ct * st.dV, 'C', 2) + ', dQ<sub>D</sub> ' + (cd * st.dV < 1e-18 ? '≈ 0' : eng(cd * st.dV, 'C', 2)) : 'r<sub>d</sub> = ' + (I > 1e-15 ? eng(VT / I, 'Ω', 3) : '∞'));
      var w;
      if (V < -0.3) w = '<b>Reverse bias:</b> the SCR widens, the plates move apart: C<sub>T</sub> = εS/W falls as (V<sub>d</sub>−V)<sup>−1/2</sup>. No stored charge; with the wiggle only the SCR edges breathe (±dQ slabs, a distance W apart).';
      else if (V < 0.25) w = '<b>Around V = 0:</b> C<sub>T</sub> = ' + fmt(ct * 1e12, 2) + ' pF is the only capacitance; C<sub>D</sub> = (q/kT)τ̄(I + I<sub>0</sub>) is utterly negligible. On (c), the point sits on the straight line that reaches zero at V<sub>d</sub>.';
      else if (V < VX - 0.008) w = '<b>Forward bias, small current:</b> minority carriers are injected and stored over L<sub>p</sub>, L<sub>n</sub>; C<sub>D</sub> ∝ I grows ×10 every 60 mV but is still below C<sub>T</sub>.';
      else if (V <= VX + 0.008) w = '<b>The crossing:</b> C<sub>T</sub> = C<sub>D</sub> ≈ ' + fmt(CT(VX) * 1e12, 1) + ' pF at ' + fmt(VX, 2) + ' V, with only I ≈ ' + eng(Iof(VX), 'A', 2) + '.';
      else if (V <= VLI) w = '<b>C<sub>D</sub> dominates:</b> nanofarads against picofarads. The holes stored in the N side (τ<sub>p</sub> = 10 µs, 85 % of the current) hold almost all the charge; the electrons in P hold ' + (100 * Qn(V) / (Qn(V) + Qp(V))).toFixed(2) + ' %.';
      else w = '<b>Beyond about 0.72 V</b> low injection fails (Ch6): the model, and these numbers, leave their range of validity.';
      watch.innerHTML = '<b>What to watch —</b> ' + w;
    }
    function ro(lab, val, sub, hl) { return '<div' + (hl ? ' class="hl"' : '') + '><span>' + lab + '</span><strong>' + val + '</strong>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; }

    cap.innerHTML = 'Reference long diode of Ch6–7: Si P<sup>+</sup>N, N<sub>A</sub> = 10<sup>18</sup>, N<sub>D</sub> = 10<sup>16</sup> cm<sup>−3</sup>, S = 10<sup>−4</sup> cm², V<sub>d</sub> = 0.835 V, ε = 11.7ε<sub>0</sub>, ' +
      'D<sub>p</sub> = 12, D<sub>n</sub> = 35 cm²/s, τ<sub>p</sub> = 10 µs, τ<sub>n</sub> = 0.1 µs, kT/q = 25.9 mV. ' +
      'W from eq 7.3; C<sub>T</sub> from eq 7.6 (one-sided, C<sub>T0</sub> = 3.15 pF; the plate formula εS/W, eq 7.5, is shown below it); 1/C<sub>T</sub>² from eq 7.7; ' +
      'I = SJ<sub>0</sub>(e<sup>qV/kT</sup> − 1) with J<sub>0</sub> from eq 6.10; Q<sub>p</sub> from eq 7.10; C<sub>D</sub> = (q/kT)τ̄(I + I<sub>0</sub>), eqs 7.13–7.14, τ̄ = 8.56 µs (eq 7.12). ' +
      'Dashed C<sub>T</sub>: above V<sub>d</sub>/2 the depletion approximation is doubtful; grey band: beyond 0.72 V low injection fails. Cartoon (a): ion and carrier numbers are not to scale, the P part of the SCR is drawn with N<sub>A</sub>/N<sub>D</sub> = 4 instead of 100, the edge motion may be magnified (label), and the electron store in P is drawn ×100 (Q<sub>n</sub> is 0.17 % of Q<sub>p</sub>). Click or drag on plots (b) and (c) to set V.';

    // ---------- loop ----------
    var alive = true;
    function loop(ts) {
      if (!alive) return;
      if (!root.isConnected) { alive = false; return; }
      var dt = st.last ? Math.min(0.05, (ts - st.last) / 1000) : 0; st.last = ts;
      st.tc += dt * CARRIER * st.spd;
      if (st.wig || true) { st.t += dt; draw(); }
      requestAnimationFrame(loop);
    }
    var uid = Math.random().toString(36).slice(2, 8);
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (!root.isConnected) return; if (Math.abs((boxA.clientWidth || 0) - LA.w) > 4 || Math.abs((boxB.clientWidth || 0) - LB.w) > 4) { layout(); draw(); } }, 160);
    });
    layout(); sync();
    requestAnimationFrame(loop);
    root._ixState = { st: st, setV: setV, draw: draw };
  }

  window.IX = window.IX || {};
  window.IX[ID] = mount;
})();
