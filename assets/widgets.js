/* widgets.js: the interactive figures of the course. Models and numbers are those of the chapters:
   silicon at 300 K, kT/q = 25.9 mV, n_i = 1e10 cm^-3 (reference value), mu_n = 1350, mu_p = 460 cm^2/Vs,
   D_n = 35, D_p = 12 cm^2/s, eps = 1.036e-12 F/cm. Carrier densities are drawn on linear axes (Ch4-8 convention). */
(function () {
  var P = WP.Plot, S = WP.slider, SEG = WP.seg, D = WP.div, sci = WP.sci;
  var q = 1.602e-19, kB = 8.617e-5, VT = 0.0259, ni = 1e10, eps = 1.036e-12, Eg = 1.12,
      NC300 = 2.8e19, NV300 = 1.04e19, Dn = 35, Dp = 12, m0 = 9.11e-31;
  var BLUE = '#1F4E9A', ORANGE = '#C8641E', GREEN = '#2E7D4F', NAVY = '#1F3A5F', ACC = '#D9771A', GREY = '#8a929c';
  function s2(v) { return sci(v, 2); }
  function s1(v) { return sci(v, 1); }
  function ts(v) { return sci(v, 1).replace('.0×', '×').replace(/^1×/, ''); }
  function f(v, d) { return (+v).toFixed(d === undefined ? 3 : d).replace('-', '−'); }
  function read(el, items) { el.innerHTML = items.map(function (i) { return '<span>' + i[0] + ' = <b>' + i[1] + '</b></span>'; }).join(''); }
  function linspace(a, b, n) { var r = []; for (var i = 0; i < n; i++) r.push(a + (b - a) * i / (n - 1)); return r; }
  function logerfc(z) { // log of erfc(z) for z >= 0 (Numerical Recipes erfcc, rel. error < 1.2e-7)
    var t = 1 / (1 + 0.5 * z);
    return Math.log(t) - z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))));
  }
  function erfc(z) { return z >= 0 ? Math.exp(logerfc(z)) : 2 - Math.exp(logerfc(-z)); }
  function F12(eta) { // normalised Fermi-Dirac integral (2/sqrt(pi)) int sqrt(x)/(1+exp(x-eta)) dx
    var top = Math.max(eta, 0) + 40, n = 600, h = top / n, s = 0;
    for (var i = 1; i <= n; i++) { var x = (i - 0.5) * h; s += Math.sqrt(x) / (1 + Math.exp(x - eta)); }
    return s * h * 2 / Math.sqrt(Math.PI);
  }
  var W = {};

  /* ------------------------------------------------------------------ Ch1: drift and diffusion */
  W['drift-diff'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots one'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var kind = SEG(ctl, {label: 'Carriers', value: 'n', options: [['n', 'Electrons (μ<sub>n</sub> = 1350)'], ['p', 'Holes (μ<sub>p</sub> = 460)']]}, reset);
    var E = S(ctl, {label: 'Field 𝓔 (pointing to +x)', min: 0, max: 5000, step: 50, value: 1000, fmt: function (v) { return f(v / 1000, 2) + ' kV/cm'; }}, reset);
    var btn = document.createElement('button'); btn.className = 'w-btn'; btn.textContent = 'Restart'; btn.onclick = reset; ctl.appendChild(btn);
    var pl = new P(plots, {w: 640, h: 300, m: [10, 12, 36, 50], x: [-1500, 1500], y: [-700, 700], xlabel: 'x (nm)', ylabel: 'y (nm)',
      title: 'A cloud of carriers released at x = 0: each one moves at the thermal speed and collides every τ<sub>c</sub> on average'});
    note.innerHTML = 'Drude model of Chapter 1 with the free-electron mass m<sub>0</sub>: τ<sub>c</sub> = μm<sub>0</sub>/q, v<sub>th</sub> = √(3kT/m<sub>0</sub>) = 1.17×10⁵ m/s. ' +
      'The cloud is followed for 300 τ<sub>c</sub>. The dashed circle has the radius √(2Dt) predicted with the Einstein relation D = μkT/q; the cross marks the predicted drift μ𝓔t.';
    var N = 220, parts, t, mu, tc, vth = Math.sqrt(3 * 1.381e-23 * 300 / m0), dots = [], anim, sign;
    function iso() { var c = 2 * Math.random() - 1, ph = 2 * Math.PI * Math.random(), s = Math.sqrt(1 - c * c); return [vth * s * Math.cos(ph), vth * s * Math.sin(ph), vth * c]; }
    function reset() {
      mu = kind.value === 'n' ? 1350 : 460; sign = kind.value === 'n' ? -1 : 1;
      tc = mu * 1e-4 * m0 / q; t = 0; parts = [];
      for (var i = 0; i < N; i++) parts.push({x: 0, y: 0, v: iso()});
      pl.clear(); pl.axes({nx: 6, ny: 4});
      pl.vline(0, {color: '#bbb', dash: '3 3'});
      pl.seg(900, 600, 1400, 600, {color: GREEN, width: 2, arrow: true});
      pl.text(1150, 600, '𝓔', {anchor: 'middle', dy: -6, color: GREEN, bold: true, size: 13});
      pl.pred = pl.raw('circle', {fill: 'none', stroke: NAVY, 'stroke-dasharray': '5 4', 'stroke-width': 1.4});
      pl.cross = pl.raw('path', {stroke: ACC, 'stroke-width': 2.5, fill: 'none'});
      pl.cen = pl.raw('circle', {r: 5, fill: '#fff', stroke: '#111', 'stroke-width': 2});
      dots = parts.map(function () { return pl.raw('circle', {r: 2.6, fill: kind.value === 'n' ? BLUE : '#fff', stroke: kind.value === 'n' ? 'none' : ORANGE, 'stroke-width': 1.2}); });
      if (!anim) anim = requestAnimationFrame(step);
    }
    function step() {
      anim = null;
      var dt = tc / 10, a = sign * q * E.value * 100 / m0, tmax = 300 * tc, nsteps = Math.round(tmax / dt / 360);
      for (var k = 0; k < nsteps && t < tmax; k++) {
        for (var i = 0; i < N; i++) {
          var p = parts[i];
          p.v[0] += a * dt;
          if (Math.random() < dt / tc) p.v = iso();
          p.x += p.v[0] * dt * 1e9; p.y += p.v[1] * dt * 1e9;
        }
        t += dt;
      }
      var mx = 0, my = 0, sx = 0, sy = 0;
      parts.forEach(function (p) { mx += p.x; my += p.y; }); mx /= N; my /= N;
      parts.forEach(function (p) { sx += (p.x - mx) * (p.x - mx); sy += (p.y - my) * (p.y - my); }); sx /= N; sy /= N;
      parts.forEach(function (p, i) { dots[i].setAttribute('cx', pl.sx(p.x)); dots[i].setAttribute('cy', pl.sy(p.y)); });
      var Dth = mu * VT * 1e-4, R = Math.sqrt(2 * Dth * t) * 1e9, xd = sign * mu * 1e-4 * E.value * 100 * t * 1e9;
      pl.pred.setAttribute('cx', pl.sx(xd)); pl.pred.setAttribute('cy', pl.sy(0));
      pl.pred.setAttribute('r', Math.abs(pl.sx(R) - pl.sx(0)));
      var X = pl.sx(xd), Y = pl.sy(0); pl.cross.setAttribute('d', 'M' + (X - 7) + ',' + (Y - 7) + 'L' + (X + 7) + ',' + (Y + 7) + 'M' + (X - 7) + ',' + (Y + 7) + 'L' + (X + 7) + ',' + (Y - 7));
      pl.cen.setAttribute('cx', pl.sx(mx)); pl.cen.setAttribute('cy', pl.sy(my));
      var vd = mu * E.value * 1e-2; // m/s
      var Dsim = t > 0 ? (sx + sy) / 2 * 1e-18 / (2 * t) * 1e4 : 0;
      read(rd, [['t', f(t * 1e12, 1) + ' ps = ' + Math.round(t / tc) + ' τ<sub>c</sub>'], ['τ<sub>c</sub>', f(tc * 1e15, 0) + ' fs'],
        ['mean free path l', f(vth * tc * 1e9, 1) + ' nm'], ['v<sub>d</sub> = μ𝓔', s2(vd) + ' m/s'], ['v<sub>d</sub>/v<sub>th</sub>', f(vd / vth, 3)],
        ['drift of the centre', f(mx, 0) + ' nm (predicted ' + f(xd, 0) + ')'], ['D from the spread', f(Dsim, 1) + ' cm²/s'],
        ['D = μkT/q', f(Dth * 1e4, 1) + ' cm²/s']]);
      if (t < 300 * tc) anim = requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && t === 0) step(); });
    reset(); io.observe(root);
  };

  /* ------------------------------------------------------------------ Ch3: Fermi-Dirac and the densities */
  W['fermi-dirac'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var dE = S(ctl, {label: 'E<sub>F</sub> − E<sub>i</sub>', min: -0.5, max: 0.5, step: 0.005, value: 0, fmt: function (v) { return f(v, 3) + ' eV'; }}, draw);
    var T = S(ctl, {label: 'Temperature T', min: 100, max: 600, step: 5, value: 300, fmt: function (v) { return v + ' K'; }}, draw);
    var p1 = new P(plots, {w: 300, h: 340, m: [12, 14, 38, 50], x: [0, 1], y: [-0.4, 1.52], xlabel: 'occupation f(E)', ylabel: 'E − E<tspan baseline-shift="sub" font-size="9">V</tspan> (eV)', title: '(a) The Fermi–Dirac function'});
    var p2 = new P(plots, {w: 300, h: 340, m: [12, 14, 38, 50], x: [0, 1], y: [-0.4, 1.52], xlabel: 'states and carriers per eV (scaled)', ylabel: '', title: '(b) Density of states and the carriers'});
    note.innerHTML = 'E<sub>V</sub> = 0, E<sub>C</sub> = 1.12 eV (gap held constant), N<sub>C</sub>, N<sub>V</sub> = 2.8×10¹⁹, 1.04×10¹⁹ cm⁻³ at 300 K, ∝ T<sup>3/2</sup>. ' +
      'The densities are the areas under n(E) = g<sub>C</sub>f and p(E) = g<sub>V</sub>(1 − f), computed with the full Fermi–Dirac function. The filled curves are magnified by the factor written on them: the carriers are a tiny tail of the states.';
    function draw() {
      var kT = kB * T.value, NC = NC300 * Math.pow(T.value / 300, 1.5), NV = NV300 * Math.pow(T.value / 300, 1.5);
      var Ei = Eg / 2 + kT / 2 * Math.log(NV / NC), EF = Ei + dE.value, EC = Eg, EV = 0;
      var n = NC * F12((EF - EC) / kT), p = NV * F12((EV - EF) / kT), nI = Math.sqrt(NC * NV) * Math.exp(-Eg / (2 * kT));
      [p1, p2].forEach(function (pl, k) {
        pl.clear(); pl.rect(k ? 0 : 0, EC, 1, 1.52, {fill: 'rgba(31,78,154,.07)'}); pl.rect(0, -0.4, 1, EV, {fill: 'rgba(200,100,30,.07)'});
        pl.axes({noxgrid: true, fy: function (v) { return f(v, 1); }, xticks: k ? [] : [0, 0.5, 1]});
        pl.hline(EC, {color: '#333', width: 1.5}); pl.hline(EV, {color: '#333', width: 1.5});
        pl.hline(Ei, {color: GREY, dash: '1 3'}); pl.hline(EF, {color: ACC, width: 1.8, dash: '6 4'});
        pl.text(1, EC, 'E<tspan baseline-shift="sub" font-size="8">C</tspan>', {anchor: 'end', dy: -4, dx: -4});
        pl.text(1, EV, 'E<tspan baseline-shift="sub" font-size="8">V</tspan>', {anchor: 'end', dy: 13, dx: -4});
        pl.text(0, EF, 'E<tspan baseline-shift="sub" font-size="8">F</tspan>', {dy: -4, dx: 4, color: ACC, bold: true});
      });
      var Es = linspace(-0.4, 1.52, 400);
      p1.line(Es.map(function (E) { return [1 / (1 + Math.exp((E - EF) / kT)), E]; }), {color: NAVY});
      // densities of states and carriers
      var gc = function (E) { return E > EC ? Math.sqrt(E - EC) : 0; }, gv = function (E) { return E < EV ? Math.sqrt(EV - E) : 0; };
      var gmax = Math.sqrt(0.4);
      p2.line(Es.filter(function (E) { return E >= EC; }).map(function (E) { return [0.95 * gc(E) / gmax, E]; }), {color: '#777', dash: '4 3', width: 1.3});
      p2.line(Es.filter(function (E) { return E <= EV; }).map(function (E) { return [0.95 * gv(E) / gmax, E]; }), {color: '#777', dash: '4 3', width: 1.3});
      function band(g, occ, color, lab, above) {
        var pts = Es.map(function (E) { return [g(E) * occ(E), E]; }), mx = 0;
        pts.forEach(function (pp) { mx = Math.max(mx, pp[0]); });
        if (!(mx > 0)) return;
        var M = 0.8 * gmax / mx; // magnification relative to the g scale
        var sc = pts.map(function (pp) { return [0.95 * pp[0] * M / gmax, pp[1]]; }).filter(function (pp) { return above ? pp[1] >= EC : pp[1] <= EV; });
        p2.areaX(sc, 0, {fill: color === BLUE ? 'rgba(31,78,154,.35)' : 'rgba(200,100,30,.35)'});
        p2.line(sc, {color: color, width: 1.6});
        var Mtxt = M > 1.5 ? '× ' + s1(M) : '× ' + f(M, 2);
        p2.text(0.5, above ? EC + 0.3 : EV - 0.25, lab + ' ' + Mtxt, {color: color, bold: true});
      }
      band(gc, function (E) { return 1 / (1 + Math.exp((E - EF) / kT)); }, BLUE, 'n(E)', true);
      band(gv, function (E) { return 1 - 1 / (1 + Math.exp((E - EF) / kT)); }, ORANGE, 'p(E)', false);
      p2.text(0.97 * Math.sqrt(0.35) / gmax, EC + 0.36, 'g<tspan baseline-shift="sub" font-size="8">C</tspan>', {color: '#555', anchor: 'end', dx: -6});
      p2.text(0.97 * Math.sqrt(0.35) / gmax, EV - 0.33, 'g<tspan baseline-shift="sub" font-size="8">V</tspan>', {color: '#555', anchor: 'end', dx: -6});
      var deg = (EC - EF) < 3 * kT || (EF - EV) < 3 * kT;
      read(rd, [['n', s2(n) + ' cm⁻³'], ['p', s2(p) + ' cm⁻³'], ['n·p', s2(n * p) + ' cm⁻⁶'], ['n<sub>i</sub>²', s2(nI * nI)],
        ['n<sub>i</sub>', s2(nI) + ' cm⁻³'], ['kT', f(kT * 1000, 1) + ' meV'], ['E<sub>C</sub> − E<sub>F</sub>', f(EC - EF, 3) + ' eV'],
        ['regime', deg ? '<span style="color:#A33A3A">E<sub>F</sub> within 3kT of a band: degenerate</span>' : 'nondegenerate, n·p = n<sub>i</sub>²']]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ Ch3: E_F against doping and temperature */
  W['fermi-doping'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var typ = SEG(ctl, {label: 'Dopant', value: 'D', options: [['D', 'Donors (n-type)'], ['A', 'Acceptors (p-type)']]}, draw);
    var Nd = S(ctl, {label: 'Doping', min: 1e13, max: 1e18, log: true, value: 1e16, fmt: function (v) { return s1(v) + ' cm⁻³'; }}, draw);
    var T = S(ctl, {label: 'Temperature T', min: 20, max: 800, step: 5, value: 300, fmt: function (v) { return v + ' K'; }}, draw);
    var p1 = new P(plots, {w: 330, h: 300, m: [12, 14, 38, 52], x: [0, 800], y: [0, 2], xlabel: 'T (K)', ylabel: 'majority density / doping', title: '(a) The majority carriers'});
    var p2 = new P(plots, {w: 330, h: 300, m: [12, 14, 38, 52], x: [0, 800], y: [-0.05, 1.17], xlabel: 'T (K)', ylabel: 'E − E<tspan baseline-shift="sub" font-size="9">V</tspan> (eV)', title: '(b) The Fermi level'});
    note.innerHTML = 'Neutrality n + N<sub>A</sub><sup>−</sup> = p + N<sub>D</sub><sup>+</sup>, with N<sub>D</sub><sup>+</sup> = N<sub>D</sub>/[1 + 2e<sup>(E<sub>F</sub>−E<sub>D</sub>)/kT</sup>], E<sub>C</sub> − E<sub>D</sub> = 45 meV (acceptors: the mirror image, E<sub>A</sub> − E<sub>V</sub> = 45 meV). ' +
      'N<sub>C</sub>, N<sub>V</sub> ∝ T<sup>3/2</sup>, gap held at 1.12 eV, as in Figure 3.14. The linear axis of (a) shows the freeze-out ramp, the plateau and the intrinsic rise.';
    function solve(N, Tk, isD) {
      var kT = kB * Tk, NC = NC300 * Math.pow(Tk / 300, 1.5), NV = NV300 * Math.pow(Tk / 300, 1.5), lo = -0.5, hi = Eg + 0.5, EF, n, p, ion;
      for (var i = 0; i < 80; i++) {
        EF = (lo + hi) / 2; n = NC * Math.exp((EF - Eg) / kT); p = NV * Math.exp(-EF / kT);
        ion = isD ? N / (1 + 2 * Math.exp((EF - (Eg - 0.045)) / kT)) : N / (1 + 2 * Math.exp((0.045 - EF) / kT));
        var r = isD ? p + ion - n : p - ion - n;
        if (r > 0) lo = EF; else hi = EF;
      }
      return {EF: EF, n: n, p: p, ion: ion, Ei: Eg / 2 + kT / 2 * Math.log(NV / NC), ni: Math.sqrt(NC * NV) * Math.exp(-Eg / (2 * kT))};
    }
    function draw() {
      var isD = typ.value === 'D', N = Nd.value, Ts = linspace(15, 800, 240), sol = Ts.map(function (Tk) { return solve(N, Tk, isD); });
      var cur = solve(N, T.value, isD);
      p1.clear(); p1.axes({}); p1.hline(1, {color: GREY, dash: '4 3'});
      p1.line(sol.map(function (s, i) { return [Ts[i], (isD ? s.n : s.p) / N]; }), {color: isD ? BLUE : ORANGE});
      p1.line(sol.map(function (s, i) { return [Ts[i], s.ion / N]; }), {color: GREY, width: 1.2, dash: '2 3'});
      p1.text(790, 1, isD ? 'n = N<tspan baseline-shift="sub" font-size="8">D</tspan>' : 'p = N<tspan baseline-shift="sub" font-size="8">A</tspan>', {anchor: 'end', dy: -5, color: '#555'});
      p1.dot(T.value, Math.min((isD ? cur.n : cur.p) / N, 2));
      p2.clear(); p2.axes({fy: function (v) { return f(v, 1); }});
      p2.hline(Eg, {color: '#333', width: 1.5}); p2.hline(0, {color: '#333', width: 1.5});
      p2.hline(isD ? Eg - 0.045 : 0.045, {color: '#333', dash: '1 3'});
      p2.line(sol.map(function (s, i) { return [Ts[i], s.Ei]; }), {color: GREY, dash: '1 3', width: 1.3});
      p2.line(sol.map(function (s, i) { return [Ts[i], s.EF]; }), {color: ACC, width: 2});
      p2.text(790, Eg, 'E<tspan baseline-shift="sub" font-size="8">C</tspan>', {anchor: 'end', dy: -4});
      p2.text(790, 0, 'E<tspan baseline-shift="sub" font-size="8">V</tspan>', {anchor: 'end', dy: 13});
      p2.text(20, isD ? Eg - 0.045 : 0.045, isD ? 'E<tspan baseline-shift="sub" font-size="8">D</tspan>' : 'E<tspan baseline-shift="sub" font-size="8">A</tspan>', {dy: isD ? 13 : -4, color: '#555'});
      p2.text(790, sol[sol.length - 1].Ei, 'E<tspan baseline-shift="sub" font-size="8">i</tspan>', {anchor: 'end', dy: -4, color: '#777'});
      p2.dot(T.value, cur.EF);
      var maj = isD ? cur.n : cur.p, frac = cur.ion / N;
      var regime = frac < 0.9 ? 'freeze-out' : (cur.ni > 0.1 * N ? 'intrinsic range' : 'extrinsic (saturation) range');
      read(rd, [['majority', s2(maj) + ' cm⁻³'], ['minority', s2(isD ? cur.p : cur.n) + ' cm⁻³'], ['ionised dopants', f(frac * 100, 1) + ' %'],
        ['n<sub>i</sub>(T)', s2(cur.ni) + ' cm⁻³'], ['E<sub>F</sub> − E<sub>i</sub>', f(cur.EF - cur.Ei, 3) + ' eV'], ['regime', regime]]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ Ch4: the illuminated surface */
  W['surface'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var tau = S(ctl, {label: 'Lifetime τ', min: 1e-6, max: 1e-4, log: true, value: 1e-5, fmt: function (v) { return f(v * 1e6, 1) + ' µs'; }}, draw);
    var tt = S(ctl, {label: 'Time since switch-on t / τ', min: 0.01, max: 10, log: true, value: 0.05, fmt: function (v) { return f(v, 2) + ' τ'; }}, draw);
    var play = document.createElement('button'); play.className = 'w-btn'; play.textContent = '▶ Play the switch-on'; ctl.appendChild(play);
    var p1 = new P(plots, {w: 360, h: 290, m: [12, 14, 38, 56], x: [-3, 5], y: [0, 11], xlabel: 'x / L<tspan baseline-shift="sub" font-size="9">p</tspan>', ylabel: 'Δp (10¹³ cm⁻³)', title: '(a) The excess hole density at time t'});
    var p2 = new P(plots, {w: 300, h: 290, m: [12, 14, 38, 50], x: [0.01, 10], xlog: true, y: [0, 5.5], xlabel: 't / τ', ylabel: 'Δp (10¹³ cm⁻³)', title: '(b) The edge and the depth L<sub>p</sub>'});
    note.innerHTML = 'Case B of Chapter 4: n-type silicon, N<sub>D</sub> = 10¹⁶ cm⁻³, D<sub>p</sub> = 12 cm²/s, g<sub>0</sub> = 10¹⁹ cm⁻³s⁻¹ in the lit layer (x &lt; 0, shaded). ' +
      'Dark side: the exact switch-on solution (4.30) of Section 4.6.1; lit side: the uniform Case A minus the mirror image of the dark side (the equation is linear). Dashed: the steady state τg<sub>0</sub>/2 · e<sup>−x/L<sub>p</sub></sup>. Linear axes.';
    function dark(x, t, ta) { // x >= 0 in cm, exact solution with the edge filling up
      var L = Math.sqrt(Dp * ta), A = tau.value * 0, g0 = 1e19;
      var s = 2 * Math.sqrt(Dp * t), r = Math.sqrt(t / ta), z1 = x / s - r, z2 = x / s + r;
      var a = z1 >= 0 ? Math.exp(-x / L + logerfc(z1)) : Math.exp(-x / L) * erfc(z1);
      var b = Math.exp(x / L + logerfc(z2));
      var c = Math.exp(-t / ta + logerfc(x / s));
      return ta * g0 / 4 * (a + b) - ta * g0 / 2 * c;
    }
    function dp(xL, tr, ta) { // x in units of L, t in units of tau
      var L = Math.sqrt(Dp * ta), t = tr * ta, x = xL * L;
      if (x >= 0) return dark(x, t, ta);
      return ta * 1e19 * (1 - Math.exp(-tr)) - dark(-x, t, ta);
    }
    function draw() {
      var ta = tau.value, tr = tt.value, top = ta * 1e19 / 1e13, L = Math.sqrt(Dp * ta);
      p1.setY(0, top * 1.1); p2.setY(0, top * 0.55);
      p1.clear(); p1.rect(-3, 0, 0, top * 1.1, {fill: 'rgba(217,119,26,.10)'}); p1.axes({});
      p1.text(-1.5, top * 1.04, 'lit layer', {anchor: 'middle', color: ACC, size: 11});
      p1.text(2.5, top * 1.04, 'dark bulk', {anchor: 'middle', color: '#555', size: 11});
      var xs = linspace(-3, 5, 321);
      p1.line(xs.map(function (x) { return [x, (x >= 0 ? top / 2 * Math.exp(-x) : top * (1 - 0.5 * Math.exp(x)))]; }), {color: GREY, dash: '5 4', width: 1.4});
      p1.line(xs.map(function (x) { return [x, dp(x, tr, ta) / 1e13]; }), {color: ORANGE, width: 2.4});
      p1.vline(0, {color: '#999'}); p1.vline(1, {color: '#bbb', dash: '2 3'});
      p1.text(1, 0, 'L<tspan baseline-shift="sub" font-size="8">p</tspan>', {dx: 3, dy: -6, color: '#666'});
      var ts = []; for (var i = 0; i <= 120; i++) ts.push(Math.pow(10, -2 + 3 * i / 120));
      p2.clear(); p2.axes({fx: function (v) { return String(+v.toPrecision(2)); }});
      p2.hline(top / 2, {color: GREY, dash: '4 3'});
      p2.line(ts.map(function (r) { return [r, dp(0, r, ta) / 1e13]; }), {color: ORANGE, width: 2});
      p2.line(ts.map(function (r) { return [r, dp(1, r, ta) / 1e13]; }), {color: NAVY, width: 2});
      p2.text(0.012, top / 2, 'τg<tspan baseline-shift="sub" font-size="8">0</tspan>/2', {dy: -5, color: '#666'});
      p2.text(9.5, dp(0, 9.5, ta) / 1e13, 'x = 0', {anchor: 'end', dy: 14, color: ORANGE, bold: true});
      p2.text(9.5, dp(1, 9.5, ta) / 1e13, 'x = L<tspan baseline-shift="sub" font-size="8">p</tspan>', {anchor: 'end', dy: 14, color: NAVY, bold: true});
      p2.vline(tr, {color: ACC, dash: '3 3'});
      p2.dot(tr, dp(0, tr, ta) / 1e13); p2.dot(tr, dp(1, tr, ta) / 1e13, {fill: NAVY});
      // half-value point of the dark side
      var e0 = dp(0, tr, ta), xh = 0; for (var xx = 0; xx < 5; xx += 0.002) { if (dp(xx, tr, ta) < e0 / 2) { xh = xx; break; } }
      read(rd, [['t', f(tr * ta * 1e6, 2) + ' µs'], ['L<sub>p</sub> = √(D<sub>p</sub>τ)', f(L * 1e4, 0) + ' µm'], ['√(D<sub>p</sub>t)', f(Math.sqrt(Dp * tr * ta) * 1e4, 1) + ' µm'],
        ['edge value Δp(0)', s2(e0) + ' cm⁻³'], ['at x = L<sub>p</sub>', s2(dp(1, tr, ta)) + ' cm⁻³ (' + f(100 * dp(1, tr, ta) / (top * 1e13 / 2 * Math.exp(-1)), 0) + ' % of final)'],
        ['half-value point', f(xh * L * 1e4, 1) + ' µm']]);
    }
    var timer = null;
    play.onclick = function () {
      if (timer) { clearInterval(timer); timer = null; play.textContent = '▶ Play the switch-on'; return; }
      var e = -2; play.textContent = '❚❚ Pause';
      timer = setInterval(function () { e += 0.02; tt.set(Math.pow(10, e)); draw(); if (e >= 1) { clearInterval(timer); timer = null; play.textContent = '▶ Play the switch-on'; } }, 40);
    };
    draw();
  };

  /* ------------------------------------------------------------------ Ch5: PN junction at equilibrium */
  function junction(NA, ND, V) { // V: applied voltage on P (N grounded)
    var Vd = VT * Math.log(NA * ND / (ni * ni)), Vt = Vd - (V || 0);
    var Wt = Math.sqrt(2 * eps * Vt / q * (NA + ND) / (NA * ND)), Wn = Wt * NA / (NA + ND), Wp = Wt * ND / (NA + ND);
    return {Vd: Vd, Vt: Vt, W: Wt, Wn: Wn, Wp: Wp, Emax: q * ND * Wn / eps,
      V: function (x) { // electrostatic potential, N side at 0
        if (x >= Wn) return 0; if (x <= -Wp) return -Vt;
        return x >= 0 ? -(q * ND / (2 * eps)) * (Wn - x) * (Wn - x) : -Vt + (q * NA / (2 * eps)) * (x + Wp) * (x + Wp);
      },
      E: function (x) { if (x >= Wn || x <= -Wp) return 0; return x >= 0 ? -(q * ND / eps) * (Wn - x) : -(q * NA / eps) * (x + Wp); },
      rho: function (x) { if (x >= Wn || x <= -Wp) return 0; return x >= 0 ? ND : -NA; }};
  }
  W['pn-eq'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var NA = S(ctl, {label: 'N<sub>A</sub> (P side)', min: 1e14, max: 1e19, log: true, value: 1e18, fmt: function (v) { return s1(v) + ' cm⁻³'; }}, draw);
    var ND = S(ctl, {label: 'N<sub>D</sub> (N side)', min: 1e14, max: 1e19, log: true, value: 1e16, fmt: function (v) { return s1(v) + ' cm⁻³'; }}, draw);
    var opt = {w: 330, h: 210, m: [12, 14, 34, 52]};
    var pr = new P(plots, Object.assign({title: '(a) Charge density ρ/q (cm⁻³)', ylabel: '', xlabel: 'x (µm)'}, opt));
    var pe = new P(plots, Object.assign({title: '(b) Field 𝓔 (kV/cm)', ylabel: '', xlabel: 'x (µm)'}, opt));
    var pv = new P(plots, Object.assign({title: '(c) Potential V (volts, N side grounded)', ylabel: '', xlabel: 'x (µm)'}, opt));
    var pb = new P(plots, Object.assign({title: '(d) Band diagram, E − E<sub>F</sub> (eV)', ylabel: '', xlabel: 'x (µm)'}, opt, {h: 250}));
    var pd = new P(plots, Object.assign({title: '(e) Carrier densities, linear: p/N<sub>A</sub> and n/N<sub>D</sub>', ylabel: '', xlabel: 'x (µm)'}, opt, {h: 250}));
    note.innerHTML = 'Depletion approximation of Chapter 5, x = 0 at the metallurgical junction. V<sub>d</sub> = (kT/q) ln(N<sub>A</sub>N<sub>D</sub>/n<sub>i</sub>²); E<sub>i</sub> at mid-gap. ' +
      'Every panel is drawn to scale on the same x axis: with N<sub>A</sub> ≫ N<sub>D</sub> the P part of the SCR is too thin to see, which is the point.';
    function draw() {
      var J = junction(NA.value, ND.value), Wp = J.Wp * 1e4, Wn = J.Wn * 1e4, m = 0.45 * (Wp + Wn), xa = -Wp - m, xb = Wn + m;
      var xs = linspace(xa, xb, 500).concat([-Wp, 0, Wn]).sort(function (a, b) { return a - b; });
      [pr, pe, pv, pb, pd].forEach(function (p) { p.setX(xa, xb); });
      var rmax = Math.max(NA.value, ND.value);
      pr.setY(-NA.value * 1.15, ND.value * 1.15); pr.clear(); pr.axes({zero: true, ny: 4, fy: function (y) { return y === 0 ? '0' : ts(y); }});
      pr.rect(-Wp, 0, 0, -NA.value, {fill: 'rgba(200,100,30,.35)', stroke: ORANGE}); pr.rect(0, 0, Wn, ND.value, {fill: 'rgba(31,78,154,.3)', stroke: BLUE});
      pr.text(-Wp, -NA.value, '−N<tspan baseline-shift="sub" font-size="8">A</tspan>', {dx: -4, dy: 12, anchor: 'end', color: ORANGE});
      pr.text(Wn, ND.value, '+N<tspan baseline-shift="sub" font-size="8">D</tspan>', {dx: 4, dy: 10, color: BLUE});
      var Em = J.Emax / 1000;
      pe.setY(-Em * 1.15, Em * 0.12); pe.clear(); pe.axes({zero: true, ny: 4});
      pe.area(xs.map(function (x) { return [x, J.E(x * 1e-4) / 1000]; }), 0, {fill: 'rgba(46,125,79,.18)'});
      pe.line(xs.map(function (x) { return [x, J.E(x * 1e-4) / 1000]; }), {color: GREEN});
      pe.text(0, -Em, '−𝓔<tspan baseline-shift="sub" font-size="8">max</tspan> = −' + f(Em, 1), {dx: 6, dy: 4, color: GREEN});
      pv.setY(-J.Vd * 1.15, J.Vd * 0.12); pv.clear(); pv.axes({zero: true, ny: 4});
      pv.line(xs.map(function (x) { return [x, J.V(x * 1e-4)]; }), {color: NAVY});
      pv.text(xa, -J.Vd, '−V<tspan baseline-shift="sub" font-size="8">d</tspan>', {dx: 4, dy: -5});
      var ECn = Eg / 2 - VT * Math.log(ND.value / ni);
      var ECx = function (x) { return ECn - J.V(x * 1e-4); };
      var top = ECn + J.Vd + 0.15, bot = ECn - Eg - 0.15;
      pb.setY(bot, top); pb.clear(); pb.axes({ny: 5, fy: function (v) { return f(v, 1); }});
      pb.line(xs.map(function (x) { return [x, ECx(x)]; }), {color: '#222'});
      pb.line(xs.map(function (x) { return [x, ECx(x) - Eg]; }), {color: '#222'});
      pb.line(xs.map(function (x) { return [x, ECx(x) - Eg / 2]; }), {color: GREY, dash: '1 3', width: 1.3});
      pb.hline(0, {color: ACC, dash: '6 4', width: 1.8});
      pb.text(xb, ECn, 'E<tspan baseline-shift="sub" font-size="8">C</tspan>', {anchor: 'end', dy: -4, dx: -2});
      pb.text(xb, ECn - Eg, 'E<tspan baseline-shift="sub" font-size="8">V</tspan>', {anchor: 'end', dy: -4, dx: -2});
      pb.text(xb, 0, 'E<tspan baseline-shift="sub" font-size="8">F</tspan>', {anchor: 'end', dy: -4, dx: -2, color: ACC, bold: true});
      pb.seg(xa + 0.08 * (xb - xa), ECn, xa + 0.08 * (xb - xa), ECn + J.Vd, {color: '#555', arrow: true, width: 1.2});
      pb.text(xa + 0.08 * (xb - xa), ECn + J.Vd / 2, 'qV<tspan baseline-shift="sub" font-size="8">d</tspan>', {dx: 5});
      pd.setY(0, 1.12); pd.clear(); pd.axes({ny: 4});
      pd.line(xs.map(function (x) { return [x, Math.exp(J.V(x * 1e-4) / VT)]; }), {color: BLUE});
      pd.line(xs.map(function (x) { return [x, Math.exp(-(J.V(x * 1e-4) + J.Vd) / VT)]; }), {color: ORANGE});
      pd.text(xb, 1, 'n/N<tspan baseline-shift="sub" font-size="8">D</tspan>', {anchor: 'end', dy: -5, color: BLUE, bold: true});
      pd.text(xa, 1, 'p/N<tspan baseline-shift="sub" font-size="8">A</tspan>', {dy: -5, dx: 4, color: ORANGE, bold: true});
      [pr, pe, pv, pb, pd].forEach(function (p) { p.vline(-Wp, {color: '#bbb', dash: '2 3'}); p.vline(Wn, {color: '#bbb', dash: '2 3'}); });
      read(rd, [['V<sub>d</sub>', f(J.Vd, 3) + ' V'], ['W', f(J.W * 1e4, 3) + ' µm'], ['W<sub>n</sub>', f(Wn, 3) + ' µm'], ['W<sub>p</sub>', (Wp < 0.01 ? f(Wp * 1000, 1) + ' nm' : f(Wp, 3) + ' µm')],
        ['𝓔<sub>max</sub>', f(Em, 1) + ' kV/cm'], ['n<sub>p0</sub>', s2(ni * ni / NA.value) + ' cm⁻³'], ['p<sub>n0</sub>', s2(ni * ni / ND.value) + ' cm⁻³']]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ Ch6: the junction under bias */
  W['pn-bias'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var NA = 1e18, ND = 1e16, Ln = Math.sqrt(Dn * 1e-7), Lp = Math.sqrt(Dp * 1e-5);
    var V = S(ctl, {label: 'Applied voltage V (on P)', min: -3, max: 0.7, step: 0.01, value: 0.3, fmt: function (v) { return f(v, 2) + ' V'; }}, draw);
    var typ = SEG(ctl, {label: 'Diode', value: 's', options: [['s', 'Short (reference: d<sub>p</sub> = 2, d<sub>n</sub> = 10 µm)'], ['l', 'Long (d ≫ L)']]}, draw);
    var pb = new P(plots, {w: 660, h: 270, m: [12, 30, 36, 56], x: [0, 1], y: [-1, 1], ylabel: 'E (eV)', title: '(a) Bands and quasi-Fermi levels (x axis in three parts, each to its own scale)'});
    plots.className = 'w-plots';
    var row = D(root, 'w-plots');
    root.insertBefore(row, rd);
    var pn = new P(row, {w: 320, h: 230, m: [12, 14, 36, 76], x: [0, 1], y: [0, 1], xlabel: 'x (µm), neutral P', ylabel: 'n (cm⁻³)', title: '(b) Electrons in the P region'});
    var pp = new P(row, {w: 320, h: 230, m: [12, 14, 36, 76], x: [0, 1], y: [0, 1], xlabel: 'x (µm), neutral N', ylabel: 'p (cm⁻³)', title: '(c) Holes in the N region'});
    var row2 = D(root, 'w-plots one'); root.insertBefore(row2, rd);
    var pi = new P(row2, {w: 660, h: 220, m: [12, 20, 36, 80], x: [-1, 0.75], y: [0, 1], xlabel: 'V (V)', ylabel: 'J (A/cm²)', title: '(d) The characteristic, rescaled so that the operating point sits at the same height'});
    note.innerHTML = 'Reference junction of Chapters 5–7 (N<sub>A</sub> = 10¹⁸, N<sub>D</sub> = 10¹⁶ cm⁻³), N side grounded, low injection, no ohmic drop. Edge densities n<sub>p0</sub>e<sup>V/V<sub>T</sub></sup> and p<sub>n0</sub>e<sup>V/V<sub>T</sub></sup>; ' +
      'short diode: straight lines to equilibrium at the contacts; long diode: exponentials with L<sub>n</sub> = 19 µm, L<sub>p</sub> = 110 µm (τ<sub>n</sub> = 0.1 µs, τ<sub>p</sub> = 10 µs), drawn over 3L. ' +
      'The quasi-Fermi levels are computed from the same densities as (b) and (c). Densities on linear axes, majority carriers not drawn.';
    function draw() {
      var v = V.value, short = typ.value === 's', J = junction(NA, ND, v), np0 = ni * ni / NA, pn0 = ni * ni / ND;
      var dP = short ? 2e-4 : 3 * Ln, dN = short ? 10e-4 : 3 * Lp, ev = Math.exp(v / VT);
      var Dn0 = np0 * (ev - 1), Dp0 = pn0 * (ev - 1);
      var nP = function (u) { return np0 + Dn0 * (short ? (1 - u / dP) : Math.exp(-u / Ln)); }; // u: distance from x_p into P
      var pN = function (u) { return pn0 + Dp0 * (short ? (1 - u / dN) : Math.exp(-u / Lp)); };
      // piecewise x: P [0,.4], SCR [.4,.5], N [.5,1]
      var Wp = J.Wp, Wn = J.Wn;
      function X(region, u) { if (region === 'P') return 0.4 * (1 - u / dP); if (region === 'N') return 0.5 + 0.5 * u / dN; return 0.4 + 0.1 * (u + Wp) / (Wp + Wn); }
      var ECn = Eg / 2 - VT * Math.log(ND / ni), ECp = ECn + J.Vt, EFp0 = -v;
      var pts = {C: [], V: [], I: [], Fn: [], Fp: []};
      var uP = linspace(dP, 0, 120), uN = linspace(0, dN, 160), xs = linspace(-Wp, Wn, 60);
      uP.forEach(function (u) { var x = X('P', u), n = nP(u), Ei = ECp - Eg / 2; pts.C.push([x, ECp]); pts.V.push([x, ECp - Eg]); pts.I.push([x, Ei]);
        pts.Fn.push([x, Ei + VT * Math.log(n / ni)]); pts.Fp.push([x, EFp0]); });
      xs.forEach(function (xx) { var x = X('S', xx), Ec = ECn - J.V(xx); pts.C.push([x, Ec]); pts.V.push([x, Ec - Eg]); pts.I.push([x, Ec - Eg / 2]); pts.Fn.push([x, 0]); pts.Fp.push([x, EFp0]); });
      uN.forEach(function (u) { var x = X('N', u), p = pN(u), Ei = ECn - Eg / 2; pts.C.push([x, ECn]); pts.V.push([x, ECn - Eg]); pts.I.push([x, Ei]);
        pts.Fn.push([x, 0]); pts.Fp.push([x, Ei - VT * Math.log(Math.max(p, 1e-300) / ni)]); });
      var top = Math.max(ECp, ECn) + 0.25, bot = Math.min(ECn, ECp) - Eg - 0.25;
      pb.setY(bot, top); pb.clear(); pb.rect(0.4, bot, 0.5, top, {fill: 'rgba(0,0,0,.05)'});
      pb.axes({noxaxis: true, noxgrid: true, fy: function (u) { return f(u, 1); }});
      pb.line(pts.C, {color: '#222'}); pb.line(pts.V, {color: '#222'}); pb.line(pts.I, {color: GREY, dash: '1 3', width: 1.2});
      pb.line(pts.Fn, {color: BLUE, width: 2, dash: '7 3'}); pb.line(pts.Fp, {color: ORANGE, width: 2, dash: '7 3'});
      pb.text(0.45, top, 'SCR', {anchor: 'middle', dy: 13, color: '#666', size: 10.5});
      pb.text(0.2, top, 'neutral P (' + f(dP * 1e4, 0) + ' µm)', {anchor: 'middle', dy: 13, color: '#666', size: 10.5});
      pb.text(0.75, top, 'neutral N (' + f(dN * 1e4, 0) + ' µm)', {anchor: 'middle', dy: 13, color: '#666', size: 10.5});
      pb.text(1, 0, 'E<tspan baseline-shift="sub" font-size="8">Fn</tspan>', {dx: 3, dy: 4, color: BLUE, bold: true});
      pb.text(0, EFp0, 'E<tspan baseline-shift="sub" font-size="8">Fp</tspan>', {dx: 4, dy: EFp0 > ECp - Eg + 0.1 ? -5 : 14, color: ORANGE, bold: true});
      pb.text(1, ECn, 'E<tspan baseline-shift="sub" font-size="8">C</tspan>', {dx: 3, dy: 4}); pb.text(1, ECn - Eg, 'E<tspan baseline-shift="sub" font-size="8">V</tspan>', {dx: 3, dy: 4});
      if (Math.abs(v) > 0.02) { pb.seg(0.47, 0, 0.47, -v, {color: '#555', width: 1.2, arrow: true}); pb.text(0.47, -v / 2, 'qV', {dx: 4, dy: 4, size: 11}); }
      // minority panels
      function panel(pl, u, fn, d, lab, color, eq, edgeAtRight) {
        var xsU = linspace(0, d, 200), vals = xsU.map(fn), mx = Math.max.apply(null, vals.concat([eq])) * 1.18;
        pl.setX(0, d * 1e4); pl.setY(0, mx); pl.clear(); pl.axes({ny: 4, fy: ts});
        var pts2 = xsU.map(function (uu, i) { return [edgeAtRight ? (d - uu) * 1e4 : uu * 1e4, vals[i]]; });
        pl.area(pts2, 0, {fill: color === BLUE ? 'rgba(31,78,154,.15)' : 'rgba(200,100,30,.15)'});
        pl.line(pts2, {color: color, width: 2.2});
        pl.hline(eq, {color: GREY, dash: '4 3'});
        pl.text(edgeAtRight ? 0 : d * 1e4, eq, lab + '<tspan baseline-shift="sub" font-size="8">0</tspan> = ' + s1(eq), {anchor: edgeAtRight ? 'start' : 'end', dx: edgeAtRight ? 6 : -6, dy: -6, color: '#555'});
        pl.text(edgeAtRight ? d * 1e4 : 0, vals[0], s2(vals[0]), {anchor: edgeAtRight ? 'end' : 'start', dx: edgeAtRight ? -4 : 4, dy: vals[0] > mx * 0.7 ? 14 : -6, color: color, bold: true});
      }
      panel(pn, 0, nP, dP, 'n<tspan baseline-shift="sub" font-size="8">p</tspan>', BLUE, np0, true);
      panel(pp, 0, pN, dN, 'p<tspan baseline-shift="sub" font-size="8">n</tspan>', ORANGE, pn0, false);
      // characteristic
      var J0 = short ? q * ni * ni * (Dp / (ND * 10e-4) + Dn / (NA * 2e-4)) : q * ni * ni * (Dp / (ND * Lp) + Dn / (NA * Ln));
      var Jv = J0 * (ev - 1), ymax = Math.max(Math.abs(Jv) / 0.6, J0 * 2);
      var vmin = Math.min(-0.3, v - 0.3), vmax = Math.max(0.3, v + 0.12);
      pi.setX(vmin, vmax); pi.setY(-ymax * 0.15, ymax); pi.clear(); pi.axes({zero: true, ny: 4, fy: ts});
      pi.line(linspace(vmin, vmax, 300).map(function (u) { return [u, J0 * (Math.exp(u / VT) - 1)]; }), {color: NAVY, width: 2});
      pi.dot(v, Jv);
      read(rd, [['V<sub>d</sub> − V', f(J.Vt, 3) + ' V'], ['W', f(J.W * 1e4, 3) + ' µm'], ['e<sup>V/V<sub>T</sub></sup>', s2(ev)], ['n(x<sub>p</sub>)', s2(nP(0)) + ' cm⁻³'],
        ['p(x<sub>n</sub>)', s2(pN(0)) + ' cm⁻³'], ['J<sub>0</sub>', s2(J0) + ' A/cm²'], ['J', s2(Jv) + ' A/cm²'], ['E<sub>Fn</sub> − E<sub>Fp</sub> in the SCR', f(v, 3) + ' eV']]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ Ch7: C_T and C_D */
  W['caps'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var NA = 1e18, Sa = 1e-4, dp = 2e-4;
    var V = S(ctl, {label: 'Bias V', min: -5, max: 0.72, step: 0.01, value: 0.4, fmt: function (v) { return f(v, 2) + ' V'; }}, draw);
    var ND = S(ctl, {label: 'N<sub>D</sub>', min: 1e15, max: 1e17, log: true, value: 1e16, fmt: function (v) { return s1(v) + ' cm⁻³'; }}, draw);
    var dn = S(ctl, {label: 'd<sub>n</sub> (neutral N width)', min: 2, max: 50, step: 1, value: 10, fmt: function (v) { return v + ' µm'; }}, draw);
    var p1 = new P(plots, {w: 360, h: 280, m: [12, 14, 38, 56], x: [-5, 0.72], y: [0.1, 1e4], ylog: true, xlabel: 'V (V)', ylabel: 'C (pF)', title: '(a) C<sub>T</sub> (black) and C<sub>D</sub> (orange), logarithmic scale'});
    var p2 = new P(plots, {w: 300, h: 280, m: [12, 14, 38, 56], x: [-5, 1.2], y: [0, 1], xlabel: 'V (V)', ylabel: '1/C<tspan baseline-shift="sub" font-size="9">T</tspan>² (pF⁻²)', title: '(b) The 1/C<sub>T</sub>² line'});
    note.innerHTML = 'Area S = 10⁻⁴ cm², N<sub>A</sub> = 10¹⁸ cm⁻³, d<sub>p</sub> = 2 µm. C<sub>T</sub> = εS/W(V); C<sub>D</sub> = (q/kT) τ̄<sub>tr</sub> I, with τ̄<sub>tr</sub> the transit times d²/2D weighted by the hole and electron currents. ' +
      'Above V<sub>d</sub>/2 (grey) the depletion approximation behind C<sub>T</sub> is doubtful; above 0.72 V low injection ends.';
    function draw() {
      var Nd = ND.value, dN = dn.value * 1e-4, J0 = junction(NA, Nd, 0), Vd = J0.Vd;
      var CT = function (u) { return eps * Sa / junction(NA, Nd, u).W * 1e12; };
      var Ip0 = q * Sa * ni * ni * Dp / (Nd * dN), In0 = q * Sa * ni * ni * Dn / (NA * dp), I0 = Ip0 + In0;
      var ttp = dN * dN / (2 * Dp), ttn = dp * dp / (2 * Dn), tbar = (ttp * Ip0 + ttn * In0) / I0;
      var CD = function (u) { return tbar * I0 * Math.exp(u / VT) / VT * 1e12; };
      var vs = linspace(-5, 0.72, 300), cross = null;
      if (CD(0.72) > CT(0.72)) { var lo = -5, hi = 0.72; for (var i = 0; i < 50; i++) { var mid = (lo + hi) / 2; if (CD(mid) > CT(mid)) hi = mid; else lo = mid; } cross = hi; }
      p1.clear(); p1.rect(Vd / 2, 0.1, 0.72, 1e4, {fill: 'rgba(0,0,0,.05)'}); p1.axes({fy: function (y) { return String(y >= 1 ? y : y.toPrecision(1)); }});
      p1.line(vs.map(function (u) { return [u, CT(u)]; }), {color: '#222', width: 2});
      p1.line(vs.map(function (u) { return [u, Math.max(CD(u), 1e-3)]; }), {color: ORANGE, width: 2});
      if (cross !== null) p1.dot(cross, CT(cross), {fill: '#fff', stroke: '#222', r: 4});
      p1.dot(V.value, CT(V.value), {fill: '#222'}); if (CD(V.value) > 0.1) p1.dot(V.value, CD(V.value));
      var v2 = linspace(-5, Vd, 200), y2 = 1 / Math.pow(CT(-5), 2);
      p2.setY(0, y2 * 1.08); p2.clear(); p2.rect(Vd / 2, 0, 1.2, y2 * 1.08, {fill: 'rgba(0,0,0,.05)'}); p2.axes({fy: function (y) { return y.toPrecision(2); }});
      p2.line(v2.filter(function (u) { return u <= Vd / 2; }).map(function (u) { return [u, 1 / Math.pow(CT(u), 2)]; }), {color: '#222', width: 2});
      p2.line(v2.filter(function (u) { return u >= Vd / 2; }).map(function (u) { return [u, 1 / Math.pow(CT(Math.min(u, Vd - 1e-6)), 2)]; }), {color: '#222', width: 1.5, dash: '5 4'});
      p2.dot(Vd, 0, {fill: GREEN}); p2.text(Vd, 0, 'V<tspan baseline-shift="sub" font-size="8">d</tspan> = ' + f(Vd, 3) + ' V', {anchor: 'end', dx: -6, dy: -8, color: GREEN, bold: true});
      if (V.value < Vd) p2.dot(V.value, 1 / Math.pow(CT(V.value), 2), {fill: '#222'});
      var I = I0 * (Math.exp(V.value / VT) - 1);
      read(rd, [['C<sub>T</sub>', f(CT(V.value), 2) + ' pF'], ['C<sub>D</sub>', (CD(V.value) < 0.01 ? s1(CD(V.value)) : f(CD(V.value), 2)) + ' pF'], ['I', s2(I) + ' A'],
        ['C<sub>T0</sub>', f(CT(0), 2) + ' pF'], ['τ<sub>tp</sub> = d<sub>n</sub>²/2D<sub>p</sub>', f(ttp * 1e9, 1) + ' ns'], ['τ̄<sub>tr</sub>', f(tbar * 1e9, 1) + ' ns'],
        ['cross-over', cross === null ? 'none below 0.72 V' : f(cross, 2) + ' V']]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ Ch8: the base of the transistor */
  W['bjt-base'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots one'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var nB0 = 1e4, Ln = 18.7e-4, Sa = 1e-4;
    var VBE = S(ctl, {label: 'V<sub>BE</sub> (EB junction)', min: 0, max: 0.72, step: 0.01, value: 0.6, fmt: function (v) { return f(v, 2) + ' V'; }}, draw);
    var VBC = S(ctl, {label: 'V<sub>BC</sub> (BC junction)', min: -5, max: 0.65, step: 0.01, value: -5, fmt: function (v) { return f(v, 2) + ' V' + (v < 0 ? ' (reverse)' : v > 0 ? ' (forward)' : ''); }}, draw);
    var base = SEG(ctl, {label: 'Base width', value: 'ref', options: [['ref', 'Reference, W<sub>B</sub> = 1 µm'], ['1', 'W<sub>B</sub> = L<sub>n</sub>'], ['3', 'W<sub>B</sub> = 3L<sub>n</sub>']]}, draw);
    var pl = new P(plots, {w: 680, h: 320, m: [16, 16, 30, 16], x: [0, 1], y: [0, 1], title: 'Electron density in the base (generic cartoon: emitter and collector not to scale, base on a linear scale)'});
    note.innerHTML = 'NPN reference transistor of Chapter 8: N<sub>B</sub> = 10¹⁶ cm⁻³, so n<sub>B0</sub> = n<sub>i</sub>²/N<sub>B</sub> = 10⁴ cm⁻³; D<sub>n</sub> = 35 cm²/s, L<sub>n</sub> = 18.7 µm, S = 10⁻⁴ cm². ' +
      'Edge values n<sub>B0</sub>e<sup>V<sub>BE</sub>/V<sub>T</sub></sup> and n<sub>B0</sub>e<sup>V<sub>BC</sub>/V<sub>T</sub></sup>; between them, the straight line of a short base or the sinh profile of a long one. I<sub>C</sub> is the diffusion current q S D<sub>n</sub>|dn/dx| at the collector edge.';
    function draw() {
      var WB = base.value === 'ref' ? 1e-4 : (+base.value) * Ln, n0 = nB0 * Math.exp(VBE.value / VT), nW = nB0 * Math.exp(VBC.value / VT);
      var s = Math.sinh(WB / Ln), a = n0 - nB0, b = nW - nB0;
      var n = function (x) { return nB0 + (a * Math.sinh((WB - x) / Ln) + b * Math.sinh(x / Ln)) / s; };
      var dndx = function (x) { return (-a * Math.cosh((WB - x) / Ln) + b * Math.cosh(x / Ln)) / (s * Ln); };
      var IC = -q * Sa * Dn * dndx(WB), InE = -q * Sa * Dn * dndx(0);
      var mx = Math.max(n0, nW, nB0) / 0.66;
      var X0 = 0.22, X1 = 0.78, y = function (v) { return 0.04 + 0.78 * v / mx; };
      pl.clear(); pl.axes({noxaxis: true, noyaxis: true, noxgrid: true, noygrid: true});
      // regions
      pl.rect(0, 0, 0.16, 1, {fill: 'rgba(31,78,154,.07)'}); pl.rect(0.84, 0, 1, 1, {fill: 'rgba(31,78,154,.07)'});
      pl.rect(0.16, 0, X0, 1, {fill: 'rgba(0,0,0,.05)'}); pl.rect(X1, 0, 0.84, 1, {fill: 'rgba(0,0,0,.05)'});
      pl.text(0.08, 0, 'EMITTER N⁺', {anchor: 'middle', dy: 18, bold: true, color: NAVY, size: 11});
      pl.text(0.5, 0, 'BASE P · W<tspan baseline-shift="sub" font-size="8">B</tspan> = ' + f(WB * 1e4, 1) + ' µm', {anchor: 'middle', dy: 18, bold: true, color: NAVY, size: 11});
      pl.text(0.92, 0, 'COLLECTOR N', {anchor: 'middle', dy: 18, bold: true, color: NAVY, size: 11});
      pl.seg(0, 0.86, 0.16, 0.86, {color: BLUE, width: 2.5}); pl.text(0.08, 0.86, 'N<tspan baseline-shift="sub" font-size="8">E</tspan> = 10¹⁸', {anchor: 'middle', dy: -6, color: BLUE});
      pl.seg(0.84, 0.86, 1, 0.86, {color: BLUE, width: 2.5}); pl.text(0.92, 0.86, 'N<tspan baseline-shift="sub" font-size="8">C</tspan> = 10¹⁵', {anchor: 'middle', dy: -6, color: BLUE});
      pl.seg(0, 0, 1, 0, {color: '#999', width: 1});
      // n_B0 reference, raised for visibility if needed
      var yB0 = Math.max(y(nB0), 0.075);
      pl.seg(X0, yB0, X1, yB0, {color: GREY, dash: '4 3', width: 1.2});
      pl.text(0.5, yB0, 'n<tspan baseline-shift="sub" font-size="8">B0</tspan> = 10⁴ cm⁻³', {anchor: 'middle', dy: 14, color: '#666'});
      var xs = linspace(0, WB, 200), pts = xs.map(function (x) { return [X0 + (X1 - X0) * x / WB, y(n(x))]; });
      if (y(n0) < 0.075 && y(nW) < 0.075) pts = xs.map(function (x) { return [X0 + (X1 - X0) * x / WB, yB0]; });
      pl.area(pts, 0, {fill: 'rgba(31,78,154,.15)'}); pl.line(pts, {color: BLUE, width: 2.6});
      pl.text(X0, pts[0][1], 'n(0) = ' + s2(n0), {dx: 6, dy: -7, color: BLUE, bold: true});
      pl.text(X1, pts[pts.length - 1][1], 'n(W<tspan baseline-shift="sub" font-size="8">B</tspan>) ' + (nW < 1e-3 * nB0 ? '≈ 0' : '= ' + s1(nW)), {anchor: 'end', dx: -10, dy: -16, color: BLUE, bold: true});
      if (VBE.value > 0.05) { pl.seg(X0 - 0.03, yB0, X0 - 0.03, Math.max(pts[0][1], yB0 + 0.05), {color: ACC, width: 2, arrow: true}); pl.text(X0 - 0.035, (yB0 + pts[0][1]) / 2, 'pulled up', {anchor: 'end', color: ACC, size: 11}); }
      if (VBC.value < -0.05) { pl.seg(X1 + 0.03, Math.max(yB0, 0.12), X1 + 0.03, 0.03, {color: ACC, width: 2, arrow: true}); pl.text(X1 + 0.035, 0.1, 'pulled down', {color: ACC, size: 11}); }
      if (VBC.value > 0.05) { pl.seg(X1 + 0.03, yB0, X1 + 0.03, Math.max(pts[pts.length - 1][1], yB0 + 0.05), {color: ACC, width: 2, arrow: true}); pl.text(X1 + 0.035, (yB0 + pts[pts.length - 1][1]) / 2, 'pulled up', {color: ACC, size: 11}); }
      var meet = WB / Ln < 1.2 ? 'the pulls join' : 'the pulls do not meet';
      read(rd, [['I<sub>C</sub> (collector edge)', s2(IC) + ' A'], ['electron current at the emitter edge', s2(InE) + ' A'],
        ['reaching the collector', f(100 * IC / InE, 2) + ' %'], ['W<sub>B</sub>/L<sub>n</sub>', f(WB / Ln, 3) + ' (' + meet + ')'],
        ['slope dn/dx at W<sub>B</sub>', s2(dndx(WB)) + ' cm⁻⁴']]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ Ch8: output characteristics and Early effect */
  W['bjt-output'] = function (root) {
    var ctl = D(root, 'w-controls'), plots = D(root, 'w-plots one'), rd = D(root, 'w-read'), note = D(root, 'w-note');
    var IS0 = 5.6e-14, BF0 = 121, BR = 2.9;
    var VA = S(ctl, {label: 'Early voltage V<sub>A</sub>', min: 10, max: 200, step: 1, value: 44, fmt: function (v) { return v + ' V'; }}, draw);
    var IB = S(ctl, {label: 'Highlighted base current I<sub>B</sub>', min: 1, max: 10, step: 0.5, value: 6, fmt: function (v) { return f(v, 1) + ' µA'; }}, draw);
    var ext = SEG(ctl, {label: 'View', value: 'n', options: [['n', 'V<sub>CE</sub> from 0 to 10 V'], ['y', 'Extend the lines back to −V<sub>A</sub>']]}, draw);
    var pl = new P(plots, {w: 680, h: 330, m: [14, 70, 38, 62], x: [0, 10], y: [0, 1.6], xlabel: 'V<tspan baseline-shift="sub" font-size="9">CE</tspan> (V)', ylabel: 'I<tspan baseline-shift="sub" font-size="9">C</tspan> (mA)', title: 'Common-emitter characteristics I<sub>C</sub>(V<sub>CE</sub>) at fixed I<sub>B</sub>'});
    note.innerHTML = 'Ebers–Moll equations (8.19)–(8.21) with I<sub>S</sub> = 5.6×10⁻¹⁴ A, β<sub>F</sub> = 121, β<sub>R</sub> = 2.9 (reference transistor); base-width modulation in its linear form: ' +
      'I<sub>S</sub> and β<sub>F</sub> both scale as 1 + V<sub>CE</sub>/V<sub>A</sub>, so that in forward-active operation I<sub>C</sub> = β<sub>F</sub>I<sub>B</sub>(1 + V<sub>CE</sub>/V<sub>A</sub>). For each V<sub>CE</sub>, V<sub>BE</sub> is solved so that the base current is I<sub>B</sub>.';
    function IC(ib, vce, va) {
      var k = 1 + Math.max(vce, 0) / va, IS = IS0 * k, BF = BF0 * k, lo = 0, hi = 1.2, vbe, ibx, vbc;
      for (var i = 0; i < 70; i++) {
        vbe = (lo + hi) / 2; vbc = vbe - vce;
        ibx = IS / BF * (Math.exp(vbe / VT) - 1) + IS / BR * (Math.exp(vbc / VT) - 1);
        if (ibx > ib) hi = vbe; else lo = vbe;
      }
      return {ic: IS * (Math.exp(vbe / VT) - Math.exp(vbc / VT)) - IS / BR * (Math.exp(vbc / VT) - 1), vbe: vbe};
    }
    function draw() {
      var va = VA.value, x0 = ext.value === 'y' ? -va - 5 : 0, curves = [1, 2, 4, 6, 8, 10];
      if (curves.indexOf(IB.value) < 0) curves.push(IB.value);
      var ymax = BF0 * 10e-6 * (1 + 10 / va) * 1e3 * 1.12;
      pl.setX(x0, 10); pl.setY(0, ymax); pl.clear(); pl.axes({});
      var vs = linspace(0, 10, 260);
      curves.sort(function (a, b) { return a - b; }).forEach(function (ib) {
        var hl = ib === IB.value, pts = vs.map(function (v) { return [v, IC(ib * 1e-6, v, va).ic * 1e3]; });
        pl.line(pts, {color: hl ? ACC : NAVY, width: hl ? 2.8 : 1.6});
        if (ext.value === 'y') pl.line([[-va, 0], [10, BF0 * ib * 1e-6 * (1 + 10 / va) * 1e3]], {color: hl ? ACC : NAVY, width: 1, dash: '4 4', opacity: 0.7});
        pl.text(10, pts[pts.length - 1][1], f(ib, ib % 1 ? 1 : 0) + ' µA', {dx: 6, dy: 4, color: hl ? ACC : NAVY, bold: hl});
      });
      if (ext.value === 'y') { pl.dot(-va, 0, {fill: GREEN}); pl.text(-va, 0, '−V<tspan baseline-shift="sub" font-size="8">A</tspan>', {dy: -10, anchor: 'middle', color: GREEN, bold: true}); }
      pl.rect(Math.max(x0, 0), 0, 0.2, ymax, {fill: 'rgba(163,58,58,.07)'});
      pl.text(0.1, ymax, 'sat.', {anchor: 'middle', dy: 14, color: '#A33A3A', size: 10.5});
      var ib = IB.value * 1e-6, at5 = IC(ib, 5, va), at2 = IC(ib, 2, va);
      var ro = (va + 5) / at5.ic;
      read(rd, [['I<sub>C</sub> at V<sub>CE</sub> = 5 V', f(at5.ic * 1e3, 3) + ' mA'], ['V<sub>BE</sub>', f(at5.vbe, 3) + ' V'], ['β<sub>F</sub>I<sub>B</sub> (no Early effect)', f(BF0 * ib * 1e3, 3) + ' mA'],
        ['r<sub>o</sub> = (V<sub>A</sub> + V<sub>CE</sub>)/I<sub>C</sub>', f(ro / 1000, 1) + ' kΩ'], ['slope ΔI<sub>C</sub>/ΔV<sub>CE</sub> (2→5 V)', f((at5.ic - at2.ic) / 3 * 1e6, 2) + ' µA/V']]);
    }
    draw();
  };

  /* ------------------------------------------------------------------ boot */
  function boot() {
    [].forEach.call(document.querySelectorAll('.widget[data-widget]'), function (el) {
      var fn = W[el.getAttribute('data-widget')];
      if (!fn) return;
      try { fn(el); } catch (e) { el.innerHTML = '<p class="w-note">This interactive figure could not start: ' + e.message + '</p>'; if (window.console) console.error(e); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
