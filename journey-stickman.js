/* ═══════════════════════════════════════════════════════════════════
   journey-stickman.js · the walking figure on the About page

   He is 120 units tall, which is the scale everything else in the walk is
   measured in. Limbs have joints: the knee and the elbow are solved from
   the hip and the foot, so the gait plants a foot instead of sliding it.

   Every pose is a pure function of the numbers passed to set(), so any
   frame renders the same no matter which order the scrubber asks for
   frames, and dragging backwards is just the same maths with a negative
   step.
   ═══════════════════════════════════════════════════════════════════ */
window.SM = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const TAU = Math.PI * 2;
    const clamp = (k, a = 0, b = 1) => Math.min(b, Math.max(a, k));
    const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };

    // proportions, in the figure's own units (feet at 0, up is negative)
    const HIP = -50, SHO = -95, HEAD_Y = -113, HEAD_R = 10;
    const THIGH = 26, SHIN = 26, UPPER = 23, FORE = 21;
    const STRIDE = 36, LIFT = 10;

    // Where the joint between two bones ends up, given both ends.
    function joint(ax, ay, bx, by, l1, l2, sign) {
        let dx = bx - ax, dy = by - ay;
        let d = Math.hypot(dx, dy);
        const min = Math.abs(l1 - l2) + 0.01, max = l1 + l2 - 0.01;
        if (d > max) { const k = max / d; dx *= k; dy *= k; d = max; }
        if (d < min) { const k = min / Math.max(0.001, d); dx *= k; dy *= k; d = min; }
        const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
        const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
        return {
            x: ax + (dx * a) / d + (-dy / d) * h * sign,
            y: ay + (dy * a) / d + (dx / d) * h * sign,
        };
    }

    // One foot through the walk cycle. u is where it is in its own cycle.
    function foot(u) {
        u = u - Math.floor(u);
        if (u < 0.55) {                       // planted, the ground passes under
            return { x: STRIDE / 2 - STRIDE * (u / 0.55), y: 0 };
        }
        const k = (u - 0.55) / 0.45;          // swung forward, and lifted
        return { x: -STRIDE / 2 + STRIDE * smooth(k), y: -LIFT * Math.sin(Math.PI * k) };
    }

    function create(parent, opts = {}) {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'jman-fig');
        const make = (tag, cls) => {
            const el = document.createElementNS(NS, tag);
            if (cls) el.setAttribute('class', cls);
            g.appendChild(el);
            return el;
        };
        // drawn back to front, so the near arm and leg overlap the body
        const legFar = make('path', 'jl jlimb jfar');
        const armFar = make('path', 'jl jlimb jfar');
        const bag = make('path', 'jl jcarry');
        const torso = make('path', 'jl jlimb');
        const head = make('circle', 'jl jhead');
        const legNear = make('path', 'jl jlimb');
        const armNear = make('path', 'jl jlimb');
        const slab = make('rect', 'jl jcarry jslab');
        head.setAttribute('r', HEAD_R);
        parent.appendChild(g);

        const path3 = (el, a, b, c) =>
            el.setAttribute('d', `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} `
                + `L ${b.x.toFixed(1)} ${b.y.toFixed(1)} `
                + `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`);

        return {
            el: g,
            /**
             * x, y     where his feet touch, in the parent's units
             * mode     'walk' | 'idle' | 'point'
             * phase    the walk cycle, in radians, from distance travelled
             * t        seconds, for breathing
             * face     1 walking right, -1 walking left
             * carry    'bag' | 'laptop' | none
             * point    {x, y} in the parent's units, when mode is 'point'
             */
            set(x, y, mode, phase, t, face = 1, carry = '', target = null) {
                const walking = mode === 'walk';
                const u = (phase / TAU) % 1;
                const bob = walking ? -2.6 * Math.abs(Math.sin(u * TAU))
                    : 0.8 * Math.sin(t * 2.1);
                const hipY = HIP + bob, shoY = SHO + bob;
                const lean = walking ? 3.2 : 0;          // he leans into the walk

                // legs
                let fNear, fFar;
                if (walking) {
                    fNear = foot(u);
                    fFar = foot(u + 0.5);
                } else {
                    fNear = { x: 7, y: 0 };
                    fFar = { x: -8, y: 0 };
                }
                const hipX = lean * 0.4;
                for (const [el, f] of [[legFar, fFar], [legNear, fNear]]) {
                    const kn = joint(hipX, hipY, f.x, f.y, THIGH, SHIN, -1);
                    // hip, knee, ankle, then a short foot so the step lands flat
                    el.setAttribute('d', `M ${hipX.toFixed(1)} ${hipY.toFixed(1)} `
                        + `L ${kn.x.toFixed(1)} ${kn.y.toFixed(1)} `
                        + `L ${f.x.toFixed(1)} ${f.y.toFixed(1)} `
                        + `L ${(f.x + 7).toFixed(1)} ${(f.y - 1.5).toFixed(1)}`);
                }

                // torso
                torso.setAttribute('d', `M ${hipX.toFixed(1)} ${hipY.toFixed(1)} `
                    + `L ${(hipX + lean).toFixed(1)} ${shoY.toFixed(1)}`);
                const shoX = hipX + lean;
                head.setAttribute('cx', (shoX + lean * 0.6).toFixed(1));
                head.setAttribute('cy', (HEAD_Y + bob).toFixed(1));

                // arms
                const reach = (UPPER + FORE) * 0.95;   // nearly straight, so no chicken wing
                let hNear, hFar;
                if (mode === 'point' && target) {
                    // the near arm goes up towards whatever he is looking at
                    const tx = (target.x - x) * face, ty = target.y - y;
                    const d = Math.max(1, Math.hypot(tx - shoX, ty - shoY));
                    hNear = { x: shoX + ((tx - shoX) / d) * reach, y: shoY + ((ty - shoY) / d) * reach };
                    hFar = { x: shoX - 4, y: shoY + reach * 0.95 };
                } else if (walking) {
                    const aNear = 0.5 * Math.sin(u * TAU + Math.PI);
                    const aFar = 0.5 * Math.sin(u * TAU);
                    hNear = { x: shoX + Math.sin(aNear) * reach, y: shoY + Math.cos(aNear) * reach };
                    hFar = { x: shoX + Math.sin(aFar) * reach, y: shoY + Math.cos(aFar) * reach };
                } else {
                    const sway = 0.06 * Math.sin(t * 1.7);
                    hNear = { x: shoX + Math.sin(0.16 + sway) * reach, y: shoY + Math.cos(0.16 + sway) * reach };
                    hFar = { x: shoX + Math.sin(-0.14 - sway) * reach, y: shoY + Math.cos(-0.14 - sway) * reach };
                }
                for (const [el, h, sign] of [[armFar, hFar, 1], [armNear, hNear, 1]]) {
                    const el2 = joint(shoX, shoY, h.x, h.y, UPPER, FORE, sign);
                    path3(el, { x: shoX, y: shoY }, el2, h);
                }

                // what he is carrying
                const hasBag = carry === 'bag', hasSlab = carry === 'laptop';
                bag.style.display = hasBag ? '' : 'none';
                slab.style.display = hasSlab ? '' : 'none';
                if (hasBag) {
                    const top = shoY + 6, bot = hipY - 4;
                    bag.setAttribute('d',
                        `M ${(shoX - 6).toFixed(1)} ${top.toFixed(1)} `
                        + `h -9 a 5 5 0 0 0 -5 5 V ${(bot - 5).toFixed(1)} `
                        + `a 5 5 0 0 0 5 5 h 9 `
                        + `M ${(shoX - 5).toFixed(1)} ${(top + 2).toFixed(1)} `
                        + `l -2 ${(bot - top - 4).toFixed(1)}`);
                }
                if (hasSlab) {                       // a laptop, carried at his side
                    slab.setAttribute('x', (shoX - 23).toFixed(1));
                    slab.setAttribute('y', (shoY + 40).toFixed(1));
                    slab.setAttribute('width', 24);
                    slab.setAttribute('height', 6);
                    slab.setAttribute('rx', 1.5);
                }

                g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${face},1)`);
                return {
                    hand: { x: x + hNear.x * face, y: y + hNear.y },
                    head: { x: x + shoX * face, y: y + HEAD_Y + bob },
                };
            },
        };
    }

    return { create, smooth, clamp, foot };
})();
