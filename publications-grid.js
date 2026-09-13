// ═══════════════════════════════════════════════════════════════════
//  publications-grid.js · one job: draw each card's citation sparkline
//  when that card reaches the screen, instead of animating all fourteen
//  at once on load.
//
//  It adds .spark-wait to #list-articles (the CSS only holds a line back
//  while that class is there) and .spark-in to a card when its sparkline
//  is 30% visible. Without JS, without IntersectionObserver, or under
//  prefers-reduced-motion nothing is added and every line is simply
//  drawn. Removing this file leaves the page fully working.
// ═══════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    var list = document.getElementById('list-articles');
    if (!list || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var sparks = list.querySelectorAll('article.pub-item .pub-stat-spark');
    if (!sparks.length) return;

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var card = entry.target.closest('article.pub-item');
            if (card) card.classList.add('spark-in');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.3, rootMargin: '0px' });

    list.classList.add('spark-wait');
    Array.prototype.forEach.call(sparks, function (spark) { io.observe(spark); });
})();
