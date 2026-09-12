// ═══════════════════════════════════════════════════════════════════
//  motion.js · Additive motion layer (loads after scripts.js)
//
//  1. Count-up on metric numbers when they first enter the viewport
//     (#m-total / #m-cites / #m-h on publications.html, .impact-num on
//     the home page). Pure integers only; anything else is left alone.
//  Everything here is decorative and defensive: no dependencies, no
//  layout writes, transform/opacity/custom-props only, and every effect
//  is skipped under prefers-reduced-motion. Removing this file leaves
//  the site fully functional.
// ═══════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── 1 · COUNT-UP ────────────────────────────────────────────────
    function initCountUp() {
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        var els = document.querySelectorAll('#m-total, #m-cites, #m-h, .impact-num');
        if (!els.length) return;

        function animate(el) {
            var raw = (el.textContent || '').trim();
            if (!/^\d{1,6}$/.test(raw)) return;         // integers only ("1st", glyphs: skip)
            var target = parseInt(raw, 10);
            if (!target) return;

            var duration = Math.min(1100, 500 + target * 6);
            var start = null;

            function frame(now) {
                if (start === null) start = now;
                var t = Math.min(1, (now - start) / duration);
                var eased = 1 - Math.pow(1 - t, 3);      // ease-out cubic
                el.textContent = String(Math.round(target * eased));
                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    el.textContent = raw;                // land exactly on the real value
                }
            }
            requestAnimationFrame(frame);
        }

        var seen = new WeakSet();
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting && !seen.has(e.target)) {
                    seen.add(e.target);
                    animate(e.target);
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.4 });

        els.forEach(function (el) { io.observe(el); });
    }

    function init() {
        initCountUp();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
