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
        tagline:   "AI Automation Lead &amp; researcher. LLM-based agents for academic publishing; ML pipelines and cheminformatics for drug discovery.",
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
        name: "cobalt",
        // One palette. The site is light only: no dark mode, no toggle.
        colors: {
            bg:          "#f6f7fb",
            bgSoft:      "#eef1f8",
            bgDeep:      "#e4e9f3",
            card:        "#ffffff",
            cardSoft:    "#fafbfe",
            text:        "#121a2c",
            textSoft:    "#414d66",
            muted:       "#6d7990",
            border:      "#dde3ee",
            borderS:     "#e8ecf5",
            accent:      "#1e56c8",      /* cobalt: deep */
            accentD:     "#17439f",
            accentBg:    "#e8eefb",
            accentGlow:  "rgba(30,86,200,0.16)",
            amber:       "#8f6a2b",
            amberBg:     "#f6efdf",
            amberGlow:   "rgba(143,106,43,0.15)"
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
        long: "I completed my Bachelor's in Pharmacy, and somewhere during my MSc I fell into the world of AI and drug discovery and honestly never looked back. Now I spend my time writing Python scripts to automate things nobody asked me to automate. My MSc thesis tackled colloidal aggregators (molecules that look like promising hits but are actually just clumping and causing false positives) and we built a machine-learning tool to catch them early. It lives on a public web server. Still proud of that one."
    },

    // ── Quick-stat chips shown in hero ───────────────────────────
    // First 5 shown. `variant: 'gold'` uses amber color instead of accent.
    // Chips with hard-coded metrics are kept as fallback only. The build_html.py
    // step in the SerpApi workflow replaces the first chip with live numbers
    // (e.g., "14 Publications · 105 Citations") right before each commit, so
    // the static HTML that Google indexes always shows current stats.
    chips: [
        { label: "15 Publications · 127 Citations" },
        { label: "h-index 8" },
        { label: "5× Corresponding Author" },
        { label: "BindHack 1st Place · Insilico Medicine", variant: "gold" },
        { label: "MSc Pharm. Sci. · GPA 3.94" }
    ],

    // ── Per-page sub-hero lede text ──────────────────────────────
    ledes: {
        about:        "MSc Pharmaceutical Sciences, Al Ain University. Data Analyst and AI Automation Lead at Scifiniti Publishing in Abu Dhabi. Machine learning and language models for drug discovery.",
        publications: "Peer-reviewed papers on machine learning, cheminformatics and drug discovery.",
        blog:         "A hackathon, reading other people's code, and the PhD search.",
        contact:      "Use the form, or email me directly.",
        research:     "Machine learning and language models for drug discovery and toxicology."
    },


    // ── "By the numbers" impact tiles (home page) ────────────────
    // Each tile is one number + label + sub-line; first tile auto-updates
    // via build_html.py from the weekly SerpApi pull (see numLiveSource).
    impactStats: [
        { num: "15",  label: "Publications",     sub: "peer-reviewed",                      numLiveSource: "total_documents" },
        { num: "127", label: "Citations",        sub: "across all work",                    numLiveSource: "total_citations" },
        { num: "5×",  label: "Corresponding",    sub: "first or corresponding author" },
        { num: "1st", label: "BindHack",         sub: "First place · Insilico Medicine 2025", variant: "gold" },
        { num: "1",   label: "Open ML tool",     sub: "BAD Molecule Filter, free to download" }
    ],

    // ── About page: research narrative ───────────────────────────
    about: {
        paragraphs: [
            "<strong>MSc Pharmaceutical Sciences</strong>, Al Ain University, GPA 3.94, on a postgraduate scholarship that came with research and lab assistant duties and undergraduate lab teaching. My thesis built a machine learning tool for predicting promiscuous aggregate-based inhibitors, supervised by Prof. Mohammad Ghattas and Prof. Boulbaba Ben Amor. It was published first author in the <em>Journal of Chemical Information and Modeling</em>, and the tool is free to download as the <a href='bad-molecule-filter.html'>BAD Molecule Filter</a>.",
            "Since February 2023 I have been at <strong>Scifiniti Publishing</strong>, first as Managing Editor across 5+ STEM journals, and since May 2025 as Data Analyst and AI Automation Lead: LLM agents for editorial workflows, Python tooling, journal performance dashboards. Two years of running peer review is the best view of how science actually gets published that I could have asked for.",
            "Fourteen papers so far, five as corresponding author. The recent ones: an <em>AutoML framework for drug-drug interaction prediction</em>, <em>large language models in drug delivery</em>, <em>machine learning reliability in tumor-progression prediction</em>, <em>GitHub for AI-driven drug discovery</em>, and <em>computational approaches to adverse outcome pathway networks</em>.",
            "I am <strong>looking for a PhD</strong> in machine learning for drug discovery: virtual and high-throughput screening, predictive modeling, model interpretability. If that fits your group, email me."
        ],

        // Vertical timeline on About page
        timeline: [
            { date: "2016 to 2021",                  title: "BSc in Pharmacy",                  desc: "Al Ain University · GPA 3.83 · Honor Student 2017/2018." },
            { date: "Sep 2021 to Feb 2023",          title: "MSc &amp; Research / Lab Assistant", desc: "Postgraduate scholarship; undergrad lab sessions; drug-discovery research." },
            { date: "Apr 2023 · Graduation",         title: "MSc Pharmaceutical Sciences",      desc: "GPA 3.94 · Thesis supervised by Prof. Ghattas &amp; Prof. Ben Amor." },
            { date: "Feb 2023 to May 2025",          title: "Managing Editor · Scifiniti",      desc: "Editorial operations across multiple STEM journals." },
            { date: "2024 · JCIM",                   title: "First-author publication",         desc: "Boosting accuracy of colloidal-aggregator detection." },
            { date: "Since May 2025",                title: "Data Analyst and AI Automation Lead · Scifiniti", desc: "LLM agents for editorial workflows, Python tooling, journal dashboards.", state: "current" },
            { date: "2026 · Active research",        title: "AI agents &amp; AOP-driven toxicology", desc: "AI-augmented adverse-outcome pathway networks; agent-based drug discovery.", state: "current" },
            { date: "Next · PhD Search",             title: "Actively seeking a position",      desc: "ML × cheminformatics × drug discovery. Open to strong groups worldwide.", state: "future" }
        ],

        // Awards section, plain list on about.html
        awards: [
            { title: "First place, BindHack",             venue: "Insilico Medicine, Masdar City, 2025" },
            { title: "Three Minute Thesis, second place", venue: "2nd AAU Health and Biomedical Postgraduate Symposium, 2024" },
            { title: "Best Quality Poster, first place",  venue: "1st International Conference on Pharmacy and Biomedical Sciences, Al Ain University, 2023" }
        ]
    },

    // ── Projects (Ongoing Research) ──────────────────────────────
    // statusKind is the status field research.html groups by:
    //   'review'    renders under "Under review", meta line comes from `status`
    //   'published' renders under "Published", title links to the DOI
    //   'active'    renders under "Now", with the `needs` line
    projects: [
        {
            n: "R1",
            label: "Chemical Language Models · Review",
            title: "Chemical Language Models for Early-Stage Drug Discovery: Applications, Pitfalls, and Future Directions",
            desc: "A review of what chemical language models are used for in early drug discovery and where they break down.",
            tech:  ["Chemical Language Models", "Drug Discovery", "Review"],
            status: "Under review · Journal of Computer-Aided Molecular Design",
            statusKind: "review",
            venue: "Journal of Computer-Aided Molecular Design"
        },
        {
            n: "R2",
            label: "Assay Interference · Review",
            title: "Computational Flagging of Assay Interference in Drug Discovery: A Review of Rule-Based, Machine Learning, Graph Neural Networks, and Chemical Language Models",
            desc: "A review of the methods used to flag assay interference compounds, from substructure rules through to graph neural networks and chemical language models.",
            tech:  ["Assay Interference", "Machine Learning", "Graph Neural Networks", "Review"],
            status: "Submitted · European Journal of Medicinal Chemistry",
            statusKind: "review",
            venue: "Journal of Chemical Information and Modeling"
        },
        {
            n: "01",
            label: "AI Agents · Drug Discovery",
            title: "AI agents for drug discovery",
            desc: "Language model agents that plan a drug discovery task and call real chemistry tools to carry it out, without a person steering every step.",
            tech:  ["LLM Agents", "Tool Use", "Drug Discovery", "Python", "AutoGen", "LangGraph"],
            status: "Active: data collection &amp; framework design",
            statusKind: "active",
            needs: "A collaborator who builds LLM agents, or who knows target discovery."
        },
        {
            n: "02",
            label: "Computational Toxicology · AOP",
            title: "AI for adverse outcome pathways",
            desc: "Using graph learning and language models to build Adverse Outcome Pathway networks, the maps that link a molecular event to a toxic effect.",
            tech:  ["AOP Networks", "Graph ML", "Toxicology", "Literature Mining", "LLMs", "Python"],
            status: "Active: literature synthesis &amp; network prototyping",
            statusKind: "active",
            needs: "Toxicologists, graph ML researchers, or teams doing regulatory toxicology."
        },
        {
            n: "03",
            label: "Toxicology · AOP Networks",
            title: "Computational approaches to adverse outcome pathway networks",
            desc: "A review of how adverse outcome pathway networks are built, quantified and used to support regulatory decisions.",
            tech:  ["AOP Networks", "Toxicology", "Regulatory Science", "Review"],
            status: "Published · Computational Toxicology · 2026",
            statusKind: "published",
            doi:   "10.1016/j.comtox.2026.100429",
            venue: "Computational Toxicology"
        },
        {
            n: "04",
            label: "Open Science · Review",
            title: "GitHub in AI-driven drug discovery",
            desc: "How sharing code on GitHub makes AI drug discovery research easier to check and reproduce.",
            tech:  ["Open Science", "GitHub", "Reproducibility", "AI", "Drug Discovery"],
            status: "Published · Expert Opinion on Drug Discovery · 2026",
            statusKind: "published",
            doi:   "10.1080/17460441.2026.2641511",
            venue: "Expert Opinion on Drug Discovery"
        },
        {
            n: "05",
            label: "AutoML · DDI Prediction",
            title: "Predicting drug-drug interactions with AutoML",
            desc: "Automated machine learning for drug-drug interactions, and how the way a molecule is represented changes the result.",
            tech:  ["AutoGluon", "RDKit", "Morgan FP", "Python", "Pharmacovigilance"],
            status: "Published · Toxicology Mechanisms and Methods · 2026",
            statusKind: "published",
            doi:   "10.1080/15376516.2026.2628929",
            venue: "Toxicology Mechanisms and Methods"
        },
        {
            n: "06",
            label: "LLMs · Drug Delivery",
            title: "Language models in drug delivery",
            desc: "A review of language model tools, such as ChemCrow and BioBERT, for formulation and drug delivery design.",
            tech:  ["LLMs", "ChemCrow", "BioBERT", "Drug Delivery", "Review"],
            status: "Published · Journal of Pharmaceutical Sciences · 2025",
            statusKind: "published",
            doi:   "10.1016/j.xphs.2025.104147",
            venue: "Journal of Pharmaceutical Sciences"
        },
        {
            n: "07",
            label: "ML Reliability · Oncology",
            title: "How reliable are ML predictions of tumor progression?",
            desc: "A close look at how machine learning models of tumor progression are benchmarked, where dataset bias creeps in, and what reliable should mean.",
            tech:  ["Machine Learning", "Oncology", "Benchmarking", "Model Reliability"],
            status: "Published · Computers in Biology and Medicine · 2025",
            statusKind: "published",
            doi:   "10.1016/j.compbiomed.2025.110156",
            venue: "Computers in Biology and Medicine"
        },
        {
            n: "08",
            label: "MSc Thesis · JCIM",
            title: "BAD Molecule Filter",
            desc: "My MSc work. A model that flags molecules that look like real hits in a drug screen but are actually clumping together and causing false positives. It is free to download: <a href='bad-molecule-filter.html'>how to run and cite it</a>.",
            tech:  ["Cheminformatics", "Mordred", "Morgan FP", "Ensemble ML", "Public Web Server", "RDKit"],
            status: "Published · J. Chem. Inf. Model. · 2024",
            statusKind: "published",
            doi:   "10.1021/acs.jcim.4c00363",
            venue: "Journal of Chemical Information and Modeling"
        }
    ],

    // ── Blog posts (listed newest first) ─────────────────────────
    // `cover` is a CSS gradient identifier, handled by .blog-cover--<key>
    // in blog.css so we never ship a single PNG for the index page. Each
    // post has a distinctive duotone for visual scannability.
    blog: [
        {
            file: "blog-post-5.html",
            title: "The emails that get no reply",
            date: "Apr 11, 2026",
            tag: "Personal",
            cover: "phd",
            readingTime: "2 min read",
            excerpt: "Why an email that goes unanswered is harder to deal with than a rejection, written from the middle of a PhD search."
        },
        {
            file: "blog-post-4.html",
            title: "Reading a drug discovery repo before you trust it",
            date: "Dec 14, 2025",
            tag: "Research",
            cover: "git",
            readingTime: "3 min read",
            excerpt: "What our Expert Opinion on Drug Discovery report found about GitHub use in drug discovery, and the checks I run on a repository before I rely on it."
        },
        {
            file: "blog-post-3.html",
            title: "Six hours to predict antibody binding",
            date: "Nov 11, 2025",
            tag: "Event",
            cover: "hack",
            readingTime: "2 min read",
            excerpt: "Notes from BindHack at Insilico Medicine in Masdar City: six hours to predict antibody antigen binding, five teammates, and a first place finish."
        }
    ],

    // ── Contact page (contact.html) ───────────────────────────────
    // formAction = a Formspree endpoint. Will need to be created at
    // formspree.io (free tier ok) before the form actually delivers mail.
    // Until then the page still works for direct email + CV download.
    contact: {
        h1Front:  "Let's",
        h1Accent: "talk",
        formAction: "https://formspree.io/f/mqejpyjl",
        formNote: "Your message goes to my inbox directly. I reply within 48 hours.",
        directEmail: "abdallah.abouhajal@gmail.com",
        cvHref: "Abdallah-Abou-Hajal-CV.pdf",
        responseTimeNote: "Usually within 48 hours, faster on weekdays in Gulf Standard Time."
    },

    // ── Footer text ───────────────────────────────────────────────
    footer: {
        copyrightYear: 2026,
        tagline: "Part of the <a href=\"https://scholarlybrightminds.github.io/\">Scholarly Bright Minds</a> hub."
    }
};

// ═══════════════════════════════════════════════════════════════════
//  APPLY PALETTE TO CSS VARIABLES (runs on every page, before render)
// ═══════════════════════════════════════════════════════════════════
(function applyPalette() {
    const root = document.documentElement;
    Object.entries(window.SITE_CONFIG.palette.colors).forEach(([k, v]) => {
        // camelCase -> kebab-case; "bgSoft" becomes "--bg-soft"
        root.style.setProperty('--' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), v);
    });
})();
