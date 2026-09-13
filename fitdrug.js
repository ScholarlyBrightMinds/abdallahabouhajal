/* ═══════════════════════════════════════════════════════════════════
   fitdrug.js · Find a drug, in three steps

   Step 1  Screen    302 real EGFR compounds from ChEMBL on a similarity
                     map. Three come measured, you pay for eight more, and
                     a k nearest neighbour model in this browser repaints
                     its guess after every result. Then the same model,
                     driving itself, plays your eight assays.
   Step 2  Dock      your best compound drops into the EGFR pocket from
                     PDB 1M17 and settles into the pose AutoDock Vina
                     computed for it, with its score in kcal/mol.
   Step 3  Simulate  two erlotinib poses score the same. You bet on one,
                     then 2 ns of OpenMM molecular dynamics decides it.

   Everything except the kNN model was computed offline. The data files in
   data/fitdrug were baked by fitdrug/scripts in the DrugDiscovery folder,
   and fitdrug/REPORT.md is the source of every number printed here.

   Molecule geometry comes from game.js (window.SBMDraw), so both games
   draw a molecule the same way.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var root = document.querySelector('[data-fit]');
    var tabs = document.querySelectorAll('.play-tab');
    if (!root) return;

    var SVGNS = 'http://www.w3.org/2000/svg';
    var DIR = 'data/fitdrug/';
    var SITE = 'https://scholarlybrightminds.github.io/abdallahabouhajal/';
    var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var LABELLED = { O: 'el-o', N: 'el-n', S: 'el-s', F: 'el-x', Cl: 'el-x', Br: 'el-x', P: 'el-s', Se: 'el-s' };
    var KEY_RES = { Met769: 1, Thr766: 1, Lys721: 1, Asp831: 1, Cys773: 1, Leu694: 1 };

    function $(name) { return root.querySelector('[data-f="' + name + '"]'); }
    var ui = {
        title: $('title'), meta: $('meta'), stage: $('stage'), heat: $('heat'), map: $('map'),
        pocket: $('pocket'), stat: $('static'), card: $('card'), mol: $('mol'), say: $('say'),
        note: $('note'), actions: $('actions'), chartwrap: $('chartwrap'), chart: $('chart'),
        prov: $('prov'), step1: $('step1'), step2: $('step2'), step3: $('step3')
    };

    // ── small helpers ───────────────────────────────────────────────
    function el(tag, attrs, parent) {
        var n = document.createElementNS(SVGNS, tag);
        for (var k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    }
    function esc(t) {
        return String(t).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function getJSON(name) {
        return fetch(DIR + name).then(function (r) {
            if (!r.ok) throw new Error(name + ' ' + r.status);
            return r.json();
        });
    }
    function fmt(v, n) { return v.toFixed(n === undefined ? 2 : n); }
    // SVG elements have no hidden property, only the attribute
    function show(n, on) { if (on) n.removeAttribute('hidden'); else n.setAttribute('hidden', ''); }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    // ── loaded data ─────────────────────────────────────────────────
    var meta = null, rows = [], names = [], y = null, MX = null, MY = null, N = 0;
    var SIM = null, SD = 1.4, mols = null, pocket = null, dock = null, mdata = null;
    var dockP = null, mdP = null;

    // ── state ───────────────────────────────────────────────────────
    var state = 'boot';          // boot | ready | screen | dock | simulate | done
    var g = null;                // the run in progress
    var visible = false, rafId = 0, anims = [];
    var pointNodes = [], selected = -1, pred = null, unc = null, lastMol = -1;
    var heatCells = null, heatCtx = null;

    // ═══════════════════════════════════════════════════════════ tabs
    function showTab(which) {
        var fit = which === 'fit';
        document.getElementById('panel-fit').hidden = !fit;
        document.getElementById('panel-mol').hidden = fit;
        for (var i = 0; i < tabs.length; i++) {
            var on = tabs[i].id === (fit ? 'tab-fit' : 'tab-mol');
            tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
            tabs[i].tabIndex = on ? 0 : -1;
        }
        if (!fit && window.SBMDraw && window.SBMDraw.redraw) window.SBMDraw.redraw();
        if (fit) { layoutHeat(); paintHeat(); start(); } else pause();
    }
    for (var t = 0; t < tabs.length; t++) {
        (function (btn) {
            btn.addEventListener('click', function () { showTab(btn.id === 'tab-fit' ? 'fit' : 'mol'); });
            btn.addEventListener('keydown', function (e) {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                var other = document.getElementById(btn.id === 'tab-fit' ? 'tab-mol' : 'tab-fit');
                showTab(other.id === 'tab-fit' ? 'fit' : 'mol');
                other.focus();
            });
        })(tabs[t]);
    }

    // ═══════════════════════════════════════════════════ the kNN model
    function unpackFP(list) {
        var n = list.length, W = new Uint32Array(n * 32), i, k, s;
        for (i = 0; i < n; i++) {
            s = atob(list[i]);
            for (k = 0; k < 32; k++) {
                W[i * 32 + k] = ((s.charCodeAt(k * 4) | (s.charCodeAt(k * 4 + 1) << 8) |
                                  (s.charCodeAt(k * 4 + 2) << 16) | (s.charCodeAt(k * 4 + 3) << 24)) >>> 0);
            }
        }
        return W;
    }
    function popcount(x) {
        x = x - ((x >>> 1) & 0x55555555);
        x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
        x = (x + (x >>> 4)) & 0x0f0f0f0f;
        return (x * 0x01010101) >>> 24;
    }
    // Tanimoto for every pair, once. 302 by 302 is under a tenth of a second.
    function buildSim(W, n) {
        var pop = new Uint16Array(n), i, j, k, c, s = new Float32Array(n * n);
        for (i = 0; i < n; i++) {
            c = 0;
            for (k = 0; k < 32; k++) c += popcount(W[i * 32 + k]);
            pop[i] = c;
        }
        for (i = 0; i < n; i++) {
            s[i * n + i] = 1;
            for (j = i + 1; j < n; j++) {
                c = 0;
                for (k = 0; k < 32; k++) c += popcount((W[i * 32 + k] & W[j * 32 + k]) >>> 0);
                var v = c / (pop[i] + pop[j] - c);
                s[i * n + j] = v; s[j * n + i] = v;
            }
        }
        return s;
    }
    // prediction: mean of what has been measured, weighted by Tanimoto cubed.
    // uncertainty: one minus the highest Tanimoto to anything measured.
    function predict(revealed) {
        var p = new Float32Array(N), u = new Float32Array(N), i, r, s, w, sw, sy, mx, mean = 0;
        for (r = 0; r < revealed.length; r++) mean += y[revealed[r]];
        mean /= Math.max(1, revealed.length);
        for (i = 0; i < N; i++) {
            sw = 0; sy = 0; mx = 0;
            for (r = 0; r < revealed.length; r++) {
                s = SIM[i * N + revealed[r]];
                w = s * s * s;
                sw += w; sy += w * y[revealed[r]];
                if (s > mx) mx = s;
            }
            p[i] = sw > 1e-9 ? sy / sw : mean;
            u[i] = 1 - mx;
        }
        return { pred: p, unc: u };
    }
    function pickUCB(revealed, taken, beta) {
        var q = predict(revealed), best = -1, bv = -1e9, i, v;
        for (i = 0; i < N; i++) {
            if (taken[i]) continue;
            v = q.pred[i] + beta * q.unc[i] * SD;
            if (v > bv) { bv = v; best = i; }
        }
        return best;
    }

    // ═════════════════════════════════════════════════════════ the map
    var FOG = [238, 241, 248], LOW = [214, 221, 235], HI = [30, 86, 200];
    function ramp(p) {                       // pIC50 to colour, 4.5 pale, 9.5 cobalt
        var t = clamp((p - 4.5) / 5.0, 0, 1), i, o = [];
        for (i = 0; i < 3; i++) o.push(Math.round(LOW[i] + (HI[i] - LOW[i]) * t));
        return o;
    }
    function rgb(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

    function layoutHeat() { if (!heatCells) buildCells(); }
    // 40 by 28 cells, each one keyed to the three compounds nearest to it
    function buildCells() {
        var COLS = 40, ROWS = 28, i, j, k, cells = [];
        for (j = 0; j < ROWS; j++) {
            for (i = 0; i < COLS; i++) {
                var cx = (i + 0.5) / COLS * 1050 - 25, cy = (j + 0.5) / ROWS * 700;
                var d0 = 1e9, d1 = 1e9, d2 = 1e9, i0 = 0, i1 = 0, i2 = 0;
                for (k = 0; k < N; k++) {
                    var dx = MX[k] - cx, dy = MY[k] - cy, d = dx * dx + dy * dy;
                    if (d < d0) { d2 = d1; i2 = i1; d1 = d0; i1 = i0; d0 = d; i0 = k; }
                    else if (d < d1) { d2 = d1; i2 = i1; d1 = d; i1 = k; }
                    else if (d < d2) { d2 = d; i2 = k; }
                }
                cells.push([i0, i1, i2, Math.sqrt(d0)]);
            }
        }
        heatCells = { cols: COLS, rows: ROWS, cells: cells };
        ui.heat.width = COLS; ui.heat.height = ROWS;
        heatCtx = ui.heat.getContext('2d');
    }
    function paintHeat() {
        if (!heatCells || !pred) return;
        var C = heatCells, ctx = heatCtx, n = 0, i, j;
        ctx.clearRect(0, 0, C.cols, C.rows);
        for (j = 0; j < C.rows; j++) {
            for (i = 0; i < C.cols; i++, n++) {
                var c = C.cells[n];
                var w0 = 1 / (1 + c[3] * c[3] * 0.002), w1 = 0.5 * w0, w2 = 0.25 * w0;
                var sw = w0 + w1 + w2;
                var p = (pred[c[0]] * w0 + pred[c[1]] * w1 + pred[c[2]] * w2) / sw;
                var uu = (unc[c[0]] * w0 + unc[c[1]] * w1 + unc[c[2]] * w2) / sw;
                var conf = clamp((1 - uu) * Math.exp(-c[3] / 150), 0, 1);
                var col = ramp(p), k, out = [];
                for (k = 0; k < 3; k++) out.push(Math.round(FOG[k] + (col[k] - FOG[k]) * conf));
                ctx.fillStyle = rgb(out);
                ctx.fillRect(i, j, 1, 1);
            }
        }
    }

    function buildMap() {
        ui.map.innerHTML = '';
        var gp = el('g', { 'class': 'fit-points' }, ui.map);
        pointNodes = [];
        for (var i = 0; i < N; i++) {
            var node = el('circle', {
                'class': 'fit-pt', cx: MX[i], cy: MY[i], r: 8, tabindex: '-1', role: 'button',
                'aria-label': names[i] ? names[i] : rows[i][0]
            }, gp);
            node.dataset.i = String(i);
            pointNodes.push(node);
        }
        el('g', { 'class': 'fit-marks' }, ui.map);
        show(ui.map, true);
    }
    function paintPoints() {
        for (var i = 0; i < N; i++) {
            var node = pointNodes[i], on = g && g.seen[i];
            node.setAttribute('r', on ? 11 : 8);
            node.setAttribute('class', 'fit-pt' + (on ? ' on' : '') + (on && y[i] >= 8 ? ' hit' : '') +
                                       (i === selected ? ' sel' : ''));
            node.style.fill = on ? rgb(ramp(y[i])) : '';
            if (on) node.setAttribute('aria-label', (names[i] || rows[i][0]) + ', measured pIC50 ' + fmt(y[i]));
        }
    }

    // ══════════════════════════════════════════════ molecule drawing
    function molOf(i) {
        if (!mols) return null;
        var m = mols[i], els = m.e.split(','), atoms = [], k;
        for (k = 0; k < els.length; k++) {
            atoms.push([els[k], m.xy[k * 2] / 100, m.xy[k * 2 + 1] / 100, parseInt(m.h.charAt(k), 10)]);
        }
        var bonds = [];
        for (k = 0; k < m.b.length; k += 4) bonds.push([m.b[k], m.b[k + 1], m.b[k + 2], m.b[k + 3]]);
        return { atoms: atoms, bonds: bonds, order: m.o };
    }
    function showMol(i, ms) { lastMol = i; drawMol(ui.mol, molOf(i), ms); }
    // draws itself atom by atom, with the geometry game.js uses
    function drawMol(svg, mol, ms) {
        svg.innerHTML = '';
        ui.card.hidden = !mol;
        if (!mol) return;
        var D = window.SBMDraw;
        var f = D.fit(mol, 300, 200, 26, 30);
        var gg = el('g', { 'class': 'mol' }, svg);
        var bg = el('g', {}, gg), ag = el('g', {}, gg);
        gg.style.setProperty('--stroke', Math.max(1.5, Math.min(2.4, f.s * 0.055)) + 'px');
        var labelled = mol.atoms.map(function (a) { return a[0] !== 'C'; });
        var total = REDUCE ? 900 : (ms || 2200);
        var at = [], k, step = total / Math.max(1, mol.order.length - 1);
        for (k = 0; k < mol.order.length; k++) at[mol.order[k]] = k * step;
        var items = [];
        mol.bonds.forEach(function (b) {
            var bb = at[b[0]] <= at[b[1]] ? b : [b[1], b[0], b[2], -b[3]];
            var node = el('g', { 'class': 'bond' }, bg);
            D.bondLines(bb, f.pts, f.s, labelled).forEach(function (sg) {
                el('line', {
                    pathLength: '1', x1: sg[0].toFixed(1), y1: sg[1].toFixed(1),
                    x2: sg[2].toFixed(1), y2: sg[3].toFixed(1)
                }, node);
            });
            items.push({ node: node, at: Math.max(at[b[0]], at[b[1]]) });
        });
        mol.atoms.forEach(function (a, idx) {
            if (!labelled[idx]) return;
            var lab = D.labelFor(a, idx, mol, f.pts);
            var anchor = lab.h ? (lab.before ? 'end' : 'start') : 'middle';
            var dx = anchor === 'start' ? -f.s * 0.16 : anchor === 'end' ? f.s * 0.16 : 0;
            var tn = el('text', {
                'class': 'atom ' + (LABELLED[a[0]] || 'el-x'), 'font-size': (f.s * 0.46).toFixed(1),
                'text-anchor': anchor, x: (f.pts[idx][0] + dx).toFixed(1),
                y: (f.pts[idx][1] + f.s * 0.16).toFixed(1)
            }, ag);
            var main = document.createElementNS(SVGNS, 'tspan');
            main.textContent = a[0];
            if (lab.h) {
                var hs = document.createElementNS(SVGNS, 'tspan');
                hs.textContent = 'H';
                var ns = null;
                if (lab.h > 1) {
                    ns = document.createElementNS(SVGNS, 'tspan');
                    ns.setAttribute('class', 'sub');
                    ns.setAttribute('dy', (f.s * 0.14).toFixed(1));
                    ns.textContent = String(lab.h);
                }
                if (lab.before) {
                    tn.appendChild(hs); if (ns) tn.appendChild(ns);
                    if (ns) main.setAttribute('dy', (-f.s * 0.14).toFixed(1));
                    tn.appendChild(main);
                } else {
                    tn.appendChild(main); tn.appendChild(hs); if (ns) tn.appendChild(ns);
                }
            } else tn.appendChild(main);
            items.push({ node: tn, at: at[idx] });
        });
        var t0 = performance.now();
        anims.push(function (now) {
            var e = now - t0, live = false, i;
            for (i = 0; i < items.length; i++) {
                if (!items[i].done && e >= items[i].at) { items[i].done = true; items[i].node.classList.add('on'); }
                if (!items[i].done) live = true;
            }
            return live;
        });
        start();
    }

    // ═══════════════════════════════════════════════════ the provenance
    function fillProvenance() {
        var out = '<ul>';
        meta.provenance.forEach(function (line) { out += '<li>' + esc(line) + '</li>'; });
        out += '</ul>';
        ui.prov.innerHTML = out;
    }

    // ═══════════════════════════════════════════════════════ step one
    function setStep(n) {
        [ui.step1, ui.step2, ui.step3].forEach(function (li, i) {
            if (!li) return;
            if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
            li.classList.toggle('done', i + 1 < n);
        });
    }
    function actions(list) {
        ui.actions.innerHTML = '';
        list.forEach(function (a) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'g-btn' + (a.primary ? ' g-btn--primary' : '');
            b.textContent = a.label;
            b.addEventListener('click', a.go);
            ui.actions.appendChild(b);
        });
        if (list.length && list[0].focus) ui.actions.firstChild.focus({ preventScroll: true });
    }
    function meterLine() {
        if (!g) { ui.meta.textContent = ''; return; }
        var best = g.best >= 0 ? fmt(y[g.best]) : 'nothing yet';
        ui.meta.innerHTML = '<span>assays left <strong>' + (g.budget - g.used) + '</strong></span>' +
                            '<span>best pIC50 <strong>' + best + '</strong></span>';
    }

    function newRun() {
        g = {
            seen: new Uint8Array(N), revealed: [], picks: [], budget: meta.game.assays, used: 0,
            best: -1, bestAssay: 0, hits: 0, warm: [], picker: null, compound: -1, docked: null,
            bet: null, step: 1
        };
        var chosen = {}, i;
        while (g.warm.length < meta.game.warm_reveals) {
            i = Math.floor(Math.random() * N);
            if (!chosen[i]) { chosen[i] = 1; g.warm.push(i); }
        }
        state = 'screen';
        root.setAttribute('data-state', 'screen');
        setStep(1);
        show(ui.stat, false);
        show(ui.map, true);
        ui.heat.style.opacity = '';
        show(ui.pocket, false);
        show(ui.chartwrap, false);
        ui.title.textContent = 'Screen';
        buildMap();
        g.warm.forEach(function (k) { reveal(k, true); });
        selected = -1;
        refreshModel();
        ui.say.textContent = 'Three compounds came already measured. Tap the map to pick one, tap it again to ' +
                             'spend an assay on it. The colour under the map is what the model expects.';
        ui.note.innerHTML = '';
        actions([]);
        meterLine();
        showMol(g.warm[g.warm.length - 1], 1600);
        ensureDock().catch(function () {});          // wanted at step 2, fetched now
    }

    function reveal(i, quiet) {
        if (g.seen[i]) return;
        g.seen[i] = 1;
        g.revealed.push(i);
        if (g.best < 0 || y[i] > y[g.best]) { g.best = i; g.bestAssay = quiet ? 0 : g.used + 1; }
        if (!quiet) {
            g.used++;
            g.picks.push(i);
            if (y[i] >= 8) g.hits++;
        }
    }
    function refreshModel() {
        var q = predict(g.revealed);
        pred = q.pred; unc = q.unc;
        paintHeat();
        paintPoints();
    }

    function selectPoint(i) {
        if (state !== 'screen' || i < 0) return;
        if (selected === i && !g.seen[i]) { assay(i); return; }
        selected = i;
        paintPoints();
        var line;
        if (g.seen[i]) {
            line = esc(rows[i][0]) + (names[i] ? ' · ' + esc(names[i]) : '') +
                   ' · measured pIC50 <b>' + fmt(y[i]) + '</b>';
        } else {
            line = esc(rows[i][0]) + ' · the model expects pIC50 <b>' + fmt(pred[i]) + '</b> · ' +
                   (unc[i] < 0.35 ? 'it has close neighbours here' : 'it has nothing similar to go on');
        }
        ui.note.innerHTML = line;
        if (!g.seen[i]) {
            actions([{ label: 'Measure it', primary: true, go: function () { assay(i); } }]);
        } else {
            actions([]);
            showMol(i, 1400);
        }
    }

    function assay(i) {
        if (state !== 'screen' || g.seen[i] || g.used >= g.budget) return;
        var guess = pred[i];
        reveal(i, false);
        selected = i;
        refreshModel();
        meterLine();
        showMol(i, 1800);
        var drug = meta.deck.pinned[rows[i][0]];
        var s = (drug ? drug.charAt(0).toUpperCase() + drug.slice(1) : rows[i][0]) +
                ' measures pIC50 ' + fmt(y[i]) + '. The model had guessed ' + fmt(guess) + '.';
        if (drug) s += ' That one is an approved EGFR drug.';
        else if (names[i]) s += ' ChEMBL calls it ' + names[i] + '.';
        ui.say.textContent = s;
        ui.note.innerHTML = y[i] >= 8 ? 'A hit. pIC50 8 or better means it works at 10 nanomolar or less.'
                                      : 'Not a hit. The bar is pIC50 8.';
        actions([]);
        if (g.used >= g.budget) setTimeout(runPicker, 900);
    }

    // the same model, playing the same eight assays from the same warm start
    function runPicker() {
        var taken = new Uint8Array(N), i, k, picks = [], revealed = g.warm.slice();
        for (i = 0; i < g.warm.length; i++) taken[g.warm[i]] = 1;
        for (k = 0; k < g.budget; k++) {
            var j = pickUCB(revealed, taken, meta.game.beta);
            taken[j] = 1; revealed.push(j); picks.push(j);
        }
        g.picker = { picks: picks, best: picks[0], hits: 0 };
        for (k = 0; k < picks.length; k++) {
            if (y[picks[k]] > y[g.picker.best]) g.picker.best = picks[k];
            if (y[picks[k]] >= 8) g.picker.hits++;
        }
        var marks = ui.map.querySelector('.fit-marks');
        picks.forEach(function (j, k) {
            var c = el('circle', { 'class': 'fit-mark', cx: MX[j], cy: MY[j], r: 15 }, marks);
            if (!REDUCE) c.style.animationDelay = (k * 70) + 'ms';
        });
        ui.title.textContent = 'Screen, done';
        ui.say.textContent = 'Your best is pIC50 ' + fmt(y[g.best]) +
            (g.bestAssay ? ', found on assay ' + g.bestAssay + '. ' : ', one of the three that came measured. ') +
            'The picker, the same model choosing for itself, reached ' + fmt(y[g.picker.best]) + '. ' +
            'In eight assays you hit pIC50 8 or better ' + g.hits + (g.hits === 1 ? ' time' : ' times') +
            ', the picker ' + g.picker.hits + '. Its picks are the hollow rings.';
        ui.note.innerHTML = 'Over ' + meta.model.n_games + ' simulated games the picker averages ' +
            fmt(meta.model.picker_mean_hits) + ' hits against ' + fmt(meta.model.random_mean_hits) +
            ' for random picking, a margin of ' + fmt(meta.model.margin_hits) + ' plus or minus ' +
            fmt(meta.model.margin_se) + '.';
        actions([{ label: 'Take your best to the pocket', primary: true, focus: true, go: toDock }]);
        state = 'screendone';
        root.setAttribute('data-state', 'screendone');
    }

    // ═══════════════════════════════════════════════════════ step two
    function toDock() {
        state = 'dock';
        root.setAttribute('data-state', 'dock');
        setStep(2);
        ui.title.textContent = 'Dock';
        ui.meta.textContent = '';
        ui.say.textContent = 'Loading the pocket.';
        ui.note.innerHTML = '';
        actions([]);
        ensureDock().then(startDock, function () {
            ui.say.textContent = 'The pocket data could not load, so there is nothing honest to draw here.';
            actions([{ label: 'Go to the simulation', primary: true, go: toSim },
                     { label: 'Play again', go: newRun }]);
        });
    }
    function ensureDock() {
        if (!dockP) dockP = getJSON('dock.json').then(function (d) { dock = d.poses; });
        return dockP;
    }

    var lig = null;   // { node, ax, ay, dx, dy, rot, home, target }
    function startDock() {
        var i = g.best, id = rows[i][0];
        if (!dock[id]) {
            var alt = -1, k;
            for (k = 0; k < N; k++) if (rows[k][0] === 'CHEMBL553') alt = k;
            g.compound = alt;
            ui.say.innerHTML = esc(id) + ' has no pose. AutoDock has no atom type for one of its atoms, so ' +
                'nothing was computed for it and nothing is faked here. Erlotinib takes its place.';
        } else {
            g.compound = i;
            ui.say.textContent = 'Your best compound is here, outside the pocket. Drag it in, or press Enter on it.';
        }
        drawPocket({ ghost: true });
        placeLigand();
        ensureMD().catch(function () {});             // wanted at step 3, fetched now
        showMol(g.compound, 1600);
        ui.note.innerHTML = 'The grey shapes are three depth slabs of the pocket wall. The pale outline is ' +
            'erlotinib where the crystal structure puts it.';
        actions([{ label: 'Drop it in', primary: true, go: dropIn }]);
        meterLine();
        ui.meta.innerHTML = '<span>compound <strong>' + esc(rows[g.compound][0]) + '</strong></span>' +
                            '<span>measured pIC50 <strong>' + fmt(y[g.compound]) + '</strong></span>';
    }

    function poseXY(p) {
        var out = [], k;
        for (k = 0; k < p.xy10.length; k += 2) out.push([p.xy10[k] / 10, p.xy10[k + 1] / 10]);
        return out;
    }
    function poseBonds(p) {
        var out = [], k;
        for (k = 0; k < p.b.length; k += 3) out.push([p.b[k], p.b[k + 1], p.b[k + 2], 0]);
        return out;
    }
    function centroid(pts) {
        var sx = 0, sy = 0, k;
        for (k = 0; k < pts.length; k++) { sx += pts[k][0]; sy += pts[k][1]; }
        return [sx / pts.length, sy / pts.length];
    }
    // one ligand as lines plus heteroatom labels, in pocket coordinates
    function ligandGroup(parent, p, cls) {
        var pts = poseXY(p), bonds = poseBonds(p), els = p.e.split(','), node = el('g', { 'class': cls }, parent);
        var s = 26;                       // pocket units per bond, close enough for the label gap maths
        var labelled = els.map(function (e) { return e !== 'C'; });
        bonds.forEach(function (b) {
            window.SBMDraw.bondLines(b, pts, s, labelled).forEach(function (sg) {
                el('line', { x1: sg[0].toFixed(1), y1: sg[1].toFixed(1), x2: sg[2].toFixed(1), y2: sg[3].toFixed(1) }, node);
            });
        });
        els.forEach(function (e, k) {
            if (e === 'C') return;
            var tn = el('text', {
                'class': 'atom on ' + (LABELLED[e] || 'el-x'), x: pts[k][0].toFixed(1),
                y: (pts[k][1] + 4).toFixed(1), 'text-anchor': 'middle', 'font-size': 12
            }, node);
            tn.textContent = e;
        });
        return { node: node, pts: pts, c: centroid(pts) };
    }

    function drawPocket(opts) {
        show(ui.map, false);
        ui.heat.style.opacity = '0';
        show(ui.pocket, true);
        ui.pocket.innerHTML = '';
        var slabs = el('g', { 'class': 'fit-slabs' }, ui.pocket), k;
        for (k = 0; k < pocket.slabs.length; k++) el('path', { d: pocket.slabs[k], 'class': 'slab s' + k }, slabs);
        var res = el('g', { 'class': 'fit-res' }, ui.pocket);
        pocket.residues.forEach(function (r, i) {
            var x = r[1] / 10, yy = r[2] / 10, key = !!KEY_RES[r[0]];
            el('circle', { cx: x, cy: yy, r: key ? 5 : 4, 'class': 'res-dot' + (key ? ' key' : '') }, res);
            var above = key || i % 2 === 0;
            var tn = el('text', {
                x: x.toFixed(1), y: (yy + (above ? -8 : 15)).toFixed(1), 'text-anchor': 'middle',
                'class': 'res-label' + (key ? ' key' : '')
            }, res);
            tn.textContent = r[0];
        });
        if (opts.ghost) {
            var ghost = ligandGroup(ui.pocket, pocket.poses.crystal, 'fit-ghost');
            ghost.node.setAttribute('aria-hidden', 'true');
        }
        el('g', { 'class': 'fit-contacts' }, ui.pocket);
    }

    function placeLigand() {
        var p = dock[rows[g.compound][0]] || pocket.poses.crystal;
        var L = ligandGroup(ui.pocket, p, 'fit-lig');
        L.node.setAttribute('tabindex', '0');
        L.node.setAttribute('role', 'button');
        L.node.setAttribute('aria-label', 'your compound, drag it into the pocket or press Enter');
        lig = { node: L.node, c: L.c, pts: L.pts, dx: 0, dy: 0, rot: 0, scale: 1, pose: p, home: null, in: false };
        var target = pocket.poses.crystal ? centroid(poseXY(pocket.poses.crystal)) : [300, 200];
        lig.target = target;
        // park it clear of the pocket, on the roomier side, small enough to fit the frame
        lig.home = [300, 348];
        lig.dx = lig.home[0] - L.c[0];
        lig.dy = lig.home[1] - L.c[1];
        lig.rot = -22;
        lig.scale = 0.62;
        applyLig();
        var ring = el('circle', {
            'class': 'fit-target', cx: target[0].toFixed(1), cy: target[1].toFixed(1), r: 58
        }, ui.pocket);
        ui.pocket.insertBefore(ring, lig.node);
        // a clean bench under the compound, so it reads as outside the protein
        var bb = ligBBox(), pad = 9;
        var bench = el('rect', {
            'class': 'fit-bench', x: (bb[0] - pad).toFixed(1), y: (bb[1] - pad).toFixed(1),
            width: (bb[2] - bb[0] + 2 * pad).toFixed(1), height: (bb[3] - bb[1] + 2 * pad).toFixed(1),
            rx: 6
        }, ui.pocket);
        ui.pocket.insertBefore(bench, lig.node);
        lig.bench = bench;
        dragWire();
    }
    // where the ligand's atoms land once the transform is applied
    function ligBBox() {
        var a = lig.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), s = lig.scale;
        var cx = lig.c[0], cy = lig.c[1], lo = [1e9, 1e9], hi = [-1e9, -1e9], k;
        for (k = 0; k < lig.pts.length; k++) {
            var x = lig.pts[k][0] * s + cx * (1 - s), yy = lig.pts[k][1] * s + cy * (1 - s);
            var rx = cx + (x - cx) * ca - (yy - cy) * sa + lig.dx;
            var ry = cy + (x - cx) * sa + (yy - cy) * ca + lig.dy;
            lo[0] = Math.min(lo[0], rx); lo[1] = Math.min(lo[1], ry);
            hi[0] = Math.max(hi[0], rx); hi[1] = Math.max(hi[1], ry);
        }
        return [lo[0], lo[1], hi[0], hi[1]];
    }
    function applyLig() {
        var s = lig.scale, cx = lig.c[0], cy = lig.c[1];
        lig.node.setAttribute('transform',
            'translate(' + lig.dx.toFixed(1) + ',' + lig.dy.toFixed(1) + ') ' +
            'rotate(' + lig.rot.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ') ' +
            'translate(' + (cx * (1 - s)).toFixed(1) + ',' + (cy * (1 - s)).toFixed(1) + ') ' +
            'scale(' + s.toFixed(3) + ')');
    }
    function svgPoint(evt) {
        var p = ui.pocket.createSVGPoint();
        p.x = evt.clientX; p.y = evt.clientY;
        var m = ui.pocket.getScreenCTM();
        return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
    }
    function dragWire() {
        var from = null;
        lig.node.addEventListener('pointerdown', function (e) {
            if (lig.in) return;
            e.preventDefault();
            lig.node.setPointerCapture(e.pointerId);
            var p = svgPoint(e);
            from = { x: p.x, y: p.y, dx: lig.dx, dy: lig.dy };
            lig.node.classList.add('dragging');
        });
        lig.node.addEventListener('pointermove', function (e) {
            if (!from) return;
            var p = svgPoint(e);
            lig.dx = from.dx + (p.x - from.x);
            lig.dy = from.dy + (p.y - from.y);
            applyLig(); moveBench();
        });
        function end() {
            if (!from) return;
            from = null;
            lig.node.classList.remove('dragging');
            var cx = lig.c[0] + lig.dx, cy = lig.c[1] + lig.dy;
            var d = Math.hypot(cx - lig.target[0], cy - lig.target[1]);
            if (d < 95) dropIn(); else springHome();
        }
        lig.node.addEventListener('pointerup', end);
        lig.node.addEventListener('pointercancel', end);
        lig.node.addEventListener('keydown', function (e) {
            if (lig.in) return;
            var step = 14;
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dropIn(); return; }
            if (e.key === 'ArrowLeft') lig.dx -= step;
            else if (e.key === 'ArrowRight') lig.dx += step;
            else if (e.key === 'ArrowUp') lig.dy -= step;
            else if (e.key === 'ArrowDown') lig.dy += step;
            else return;
            e.preventDefault();
            applyLig(); moveBench();
        });
    }
    function moveBench() {
        if (!lig.bench) return;
        var bb = ligBBox(), pad = 9;
        lig.bench.setAttribute('x', (bb[0] - pad).toFixed(1));
        lig.bench.setAttribute('y', (bb[1] - pad).toFixed(1));
        lig.bench.setAttribute('width', (bb[2] - bb[0] + 2 * pad).toFixed(1));
        lig.bench.setAttribute('height', (bb[3] - bb[1] + 2 * pad).toFixed(1));
    }
    function tween(ms, step, done) {
        var t0 = performance.now();
        anims.push(function (now) {
            var t = clamp((now - t0) / ms, 0, 1);
            step(REDUCE ? 1 : easeOut(t));
            if (t >= 1 || REDUCE) { if (done) done(); return false; }
            return true;
        });
        start();
    }
    function springHome() {
        var d0 = lig.dx, d1 = lig.dy;
        var hx = lig.home[0] - lig.c[0], hy = lig.home[1] - lig.c[1];
        tween(420, function (t) {
            lig.dx = d0 + (hx - d0) * t; lig.dy = d1 + (hy - d1) * t; applyLig(); moveBench();
        });
    }
    function dropIn() {
        if (!lig || lig.in) return;
        lig.in = true;
        lig.node.removeAttribute('tabindex');
        var d0 = lig.dx, d1 = lig.dy, r0 = lig.rot, s0 = lig.scale;
        tween(760, function (t) {
            lig.dx = d0 * (1 - t); lig.dy = d1 * (1 - t); lig.rot = r0 * (1 - t);
            lig.scale = s0 + (1 - s0) * t;
            applyLig(); moveBench();
        }, docked);
        if (lig.bench) lig.bench.classList.add('gone');
        var ring = ui.pocket.querySelector('.fit-target');
        if (ring) ring.classList.add('gone');
    }
    function docked() {
        var p = lig.pose, id = rows[g.compound][0];
        var score = p.s100 !== undefined ? p.s100 / 100 : null;
        if (score !== null) g.docked = { id: id, score: score };
        var hb = (p.c || []).filter(function (c) { return c[1] === 0; });
        var cg = ui.pocket.querySelector('.fit-contacts');
        var pts = poseXY(p), resAt = {};
        pocket.residues.forEach(function (r) { resAt[r[0]] = [r[1] / 10, r[2] / 10]; });
        hb.forEach(function (c, k) {
            var a = pts[c[2]], b = resAt[c[0]];
            if (!a || !b) return;
            var ln = el('line', {
                'class': 'contact', x1: a[0].toFixed(1), y1: a[1].toFixed(1),
                x2: b[0].toFixed(1), y2: b[1].toFixed(1)
            }, cg);
            if (!REDUCE) ln.style.animationDelay = (200 + k * 90) + 'ms';
        });
        ui.say.textContent = score === null
            ? 'That is the crystal pose from 1M17, an experiment rather than a docking run, so there is no Vina ' +
              'score to print for it.'
            : 'Vina scores this pose at ' + fmt(score) + ' kcal/mol. Scores only compare inside this box and this ' +
              'protein, so the number means nothing on its own.';
        var list = hb.map(function (c) { return c[0]; });
        ui.note.innerHTML = list.length
            ? 'Hydrogen bonds in this pose, drawn as dashes: ' + esc(list.join(', ')) + '. Met769 is the hinge.'
            : 'This pose makes no hydrogen bond to a pocket residue.';
        actions([{ label: 'Now the hard part', primary: true, focus: true, go: toSim }]);
        state = 'dockdone';
        root.setAttribute('data-state', 'dockdone');
    }

    // ═════════════════════════════════════════════════════ step three
    function toSim() {
        state = 'simulate';
        root.setAttribute('data-state', 'simulate');
        setStep(3);
        ui.title.textContent = 'Simulate';
        ui.say.textContent = 'Loading the runs.';
        ui.note.innerHTML = '';
        actions([]);
        ensureMD().then(startSim, function () {
            ui.say.textContent = 'The simulation data could not load, so there is nothing honest to draw here.';
            actions([{ label: 'Play again', primary: true, go: newRun }]);
        });
    }
    function ensureMD() {
        if (!mdP) mdP = getJSON('md.json').then(function (d) { mdata = d; });
        return mdP;
    }
    var poseNodes = {};
    function startSim() {
        drawPocket({ ghost: false });
        poseNodes = {};
        var legend = el('g', { 'class': 'pose-legend' }, ui.pocket);
        ['A', 'B'].forEach(function (k, n) {
            poseNodes[k] = ligandGroup(ui.pocket, pocket.poses[k], 'fit-pose pose-' + k);
            var yy = 22 + n * 18;
            el('line', { 'class': 'swatch pose-' + k, x1: 14, y1: yy - 4, x2: 34, y2: yy - 4 }, legend);
            var tag = el('text', { 'class': 'pose-tag pose-' + k, x: 40, y: yy }, legend);
            tag.textContent = 'pose ' + k + ', ' + fmt(meta.poses[k].score) + ' kcal/mol';
        });
        ui.pocket.appendChild(legend);
        ui.meta.innerHTML = '<span>pose A <strong>' + fmt(meta.poses.A.score) + '</strong></span>' +
                            '<span>pose B <strong>' + fmt(meta.poses.B.score) + '</strong></span>';
        ui.say.textContent = 'Two erlotinib poses from the same docking run. ' + fmt(meta.poses.A.score) +
            ' and ' + fmt(meta.poses.B.score) + ' kcal/mol, a gap of five hundredths. Docking cannot tell ' +
            'these apart. Which one holds?';
        ui.note.innerHTML = 'One of them sits ' + fmt(meta.poses.A.rmsd_to_crystal, 2) + ' Angstrom from the ' +
            'crystal pose, the other ' + fmt(meta.poses.B.rmsd_to_crystal, 2) + ', but the scores do not say which.';
        showMol(erlotinibIndex(), 1600);
        actions([
            { label: 'Pose A holds', primary: true, focus: true, go: function () { bet('A'); } },
            { label: 'Pose B holds', go: function () { bet('B'); } }
        ]);
    }
    function erlotinibIndex() {
        for (var k = 0; k < N; k++) if (rows[k][0] === 'CHEMBL553') return k;
        return 0;
    }
    function bet(which) {
        g.bet = which;
        actions([]);
        ui.say.textContent = 'You backed pose ' + which + '. Two nanoseconds of molecular dynamics, seed 1 of ' +
            'each pose, playing now.';
        ui.note.innerHTML = 'The lines are the ligand heavy atom RMSD from where each pose started. The ' +
            'dashed rule is the 2.5 Angstrom bar, written down before the runs.';
        show(ui.chartwrap, true);
        playMD();
    }
    function chartSetup() {
        ui.chart.innerHTML = '';
        var W = 600, H = 210, L = 46, R = 12, T = 14, B = 30;
        var maxT = (mdata.play.A.rmsd100.length - 1) * mdata.play.A.ps_per_frame / 1000;
        var maxY = 7;
        var ax = el('g', { 'class': 'chart-ax' }, ui.chart), k;
        for (k = 0; k <= 6; k += 2) {
            var yy = H - B - (k / maxY) * (H - B - T);
            el('line', { x1: L, y1: yy, x2: W - R, y2: yy, 'class': 'grid' }, ax);
            var tn = el('text', { x: L - 8, y: yy + 4, 'text-anchor': 'end' }, ax);
            tn.textContent = k;
        }
        for (k = 0; k <= 2; k++) {
            var xx = L + (k / maxT) * (W - L - R);
            var tt = el('text', { x: xx, y: H - 10, 'text-anchor': 'middle' }, ax);
            tt.textContent = k + ' ns';
        }
        var yl = el('text', { x: L, y: T + 2, 'class': 'unit' }, ax);
        yl.textContent = 'ligand RMSD from its starting pose, in Angstrom';
        var bar = el('line', { x1: L, y1: H - B - (2.5 / maxY) * (H - B - T), x2: W - R,
                               y2: H - B - (2.5 / maxY) * (H - B - T), 'class': 'bar' }, ax);
        var bt = el('text', { x: L + 5, y: H - B - (2.5 / maxY) * (H - B - T) - 5, 'class': 'unit' }, ax);
        bt.textContent = '2.5 A';
        return { W: W, H: H, L: L, R: R, T: T, B: B, maxT: maxT, maxY: maxY };
    }
    function playMD() {
        var c = chartSetup();
        var paths = {}, k;
        ['A', 'B'].forEach(function (p) {
            paths[p] = el('polyline', { 'class': 'series s-' + p, points: '', fill: 'none' }, ui.chart);
            poseNodes[p].node.classList.add('running');
        });
        var bonds = [];
        for (k = 0; k < mdata.ligand.b.length; k += 3) {
            bonds.push([mdata.ligand.b[k], mdata.ligand.b[k + 1], mdata.ligand.b[k + 2], 0]);
        }
        var els = mdata.ligand.e.split(','), labelled = els.map(function (e) { return e !== 'C'; });
        var nf = mdata.play.A.frames10.length, fps = 20, t0 = performance.now();

        function frameAt(p, f) {
            var fr = mdata.play[p].frames10[f], pts = [], i;
            for (i = 0; i < fr.length; i += 2) pts.push([fr[i] / 10, fr[i + 1] / 10]);
            return pts;
        }
        function drawFrame(p, f) {
            var pts = frameAt(p, f), node = poseNodes[p].node, segs = [], i;
            bonds.forEach(function (b) {
                window.SBMDraw.bondLines(b, pts, 26, labelled).forEach(function (sg) { segs.push(sg); });
            });
            var ln = node.querySelectorAll('line');
            for (i = 0; i < ln.length && i < segs.length; i++) {
                ln[i].setAttribute('x1', segs[i][0].toFixed(1)); ln[i].setAttribute('y1', segs[i][1].toFixed(1));
                ln[i].setAttribute('x2', segs[i][2].toFixed(1)); ln[i].setAttribute('y2', segs[i][3].toFixed(1));
            }
            var tx = node.querySelectorAll('text'), n = 0;
            els.forEach(function (e, k2) {
                if (e === 'C') return;
                if (tx[n]) {
                    tx[n].setAttribute('x', pts[k2][0].toFixed(1));
                    tx[n].setAttribute('y', (pts[k2][1] + 4).toFixed(1));
                }
                n++;
            });
        }
        function drawSeries(p, upto) {
            var s = mdata.play[p].rmsd100, out = [], i;
            for (i = 0; i <= upto && i < s.length; i++) {
                var x = c.L + (i * mdata.play[p].ps_per_frame / 1000 / c.maxT) * (c.W - c.L - c.R);
                var yy = c.H - c.B - clamp(s[i] / 100 / c.maxY, 0, 1) * (c.H - c.B - c.T);
                out.push(x.toFixed(1) + ',' + yy.toFixed(1));
            }
            paths[p].setAttribute('points', out.join(' '));
        }
        if (REDUCE) {
            drawFrame('A', nf - 1); drawFrame('B', nf - 1);
            drawSeries('A', nf - 1); drawSeries('B', nf - 1);
            verdict();
            return;
        }
        anims.push(function (now) {
            var f = Math.floor((now - t0) / 1000 * fps);
            if (f >= nf) {
                drawFrame('A', nf - 1); drawFrame('B', nf - 1);
                drawSeries('A', nf - 1); drawSeries('B', nf - 1);
                verdict();
                return false;
            }
            drawFrame('A', f); drawFrame('B', f);
            drawSeries('A', f); drawSeries('B', f);
            var ns = (f * mdata.play.A.ps_per_frame / 1000);
            ui.meta.innerHTML = '<span>seed 1 · <strong>' + ns.toFixed(2) + '</strong> ns</span>' +
                '<span>A <strong>' + fmt(mdata.play.A.rmsd100[f] / 100) + '</strong> A</span>' +
                '<span>B <strong>' + fmt(mdata.play.B.rmsd100[f] / 100) + '</strong> A</span>';
            return true;
        });
        start();
    }
    function verdict() {
        var v = mdata.verdicts, right = g.bet === 'A';
        poseNodes.A.node.classList.add('held');
        poseNodes.B.node.classList.add('drifted');
        ui.meta.innerHTML = '<span>A <strong>holds</strong></span><span>B <strong>drifts</strong></span>';
        ui.say.textContent = (right ? 'You were right. ' : 'Not this time. ') +
            'Pose A held in ' + v.A.seeds_holding + ' of ' + v.A.seeds + ' seeds, median RMSD over the last ' +
            'nanosecond ' + v.A.median_rmsd_last_1ns.join(', ') + ' Angstrom. Pose B drifted in all ' +
            v.B.seeds + ', at ' + v.B.median_rmsd_last_1ns.join(', ') + ' Angstrom.';
        var hinge = mdata.runs.filter(function (r) { return r.pose === 'A'; }).map(function (r) { return r.hinge_pct; });
        ui.note.innerHTML = 'Pose A keeps the Met769 hinge contact in ' + Math.min.apply(null, hinge) + ' to ' +
            Math.max.apply(null, hinge) + ' percent of frames. Pose B never makes it. ' +
            'The rule, written before the runs: a pose holds if the median stays under 2.5 Angstrom in at ' +
            'least 2 of 3 seeds.';
        actions([
            { label: 'See the run', primary: true, focus: true, go: finish },
            { label: 'Play again', go: newRun }
        ]);
    }

    // ═══════════════════════════════════════════════════════════ end
    function finish() {
        state = 'done';
        root.setAttribute('data-state', 'done');
        ui.title.textContent = 'Your run';
        ui.meta.textContent = '';
        var d = g.docked;
        ui.say.innerHTML = 'You spent ' + g.budget + ' assays on a deck of ' + N + '. Your best was pIC50 <b>' +
            fmt(y[g.best]) + '</b>' + (g.bestAssay ? ', on assay ' + g.bestAssay + '. ' :
            ', one of the three that came measured. ') +
            (d ? esc(d.id) + ' docked at <b>' + fmt(d.score) + '</b> kcal/mol. ' : '') +
            'You backed pose ' + g.bet + ', which ' + (g.bet === 'A' ? 'held.' : 'drifted.');
        ui.note.innerHTML = 'The model is the only thing here that ran in your browser. The poses and the ' +
            'trajectories were computed on a laptop before you arrived.';
        actions([
            { label: 'Play again', primary: true, focus: true, go: newRun },
            { label: 'Copy the run', go: copyRun }
        ]);
    }
    function copyRun() {
        var d = g.docked;
        var text = 'Find a drug: I screened ' + N + ' EGFR compounds with ' + g.budget + ' assays, best pIC50 ' +
            fmt(y[g.best]) + ', docked ' + (d ? d.id + ' at ' + fmt(d.score) + ' kcal/mol' : 'nothing') +
            ', and backed pose ' + g.bet + '. ' + SITE;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                var b = ui.actions.querySelectorAll('button')[1];
                if (b) { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy the run'; }, 1600); }
            }, function () {});
        }
    }

    // ═══════════════════════════════════════════════════ the frame loop
    function loop(now) {
        rafId = 0;
        if (!visible || document.hidden) return;
        for (var i = anims.length - 1; i >= 0; i--) {
            if (!anims[i](now)) anims.splice(i, 1);
        }
        if (anims.length) rafId = requestAnimationFrame(loop);
    }
    function start() {
        if (!rafId && visible && !document.hidden && anims.length) rafId = requestAnimationFrame(loop);
    }
    function pause() { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
            visible = e[0].isIntersecting;
            if (visible) start(); else pause();
        }, { threshold: 0.02 }).observe(root);
    } else visible = true;
    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else start(); });
    window.addEventListener('resize', function () {
        if (state === 'screen' || state === 'screendone') { layoutHeat(); paintHeat(); }
    });

    // ═════════════════════════════════════════════════ map interaction
    function nearest(x, yy, within) {
        var b = -1, bd = within * within, i;
        for (i = 0; i < N; i++) {
            var dx = MX[i] - x, dy = MY[i] - yy, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; b = i; }
        }
        return b;
    }
    function mapPoint(evt) {
        var p = ui.map.createSVGPoint();
        p.x = evt.clientX; p.y = evt.clientY;
        var m = ui.map.getScreenCTM();
        return m ? p.matrixTransform(m.inverse()) : null;
    }
    // click, not pointerdown, so a finger dragging the page still scrolls
    ui.map.addEventListener('click', function (e) {
        if (state !== 'screen') return;
        var p = mapPoint(e);
        if (!p) return;
        // a generous radius, so a finger does not have to be exact
        var box = ui.map.getBoundingClientRect();
        var unitsPerPx = 1050 / Math.max(1, box.width);
        var i = nearest(p.x, p.y, Math.max(26, 20 * unitsPerPx));
        if (i >= 0) { selectPoint(i); pointNodes[i].focus({ preventScroll: true }); }
    });
    ui.map.addEventListener('keydown', function (e) {
        if (state !== 'screen') return;
        var i = selected, k;
        if (e.key === 'Enter' || e.key === ' ') {
            if (i >= 0 && !g.seen[i]) { e.preventDefault(); assay(i); }
            return;
        }
        var dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (!dir) return;
        e.preventDefault();
        if (i < 0) { selectPoint(0); pointNodes[0].focus({ preventScroll: true }); return; }
        var best = -1, bv = 1e9;
        for (k = 0; k < N; k++) {
            if (k === i) continue;
            var dx = MX[k] - MX[i], dy = MY[k] - MY[i];
            var along = dx * dir[0] + dy * dir[1], across = Math.abs(dx * dir[1] - dy * dir[0]);
            if (along <= 2) continue;
            var cost = along + across * 2.2;
            if (cost < bv) { bv = cost; best = k; }
        }
        if (best >= 0) { selectPoint(best); pointNodes[best].focus({ preventScroll: true }); }
    });

    // ═══════════════════════════════════════════════════════════ boot
    function ready() {
        state = 'ready';
        root.setAttribute('data-state', 'ready');
        show(ui.stat, false);
        show(ui.map, true);
        ui.title.textContent = 'Screen, dock, simulate';
        ui.say.innerHTML = 'Three steps, about ninety seconds. <b>' + N + '</b> real EGFR compounds from ChEMBL ' +
            'sit on the map, similar molecules near each other. Three come measured, you get ' +
            meta.game.assays + ' assays, and a model in this browser learns from every result.';
        ui.note.innerHTML = 'Then your best compound goes into the pocket of a real crystal structure, and ' +
            'molecular dynamics settles a question docking cannot answer.';
        actions([{ label: 'Play', primary: true, go: newRun }]);
        ui.card.hidden = true;
        buildMap();
        pred = new Float32Array(N); unc = new Float32Array(N);
        for (var i = 0; i < N; i++) { pred[i] = 6; unc[i] = 1; }
        layoutHeat();
        paintHeat();
    }
    function boot() {
        Promise.all([getJSON('meta.json'), getJSON('screen.json'), getJSON('fp.json'), getJSON('pocket.json')])
            .then(function (all) {
                meta = all[0];
                rows = all[1].rows;
                N = rows.length;
                y = new Float32Array(N); MX = new Float32Array(N); MY = new Float32Array(N);
                for (var i = 0; i < N; i++) {
                    MX[i] = rows[i][1]; MY[i] = rows[i][2]; y[i] = rows[i][3] / 100;
                    names.push(rows[i][6] || '');
                }
                SD = meta.game.sd_y;
                SIM = buildSim(unpackFP(all[2].fp), N);
                pocket = all[3];
                fillProvenance();
                ready();
                getJSON('mols.json').then(function (d) {                        // wanted by the first reveal
                    mols = d.mols;
                    if (lastMol >= 0 && ui.card.hidden) showMol(lastMol, 1200);
                });
                return null;
            })
            .catch(function (err) {
                root.setAttribute('data-state', 'broken');
                ui.say.textContent = 'The game data could not load. Everything else on the page still works.';
                if (window.console) console.warn('fitdrug', err);
            });
    }
    boot();
})();
