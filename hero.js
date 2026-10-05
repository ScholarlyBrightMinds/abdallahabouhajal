/* ═══════════════════════════════════════════════════════════════════
   hero.js · the homepage hero's moving parts

   Three things the CSS cannot do alone:
   - the "Published in" strip gets one hidden copy of its list, so it can
     scroll without a gap, at a fixed speed in pixels per second;
   - the citation count counts up once, after scripts.js has written it;
   - the MD tile plays erlotinib through 34 real frames of the 1M17 run
     (images/hero/md.json, written by build_hero.py) while it turns.

   Reduced motion gets the still version of all three. Everything stops
   while the hero is off screen, the tab is hidden, or the site's motion
   switch (--sbm-anim: paused) is set.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var hero = document.querySelector('.hero');
    if (!hero) return;

    var root = document.documentElement;
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var onScreen = true;
    var isFrozen = false;   // read again whenever <html> or the motion setting changes

    function reduced() { return !!(mq && mq.matches); }
    function frozen() {
        return getComputedStyle(root).getPropertyValue('--sbm-anim').trim() === 'paused';
    }
    function canMove() { return onScreen && !document.hidden && !reduced() && !isFrozen; }

    // ── the journal strip ──────────────────────────────────────────
    function startStrip() {
        var strip = hero.querySelector('[data-hero-marquee]');
        if (!strip || reduced()) return;
        var belt = strip.querySelector('.hero-journals-belt');
        var track = belt && belt.querySelector('.hero-journals-track');
        if (!track || belt.children.length > 1) return;
        var copy = track.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        belt.appendChild(copy);
        // GenAI's strip runs at about 36 px a second; match the speed, not
        // the duration, since this list is longer than theirs
        var width = track.getBoundingClientRect().width;
        if (width > 0) strip.style.setProperty('--hero-belt-dur', Math.round(width / 36) + 's');
        strip.classList.add('is-looping');
        // a strip that moves by itself is not one you swipe, so it leaves the tab order
        strip.removeAttribute('tabindex');
    }

    // ── the citation count ─────────────────────────────────────────
    function countUp() {
        var el = hero.querySelector('.hero-number strong');
        if (!el || reduced() || isFrozen) return;
        var end = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
        if (!end) return;
        var t0 = null;
        var dur = 1500;
        el.textContent = '0';
        function step(now) {
            if (t0 === null) t0 = now;
            var p = Math.min(1, (now - t0) / dur);
            el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = String(end);
        }
        // start with the rise of its line, which comes second in the entrance
        setTimeout(function () { requestAnimationFrame(step); }, 260);
    }

    // ── the MD tile ────────────────────────────────────────────────
    var canvas = hero.querySelector('[data-hero-md]');
    var md = null, ctx = null, px = 0, raf = 0, last = 0, t0 = 0, drawn = 0;
    var STEP = 33;         // the motion is slow, so 30 drawings a second is plenty
    var COLOUR = { C: [30, 31, 30], N: [30, 86, 200], O: [179, 64, 47], S: [143, 106, 43] };
    var TURN = 12000;      // one full turn about the vertical, in ms
    var FRAME = 260;       // ms per MD frame (60 ps), so 34 frames take about 9 s
    var TILT = -0.35;

    function prep(d) {
        var s = d.scale;
        return {
            els: d.els,
            bonds: d.bonds,
            r: d.r,
            frames: d.frames.map(function (f) {
                return f.map(function (v) { return v / s; });
            })
        };
    }
    function size() {
        if (!canvas) return;
        var css = canvas.getBoundingClientRect().width;
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var want = Math.max(1, Math.round(css * dpr));
        if (want !== px) { px = want; canvas.width = canvas.height = px; }
    }
    function draw(t) {
        if (!md || !ctx || !px) return;
        var n = md.frames.length;
        // play forward, then back, so the loop has no jump
        var pos = (t / FRAME) % (2 * (n - 1));
        if (pos > n - 1) pos = 2 * (n - 1) - pos;
        var i = Math.floor(pos), j = Math.min(n - 1, i + 1), f = pos - i;
        f = f * f * (3 - 2 * f);
        var A = md.frames[i], B = md.frames[j];
        var th = (t / TURN) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
        var ct = Math.cos(TILT), st = Math.sin(TILT);
        var k = (px * 0.47) / md.r, h = px / 2;
        var na = md.els.length, X = new Array(na), Y = new Array(na), Z = new Array(na), a;
        for (a = 0; a < na; a++) {
            var x = A[3 * a] + (B[3 * a] - A[3 * a]) * f;
            var y = A[3 * a + 1] + (B[3 * a + 1] - A[3 * a + 1]) * f;
            var z = A[3 * a + 2] + (B[3 * a + 2] - A[3 * a + 2]) * f;
            var x1 = x * c + z * s, z1 = -x * s + z * c;
            var y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
            X[a] = h + x1 * k; Y[a] = h - y2 * k; Z[a] = z2;
        }
        var order = [];
        for (a = 0; a < md.bonds.length; a += 2) order.push(a);
        order.sort(function (p, q) {
            return (Z[md.bonds[p]] + Z[md.bonds[p + 1]]) - (Z[md.bonds[q]] + Z[md.bonds[q + 1]]);
        });
        ctx.clearRect(0, 0, px, px);
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1.5, px * 0.03);
        order.forEach(function (b) {
            var u = md.bonds[b], v = md.bonds[b + 1];
            var depth = ((Z[u] + Z[v]) / 2 / md.r + 1) / 2;          // 0 far, 1 near
            var alpha = (0.35 + 0.65 * depth).toFixed(3);
            var mx = (X[u] + X[v]) / 2, my = (Y[u] + Y[v]) / 2;
            [[u, X[u], Y[u]], [v, X[v], Y[v]]].forEach(function (half) {
                var col = COLOUR[md.els[half[0]]] || COLOUR.C;
                ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')';
                ctx.beginPath();
                ctx.moveTo(half[1], half[2]);
                ctx.lineTo(mx, my);
                ctx.stroke();
            });
        });
    }
    function frame(now) {
        raf = 0;
        if (!canMove()) return;
        if (!t0) t0 = now - last;
        last = now - t0;
        if (now - drawn >= STEP) { drawn = now; draw(last); }
        raf = requestAnimationFrame(frame);
    }
    function kick() {
        isFrozen = frozen();
        if (!md) return;
        if (canMove()) {
            if (!raf) { t0 = 0; raf = requestAnimationFrame(frame); }
        } else {
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
            if (reduced()) draw(0.05 * TURN);   // one still frame, turned a little
        }
    }
    function loadMD() {
        if (!canvas || !window.fetch) return;
        var conn = navigator.connection;
        if (conn && conn.saveData) return;
        fetch('images/hero/md.json')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!d || !d.frames || !d.frames.length) return;
                md = prep(d);
                ctx = canvas.getContext('2d');
                size();
                draw(reduced() ? 0.05 * TURN : last);
                var mark = canvas.closest('.hero-mark');
                if (mark) mark.classList.add('is-live');
                if ('ResizeObserver' in window) {
                    new ResizeObserver(function () { size(); draw(last || 0.05 * TURN); }).observe(canvas);
                }
                kick();
            })
            .catch(function () { /* the still drawing stays */ });
    }

    // ── when to move ───────────────────────────────────────────────
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            onScreen = entries[0].isIntersecting;
            hero.classList.toggle('is-off', !onScreen);
            kick();
        }).observe(hero);
    }
    document.addEventListener('visibilitychange', kick);
    if (mq && mq.addEventListener) mq.addEventListener('change', kick);
    // the switch can be set at any time, as a style on <html>
    if ('MutationObserver' in window) {
        new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    // scripts.js writes the numbers on DOMContentLoaded; this listener is
    // added after its own, so the count starts from the written number
    var booted = false;
    function boot() {
        if (booted) return;
        booted = true;
        isFrozen = frozen();
        startStrip();
        countUp();
    }
    document.addEventListener('DOMContentLoaded', boot);
    window.addEventListener('load', function () {
        boot();
        (window.requestIdleCallback || function (fn) { setTimeout(fn, 300); })(loadMD);
    });
})();
