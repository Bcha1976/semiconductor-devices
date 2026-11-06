/* Interactive "early": the Early effect, the moving zero and the common -V_A.
   Semiconductor Devices Physics, Chapter 8 Part E (Dr Bassem CHAABANE, ENISO).
   Physics: BC SCR by the depletion approximation (Ch5-6), base side N_C/(N_B+N_C);
   W_B(V_CB) = W_met - x_EB - x_BC(V_CB) (1.427 um, W_B = 1.0 um at 5 V);
   I_C from Ebers-Moll eq.(EMC) with I_S = qSD_n n_i^2/(N_B W_B) eq.(IC);
   delta = |dW_B/dV_CB|, V_A = W_B0/delta at the reference point (1.0 um, 22.8 nm/V) eq.(ruler),(factor);
   panel (b) and I_C use the course factorization I_C = I_C0(V_BE)(1 + V_CE/V_A) eq.(factor),(early), r_o = V_A/I_C. */
(function () {
  'use strict';
  var ID = 'early';
  var q = 1.602e-19, VT = 0.0259, ni = 1e10, EPS = 11.7 * 8.854e-14;
  var NE = 1e18, NB = 1e16, NC = 1e15, Dn = 35, Dp = 12, TAUN = 1e-7, S = 1e-4;
  var dE = 0.5e-4, dC = 10e-4, VdE = 0.835, VdC = 0.656;
  var nB0 = ni * ni / NB;
  var WB_REF = 1e-4;
  var IS0 = q * S * Dn * ni * ni / (NB * WB_REF);
  var IpE0 = q * S * Dp * ni * ni / (NE * dE), IpC0 = q * S * Dp * ni * ni / (NC * dC);
  var TAUB = WB_REF * WB_REF / (2 * Dn), IrF = IS0 * TAUB / TAUN;
  var ISbF = IpE0 + IrF, ISbR = IpC0 + IrF, BF = IS0 / ISbF;
  function Wscr(Vd, V, N1, N2) { return Math.sqrt(2 * EPS * Math.max(Vd - V, 1e-3) / q * (1 / N1 + 1 / N2)); }
  var XBE = Wscr(VdE, 0.611, NE, NB) * NE / (NE + NB);
  function xBC(vcb) { return Wscr(VdC, -vcb, NB, NC) * NC / (NB + NC); }
  var WMET = WB_REF + XBE + xBC(5);
  function model(vbe, vcb) {
    var xb = xBC(vcb), WB = WMET - XBE - xb, IS = IS0 * WB_REF / WB;
    var ea = Math.exp(vbe / VT), eb = Math.exp(-vcb / VT);
    var IC = IS * (ea - eb) - ISbR * (eb - 1);
    var IB = ISbF * (ea - 1) + ISbR * (eb - 1);
    var delta = xb / (2 * Math.max(VdC + vcb, 1e-3));      /* d x_BC / dV_CB, x_BC ∝ sqrt(V_dC + V_CB) */
    /* factorized model, eq.(factor)/(early): electron term I_C0(V_BE)(1 + V_CE/V_A), anchored at the
       chapter's operating point (V_CB = 5 V, V_CE = 5.611 V, W_B = 1 um); BC-forward terms of eq.(EMC) kept for saturation */
    var vce = vcb + vbe, ISf = IS0 * (1 + vce / VA0) / (1 + VCE_REF / VA0);
    var ICf = ISf * (ea - eb) - ISbR * (eb - 1);
    return { xb: xb, WB: WB, IC: ICf, ICdep: IC, IB: IB, n0: nB0 * ea, nW: nB0 * eb, delta: delta, VA: VA0, IC0: IS0 * ea / (1 + VCE_REF / VA0) };
  }
  var DELTA0 = xBC(5) / (2 * (VdC + 5)), VA0 = WB_REF / DELTA0, VCE_REF = 5.611;
  /* ---------------- helpers ---------------- */
  var C = { ink: '#1d2430', grey: '#6B6B6B', navy: '#1F3A5F', acc: '#D9771A', line: '#dde3ea',
    el: '#1F4E9A', ho: '#C8641E', fld: '#2E7D4F', faint: '#9aa7b6' };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var RE = /\*([^*]+)\*|([A-Za-zαβδℰ])_\{([^}]*)\}|([A-Za-zαβδℰ])_([A-Za-z0-9])|\^\{([^}]*)\}/g;
  function ml(s) {      /* tiny math markup -> SVG tspans */
    var out = '', last = 0, m; RE.lastIndex = 0;
    var str = String(s);
    while ((m = RE.exec(str))) {
      out += esc(str.slice(last, m.index));
      if (m[1]) out += '<tspan font-style="italic">' + esc(m[1]) + '</tspan>';
      else if (m[2]) out += '<tspan font-style="italic">' + esc(m[2]) + '</tspan><tspan baseline-shift="sub" font-size="72%">' + esc(m[3]) + '</tspan>';
      else if (m[4]) out += '<tspan font-style="italic">' + esc(m[4]) + '</tspan><tspan baseline-shift="sub" font-size="72%">' + esc(m[5]) + '</tspan>';
      else out += '<tspan baseline-shift="super" font-size="72%">' + mlFlat(m[6]) + '</tspan>';
      last = RE.lastIndex; RE.lastIndex = last;
    }
    return out + esc(str.slice(last));
  }
  function mlFlat(s) {  /* inside superscripts: italics only, subscripts as smaller text */
    return esc(s).replace(/([A-Za-z])_([A-Za-z0-9]+)/g, '<tspan font-style="italic">$1</tspan><tspan font-size="80%">$2</tspan>');
  }
  function mh(s) {      /* same markup -> HTML */
    var out = '', last = 0, m, str = String(s); RE.lastIndex = 0;
    while ((m = RE.exec(str))) {
      out += esc(str.slice(last, m.index));
      if (m[1]) out += '<i>' + esc(m[1]) + '</i>';
      else if (m[2]) out += '<i>' + esc(m[2]) + '</i><sub>' + esc(m[3]) + '</sub>';
      else if (m[4]) out += '<i>' + esc(m[4]) + '</i><sub>' + esc(m[5]) + '</sub>';
      else out += '<sup>' + esc(m[6]).replace(/([A-Za-z])_([A-Za-z0-9]+)/g, '<i>$1</i><sub>$2</sub>') + '</sup>';
      last = RE.lastIndex; RE.lastIndex = last;
    }
    return out + esc(str.slice(last));
  }
  function T(x, y, s, a) {
    a = a || {};
    var at = ' x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"';
    at += ' font-size="' + (a.fs || 12) + '"';
    if (a.anchor) at += ' text-anchor="' + a.anchor + '"';
    at += ' fill="' + (a.fill || C.ink) + '"';
    if (a.fw) at += ' font-weight="' + a.fw + '"';
    if (a.rot) at += ' transform="rotate(' + a.rot + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"';
    if (a.halo) at += ' stroke="#fff" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round"';
    return '<text' + at + '>' + ml(s) + '</text>';
  }
  function L(x1, y1, x2, y2, st, w, extra) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
      '" stroke="' + st + '" stroke-width="' + (w || 1) + '"' + (extra || '') + '/>';
  }
  function R(x, y, w, h, fill, extra) {
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function P(pts, st, w, extra) {
    if (!pts.length) return '';
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L');
    return '<path d="' + d + '" fill="none" stroke="' + st + '" stroke-width="' + (w || 1.5) + '" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  function arrowHead(x, y, ang, col, s) {
    s = s || 7;
    var a1 = ang + 2.6, a2 = ang - 2.6;
    return '<path d="M' + x.toFixed(1) + ',' + y.toFixed(1) + 'L' + (x + s * Math.cos(a1)).toFixed(1) + ',' + (y + s * Math.sin(a1)).toFixed(1) +
      'L' + (x + s * Math.cos(a2)).toFixed(1) + ',' + (y + s * Math.sin(a2)).toFixed(1) + 'Z" fill="' + col + '"/>';
  }
  function arrow(x1, y1, x2, y2, col, w, s) {
    return L(x1, y1, x2, y2, col, w || 1.4) + arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), col, s);
  }
  function nice(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }
  function ticks(a, b, n) {
    var st = nice(b - a, n), t = [], v = Math.ceil(a / st - 1e-9) * st;
    for (; v <= b + 1e-9 * st; v += st) t.push(Math.abs(v) < st * 1e-6 ? 0 : v);
    return t;
  }
  function fmtTick(v) { var s = Math.abs(v) >= 10 || v === Math.round(v) ? String(Math.round(v * 100) / 100) : String(+v.toPrecision(3)); return s.replace('-', '−'); }
  function fmtI(I, sig) {
    sig = sig || 3;
    var a = Math.abs(I), u, k;
    if (a >= 1e-3 * 0.9995) { u = 'mA'; k = 1e3; } else if (a >= 1e-6 * 0.9995) { u = 'µA'; k = 1e6; }
    else if (a >= 1e-9) { u = 'nA'; k = 1e9; } else { u = 'pA'; k = 1e12; }
    var v = I * k, s = Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(sig - 2) : v.toFixed(sig - 1);
    return s.replace('-', '−') + ' ' + u;
  }
  function sciParts(v, d) {
    if (v === 0) return ['0', 0];
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (+m.toFixed(d) >= 10) { m /= 10; e += 1; }
    return [m.toFixed(d), e];
  }
  function sciH(v, d) { var p = sciParts(v, d === undefined ? 2 : d); return p[0] + '×10<sup>' + p[1] + '</sup>'; }
  function sciS(v, d) { var p = sciParts(v, d === undefined ? 2 : d); return p[0] + '×10^{' + p[1] + '}'; }
  function fV(v, d) { return v.toFixed(d === undefined ? 3 : d).replace('-', '−'); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------- CSS ---------------- */
  function injectCSS() {
    if (document.getElementById('ix-' + ID + '-css')) return;
    var s = document.createElement('style');
    s.id = 'ix-' + ID + '-css';
    s.textContent = [
      '.ix-early{font-family:var(--sans,"DejaVu Sans",system-ui,sans-serif);color:#1d2430;font-size:14px;line-height:1.4;background:#fff}',
      '.ix-early *{box-sizing:border-box}',
      '.ix-early .h{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin:0 0 10px}',
      '.ix-early .h b{font-size:16px;color:#1F3A5F}',
      '.ix-early .h span{color:#6B6B6B;font-size:13px}',
      '.ix-early .ctl{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;border:1px solid #dde3ea;border-radius:6px;padding:10px 14px;background:#fafbfc;margin-bottom:12px}',
      '.ix-early .sl{display:flex;flex-direction:column;gap:2px;min-width:230px;flex:1 1 260px}',
      '.ix-early .sl label{display:flex;justify-content:space-between;font-size:13px}',
      '.ix-early .sl label output{font-weight:700;color:#1F3A5F;font-variant-numeric:tabular-nums}',
      '.ix-early input[type=range]{width:100%;accent-color:#D9771A;margin:4px 0}',
      '.ix-early .btns{display:flex;flex-wrap:wrap;gap:6px}',
      '.ix-early button{font:inherit;font-size:13px;border:1px solid #c5cfdb;background:#fff;color:#1F3A5F;border-radius:5px;padding:5px 11px;cursor:pointer}',
      '.ix-early button:hover{border-color:#1F3A5F}',
      '.ix-early button.play{background:#D9771A;color:#fff;border-color:#D9771A;font-weight:700}',
      '.ix-early .grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}',
      '.ix-early.wide .grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}',
      '.ix-early .pan{border:1px solid #dde3ea;border-radius:6px;padding:8px 8px 4px;background:#fff;min-width:0}',
      '.ix-early .pt{font-size:13px;font-weight:700;color:#1F3A5F;margin:0 4px 2px}',
      '.ix-early .pt span{font-weight:400;color:#6B6B6B}',
      '.ix-early svg{display:block;width:100%;height:auto;overflow:visible}',
      '.ix-early .ro{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:12px}',
      '.ix-early .ro div{border:1px solid #dde3ea;border-radius:6px;padding:6px 9px;background:#fafbfc}',
      '.ix-early .ro small{display:block;color:#6B6B6B;font-size:12px}',
      '.ix-early .ro b{font-size:14.5px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}',
      '.ix-early .ro .k b{color:#1F3A5F}',
      '.ix-early .hint{margin-top:10px;border-left:4px solid #D9771A;background:#FDF3E7;padding:8px 12px;border-radius:0 6px 6px 0;font-size:14px;min-height:2.6em}',
      '.ix-early .hint b{color:#D9771A}',
      '.ix-early .cap{margin-top:8px;color:#6B6B6B;font-size:12.5px}',
      '.ix-early .leg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:#6B6B6B;margin:2px 4px 4px}',
      '.ix-early .leg svg{display:inline-block;width:auto;height:12px;vertical-align:-1px;margin-right:4px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* halton points for the electrons drawn in the triangle */
  function halton(i, b) { var f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }
  var HP = [];
  (function () { for (var i = 1; HP.length < 70 && i < 2000; i++) { var u = halton(i, 2), v = halton(i, 3); if (v < (1 - u) * 0.96 && u > 0.01) HP.push([u, v]); } })();

  /* ---------------- mount ---------------- */
  function mount(root) {
    injectCSS();
    root.innerHTML = '';
    root.classList.add('ix-early');
    var uid = 'ixearly' + Math.floor(Math.random() * 1e9);
    var DEF = { vce: 5.611, vbe: 0.611 };
    var st = { vce: DEF.vce, vbe: DEF.vbe, sweeping: false, sweepT: 0, lastCtl: '', lastT: 0 };
    var disp = { vce: st.vce, vbe: st.vbe, yA: 0, yB: 0 };

    root.innerHTML =
      '<div class="h"><b>The Early effect: the moving zero and the common −' + mh('V_A') + '</b>' +
      '<span>Ch8 Part E · base-width modulation · reference transistor</span></div>' +
      '<div class="ctl">' +
      '<div class="sl"><label><span>' + mh('V_{CE}') + ' (' + mh('V_{CB}') + ' = ' + mh('V_{CE}') + ' − ' + mh('V_{BE}') + ')</span><output data-o="vce"></output></label>' +
      '<input type="range" data-s="vce" min="0" max="20" step="0.01"></div>' +
      '<div class="sl"><label><span>' + mh('V_{BE}') + '</span><output data-o="vbe"></output></label>' +
      '<input type="range" data-s="vbe" min="-0.30" max="0.67" step="0.001"></div>' +
      '<div class="btns"><button class="play" data-b="play"></button><button data-b="reset">Reset</button></div>' +
      '</div>' +
      '<div class="grid">' +
      '<div class="pan"><div class="pt">(a) The base and its ruler <span>· x to scale (µm), electrons ' + mh('n') + '(' + mh('x') + ') linear</span></div>' +
      '<div class="leg"></div><svg data-p="a"></svg></div>' +
      '<div class="pan"><div class="pt">(b) ' + mh('I_C') + ' against ' + mh('V_{CE}') + ' <span>· plateaus extended to the common −' + mh('V_A') + '</span></div><svg data-p="b"></svg></div>' +
      '</div>' +
      '<div class="ro"></div><div class="hint"></div>' +
      '<div class="cap">Depletion approximation for the BC SCR (' + mh('N_B') + ' = 10<sup>16</sup>, ' + mh('N_C') + ' = 10<sup>15</sup> cm<sup>−3</sup>, ' + mh('V_{dC}') + ' = 0.656 V); its base side is ' +
      mh('N_C') + '/(' + mh('N_B') + ' + ' + mh('N_C') + ') = 1/11 of its width. ' + mh('W_B') + ' = ' + mh('W_{met}') + ' − ' + mh('x_{EB}') + ' − ' + mh('x_{BC}') + '(' + mh('V_{CB}') + '), with 1.427 µm between the metallurgical junctions, giving ' + mh('W_B') + ' = 1.00 µm at ' + mh('V_{CB}') + ' = 5 V. ' +
      'Panel (a) moves the zero point with this exact ' + mh('W_B') + '(' + mh('V_{CB}') + '). ' + mh('V_A') + ' = ' + mh('W_{B0}') + '/' + mh('δ') + ' with ' + mh('W_{B0}') + ' = 1.0 µm and ' + mh('δ') + ' = 22.8 nm/V at the reference point ' + mh('V_{CB}') + ' = 5 V (eq. ruler, factor): 43.9 V. ' +
      'Panel (b) and ' + mh('I_C') + ' use the course factorization ' + mh('I_C') + ' = ' + mh('I_{C0}') + '(' + mh('V_{BE}') + ')(1 + ' + mh('V_{CE}') + '/' + mh('V_A') + ') (eq. factor, early), anchored at the operating point (' + mh('V_{CE}') + ' = 5.61 V), with the BC-forward terms of Ebers–Moll (EMC) for saturation; ' +
      'every extended plateau therefore meets the axis at the same point, −' + mh('V_A') + '. ' + mh('r_o') + ' = ' + mh('V_A') + '/' + mh('I_C') + ' (eq. early). ' + mh('V_T') + ' = 25.9 mV. Dashed grey line in (a): the reference ' + mh('V_{CB}') + ' = 5 V.</div>';

    var $ = function (s) { return root.querySelector(s); };
    var sE = $('[data-s=vce]'), sB = $('[data-s=vbe]'), oE = $('[data-o=vce]'), oB = $('[data-o=vbe]');
    var svgA = $('[data-p=a]'), svgB = $('[data-p=b]'), bPlay = $('[data-b=play]'), roBox = $('.ro'), hint = $('.hint');
    $('.leg').innerHTML =
      '<span><svg viewBox="0 0 12 12" width="12"><circle cx="6" cy="6" r="4" fill="' + C.el + '"/></svg>electron</span>' +
      '<span><svg viewBox="0 0 12 12" width="12"><rect x="1" y="1" width="10" height="10" fill="#fff" stroke="#5a6f8a"/><path d="M3.5 6h5" stroke="#5a6f8a" stroke-width="1.4"/></svg>acceptor ion</span>' +
      '<span><svg viewBox="0 0 12 12" width="12"><rect x="1" y="1" width="10" height="10" fill="#fff" stroke="#c0762f"/><path d="M3.5 6h5M6 3.5v5" stroke="#c0762f" stroke-width="1.4"/></svg>donor ion</span>' +
      '<span><svg viewBox="0 0 18 12" width="18"><path d="M5 6h12" stroke="' + C.fld + '" stroke-width="1.6"/><path d="M1 6l5 -3.5v7z" fill="' + C.fld + '"/></svg>field ℰ</span>';
    sE.value = st.vce; sB.value = st.vbe;
    // Handoff 4: regime buttons and a synchronised copy of the controls under each panel (no moving carriers here: no Speed)
    function setVCE(v) { st.vce = v; sE.value = v; st.sweeping = false; if (typeof syncButtons === 'function') syncButtons(); st.lastCtl = 'vce'; st.lastT = performance.now(); kick(); }
    function setVBE(v) { st.vbe = v; sB.value = v; st.lastCtl = 'vbe'; st.lastT = performance.now(); kick(); }
    var K = window.IX._kit, kctl = null;
    if (K) {
      kctl = K.controls({
        sliders: [
          { key: 'vce', label: mh('V_{CE}'), aria: 'V_CE', min: 0, max: 20, step: 0.01, get: function () { return st.vce; }, set: setVCE, fmt: function (v) { return fV(v, 2) + ' V'; } },
          { key: 'vbe', label: mh('V_{BE}'), aria: 'V_BE', min: -0.3, max: 0.67, step: 0.001, get: function () { return st.vbe; }, set: setVBE, fmt: function (v) { return fV(v) + ' V'; } }],
        regimes: [
          { label: 'Forward', title: 'Forward-active (normal) mode: V_BE = 0.611 V, V_CB = +5 V (V_CE = 5.611 V); I_C ≈ 1 mA', apply: function () { setVBE(0.611); setVCE(5.611); }, is: function () { return st.vbe === 0.611 && st.vce === 5.611; } },
          { label: 'Equilibrium (0 V)', title: 'Equilibrium: V_BE = 0 and V_CE = 0 (so V_CB = 0): no injection, no current', apply: function () { setVBE(0); setVCE(0); }, is: function () { return st.vbe === 0 && st.vce === 0; } },
          { label: 'Reverse', title: 'Cut-off: V_BE = −0.3 V (EB reverse) with V_CE = 5 V (V_CB = +5.3 V, BC reverse): the base is empty, I_C ≈ 0 whatever V_CE', apply: function () { setVBE(-0.3); setVCE(5); }, is: function () { return st.vbe === -0.3 && st.vce === 5; } }
        ]
      });
      root.querySelector('.ctl').appendChild(kctl.strip({ top: true, sliders: false }));
      [].forEach.call(root.querySelectorAll('.pan'), function (p, k) { p.appendChild(kctl.strip({ inside: true, tag: '(' + 'ab'[k] + ')' })); });
    }
    function syncButtons() { bPlay.innerHTML = st.sweeping ? '❚❚ Pause' : '▶ Sweep ' + mh('V_{CE}') + ' 0 → 20 V'; }
    syncButtons();
    sE.addEventListener('input', function () { st.vce = +sE.value; st.sweeping = false; syncButtons(); st.lastCtl = 'vce'; st.lastT = performance.now(); kick(); });
    sB.addEventListener('input', function () { st.vbe = +sB.value; st.lastCtl = 'vbe'; st.lastT = performance.now(); kick(); });
    var SWEEP_T = 9;
    bPlay.addEventListener('click', function () {
      if (st.sweeping) st.sweeping = false;
      else { if (st.sweepT >= SWEEP_T || st.sweepT === 0) st.sweepT = 0; st.sweeping = true; st.lastCtl = 'vce'; }
      syncButtons(); kick();
    });
    $('[data-b=reset]').addEventListener('click', function () {
      st.vce = DEF.vce; st.vbe = DEF.vbe; st.sweeping = false; st.sweepT = 0; st.lastCtl = '';
      sE.value = st.vce; sB.value = st.vbe; syncButtons(); kick();
    });

    var dims = {};
    function layout() {
      var W = root.clientWidth || 800;
      root.classList.toggle('wide', W >= 860);
      ['a', 'b'].forEach(function (k) {
        var svg = $('[data-p=' + k + ']');
        var w = Math.max(280, svg.parentNode.clientWidth - 16);
        var h = k === 'a' ? (w < 480 ? 380 : 400) : (w < 480 ? 330 : 420);
        dims[k] = { w: w, h: h };
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('height', h);
      });
      dirty = true;
    }
    var dirty = true;

    /* ---------------- panel (a) ---------------- */
    function drawA(m, vbe, vce) {
      var w = dims.a.w, h = dims.a.h, o = '', nar = w < 480;
      var vcb = vce - vbe;
      var XA = -0.42, XB = 2.4;
      var X0 = nar ? 44 : 54, X1 = w - 10;
      var fx = function (um) { return X0 + (um - XA) / (XB - XA) * (X1 - X0); };
      var sy0 = 22, sh = 58, sy1 = sy0 + sh;              /* region strip */
      var py0 = sy1 + 30, py1 = h - 74;                    /* profile plot */
      var ymax = disp.yA, U = 1e14;
      var fy = function (n) { return py1 - (n / U) / ymax * (py1 - py0); };
      var WBu = m.WB * 1e4, Wj = (WMET - XBE) * 1e4, xc = 10 * m.xb * 1e4, xeb = XBE * 1e4;
      o += '<defs><clipPath id="' + uid + 'a"><rect x="' + X0 + '" y="0" width="' + (X1 - X0) + '" height="' + h + '"/></clipPath></defs>';
      o += '<g clip-path="url(#' + uid + 'a)">';
      /* strip */
      o += R(fx(XA), sy0, fx(-xeb) - fx(XA), sh, '#e3ebf6');
      o += R(fx(-xeb), sy0, fx(0) - fx(-xeb), sh, '#fff');
      o += R(fx(0), sy0, fx(WBu) - fx(0), sh, '#fbefe2');
      o += R(fx(WBu), sy0, fx(Wj + xc) - fx(WBu), sh, '#fff');
      o += R(fx(Wj + xc), sy0, fx(XB) - fx(Wj + xc), sh, '#eef3fa');
      function ions(a, b, kind) {
        var s = '', xa = fx(a), xb2 = fx(Math.min(b, XB + 0.2)), wd = xb2 - xa, n = Math.floor(wd / 11), j, i, sz = 7, col = kind > 0 ? '#c0762f' : '#5a6f8a';
        if (n < 1) return '';
        for (i = 0; i < n; i++) for (j = 0; j < 3; j++) {
          var cx = xa + (i + 0.5) * wd / n, cy = sy0 + 12 + j * (sh - 24) / 2;
          s += '<rect x="' + (cx - sz / 2).toFixed(1) + '" y="' + (cy - sz / 2).toFixed(1) + '" width="' + sz + '" height="' + sz + '" fill="#fff" stroke="' + col + '" stroke-width="0.9"/>' + L(cx - 2.2, cy, cx + 2.2, cy, col, 1.1);
          if (kind > 0) s += L(cx, cy - 2.2, cx, cy + 2.2, col, 1.1);
        }
        return s;
      }
      o += ions(-xeb, 0, -1) + ions(WBu, Wj, -1) + ions(Wj, Wj + xc, 1);
      o += R(fx(XA), sy0, fx(XB) - fx(XA), sh, 'none', ' stroke="#9fb0c3"');
      o += L(fx(Wj), sy0, fx(Wj), sy1, '#9fb0c3', 1, ' stroke-dasharray="4 3"');
      if (fx(Wj + xc) - fx(WBu) > 20) o += arrow(Math.min(fx(Wj + xc), X1) - 4, sy1 + 9, fx(WBu) + 3, sy1 + 9, C.fld, 1.6, 6);
      o += '</g>';
      o += T((fx(XA) + fx(-xeb)) / 2, sy0 + 34, 'E', { fs: 12, anchor: 'middle', fw: 700, fill: C.navy });
      o += T((fx(0) + fx(WBu)) / 2, sy0 - 6, 'neutral base (P)', { fs: 11.5, anchor: 'middle', fw: 700, fill: C.navy });
      o += T(fx(Wj) + 3, sy0 - 6, nar ? 'BC SCR →' : 'BC SCR (N side →)', { fs: 10.5, anchor: 'start', fill: C.grey });
      if (Wj + xc > XB) o += T(X1 - 3, sy1 - 5, 'x_C = ' + xc.toFixed(2) + ' µm →', { fs: 10, anchor: 'end', fill: C.grey, halo: true });
      else o += T((fx(Wj + xc) + X1) / 2, sy0 + 34, 'C', { fs: 12, anchor: 'middle', fw: 700, fill: C.navy });
      o += T(fx(Wj), sy1 + 22, 'metallurgical BC junction', { fs: 9.5, anchor: nar ? 'end' : 'middle', fill: C.grey });
      /* profile axes */
      o += L(X0, py0 - 6, X0, py1, C.ink) + L(X0, py1, X1, py1, C.ink);
      ticks(0, ymax, 4).forEach(function (t) { var y = py1 - t / ymax * (py1 - py0); if (y < py0 - 6) return; o += L(X0 - 4, y, X0, y, C.ink) + T(X0 - 6, y + 4, fmtTick(t), { fs: 10.5, anchor: 'end', fill: C.grey }); if (t) o += L(X0, y, X1, y, '#eef1f5', 0.8); });
      o += T(12, (py0 + py1) / 2, 'n (10^{14} cm^{−3})', { fs: 11, anchor: 'middle', rot: -90, fill: C.grey });
      ticks(-0.4, 2.4, nar ? 5 : 7).forEach(function (t) { var x = fx(t); if (x < X0 - 1) return; o += L(x, py1, x, py1 + 4, C.ink) + T(x, py1 + 15, fmtTick(t), { fs: 10, anchor: 'middle', fill: C.grey }); });
      o += T(X1, py1 + 15 + 13, 'x (µm)', { fs: 10.5, anchor: 'end', fill: C.grey });
      o += L(fx(WBu), py0 - 6, fx(WBu), py1, '#c9a27a', 0.8, ' stroke-dasharray="3 3"') + L(fx(0), py0 - 6, fx(0), py1, '#c9a27a', 0.8, ' stroke-dasharray="3 3"');
      /* ghost: reference V_CB = 5 V, W_B = 1.00 um, same n(0) */
      var y0n = fy(m.n0);
      o += P([[fx(0), y0n], [fx(1.0), fy(0)]], '#8a96a5', 1.5, ' stroke-dasharray="6 4"');
      /* the triangle with its electrons */
      var yW = fy(Math.min(m.nW, m.n0 * 1.2));
      o += '<path d="M' + fx(0).toFixed(1) + ',' + py1.toFixed(1) + 'L' + fx(0).toFixed(1) + ',' + y0n.toFixed(1) + 'L' + fx(WBu).toFixed(1) + ',' + yW.toFixed(1) + 'L' + fx(WBu).toFixed(1) + ',' + py1.toFixed(1) + 'Z" fill="' + C.el + '" opacity="0.09"/>';
      HP.forEach(function (p) {
        var x = fx(p[0] * WBu), yt = y0n + (yW - y0n) * p[0];
        var y = py1 - p[1] * (py1 - y0n);
        if (y < yt + 3) return;
        o += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.4" fill="' + C.el + '" opacity="0.8"/>';
      });
      o += P([[fx(0), y0n], [fx(WBu), yW]], C.el, 3);
      o += '<circle cx="' + fx(0).toFixed(1) + '" cy="' + y0n.toFixed(1) + '" r="4.5" fill="' + C.el + '"/>';
      o += '<circle cx="' + fx(WBu).toFixed(1) + '" cy="' + yW.toFixed(1) + '" r="4.5" fill="#fff" stroke="' + C.acc + '" stroke-width="2"/>';
      var lowA = vbe < 0.45;
      o += T(fx(0) + 7, y0n - (lowA ? 44 : 8), lowA ? 'n(0) = ' + sciS(m.n0, 2) + ' ≈ 0: no injection' : 'n(0) = n_{B0}e^{V_BE/V_T} = ' + sciS(m.n0, 2) + (nar ? '' : ' (pivot)'), { fs: nar ? 10.5 : 11.5, fill: C.el, fw: 700, halo: true });
      var ang = Math.atan2(yW - y0n, fx(WBu) - fx(0)) * 180 / Math.PI;
      var xm = fx(WBu * 0.5), ym = y0n + (yW - y0n) * 0.5;
      if (!lowA) o += T(xm + 10, ym - 8, 'slope ∝ I_C', { fs: 11, anchor: 'middle', rot: ang, fill: C.navy, halo: true });
      o += T(fx(1.0) + 7, fy(0) - 6, nar ? 'ref. 5 V' : 'ref. V_{CB} = 5 V', { fs: 10, anchor: 'start', fill: '#7d8896', halo: true });
      o += T(fx(WBu), Math.min(yW, py1) - 22, 'zero point', { fs: 10.5, anchor: 'middle', fill: C.acc, fw: 700, halo: true });
      /* the ruler: under the axis, 0 .. W_B */
      var ry = py1 + 34, rh = 14;
      o += R(fx(0), ry, fx(WBu) - fx(0), rh, '#fff6d8', ' stroke="#b89a4a" stroke-width="1"');
      for (var t = 0; t <= WBu + 1e-6; t += 0.05) {
        var xt = fx(t), big = Math.abs(t * 10 - Math.round(t * 10)) < 1e-6;
        o += L(xt, ry, xt, ry + (big ? 8 : 4), '#8b7332', 0.9);
      }
      o += T(fx(WBu / 2), ry + rh + 13, 'W_B = ' + WBu.toFixed(3) + ' µm  (ruler)', { fs: 11.5, anchor: 'middle', fill: C.navy, fw: 700 });
      var dx = WBu - 1.0;
      if (Math.abs(dx) > 0.004) {
        var ya = ry + 7;
        o += arrow(fx(1.0), ya, fx(WBu) + (dx < 0 ? 2 : -2), ya, C.acc, 1.6, 6);
        o += L(fx(1.0), ry - 3, fx(1.0), ry + rh + 3, '#8a96a5', 1, ' stroke-dasharray="2 2"');
        o += T(fx(Math.max(WBu, 1.0)) + 6, ya + 4, (dx < 0 ? '−' : '+') + (Math.abs(dx) * 1000).toFixed(0) + ' nm', { fs: 10.5, anchor: 'start', fill: C.acc, fw: 700, halo: true });
      }
      svgA.innerHTML = o;
    }

    /* ---------------- panel (b) ---------------- */
    function drawB(m, vbe, vce) {
      var w = dims.b.w, h = dims.b.h, o = '', nar = w < 480;
      var xa = -52, xb = 21, yb = disp.yB, ya = 0;
      var X0 = nar ? 12 : 16, X1 = w - 12, Y0 = 28, Y1 = h - 50;
      var fx = function (v) { return X0 + (v - xa) / (xb - xa) * (X1 - X0); };
      var fy = function (v) { return Y1 - (v - ya) / (yb - ya) * (Y1 - Y0); };
      var K = 1e3, xz = fx(0);
      o += '<defs><clipPath id="' + uid + 'b"><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '"/></clipPath></defs>';
      o += R(fx(xa), Y0, xz - fx(xa), Y1 - Y0, '#f7f8fa');
      o += T(fx(xa) + 4, Y0 + 12, 'extended axis (no device here)', { fs: 9.5, fill: C.grey });
      /* saturation tint */
      o += R(xz, Y0, fx(vbe) - xz, Y1 - Y0, '#fdf3e7');
      ticks(xa, xb, nar ? 5 : 8).forEach(function (t) { var x = fx(t); if (x < X0) return; o += L(x, Y1, x, Y1 + 4, C.ink) + T(x, Y1 + 16, fmtTick(t), { fs: 10.5, anchor: 'middle', fill: C.grey }); });
      o += L(X0, Y1, xz, Y1, '#8a96a5', 1.2, ' stroke-dasharray="5 3"') + L(xz, Y1, X1, Y1, C.ink, 1.2);
      o += L(xz, Y0, xz, Y1, C.ink, 1);
      ticks(0, yb * K, 4).forEach(function (t) { var y = fy(t / K); if (y < Y0 || !t) return; o += L(xz - 4, y, xz, y, C.ink) + T(xz - 6, y + 4, fmtTick(t), { fs: 10.5, anchor: 'end', fill: C.grey, halo: true }); o += L(xz, y, X1, y, '#f0f2f5', 0.8); });
      o += T(xz + 4, Y0 - 12, 'I_C (mA)', { fs: 11, anchor: 'middle', fill: C.grey, halo: true });
      o += T(X1, h - 4, 'V_{CE} (V)', { fs: 11.5, anchor: 'end', fill: C.grey });
      var vcbOp = vce - vbe, fa = vcbOp > 0.1;
      var fam = [-0.036, -0.018, 0], cols = ['#a9b4c2', '#8592a3', C.navy];
      o += '<g clip-path="url(#' + uid + 'b)">';
      fam.forEach(function (d, i) {
        var V = vbe + d, pts = [];
        for (var k = 0; k <= 200; k++) { var x = 20 * Math.pow(k / 200, 1.6); pts.push([fx(x), fy(model(V, x - V).IC)]); }
        o += P(pts, cols[i], i === 2 ? 2.6 : 1.4);
        var I0c = model(V, 5).IC0;                       /* plateau line I_C0 (1 + V_CE/V_A), eq.(early) */
        o += P([[fx(-VA0), fy(0)], [fx(xb), fy(I0c * (1 + xb / VA0))]], i === 2 ? C.acc : cols[i], i === 2 ? 1.4 : 1.1, ' stroke-dasharray="6 4"');
        if (i === 2) o += '<circle cx="' + fx(0).toFixed(1) + '" cy="' + fy(I0c).toFixed(1) + '" r="3" fill="' + C.acc + '"/>';
      });
      o += '</g>';
      if (vbe >= 0.45) fam.forEach(function (d, i) {
        var V = vbe + d, I20 = model(V, 20 - V).IC, Ib = model(V, 5).IC / BF;
        o += T(X1 - 2, fy(I20) - 6, mlb(i === 2 ? 'I_B ≈ ' + fmtI(Ib, 2) : fmtI(Ib, 2)), { fs: i === 2 ? 11 : 10, anchor: 'end', fill: i === 2 ? C.navy : C.grey, fw: i === 2 ? 700 : 400, halo: true });
      });
      function mlb(s) { return s; }
      /* -V_A tick and the meeting point */
      var xv = fx(-VA0);
      o += '<circle cx="' + xv.toFixed(1) + '" cy="' + Y1.toFixed(1) + '" r="5" fill="#fff" stroke="' + C.acc + '" stroke-width="2"/>';
      o += T(xv, Y1 + 30, '−V_A = −' + VA0.toFixed(1) + ' V', { fs: 11, anchor: 'middle', fill: C.acc, fw: 700, halo: true });
      o += T(xv + 6, Y1 - 12, 'all plateaus meet here', { fs: 10.5, anchor: 'start', fill: C.acc, halo: true });
      if (vbe < 0.45) o += T(fx(-28), (Y0 + Y1) / 2 - 30, Math.abs(vbe) < 1e-3 && Math.abs(vce) < 1e-3 ? 'equilibrium: I_C = 0' : 'cut-off: I_C ≈ 0 whatever V_{CE}', { fs: 11, anchor: 'middle', fill: C.grey });
      else if (!fa) o += T(fx(-28), (Y0 + Y1) / 2 - 30, 'operating point in saturation', { fs: 11, anchor: 'middle', fill: C.grey });
      /* operating point */
      var yo = fy(m.IC);
      o += L(fx(vce), Y1, fx(vce), yo, C.acc, 1, ' stroke-dasharray="3 3"');
      o += '<circle cx="' + fx(vce).toFixed(1) + '" cy="' + yo.toFixed(1) + '" r="6" fill="' + C.acc + '" stroke="#fff" stroke-width="2"/>';
      svgB.innerHTML = o;
    }

    function readouts(m, vbe, vce) {
      var vcb = vce - vbe;
      roBox.innerHTML =
        '<div><small>' + mh('V_{CB}') + ' = ' + mh('V_{CE}') + ' − ' + mh('V_{BE}') + '</small><b>' + fV(vcb, 3) + ' V</b></div>' +
        '<div><small>SCR in the base, ' + mh('x_{BC}') + '</small><b>' + (m.xb * 1e7).toFixed(0) + ' nm</b></div>' +
        '<div class="k"><small>' + mh('W_B') + '</small><b>' + (m.WB * 1e4).toFixed(3) + ' µm</b></div>' +
        '<div><small>SCR edge advance here, |d' + mh('W_B') + '/d' + mh('V_{CB}') + '|</small><b>' + (m.delta * 1e7).toFixed(1) + ' nm/V</b></div>' +
        '<div class="k"><small>' + mh('V_A') + ' = ' + mh('W_{B0}') + '/' + mh('δ') + ' (5 V ref.)</small><b>' + m.VA.toFixed(1) + ' V</b></div>' +
        '<div class="k"><small>' + mh('I_C') + ' (eq. early)</small><b>' + fmtI(m.IC) + '</b></div>' +
        '<div><small>' + mh('r_o') + ' = ' + mh('V_A') + '/' + mh('I_C') + '</small><b>' + (vcb > 0.1 && vbe >= 0.45 ? (m.VA / m.IC / 1e3).toFixed(m.VA / m.IC >= 1e5 ? 0 : 1) + ' kΩ' : '—') + '</b></div>' +
        '<div><small>' + mh('I_B') + ' (EMB)</small><b>' + fmtI(m.IB) + '</b></div>';
      var msg, t = performance.now();
      if (Math.abs(vbe) < 1e-3 && Math.abs(vce) < 1e-3) msg = '<b>Equilibrium (all voltages 0):</b> no injection, the base holds only ' + mh('n_{B0}') + '; no slope, no current. Press Forward to put the transistor on its plateau.';
      else if (vbe < 0.45) msg = '<b>Cut-off (' + mh('V_{BE}') + ' too low):</b> the emitter injects nothing, the base line lies on zero and ' + mh('I_C') + ' ≈ 0 whatever ' + mh('V_{CE}') + ': the ruler still moves, but there is no slope to tilt.';
      else if (vcb <= 0.1) msg = '<b>Saturation (' + mh('V_{CB}') + ' ≤ 0):</b> the BC junction is forward biased, its far end rises and ' + mh('I_C') + ' falls. The Early picture belongs to the plateau: raise ' + mh('V_{CE}') + '.';
      else if (st.lastCtl === 'vbe' && t - st.lastT < 2500) msg = '<b>' + mh('V_{BE}') + ' changes the height ' + mh('n') + '(0), not the ruler:</b> ' + mh('W_B') + ', ' + mh('δ') + ' and ' + mh('V_A') + ' stay the same. Every curve has the same relative slope 1/' + mh('V_A') + ', so all the extended plateaus meet at one point.';
      else msg = '<b>' + mh('V_{CE}') + ' ↑, so ' + mh('V_{CB}') + ' ↑:</b> the BC SCR eats ' + (m.delta * 1e7).toFixed(1) + ' nm of base per volt here; the zero point creeps towards the emitter, the line pivots on ' + mh('n') + '(0) and ' + mh('I_C') + ' rises. ' +
        'The relative slope 1/' + mh('V_A') + ' is the same for every curve: all the extended plateaus meet at −' + mh('V_A') + '.';
      hint.innerHTML = msg;
      oE.textContent = fV(st.vce, 2) + ' V';
      oB.textContent = fV(st.vbe) + ' V';
    }

    var raf = 0, lastFrame = 0, lastSig = '';
    function kick() { if (!raf) { lastFrame = performance.now(); raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - lastFrame) / 1000); lastFrame = now;
      if (!root.isConnected) return;
      if (st.sweeping) {
        st.sweepT += dt; var u = Math.min(1, st.sweepT / SWEEP_T);
        st.vce = 20 * u * u * (1.6 - 0.6 * u); sE.value = st.vce; disp.vce = st.vce;   /* slower at the start */
        if (u >= 1) { st.sweeping = false; syncButtons(); }
      }
      var a = 1 - Math.exp(-dt / 0.07), moving = false;
      ['vce', 'vbe'].forEach(function (k) { var d = st[k] - disp[k]; if (Math.abs(d) > (k === 'vbe' ? 2e-5 : 2e-4)) { disp[k] += d * a; moving = true; } else disp[k] = st[k]; });
      var vbe = disp.vbe, vce = disp.vce, m = model(vbe, vce - vbe);
      var vs = Math.max(vbe, 0.55); // scales freeze below 0.55 V (equilibrium, cut-off): the curves then sit at zero on a readable axis
      var tA = 1.3 * model(vs, vce - vbe).n0 / 1e14, tB = 1.15 * model(vs, 20 - vs).IC;
      if (!disp.yA) { disp.yA = tA; disp.yB = tB; }
      [['yA', tA], ['yB', tB]].forEach(function (p) { var d = p[1] - disp[p[0]]; if (Math.abs(d) > 1e-3 * p[1]) { disp[p[0]] += d * (1 - Math.exp(-dt / 0.12)); moving = true; } else disp[p[0]] = p[1]; });
      var sig = [vbe, vce, disp.yA, disp.yB].join('|');
      if (dirty || sig !== lastSig) { drawA(m, vbe, vce); drawB(m, vbe, vce); lastSig = sig; dirty = false; }
      readouts(m, vbe, vce);
      if (kctl) kctl.refresh();
      if (moving || st.sweeping || (st.lastCtl === 'vbe' && now - st.lastT < 2600)) raf = requestAnimationFrame(frame);
    }
    var rt = 0;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (!root.isConnected) { window.removeEventListener('resize', onResize); return; } layout(); kick(); }, 120); }
    window.addEventListener('resize', onResize);
    layout(); kick();
  }

  window.IX = window.IX || {};
  window.IX[ID] = mount;
})();
