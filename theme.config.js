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
        tagline:   "AI Automation Lead &amp; researcher — LLM-based agents for academic publishing; ML pipelines and cheminformatics for drug discovery.",
        location:  "Abu Dhabi, UAE",
        status:    "benchmarking LLM chemical intelligence · researching AI agents for drug screening · seeking PhD opportunities",
        photo:     "images/profile.png",
        affiliation: {
            name: "Scifiniti Publishing",
            url:  "https://scifiniti.com",
            role: "Data Analyst &amp; AI Automation Lead"
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
        scholar:   "1I8SvsQAAAAJ",
        orcid:     "0009-0006-1807-2178",
        github:    "ScholarlyBrightMinds",
        githubUser:"AbdallahAbouHajal",
        linkedin:  "abdallah-abou-hajal",
        researchgate: "Abdallah-Abou-Hajal-2",
        email:     "abdallah.abouhajal@gmail.com",
        instagram: "abdallah_abouhajal"
    },

    // ── Social links (rendered in hero + footer) ─────────────────
    // Order determines display order. Set to null to hide.
    social: [
        { key: "scholar",     label: "Google Scholar",  url: "https://scholar.google.com/citations?user=1I8SvsQAAAAJ&hl=en" },
        { key: "orcid",       label: "ORCID",           url: "https://orcid.org/0009-0006-1807-2178" },
        { key: "linkedin",    label: "LinkedIn",        url: "https://www.linkedin.com/in/abdallah-abou-hajal/" },
        { key: "researchgate",label: "ResearchGate",    url: "https://www.researchgate.net/profile/Abdallah-Abou-Hajal-2" },
        { key: "github",      label: "GitHub",          url: "https://github.com/ScholarlyBrightMinds" },
        { key: "cv",          label: "Download CV",     url: "Abdallah-Abou-Hajal-CV.pdf" },
        { key: "instagram",   label: "Instagram",       url: "https://www.instagram.com/abdallah_abouhajal/" },
        { key: "email",       label: "Email",           url: "mailto:abdallah.abouhajal@gmail.com" }
    ],

    // ── Home page bio (short, for hero) ──────────────────────────
    bio: {
        short: "AI × Drug Discovery researcher and AI Automation Lead. I build LLM-based agents and Python automation for academic publishing, while researching ML pipelines, cheminformatics, and LLM applications in drug discovery.",
        long: "I completed my Bachelor's in Pharmacy, and somewhere during my MSc I fell into the world of AI and drug discovery and honestly never looked back. Now I spend my time writing Python scripts to automate things nobody asked me to automate. My MSc thesis tackled colloidal aggregators — molecules that look like promising hits but are actually just clumping and causing false positives — and we built a machine-learning tool to catch them early. It lives on a public web server. Still proud of that one."
    },

    // ── Quick-stat chips shown in hero ───────────────────────────
    // First 5 shown. `variant: 'gold'` uses amber color instead of accent.
    // Chips with hard-coded metrics are kept as fallback only. The build_html.py
    // step in the SerpApi workflow replaces the first chip with live numbers
    // (e.g., "14 Publications · 105 Citations") right before each commit, so
    // the static HTML that Google indexes always shows current stats.
    chips: [
        { label: "14 Publications · 103 Citations" },
        { label: "h-index 7" },
        { label: "4× Corresponding Author" },
        { label: "🥇 BindHack · Insilico Medicine", variant: "gold" },
        { label: "MSc Pharm. Sci. · GPA 3.94" }
    ],

    // ── Per-page sub-hero lede text ──────────────────────────────
    ledes: {
        about:        "Researcher in AI-driven drug discovery, now working at the intersection of cheminformatics, AutoML, and large language models.",
        projects:     "Active work on AI agents and computational toxicology at the top — followed by published output. If any of these intersect with your work, I would love to collaborate.",
        publications: "Peer-reviewed output across machine learning, cheminformatics, and drug discovery — synced weekly from Google Scholar.",
        blog:         "Research notes, PhD-hunt reflections, event write-ups, and the occasional rant about a paper."
    },

    // ── About page: research narrative ───────────────────────────
    about: {
        paragraphs: [
            "I hold an <strong>MSc in Pharmaceutical Sciences</strong> from Al Ain University (GPA 3.94), working under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI &amp; computer science). My thesis developed a machine-learning tool for predicting promiscuous aggregate-based inhibitors — published first-author in the <em>Journal of Chemical Information and Modeling</em> and deployed as a public web server.",
            "I currently work as a <strong>Data Analyst at Scifiniti Publishing</strong> (since May 2025), after two years there as <strong>Managing Editor</strong> (Feb 2023 – May 2025). This editorial side-of-the-house gave me a rare, hands-on view of how science actually gets published — peer-review coordination, journal performance analytics, editorial operations across multiple STEM titles.",
            "In parallel I have kept publishing — with <strong>4 papers as corresponding author</strong>, most recently on an <em>AutoML framework for drug–drug interaction prediction</em>, on <em>large language models in drug delivery</em>, on <em>machine-learning reliability in tumor-progression prediction</em>, and on <em>GitHub's significance for AI-driven drug discovery</em>.",
            "I am <strong>now seeking a PhD opportunity</strong> to further apply machine learning and data-driven methods to impactful challenges in drug discovery — AI-driven virtual and high-throughput screening, predictive modeling, and model interpretability. If that aligns with your group, I would love to hear from you."
        ],

        // Vertical timeline on About page
        timeline: [
            { date: "2016 – 2021",                   title: "BSc in Pharmacy",                  desc: "Al Ain University · GPA 3.83 · Honor Student 2017/2018." },
            { date: "Sep 2021 – Feb 2023",           title: "MSc &amp; Research / Lab Assistant", desc: "Postgraduate scholarship; undergrad lab sessions; drug-discovery research." },
            { date: "Apr 2023 · Graduation",         title: "MSc Pharmaceutical Sciences",      desc: "GPA 3.94 · Thesis supervised by Prof. Ghattas &amp; Prof. Ben Amor." },
            { date: "Feb 2023 – May 2025",           title: "Managing Editor · Scifiniti",      desc: "Editorial operations across multiple STEM journals." },
            { date: "2024 · JCIM",                   title: "First-author publication",         desc: "Boosting accuracy of colloidal-aggregator detection." },
            { date: "Since May 2025",                title: "Data Analyst · Scifiniti",         desc: "Journal analytics, workflow automation, strategic reporting.", state: "current" },
            { date: "2026 · Active research",        title: "AI agents &amp; AOP-driven toxicology", desc: "AI-augmented adverse-outcome pathway networks; agent-based drug discovery.", state: "current" },
            { date: "Next · PhD Search",             title: "Actively seeking a position",      desc: "ML × cheminformatics × drug discovery — open to strong groups worldwide.", state: "future" }
        ],

        // Three research-pillar cards
        pillars: [
            { icon: "molecule",  title: "Cheminformatics",           desc: "Molecular standardization, fingerprinting (Morgan / Mordred), applicability domain analysis, featurewiz selection." },
            { icon: "network",   title: "Machine Learning &amp; AutoML", desc: "LightGBM / CatBoost / XGBoost ensembles, AutoGluon stacked models, Chemprop GNNs, consensus voting." },
            { icon: "document",  title: "LLMs for Science",          desc: "Benchmarking reasoning vs non-reasoning LLMs for molecular property prediction against GNN &amp; fingerprint baselines." }
        ],

        // Awards section
        awards: [
            { icon: "🥇", title: "First Place, BindHack Hackathon",         venue: "Insilico Medicine, Masdar City · 2025 — antibody–antigen binding prediction in a 6-hour AI/drug discovery competition" },
            { icon: "🥈", title: "Three Minute Thesis — Second Place",      venue: "2nd AAU Health &amp; Biomedical Postgraduate Symposium · 2024" },
            { icon: "🥇", title: "Best Quality Poster — First Place",       venue: "1st International Conference on Pharmacy &amp; Biomedical Sciences, Al Ain University · 2023" },
            { icon: "🎓", title: "MSc Pharmaceutical Sciences · GPA 3.94",  venue: "Graduated with Excellent · Al Ain University, 2023" },
            { icon: "🎖️", title: "Postgraduate Scholarship",                venue: "Awarded for MSc research and lab-assistant duties · 2021–2023" },
            { icon: "🏅", title: "Honor Student · 2017–2018",               venue: "Bachelor of Pharmacy · Al Ain University" }
        ]
    },

    // ── Projects (Ongoing Research) ──────────────────────────────
    // statusKind: 'active' | 'review' | 'published' | 'draft'
    // A "Want to collaborate?" button is added to every card automatically.
    projects: [
        {
            n: "01",
            label: "AI Agents · Drug Discovery",
            title: "AI Agents in Drug Discovery",
            desc:  "Exploring autonomous AI agents that can plan, reason, and execute drug-discovery workflows end-to-end — from target identification through molecular generation to property prediction. Focus on LLM-backed agent frameworks that integrate specialised chemistry tools and orchestrate multi-step pipelines without constant human scaffolding.",
            tech:  ["LLM Agents", "Tool Use", "Drug Discovery", "Python", "AutoGen", "LangGraph"],
            status: "Active — data collection &amp; framework design",
            statusKind: "active",
            needs: "Looking for a collaborator with strong ML / LLM-agent experience or domain expertise in target discovery."
        },
        {
            n: "02",
            label: "Computational Toxicology · AOP",
            title: "AI-Augmented AOP Networks in Computational Toxicology",
            desc:  "Building AI-augmented Adverse Outcome Pathway (AOP) networks that link molecular initiating events to adverse health outcomes. The goal: use graph-based learning and LLM-assisted literature synthesis to automate AOP construction and identify critical pathway nodes for regulatory and screening use.",
            tech:  ["AOP Networks", "Graph ML", "Toxicology", "Literature Mining", "LLMs", "Python"],
            status: "Active — literature synthesis &amp; network prototyping",
            statusKind: "active",
            needs: "Open to toxicologists, graph-ML researchers, or teams interested in regulatory-adjacent computational tox work."
        },
        {
            n: "03",
            label: "Open Science · Review",
            title: "GitHub in AI-Driven Drug Discovery",
            desc:  "Examines the role of collaborative software platforms in modern science through an analysis of GitHub's application in AI-driven drug discovery. Studies how open-source code sharing affects research transparency and reproducibility, with insights into best practices for computational research.",
            tech:  ["Open Science", "GitHub", "Reproducibility", "AI", "Drug Discovery"],
            status: "Published · Expert Opinion on Drug Discovery · 2026",
            statusKind: "published"
        },
        {
            n: "04",
            label: "AutoML · DDI Prediction",
            title: "Automating Drug–Drug Interaction Prediction",
            desc:  "Prediction of drug–drug interactions through Automated Machine Learning (AutoML) frameworks. Studies the effects of different molecular feature representations on predictive performance, with insights into automating and improving pharmacovigilance.",
            tech:  ["AutoGluon", "RDKit", "Morgan FP", "Python", "Pharmacovigilance"],
            status: "Published · Toxicology Mechanisms and Methods · 2026",
            statusKind: "published"
        },
        {
            n: "05",
            label: "LLMs · Drug Delivery",
            title: "Large Language Models in Drug Delivery",
            desc:  "Review of LLM applications in pharmaceutical formulation and drug-delivery-system design. Evaluates existing LLM-powered tools like ChemCrow and BioBERT and contributes to discussions on integrating AI into experimental workflows and personalised medicine.",
            tech:  ["LLMs", "ChemCrow", "BioBERT", "Drug Delivery", "Review"],
            status: "Published · Journal of Pharmaceutical Sciences · 2025",
            statusKind: "published"
        },
        {
            n: "06",
            label: "ML Reliability · Oncology",
            title: "ML Predictions of Tumor Progression",
            desc:  "A methodological look at how reliable machine-learning predictions of tumor progression actually are — examining benchmarking rigour, dataset bias, and what \"reliable\" should mean in an oncology-ML setting.",
            tech:  ["Machine Learning", "Oncology", "Benchmarking", "Model Reliability"],
            status: "Published · Computers in Biology and Medicine · 2025",
            statusKind: "published"
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
