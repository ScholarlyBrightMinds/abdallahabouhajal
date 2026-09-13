/* ═══════════════════════════════════════════════════════════════════
   journey.js · plays the About page walk

   One paused GSAP timeline owns the time. Everything drawn is a pure
   function of where the walker is, so scrubbing backwards, resizing and
   replaying all render the same frame. Nothing here is required to read
   the page: the markup it animates is the finished drawing plus a list
   of dated facts, which is what you get with this file switched off.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    const root = document.querySelector('.journey');
    if (!root || !window.gsap || !window.SM) return;

    const svg = root.querySelector('.journey-svg');
    const ground = svg.querySelector('#journey-ground');
    const progress = svg.querySelector('#journey-progress');
    const manLayer = svg.querySelector('#journey-man');
    const facts = Array.from(root.querySelectorAll('.journey-fact'));
    const controls = root.querySelector('.journey-controls');
    const playBtn = root.querySelector('.journey-play');
    const scrub = root.querySelector('.journey-scrub');
    const timeEl = root.querySelector('.journey-time');
    const yearEl = root.querySelector('.journey-year');
    if (!ground || !manLayer || !facts.length) return;

    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const WORLD_W = 5240, WORLD_H = 300;
    // The camera crops the empty band above the scenes, which makes everything
    // about a sixth bigger on screen. Nothing is drawn above VIEW_Y.
    const VIEW_Y = 44, VIEW_H = 242;
    const SPEED = 205;      // world units per second of walking
    const HOLD = 1.15;      // seconds standing at each stop
    const START_X = 60;

    // ── where the walk ends today ────────────────────────────────────
    // He is still walking, so the last leg is measured from the date, not
    // written down: a little further every month, stopping short of the door.
    const now = new Date();
    const monthsSince2026 = (now.getFullYear() - 2026) * 12 + now.getMonth();
    const LAST_X = Math.min(5074, 5010 + Math.max(0, monthsSince2026) * 8);

    const stations = facts.map((li, i) => ({
        el: li,
        index: i,
        x: i === facts.length - 1 ? LAST_X : +li.dataset.x,
        hand: li.dataset.hand,
        date: li.querySelector('time').getAttribute('datetime'),
    }));

    // ── ground: a table from x to length, so the line can grow with him ──
    const groundLen = ground.getTotalLength();
    const table = [];
    for (let i = 0; i <= 400; i++) {
        const l = (groundLen * i) / 400;
        table.push([ground.getPointAtLength(l).x, l]);
    }
    function lengthAtX(x) {
        if (x <= table[0][0]) return 0;
        if (x >= table[table.length - 1][0]) return groundLen;
        let lo = 0, hi = table.length - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (table[mid][0] <= x) lo = mid; else hi = mid;
        }
        const [x0, l0] = table[lo], [x1, l1] = table[hi];
        const k = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
        return l0 + (l1 - l0) * k;
    }
    function pointAtX(x) {
        return ground.getPointAtLength(lengthAtX(x));
    }

    // ── things that get drawn as he arrives ──────────────────────────
    const scenes = Array.from(svg.querySelectorAll('.jscene')).map((g) => {
        const strokes = [], fades = [];
        g.querySelectorAll('*').forEach((el) => {
            if (el.closest('.jdoor')) { fades.push(el); return; }
            if (el.tagName === 'text' || el.closest('.jknot')) {
                if (el.tagName === 'text' || el.classList.contains('jknot')) fades.push(el);
                return;
            }
            if (typeof el.getTotalLength === 'function') {
                let len = 0;
                try { len = el.getTotalLength(); } catch (e) { len = 0; }
                if (len > 0) {
                    el.style.strokeDasharray = len;
                    el.style.strokeDashoffset = len;
                    strokes.push({ el, len });
                }
            }
        });
        g.querySelectorAll('.jknot').forEach((k) => fades.push(k));
        fades.forEach((el) => { el.style.opacity = 0; });
        return { g, strokes, fades };
    });

    // ── what he is carrying ──────────────────────────────────────────
    const NS = 'http://www.w3.org/2000/svg';
    const HANDS = {
        // a mortar and pestle, a round bottom flask, a laptop, a small network
        mortar: 'M -9 0 a 9 6 0 0 0 18 0 M -11 0 h 22 M 4 -3 l 8 -12 M 12 -15 l 3 -4',
        flask: 'M -4 -14 v 6 l -7 12 a 2 2 0 0 0 2 3 h 12 a 2 2 0 0 0 2 -3 l -7 -12 v -6 z M -6 -14 h 8',
        laptop: 'M -11 -7 h 22 v 12 h -22 z M -14 5 h 28 l -2 3 h -24 z',
        graph: 'M -10 2 l 6 -9 l 8 4 l 6 -8 M -10 2 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 '
            + 'M -4 -7 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 4 -3 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 '
            + 'M 10 -11 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
    };
    const handLayer = document.createElementNS(NS, 'g');
    handLayer.setAttribute('class', 'jhand');
    manLayer.parentNode.insertBefore(handLayer, manLayer.nextSibling);
    const handPath = document.createElementNS(NS, 'path');
    handPath.setAttribute('class', 'jl');
    handPath.setAttribute('stroke-width', '2.2');
    handLayer.appendChild(handPath);
    let handKey = '';

    // the figure drawn for the no JavaScript version steps aside
    const staticMan = svg.querySelector('.jman-static');
    if (staticMan) staticMan.remove();

    const man = window.SM.create(manLayer, { stroke: 6, scale: 0.66 });

    // ── the timeline ─────────────────────────────────────────────────
    const state = { x: START_X, t: 0 };
    let lastX = START_X, phase = 0, face = 1;

    const tl = gsap.timeline({ paused: true, onUpdate: render });
    let at = 0;
    let prevX = START_X;
    stations.forEach((st, i) => {
        const dist = Math.max(1, st.x - prevX);
        const walk = dist / SPEED;
        tl.to(state, { x: st.x, duration: walk, ease: 'none' }, at);
        const scene = scenes[i];
        if (scene) {
            const draw = Math.min(1.5, walk * 0.7);
            const startDraw = at + Math.max(0, walk - draw - 0.15);
            if (scene.strokes.length) {
                tl.to(scene.strokes.map((s) => s.el), {
                    strokeDashoffset: 0,
                    duration: draw,
                    stagger: draw / Math.max(6, scene.strokes.length),
                    ease: 'none',
                }, startDraw);
            }
            if (scene.fades.length) {
                tl.to(scene.fades, { opacity: 1, duration: 0.45, ease: 'power2.out' }, startDraw + draw * 0.6);
            }
        }
        at += walk;
        tl.addLabel('s' + (i + 1), at);
        at += HOLD;
        tl.to(state, { t: 0, duration: HOLD }, at - HOLD);   // he stands still
        prevX = st.x;
    });
    const TOTAL = tl.duration();

    // ── rendering, a pure function of state.x ────────────────────────
    function viewWidth() {
        const r = svg.getBoundingClientRect();
        if (!r.height) return 1000;
        return VIEW_H * (r.width / r.height);
    }

    function activeIndex(x) {
        // Before the first stop the caption already shows where he is headed,
        // so the space under the stage is never empty.
        let idx = 0;
        stations.forEach((st, i) => { if (x >= st.x - 12) idx = i; });
        return idx;
    }

    function setCaption(idx) {
        facts.forEach((li, i) => li.classList.toggle('is-active', i === idx));
    }

    function yearAt(x) {
        // Reads the dates off the list, so the label can never drift from it.
        const toYear = (d) => {
            const [y, m] = d.split('-');
            return +y + (m ? (+m - 1) / 12 : 0);
        };
        if (x <= stations[0].x) return toYear(stations[0].date);
        for (let i = 1; i < stations.length; i++) {
            if (x <= stations[i].x) {
                const a = stations[i - 1], b = stations[i];
                const k = (x - a.x) / Math.max(1, b.x - a.x);
                return toYear(a.date) + (toYear(b.date) - toYear(a.date)) * k;
            }
        }
        return now.getFullYear() + now.getMonth() / 12;
    }

    function render() {
        const x = state.x;
        const dx = x - lastX;
        lastX = x;
        if (Math.abs(dx) > 0.4) {
            phase += dx * 0.055;
            face = dx > 0 ? 1 : -1;
        }
        const moving = Math.abs(dx) > 0.4;
        const p = pointAtX(x);
        const t = tl.time();
        const hand = man.set(p.x, p.y, moving ? 'walk' : 'idle', phase, t, face, 1);

        // the ground appears just ahead of his feet, and the ruler fills behind
        ground.style.strokeDashoffset = Math.max(0, groundLen - lengthAtX(x + 54));
        if (progress) {
            progress.style.strokeDasharray = WORLD_W;
            progress.style.strokeDashoffset = Math.max(0, WORLD_W - x);
        }

        // what he is carrying
        const idx = activeIndex(x);
        const key = idx >= 0 ? stations[idx].hand : stations[0].hand;
        if (key !== handKey) {
            handKey = key;
            handPath.setAttribute('d', HANDS[key] || HANDS.mortar);
        }
        handLayer.setAttribute('transform',
            `translate(${hand.x.toFixed(1)},${hand.y.toFixed(1)}) scale(${(hand.face * 1.4).toFixed(2)},1.4)`);
        handLayer.style.opacity = x > START_X + 20 ? 1 : 0;

        // camera
        const vw = viewWidth();
        const cx = Math.max(0, Math.min(WORLD_W - vw, x - vw * 0.36));
        svg.setAttribute('viewBox', `${cx.toFixed(1)} ${VIEW_Y} ${vw.toFixed(1)} ${VIEW_H}`);

        setCaption(idx);

        // readouts
        if (timeEl) {
            const s = Math.round(t);
            timeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} / `
                + `${Math.floor(TOTAL / 60)}:${String(Math.round(TOTAL % 60)).padStart(2, '0')}`;
        }
        if (yearEl) yearEl.textContent = yearAt(x).toFixed(1);
        if (scrub && document.activeElement !== scrub) {
            scrub.value = Math.round(tl.progress() * 1000);
        }
    }

    // ── controls ─────────────────────────────────────────────────────
    root.classList.add('is-live');
    if (controls) controls.hidden = false;

    let finished = false;
    function label() {
        if (!playBtn) return;
        if (finished) { playBtn.textContent = 'Replay'; playBtn.setAttribute('aria-label', 'Replay the walk'); return; }
        const playing = tl.isActive();
        playBtn.textContent = playing ? 'Pause' : 'Play';
        playBtn.setAttribute('aria-label', playing ? 'Pause the walk' : 'Play the walk');
    }
    tl.eventCallback('onComplete', () => { finished = true; label(); });

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (finished || tl.progress() === 1) { finished = false; tl.restart(); }
            else if (tl.isActive()) tl.pause();
            else tl.play();
            label();
        });
    }
    if (scrub) {
        const seek = () => {
            tl.pause();
            finished = false;
            tl.progress(+scrub.value / 1000);
            label();
        };
        scrub.addEventListener('input', seek);
        scrub.addEventListener('change', seek);
    }

    // A way back to the plain list, for anyone who would rather just read.
    if (controls) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'journey-list-toggle';
        toggle.textContent = 'Show all as a list';
        toggle.addEventListener('click', () => {
            const open = root.classList.toggle('list-open');
            toggle.textContent = open ? 'Show one at a time' : 'Show all as a list';
        });
        controls.appendChild(toggle);
    }

    // ── when it plays ────────────────────────────────────────────────
    // It starts itself once the drawing is on screen, stops when it is not,
    // and never restarts anything the reader paused or scrubbed by hand.
    let userPaused = false;
    if (playBtn) {
        playBtn.addEventListener('click', () => { userPaused = !tl.isActive(); });
    }
    if (scrub) {
        scrub.addEventListener('input', () => { userPaused = true; });
    }
    if (REDUCE) {
        tl.progress(1);
        finished = true;
        label();
    } else if ('IntersectionObserver' in window) {
        const stage = root.querySelector('.journey-stage') || root;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                const onScreen = e.isIntersecting && e.intersectionRatio >= 0.45;
                if (onScreen && !finished && !userPaused && !tl.isActive()) tl.play();
                else if (!onScreen && tl.isActive()) tl.pause();
                label();
            });
        }, { threshold: [0, 0.45, 0.9] });
        io.observe(stage);
    } else {
        tl.play();
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && tl.isActive()) { tl.pause(); label(); }
    });

    let resizeRaf = 0;
    window.addEventListener('resize', () => {
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; render(); });
    });

    render();
    label();
})();
