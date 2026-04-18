// ═══════════════════════════════════════════════════════════════════
//  theme.config.js
//  Single source of truth for this researcher's site.
//  To port to another researcher: clone the repo, swap THIS FILE,
//  change the SCHOLAR_AUTHOR_ID in .github/workflows/serpapi-monthly.yml
//  (and SCOPUS_AUTHOR_ID secret), change /images/profile.png. Done.
// ═══════════════════════════════════════════════════════════════════

window.SITE_CONFIG = {

    // ── Identity ──────────────────────────────────────────────────
    identity: {
        fullName:  "Abdallah Abou Hajal",
        firstName: "Abdallah",
        lastName:  "Abou Hajal",
        initials:  "AAH",
        role:      "AI × Drug Discovery",
        tagline:   "Researcher &amp; Data Analyst — building ML pipelines between cheminformatics, AutoML, and large language models.",
        location:  "Abu Dhabi, UAE",
        status:    "exploring CYP450 metabolism with ML",
        photo:     "images/profile.png",
        affiliation: {
            name: "Scifiniti Publishing",
            url:  "https://scifiniti.com",
            role: "Researcher &amp; Data Analyst"
        }
    },

    // ── Palette ──────────────────────────────────────────────────
    // Hub-assigned color for this researcher. Applied to CSS vars at runtime.
    palette: {
        name:       "teal",
        // Dark mode (default — "Night in the Lab")
        dark: {
            bg:          "#0d1411",
            bgSoft:      "#131a17",
            bgDeep:      "#080d0b",
            card:        "#182220",
            cardSoft:    "#141d1a",
            text:        "#ebe4d0",
            textSoft:    "#b5ad98",
            muted:       "#6e685c",
            border:      "#253029",
            borderS:     "#1d2522",
            accent:      "#6fab98",      /* teal — glow */
            accentD:     "#93c8b4",      /* teal — hover */
            accentBg:    "rgba(111,171,152,0.10)",
            accentGlow:  "rgba(111,171,152,0.20)",
            amber:       "#d4a668",
            amberBg:     "rgba(212,166,104,0.10)",
            amberGlow:   "rgba(212,166,104,0.18)"
        },
        // Light mode ("Day in the Lab")
        light: {
            bg:          "#f7f3e8",
            bgSoft:      "#f0ead8",
            bgDeep:      "#e9e1c8",
            card:        "#ffffff",
            cardSoft:    "#fbf8ef",
            text:        "#25251f",
            textSoft:    "#46443d",
            muted:       "#8a8378",
            border:      "#e6dfcd",
            borderS:     "#f0ead9",
            accent:      "#2d5547",      /* teal — deep */
            accentD:     "#1f4134",
            accentBg:    "#e5efea",
            accentGlow:  "rgba(45,85,71,0.14)",
            amber:       "#96642c",
            amberBg:     "#f6ecdb",
            amberGlow:   "rgba(150,100,44,0.14)"
        }
    },

    // ── IDs (external profiles) ───────────────────────────────────
    ids: {
        scholar: "1I8SvsQAAAAJ",
        scopus:  "58094444100",
        orcid:   "0009-0006-1807-2178",
        github:  "ScholarlyBrightMinds",
        email:   "abdallah.abouhajal@gmail.com",
        instagram: "abdallah_abouhajal"
    },

    // ── Social links (rendered in hero + footer) ─────────────────
    // Order determines display order. Set to null to hide.
    social: [
        { key: "scholar",  label: "Google Scholar", url: "https://scholar.google.com/citations?user=1I8SvsQAAAAJ&hl=en" },
        { key: "scopus",   label: "Scopus",         url: "https://www.scopus.com/authid/detail.uri?authorId=58094444100" },
        { key: "orcid",    label: "ORCID",          url: "https://orcid.org/0009-0006-1807-2178" },
        { key: "github",   label: "GitHub",         url: "https://github.com/ScholarlyBrightMinds" },
        { key: "instagram",label: "Instagram",      url: "https://www.instagram.com/abdallah_abouhajal/" },
        { key: "email",    label: "Email",          url: "mailto:abdallah.abouhajal@gmail.com" }
    ],

    // ── Home page bio (short, for hero) ──────────────────────────
    bio: {
        short: "AI × Drug Discovery researcher with an MSc in Pharmaceutical Sciences. I build ML pipelines that flag problematic molecules before they waste months of lab time.",
        long: "I completed my Bachelor's in Pharmacy, and somewhere during my MSc I fell into the world of AI and drug discovery and honestly never looked back. Now I spend my time writing Python scripts to automate things nobody asked me to automate. My MSc thesis tackled colloidal aggregators — molecules that look like promising hits but are actually just clumping and causing false positives — and we built a machine-learning tool to catch them early. It lives on a public web server. Still proud of that one."
    },

    // ── Quick-stat chips shown in hero ───────────────────────────
    // First 5 shown. `variant: 'gold'` uses amber color instead of accent.
    chips: [
        { label: "13 Publications · 96 Citations" },
        { label: "h-index 7" },
        { label: "First-Author · JCIM" },
        { label: "🥇 BindHack · Insilico Medicine", variant: "gold" },
        { label: "MSc Pharm. Sci. · GPA 3.94" }
    ],

    // ── Per-page sub-hero lede text ──────────────────────────────
    ledes: {
        about:        "Researcher in AI-driven drug discovery, now working at the intersection of cheminformatics, AutoML, and large language models.",
        projects:     "Active work across cheminformatics, AutoML, and LLMs for science. Some are published, some in review, some still cooking.",
        publications: "Peer-reviewed output across machine learning, cheminformatics, and drug discovery — updated automatically from Scholar and Scopus.",
        blog:         "Research notes, PhD-hunt reflections, event write-ups, and the occasional rant about a paper."
    },

    // ── About page: research narrative ───────────────────────────
    about: {
        paragraphs: [
            "I hold an <strong>MSc in Pharmaceutical Sciences</strong> from Al Ain University (GPA 3.94), working under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI &amp; computer science). My thesis developed a machine-learning tool for predicting promiscuous aggregate-based inhibitors — published first-author in the <em>Journal of Chemical Information and Modeling</em> and deployed as a public web server.",
            "Since then I have been a <strong>managing editor and data analyst at Scifiniti Publishing</strong>, which has kept me close to the day-to-day of peer review, journal analytics, and new research across STEM. In parallel I have kept publishing — most recently on AutoML for drug–drug interactions, and on benchmarking large language models for molecular property prediction.",
            "For my <strong>PhD</strong> I am drawn to <em>computational drug metabolism</em>: combining ML with molecular dynamics and quantum methods to model CYP450-mediated metabolism, where small gains in accuracy have real impact in early-stage drug development."
        ],

        // Vertical timeline on About page
        timeline: [
            { date: "MSc · Al Ain University",       title: "Pharmaceutical Sciences",          desc: "GPA 3.94 — supervised by Prof. Ghattas &amp; Prof. Ben Amor." },
            { date: "Thesis · Deployed",             title: "BAD Molecule Filter",              desc: "Public Streamlit web server for aggregator prediction." },
            { date: "JCIM · 2024",                   title: "First-author publication",         desc: "Boosting aggregate detection accuracy &amp; chemical space coverage." },
            { date: "Current · Scifiniti",           title: "Managing Editor &amp; Data Analyst", desc: "Peer review, journal analytics, STEM editorial work.", state: "current" },
            { date: "Current · Research",            title: "AutoML for DDI &amp; LLM benchmarking", desc: "Corresponding-author AutoGluon framework; four-model LLM study.", state: "current" },
            { date: "Next · PhD Target",             title: "Computational drug metabolism",    desc: "ML + MD + QM for CYP450-mediated metabolism.", state: "future" }
        ],

        // Three research-pillar cards
        pillars: [
            { icon: "molecule",  title: "Cheminformatics",           desc: "Molecular standardization, fingerprinting (Morgan / Mordred), applicability domain analysis, featurewiz selection." },
            { icon: "network",   title: "Machine Learning &amp; AutoML", desc: "LightGBM / CatBoost / XGBoost ensembles, AutoGluon stacked models, Chemprop GNNs, consensus voting." },
            { icon: "document",  title: "LLMs for Science",          desc: "Benchmarking reasoning vs non-reasoning LLMs for molecular property prediction against GNN &amp; fingerprint baselines." }
        ],

        // Awards section
        awards: [
            { icon: "🥇", title: "First Place, BindHack Hackathon",     venue: "Insilico Medicine, Masdar City · 2025" },
            { icon: "🥈", title: "Three Minute Thesis — 2nd Place",     venue: "2nd AAU Health &amp; Biomedical Postgraduate Symposium · 2024" },
            { icon: "🥇", title: "Best Quality Poster — 1st Place",     venue: "1st Int'l Conf. on Pharmacy &amp; Biomedical Sciences, Al Ain University · 2023" }
        ]
    },

    // ── Projects (Ongoing Research) ──────────────────────────────
    projects: [
        {
            n: "01",
            label: "Open Science · Review",
            title: "GitHub in AI-Driven Drug Discovery",
            desc:  "Explores the role of collaborative software platforms in modern science through an analysis of GitHub's application in AI-driven drug discovery. Studies the effects of open-source code sharing on research transparency and reproducibility, with insights into best practices for computational research.",
            tech:  ["Open Science", "GitHub", "Reproducibility", "AI", "Drug Discovery"],
            status: "Ongoing"
        },
        {
            n: "02",
            label: "AutoML · DDI Prediction",
            title: "Automating Drug–Drug Interaction Prediction",
            desc:  "Prediction of drug–drug interactions through Automated Machine Learning (AutoML) frameworks. Studies the effects of different molecular feature representations on predictive performance, with insights into automating and improving pharmacovigilance.",
            tech:  ["AutoGluon", "RDKit", "Morgan FP", "Python", "Pharmacovigilance"],
            status: "Published · Toxicology Mech. &amp; Methods 2026"
        },
        {
            n: "03",
            label: "LLMs · Drug Delivery",
            title: "Large Language Models in Drug Delivery",
            desc:  "Explores the potential of LLMs to overcome formulation challenges through a comprehensive review of the current landscape. Evaluates existing LLM-powered tools like ChemCrow and BioBERT and contributes to discussions on integrating AI into experimental workflows and personalized medicine.",
            tech:  ["LLMs", "ChemCrow", "BioBERT", "Drug Delivery", "Review"],
            status: "In Review"
        }
    ],

    // ── Blog posts (listed newest first) ─────────────────────────
    blog: [
        { file: "blog-post-5.html", title: "PhD Hunting: Hard, Exhausting, and Worth It", date: "Apr 11, 2026", tag: "Personal" },
        { file: "blog-post-4.html", title: "GitHub in Drug Discovery",                    date: "Dec 14, 2025", tag: "Research" },
        { file: "blog-post-3.html", title: "Hackathon @ Insilico Medicine",               date: "Nov 11, 2025", tag: "Event" },
        { file: "blog-post-2.html", title: "CHATGPT IS TURNING 3!!!",                     date: "Oct 25, 2025", tag: "AI" },
        { file: "blog-post-1.html", title: "Should You Go the Distance?",                 date: "Oct 20, 2025", tag: "Personal" }
    ],

    // ── Footer text ───────────────────────────────────────────────
    footer: {
        copyrightYear: 2026,
        tagline: "Part of the Scholarly Bright Minds hub.",
        credits: "A fork of <a href=\"https://github.com/muhammedrashidx/ScholarSite_2.0\" target=\"_blank\" rel=\"noopener\">ScholarSite_2.0</a>."
    }
};

