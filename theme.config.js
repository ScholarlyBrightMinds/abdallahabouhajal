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
        { label: "14 Publications · 94 Citations" },
        { label: "h-index 8" },
        { label: "5× Corresponding Author" },
        { label: "BindHack 1st Place · Insilico Medicine", variant: "gold" },
        { label: "MSc Pharm. Sci. · GPA 3.94" }
    ],

    // ── Per-page sub-hero lede text ──────────────────────────────
    ledes: {
        about:        "Researcher in AI-driven drug discovery, now working at the intersection of cheminformatics, AutoML, and large language models.",
        projects:     "Active work on AI agents and computational toxicology at the top, followed by published output. If any of these intersect with your work, I would love to collaborate.",
        publications: "Peer-reviewed papers on machine learning, cheminformatics and drug discovery.",
        blog:         "Research notes, PhD-hunt reflections, event write-ups, and the occasional rant about a paper.",
        talks:        "Hackathon wins, conference talks, poster sessions, and the three-minute thesis. Slides and posters are linked where I have them.",
        contact:      "The fastest way to reach me. Below the form there is a short note for PhD supervisors and another for potential collaborators.",
        research:     "The longer version of the work I do, the questions I want to answer, and where I would like to take this next. Written with PhD supervisors in mind."
    },


    // ── "By the numbers" impact tiles (home page) ────────────────
    // Each tile is one number + label + sub-line; first tile auto-updates
    // via build_html.py from the weekly SerpApi pull (see numLiveSource).
    impactStats: [
        { num: "14",  label: "Publications",     sub: "peer-reviewed",                      numLiveSource: "total_documents" },
        { num: "94", label: "Citations",        sub: "across all work",                    numLiveSource: "total_citations" },
        { num: "5×",  label: "Corresponding",    sub: "first or corresponding author" },
        { num: "1st", label: "BindHack",         sub: "First place · Insilico Medicine 2025", variant: "gold" },
        { num: "1",   label: "Live ML tool",     sub: "BAD Molecule Filter web server" }
    ],

    // ── About page: research narrative ───────────────────────────
    about: {
        paragraphs: [
            "<strong>MSc Pharmaceutical Sciences</strong>, Al Ain University, GPA 3.94, on a postgraduate scholarship that came with research and lab assistant duties and undergraduate lab teaching. My thesis built a machine learning tool for predicting promiscuous aggregate-based inhibitors, supervised by Prof. Mohammad Ghattas and Prof. Boulbaba Ben Amor. It was published first author in the <em>Journal of Chemical Information and Modeling</em> and runs as a public web server.",
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

        // Three research-pillar cards
        pillars: [
            { icon: "molecule",  title: "Cheminformatics",           desc: "Molecular standardization, fingerprinting (Morgan / Mordred), applicability domain analysis, featurewiz selection." },
            { icon: "network",   title: "Machine Learning &amp; AutoML", desc: "LightGBM / CatBoost / XGBoost ensembles, AutoGluon stacked models, Chemprop GNNs, consensus voting." },
            { icon: "document",  title: "LLMs for Science",          desc: "Benchmarking reasoning vs non-reasoning LLMs for molecular property prediction against GNN &amp; fingerprint baselines." }
        ],

        // Awards section
        awards: [
            { icon: "🥇", title: "First Place, BindHack Hackathon",         venue: "Insilico Medicine, Masdar City · 2025, antibody-antigen binding prediction in a 6-hour AI/drug discovery competition" },
            { icon: "🥈", title: "Three Minute Thesis, Second Place",      venue: "2nd AAU Health &amp; Biomedical Postgraduate Symposium · 2024" },
            { icon: "🥇", title: "Best Quality Poster, First Place",       venue: "1st International Conference on Pharmacy &amp; Biomedical Sciences, Al Ain University · 2023" },
            { icon: "🎓", title: "MSc Pharmaceutical Sciences · GPA 3.94",  venue: "Graduated with Excellent · Al Ain University, 2023" },
            { icon: "🎖️", title: "Postgraduate Scholarship",                venue: "Awarded for MSc research and lab-assistant duties · 2021 to 2023" },
            { icon: "🏅", title: "Honor Student · 2017/2018",               venue: "Bachelor of Pharmacy · Al Ain University" }
        ]
    },

    // ── Projects (Ongoing Research) ──────────────────────────────
    // statusKind: 'active' | 'review' | 'published' | 'draft'
    // A "Want to collaborate?" button is added to every card automatically.
    projects: [
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
            n: "04",
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
            n: "05",
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
            n: "06",
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
            n: "07",
            label: "MSc Thesis · JCIM",
            title: "BAD Molecule Filter",
            desc: "My MSc work. A model that flags molecules that look like real hits in a drug screen but are actually clumping together and causing false positives. It runs as a free public web server.",
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
            file: "blog-post-11.html",
            title: "Learning in Public",
            date: "Sep 12, 2026",
            tag: "Research",
            cover: "git",
            readingTime: "4 min read",
            excerpt: "Sharing work before it is finished feels risky. But the people who do it consistently seem to grow faster than everyone who waited until it was ready."
        },
        {
            file: "blog-post-10.html",
            title: "Saying I Do Not Know",
            date: "Aug 8, 2026",
            tag: "Culture",
            cover: "culture",
            readingTime: "4 min read",
            excerpt: "The fastest way to lose a room full of experts is to bluff. Admitting the gap out loud is not a weakness. It is how trust actually gets built."
        },
        {
            file: "blog-post-9.html",
            title: "Mentoring Is Not Advice",
            date: "Jun 6, 2026",
            tag: "Leadership",
            cover: "git",
            readingTime: "4 min read",
            excerpt: "The best mentors I have had did not solve my problems. They asked me questions I could not stop thinking about."
        },
        {
            file: "blog-post-8.html",
            title: "Feedback That Actually Lands",
            date: "May 30, 2026",
            tag: "Leadership",
            cover: "git",
            readingTime: "4 min read",
            excerpt: "Vague praise and vague criticism are both useless. Here is what specific, kind, and timely feedback looks like when you get it right."
        },
        {
            file: "blog-post-7.html",
            title: "The First 30 Days on a New Team",
            date: "May 24, 2026",
            tag: "Leadership",
            cover: "git",
            readingTime: "4 min read",
            excerpt: "The instinct on a new team is to prove you belong. Why small reliability beats big impressive fixes, and what the people already there owe the new person."
        },
        {
            file: "blog-post-6.html",
            title: "The Office Needs More Fun",
            date: "May 24, 2026",
            tag: "Culture",
            cover: "culture",
            readingTime: "3 min read",
            excerpt: "Why the quiet office is usually the anxious one, and why fun is not the opposite of work but the thing that makes work last."
        },
        {
            file: "blog-post-5.html",
            title: "PhD Hunting: Hard, Exhausting, and Worth It",
            date: "Apr 11, 2026",
            tag: "Personal",
            cover: "phd",
            readingTime: "6 min read",
            excerpt: "What three months of cold-emailing professors has taught me about applying to PhD programs from outside the usual feeder universities."
        },
        {
            file: "blog-post-4.html",
            title: "GitHub in Drug Discovery",
            date: "Dec 14, 2025",
            tag: "Research",
            cover: "git",
            readingTime: "8 min read",
            excerpt: "Why a pharma chemist should learn git. A short tour of what version control actually buys you when your science lives in Jupyter notebooks."
        },
        {
            file: "blog-post-3.html",
            title: "Hackathon @ Insilico Medicine",
            date: "Nov 11, 2025",
            tag: "Event",
            cover: "hack",
            readingTime: "5 min read",
            excerpt: "Six hours, a team of strangers, an antibody binding problem, and a 1st-place finish. Notes from the BindHack hackathon at Masdar City."
        },
        {
            file: "blog-post-2.html",
            title: "ChatGPT is Turning 3",
            date: "Oct 25, 2025",
            tag: "AI",
            cover: "ai",
            readingTime: "4 min read",
            excerpt: "Three years in: what large language models actually changed about how I write code, draft papers, and triage literature, and what they still cannot do."
        },
        {
            file: "blog-post-1.html",
            title: "Should You Go the Distance?",
            date: "Oct 20, 2025",
            tag: "Personal",
            cover: "distance",
            readingTime: "7 min read",
            excerpt: "Two years ago I almost stopped after the MSc. This is what I wish someone had told me about whether to push on or stop."
        }
    ],

    // ── Talks, posters, presentations ─────────────────────────────
    // Newest first. `kind`: 'hackathon' | 'poster' | 'talk' | 'workshop' | 'thesis'
    // `award` is a string when there is a prize; omit otherwise.
    talks: [
        {
            date: "Nov 2025",
            year: 2025,
            kind: "hackathon",
            title: "BindHack: Antibody-Antigen Binding Prediction",
            venue: "Insilico Medicine · Masdar City, Abu Dhabi",
            award: "1st place",
            desc:  "A six-hour competitive AI/drug discovery hackathon. Our team built a fast LLM-assisted scoring pipeline for predicting antibody-antigen binding affinity from sequence-only features, and finished first across all teams."
        },
        {
            date: "Mar 2024",
            year: 2024,
            kind: "thesis",
            title: "Three Minute Thesis: Boosting Colloidal-Aggregator Detection",
            venue: "2nd AAU Health & Biomedical Postgraduate Symposium · Al Ain University",
            award: "2nd place",
            desc:  "Three minutes, one slide, no jargon. Compressed the entire BAD Molecule Filter project (why aggregators ruin early drug screens, what we built, why it matters) into one talk for a non-specialist audience."
        },
        {
            date: "Apr 2023",
            year: 2023,
            kind: "poster",
            title: "BAD Molecule Filter: Poster Presentation",
            venue: "1st International Conference on Pharmacy & Biomedical Sciences · Al Ain University",
            award: "Best Quality Poster · 1st place",
            desc:  "Poster on the machine-learning ensemble behind the BAD Molecule Filter, awarded best-quality poster at the conference. Covered featurisation choice, applicability domain, and the public web-server deployment."
        },
        {
            date: "Apr 2023",
            year: 2023,
            kind: "thesis",
            title: "MSc Thesis Defence: A Machine-Learning Tool for Promiscuous Aggregate-Based Inhibitors",
            venue: "Al Ain University, College of Pharmacy",
            desc:  "Public defence under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI). Graduated with GPA 3.94. Thesis published first author in JCIM in 2024."
        }
    ],


    // ── Contact page (contact.html) ───────────────────────────────
    // formAction = a Formspree endpoint. Will need to be created at
    // formspree.io (free tier ok) before the form actually delivers mail.
    // Until then the page still works for direct email + CV download.
    contact: {
        h1Front:  "Let's",
        h1Accent: "talk",
        intro: "I read every email. Below the form there are short notes for PhD supervisors and potential collaborators, plus the direct ways to reach me.",
        formAction: "https://formspree.io/f/mqejpyjl",
        formNote: "Your message goes to my inbox directly. I reply within 48 hours.",
        directEmail: "abdallah.abouhajal@gmail.com",
        cvHref: "Abdallah-Abou-Hajal-CV.pdf",
        blocks: [
            {
                icon: "🎓",
                title: "PhD supervisors",
                body:  "Looking to start late 2026 or 2027. Interested in ML × drug discovery, LLM agents for chemistry, AI-augmented AOP networks, and ADMET / toxicity prediction. I will respond within 48 hours and can send the long-form research statement, CV, and a transcript on request."
            },
            {
                icon: "🤝",
                title: "Collaborators",
                body:  "Open to collaborations on cheminformatics, AutoML for pharmacology, LLMs for drug discovery, and open-science tooling. If you have a wet-lab problem that needs a quick ML proof-of-concept, I am genuinely interested. See <a href=\"research.html\">what I work on</a> for what is active."
            },
            {
                icon: "✉️",
                title: "Journalists & podcasts",
                body:  "Happy to talk about AI in drug discovery, the limits of LLMs on chemistry, and what it actually looks like to do computational pharma research from outside the usual UK / US / EU hubs. Reach out via the form or directly by email."
            }
        ],
        responseTimeNote: "Usually within 48 hours, faster on weekdays in Gulf Standard Time."
    },

    // ── Footer text ───────────────────────────────────────────────
    footer: {
        copyrightYear: 2026,
        tagline: "Part of the <a href=\"https://scholarlybrightminds.github.io/\">Scholarly Bright Minds</a> hub.",
        credits: "A fork of <a href=\"https://github.com/muhammedrashidx/ScholarSite_2.0\" target=\"_blank\" rel=\"noopener\">ScholarSite_2.0</a>."
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
