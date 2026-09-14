/* ═══════════════════════════════════════════════════════════════════
   notes.js · the wall of sticky notes around the introduction

   A visitor writes a note, it sticks to the wall, and it stays there on
   their next visit until it is a week old. There is no server behind
   this site, so the wall lives in the reader's own browser: their notes
   are theirs, nobody else's notes appear, and nothing is collected.

   The one thing that does leave the browser is the tick box: with it on,
   the note is also posted to the same Formspree endpoint the contact form
   uses, so Abdallah actually receives it. If that post fails the note
   still sticks, because the wall is not worth breaking over a network.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var wall = document.querySelector('[data-wall]');
    if (!wall) return;

    var KEY = 'sbm-wall-v1';
    var WEEK = 7 * 24 * 60 * 60 * 1000;
    var MAX = 7;                     // how many fit around him before the oldest goes
    var LIMIT = 160;                 // characters on one note
    var ENDPOINT = wall.getAttribute('data-endpoint') || '';
    var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var list = wall.querySelector('[data-wall-list]');
    var addBtn = wall.querySelector('[data-wall-add]');
    var saidEl = wall.querySelector('[data-wall-said]');
    // the dialog lives outside the wall, so that a modal is not nested inside
    // a decorative layer that the introduction positions
    var dialog = document.querySelector('[data-wall-dialog]');
    var form = dialog && dialog.querySelector('[data-wall-form]');
    var textEl = dialog && dialog.querySelector('[data-wall-text]');
    var fromEl = dialog && dialog.querySelector('[data-wall-from]');
    var sendEl = dialog && dialog.querySelector('[data-wall-send]');
    var countEl = dialog && dialog.querySelector('[data-wall-count]');
    var cancelEl = dialog && dialog.querySelector('[data-wall-cancel]');
    if (!list || !addBtn || !dialog || !form || !textEl) return;

    // where a note can land, as a percentage of the introduction, and how far
    // it leans. Odd slots are on his left, even on his right.
    var SLOTS = [
        { x: 4, y: 14, r: -4 }, { x: 82, y: 10, r: 3 },
        { x: 2, y: 44, r: 3 }, { x: 84, y: 40, r: -3 },
        { x: 6, y: 70, r: -2 }, { x: 80, y: 68, r: 4 },
        { x: 3, y: 27, r: 2 }, { x: 86, y: 56, r: -2 }
    ];

    // ── what is on the wall ─────────────────────────────────────────
    function read() {
        var raw;
        try { raw = window.localStorage.getItem(KEY); } catch (e) { return []; }
        if (!raw) return [];
        var rows;
        try { rows = JSON.parse(raw); } catch (e) { return []; }
        if (!rows || !rows.length) return [];
        var now = Date.now();
        return rows.filter(function (n) { return n && n.t && (now - (n.at || 0)) < WEEK; });
    }
    function write(rows) {
        try { window.localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) { /* private window */ }
    }

    // every piece of a note is written with textContent, so a note can only
    // ever be text, whatever somebody types into it
    function bit(tag, cls, text) {
        var n = document.createElement(tag);
        n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }
    function daysLeft(at) {
        var d = Math.ceil((WEEK - (Date.now() - at)) / (24 * 60 * 60 * 1000));
        return d <= 1 ? 'clears tomorrow' : 'clears in ' + d + ' days';
    }

    function paint(fresh) {
        var rows = read();
        list.textContent = '';
        rows.slice(0, MAX).forEach(function (n, i) {
            var slot = SLOTS[i % SLOTS.length];
            var li = document.createElement('li');
            li.className = 'note' + (fresh && i === 0 ? ' is-new' : '');
            li.style.setProperty('--x', slot.x + '%');
            li.style.setProperty('--y', slot.y + '%');
            li.style.setProperty('--r', (REDUCE ? 0 : slot.r) + 'deg');
            var tape = bit('span', 'note-tape');
            tape.setAttribute('aria-hidden', 'true');
            li.appendChild(tape);
            li.appendChild(bit('p', 'note-text', n.t));
            if (n.f) li.appendChild(bit('p', 'note-from', 'from ' + n.f));
            li.appendChild(bit('p', 'note-life', daysLeft(n.at)));
            list.appendChild(li);
        });
        // the invitation goes in the first slot nobody is using
        var slot = SLOTS[Math.min(rows.length, SLOTS.length - 1)];
        addBtn.style.setProperty('--x', slot.x + '%');
        addBtn.style.setProperty('--y', slot.y + '%');
        addBtn.style.setProperty('--r', (REDUCE ? 0 : slot.r) + 'deg');
        wall.classList.toggle('has-notes', rows.length > 0);
    }

    // ── writing one ─────────────────────────────────────────────────
    function openForm() {
        if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
        textEl.value = '';
        if (fromEl) fromEl.value = '';
        count();
        textEl.focus();
    }
    function closeForm() {
        if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
        addBtn.focus();
    }
    function count() {
        if (countEl) countEl.textContent = (LIMIT - textEl.value.length) + ' left';
    }

    addBtn.addEventListener('click', openForm);
    if (cancelEl) cancelEl.addEventListener('click', closeForm);
    textEl.addEventListener('input', count);
    dialog.addEventListener('cancel', function () { addBtn.focus(); });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = textEl.value.trim().slice(0, LIMIT);
        if (!text) { textEl.focus(); return; }
        var from = fromEl ? fromEl.value.trim().slice(0, 28) : '';
        var rows = read();
        rows.unshift({ t: text, f: from, at: Date.now() });
        write(rows.slice(0, MAX));
        paint(true);
        closeForm();
        if (saidEl) {
            saidEl.textContent = 'Stuck. It stays on this wall for a week.' +
                (sendEl && sendEl.checked ? ' A copy is on its way to Abdallah.' : '');
        }
        if (sendEl && sendEl.checked && ENDPOINT) send(text, from);
    });

    // fire and forget: the wall never waits for the network
    function send(text, from) {
        try {
            window.fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    message: text,
                    name: from || 'someone who did not say',
                    _subject: 'A sticky note from your homepage'
                })
            }).catch(function () {});
        } catch (e) { /* no fetch, no problem */ }
    }

    paint(false);
    wall.hidden = false;
})();
