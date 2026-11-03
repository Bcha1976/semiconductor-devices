/* plot.js: a very small SVG plotting helper for the course widgets (no dependencies). */
(function (G) {
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceStep(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / p;
    return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * p;
  }
  function ticks(a, b, n) {
    var s = niceStep(b - a, n || 5), t = [], v = Math.ceil(a / s - 1e-9) * s;
    for (; v <= b + 1e-9 * s; v += s) t.push(Math.abs(v) < s * 1e-9 ? 0 : v);
    return t;
  }
  function fmtTick(v) {
    var a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1e4 || a < 1e-3) return sci(v, 0);
    return String(+v.toPrecision(4));
  }
  var SUP = {'-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'};
  function sup(s) { return String(s).split('').map(function (c) { return SUP[c] || c; }).join(''); }
  function sci(v, d) {
    if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; e += 1; }
    if (e >= -2 && e <= 3) return String(+v.toPrecision(Math.max(1, d + 1 + Math.max(0, e))));
    var ms = d === 0 && Math.abs(Math.abs(m) - 1) < 0.05 ? (m < 0 ? '−' : '') : m.toFixed(d).replace('-', '−') + '×';
    return ms + '10' + sup(e);
  }

  function Plot(parent, o) {
    this.o = o = Object.assign({w: 520, h: 300, m: [14, 16, 40, 58], x: [0, 1], y: [0, 1], xlog: false, ylog: false}, o);
    var wrap = document.createElement('div'); wrap.className = 'w-plot'; parent.appendChild(wrap);
    if (o.title) { var t = document.createElement('div'); t.className = 'ttl'; t.innerHTML = o.title; wrap.appendChild(t); }
    this.svg = el('svg', {viewBox: '0 0 ' + o.w + ' ' + o.h, role: 'img'}, wrap);
    if (o.aria) this.svg.setAttribute('aria-label', o.aria);
    this.wrap = wrap;
  }
  Plot.prototype = {
    setX: function (a, b) { this.o.x = [a, b]; },
    setY: function (a, b) { this.o.y = [a, b]; },
    sx: function (x) {
      var o = this.o, L = o.m[3], R = o.w - o.m[1];
      if (o.mapx) return L + (R - L) * o.mapx(x);
      var a = o.x[0], b = o.x[1];
      if (o.xlog) { x = Math.log10(x); a = Math.log10(a); b = Math.log10(b); }
      return L + (R - L) * (x - a) / (b - a);
    },
    sy: function (y) {
      var o = this.o, T = o.m[0], B = o.h - o.m[2], a = o.y[0], b = o.y[1];
      if (o.ylog) { y = Math.log10(Math.max(y, 1e-300)); a = Math.log10(a); b = Math.log10(b); }
      return B - (B - T) * (y - a) / (b - a);
    },
    clear: function () { while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild); this.clip(); return this; },
    clip: function () {
      var o = this.o, id = 'c' + Math.random().toString(36).slice(2);
      var d = el('defs', {}, this.svg), c = el('clipPath', {id: id}, d);
      el('rect', {x: o.m[3], y: o.m[0] - 2, width: o.w - o.m[1] - o.m[3], height: o.h - o.m[0] - o.m[2] + 4}, c);
      this.g = el('g', {'clip-path': 'url(#' + id + ')'});
      this.clipId = id;
    },
    axes: function (opt) {
      opt = opt || {};
      var o = this.o, s = this.svg, L = o.m[3], R = o.w - o.m[1], T = o.m[0], B = o.h - o.m[2], self = this;
      var g = el('g', {'font-size': 11, fill: '#444'}, s);
      var xt = opt.xticks || (o.xlog ? logTicks(o.x) : ticks(o.x[0], o.x[1], opt.nx || 6));
      var yt = opt.yticks || (o.ylog ? logTicks(o.y) : ticks(o.y[0], o.y[1], opt.ny || 5));
      var fx = opt.fx || fmtTick, fy = opt.fy || fmtTick;
      if (!opt.noygrid) yt.forEach(function (v) { el('line', {x1: L, x2: R, y1: self.sy(v), y2: self.sy(v), stroke: '#eef0f3'}, g); });
      if (!opt.noxgrid) xt.forEach(function (v) { el('line', {x1: self.sx(v), x2: self.sx(v), y1: T, y2: B, stroke: '#eef0f3'}, g); });
      if (!opt.noxaxis) {
        el('line', {x1: L, x2: R, y1: B, y2: B, stroke: '#888'}, g);
        xt.forEach(function (v) {
          var X = self.sx(v); el('line', {x1: X, x2: X, y1: B, y2: B + 4, stroke: '#888'}, g);
          var t = el('text', {x: X, y: B + 16, 'text-anchor': 'middle'}, g); t.textContent = fx(v);
        });
      }
      if (!opt.noyaxis) {
        el('line', {x1: L, x2: L, y1: T, y2: B, stroke: '#888'}, g);
        yt.forEach(function (v) {
          var Y = self.sy(v); el('line', {x1: L - 4, x2: L, y1: Y, y2: Y, stroke: '#888'}, g);
          var t = el('text', {x: L - 7, y: Y + 4, 'text-anchor': 'end'}, g); t.textContent = fy(v);
        });
      }
      if (opt.zero && o.y[0] < 0 && o.y[1] > 0) el('line', {x1: L, x2: R, y1: self.sy(0), y2: self.sy(0), stroke: '#999', 'stroke-dasharray': '2 3'}, g);
      if (o.xlabel) { var t = el('text', {x: (L + R) / 2, y: o.h - 6, 'text-anchor': 'middle', 'font-size': 12, fill: '#222'}, g); t.innerHTML = o.xlabel; }
      if (o.ylabel) { var t2 = el('text', {x: 13, y: (T + B) / 2, 'text-anchor': 'middle', 'font-size': 12, fill: '#222', transform: 'rotate(-90 13 ' + (T + B) / 2 + ')'}, g); t2.innerHTML = o.ylabel; }
      s.appendChild(this.g);
      return this;
    },
    path: function (pts, st) {
      var self = this, d = '', pen = false;
      pts.forEach(function (p) {
        if (p === null || !isFinite(p[1]) || !isFinite(p[0])) { pen = false; return; }
        d += (pen ? 'L' : 'M') + self.sx(p[0]).toFixed(2) + ',' + self.sy(p[1]).toFixed(2); pen = true;
      });
      return d;
    },
    line: function (pts, st) {
      st = st || {};
      return el('path', {d: this.path(pts), fill: 'none', stroke: st.color || '#1F3A5F', 'stroke-width': st.width || 2,
        'stroke-dasharray': st.dash, opacity: st.opacity, 'stroke-linejoin': 'round'}, st.top ? this.svg : this.g);
    },
    area: function (pts, base, st) {
      st = st || {};
      if (!pts.length) return;
      var d = this.path(pts) + 'L' + this.sx(pts[pts.length - 1][0]).toFixed(2) + ',' + this.sy(base).toFixed(2) +
        'L' + this.sx(pts[0][0]).toFixed(2) + ',' + this.sy(base).toFixed(2) + 'Z';
      return el('path', {d: d, fill: st.fill || 'rgba(31,58,95,.15)', stroke: 'none', opacity: st.opacity}, this.g);
    },
    areaX: function (pts, base, st) { // filled area between curve x(y) and x = base (for horizontal densities)
      st = st || {};
      var self = this, d = '';
      pts.forEach(function (p, i) { d += (i ? 'L' : 'M') + self.sx(p[0]).toFixed(2) + ',' + self.sy(p[1]).toFixed(2); });
      d += 'L' + this.sx(base) + ',' + this.sy(pts[pts.length - 1][1]) + 'L' + this.sx(base) + ',' + this.sy(pts[0][1]) + 'Z';
      return el('path', {d: d, fill: st.fill, stroke: 'none'}, this.g);
    },
    rect: function (x0, y0, x1, y1, st) {
      st = st || {};
      var X0 = this.sx(x0), X1 = this.sx(x1), Y0 = this.sy(y0), Y1 = this.sy(y1);
      return el('rect', {x: Math.min(X0, X1), y: Math.min(Y0, Y1), width: Math.abs(X1 - X0), height: Math.abs(Y1 - Y0),
        fill: st.fill || 'rgba(0,0,0,.05)', stroke: st.stroke, 'stroke-width': st.width}, st.top ? this.svg : this.g);
    },
    vline: function (x, st) { st = st || {}; var o = this.o; return el('line', {x1: this.sx(x), x2: this.sx(x), y1: o.m[0], y2: o.h - o.m[2], stroke: st.color || '#999', 'stroke-width': st.width || 1, 'stroke-dasharray': st.dash}, this.g); },
    hline: function (y, st) { st = st || {}; var o = this.o; return el('line', {x1: o.m[3], x2: o.w - o.m[1], y1: this.sy(y), y2: this.sy(y), stroke: st.color || '#999', 'stroke-width': st.width || 1, 'stroke-dasharray': st.dash}, this.g); },
    seg: function (x0, y0, x1, y1, st) { st = st || {}; return el('line', {x1: this.sx(x0), y1: this.sy(y0), x2: this.sx(x1), y2: this.sy(y1), stroke: st.color || '#333', 'stroke-width': st.width || 1.5, 'stroke-dasharray': st.dash, 'marker-end': st.arrow ? this.arrow(st.color || '#333') : null}, st.top ? this.svg : this.g); },
    arrow: function (color) {
      var id = 'a' + color.replace(/[^a-z0-9]/gi, '') + this.clipId;
      if (!this.svg.querySelector('#' + id)) {
        var d = this.svg.querySelector('defs'), m = el('marker', {id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'}, d);
        el('path', {d: 'M0,0L10,5L0,10z', fill: color}, m);
      }
      return 'url(#' + id + ')';
    },
    dot: function (x, y, st) { st = st || {}; return el('circle', {cx: this.sx(x), cy: this.sy(y), r: st.r || 4, fill: st.fill || '#D9771A', stroke: st.stroke || '#fff', 'stroke-width': st.sw || 1.5}, st.clip ? this.g : this.svg); },
    text: function (x, y, s, st) {
      st = st || {};
      var t = el('text', {x: (st.px ? x : this.sx(x)) + (st.dx || 0), y: (st.py ? y : this.sy(y)) + (st.dy || 0), 'text-anchor': st.anchor || 'start',
        'font-size': st.size || 11.5, fill: st.color || '#222', 'font-weight': st.bold ? 700 : null, 'font-style': st.italic ? 'italic' : null}, this.svg);
      t.innerHTML = s; return t;
    },
    raw: function (tag, attrs, top) { return el(tag, attrs, top ? this.svg : this.g); }
  };
  function logTicks(r) {
    var t = [], a = Math.ceil(Math.log10(r[0]) - 1e-9), b = Math.floor(Math.log10(r[1]) + 1e-9), step = Math.max(1, Math.ceil((b - a) / 7));
    for (var e = a; e <= b; e += step) t.push(Math.pow(10, e));
    return t;
  }

  /* controls */
  function slider(parent, o, onchange) {
    var box = document.createElement('div'); box.className = 'w-ctl';
    var lab = document.createElement('label'), name = document.createElement('span'), val = document.createElement('b');
    name.innerHTML = o.label; lab.appendChild(name); lab.appendChild(val);
    var inp = document.createElement('input'); inp.type = 'range';
    var log = !!o.log;
    inp.min = log ? Math.log10(o.min) : o.min; inp.max = log ? Math.log10(o.max) : o.max;
    inp.step = o.step || (log ? 0.01 : (o.max - o.min) / 200);
    inp.value = log ? Math.log10(o.value) : o.value;
    inp.setAttribute('aria-label', o.label.replace(/<[^>]+>/g, ''));
    box.appendChild(lab); box.appendChild(inp); parent.appendChild(box);
    var api = {
      get value() { var v = +inp.value; return log ? Math.pow(10, v) : v; },
      set: function (v) { inp.value = log ? Math.log10(v) : v; show(); },
      el: box
    };
    function show() { val.innerHTML = o.fmt ? o.fmt(api.value) : (+api.value.toPrecision(3)); }
    inp.addEventListener('input', function () { show(); onchange(); });
    show();
    return api;
  }
  function seg(parent, o, onchange) {
    var box = document.createElement('div'); box.className = 'w-ctl';
    var lab = document.createElement('label'); lab.innerHTML = '<span>' + o.label + '</span>'; box.appendChild(lab);
    var row = document.createElement('div'); row.className = 'w-seg'; box.appendChild(row);
    var api = {value: o.value, el: box, buttons: []};
    o.options.forEach(function (op) {
      var b = document.createElement('button'); b.type = 'button'; b.innerHTML = op[1];
      b.className = op[0] === o.value ? 'on' : '';
      b.onclick = function () { api.value = op[0]; api.buttons.forEach(function (x) { x.className = ''; }); b.className = 'on'; onchange(); };
      api.buttons.push(b); row.appendChild(b);
    });
    parent.appendChild(box);
    return api;
  }
  function div(parent, cls, html) { var d = document.createElement('div'); if (cls) d.className = cls; if (html) d.innerHTML = html; parent.appendChild(d); return d; }

  G.WP = {Plot: Plot, slider: slider, seg: seg, div: div, sci: sci, sup: sup, ticks: ticks, el: el};
})(window);