// ═══════════════════════════════════════════════════════════════════
//  APPLY PALETTE TO CSS VARIABLES (runs on every page, before render)
// ═══════════════════════════════════════════════════════════════════
(function applyPalette() {
    const P = window.SITE_CONFIG.palette;
    const root = document.documentElement;

    function setMode(mode) {
        const p = P[mode];
        Object.entries(p).forEach(([k, v]) => {
            // camelCase → kebab-case; "bgSoft" → "--bg-soft"
            const cssVar = '--' + k.replace(/([A-Z])/g, '-$1').toLowerCase();
            root.style.setProperty(cssVar, v);
        });
    }

    // Determine initial theme: saved > system
    let theme = null;
    try { theme = localStorage.getItem('sbm-theme'); } catch (e) {}
    if (!theme) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'dark';   // default dark for hub identity
    }
    root.setAttribute('data-theme', theme);
    setMode(theme);

    // Expose for toggle use
    window.__applyTheme = function(mode) {
        root.setAttribute('data-theme', mode);
        setMode(mode);
        try { localStorage.setItem('sbm-theme', mode); } catch (e) {}

        // Swap highlight.js themes if both stylesheets are present
        const hL = document.getElementById('hljs-light');
        const hD = document.getElementById('hljs-dark');
        if (hL && hD) {
            hL.disabled = (mode === 'dark');
            hD.disabled = (mode !== 'dark');
        }
    };
})();
