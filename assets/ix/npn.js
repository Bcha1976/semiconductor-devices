/* Interactive "npn": the NPN transistor, V_BE sets the slope, V_CB does nothing until...
   Semiconductor Devices Physics, Chapter 8 (Dr Bassem CHAABANE, ENISO).
   Physics: reference transistor of Ch8; edge densities eq.(edges), Fick eq.(In),
   Ebers-Moll eq.(EMC),(EMB),(EME),(EMread), holes eq.(holes), zero eq.(zero),
   base-width modulation Part E (depletion approximation, W_met = 1.427 um). */
(function () {
  'use strict';
  var ID = 'npn';

  /* ---------------- physics (Ch8 reference transistor) ---------------- */
  var q = 1.602e-19, VT = 0.0259, ni = 1e10, EPS = 11.7 * 8.854e-14;
  var NE = 1e18, NB = 1e16, NC = 1e15, Dn = 35, Dp = 12, TAUN = 1e-7, S = 1e-4;
  var dE = 0.5e-4, dC = 10e-4, VdE = 0.835, VdC = 0.656;
  var nB0 = ni * ni / NB, pE0 = ni * ni / NE, pC0 = ni * ni / NC;
  var WB_REF = 1e-4;                                   /* W_B = 1.0 um at V_CB = 5 V */
  var IS0 = q * S * Dn * ni * ni / (NB * WB_REF);      /* eq.(IC): 5.6e-14 A */
  var IpE0 = q * S * Dp * ni * ni / (NE * dE);         /* eq.(holes) */
  var IpC0 = q * S * Dp * ni * ni / (NC * dC);
  var TAUB = WB_REF * WB_REF / (2 * Dn);               /* eq.(tauB) */
  var IrF = IS0 * TAUB / TAUN;                         /* eq.(IrB) */
  var ISbF = IpE0 + IrF, ISbR = IpC0 + IrF;            /* eq.(betas) */
  var BF = IS0 / ISbF, BR = IS0 / ISbR, AR = BR / (BR + 1);
  function Wscr(Vd, V, N1, N2) { return Math.sqrt(2 * EPS * Math.max(Vd - V, 1e-3) / q * (1 / N1 + 1 / N2)); }
  var XBE = Wscr(VdE, 0.611, NE, NB) * NE / (NE + NB); /* EB SCR, base side */
  function xBC(vcb) { return Wscr(VdC, -vcb, NB, NC) * NC / (NB + NC); }
  var WMET = WB_REF + XBE + xBC(5);                    /* 1.427 um (EB SCR edge counted) */

  function model(vbe, vcb, early) {
    var WB = early ? WMET - XBE - xBC(vcb) : WB_REF;
    var IS = IS0 * WB_REF / WB;
    var ea = Math.exp(vbe / VT), eb = Math.exp(-vcb / VT);
    var In = IS * (ea - eb);                                 /* eq.(In) */
    var IC = In - ISbR * (eb - 1);                           /* eq.(EMC) */
    var IB = ISbF * (ea - 1) + ISbR * (eb - 1);              /* eq.(EMB) */
    return {
      WB: WB, IS: IS, In: In, IC: IC, IB: IB, IE: IC + IB,
      IpE: IpE0 * (ea - 1), IpC: IpC0 * (eb - 1), Iideal: In,
      n0: nB0 * ea, nW: nB0 * eb, pE: pE0 * ea, pC: pC0 * eb, plateau: IS * ea
    };
  }
  function zeroVCB(vbe, early) {
    var lo = -vbe - 0.2, hi = -vbe + 0.2, i, m;
    for (i = 0; i < 60; i++) { m = (lo + hi) / 2; if (model(vbe, m, early).IC > 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }

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
      '.ix-npn{font-family:var(--sans,"DejaVu Sans",system-ui,sans-serif);color:#1d2430;font-size:14px;line-height:1.4;background:#fff}',
      '.ix-npn *{box-sizing:border-box}',
      '.ix-npn .h{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin:0 0 10px}',
      '.ix-npn .h b{font-size:16px;color:#1F3A5F}',
      '.ix-npn .h span{color:#6B6B6B;font-size:13px}',
      '.ix-npn .ctl{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;border:1px solid #dde3ea;border-radius:6px;padding:10px 14px;background:#fafbfc;margin-bottom:12px}',
      '.ix-npn .sl{display:flex;flex-direction:column;gap:2px;min-width:230px;flex:1 1 260px}',
      '.ix-npn .sl label{display:flex;justify-content:space-between;font-size:13px;color:#1d2430}',
      '.ix-npn .sl label output{font-weight:700;color:#1F3A5F;font-variant-numeric:tabular-nums}',
      '.ix-npn input[type=range]{width:100%;accent-color:#D9771A;margin:4px 0}',
      '.ix-npn .btns{display:flex;flex-wrap:wrap;gap:6px}',
      '.ix-npn button{font:inherit;font-size:13px;border:1px solid #c5cfdb;background:#fff;color:#1F3A5F;border-radius:5px;padding:5px 11px;cursor:pointer}',
      '.ix-npn button:hover{border-color:#1F3A5F}',
      '.ix-npn button.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}',
      '.ix-npn button.play{background:#D9771A;color:#fff;border-color:#D9771A;font-weight:700}',
      '.ix-npn .grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}',
      '.ix-npn.wide .grid{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}',
      '.ix-npn .col{display:flex;flex-direction:column;gap:12px;min-width:0}',
      '.ix-npn .pan{border:1px solid #dde3ea;border-radius:6px;padding:8px 8px 4px;background:#fff;min-width:0}',
      '.ix-npn .pt{font-size:13px;font-weight:700;color:#1F3A5F;margin:0 4px 2px}',
      '.ix-npn .pt span{font-weight:400;color:#6B6B6B}',
      '.ix-npn svg{display:block;width:100%;height:auto;overflow:visible}',
      '.ix-npn .ro{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:12px}',
      '.ix-npn .ro div{border:1px solid #dde3ea;border-radius:6px;padding:6px 9px;background:#fafbfc}',
      '.ix-npn .ro small{display:block;color:#6B6B6B;font-size:12px}',
      '.ix-npn .ro b{font-size:14.5px;color:#1d2430;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}\n.ix-npn .ro .w2{grid-column:span 2}',
      '.ix-npn .ro .reg b{color:#1F3A5F}',
      '.ix-npn .ro .reg.sat b{color:#C8641E}',
      '.ix-npn .hint{margin-top:10px;border-left:4px solid #D9771A;background:#FDF3E7;padding:8px 12px;border-radius:0 6px 6px 0;font-size:14px;min-height:2.6em}',
      '.ix-npn .hint b{color:#D9771A}',
      '.ix-npn .cap{margin-top:8px;color:#6B6B6B;font-size:12.5px}',
      '.ix-npn .knee{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin:4px 4px 2px;font-size:13px}',
      '.ix-npn .knee span{color:#1d2430;font-variant-numeric:tabular-nums}',
      '.ix-npn .knee span b{color:#D9771A}',
      '.ix-npn .leg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:#6B6B6B;margin:2px 4px 4px}',
      '.ix-npn .leg svg{display:inline-block;width:auto;height:12px;vertical-align:-1px;margin-right:4px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------------- mount ---------------- */
  function mount(root) {
    injectCSS();
    root.innerHTML = '';
    root.classList.add('ix-npn');
    var uid = 'ixnpn' + Math.floor(Math.random() * 1e9);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var DEF = { vbe: 0.611, vcb: 5.0 };
    var st = { vbe: DEF.vbe, vcb: DEF.vcb, early: false, flow: !reduce, sweeping: false, sweepT: 0, lastCtl: '', lastT: 0 };
    var disp = { vbe: st.vbe, vcb: st.vcb, yB: 0, yC: 0, yD: 0 };

    root.innerHTML =
      '<div class="h"><b>The NPN transistor: ' + mh('V_{BE}') + ' sets the slope, ' + mh('V_{CB}') + ' does nothing until…</b>' +
      '<span>Ch8 reference transistor · short base · Ebers–Moll</span></div>' +
      '<div class="ctl">' +
      '<div class="sl"><label><span>' + mh('V_{BE}') + ' (EB junction, forward)</span><output data-o="vbe"></output></label>' +
      '<input type="range" data-s="vbe" min="-0.30" max="0.70" step="0.001"></div>' +
      '<div class="sl"><label><span>' + mh('V_{CB}') + ' (BC junction, + = reverse)</span><output data-o="vcb"></output></label>' +
      '<input type="range" data-s="vcb" min="-0.75" max="10" step="0.001"></div>' +
      '<div class="btns"><button class="play" data-b="play">▶ Sweep ' + mh('V_{CB}') + ' 5 → −0.75 V</button>' +
      '<button data-b="reset">Reset</button><button data-b="flow"></button><button data-b="early"></button></div>' +
      '</div>' +
      '<div class="grid"><div class="col">' +
      '<div class="pan"><div class="pt">(a) The device and its two sources <span>· dots: electrons (blue) and holes (orange) in transit</span></div>' +
      '<div class="leg"></div><svg data-p="a"></svg></div>' +
      '<div class="pan"><div class="pt">(b) Minority densities, linear axis <span>· base line, holes in E and C</span></div><svg data-p="b"></svg></div>' +
      '</div><div class="col">' +
      '<div class="pan"><div class="pt">(c) ' + mh('I_C') + ' against ' + mh('V_{CB}') + ' <span>· eq. (EMC), curves 18 mV apart</span></div><svg data-p="c"></svg></div>' +
      '<div class="pan"><div class="pt">(d) Knee view <span>· ' + mh('V_{CB}') + ' from −0.65 to −0.45 V, fixed axis, slider in 1 mV steps</span></div>' +
      '<div class="knee"><button data-b="zero">Go to ' + mh('I_C') + ' = 0</button><span data-o="zero"></span></div><svg data-p="d"></svg></div>' +
      '</div></div>' +
      '<div class="ro"></div><div class="hint"></div>' +
      '<div class="cap">Computed from the Ch8 equations for the reference transistor (' + mh('I_S') + ' = 5.6×10<sup>−14</sup> A, ' +
      mh('β_F') + ' = 121, ' + mh('β_R') + ' = 2.9, ' + mh('α_R') + ' = 0.744, ' + mh('V_T') + ' = 25.9 mV). ' +
      'Default: ' + mh('W_B') + ' = 1 µm fixed (no base-width modulation), so the plateau is flat and the zero is the value of eq. (zero), −0.603 V. The notes quote −0.602 V because their figure includes base-width modulation: turn it on to see it (' + mh('W_B') + '(' + mh('V_{CB}') + ') from the depletion approximation, 1.0 µm at 5 V; the tilt is the Early effect, Part E). ' +
      'Widths in (a)–(b) are schematic (base to scale with its SCR sides; emitter, collector and the collector side of the BC SCR not to scale). ' +
      'Dot rates are proportional to the currents at fixed ' + mh('V_{BE}') + ' (compressed between ' + mh('V_{BE}') + ' values); hole dots ×10.</div>';

    var $ = function (s) { return root.querySelector(s); };
    var sV = $('[data-s=vbe]'), sC = $('[data-s=vcb]');
    var oV = $('[data-o=vbe]'), oC = $('[data-o=vcb]');
    var svgA = $('[data-p=a]'), svgB = $('[data-p=b]'), svgC = $('[data-p=c]'), svgD = $('[data-p=d]');
    var bPlay = $('[data-b=play]'), bFlow = $('[data-b=flow]'), bEarly = $('[data-b=early]');
    var roBox = $('.ro'), hint = $('.hint'), oZero = $('[data-o=zero]');
    $('[data-b=zero]').addEventListener('click', function () { setVCB(zeroVCB(st.vbe, st.early)); });
    $('.leg').innerHTML =
      '<span><svg viewBox="0 0 12 12" width="12"><circle cx="6" cy="6" r="4" fill="' + C.el + '"/></svg>electron</span>' +
      '<span><svg viewBox="0 0 12 12" width="12"><circle cx="6" cy="6" r="3.6" fill="#fff" stroke="' + C.ho + '" stroke-width="1.6"/></svg>hole</span>' +
      '<span><svg viewBox="0 0 12 12" width="12"><rect x="1" y="1" width="10" height="10" fill="#fff" stroke="#c0762f"/><path d="M3.5 6h5M6 3.5v5" stroke="#c0762f" stroke-width="1.4"/></svg>donor ion</span>' +
      '<span><svg viewBox="0 0 12 12" width="12"><rect x="1" y="1" width="10" height="10" fill="#fff" stroke="#5a6f8a"/><path d="M3.5 6h5" stroke="#5a6f8a" stroke-width="1.4"/></svg>acceptor ion</span>' +
      '<span><svg viewBox="0 0 18 12" width="18"><path d="M1 6h12" stroke="' + C.fld + '" stroke-width="1.6"/><path d="M17 6l-5 -3.5v7z" fill="' + C.fld + '"/></svg>field ℰ</span>';

    sV.value = st.vbe; sC.value = st.vcb;
    // Handoff 4: regime buttons, carrier Speed, and a synchronised copy of the controls under each panel
    var CARRIER = 0.3; st.spd = 1;
    function fmtV(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(3) + ' V'; }
    function setVBE(v) { st.vbe = v; sV.value = v; st.lastCtl = 'vbe'; st.lastT = performance.now(); kick(); }
    function setVCB(v) { st.vcb = v; sC.value = v; st.sweeping = false; syncButtons(); st.lastCtl = 'vcb'; st.lastT = performance.now(); kick(); }
    var K = window.IX._kit, kctl = null;
    if (K) {
      kctl = K.controls({
        sliders: [
          { key: 'vbe', label: mh('V_{BE}'), aria: 'V_BE', min: -0.3, max: 0.7, step: 0.001, get: function () { return st.vbe; }, set: setVBE, fmt: fmtV },
          { key: 'vcb', label: mh('V_{CB}'), aria: 'V_CB', min: -0.75, max: 10, step: 0.001, get: function () { return st.vcb; }, set: setVCB, fmt: fmtV },
          { key: 'vcbk', label: mh('V_{CB}') + ' <small>(knee)</small>', aria: 'V_CB, knee range, 1 mV steps', title: 'Same V_CB, on the knee range −0.65 … −0.45 V, 1 mV per step', min: -0.65, max: -0.45, step: 0.001, get: function () { return st.vcb; }, set: setVCB, fmt: fmtV }],
        regimes: [
          { label: 'Forward', title: 'Forward-active (normal) mode: V_BE = 0.611 V (EB forward), V_CB = +5 V (BC reverse); I_C ≈ 1 mA', apply: function () { setVBE(0.611); setVCB(5); }, is: function () { return st.vbe === 0.611 && st.vcb === 5; } },
          { label: 'Equilibrium (0 V)', title: 'Equilibrium: V_BE = 0 and V_CB = 0, both junctions at equilibrium, all currents zero', apply: function () { setVBE(0); setVCB(0); }, is: function () { return st.vbe === 0 && st.vcb === 0; } },
          { label: 'Reverse', title: 'Cut-off: both junctions reverse biased, V_BE = −0.3 V and V_CB = +5 V; the base line is empty and only tiny leakage currents flow', apply: function () { setVBE(-0.3); setVCB(5); }, is: function () { return st.vbe === -0.3 && st.vcb === 5; } }
        ],
        speed: { get: function () { return st.spd; }, set: function (v) { st.spd = v; kick(); } }
      });
      root.querySelector('.ctl').appendChild(kctl.strip({ top: true, sliders: false }));
      [].forEach.call(root.querySelectorAll('.pan'), function (p, k) { p.appendChild(kctl.strip({ inside: true, tag: '(' + 'abcd'[k] + ')', only: k === 3 ? ['vbe', 'vcbk'] : ['vbe', 'vcb'] })); });
    }
    function syncButtons() {
      bFlow.textContent = st.flow ? '❚❚ Pause flow' : '▶ Flow';
      bFlow.classList.toggle('on', !st.flow);
      bEarly.innerHTML = 'Base-width modulation: ' + (st.early ? 'on' : 'off');
      bEarly.classList.toggle('on', st.early);
      bPlay.innerHTML = st.sweeping ? '❚❚ Pause sweep' : '▶ Sweep ' + mh('V_{CB}') + ' 5 → −0.75 V';
    }
    syncButtons();

    sV.addEventListener('input', function () { st.vbe = +sV.value; st.lastCtl = 'vbe'; st.lastT = performance.now(); kick(); });
    sC.addEventListener('input', function () { st.vcb = +sC.value; st.sweeping = false; syncButtons(); st.lastCtl = 'vcb'; st.lastT = performance.now(); kick(); });
    bPlay.addEventListener('click', function () {
      if (st.sweeping) { st.sweeping = false; }
      else { if (st.sweepT >= SWEEP_T || st.sweepT === 0) { st.sweepT = 0; } st.sweeping = true; st.lastCtl = 'vcb'; }
      syncButtons(); kick();
    });
    $('[data-b=reset]').addEventListener('click', function () {
      st.vbe = DEF.vbe; st.vcb = DEF.vcb; st.sweeping = false; st.sweepT = 0; st.early = false; st.lastCtl = '';
      sV.value = st.vbe; sC.value = st.vcb; syncButtons(); kick();
    });
    function kref() { if (kctl) kctl.refresh(); }
    bFlow.addEventListener('click', function () { st.flow = !st.flow; syncButtons(); kick(); });
    bEarly.addEventListener('click', function () { st.early = !st.early; syncButtons(); dirty = true; kick(); });

    /* sweep: 5 V -> -0.75 V, slower in the knee */
    var KEYS = [[0, 5], [2.4, 0], [3.9, -0.45], [9.4, -0.75]], SWEEP_T = 9.4;
    function sweepV(t) {
      for (var i = 1; i < KEYS.length; i++) if (t <= KEYS[i][0]) {
        var a = KEYS[i - 1], b = KEYS[i], u = (t - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * u;
      }
      return KEYS[KEYS.length - 1][1];
    }

    /* ---------------- layout ---------------- */
    var dims = {};
    function layout() {
      var W = root.clientWidth || 800;
      root.classList.toggle('wide', W >= 860);
      ['a', 'b', 'c', 'd'].forEach(function (k) {
        var svg = $('[data-p=' + k + ']');
        var w = Math.max(280, svg.parentNode.clientWidth - 16);
        var h;
        if (k === 'a') h = w < 480 ? 210 : 206;
        else if (k === 'b') h = w < 480 ? 290 : 320;
        else if (k === 'c') h = w < 480 ? 270 : 300;
        else h = w < 480 ? 220 : 232;
        dims[k] = { w: w, h: h };
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.setAttribute('height', h);
      });
      svgA.innerHTML = '<g data-g="s"></g><g data-g="p"></g>';
      gStatic = svgA.querySelector('[data-g=s]'); gPart = svgA.querySelector('[data-g=p]');
      pool = []; parts = [];
      var html = '';
      for (var i = 0; i < 260; i++) html += '<circle r="3" cx="-20" cy="-20" visibility="hidden"/>';
      gPart.innerHTML = html;
      pool = Array.prototype.slice.call(gPart.childNodes);
      dirty = true;
    }
    var gStatic, gPart, pool = [], parts = [], dirty = true;

    /* shared x geometry for (a) and (b) */
    function geo(w, vbe, vcb, m) {
      var x0 = w < 480 ? 46 : 56, x1 = w - 10, Pw = x1 - x0;
      var sE = Math.sqrt((VdE - vbe) / (VdE - 0.611));
      var fE = 0.12, fS1 = 0.042 * sE, fBase = 0.30;
      var baseSpan = WMET - XBE;                                   /* neutral base + BC base side */
      var xb = st.early ? (WMET - XBE - m.WB) : xBC(5);
      var fBC_b = fBase * xb / baseSpan, fN = fBase - fBC_b;
      var fBC_c = 0.11 * Math.sqrt(Math.max(VdC + vcb, 0.02) / (VdC + 5));
      fBC_c = clamp(fBC_c, 0.012, 0.2);
      var e1 = x0 + fE * Pw, e2 = e1 + fS1 * Pw, e3 = e2 + fN * Pw, ej = e3 + fBC_b * Pw, e4 = ej + fBC_c * Pw;
      return { x0: x0, x1: x1, e1: e1, e2: e2, e3: e3, ej: ej, e4: e4, e5: x1 };
    }

    /* ---------------- panel (a): device strip ---------------- */
    var SY0 = 26, SH = 84;
    function drawA(m, vbe, vcb) {
      var w = dims.a.w, g = geo(w, vbe, vcb, m), o = '';
      var y0 = SY0, y1 = SY0 + SH;
      o += '<defs><clipPath id="' + uid + 'a"><rect x="' + g.x0 + '" y="' + y0 + '" width="' + (g.x1 - g.x0) + '" height="' + SH + '"/></clipPath></defs>';
      o += R(g.x0, y0, g.e1 - g.x0, SH, '#e3ebf6');                /* N+ emitter */
      o += R(g.e1, y0, g.e2 - g.e1, SH, '#ffffff');
      o += R(g.e2, y0, g.e3 - g.e2, SH, '#fbefe2');                /* neutral base */
      o += R(g.e3, y0, g.e4 - g.e3, SH, '#ffffff');
      o += R(g.e4, y0, g.e5 - g.e4, SH, '#eef3fa');                /* collector */
      o += R(g.x0, y0, g.x1 - g.x0, SH, 'none', ' stroke="#9fb0c3" stroke-width="1"');
      o += L(g.e1, y0, g.e1, y1, '#9fb0c3', 0.8, ' stroke-dasharray="3 3"') + L(g.e2, y0, g.e2, y1, '#9fb0c3', 0.8, ' stroke-dasharray="3 3"');
      o += L(g.e3, y0, g.e3, y1, '#9fb0c3', 0.8, ' stroke-dasharray="3 3"') + L(g.e4, y0, g.e4, y1, '#9fb0c3', 0.8, ' stroke-dasharray="3 3"');
      o += L(g.ej, y0, g.ej, y1, '#c9d3de', 0.8);
      /* ions in SCRs */
      function ions(xa, xb2, kind) {
        var s = '', wd = xb2 - xa, n = Math.max(1, Math.floor(wd / 11)), rows = 4, i, j, sz = 7;
        if (wd < 6) return '';
        for (i = 0; i < n; i++) for (j = 0; j < rows; j++) {
          var cx = xa + (i + 0.5) * wd / n, cy = y0 + 12 + j * (SH - 24) / (rows - 1);
          var col = kind > 0 ? '#c0762f' : '#5a6f8a';
          s += '<rect x="' + (cx - sz / 2).toFixed(1) + '" y="' + (cy - sz / 2).toFixed(1) + '" width="' + sz + '" height="' + sz + '" fill="#fff" stroke="' + col + '" stroke-width="0.9"/>';
          s += L(cx - 2.2, cy, cx + 2.2, cy, col, 1.1);
          if (kind > 0) s += L(cx, cy - 2.2, cx, cy + 2.2, col, 1.1);
        }
        return s;
      }
      var mid1 = g.e1 + (g.e2 - g.e1) * 0.12;      /* EB SCR: almost all on the base side */
      o += ions(g.e1, mid1, +1) + ions(mid1, g.e2, -1);
      o += ions(g.e3, g.ej, -1) + ions(g.ej, g.e4, +1);
      /* fields: towards the base */
      var fy = y1 - 6;
      if (g.e2 - g.e1 > 16) o += arrow(g.e1 + 3, fy, g.e2 - 3, fy, C.fld, 1.6, 6);
      if (g.e4 - g.e3 > 16) o += arrow(g.e4 - 3, fy, g.e3 + 3, fy, C.fld, 1.6, 6);
      o += T((g.e1 + g.e2) / 2, y0 - 4, 'ℰ', { fs: 11, anchor: 'middle', fill: C.fld });
      o += T((g.e3 + g.e4) / 2, y0 - 4, 'ℰ', { fs: 11, anchor: 'middle', fill: C.fld });
      /* region names */
      var small = w < 480;
      o += T((g.x0 + g.e1) / 2, y0 + 15, small ? 'E' : 'E · N⁺', { fs: 12, anchor: 'middle', fw: 700, fill: C.navy });
      o += T((g.e2 + g.e3) / 2, y0 + 15, small ? 'B' : 'B · P', { fs: 12, anchor: 'middle', fw: 700, fill: C.navy });
      o += T((g.e4 + g.e5) / 2, y0 + 15, small ? 'C · N' : 'C · N', { fs: 12, anchor: 'middle', fw: 700, fill: C.navy });
      o += T((g.e1 + g.e2) / 2 - (small ? 0 : 0), y0 - 14, 'SCR', { fs: 10, anchor: 'middle', fill: C.grey });
      o += T((g.e3 + g.e4) / 2, y0 - 14, 'SCR', { fs: 10, anchor: 'middle', fill: C.grey });
      /* circuit */
      var yw = y1 + 46, xE = (g.x0 + g.e1) / 2, xB = (g.e2 + g.e3) / 2, xC = (g.e4 + g.e5) / 2;
      o += L(xE, y1, xE, yw, C.ink, 1.3) + L(xB, y1, xB, yw, C.ink, 1.3) + L(xC, y1, xC, yw, C.ink, 1.3);
      o += R(xB - 7, y1 - 3, 14, 4, '#555');                                  /* base contact */
      function battery(xa, xb2, label, val, plusRight) {
        var xm = (xa + xb2) / 2, s = '';
        s += L(xa, yw, xm - 4, yw, C.ink, 1.3) + L(xm + 4, yw, xb2, yw, C.ink, 1.3);
        var xl = plusRight ? xm + 4 : xm - 4, xs = plusRight ? xm - 4 : xm + 4;
        s += L(xl, yw - 11, xl, yw + 11, C.ink, 2) + L(xs, yw - 6, xs, yw + 6, C.ink, 3.2);
        s += T(xl + (plusRight ? 6 : -6), yw - 8, '+', { fs: 11, anchor: 'middle', fill: C.ink });
        if (small) { s += T(xm, yw + 24, label, { fs: 11.5, anchor: 'middle', fill: C.navy, fw: 700 }) + T(xm, yw + 38, '= ' + val, { fs: 11, anchor: 'middle', fill: C.navy, fw: 700 }); }
        else s += T(xm, yw + 26, label + ' = ' + val, { fs: 12, anchor: 'middle', fill: C.navy, fw: 700 });
        return s;
      }
      o += battery(xE, xB, 'V_{BE}', fV(vbe) + ' V', true);
      o += battery(xB, xC, 'V_{CB}', fV(vcb, 2) + ' V', true);
      /* terminal currents (conventional) */
      var ay = y1 + 8;
      function cur(x, up, txt, side) {
        var s = up ? arrow(x, ay + 22, x, ay + 4, C.acc, 1.6, 6) : arrow(x, ay + 4, x, ay + 22, C.acc, 1.6, 6);
        s += T(x + (side > 0 ? 6 : -6), ay + 17, txt, { fs: 11, anchor: side > 0 ? 'start' : 'end', fill: C.acc, halo: true });
        return s;
      }
      o += cur(xE, m.IE < 0, 'I_E', -1);
      o += cur(xB, m.IB >= 0, 'I_B', 1);
      o += cur(xC, m.IC >= 0, 'I_C', 1);
      gStatic.innerHTML = o;
      return g;
    }

    /* particles */
    var spawnAcc = { e: 0, hE: 0, hC: 0 };
    function stepParticles(dt, m, g, vbe) {
      if (!g) return;
      var y0 = SY0, H = SH;
      var plate = m.plateau, gain = clamp(Math.pow(plate / 1e-3, 0.3), 0.25, 1.6);
      var k = 34 * gain / plate;                         /* dots per second per ampere */
      if (st.flow) {
        var rE = clamp(Math.abs(m.In) * k, 0, 80);
        var rH = clamp(Math.max(m.IpE, 0) * k * 10, 0, 40);
        var rC = clamp(Math.max(m.IpC, 0) * k * 10, 0, 22);
        spawnAcc.e += rE * dt; spawnAcc.hE += rH * dt; spawnAcc.hC += rC * dt;
        var dir = m.In >= 0 ? 1 : -1;
        while (spawnAcc.e >= 1) { spawnAcc.e -= 1; spawn('e', dir); }
        while (spawnAcc.hE >= 1) { spawnAcc.hE -= 1; spawn('hE', 0); }
        while (spawnAcc.hC >= 1) { spawnAcc.hC -= 1; spawn('hC', 0); }
      }
      function spawn(kind, dir) {
        if (parts.length >= pool.length) return;
        var p = { kind: kind, dir: dir, v: 0.12 + Math.random() * 0.76, age: 0 };
        if (kind === 'e') { p.x = dir > 0 ? g.e1 - Math.random() * (g.e1 - g.x0) * 0.35 : g.e5 - Math.random() * (g.e5 - g.e4) * 0.3; }
        else { p.x = (g.e2 + g.e3) / 2 + (Math.random() - 0.5) * (g.e3 - g.e2) * 0.4; p.v = 0.92 + Math.random() * 0.05; p.tx = kind === 'hE' ? -1 : 1; }
        parts.push(p);
      }
      var Pw = g.x1 - g.x0, alive = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (st.flow) {
          p.age += dt;
          if (p.kind === 'e') {
            var sp;
            if (p.x < g.e1) sp = 0.22; else if (p.x < g.e2) sp = 0.35; else if (p.x < g.e3) { var sb = (p.x - g.e2) / Math.max(1, g.e3 - g.e2); sb = p.dir > 0 ? sb : 1 - sb; sp = 0.06 / Math.max(0.15, 1 - 0.85 * sb); } else if (p.x < g.e4) sp = 0.5; else sp = 0.2;
            p.x += p.dir * sp * Pw * dt * (0.8 + 0.4 * Math.random());
            if (p.x >= g.e2 && p.x <= g.e3) p.v += (Math.random() - 0.5) * 1.4 * dt; /* diffusion jitter */
            p.v = clamp(p.v, 0.08, 0.92);
            if (p.x > g.x1 || p.x < g.x0) continue;
          } else {
            /* holes: rise from the base contact, then drift sideways into E or C, and recombine there */
            if (p.v > 0.55) p.v -= 0.9 * dt; else { p.v += (Math.random() - 0.5) * 0.8 * dt; p.v = clamp(p.v, 0.15, 0.8); p.x += p.tx * (p.x > g.e2 && p.x < g.e3 ? 0.08 : (p.x > g.e1 && p.x < g.e4 ? 0.3 : (p.kind === 'hC' ? 0.12 : 0.05))) * Pw * dt; }
            if (p.kind === 'hE' && p.x < g.e1 - (g.e1 - g.x0) * 0.8) continue;
            if (p.kind === 'hC' && p.x > g.e4 + (g.e5 - g.e4) * 0.7) continue;
            if (p.age > 14) continue;
          }
        }
        alive.push(p);
      }
      parts = alive;
      for (var j = 0; j < pool.length; j++) {
        var c = pool[j];
        if (j < parts.length) {
          var q2 = parts[j], cy = y0 + 6 + q2.v * (H - 12);
          c.setAttribute('cx', q2.x.toFixed(1)); c.setAttribute('cy', cy.toFixed(1));
          if (q2.kind === 'e') { c.setAttribute('fill', C.el); c.setAttribute('stroke', 'none'); c.setAttribute('r', '2.7'); }
          else { c.setAttribute('fill', '#fff'); c.setAttribute('stroke', C.ho); c.setAttribute('stroke-width', '1.4'); c.setAttribute('r', '2.8'); }
          c.setAttribute('visibility', 'visible');
        } else if (c.getAttribute('visibility') !== 'hidden') c.setAttribute('visibility', 'hidden');
      }
    }

    /* ---------------- panel (b): densities ---------------- */
    function drawB(m, vbe, vcb) {
      var w = dims.b.w, h = dims.b.h, g = geo(w, vbe, vcb, m), o = '';
      var top = 8, band = 54, yb0 = top + band + 14, yb1 = h - 34;      /* minority axis from yb1 (0) to yb0 (ymax) */
      var U = 1e14, ymax = disp.yB;
      var Y = function (v) { return yb1 - (v / U) / ymax * (yb1 - yb0); };
      o += '<defs><clipPath id="' + uid + 'b"><rect x="' + g.x0 + '" y="' + (yb0 - 2) + '" width="' + (g.x1 - g.x0) + '" height="' + (yb1 - yb0 + 3) + '"/></clipPath></defs>';
      /* region tints */
      o += R(g.x0, top, g.e1 - g.x0, yb1 - top, '#f3f6fb') + R(g.e2, top, g.e3 - g.e2, yb1 - top, '#fdf7f0') + R(g.e4, top, g.e5 - g.e4, yb1 - top, '#f6f8fc');
      [g.e1, g.e2, g.e3, g.e4].forEach(function (x) { o += L(x, top, x, yb1, '#c9d3de', 0.8, ' stroke-dasharray="3 3"'); });
      /* majority band */
      o += T(g.x1 - 2, top + 10, 'majority densities (not to scale)', { fs: 10, anchor: 'end', fill: C.grey });
      var yNE = top + 14, yNB = top + 30, yNC = top + 44;
      o += L(g.x0, yNE, g.e1, yNE, C.el, 2.2) + T(g.x0 + 4, yNE - 3, 'n = N_E', { fs: 10.5, fill: C.el });
      o += L(g.e2, yNB, g.e3, yNB, C.ho, 2.2) + T(g.e2 + 4, yNB - 3, 'p = N_B', { fs: 10.5, fill: C.ho });
      o += L(g.e4, yNC, g.e5, yNC, C.el, 2.2) + T(g.e4 + 4, yNC - 3, 'n = N_C', { fs: 10.5, fill: C.el });
      /* axis */
      o += L(g.x0, top, g.x0, yb1, C.ink, 1) + L(g.x0, yb1, g.x1, yb1, C.ink, 1);
      var zb = top + band + 4;                                          /* break marks */
      o += R(g.x0 - 6, zb - 3, 12, 9, '#fff');
      o += L(g.x0 - 6, zb + 1, g.x0 + 6, zb - 3, C.ink, 1) + L(g.x0 - 6, zb + 6, g.x0 + 6, zb + 2, C.ink, 1);
      ticks(0, ymax, 4).forEach(function (t) {
        var y = yb1 - t / ymax * (yb1 - yb0);
        if (y < yb0 - 1) return;
        o += L(g.x0 - 4, y, g.x0, y, C.ink, 1) + T(g.x0 - 6, y + 4, fmtTick(t), { fs: 10.5, anchor: 'end', fill: C.grey });
        if (t > 0) o += L(g.x0, y, g.x1, y, '#eef1f5', 0.8);
      });
      o += T(12, (yb0 + yb1) / 2, 'n, p (10^{14} cm^{−3})', { fs: 11, anchor: 'middle', rot: -90, fill: C.grey });
      /* SCR connectors (schematic) */
      function conn(xa, ya, xb2, yb2, col) {
        var xm = (xa + xb2) / 2;
        return '<path d="M' + xa.toFixed(1) + ',' + ya.toFixed(1) + 'C' + xm.toFixed(1) + ',' + ya.toFixed(1) + ' ' + xm.toFixed(1) + ',' + yb2.toFixed(1) + ' ' + xb2.toFixed(1) + ',' + yb2.toFixed(1) +
          '" fill="none" stroke="' + col + '" stroke-width="1.1" stroke-dasharray="3 3" opacity="0.65"/>';
      }
      var yn0 = Y(m.n0), ynW = Y(m.nW), ypE = Y(m.pE * 10), ypC = Y(m.pC / 10);
      var cl = function (y) { return clamp(y, yb0 - 4, yb1); };
      o += conn(g.e1, yNE, g.e2, cl(yn0), C.el) + conn(g.e3, cl(ynW), g.e4, yNC, C.el);
      o += conn(g.e1, cl(ypE), g.e2, yNB, C.ho) + conn(g.e3, yNB, g.e4, cl(ypC), C.ho);
      o += '<g clip-path="url(#' + uid + 'b)">';
      /* emitter holes (x10): straight line, short emitter */
      o += P([[g.x0, Y(pE0 * 10)], [g.e1, ypE]], C.ho, 2);
      /* collector holes (/10): straight line to the contact, short collector */
      o += P([[g.e4, ypC], [g.e5, Y(pC0 / 10)]], C.ho, 2.2);
      /* the electron line in the base */
      o += '<path d="M' + g.e2.toFixed(1) + ',' + yb1.toFixed(1) + 'L' + g.e2.toFixed(1) + ',' + yn0.toFixed(1) + 'L' + g.e3.toFixed(1) + ',' + ynW.toFixed(1) + 'L' + g.e3.toFixed(1) + ',' + yb1.toFixed(1) + 'Z" fill="' + C.el + '" opacity="0.10"/>';
      o += P([[g.e2, yn0], [g.e3, ynW]], C.el, 3);
      o += '</g>';
      /* end markers / off-scale */
      function endMark(x, y, col, label, anchor, dx) {
        var s = '';
        if (y < yb0 - 3) {
          s += arrow(x, yb0 + 16, x, yb0 - 2, col, 1.8, 7);
          var txt = label + ' ↑ off scale', est = txt.length * 5.6, tx2 = anchor === 'end' ? x + dx - est : x + dx;
          tx2 = clamp(tx2, g.x0 + 3, g.x1 - est);
          s += T(tx2, yb0 + (anchor === 'end' ? 48 : 10), txt, { fs: 10, anchor: 'start', fill: col, halo: true });
        } else {
          s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.6" fill="' + col + '"/>';
        }
        return s;
      }
      o += endMark(g.e2, yn0, C.el, '', 'start', 4);
      o += endMark(g.e3, ynW, C.el, Math.abs(ynW - yn0) > 18 ? 'n(W_B) = ' + sciS(m.nW, 1) : '', 'end', -5);
      if (vcb < 0.02) o += endMark(g.e4, ypC, C.ho, 'p_C/10', 'start', 5);
      /* labels */
      var nar = w < 480;
      o += T(g.e2 + 6, Math.max(yb0 + 10, yn0 - 7), 'n(0) = ' + sciS(m.n0, 2), { fs: nar ? 10.5 : 11.5, fill: C.el, fw: 700, halo: true });
      if (ynW >= yb0 - 3 && Math.abs(ynW - yn0) > 18) {
        var lbl = m.nW / m.n0 < 0.02 ? 'n(W_B) ≈ 0' : 'n(W_B) = ' + sciS(m.nW, 1);
        o += T(g.e3 - 4, Math.min(ynW - 7, yb1 - 6), lbl, { fs: nar ? 10 : 11, anchor: 'end', fill: C.el, halo: true });
      }
      /* slope label */
      var xm = g.e2 + (g.e3 - g.e2) * 0.55, ym = yn0 + (ynW - yn0) * 0.55;
      if (yn0 > yb0 - 3 && ynW > yb0 - 3 && ynW - yn0 > 30) {
        var ang = Math.atan2(ynW - yn0, g.e3 - g.e2) * 180 / Math.PI;
        o += T(xm + 4, ym - 8, 'slope ∝ I_n', { fs: 11, anchor: 'middle', fill: C.navy, rot: ang, halo: true });
      }
      o += T(g.e1 - 3, Math.min(ypE, yb1) - 6, 'p_E ×10', { fs: 10, anchor: 'end', fill: C.ho, halo: true });
      if (ypC < yb1 - 3 && ypC >= yb0 - 3) o += T(g.e4 + 6, ypC - 6, 'p_C ÷10 → p_{C0} at contact', { fs: 10, fill: C.ho, halo: true });
      else if (vcb >= 0.02) o += T(g.e4 + 6, yb1 - 6, 'p_C ≈ 0 (BC reverse)', { fs: 10, fill: C.ho });
      /* bottom: base width and region names */
      o += arrow(g.e2 + 8, yb1 + 13, g.e2, yb1 + 13, C.grey, 1, 5) + arrow(g.e3 - 8, yb1 + 13, g.e3, yb1 + 13, C.grey, 1, 5) + L(g.e2 + 8, yb1 + 13, g.e3 - 8, yb1 + 13, C.grey, 1);
      o += T((g.e2 + g.e3) / 2, yb1 + 27, 'W_B = ' + (m.WB * 1e4).toFixed(2) + ' µm', { fs: 11, anchor: 'middle', fill: C.grey });
      o += T((g.x0 + g.e1) / 2, yb1 + 16, nar ? 'E' : 'emitter', { fs: 10.5, anchor: 'middle', fill: C.grey });
      o += T((g.e4 + g.e5) / 2, yb1 + 16, nar ? 'collector, 10 µm' : 'collector, d_C = 10 µm', { fs: 10.5, anchor: 'middle', fill: C.grey });
      o += T(g.e2 - 2, yb1 + 13, '0', { fs: 10, anchor: 'end', fill: C.grey }) ;
      svgB.innerHTML = o;
    }

    /* ---------------- panels (c), (d): I_C(V_CB) ---------------- */
    function curve(vbe, xa, xb, early, ideal) {
      var pts = [], n = 240, i, v, ks = -vbe;
      var xs = [];
      for (i = 0; i <= n; i++) xs.push(xa + (xb - xa) * i / n);
      for (v = ks - 0.12; v <= ks + 0.3; v += 0.002) if (v > xa && v < xb) xs.push(v);
      xs.sort(function (a, b) { return a - b; });
      for (i = 0; i < xs.length; i++) { var mm = model(vbe, xs[i], early); pts.push([xs[i], ideal ? mm.Iideal : mm.IC]); }
      return pts;
    }
    function plotFrame(w, h, xa, xb, ya, yb, ml2, mb, opt) {
      var X0 = ml2, X1 = w - 12, Y0 = 10, Y1 = h - mb;
      var fx = function (v) { return X0 + (v - xa) / (xb - xa) * (X1 - X0); };
      var fy = function (v) { return Y1 - (v - ya) / (yb - ya) * (Y1 - Y0); };
      return { X0: X0, X1: X1, Y0: Y0, Y1: Y1, fx: fx, fy: fy };
    }
    function polyIn(F, pts, ya, yb) {
      return pts.map(function (p) { return [F.fx(p[0]), F.fy(clamp(p[1], ya - (yb - ya) * 0.05, yb + (yb - ya) * 0.05))]; });
    }
    function drawC(m, vbe, vcb) {
      var w = dims.c.w, h = dims.c.h, o = '', early = st.early;
      var xa = -0.8, xb = 10, yb = disp.yC, ya = -0.14 * yb;
      var F = plotFrame(w, h, xa, xb, ya, yb, w < 480 ? 44 : 50, 40);
      var K = 1e3;
      o += '<defs><clipPath id="' + uid + 'c"><rect x="' + F.X0 + '" y="' + F.Y0 + '" width="' + (F.X1 - F.X0) + '" height="' + (F.Y1 - F.Y0) + '"/></clipPath></defs>';
      o += R(F.fx(xa), F.Y0, F.fx(0) - F.fx(xa), F.Y1 - F.Y0, '#fdf3e7');
      o += T(F.fx(-0.8) + 2, F.Y0 + 12, 'BC forward', { fs: 9.5, anchor: 'start', fill: C.ho });
      ticks(xa, xb, 6).forEach(function (t) { var x = F.fx(t); o += L(x, F.Y1, x, F.Y1 + 4, C.ink) + T(x, F.Y1 + 16, fmtTick(t), { fs: 10.5, anchor: 'middle', fill: C.grey }); if (t !== 0) o += L(x, F.Y0, x, F.Y1, '#f0f2f5', 0.8); });
      ticks(0, yb * K, 4).forEach(function (t) { var y = F.fy(t / K); if (y < F.Y0 - 1) return; o += L(F.X0 - 4, y, F.X0, y, C.ink) + T(F.X0 - 6, y + 4, fmtTick(t), { fs: 10.5, anchor: 'end', fill: C.grey }); if (t) o += L(F.X0, y, F.X1, y, '#f0f2f5', 0.8); });
      o += L(F.X0, F.Y0, F.X0, F.Y1, C.ink) + L(F.X0, F.Y1, F.X1, F.Y1, C.ink);
      o += L(F.X0, F.fy(0), F.X1, F.fy(0), '#8a96a5', 0.8);
      o += L(F.fx(0), F.Y0, F.fx(0), F.Y1, '#8a96a5', 0.8, ' stroke-dasharray="2 3"');
      o += T((F.X0 + F.X1) / 2, h - 6, 'V_{CB} (V)', { fs: 11.5, anchor: 'middle', fill: C.grey });
      o += T(12, (F.Y0 + F.Y1) / 2, 'I_C (mA)', { fs: 11.5, anchor: 'middle', rot: -90, fill: C.grey });
      o += '<g clip-path="url(#' + uid + 'c)">';
      var fam = [-0.054, -0.036, -0.018];
      fam.forEach(function (d, i) {
        var pts = curve(vbe + d, xa, xb, early);
        o += P(polyIn(F, pts, ya, yb), C.faint, 1.2, ' opacity="' + (0.5 + 0.15 * i) + '"');
      });
      var cur = curve(vbe, xa, xb, early);
      o += P(polyIn(F, cur, ya, yb), C.navy, 2.6);
      o += '</g>';
      fam.forEach(function (d, i) {
        var mm = model(vbe + d, 9.5, early);
        var y = F.fy(mm.IC);
        if (y > F.Y0 + 6 && y < F.Y1 - 4) o += T(F.X1 - 2, y - 4, (['×⅛', '×¼', '×½'])[i] + ' (' + Math.round(d * 1000) + ' mV)', { fs: 9.5, anchor: 'end', fill: C.grey, halo: true });
      });
      var ip = model(vbe, 9.5, early);
      var lowC = vbe < 0.45;
      o += T(F.X1 - 2, lowC ? F.fy(0) - 14 : F.fy(ip.IC) - 6, 'V_{BE} = ' + fV(vbe) + ' V', { fs: 11, anchor: 'end', fill: C.navy, fw: 700, halo: true });
      /* plateau label */
      var pv = model(vbe, 3, early).IC;
      if (!lowC) o += T(F.fx(3.2), F.fy(pv) + 16, 'plateau: set by V_{BE} alone', { fs: 10.5, anchor: 'start', fill: C.navy, halo: true });
      /* knee + zero */
      var z = zeroVCB(vbe, early);
      if (!lowC) {
        o += '<circle cx="' + F.fx(z).toFixed(1) + '" cy="' + F.fy(0).toFixed(1) + '" r="3.5" fill="#fff" stroke="' + C.acc + '" stroke-width="1.6"/>';
        o += T(F.fx(z) + 2, F.fy(0) + 15, 'zero ' + fV(z) + ' V', { fs: 10, anchor: 'start', fill: C.acc, halo: true });
        o += T(F.fx(0) + 4, F.fy(model(vbe, -0.3, early).IC) + 16, '← knee', { fs: 10.5, anchor: 'start', fill: C.acc, halo: true });
      } else o += T(F.fx(0.4), F.fy(0) - 14, vbe === 0 && vcb === 0 ? 'equilibrium: I_C = 0' : 'cut-off: I_C ≈ 0', { fs: 10.5, anchor: 'start', fill: C.navy, halo: true });
      /* operating point */
      var yo = clamp(F.fy(m.IC), F.Y0, F.Y1);
      o += L(F.fx(vcb), F.Y1, F.fx(vcb), yo, C.acc, 1, ' stroke-dasharray="3 3"');
      o += '<circle cx="' + F.fx(vcb).toFixed(1) + '" cy="' + yo.toFixed(1) + '" r="6" fill="' + C.acc + '" stroke="#fff" stroke-width="2"/>';
      svgC.innerHTML = o;
    }
    function drawD(m, vbe, vcb) {
      var w = dims.d.w, h = dims.d.h, o = '', early = st.early;
      var xa = -0.65, xb = -0.45;                                   /* fixed knee window */
      var yb = disp.yD, ya = -1.0 * yb;
      var F = plotFrame(w, h, xa, xb, ya, yb, w < 480 ? 44 : 50, 40), K = 1e3;
      o += '<defs><clipPath id="' + uid + 'd"><rect x="' + F.X0 + '" y="' + F.Y0 + '" width="' + (F.X1 - F.X0) + '" height="' + (F.Y1 - F.Y0) + '"/></clipPath></defs>';
      o += R(F.X0, F.Y0, F.X1 - F.X0, F.Y1 - F.Y0, '#fdf6ee');
      [-0.65, -0.6, -0.55, -0.5, -0.45].forEach(function (t) { var x = F.fx(t); o += L(x, F.Y1, x, F.Y1 + 4, C.ink) + T(x, F.Y1 + 16, fmtTick(t), { fs: 10.5, anchor: 'middle', fill: C.grey }); o += L(x, F.Y0, x, F.Y1, '#f0e6da', 0.8); });
      ticks(ya * K, yb * K, 4).forEach(function (t) { var y = F.fy(t / K); if (y < F.Y0 - 1 || y > F.Y1 + 1) return; o += L(F.X0 - 4, y, F.X0, y, C.ink) + T(F.X0 - 6, y + 4, fmtTick(t), { fs: 10.5, anchor: 'end', fill: C.grey }); });
      o += L(F.X0, F.Y0, F.X0, F.Y1, C.ink) + L(F.X0, F.Y1, F.X1, F.Y1, C.ink);
      o += L(F.X0, F.fy(0), F.X1, F.fy(0), '#8a96a5', 0.9);
      o += T((F.X0 + F.X1) / 2, h - 6, 'V_{CB} (V)', { fs: 11.5, anchor: 'middle', fill: C.grey });
      o += T(12, (F.Y0 + F.Y1) / 2, 'I_C (mA)', { fs: 11.5, anchor: 'middle', rot: -90, fill: C.grey });
      /* -V_BE line */
      var xv = F.fx(-vbe);
      if (-vbe > xa && -vbe < xb) {
        o += L(xv, F.Y0, xv, F.Y1, C.grey, 1, ' stroke-dasharray="2 3"');
        o += T(xv - 3, F.Y0 + 12, '−V_{BE}', { fs: 10.5, anchor: 'end', fill: C.grey, halo: true });
      }
      o += '<g clip-path="url(#' + uid + 'd)">';
      o += P(polyIn(F, curve(vbe, xa, xb, early, true), ya, yb), C.grey, 1.4, ' stroke-dasharray="5 4"');
      o += P(polyIn(F, curve(vbe, xa, xb, early), ya, yb), C.navy, 2.6);
      o += '</g>';
      /* knee: second term = 10 % of the first (Sec. knee); zero of eq. (EMC) */
      var vk = -vbe + VT * Math.log(10 / AR);
      var mk = model(vbe, vk, early);
      var lowD = vbe < 0.45, z = zeroVCB(vbe, early), inZ = z > xa && z < xb;
      if (!lowD && inZ) {
        if (vk > xa && vk < xb) {
          o += '<circle cx="' + F.fx(vk).toFixed(1) + '" cy="' + F.fy(mk.IC).toFixed(1) + '" r="3.2" fill="' + C.acc + '"/>';
          o += T(F.fx(vk) + 6, F.fy(mk.IC) + 4, 'knee (−10 %)', { fs: 10, anchor: 'start', fill: C.acc, halo: true });
        }
        o += L(F.fx(z), F.Y0, F.fx(z), F.Y1, C.acc, 1, ' stroke-dasharray="4 3"');
        o += '<circle cx="' + F.fx(z).toFixed(1) + '" cy="' + F.fy(0).toFixed(1) + '" r="4.5" fill="#fff" stroke="' + C.acc + '" stroke-width="2"/>';
        var zr = F.fx(z) > (F.X0 + F.X1) / 2;
        o += T(F.fx(z) + (zr ? -6 : 6), F.fy(0) + 16, 'I_C = 0', { fs: 10.5, anchor: zr ? 'end' : 'start', fill: C.acc, fw: 700, halo: true });
      } else if (lowD) o += T((F.X0 + F.X1) / 2, F.fy(0) - 12, 'no injection from the emitter: no knee', { fs: 10.5, anchor: 'middle', fill: C.navy, halo: true });
      else o += T((F.X0 + F.X1) / 2, F.fy(0) - 12, 'zero at ' + fV(z) + ' V, outside this window', { fs: 10.5, anchor: 'middle', fill: C.acc, halo: true });
      o += T(F.X1 - 2, F.Y1 - 8, 'dashed: no holes into C (α_R = 1)', { fs: 9.5, anchor: 'end', fill: C.grey, halo: true });
      /* operating point */
      if (vcb >= xa && vcb <= xb) {
        var yo = clamp(F.fy(m.IC), F.Y0, F.Y1);
        o += '<circle cx="' + F.fx(vcb).toFixed(1) + '" cy="' + yo.toFixed(1) + '" r="6" fill="' + C.acc + '" stroke="#fff" stroke-width="2"/>';
      } else {
        var right = vcb > xb, ya2 = (F.fy(0) + F.Y1) / 2 - 6;
        o += right ? arrow(F.X1 - 34, ya2, F.X1 - 4, ya2, C.acc, 1.5, 6) : arrow(F.X0 + 34, ya2, F.X0 + 4, ya2, C.acc, 1.5, 6);
        o += T(right ? F.X1 - 38 : F.X0 + 38, ya2 + 4, 'op. point at ' + fV(vcb, 2) + ' V', { fs: 9.5, anchor: right ? 'end' : 'start', fill: C.acc, halo: true });
      }
      svgD.innerHTML = o;
      oZero.innerHTML = lowD ? 'no knee: the emitter does not inject' :
        '<b>' + mh('I_C') + ' = 0 at ' + mh('V_{CB}') + ' = ' + fV(z) + ' V</b> (−' + mh('V_{BE}') + ' + ' + mh('V_T') + ' ln(1/' + mh('α_R') + ')' + (early ? ', with ' + mh('W_B') + '(' + mh('V_{CB}') + ')' : '') + ') · now ' + mh('I_C') + ' = ' + (Math.abs(m.IC) < 5e-13 ? '0' : fmtI(m.IC));
    }

    /* ---------------- readouts and hint ---------------- */
    function readouts(m, vbe, vcb) {
      var sat = vcb < 0, rev = m.IC < 0;
      var low = vbe < 0.3 && vcb > -0.3, eqm = Math.abs(vbe) < 1e-3 && Math.abs(vcb) < 1e-3;
      var reg = eqm ? 'equilibrium' : low ? 'cut-off' : vcb >= 0 ? 'forward active' : (Math.abs(m.IC) < 0.03 * m.plateau && m.nW / m.n0 > 0.02 ? 'saturation, I_C ≈ 0' : (rev ? 'saturation, I_C reversed' : 'saturation (BC forward)'));
      var beta = m.IB > 0 ? (m.IC / m.IB) : NaN;
      roBox.innerHTML =
        '<div><small>' + mh('I_C') + ' (EMC)</small><b>' + fmtI(m.IC) + '</b></div>' +
        '<div><small>' + mh('I_B') + ' (EMB)</small><b>' + fmtI(m.IB) + '</b></div>' +
        '<div><small>' + mh('I_E') + ' = ' + mh('I_C') + ' + ' + mh('I_B') + '</small><b>' + fmtI(m.IE) + '</b></div>' +
        '<div><small>' + mh('I_C') + '/' + mh('I_B') + ' (' + mh('β_F') + ' = 121)</small><b>' + (isFinite(beta) ? beta.toFixed(beta < 10 ? 2 : 0).replace('-', '−') : '—') + '</b></div>' +
        '<div><small>' + mh('V_{CE}') + ' = ' + mh('V_{CB}') + ' + ' + mh('V_{BE}') + '</small><b>' + fV(vcb + vbe) + ' V</b></div>' +
        '<div class="w2"><small>' + mh('n') + '(0) / ' + mh('n') + '(' + mh('W_B') + ')</small><b>' + sciH(m.n0, 2) + ' / ' + (m.nW / m.n0 < 1e-3 ? '≈ 0' : sciH(m.nW, 1)) + '</b></div>' +
        '<div><small>' + mh('W_B') + '</small><b>' + (m.WB * 1e4).toFixed(3) + ' µm</b></div>' +
        '<div class="reg' + (sat ? ' sat' : '') + '"><small>region</small><b>' + mh(reg) + '</b></div>';
      var r = m.nW / m.n0, t = performance.now(), msg;
      if (eqm) {
        msg = '<b>Equilibrium, ' + mh('V_{BE}') + ' = ' + mh('V_{CB}') + ' = 0:</b> both junctions at equilibrium, the base holds only ' + mh('n_{B0}') + ' = 10<sup>4</sup> cm<sup>−3</sup> everywhere: no slope, no current.';
      } else if (low) {
        msg = '<b>Cut-off:</b> the EB junction is not forward biased enough to inject, the base line is practically empty (n(0) = ' + sciH(m.n0, 2) + ' cm<sup>−3</sup>): ' + mh('I_C') + ' and ' + mh('I_B') + ' are only leakage currents.';
      } else if (st.lastCtl === 'vbe' && t - st.lastT < 2500) {
        msg = '<b>' + mh('V_{BE}') + ' moves the emitter end:</b> ' + mh('n') + '(0) = ' + mh('n_{B0}') + 'e<sup>' + mh('V_{BE}') + '/' + mh('V_T') + '</sup>, ×2 every 18 mV, ×10 every 60 mV. ' + mh('V_{BE}') + ' alone sets the slope and the plateau.';
      } else if (vcb > 4 * VT) {
        msg = '<b>Reverse ' + mh('V_{CB}') + ': nothing changes.</b> The collector end stays at ≈ 0 whatever ' + mh('V_{CB}') + '; ' + mh('V_{BE}') + ' alone sets the slope and the plateau.' +
          (st.early ? ' (The slight tilt is the Early effect, Part E: ' + mh('W_B') + ' shrinks as the BC SCR widens.)' : '');
      } else if (r < 0.02) {
        msg = '<b>' + mh('V_{CB}') + ' near 0 or BC forward, yet the plateau holds:</b> ' + mh('n_{B0}') + 'e<sup>−' + mh('V_{CB}') + '/' + mh('V_T') + '</sup> = ' + (r * 100 < 0.01 ? '<0.01' : (r * 100).toFixed(2)) + ' % of ' + mh('n') + '(0), still negligible.';
      } else if (m.IC > 0.03 * m.plateau) {
        msg = '<b>' + mh('V_{CB}') + ' → −' + mh('V_{BE}') + ': the line flattens, ' + mh('I_C') + ' → 0.</b> The collector end rises to ' + (r * 100).toFixed(0) + ' % of ' + mh('n') + '(0): two pumps, and holes are injected into the collector.';
      } else if (m.IC > -0.03 * m.plateau) {
        msg = '<b>' + mh('I_C') + ' = 0 at ' + mh('V_{CB}') + ' = −' + mh('V_{BE}') + ' + ' + mh('V_T') + ' ln(1/' + mh('α_R') + '):</b> the residual electron slope is cancelled by the holes injected into the collector.';
      } else {
        msg = '<b>Beyond the zero:</b> the collector end is now the higher one; ' + mh('I_C') + ' reverses and the transistor works upside down.';
      }
      hint.innerHTML = msg;
      oV.textContent = fV(st.vbe) + ' V';
      oC.textContent = fV(st.vcb, 3) + ' V';
    }

    /* ---------------- loop ---------------- */
    var raf = 0, lastFrame = 0, geoA = null, lastSig = '';
    function kick() { if (!raf) { lastFrame = performance.now(); raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - lastFrame) / 1000); lastFrame = now;
      if (!root.isConnected) return;
      if (st.sweeping) {
        st.sweepT += dt;
        st.vcb = sweepV(st.sweepT); sC.value = st.vcb;
        if (st.sweepT >= SWEEP_T) { st.sweeping = false; syncButtons(); }
        disp.vcb = st.vcb;
      }
      var a = 1 - Math.exp(-dt / 0.07), moving = false;
      ['vbe', 'vcb'].forEach(function (k) {
        var d = st[k] - disp[k];
        if (Math.abs(d) > (k === 'vbe' ? 2e-5 : 1e-4)) { disp[k] += d * a; moving = true; } else disp[k] = st[k];
      });
      var vbe = disp.vbe, vcb = disp.vcb, m = model(vbe, vcb, st.early);
      // scales follow V_BE down to 0.5 V and freeze below (equilibrium, cut-off: the curves then sit at zero on a readable axis)
      var vs = Math.max(vbe, 0.5);
      var tB = 1.25 * model(vs, vcb, st.early).n0 / 1e14, tC = 1.18 * model(vs, 10, st.early).IC, tD = 1.15 * model(vs, 0, st.early).IC;
      if (!disp.yB) { disp.yB = tB; disp.yC = tC; disp.yD = tD; }
      [['yB', tB], ['yC', tC], ['yD', tD]].forEach(function (p) {
        var d = p[1] - disp[p[0]];
        if (Math.abs(d) > 1e-3 * p[1]) { disp[p[0]] += d * (1 - Math.exp(-dt / 0.12)); moving = true; } else disp[p[0]] = p[1];
      });
      var sig = [vbe, vcb, disp.yB, disp.yC, disp.yD, st.early].join('|');
      if (dirty || sig !== lastSig) {
        geoA = drawA(m, vbe, vcb); drawB(m, vbe, vcb); drawC(m, vbe, vcb); drawD(m, vbe, vcb);
        lastSig = sig; dirty = false;
      }
      readouts(m, vbe, vcb);
      stepParticles(dt * CARRIER * st.spd, m, geoA, vbe);
      kref();
      var hintLive = st.lastCtl === 'vbe' && now - st.lastT < 2600;
      if (moving || st.sweeping || st.flow || hintLive) raf = requestAnimationFrame(frame);
    }

    var rt = 0;
    function onResize() { clearTimeout(rt); rt = setTimeout(function () { if (!root.isConnected) { window.removeEventListener('resize', onResize); return; } layout(); kick(); }, 120); }
    window.addEventListener('resize', onResize);
    layout();
    kick();
  }

  window.IX = window.IX || {};
  window.IX[ID] = mount;
})();
