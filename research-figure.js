/* ═══════════════════════════════════════════════════════════════════
   research-figure.js · the molecule panel beside the project list

   Three molecules, one per thing on this page. Each draws itself bond by
   bond, then shows the descriptors RDKit computed for it offline. The
   numbers are baked into data/research-mols.json by build_research_mols.py:
   nothing is computed in the browser and nothing is predicted here.

   With JavaScript off, or if the fetch fails, the panel stays hidden and
   the page is the list it already was.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    const panel = document.querySelector('.mol-panel');
    if (!panel || !window.fetch) return;

    const svg = panel.querySelector('.mol-svg');
    const nameEl = panel.querySelector('.mol-name');
    const noteEl = panel.querySelector('.mol-note');
    const numsEl = panel.querySelector('.mol-numbers');
    const dotsEl = panel.querySelector('.mol-dots');
    if (!svg || !nameEl || !numsEl) return;

    const NS = 'http://www.w3.org/2000/svg';
    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const VB = 300, PAD = 30;
    const DRAW_MS = 58;        // per bond
    const HOLD_MS = 6200;      // how long a finished molecule stays up

    let deck = [], index = 0, raf = 0, started = 0, phase = 'draw', playing = false;
    let bonds = [], labels = [];

    // ── drawing ──────────────────────────────────────────────────────
    function build(mol) {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        bonds = []; labels = [];

        const xs = mol.atoms.map(a => a[1]), ys = mol.atoms.map(a => a[2]);
        const w = Math.max(...xs) - Math.min(...xs) || 1;
        const h = Math.max(...ys) - Math.min(...ys) || 1;
        const k = Math.min((VB - PAD * 2) / w, (VB - PAD * 2) / h);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        const P = mol.atoms.map(a => [VB / 2 + (a[1] - cx) * k, VB / 2 + (a[2] - cy) * k]);

        // one group per bond, so a double bond reveals as one piece
        mol.bonds.forEach(([i, j, order, side]) => {
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('class', 'mol-bond');
            const [x1, y1] = P[i], [x2, y2] = P[j];
            const dx = x2 - x1, dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;          // unit normal
            const gap = k * 0.13;
            const offsets = order === 1 ? [0]
                : order === 2 ? (side ? [0, side * gap * 1.6] : [-gap, gap])
                    : [-gap * 1.5, 0, gap * 1.5];
            offsets.forEach((o) => {
                const line = document.createElementNS(NS, 'line');
                // the inner line of a ring double bond is drawn a little short
                const trim = o !== 0 && side ? 0.14 : 0;
                line.setAttribute('x1', (x1 + nx * o + dx * trim).toFixed(1));
                line.setAttribute('y1', (y1 + ny * o + dy * trim).toFixed(1));
                line.setAttribute('x2', (x2 + nx * o - dx * trim).toFixed(1));
                line.setAttribute('y2', (y2 + ny * o - dy * trim).toFixed(1));
                g.appendChild(line);
            });
            svg.appendChild(g);
            bonds.push(g);
        });

        // heteroatom labels, with a disc behind so the bond does not cross them
        mol.atoms.forEach((a, i) => {
            if (a[0] === 'C') return;
            const [x, y] = P[i];
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('class', 'mol-label');
            const disc = document.createElementNS(NS, 'circle');
            disc.setAttribute('cx', x.toFixed(1));
            disc.setAttribute('cy', y.toFixed(1));
            disc.setAttribute('r', (k * 0.36).toFixed(1));
            const text = document.createElementNS(NS, 'text');
            text.setAttribute('x', x.toFixed(1));
            text.setAttribute('y', y.toFixed(1));
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', (k * 0.62).toFixed(1));
            // hydrogens are implicit in the data, so they are written in here:
            // one is an H, more than one gets a subscript, as in NH2
            const sub = { 2: '₂', 3: '₃', 4: '₄' };
            text.textContent = a[0] + (a[3] ? 'H' + (sub[a[3]] || '') : '');
            g.appendChild(disc);
            g.appendChild(text);
            svg.appendChild(g);
            labels.push({ el: g, atom: i });
        });

        nameEl.textContent = mol.name;
        if (noteEl) noteEl.textContent = mol.note;
        numsEl.textContent = '';
        mol.numbers.forEach(([label, value]) => {
            const row = document.createElement('div');
            row.className = 'mol-num';
            const dt = document.createElement('dt');
            dt.textContent = label;
            const dd = document.createElement('dd');
            dd.textContent = value;
            row.appendChild(dt);
            row.appendChild(dd);
            numsEl.appendChild(row);
        });
        dots();
        show(REDUCE ? 1 : 0);
    }

    // progress 0 to 1 over the bonds, then the numbers
    function show(p) {
        const nb = bonds.length;
        const drawn = p * nb;
        bonds.forEach((g, i) => g.style.opacity = i < drawn ? 1 : 0);
        const mol = deck[index];
        labels.forEach((l) => {
            // a label appears with the first bond that reaches its atom. The
            // last bond in the list has to count, or an atom hanging off the
            // end of the molecule never gets its letter.
            const ready = mol.bonds.findIndex(b => b[0] === l.atom || b[1] === l.atom);
            l.el.style.opacity = ready >= 0 && drawn >= ready + 1 ? 1 : 0;
        });
        const rows = numsEl.querySelectorAll('.mol-num');
        rows.forEach((r, i) => {
            const at = 0.55 + (i / rows.length) * 0.45;
            r.style.opacity = p >= at ? 1 : 0;
        });
    }

    function dots() {
        if (!dotsEl) return;
        dotsEl.textContent = '';
        deck.forEach((m, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'mol-dot' + (i === index ? ' is-on' : '');
            b.setAttribute('aria-label', 'Draw ' + m.name);
            b.addEventListener('click', () => { index = i; start(); });
            dotsEl.appendChild(b);
        });
    }

    function start() {
        started = performance.now();
        phase = 'draw';
        build(deck[index]);
        if (!REDUCE && playing) tick();
    }

    function tick() {
        cancelAnimationFrame(raf);
        const step = (now) => {
            const t = now - started;
            const drawMs = bonds.length * DRAW_MS;
            if (phase === 'draw') {
                const p = Math.min(1, t / drawMs);
                show(p * 0.55 + (p === 1 ? 0.45 : 0));
                if (p === 1) { phase = 'numbers'; started = now; }
            } else if (phase === 'numbers') {
                const p = Math.min(1, t / 700);
                show(0.55 + p * 0.45);
                if (p === 1) { phase = 'hold'; started = now; }
            } else if (t > HOLD_MS) {
                index = (index + 1) % deck.length;
                start();
                return;
            }
            if (playing) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
    }

    // ── load and play ────────────────────────────────────────────────
    fetch('data/research-mols.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then((data) => {
            deck = data.molecules || [];
            if (!deck.length) return;
            panel.hidden = false;
            build(deck[0]);
            if (REDUCE) return;
            // It runs when it is both on screen and in the front tab. Both
            // conditions go through the same check, so coming back to the tab
            // starts it again instead of leaving a half drawn molecule.
            let onScreen = false;
            const settle = () => {
                const want = onScreen && !document.hidden;
                if (want && !playing) {
                    playing = true;
                    started = performance.now();
                    phase = 'draw';
                    tick();
                } else if (!want && playing) {
                    playing = false;
                    cancelAnimationFrame(raf);
                }
            };
            const io = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    onScreen = e.isIntersecting && e.intersectionRatio > 0.3;
                    settle();
                });
            }, { threshold: [0, 0.3, 0.8] });
            io.observe(panel);
            document.addEventListener('visibilitychange', settle);
        })
        .catch(() => { /* the list is the page, the panel is extra */ });
})();
