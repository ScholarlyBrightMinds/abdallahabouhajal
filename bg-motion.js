// ═══════════════════════════════════════════════════════════════════
//  bg-motion.js · the background molecules turn and drift, each on its own
//
//  styles.css paints images/bg-molecules.svg behind every page as one still
//  tile. This file lays the same twelve molecules out again as separate
//  elements, from images/bg-molecules.json (written by build_background.py
//  in the same run as the tile), and hands over from the tile to them.
//
//  Every molecule starts exactly where the tile has it, so the hand-over
//  shows nothing. Then each one turns once every 28 to 56 seconds, some
//  clockwise and some not, and drifts 10 to 22 pixels on a loop of its own,
//  while the layer fades from the tile's 5.5% to 10% so the motion reads.
//  (At the tile's strength and a turn every two minutes, nobody saw it move.) The motion is CSS (the separate rotate and translate properties),
//  so the browser runs it off the main thread and the game above it is not
//  slowed.
//
//  scripts.js loads this only when the reader has not asked for reduced
//  motion or data saving. Setting --sbm-anim: paused on :root freezes it
//  with everything else on the site. With JavaScript off, or if anything
//  here fails, the still tile simply stays.
// ═══════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    const NS = 'http://www.w3.org/2000/svg';
    const MAX_MOLECULES = 160;   // above this (very large screens) the tile stays still
    const root = document.documentElement;
    let data = null;
    let layer = null;
    let builtFor = '';

    if (!window.CSS || !CSS.supports('rotate', '1deg') || !CSS.supports('translate', '1px 1px')) return;

    // A tiny seeded generator, so each molecule keeps its own tempo on every page.
    function seeded(seed) {
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        return () => (s = (s * 16807) % 2147483647) / 2147483647;
    }

    // The same widths styles.css gives the still tile.
    function tileWidth() {
        return window.matchMedia('(max-width: 640px)').matches ? 520 : 760;
    }

    function molecule(m, k, i, j, T, s, TH) {
        const r = seeded(1 + k * 7919 + i * 104729 + j * 1299709);
        const el = document.createElementNS(NS, 'svg');
        const R = m.r;
        el.setAttribute('class', 'bg-mol');
        el.setAttribute('viewBox', `${-R} ${-R} ${2 * R} ${2 * R}`);
        el.style.left = `${(i * T + (m.cx - R) * s).toFixed(1)}px`;
        el.style.top = `${(j * TH + (m.cy - R) * s).toFixed(1)}px`;
        el.style.width = el.style.height = `${(2 * R * s).toFixed(1)}px`;
        const angle = r() * Math.PI * 2;
        const reach = 10 + r() * 12;
        el.style.setProperty('--spin', `${(28 + r() * 28).toFixed(1)}s`);
        el.style.setProperty('--turn', r() < 0.5 ? '360deg' : '-360deg');
        el.style.setProperty('--drift', `${(6 + r() * 5).toFixed(1)}s`);
        el.style.setProperty('--dx', `${(Math.cos(angle) * reach).toFixed(1)}px`);
        el.style.setProperty('--dy', `${(Math.sin(angle) * reach).toFixed(1)}px`);
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', m.d);
        el.appendChild(path);
        return el;
    }

    function build() {
        const T = tileWidth();
        const s = T / data.tile[0];
        const TH = data.tile[1] * s;
        const cols = Math.ceil(window.innerWidth / T);
        const rows = Math.ceil(window.innerHeight / TH);
        const key = `${T}:${cols}:${rows}`;
        if (key === builtFor) return;
        builtFor = key;

        if (cols * rows * data.molecules.length > MAX_MOLECULES) {
            if (layer) layer.remove();
            layer = null;
            root.classList.remove('bg-live');
            return;
        }

        const next = document.createElement('div');
        next.className = 'bg-mols';
        next.setAttribute('aria-hidden', 'true');
        const frag = document.createDocumentFragment();
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                data.molecules.forEach((m, k) => frag.appendChild(molecule(m, k, i, j, T, s, TH)));
            }
        }
        next.appendChild(frag);
        if (layer) layer.replaceWith(next);
        else document.body.prepend(next);
        layer = next;
        root.classList.add('bg-live');
        // one frame at the tile's strength, then fade up (see .bg-mols.bg-on)
        requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add('bg-on')));
    }

    function start() {
        fetch('images/bg-molecules.json')
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then(json => {
                if (!json || !Array.isArray(json.molecules) || !json.molecules.length) return;
                data = json;
                build();
                let pending = 0;
                window.addEventListener('resize', () => {
                    clearTimeout(pending);
                    pending = setTimeout(build, 200);
                });
            })
            .catch(() => { /* the still tile stays */ });
    }

    // After the page has settled, so the layer never competes with first paint.
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 300));
    if (document.readyState === 'complete') idle(start);
    else window.addEventListener('load', () => idle(start), { once: true });
})();
