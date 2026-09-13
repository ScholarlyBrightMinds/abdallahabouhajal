/* ═══════════════════════════════════════════════════════════════════
   journey.js · plays the About page walk

   One paused timeline owns the time and moves exactly one number: where
   he is. Everything else, the camera, the scenes appearing, the logos
   landing, the papers falling, the dust behind his feet, is a pure
   function of that number, so scrubbing backwards, resizing and
   replaying all render the same frame.

   Nothing here is needed to read the page. With this file switched off
   the same markup is the finished drawing as a wide strip you can scroll,
   and the dated facts below it as a plain list.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    const root = document.querySelector('.journey');
    if (!root || !window.gsap || !window.SM) return;

    const svg = root.querySelector('.journey-svg');
    const stage = root.querySelector('.journey-stage');
    const ground = svg && svg.querySelector('#journey-ground');
    const manLayer = svg && svg.querySelector('#journey-man');
    const facts = Array.from(root.querySelectorAll('.journey-fact'));
    const controls = root.querySelector('.journey-controls');
    const playBtn = root.querySelector('.journey-play');
    const scrub = root.querySelector('.journey-scrub');
    const timeEl = root.querySelector('.journey-time');
    const capEl = root.querySelector('.journey-caption');
    const tickEls = Array.from(root.querySelectorAll('.journey-tick'));
    if (!ground || !manLayer || !facts.length) return;

    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    const WORLD_W = vb[2], WORLD_H = vb[3];
    const SPEED = 285;          // world units per second of walking
    const HOLD = 1.5;           // seconds standing at each stop
    const START_X = 90;
    const STEP = 38;            // one stride, the stick man's own step length
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const smooth = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const outCubic = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

    // ── where the walk ends today ────────────────────────────────────
    // He is still walking, so the last leg is measured from the date: a little
    // further every month, and always short of the door.
    const now = new Date();
    const monthsIn2026 = (now.getFullYear() - 2026) * 12 + now.getMonth();
    const lastFact = facts[facts.length - 1];
    const LAST_X = Math.min(WORLD_W - 420, +lastFact.dataset.x + Math.max(0, monthsIn2026) * 7);

    const stations = facts.map((li, i) => ({
        el: li,
        index: i,
        x: i === facts.length - 1 ? LAST_X : +li.dataset.x,
        carry: li.dataset.carry || '',
        date: li.querySelector('time').getAttribute('datetime'),
        label: li.querySelector('time').textContent,
        title: li.querySelector('h3').textContent,
        sign: null,
        time: 0,
    }));

    // ── ground: a table from x to length, so heights are cheap ───────
    const groundLen = ground.getTotalLength();
    const table = [];
    for (let i = 0; i <= 420; i++) {
        const p = ground.getPointAtLength((groundLen * i) / 420);
        table.push([p.x, p.y]);
    }
    function groundY(x) {
        if (x <= table[0][0]) return table[0][1];
        if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
        let lo = 0, hi = table.length - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (table[mid][0] <= x) lo = mid; else hi = mid;
        }
        const [x0, y0] = table[lo], [x1, y1] = table[hi];
        return x1 === x0 ? y0 : y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
    }

    // ── the pieces the walk reveals ──────────────────────────────────
    const scenes = Array.from(svg.querySelectorAll('.jscene')).map((g) => {
        const sign = g.querySelector('.jsign');
        const st = stations[+g.dataset.station - 1];
        if (st && sign) st.sign = { x: +sign.dataset.cx, y: +sign.dataset.cy };
        return { g, x: +g.dataset.x, w: +g.dataset.w, sign, station: +g.dataset.station };
    });
    const sheets = Array.from(svg.querySelectorAll('.jsheet')).map((el) => ({
        el, x: +el.dataset.x, i: +el.dataset.i, y: +el.getAttribute('y'),
    }));

    // dust: two puffs, placed from the last two footfalls, so they are a
    // function of distance walked and survive scrubbing
    const NS = 'http://www.w3.org/2000/svg';
    const dust = [0, 1].map(() => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('class', 'jdust');
        c.setAttribute('r', 5);
        manLayer.parentNode.insertBefore(c, manLayer);
        return c;
    });

    const staticMan = svg.querySelector('.jman-static');
    if (staticMan) staticMan.remove();
    const man = window.SM.create(manLayer);

    // ── the timeline: it moves one number ────────────────────────────
    const state = { x: START_X };
    let lastX = START_X, phase = 0, face = 1;

    const tl = gsap.timeline({ paused: true, onUpdate: render });
    let at = 0, prevX = START_X;
    stations.forEach((st, i) => {
        const dist = Math.max(1, st.x - prevX);
        const walk = dist / SPEED;
        tl.to(state, {
            x: st.x,
            duration: walk,
            ease: i === 0 ? 'power1.out' : 'power1.inOut',
        }, at);
        at += walk;
        st.time = at;
        tl.addLabel('s' + (i + 1), at);
        at += HOLD;
        prevX = st.x;
    });
    tl.to(state, { x: LAST_X, duration: 0.01 }, at);   // hold the last frame
    const TOTAL = tl.duration();

    // ── rendering ────────────────────────────────────────────────────
    // How much of the world the camera shows. Tied to the stage's own width so
    // the figure comes out about the same size on a laptop and on a phone,
    // never wider than the world is tall once the aspect is applied.
    let aspect = 2.2, baseH = WORLD_H;
    function measure() {
        const r = stage.getBoundingClientRect();
        if (!r.width || !r.height) return;
        aspect = r.width / r.height;
        const wantW = clamp(r.width * 1.02, 760, 1520);
        baseH = Math.min(WORLD_H, wantW / aspect);
    }

    function activeIndex(x) {
        let idx = 0;
        stations.forEach((st, i) => { if (x >= st.x - 130) idx = i; });
        return idx;
    }

    function render() {
        const x = state.x;
        const t = tl.time();
        const dx = x - lastX;
        lastX = x;
        const moving = Math.abs(dx) > 0.35;
        if (moving) {
            phase += (dx / STEP) * TAU;
            face = dx > 0 ? 1 : -1;
        }

        const idx = activeIndex(x);
        const st = stations[idx];

        // is he pointing at a logo he just walked up to
        let mode = moving ? 'walk' : 'idle';
        let target = null;
        if (!moving && st.sign) {
            const since = t - st.time;
            if (since > 0.3 && since < 1.45) { mode = 'point'; target = st.sign; }
        }

        const gy = groundY(x);
        man.set(x, gy, mode, phase, t, face, st.carry, target);

        // dust, from the last two footfalls
        const dist = x - START_X;
        dust.forEach((c, k) => {
            const i = Math.floor(dist / (STEP / 2)) - k;
            const d0 = i * (STEP / 2);
            const age = dist - d0;
            const a = moving && i > 0 ? clamp(1 - age / 26, 0, 1) : 0;
            c.setAttribute('opacity', (a * 0.5).toFixed(2));
            if (a > 0) {
                const px = START_X + d0;
                c.setAttribute('cx', px.toFixed(1));
                c.setAttribute('cy', (groundY(px) - 2).toFixed(1));
                c.setAttribute('r', (4 + (1 - a) * 9).toFixed(1));
            }
        });

        // scenes rise into place as he gets near, and the real logos land
        // once he is standing in front of them
        for (const sc of scenes) {
            const k = smooth((x - (sc.x - 880)) / 420);
            sc.g.setAttribute('opacity', k.toFixed(3));
            sc.g.setAttribute('transform', `translate(0,${((1 - k) * 34).toFixed(1)})`);
            if (!sc.sign) continue;
            const stop = stations[sc.station - 1].x;
            const p = clamp((x - (stop - 150)) / 190, 0, 1);
            const s = p >= 1 ? 1 : 1 + 2.2 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2);
            const cx = +sc.sign.dataset.cx, cy = +sc.sign.dataset.cy;
            sc.sign.setAttribute('opacity', clamp(p * 1.8, 0, 1).toFixed(2));
            sc.sign.setAttribute('transform',
                `translate(${cx},${cy}) scale(${s.toFixed(3)}) translate(${-cx},${-cy})`);
        }

        // papers fall on their year, one after another, and stack into the
        // riser he then walks up
        for (const sh of sheets) {
            const k = outCubic((x - (sh.x - 560 + sh.i * 70)) / 240);
            const drop = (1 - k) * 300 - Math.sin(Math.PI * k) * 7;
            sh.el.setAttribute('opacity', clamp(k * 2.2, 0, 1).toFixed(2));
            sh.el.setAttribute('transform', `translate(0,${(-drop).toFixed(1)})`);
        }

        // camera: it pushes in a little at every stop, keeping the ground still
        const bump = smooth(1 - Math.abs(x - st.x) / 240);
        const viewH = baseH * (1 - 0.055 * bump);
        const viewW = viewH * aspect;
        const camX = clamp(x - viewW * 0.42, 0, Math.max(0, WORLD_W - viewW));
        svg.setAttribute('viewBox',
            `${camX.toFixed(1)} ${(WORLD_H - viewH).toFixed(1)} ${viewW.toFixed(1)} ${viewH.toFixed(1)}`);
        svg.querySelectorAll('.jlayer').forEach((layer) => {
            const par = +layer.dataset.par;
            if (par === 1) return;
            layer.setAttribute('transform', `translate(${(camX * (1 - par)).toFixed(1)},0)`);
        });

        // captions and readouts
        facts.forEach((li, i) => li.classList.toggle('is-active', i === idx));
        if (capEl) {
            capEl.hidden = false;
            capEl.querySelector('.jc-date').textContent = st.label;
            capEl.querySelector('.jc-title').textContent = st.title;
        }
        if (timeEl) {
            const clock = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
            const total = Math.round(TOTAL);
            timeEl.textContent = `${clock(Math.min(total, Math.round(t)))} / ${clock(total)}`;
        }
        if (scrub && document.activeElement !== scrub) {
            scrub.value = Math.round(tl.progress() * 1000);
        }
        tickEls.forEach((b, i) => b.classList.toggle('is-done', i <= idx));
    }

    // ── controls ─────────────────────────────────────────────────────
    root.classList.add('is-live');
    if (controls) controls.hidden = false;
    measure();
    // the ticks sit where their station falls in time, not in space
    tickEls.forEach((b, i) => {
        const st = stations[i];
        if (st) b.style.left = `${(st.time / TOTAL) * 100}%`;
        b.addEventListener('click', () => {
            userPaused = false;
            finished = false;
            tl.tweenTo('s' + (i + 1), { duration: 0.85, ease: 'power2.inOut', onComplete: label });
            label();
        });
    });

    let finished = false, userPaused = false;
    function label() {
        if (!playBtn) return;
        const playing = tl.isActive();
        playBtn.textContent = finished ? 'Replay' : playing ? 'Pause' : 'Play';
        playBtn.setAttribute('aria-label',
            finished ? 'Replay the walk' : playing ? 'Pause the walk' : 'Play the walk');
    }
    tl.eventCallback('onComplete', () => { finished = true; label(); });

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (finished || tl.progress() === 1) { finished = false; userPaused = false; tl.restart(); }
            else if (tl.isActive()) { userPaused = true; tl.pause(); }
            else { userPaused = false; tl.play(); }
            label();
        });
    }
    if (scrub) {
        const seek = () => {
            userPaused = true;
            finished = false;
            tl.pause();
            tl.progress(+scrub.value / 1000);
            label();
        };
        scrub.addEventListener('input', seek);
        scrub.addEventListener('change', seek);
    }

    // ── when it plays ────────────────────────────────────────────────
    if (REDUCE) {
        tl.progress(1);
        finished = true;
    } else if ('IntersectionObserver' in window) {
        // It walks when the stage is on screen and the tab is in front. Both
        // go through the same check, so coming back to the tab picks the walk
        // up again rather than leaving him standing.
        let onScreen = false;
        const settle = () => {
            const want = onScreen && !document.hidden;
            if (want && !finished && !userPaused && !tl.isActive()) tl.play();
            else if (!want && tl.isActive()) tl.pause();
            label();
        };
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                onScreen = e.isIntersecting && e.intersectionRatio >= 0.45;
                settle();
            });
        }, { threshold: [0, 0.45, 0.9] });
        io.observe(stage);
        document.addEventListener('visibilitychange', settle);
    } else {
        tl.play();
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && tl.isActive()) { tl.pause(); label(); }
        });
    }

    let resizeRaf = 0;
    window.addEventListener('resize', () => {
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; measure(); render(); });
    });

    render();
    label();
})();
