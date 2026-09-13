// ═══════════════════════════════════════════════════════════════════
//  scripts.js · Shared runtime for all pages
//
//  Responsibilities:
//    1. Render the nav bar + footer from SITE_CONFIG (consistent everywhere)
//    2. Data-bind hero fields on the home page (data-bind attributes)
//    4. Scroll-reveal observer
//    5. Mobile hamburger behaviour
//
//  IMPORTANT: This file must be tolerant of pages that don't have all the
//  binding targets, skip silently if an element isn't present.
// ═══════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    const C = window.SITE_CONFIG;
    if (!C) {
        console.error('SITE_CONFIG missing: theme.config.js must load before scripts.js');
        return;
    }

    // ── SVG icons used across the site (kept inline to avoid image requests)
    const ICONS = {

        // Social platform icons
        scholar:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L.5 9.5 12 1l11.5 8.5-4.742 4.269C17.548 11.249 14.978 9.5 12 9.5s-5.548 1.749-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>`,
        orcid:        `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 17.353H5.844V7.08h1.525v10.273zM6.605 6.15a.925.925 0 1 1 0-1.85.925.925 0 0 1 0 1.85zm12.191 6.235c0 2.93-2.032 4.968-4.93 4.968h-3.87V7.08h3.87c2.898 0 4.93 2.068 4.93 5.305zm-1.56 0c0-2.037-1.214-3.913-3.37-3.913H11.52v7.827h2.346c2.156 0 3.37-1.876 3.37-3.914z"/></svg>`,
        github:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
        instagram:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
        email:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
        linkedin:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.339 18.338V10.67H5.667v7.668h2.672zM7.004 9.5a1.547 1.547 0 1 0 0-3.094 1.547 1.547 0 0 0 0 3.094zm11.335 8.838v-4.363c0-2.294-1.226-3.36-2.86-3.36a2.472 2.472 0 0 0-2.237 1.23v-1.057h-2.68c.035.76 0 7.668 0 7.668h2.68v-4.284c0-.24.018-.483.089-.655.195-.48.636-.977 1.378-.977.972 0 1.361.741 1.361 1.828v4.087h2.669z"/></svg>`,
        researchgate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.2 7.5v9M9.2 7.5h3.7a2.6 2.6 0 0 1 0 5.2H9.2M12.6 12.7l3.2 3.8"/></svg>`,
        cv:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>`,

        document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><circle cx="7.5" cy="13" r="0.5" fill="currentColor"/><line x1="10" y1="13" x2="17" y2="13"/><circle cx="7.5" cy="16" r="0.5" fill="currentColor"/><line x1="10" y1="16" x2="14" y2="16"/></svg>`,
        flask:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><line x1="7" y1="15" x2="17" y2="15"/></svg>`,
        chart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="20" y2="20"/><path d="M6 16l4-6 3 4 5-8"/></svg>`
    };

    // ═══════════════════════════════════════════════════════════════
    //  NAV rendering
    // ═══════════════════════════════════════════════════════════════

    const PAGES = [
        { key: 'home',         href: 'index.html',        label: 'Home' },
        { key: 'about',        href: 'about.html',        label: 'About' },
        { key: 'research',     href: 'research.html',     label: 'Research' },
        { key: 'publications', href: 'publications.html', label: 'Publications' },
        { key: 'contact',      href: 'contact.html',      label: 'Contact' }
    ];

    function renderNav() {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        const active = nav.getAttribute('data-page') || '';

        const menuItems = PAGES.map(p =>
            `<a href="${p.href}" class="nav-item ${p.key === active ? 'active' : ''}">${p.label}</a>`
        ).join('');

        nav.innerHTML = `
            <a href="index.html" class="brand">
                ${C.identity.fullName}
                <span class="brand-meta">${C.identity.role}</span>
            </a>
            <div class="nav-right">
                <div class="hamburger" aria-label="Menu"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
                <div class="nav-menu">${menuItems}</div>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    //  FOOTER rendering
    // ═══════════════════════════════════════════════════════════════
    function renderFooter() {
        const f = document.querySelector('footer[data-bind="footer"]');
        if (!f) return;
        const links = (C.social || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join('');
        f.innerHTML = `
            <div class="footer-left">
                <div>${C.identity.fullName} · ${C.identity.location} · © ${C.footer.copyrightYear}</div>
                <div class="colophon">
                    ${C.footer.tagline}
                </div>
            </div>
            <div class="footer-links">${links}</div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    //  HERO / HOME bindings
    // ═══════════════════════════════════════════════════════════════
    function bindHome() {
        function setBind(key, html) {
            const el = document.querySelector(`[data-bind="${key}"]`);
            if (el) el.innerHTML = html;
        }

        // Text bindings
        setBind('statusText', `Currently · ${C.identity.status}`);

        // Split name for italic emphasis on last word
        const parts = C.identity.fullName.split(' ');
        const last = parts.pop();
        setBind('heading', `${parts.join(' ')}<br><em>${last}</em>`);

        setBind('tagline', C.identity.tagline);
        setBind('bio', C.bio.short);

        // Chips
        const chipsHTML = (C.chips || []).map(c =>
            `<span class="chip${c.variant ? ' ' + c.variant : ''}">${c.label}</span>`
        ).join('');
        setBind('chips', chipsHTML);

        // Social icons
        const socialHTML = (C.social || []).map(s => {
            const icon = ICONS[s.key] || ICONS.github;
            return `<a href="${s.url}" class="social-icon" target="_blank" rel="noopener" aria-label="${s.label}" title="${s.label}">${icon}</a>`;
        }).join('');
        setBind('social', socialHTML);

        // Profile photo
        // Homepage stats line, from the chips build_html.py rewrites every Monday
        const statsEl = document.querySelector('[data-bind="stats"]');
        if (statsEl && C.chips) {
            const pc = ((C.chips.find(c => /Publications · /.test(c.label)) || {}).label || '')
                .match(/(\d[\d,]*) Publications · (\d[\d,]*) Citations/);
            const hm = ((C.chips.find(c => /^h-index /.test(c.label)) || {}).label || '').match(/h-index (\d+)/);
            if (pc) {
                statsEl.innerHTML = `<a href="publications.html"><strong>${pc[1]}</strong> papers</a>` +
                    `<span><strong>${pc[2]}</strong> citations</span>` +
                    (hm ? `<span>h-index <strong>${hm[1]}</strong></span>` : '');
            }
        }

        const photoEl = document.querySelector('[data-bind="photo"]');
        if (photoEl) photoEl.src = C.identity.photo;

        // PhD CTA block, only renders if SITE_CONFIG.phdCTA exists
        if (C.phdCTA) {
            const cta = C.phdCTA;
            const html = `
                <div class="phd-cta-inner">
                    <span class="phd-cta-ribbon">${cta.ribbon}</span>
                    <h3 class="phd-cta-title">${cta.title}</h3>
                    <p class="phd-cta-body">${cta.body}</p>
                    <div class="phd-cta-actions">
                        <a class="phd-cta-btn phd-cta-btn--primary" href="${cta.primaryHref}">
                            ${ICONS.email}<span>${cta.primaryLabel}</span>
                        </a>
                        <a class="phd-cta-btn phd-cta-btn--secondary" href="${cta.secondaryHref}">
                            <span>${cta.secondaryLabel}</span>
                            <span class="phd-cta-arrow" aria-hidden="true">→</span>
                        </a>
                        <a class="phd-cta-btn phd-cta-btn--tertiary" href="${cta.tertiaryHref}" download>
                            ${ICONS.cv}<span>${cta.tertiaryLabel}</span>
                        </a>
                    </div>
                </div>
            `;
            setBind('phdCTA', html);
        }

        // Impact stats: big "By the numbers" tiles
        if (Array.isArray(C.impactStats) && C.impactStats.length) {
            const html = C.impactStats.map(s => `
                <div class="impact-tile${s.variant ? ' impact-tile--' + s.variant : ''}">
                    <div class="impact-num">${s.num}</div>
                    <div class="impact-label">${s.label}</div>
                    <div class="impact-sub">${s.sub || ''}</div>
                </div>
            `).join('');
            setBind('impactStats', html);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  SUB-HERO lede text (runs on every sub-page)
    // ═══════════════════════════════════════════════════════════════
    function bindLedes() {
        if (!C.ledes) return;
        const map = {
            aboutLede:    C.ledes.about,
            pubsLede:     C.ledes.publications,
            blogLede:     C.ledes.blog,
            contactLede:  C.ledes.contact,
            researchLede: C.ledes.research
        };
        for (const [key, text] of Object.entries(map)) {
            const el = document.querySelector(`[data-bind="${key}"]`);
            if (el && text) el.innerHTML = text;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  ABOUT page bindings
    // ═══════════════════════════════════════════════════════════════
    function bindAbout() {
        if (!C.about) return;

        const paraEl = document.querySelector('[data-bind="aboutParagraphs"]');
        if (paraEl && C.about.paragraphs) {
            paraEl.innerHTML = C.about.paragraphs.map(p => `<p>${p}</p>`).join('');
        }

        const tlEl = document.querySelector('[data-bind="timeline"]');
        if (tlEl && C.about.timeline) {
            tlEl.innerHTML = C.about.timeline.map(item => {
                const cls = item.state ? ` ${item.state}` : '';
                return `
                    <div class="tl-item${cls}">
                        <p class="tl-date">${item.date}</p>
                        <p class="tl-title">${item.title}</p>
                        <p class="tl-desc">${item.desc}</p>
                    </div>
                `;
            }).join('');
        }

        const awEl = document.querySelector('[data-bind="awards"]');
        if (awEl && C.about.awards) {
            awEl.innerHTML = C.about.awards.map(a => `
                <li class="award-item">
                    <p class="a-title">${a.title}</p>
                    <p class="a-venue">${a.venue}</p>
                </li>
            `).join('');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  BLOG page bindings
    // ═══════════════════════════════════════════════════════════════
    function bindBlog() {
        const el = document.querySelector('[data-bind="blogList"]');
        if (!el) return;
        if (!C.blog || C.blog.length === 0) {
            el.innerHTML = `
                <div class="blog-empty">
                    <p class="blog-empty-icon" aria-hidden="true">${ICONS.document}</p>
                    <h3 class="blog-empty-title">Nothing here yet.</h3>
                    <p class="blog-empty-desc">Writing takes time. Check back soon, or follow my research on <a href="${C.social.find(s=>s.key==='scholar')?.url || '#'}" target="_blank" rel="noopener">Google Scholar</a>.</p>
                </div>
            `;
            return;
        }
        el.innerHTML = C.blog.map((post, i) => {
            const coverKey = post.cover || 'default';
            const cover = `
                <div class="blog-cover blog-cover--${coverKey}" aria-hidden="true">
                    <span class="blog-cover-num">${String(i + 1).padStart(2, '0')}</span>
                    ${post.tag ? `<span class="blog-cover-tag">${post.tag}</span>` : ''}
                </div>
            `;
            const excerpt = post.excerpt
                ? `<p class="blog-excerpt">${post.excerpt}</p>`
                : '';
            const readingTime = post.readingTime
                ? `<span class="blog-readtime">${post.readingTime}</span>`
                : '';
            return `
                <a href="${post.file}" class="blog-item reveal reveal-d${(i % 3) + 1}">
                    ${cover}
                    <div class="blog-body">
                        <h3 class="blog-title">${post.title}</h3>
                        ${excerpt}
                        <div class="blog-meta">
                            <span class="blog-date">${post.date}</span>
                            ${readingTime}
                            <span class="blog-read">Read <span class="arrow">→</span></span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        if (window.__revealObserver) {
            el.querySelectorAll('.reveal').forEach(r => window.__revealObserver.observe(r));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  CONTACT page bindings (contact.html)
    // ═══════════════════════════════════════════════════════════════
    function bindContact() {
        if (!C.contact) return;

        // Heading, plain: no accent word, no full stop
        const hEl = document.querySelector('[data-bind="contactH1"]');
        if (hEl) {
            hEl.textContent = `${C.contact.h1Front} ${C.contact.h1Accent}`.trim();
        }

        // Direct-contact card
        const dEl = document.querySelector('[data-bind="contactDirect"]');
        if (dEl) {
            dEl.innerHTML = `
                <p class="contact-direct-row">
                    <span class="contact-direct-icon">${ICONS.email}</span>
                    <a class="contact-direct-link" href="mailto:${C.contact.directEmail}">${C.contact.directEmail}</a>
                </p>
                <p class="contact-direct-row">
                    <span class="contact-direct-icon">${ICONS.cv}</span>
                    <a class="contact-direct-link" href="${C.contact.cvHref}" download>Download CV (PDF)</a>
                </p>
                <p class="contact-direct-row">
                    <span class="contact-direct-icon">${ICONS.linkedin}</span>
                    <a class="contact-direct-link" href="https://www.linkedin.com/in/${C.ids.linkedin}" target="_blank" rel="noopener">linkedin.com/in/${C.ids.linkedin}</a>
                </p>
                <p class="contact-response-time">${C.contact.responseTimeNote || ''}</p>
            `;
        }

        // Wire the form action + show a note if endpoint not yet configured
        const form = document.querySelector('form.contact-form');
        if (form) {
            const action = C.contact.formAction || '';
            const noteEl = form.querySelector('[data-bind="contactFormNote"]');
            if (action && !action.includes('REPLACE_WITH_FORMSPREE_ID')) {
                form.setAttribute('action', action);
                if (noteEl) noteEl.style.display = 'none';
            } else {
                // Disable submission until a real endpoint is configured
                form.setAttribute('data-disabled', 'true');
                form.addEventListener('submit', e => e.preventDefault());
                if (noteEl) noteEl.textContent = C.contact.formNote || '';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  SCROLL REVEAL
    // ═══════════════════════════════════════════════════════════════
    function wireReveal() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('vis'));
            return;
        }
        // Where scroll driven animations exist, styles.css does the reveal and
        // this observer only finishes the job for sections near the end of the
        // document, which can run out of scroll mid animation. Elsewhere it is
        // the reveal itself. Both end in the same class.
        const scrollDriven = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
        const ratio = scrollDriven ? 0.6 : 0.01;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                const deepEnough = e.intersectionRatio >= ratio
                    || e.boundingClientRect.top <= window.innerHeight * 0.35;
                if (e.isIntersecting && deepEnough) {
                    e.target.classList.add('vis');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: [0, ratio], rootMargin: '0px 0px -8% 0px' });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        // Expose so dynamically-added elements can register
        window.__revealObserver = observer;
    }

    // ═══════════════════════════════════════════════════════════════
    //  WHAT I WORK ON (research.html)
    //  Three groups, keyed off the statusKind field on each project:
    //  under review, then published, then what is active now.
    // ═══════════════════════════════════════════════════════════════
    function bindWork() {
        const reviewEl = document.querySelector('[data-bind="workReview"]');
        const doneEl   = document.querySelector('[data-bind="workDone"]');
        const nowEl    = document.querySelector('[data-bind="workNow"]');
        if (!C.projects || (!reviewEl && !doneEl && !nowEl)) return;

        const kind = p => (p.statusKind || '').toLowerCase();
        const item = p => {
            const k = kind(p);
            // No DOI on a manuscript still under review, so no link either.
            const title = p.doi
                ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">${p.title}</a>`
                : p.title;
            const year = ((p.status || '').match(/\b(19|20)\d{2}\b/) || [''])[0];
            let meta = '';
            if (k === 'published' && p.venue) {
                meta = `<p class="work-meta">${p.venue}${year ? ' · ' + year : ''}</p>`;
            } else if (k === 'review' && p.status) {
                meta = `<p class="work-meta">${p.status}</p>`;
            }
            const ask = k !== 'published' && p.needs
                ? `<p class="work-ask"><strong>Looking for:</strong> ${p.needs}</p>` : '';
            return `<li class="work-item"><h3>${title}</h3><p>${p.desc}</p>${meta}${ask}</li>`;
        };
        const group = (el, test) => {
            if (!el) return;
            el.innerHTML = C.projects.filter(test).map(item).join('');
        };
        group(reviewEl, p => kind(p) === 'review');
        group(doneEl,   p => kind(p) === 'published');
        group(nowEl,    p => kind(p) !== 'review' && kind(p) !== 'published');
    }

    // ═══════════════════════════════════════════════════════════════
    //  MOBILE hamburger
    // ═══════════════════════════════════════════════════════════════
    function wireMobile() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu   = document.querySelector('.nav-menu');
        if (!hamburger || !navMenu) return;

        function toggle() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('show');
        }
        function close() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('show');
        }

        hamburger.addEventListener('click', e => { e.stopPropagation(); toggle(); });
        document.addEventListener('click', e => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && hamburger.classList.contains('active')) {
                close();
            }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 760) close();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  INIT
    // ═══════════════════════════════════════════════════════════════
    function init() {
        renderNav();
        renderFooter();
        bindHome();
        bindLedes();
        wireReveal();
        bindAbout();
        bindWork();
        bindBlog();
        bindContact();
        wireMobile();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
