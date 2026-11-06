/* Shared helpers for the interactive modules (website v2, Handoff 4).
   window.IX._kit.controls(cfg): synchronised copies of the essential controls (bias sliders, regime buttons
   Forward / Equilibrium (0 V) / Reverse, carrier Speed), one strip next to each figure panel.
   window.IX._kit.slice(svg, cuts, makeStrip): shows one tall SVG as several horizontal slices (the extra slices
   re-use the same drawing through <use>), so that a control strip can sit right under each panel.
   Loaded before the modules; every module still works if it is missing (no strips then). */
(function () {
  'use strict';
  window.IX = window.IX || {};
  if (window.IX._kit) return;
  var NS = 'http://www.w3.org/2000/svg', XL = 'http://www.w3.org/1999/xlink';
  var CSS = [
    '.ixk-strip{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:6px 0 10px;padding:6px 10px;background:#f6f8fb;border:1px solid #dde3ea;border-radius:6px;font:13px/1.3 "DejaVu Sans","Segoe UI",system-ui,sans-serif;color:#1d2430}',
    '.ixk-strip.in{margin:0;border-width:1px 0;border-radius:0}',
    '.ixk-strip.top{background:#fff;flex:1 1 100%;margin:4px 0 6px}',
    '.ixk-tag{font-size:11px;font-weight:700;letter-spacing:.06em;color:#6B6B6B;text-transform:uppercase;white-space:nowrap}',
    '.ixk-regs{display:flex;flex-wrap:wrap;gap:5px}',
    '.ixk-strip button.ixk-r{font:600 12.5px/1.2 inherit;font-family:inherit;padding:5px 9px;border:1px solid #c6d2e0;border-radius:6px;background:#fff;color:#1F3A5F;cursor:pointer;white-space:nowrap}',
    '.ixk-strip button.ixk-r:hover{border-color:#1F3A5F}',
    '.ixk-strip button.ixk-r.on{background:#1F3A5F;color:#fff;border-color:#1F3A5F}',
    '.ixk-strip button.ixk-r[data-k="0"].on{background:#D9771A;border-color:#D9771A}',
    '.ixk-sl{display:flex;align-items:center;gap:7px;flex:1 1 150px;min-width:0}',
    '.ixk-sl>span.l{white-space:nowrap;color:#1d2430}',
    '.ixk-sl>input{flex:1 1 80px;min-width:60px;width:auto;accent-color:#D9771A;margin:0}',
    '.ixk-sl>b{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;min-width:4.6em;text-align:right}',
    '.ixk-sl.sp{flex:0 1 165px}',
    '.ixk-sl.sp>b{min-width:3.2em}',
    '.ixk-strip i{font-style:italic}.ixk-strip sub,.ixk-strip sup{font-size:.72em;line-height:0}',
    '.ixk-slice{display:block;width:100%;height:auto}',
    '@media (max-width:520px){.ixk-strip{padding:6px 7px;gap:6px 8px}.ixk-strip button.ixk-r{padding:5px 7px;font-size:12px}.ixk-sl{flex-basis:100%}.ixk-sl.sp{flex-basis:100%}}'
  ].join('\n');
  function css() {
    if (document.getElementById('ix-kit-css')) return;
    var s = document.createElement('style'); s.id = 'ix-kit-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  var nid = 0;

  /* cfg = { sliders:[{key,label,min,max,step,get(),set(v),fmt(v),title}], regimes:[{label,title,apply(),is()}],
             speed:{get(),set(v)} (0.25..2), onAny() } */
  function controls(cfg) {
    css();
    var strips = [];
    function fire() { if (cfg.onAny) cfg.onAny(); refresh(); }
    function strip(o) {
      o = o || {};
      var d = document.createElement('div');
      d.className = 'ixk-strip' + (o.inside ? ' in' : '') + (o.top ? ' top' : '');
      var parts = { sl: [], rb: [], sp: null };
      if (o.tag) { var t = document.createElement('span'); t.className = 'ixk-tag'; t.innerHTML = o.tag; d.appendChild(t); }
      if (cfg.regimes && o.regimes !== false) {
        var g = document.createElement('div'); g.className = 'ixk-regs';
        cfg.regimes.forEach(function (r, k) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'ixk-r';
          b.setAttribute('data-k', k === 1 ? '0' : k); b.innerHTML = r.label; if (r.title) b.title = r.title;
          b.addEventListener('click', function () { r.apply(); fire(); });
          g.appendChild(b); parts.rb.push(b);
        });
        d.appendChild(g);
      }
      if (cfg.sliders && o.sliders !== false) {
        cfg.sliders.forEach(function (s) {
          if (o.only && o.only.indexOf(s.key) < 0) return;
          var w = document.createElement('label'); w.className = 'ixk-sl';
          if (s.title) w.title = s.title;
          var l = document.createElement('span'); l.className = 'l'; l.innerHTML = s.label;
          var i = document.createElement('input'); i.type = 'range'; i.min = s.min; i.max = s.max; i.step = s.step;
          i.value = s.get(); i.setAttribute('data-key', s.key);
          i.setAttribute('aria-label', (s.aria || s.key));
          var v = document.createElement('b');
          i.addEventListener('input', function () { s.set(+i.value); fire(); });
          w.appendChild(l); w.appendChild(i); w.appendChild(v); d.appendChild(w);
          parts.sl.push({ s: s, i: i, v: v });
        });
      }
      if (cfg.speed && o.speed !== false) {
        var w2 = document.createElement('label'); w2.className = 'ixk-sl sp';
        w2.title = 'Speed of the moving carriers (1× is the default, already slowed down to be easy to follow)';
        var l2 = document.createElement('span'); l2.className = 'l'; l2.textContent = 'Speed';
        var i2 = document.createElement('input'); i2.type = 'range'; i2.min = -2; i2.max = 1; i2.step = 0.25;
        i2.setAttribute('data-key', 'speed'); i2.setAttribute('aria-label', 'Speed of the carriers');
        var v2 = document.createElement('b');
        i2.addEventListener('input', function () { cfg.speed.set(Math.pow(2, +i2.value)); fire(); });
        w2.appendChild(l2); w2.appendChild(i2); w2.appendChild(v2); d.appendChild(w2);
        parts.sp = { i: i2, v: v2 };
      }
      d._ixk = parts;
      strips.push(d);
      upd(d);
      return d;
    }
    function upd(d) {
      var p = d._ixk;
      p.sl.forEach(function (o) {
        var x = o.s.get();
        if (document.activeElement !== o.i || Math.abs(+o.i.value - x) > 1e-9) o.i.value = x;
        var t = o.s.fmt ? o.s.fmt(x) : String(x);
        if (o.v._t !== t) { o.v.innerHTML = t; o.v._t = t; }
      });
      if (cfg.regimes) p.rb.forEach(function (b, k) { var on = !!(cfg.regimes[k].is && cfg.regimes[k].is()); if (b._on !== on) { b.classList.toggle('on', on); b._on = on; } });
      if (p.sp) {
        var s = cfg.speed.get(), lv = Math.log(s) / Math.LN2;
        if (Math.abs(+p.sp.i.value - lv) > 1e-6) p.sp.i.value = lv;
        var ts = (s < 1 ? s.toFixed(2) : s.toFixed(s % 1 ? 1 : 0)) + '×';
        if (p.sp.v._t !== ts) { p.sp.v.textContent = ts; p.sp.v._t = ts; }
      }
    }
    function refresh() {
      strips = strips.filter(function (d) { return d.isConnected || !d._seen; });
      strips.forEach(function (d) { if (d.isConnected) d._seen = true; upd(d); });
    }
    return { strip: strip, refresh: refresh };
  }

  /* Show svg (viewBox 0 0 W H) as slices cut at the y values in cuts; makeStrip(k) returns the element shown
     after slice k (or null). Extra slices are <svg><use href="#all"/></svg> copies of the same drawing. */
  function slice(svg, cuts, makeStrip) {
    css();
    if (svg._ixkx) svg._ixkx.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
    svg._ixkx = [];
    var vb = svg.getAttribute('viewBox').split(/[ ,]+/).map(Number);
    var W = vb[2], H = svg._ixkFull === vb.join(' ') ? svg._ixkH : vb[3]; // re-slicing an already sliced svg keeps its full height
    var g = null;
    for (var c = svg.firstChild; c; c = c.nextSibling) if (c.nodeType === 1 && c.getAttribute('data-ixk') === 'all') g = c;
    if (!g) {
      g = document.createElementNS(NS, 'g'); g.setAttribute('data-ixk', 'all');
      while (svg.firstChild) g.appendChild(svg.firstChild);
      svg.appendChild(g);
    } else {
      // children added directly to the svg since the last slicing go into the group
      var extra = []; for (var c2 = svg.firstChild; c2; c2 = c2.nextSibling) if (c2 !== g) extra.push(c2);
      extra.forEach(function (e) { g.appendChild(e); });
    }
    if (!g.id) g.id = 'ixk-all-' + (++nid);
    var ys = [0].concat(cuts.filter(function (y) { return y > 0 && y < H; })).concat([H]);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + ys[1]);
    svg.setAttribute('height', ys[1]); svg.setAttribute('width', W); svg.style.overflow = 'hidden';
    svg._ixkH = H; svg._ixkFull = '0 0 ' + W + ' ' + ys[1];
    var after = svg;
    function put(e) { after.parentNode.insertBefore(e, after.nextSibling); after = e; svg._ixkx.push(e); }
    for (var k = 1; k < ys.length - 1; k++) {
      var st = makeStrip ? makeStrip(k - 1) : null;
      if (st) put(st);
      var s2 = document.createElementNS(NS, 'svg'), h = ys[k + 1] - ys[k];
      s2.setAttribute('viewBox', '0 ' + ys[k] + ' ' + W + ' ' + h);
      s2.setAttribute('width', W); s2.setAttribute('height', h);
      s2.setAttribute('class', (svg.getAttribute('class') || '') + ' ixk-slice');
      s2.setAttribute('aria-hidden', 'true'); s2.style.overflow = 'hidden';
      var u = document.createElementNS(NS, 'use');
      u.setAttribute('href', '#' + g.id); u.setAttributeNS(XL, 'xlink:href', '#' + g.id);
      s2.appendChild(u);
      put(s2);
    }
    if (makeStrip) { var last = makeStrip(ys.length - 2); if (last) put(last); }
    return ys;
  }

  window.IX._kit = { controls: controls, slice: slice, css: css };
})();
