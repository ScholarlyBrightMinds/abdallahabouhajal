/* ═══════════════════════════════════════════════════════════════════
   game.js · Name the molecule

   A famous molecule draws itself one atom at a time. Name it before the
   drawing finishes and you score more. Ten rounds.

   Structures come from data/molecules.json, which build_molecules.py makes
   with RDKit. Nothing here knows any chemistry: it only draws lines.

   Motion, and what each piece is for:
     draw-in   the game itself, the clock you are racing
     jiggle    atoms vibrate a little, so a molecule reads as a thing
     breathe   a correct answer makes the molecule pulse once
     shake     a wrong answer shakes the stage once
   Reduced motion keeps the progressive reveal (it is the game) as fades,
   and drops jiggle, breathe and shake.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var root = document.querySelector('[data-game]');
    if (!root) return;

    var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ROUNDS = 10;
    var VBW = 600, VBH = 400, PAD = 44, MAX_BOND = 50;
    var SVGNS = 'http://www.w3.org/2000/svg';
    var BEST_KEY = 'sbm-molecule-best';
    var SITE = 'https://scholarlybrightminds.github.io/abdallahabouhajal/';
    var LABELLED = { O: 'el-o', N: 'el-n', S: 'el-s', F: 'el-x', Cl: 'el-x', Br: 'el-x', P: 'el-s' };

    function $(name) { return root.querySelector('[data-g="' + name + '"]'); }
    var ui = {
        svg: $('svg'), stage: $('stage'), meta: $('meta'), intro: $('intro'), play: $('play'),
        best: $('best'), choices: $('choices'), foot: $('foot'), hint: $('hint'), fact: $('fact'),
        next: $('next'), end: $('end'), final: $('final'), summary: $('summary'), recap: $('recap'),
        actions: $('actions'), again: $('again'), share: $('share')
    };

    var deck = [];
    var state = 'loading';          // loading | idle | question | answered | done
    var game = null;                // { rounds, index, score, right, early, results }
    var scene = null;               // the molecule currently on stage
    var visible = true;
    var rafId = 0;

    // ── helpers ─────────────────────────────────────────────────────
    function el(tag, attrs, parent) {
        var n = document.createElementNS(SVGNS, tag);
        for (var k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    }
    function shuffle(a) {
        a = a.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }
    function esc(t) {
        return String(t).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function readBest() { try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { return 0; } }
    function writeBest(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {} }

    // ── geometry ────────────────────────────────────────────────────
    function fit(mol, w, h, pad, maxBond) {
        var xs = mol.atoms.map(function (a) { return a[1]; });
        var ys = mol.atoms.map(function (a) { return a[2]; });
        var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
        var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
        var s = Math.min((w - 2 * pad) / Math.max(maxX - minX, 1), (h - 2 * pad) / Math.max(maxY - minY, 1), maxBond);
        var ox = w / 2 - (minX + maxX) / 2 * s, oy = h / 2 - (minY + maxY) / 2 * s;
        return { s: s, pts: mol.atoms.map(function (a) { return [a[1] * s + ox, a[2] * s + oy]; }) };
    }

    // Lines for one bond, given current atom positions. Double bonds in a
    // ring put their second line inside the ring, as a chemist would draw it.
    function bondLines(bond, P, s, labelled) {
        var i = bond[0], j = bond[1], order = bond[2], side = bond[3];
        var ax = P[i][0], ay = P[i][1], bx = P[j][0], by = P[j][1];
        var dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
        var ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
        var gap = 0.36 * s;
        var ga = labelled[i] ? gap : 0, gb = labelled[j] ? gap : 0;
        var x1 = ax + ux * ga, y1 = ay + uy * ga, x2 = bx - ux * gb, y2 = by - uy * gb;
        var out = [];
        function push(ox, oy, trimA, trimB) {
            out.push([x1 + ux * trimA + nx * ox, y1 + uy * trimA + ny * ox, x2 - ux * trimB + nx * ox, y2 - uy * trimB + ny * ox]);
        }
        if (order === 1) push(0, 0, 0, 0);
        else if (order === 2 && side === 0) { push(0.09 * s, 0, 0, 0); push(-0.09 * s, 0, 0, 0); }
        else if (order === 2) { push(0, 0, 0, 0); push(0.2 * s * side, 0, 0.17 * len, 0.17 * len); }
        else { push(0, 0, 0, 0); push(0.15 * s, 0, 0, 0); push(-0.15 * s, 0, 0, 0); }
        return out;
    }

    function labelFor(atom, idx, mol, P) {
        var sym = atom[0], h = atom[3];
        if (!h) return { text: sym, sub: '' };
        // hydrogens go on the side away from the neighbours: HO on the left, OH on the right
        var sum = 0, n = 0;
        mol.bonds.forEach(function (b) {
            if (b[0] === idx) { sum += P[b[1]][0]; n++; }
            else if (b[1] === idx) { sum += P[b[0]][0]; n++; }
        });
        var right = n && (sum / n) > P[idx][0];
        return { text: sym, h: h, before: right };
    }

    // ── build a molecule on the big stage ───────────────────────────
    function buildScene(mol, opts) {
        opts = opts || {};
        ui.svg.innerHTML = '';
        // on a narrow stage the viewBox shrinks, so let bonds grow to stay readable
        var stageW = ui.stage.clientWidth || VBW;
        var maxBond = MAX_BOND * Math.min(1.7, Math.max(1, 560 / stageW));
        var f = fit(mol, VBW, VBH, PAD, maxBond);
        var g = el('g', { 'class': 'mol' }, ui.svg);
        var bondG = el('g', { 'class': 'bonds' }, g);
        var atomG = el('g', { 'class': 'atoms' }, g);
        var stroke = Math.max(1.7, Math.min(2.8, f.s * 0.058));
        g.style.setProperty('--stroke', stroke + 'px');

        var labelled = mol.atoms.map(function (a) { return !!LABELLED[a[0]] || (a[0] !== 'C'); });
        var revealAt = new Array(mol.atoms.length);
        var total = REDUCE ? Math.max(2600, mol.atoms.length * 230) : Math.min(7000, Math.max(3400, mol.atoms.length * 270));
        if (opts.duration) total = opts.duration;
        var step = total / Math.max(1, mol.order.length - 1);
        mol.order.forEach(function (atomIdx, k) { revealAt[atomIdx] = k * step; });

        var bonds = mol.bonds.map(function (b) {
            // grow each bond out of the atom that appeared first
            var bb = revealAt[b[0]] <= revealAt[b[1]] ? b : [b[1], b[0], b[2], -b[3]];
            var node = el('g', { 'class': 'bond' }, bondG);
            var lines = bondLines(bb, f.pts, f.s, labelled).map(function () {
                return el('line', { pathLength: '1' }, node);
            });
            return { data: bb, node: node, lines: lines, at: Math.max(revealAt[b[0]], revealAt[b[1]]), on: false };
        });

        var atoms = [];
        mol.atoms.forEach(function (a, idx) {
            if (!labelled[idx]) return;
            var lab = labelFor(a, idx, mol, f.pts);
            var t = el('text', { 'class': 'atom ' + (LABELLED[a[0]] || 'el-x'), 'font-size': (f.s * 0.46).toFixed(1) }, atomG);
            var main = document.createElementNS(SVGNS, 'tspan');
            main.textContent = a[0];
            if (lab.h) {
                var hSpan = document.createElementNS(SVGNS, 'tspan');
                hSpan.textContent = 'H';
                var nSpan = null;
                if (lab.h > 1) {
                    nSpan = document.createElementNS(SVGNS, 'tspan');
                    nSpan.setAttribute('class', 'sub');
                    nSpan.setAttribute('dy', (f.s * 0.14).toFixed(1));
                    nSpan.textContent = String(lab.h);
                }
                if (lab.before) {
                    t.appendChild(hSpan); if (nSpan) t.appendChild(nSpan);
                    if (nSpan) main.setAttribute('dy', (-f.s * 0.14).toFixed(1));
                    t.appendChild(main);
                    t.setAttribute('text-anchor', 'end');
                    t.dataset.anchor = 'end';
                } else {
                    t.appendChild(main); t.appendChild(hSpan); if (nSpan) t.appendChild(nSpan);
                    t.setAttribute('text-anchor', 'start');
                    t.dataset.anchor = 'start';
                }
            } else {
                t.appendChild(main);
                t.setAttribute('text-anchor', 'middle');
                t.dataset.anchor = 'middle';
            }
            atoms.push({ idx: idx, node: t, at: revealAt[idx], on: false });
        });

        // each atom vibrates on its own two frequencies
        var phases = mol.atoms.map(function () {
            return [Math.random() * 6.28, Math.random() * 6.28, 1.3 + Math.random() * 1.2, 1.1 + Math.random() * 1.3];
        });

        scene = {
            mol: mol, g: g, base: f.pts, s: f.s, labelled: labelled, bonds: bonds, atoms: atoms,
            phases: phases, total: total, start: performance.now(), paused: 0, pausedAt: 0,
            breatheAt: -1, done: false, finishedAt: 0
        };
        paint(performance.now());
    }

    function elapsed(now) {
        if (!scene) return 0;
        var t = (scene.pausedAt || now) - scene.start - scene.paused;
        return Math.max(0, t);
    }

    function progress(now) { return scene ? Math.min(1, elapsed(now) / scene.total) : 1; }

    function paint(now) {
        if (!scene) return;
        var t = elapsed(now);
        var sec = now / 1000;
        var P = scene.base;
        var amp = REDUCE ? 0 : scene.s * 0.045;

        // a correct answer makes the molecule breathe out and settle
        var k = 1;
        if (scene.breatheAt >= 0 && !REDUCE) {
            var bt = now - scene.breatheAt;
            k = 1 + 0.16 * Math.exp(-bt / 230) * Math.sin(bt * 2 * Math.PI / 430);
            if (bt > 1400) scene.breatheAt = -1;
        }
        var cx = VBW / 2, cy = VBH / 2;
        var Q = P.map(function (p, i) {
            var ph = scene.phases[i];
            var x = cx + (p[0] - cx) * k + Math.sin(sec * ph[2] * 6.28 + ph[0]) * amp;
            var y = cy + (p[1] - cy) * k + Math.cos(sec * ph[3] * 6.28 + ph[1]) * amp;
            return [x, y];
        });

        scene.bonds.forEach(function (b) {
            if (!b.on && t >= b.at) { b.on = true; b.node.classList.add('on'); }
            var segs = bondLines(b.data, Q, scene.s, scene.labelled);
            for (var i = 0; i < b.lines.length; i++) {
                var sgm = segs[i];
                b.lines[i].setAttribute('x1', sgm[0].toFixed(1));
                b.lines[i].setAttribute('y1', sgm[1].toFixed(1));
                b.lines[i].setAttribute('x2', sgm[2].toFixed(1));
                b.lines[i].setAttribute('y2', sgm[3].toFixed(1));
            }
        });
        scene.atoms.forEach(function (a) {
            if (!a.on && t >= a.at) { a.on = true; a.node.classList.add('on'); }
            var q = Q[a.idx];
            var dx = a.node.dataset.anchor === 'start' ? -scene.s * 0.16 : a.node.dataset.anchor === 'end' ? scene.s * 0.16 : 0;
            a.node.setAttribute('x', (q[0] + dx).toFixed(1));
            a.node.setAttribute('y', (q[1] + scene.s * 0.16).toFixed(1));
        });

        if (!scene.done && t >= scene.total) {
            scene.done = true;
            scene.finishedAt = now;
        }
    }

    function revealAll() {
        if (!scene) return;
        scene.bonds.forEach(function (b) { b.on = true; b.node.classList.add('on'); });
        scene.atoms.forEach(function (a) { a.on = true; a.node.classList.add('on'); });
        scene.total = Math.min(scene.total, elapsed(performance.now()));
    }

    // ── frame loop: only runs while the game is on screen ───────────
    function loop(now) {
        rafId = 0;
        if (!visible || document.hidden) return;
        paint(now);
        tick(now);
        rafId = requestAnimationFrame(loop);
    }
    function start() { if (!rafId && visible && !document.hidden) rafId = requestAnimationFrame(loop); }
    function pause() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        if (scene && !scene.pausedAt) scene.pausedAt = performance.now();
    }
    function resume() {
        if (scene && scene.pausedAt) { scene.paused += performance.now() - scene.pausedAt; scene.pausedAt = 0; }
        start();
    }

    // state-specific work each frame
    var idleSwapAt = 0;
    function tick(now) {
        if (state === 'idle' && scene && scene.done) {
            if (!idleSwapAt) idleSwapAt = now + 2600;
            if (now >= idleSwapAt) {
                idleSwapAt = 0;
                scene.g.classList.add('out');
                var old = scene;
                setTimeout(function () {
                    if (state === 'idle' && scene === old) showIdleMolecule();
                }, REDUCE ? 150 : 380);
                scene.done = false;
                scene.total = Infinity;
            }
        } else if (state === 'question') {
            var worth = Math.round(40 + 60 * (1 - progress(now)));
            if (ui.hint.dataset.worth !== String(worth)) {
                ui.hint.dataset.worth = String(worth);
                ui.hint.innerHTML = 'Worth <strong>' + worth + '</strong> if you name it now';
            }
        }
    }

    // ── idle: molecules draw themselves on a loop ───────────────────
    var idleOrder = [], idlePos = 0;
    function showIdleMolecule() {
        if (!idleOrder.length || idlePos >= idleOrder.length) { idleOrder = shuffle(deck); idlePos = 0; }
        buildScene(idleOrder[idlePos++], { duration: REDUCE ? 1800 : 4200 });
    }

    function toIdle() {
        state = 'idle';
        root.setAttribute('data-state', 'idle');
        ui.intro.hidden = false;
        ui.choices.hidden = true;
        ui.end.hidden = true;
        ui.actions.hidden = true;
        ui.svg.parentNode.hidden = false;
        ui.next.hidden = true;
        ui.fact.textContent = '';
        ui.hint.textContent = '';
        ui.meta.textContent = '';
        var best = readBest();
        ui.best.hidden = !best;
        if (best) ui.best.innerHTML = 'Your best: <strong>' + best + '</strong>';
        showIdleMolecule();
        start();
    }

    // ── a game ──────────────────────────────────────────────────────
    function newGame() {
        var picks = shuffle(deck).slice(0, ROUNDS);
        game = {
            index: -1, score: 0, right: 0, early: 0, results: [],
            rounds: picks.map(function (mol) {
                var same = shuffle(deck.filter(function (m) { return m.group === mol.group && m.name !== mol.name; })).slice(0, 1);
                var rest = shuffle(deck.filter(function (m) {
                    return m.name !== mol.name && same.indexOf(m) === -1;
                })).slice(0, 3 - same.length);
                return { mol: mol, options: shuffle([mol].concat(same, rest)).map(function (m) { return m.name; }) };
            })
        };
        ui.intro.hidden = true;
        ui.end.hidden = true;
        ui.actions.hidden = true;
        ui.svg.parentNode.hidden = false;
        nextRound();
    }

    function nextRound() {
        game.index++;
        if (game.index >= ROUNDS) return finish();
        var round = game.rounds[game.index];
        state = 'question';
        root.setAttribute('data-state', 'question');
        ui.meta.innerHTML = '<span>Round <strong>' + (game.index + 1) + '</strong> of ' + ROUNDS + '</span>' +
                            '<span><strong>' + game.score + '</strong> points</span>';
        ui.fact.textContent = '';
        ui.next.hidden = true;
        ui.hint.dataset.worth = '';
        ui.choices.hidden = false;
        ui.choices.innerHTML = '';
        round.options.forEach(function (name, i) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'g-choice';
            b.dataset.name = name;
            b.innerHTML = '<span class="key" aria-hidden="true">' + (i + 1) + '</span><span class="label"></span>';
            b.querySelector('.label').textContent = name;
            b.addEventListener('click', function () { answer(name, b, false); });
            ui.choices.appendChild(b);
        });
        buildScene(round.mol);
        start();
    }

    function answer(name, button, fromKeyboard) {
        if (state !== 'question') return;
        state = 'answered';
        root.setAttribute('data-state', 'answered');
        var round = game.rounds[game.index];
        var p = progress(performance.now());
        var ok = name === round.mol.name;
        var points = ok ? Math.round(40 + 60 * (1 - p)) : 0;
        if (ok) {
            game.score += points;
            game.right++;
            if (p < 1) game.early++;
        }
        game.results.push({ mol: round.mol, ok: ok });

        revealAll();
        Array.prototype.forEach.call(ui.choices.children, function (b) {
            b.disabled = true;
            if (b.dataset.name === round.mol.name) b.classList.add('is-right');
            else if (b === button) b.classList.add('is-wrong');
        });

        if (ok) {
            scene.g.classList.add('win');
            scene.breatheAt = performance.now();
        } else {
            scene.g.classList.add('lose');
            if (!REDUCE && !fromKeyboard) {
                ui.stage.classList.remove('shake');
                void ui.stage.offsetWidth;
                ui.stage.classList.add('shake');
            }
        }

        ui.meta.innerHTML = '<span>Round <strong>' + (game.index + 1) + '</strong> of ' + ROUNDS + '</span>' +
                            '<span><strong>' + game.score + '</strong> points</span>';
        ui.hint.innerHTML = ok
            ? '<strong class="good">' + esc(round.mol.name) + '</strong> <span class="plus">+' + points + '</span>'
            : 'It was <strong>' + esc(round.mol.name) + '</strong>';
        ui.fact.textContent = round.mol.fact;
        ui.next.hidden = false;
        ui.next.textContent = game.index + 1 >= ROUNDS ? 'See score' : 'Next';
        ui.next.focus({ preventScroll: true });
    }

    function finish() {
        state = 'done';
        root.setAttribute('data-state', 'done');
        pause();
        scene = null;
        ui.svg.innerHTML = '';
        ui.svg.parentNode.hidden = true;
        ui.choices.hidden = true;
        ui.next.hidden = true;
        ui.hint.textContent = '';
        ui.fact.textContent = '';
        ui.meta.textContent = '';

        var best = readBest();
        var isBest = game.score > best;
        if (isBest) writeBest(game.score);

        ui.final.innerHTML = '<strong>' + game.score + '</strong><span>/ 1000</span>';
        var early = game.early === 1 ? '1 named before it finished drawing.' : game.early + ' named before they finished drawing.';
        ui.summary.textContent = game.right + ' of ' + ROUNDS + ' right. ' + early + (isBest && best ? ' A new best.' : '');

        ui.recap.innerHTML = '';
        game.results.forEach(function (r) { ui.recap.appendChild(thumb(r.mol, r.ok)); });

        ui.end.hidden = false;
        ui.actions.hidden = false;
        ui.again.focus({ preventScroll: true });
    }

    // small static drawing for the recap
    function thumb(mol, ok) {
        var fig = document.createElement('figure');
        fig.className = 'g-thumb ' + (ok ? 'hit' : 'miss');
        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('viewBox', '0 0 160 110');
        svg.setAttribute('aria-hidden', 'true');
        var f = fit(mol, 160, 110, 9, 26);
        var labelled = mol.atoms.map(function (a) { return a[0] !== 'C'; });
        mol.bonds.forEach(function (b) {
            bondLines(b, f.pts, f.s, labelled).forEach(function (sg) {
                el('line', { x1: sg[0].toFixed(1), y1: sg[1].toFixed(1), x2: sg[2].toFixed(1), y2: sg[3].toFixed(1) }, svg);
            });
        });
        mol.atoms.forEach(function (a, i) {
            if (!labelled[i]) return;
            var t = el('text', { x: f.pts[i][0].toFixed(1), y: (f.pts[i][1] + f.s * 0.16).toFixed(1), 'font-size': (f.s * 0.5).toFixed(1),
                                 'text-anchor': 'middle', 'class': LABELLED[a[0]] || 'el-x' }, svg);
            t.textContent = a[0];
        });
        fig.appendChild(svg);
        var cap = document.createElement('figcaption');
        cap.textContent = mol.name;
        fig.appendChild(cap);
        return fig;
    }

    function share() {
        var text = 'I named ' + game.right + ' of ' + ROUNDS + ' molecules and scored ' + game.score +
                   ' in Name the molecule. ' + SITE;
        var done = function () {
            ui.share.textContent = 'Copied';
            setTimeout(function () { ui.share.textContent = 'Copy score'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () {});
        }
    }

    // ── wiring ──────────────────────────────────────────────────────
    ui.play.addEventListener('click', newGame);
    ui.again.addEventListener('click', newGame);
    ui.share.addEventListener('click', share);
    ui.next.addEventListener('click', nextRound);

    document.addEventListener('keydown', function (e) {
        if (!visible || e.metaKey || e.ctrlKey || e.altKey) return;
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (state === 'question' && /^[1-4]$/.test(e.key)) {
            var b = ui.choices.children[parseInt(e.key, 10) - 1];
            if (b) { e.preventDefault(); answer(b.dataset.name, b, true); }
        }
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible) resume(); else pause();
        }, { threshold: 0.05 }).observe(root);
    }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) pause(); else resume();
    });

    fetch('data/molecules.json')
        .then(function (r) { return r.json(); })
        .then(function (d) {
            deck = d.molecules || [];
            if (deck.length < 4) throw new Error('deck too small');
            root.classList.add('is-ready');
            toIdle();
        })
        .catch(function () {
            root.classList.add('is-broken');
            ui.intro.querySelector('p').textContent = 'The game could not load. Refresh to try again.';
            ui.play.hidden = true;
        });
})();
