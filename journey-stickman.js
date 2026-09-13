/* ═══════════════════════════════════════════════════════════════════
   journey-stickman.js · the walking figure on the About page

   Lifted from my own video pipeline (Quick Money Project/tools/stickman.js)
   with one addition: set() returns where the leading hand ended up, so the
   thing he is carrying can be drawn there.

   His pose is a pure function of the numbers passed to set(), so any frame
   renders the same no matter which order the scrubber asks for frames.
   ═══════════════════════════════════════════════════════════════════ */
window.SM = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const clamp = (k) => Math.min(1, Math.max(0, k));
    const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };

    function create(parent, opts = {}) {
        const col = opts.color || 'currentColor';
        const sw = opts.stroke || 4;
        const sc = opts.scale || 1;
        const g = document.createElementNS(NS, 'g');
        const line = () => {
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('stroke', col);
            l.setAttribute('stroke-width', sw);
            l.setAttribute('stroke-linecap', 'round');
            g.appendChild(l);
            return l;
        };
        const legL = line(), legR = line(), body = line(), armL = line(), armR = line();
        const head = document.createElementNS(NS, 'circle');
        head.setAttribute('r', 15);
        head.setAttribute('fill', opts.fill || 'none');
        head.setAttribute('stroke', col);
        head.setAttribute('stroke-width', sw);
        g.appendChild(head);
        parent.appendChild(g);

        const HIP = 38, SHO = 74, LEG = 40, ARM = 32;
        const limb = (el, ox, oy, ang, len) => {
            el.setAttribute('x1', ox);
            el.setAttribute('y1', oy);
            el.setAttribute('x2', ox + Math.sin(ang) * len);
            el.setAttribute('y2', oy + Math.cos(ang) * len);
        };

        return {
            el: g,
            // x, y: where his feet touch, in the parent's coordinates.
            // mode: 'walk' | 'idle' | 'climb' | 'cheer'; phase: walk cycle in radians.
            // Returns the leading hand position in the same coordinates.
            set(x, y, mode, phase, t, face = 1, opacity = 1) {
                let lA = 0, rA = 0, alA = 0, arA = 0, dy = 0;
                if (mode === 'walk') {
                    const th = 0.5 * Math.sin(phase);
                    lA = th; rA = -th; alA = -0.8 * th; arA = 0.8 * th;
                    dy = -3 * Math.abs(Math.sin(phase));
                } else if (mode === 'climb') {
                    const th = Math.sin(phase);
                    lA = 0.35 * th; rA = -0.35 * th;
                    alA = Math.PI - 0.45 + 0.35 * th; arA = Math.PI + 0.45 + 0.35 * th;
                    dy = -2 * Math.abs(th);
                } else if (mode === 'cheer') {
                    lA = 0.18; rA = -0.18;
                    alA = Math.PI - 0.55; arA = Math.PI + 0.55;
                    dy = -26 * Math.abs(Math.sin(t * 6));
                } else {
                    const b = Math.sin(t * 2.2);
                    lA = 0.28; rA = -0.28;
                    alA = -0.5 - 0.04 * b; arA = 0.5 + 0.04 * b;
                    dy = 1.2 * b;
                }
                limb(legL, 0, -HIP, lA, LEG);
                limb(legR, 0, -HIP, rA, LEG);
                body.setAttribute('x1', 0); body.setAttribute('y1', -HIP);
                body.setAttribute('x2', 0); body.setAttribute('y2', -SHO + 4);
                limb(armL, 0, -SHO + 8, alA, ARM);
                limb(armR, 0, -SHO + 8, arA, ARM);
                head.setAttribute('cx', 0);
                head.setAttribute('cy', -SHO - 16);
                g.setAttribute('transform', `translate(${x},${y + dy}) scale(${sc * face},${sc})`);
                g.setAttribute('opacity', opacity);
                // The forward arm carries whatever he is holding.
                const hx = Math.sin(arA) * ARM;
                const hy = -SHO + 8 + Math.cos(arA) * ARM;
                return { x: x + hx * sc * face, y: y + dy + hy * sc, scale: sc, face };
            },
        };
    }

    // Position along an SVG path between two lengths over a time window.
    function along(path, l0, l1, t0, t1, t) {
        const k = smooth((t - t0) / Math.max(0.001, t1 - t0));
        const l = l0 + (l1 - l0) * k;
        const p = path.getPointAtLength(l);
        const q = path.getPointAtLength(Math.min(path.getTotalLength(), l + 3));
        return { x: p.x, y: p.y, dist: Math.abs(l - l0), moving: t > t0 && t < t1, dx: q.x - p.x };
    }

    return { create, along, smooth, clamp };
})();
