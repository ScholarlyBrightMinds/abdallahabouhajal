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
        long: "I completed my Bachelor's in Pharmacy, and somewhere during my MSc I fell into the world of AI and drug discovery and honestly never looked back. Now I spend my time writing Python scripts to automate things nobody asked me to automate. My MSc thesis tackled colloidal aggregators (molecules that look like promising hits but are actually just clumping and causing false positives) and we built a machine-learning tool to catch them early. It lives on a public web server. Still proud of that one."
    },

    // ── Quick-stat chips shown in hero ───────────────────────────
    // First 5 shown. `variant: 'gold'` uses amber color instead of accent.
    // Chips with hard-coded metrics are kept as fallback only. The build_html.py
    // step in the SerpApi workflow replaces the first chip with live numbers
    // (e.g., "14 Publications · 105 Citations") right before each commit, so
    // the static HTML that Google indexes always shows current stats.
    chips: [
        { label: "14 Publications · 110 Citations" },
        { label: "h-index 7" },
        { label: "4× Corresponding Author" },
        { label: "🥇 BindHack · Insilico Medicine", variant: "gold" },
        { label: "MSc Pharm. Sci. · GPA 3.94" }
    ],

    // ── Per-page sub-hero lede text ──────────────────────────────
    ledes: {
        about:        "Researcher in AI-driven drug discovery, now working at the intersection of cheminformatics, AutoML, and large language models.",
        projects:     "Active work on AI agents and computational toxicology at the top, followed by published output. If any of these intersect with your work, I would love to collaborate.",
        publications: "Peer-reviewed output across machine learning, cheminformatics, and drug discovery. Synced weekly from Google Scholar.",
        blog:         "Research notes, PhD-hunt reflections, event write-ups, and the occasional rant about a paper.",
        talks:        "Hackathon wins, conference talks, poster sessions, and the three-minute thesis. Slides and posters are linked where I have them.",
        contact:      "The fastest way to reach me. Below the form there is a short note for PhD supervisors and another for potential collaborators.",
        research:     "The longer version of the work I do, the questions I want to answer, and where I would like to take this next. Written with PhD supervisors in mind.",
        arc:          "The longer story of how I got from pharmacy to AI for drug discovery, told as a sequence of moments rather than a CV."
    },

    // ── Scrollytelling research arc (rendered on arc.html) ───────
    // Each chapter is a sticky-scroll step with a kicker + title + body,
    // an optional milestone card, and a frame ID that maps to the
    // sticky illustration that fades in while this chapter is in view.
    // Frame IDs ship with stock SVGs in arc.html (origin | sieve |
    // editorial | network | horizon). Adding a new frame requires
    // adding a matching <div class="arc-frame" data-frame="..."> in
    // arc.html.
    arc: {
        kicker: "Research arc",
        h1Front: "The long way around to",
        h1Accent: "AI for drug discovery",
        intro: "The research statement is the short version. This page is the long way around. Five chapters, in order, told as a sequence of moments rather than a CV. Scroll at your own pace.",
        chapters: [
            {
                key: "origin",
                frame: "origin",
                kicker: "Chapter 1 · 2016 to 2021",
                title: "Pharmacy, with one question I could not let go of.",
                body: [
                    "I did my BSc in Pharmacy at Al Ain University and graduated as an honor student in 2018. Most of pharmacy is downstream of where I find the interesting questions. The five years made me very comfortable around drugs as objects, around the language of chemistry and pharmacology, around clinical thinking. But the question that kept following me was a step upstream.",
                    "Why does most of what shows up in a high-throughput screen turn out to be noise? Why are the molecules that look most promising in an assay the ones that most often fail downstream? That question is what eventually pulled me into computational drug discovery."
                ],
                milestone: {
                    label: "Honor Student",
                    sub: "BSc Pharmacy, Al Ain University, 2017 to 2018"
                }
            },
            {
                key: "msc",
                frame: "sieve",
                kicker: "Chapter 2 · 2021 to 2024",
                title: "An MSc, a thesis, and the BAD Molecule Filter.",
                body: [
                    "I started a postgraduate scholarship at Al Ain University in 2021, co-supervised by Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI and computer science). The brief was clear. Build something that helps a screening lab spend its time on real hits instead of false positives.",
                    "We trained an ensemble that flags small molecules that look like genuine bioactives but are actually colloidal aggregators. The result was published first-author in the Journal of Chemical Information and Modeling in 2024, and the model is deployed as a public web server so any group can pre-screen their compounds for free.",
                    "That paper is also when I learned what I actually like doing. Not just running models. Building the thing that other people use."
                ],
                milestone: {
                    label: "MSc GPA 3.94 · JCIM 2024",
                    sub: "BAD Molecule Filter for colloidal aggregator detection",
                    href: "https://doi.org/10.1021/acs.jcim.4c00363"
                }
            },
            {
                key: "editorial",
                frame: "editorial",
                kicker: "Chapter 3 · 2023 to 2025",
                title: "Two years inside scientific publishing.",
                body: [
                    "From early 2023 to mid-2025 I was Managing Editor at Scifiniti Publishing, an STM publisher in Abu Dhabi. The job is exactly what it sounds like. Peer-review coordination, journal-performance analytics, editorial operations across multiple STEM titles. Quietly, the most useful experience of my career so far.",
                    "Seeing the publishing pipeline from the editor's side reset my sense of what reproducibility, peer review, and the word novel actually mean as operational categories. Sitting in that seat for two years is also what made me sympathetic to open-science arguments that earlier in my training I had only read about.",
                    "Since mid-2025 I have stayed at Scifiniti as Data Analyst and AI Automation Lead, building LLM-backed tooling that touches the editorial workflow."
                ],
                milestone: {
                    label: "Scifiniti Publishing",
                    sub: "Managing Editor then Data Analyst and AI Automation Lead"
                }
            },
            {
                key: "now",
                frame: "network",
                kicker: "Chapter 4 · 2025 to 2026",
                title: "AI agents, AutoML, and a four-paper run.",
                body: [
                    "The last 18 months have been the most productive stretch of my research life so far. Four papers as corresponding author, on an AutoML framework for drug to drug interaction prediction, on large language models in drug delivery, on machine-learning reliability in tumour-progression prediction, and on GitHub's significance for AI-driven drug discovery.",
                    "I am now spending most of my research time on two parallel threads. Autonomous LLM-backed agents that plan, reason, and execute drug-discovery workflows. And AI-augmented Adverse Outcome Pathway networks that link molecular initiating events to adverse health outcomes through graph-based learning.",
                    "Both threads share the same instinct as the MSc. Build the thing the next researcher will actually use."
                ],
                milestone: {
                    label: "Four times corresponding author across 2025 to 2026",
                    sub: "AutoML DDI · LLMs in delivery · ML reliability · GitHub and open science"
                }
            },
            {
                key: "next",
                frame: "horizon",
                kicker: "Chapter 5 · The PhD",
                title: "What I want a PhD to look like.",
                body: [
                    "I am applying for PhD positions starting late 2026 or 2027, in groups working on machine learning for drug discovery, LLM-agent frameworks for chemistry, computational toxicology, or AI-augmented AOP networks. Strong methods groups everywhere are on the list.",
                    "The shape I am looking for. A supervisor with a clear technical direction. A problem where the data is hard enough to be interesting. Collaborators close enough to argue with daily. And the freedom to ship the things we build as public tools rather than just papers.",
                    "If any of that fits your group, the fastest way to start a conversation is to email me. I reply within 48 hours."
                ],
                milestone: {
                    label: "Open for PhD · 2026 or 2027 start",
                    sub: "ML × drug discovery · LLM agents · AOP networks",
                    href: "mailto:abdallah.abouhajal@gmail.com?subject=PhD%20position%20enquiry"
                }
            }
        ]
    },

    // ── PhD CTA block (rendered prominently on index hero) ───────
    // This is the #1 conversion goal of the site. Make it impossible to miss.
    phdCTA: {
        ribbon:  "Open for PhD",
        title:   "Looking for a PhD position · ML × Drug Discovery · 2026/27",
        body:    "I am actively applying for PhD opportunities in machine learning and AI for drug discovery, ideally starting late 2026 or 2027. Open to strong groups worldwide. If your work touches virtual screening, cheminformatics, LLM agents for chemistry, or AI-augmented computational toxicology, I would love to hear from you.",
        primaryLabel: "Email me",
        primaryHref:  "mailto:abdallah.abouhajal@gmail.com?subject=PhD%20position%20enquiry&body=Hi%20Abdallah%2C%0A%0AI%20saw%20your%20website%20and%20wanted%20to%20discuss%20a%20PhD%20opportunity%20in%20our%20group.%0A%0A",
        secondaryLabel: "Read my research statement",
        secondaryHref:  "research.html",
        tertiaryLabel:  "Download CV",
        tertiaryHref:   "Abdallah-Abou-Hajal-CV.pdf"
    },

    // ── "By the numbers" impact tiles (home page) ────────────────
    // Each tile is one number + label + sub-line; first tile auto-updates
    // via build_html.py from the weekly SerpApi pull (see numLiveSource).
    impactStats: [
        { num: "14",  label: "Publications",     sub: "peer-reviewed",                      numLiveSource: "total_documents" },
        { num: "110", label: "Citations",        sub: "across all work",                    numLiveSource: "total_citations" },
        { num: "4×",  label: "Corresponding",    sub: "first or corresponding author" },
        { num: "🥇",  label: "BindHack",         sub: "1st place · Insilico Medicine 2025", variant: "gold" },
        { num: "1",   label: "Live ML tool",     sub: "BAD Molecule Filter web server" }
    ],

    // ── About page: research narrative ───────────────────────────
    about: {
        paragraphs: [
            "I hold an <strong>MSc in Pharmaceutical Sciences</strong> from Al Ain University (GPA 3.94), working under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI &amp; computer science). My thesis developed a machine-learning tool for predicting promiscuous aggregate-based inhibitors, published first-author in the <em>Journal of Chemical Information and Modeling</em> and deployed as a public web server.",
            "I currently work as a <strong>Data Analyst at Scifiniti Publishing</strong> (since May 2025), after two years there as <strong>Managing Editor</strong> (Feb 2023 – May 2025). This editorial side-of-the-house gave me a rare, hands-on view of how science actually gets published: peer-review coordination, journal performance analytics, editorial operations across multiple STEM titles.",
            "In parallel I have kept publishing, with <strong>4 papers as corresponding author</strong>, most recently on an <em>AutoML framework for drug–drug interaction prediction</em>, on <em>large language models in drug delivery</em>, on <em>machine-learning reliability in tumor-progression prediction</em>, and on <em>GitHub's significance for AI-driven drug discovery</em>.",
            "I am <strong>now seeking a PhD opportunity</strong> to further apply machine learning and data-driven methods to impactful challenges in drug discovery: AI-driven virtual and high-throughput screening, predictive modeling, and model interpretability. If that aligns with your group, I would love to hear from you."
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
            { icon: "🥇", title: "First Place, BindHack Hackathon",         venue: "Insilico Medicine, Masdar City · 2025, antibody–antigen binding prediction in a 6-hour AI/drug discovery competition" },
            { icon: "🥈", title: "Three Minute Thesis, Second Place",      venue: "2nd AAU Health &amp; Biomedical Postgraduate Symposium · 2024" },
            { icon: "🥇", title: "Best Quality Poster, First Place",       venue: "1st International Conference on Pharmacy &amp; Biomedical Sciences, Al Ain University · 2023" },
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
            desc:  "Exploring autonomous AI agents that can plan, reason, and execute drug-discovery workflows end-to-end, from target identification through molecular generation to property prediction. Focus on LLM-backed agent frameworks that integrate specialised chemistry tools and orchestrate multi-step pipelines without constant human scaffolding.",
            tech:  ["LLM Agents", "Tool Use", "Drug Discovery", "Python", "AutoGen", "LangGraph"],
            status: "Active: data collection &amp; framework design",
            statusKind: "active",
            needs: "Looking for a collaborator with strong ML / LLM-agent experience or domain expertise in target discovery."
        },
        {
            n: "02",
            label: "Computational Toxicology · AOP",
            title: "AI-Augmented AOP Networks in Computational Toxicology",
            desc:  "Building AI-augmented Adverse Outcome Pathway (AOP) networks that link molecular initiating events to adverse health outcomes. The goal: use graph-based learning and LLM-assisted literature synthesis to automate AOP construction and identify critical pathway nodes for regulatory and screening use.",
            tech:  ["AOP Networks", "Graph ML", "Toxicology", "Literature Mining", "LLMs", "Python"],
            status: "Active: literature synthesis &amp; network prototyping",
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
            statusKind: "published",
            doi:   "10.1080/17460441.2026.2641511",
            venue: "Expert Opinion on Drug Discovery"
        },
        {
            n: "04",
            label: "AutoML · DDI Prediction",
            title: "Automating Drug–Drug Interaction Prediction",
            desc:  "Prediction of drug–drug interactions through Automated Machine Learning (AutoML) frameworks. Studies the effects of different molecular feature representations on predictive performance, with insights into automating and improving pharmacovigilance.",
            tech:  ["AutoGluon", "RDKit", "Morgan FP", "Python", "Pharmacovigilance"],
            status: "Published · Toxicology Mechanisms and Methods · 2026",
            statusKind: "published",
            doi:   "10.1080/15376516.2026.2628929",
            venue: "Toxicology Mechanisms and Methods"
        },
        {
            n: "05",
            label: "LLMs · Drug Delivery",
            title: "Large Language Models in Drug Delivery",
            desc:  "Review of LLM applications in pharmaceutical formulation and drug-delivery-system design. Evaluates existing LLM-powered tools like ChemCrow and BioBERT and contributes to discussions on integrating AI into experimental workflows and personalised medicine.",
            tech:  ["LLMs", "ChemCrow", "BioBERT", "Drug Delivery", "Review"],
            status: "Published · Journal of Pharmaceutical Sciences · 2025",
            statusKind: "published",
            doi:   "10.1016/j.xphs.2025.104147",
            venue: "Journal of Pharmaceutical Sciences"
        },
        {
            n: "06",
            label: "ML Reliability · Oncology",
            title: "ML Predictions of Tumor Progression",
            desc:  "A methodological look at how reliable machine-learning predictions of tumor progression actually are, examining benchmarking rigour, dataset bias, and what \"reliable\" should mean in an oncology-ML setting.",
            tech:  ["Machine Learning", "Oncology", "Benchmarking", "Model Reliability"],
            status: "Published · Computers in Biology and Medicine · 2025",
            statusKind: "published",
            doi:   "10.1016/j.compbiomed.2025.110156",
            venue: "Computers in Biology and Medicine"
        },
        {
            n: "07",
            label: "MSc Thesis · JCIM",
            title: "BAD Molecule Filter — Detection of Colloidal Aggregators",
            desc:  "My MSc work at Al Ain University. We trained a machine-learning ensemble that flags small molecules that <em>look</em> like real bioactive hits but are actually colloidal aggregators causing false positives in early-stage drug screening. Released as a public web server so any group can pre-screen their compounds for free.",
            tech:  ["Cheminformatics", "Mordred", "Morgan FP", "Ensemble ML", "Public Web Server", "RDKit"],
            status: "Published · J. Chem. Inf. Model. · 2024",
            statusKind: "published",
            doi:   "10.1021/acs.jcim.4c00363",
            venue: "Journal of Chemical Information and Modeling"
        }
    ],

    // ── Blog posts (listed newest first) ─────────────────────────
    // `cover` is a CSS gradient identifier — handled by .blog-cover--<key>
    // in blog.css so we never ship a single PNG for the index page. Each
    // post has a distinctive duotone for visual scannability.
    blog: [
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
            date: "Sep 2025",
            year: 2025,
            kind: "hackathon",
            title: "BindHack — Antibody–Antigen Binding Prediction",
            venue: "Insilico Medicine · Masdar City, Abu Dhabi",
            award: "1st place 🥇",
            desc:  "A six-hour competitive AI/drug discovery hackathon. Our team built a fast LLM-assisted scoring pipeline for predicting antibody–antigen binding affinity from sequence-only features, and finished first across all teams."
        },
        {
            date: "Mar 2024",
            year: 2024,
            kind: "thesis",
            title: "Three Minute Thesis — Boosting Colloidal-Aggregator Detection",
            venue: "2nd AAU Health & Biomedical Postgraduate Symposium · Al Ain University",
            award: "2nd place 🥈",
            desc:  "Three minutes, one slide, no jargon. Compressed the entire BAD Molecule Filter project — why aggregators ruin early drug screens, what we built, why it matters — into one talk for a non-specialist audience."
        },
        {
            date: "Apr 2023",
            year: 2023,
            kind: "poster",
            title: "BAD Molecule Filter — Poster Presentation",
            venue: "1st International Conference on Pharmacy & Biomedical Sciences · Al Ain University",
            award: "Best Quality Poster · 1st place 🥇",
            desc:  "Poster on the machine-learning ensemble behind the BAD Molecule Filter, awarded best-quality poster at the conference. Covered featurisation choice, applicability domain, and the public web-server deployment."
        },
        {
            date: "Apr 2023",
            year: 2023,
            kind: "thesis",
            title: "MSc Thesis Defence — A Machine-Learning Tool for Promiscuous Aggregate-Based Inhibitors",
            venue: "Al Ain University, College of Pharmacy",
            desc:  "Public defence under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI). Graduated with GPA 3.94. Thesis published first-author in JCIM later that year."
        }
    ],

    // ── Research statement / vision (research.html) ──────────────
    // Each block becomes its own card-style section. Keep the
    // narrative load-bearing — supervisors actually read this.
    research: {
        kicker: "Research statement",
        h1Front:  "Where I want to take",
        h1Accent: "this next",
        intro: "I want to spend the next stretch of my career making AI for early-stage drug discovery more reliable, more interpretable, and more usable for the wet-lab teams who depend on it. The papers below show how that focus formed; the section after them describes what a PhD with me would look like.",
        sections: [
            {
                kicker: "Origin",
                title: "From pharmacy bench to chemistry-aware ML",
                body: [
                    "I trained as a pharmacist — five years of medicinal chemistry, pharmacokinetics, formulation, and one very long Pharmacology Lab. Most of that time I assumed I would end up at a bench. The shift happened during my MSc at Al Ain University, when my supervisor Prof. <strong>Mohammad Ghattas</strong> handed me a stubborn problem: small molecules that look like real bioactive hits but turn out to be colloidal aggregators causing false positives in screening assays.",
                    "We tried hand-curated filters first. They worked, until they did not. Adding a second supervisor from AI — Prof. <strong>Boulbaba Ben Amor</strong> — turned the project into a machine-learning one. We trained an ensemble that combined Mordred descriptors with Morgan fingerprints, applied an applicability-domain check, and packaged the whole thing as a public web server. That project, published first-author in <em>JCIM</em>, taught me three things that still shape how I work."
                ]
            },
            {
                kicker: "What I learned",
                title: "Three lessons I will not give up",
                body: [
                    "<strong>1. Cheminformatics first, then ML.</strong> A model is only as good as the molecular representation underneath it. I spend more time on standardisation, tautomer handling, descriptor choice, and applicability domain than on hyperparameter search.",
                    "<strong>2. The best papers ship.</strong> A trained model that sits in a private notebook is not science. A web server, a CLI, a documented dataset — those are. Every project I lead now ends with something a stranger can use.",
                    "<strong>3. Honest evaluation matters more than headline accuracy.</strong> My review on <em>ML predictions of tumour progression</em> with Molham Sakkal exists because too many papers in our field benchmark on convenient splits and report numbers that do not survive contact with new chemistry. I am not going to be one of them."
                ]
            },
            {
                kicker: "Current focus",
                title: "Three threads I am pulling on now",
                body: [
                    "<strong>AI agents for drug discovery.</strong> LLM-backed agent frameworks that can plan, reason, and call specialised chemistry tools — RDKit, docking engines, free-energy estimators — without constant human scaffolding. I am benchmarking which agent topologies actually win on multi-step discovery tasks vs. which ones just hide their failures.",
                    "<strong>AI-augmented Adverse Outcome Pathway networks.</strong> AOPs are the regulator's mental model for how a molecular event becomes a toxic outcome. They are also painfully manual to build. I want to combine literature-mining LLMs with graph ML to assemble AOP networks at scale, and identify the choke-point nodes that matter most for regulatory toxicology.",
                    "<strong>LLMs vs. fingerprints, on chemistry.</strong> The honest question: do reasoning LLMs actually beat a well-tuned GNN or a Morgan-fingerprint ensemble on molecular property prediction? My hunch from preliminary work is that they do not yet, and the interesting research is figuring out why and what to fix."
                ]
            },
            {
                kicker: "PhD vision",
                title: "What a PhD with me would look like",
                body: [
                    "I am looking for a PhD starting late 2026 or 2027 in a group working on <em>any</em> of: AI-driven virtual or high-throughput screening, predictive ADMET / toxicity modelling, LLM agents for chemistry, computational toxicology, or model interpretability for drug discovery.",
                    "The shape I want is: 3–4 first-author publications, at least one of which is a tool other groups end up using; deep technical chops in either GNN-based property prediction, agent-based pipelines, or AOP-style mechanistic modelling; and at least one external collaboration with a wet-lab team so the work is grounded.",
                    "What I bring to a PhD group: a published first-author paper in <em>JCIM</em>, four corresponding-author papers, three years of journal-operations experience that taught me how publishing actually works, and a strong appetite for the engineering side of research. I write Python that other people can read, I document, and I ship."
                ]
            },
            {
                kicker: "If we should talk",
                title: "Reasons to email me",
                body: [
                    "If you supervise a group that works on any of the threads above, or if you are doing methods work I have cited in <em>JCIM</em>, <em>Expert Opinion on Drug Discovery</em>, <em>Computers in Biology and Medicine</em>, or <em>Journal of Pharmaceutical Sciences</em>, I would like to hear from you. Even a 20-minute Zoom about whether we would be a fit is worth it.",
                    "I am also happy to be told my framing is off. PhD applicants who already know exactly what they will work on are usually wrong. I have a direction and a habit of working hard; the right group will sharpen the rest."
                ]
            }
        ],
        finalCTAText: "Email Abdallah →",
        finalCTAHref: "mailto:abdallah.abouhajal@gmail.com?subject=PhD%20position%20enquiry&body=Hi%20Abdallah%2C%0A%0AI%20saw%20your%20research%20statement%20and%20wanted%20to%20discuss%20a%20PhD%20opportunity%20in%20our%20group.%0A%0A"
    },

    // ── Contact page (contact.html) ───────────────────────────────
    // formAction = a Formspree endpoint. Will need to be created at
    // formspree.io (free tier ok) before the form actually delivers mail.
    // Until then the page still works for direct email + CV download.
    contact: {
        kicker: "Get in touch",
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
                body:  "Open to collaborations on cheminformatics, AutoML for pharmacology, LLMs for drug discovery, and open-science tooling. If you have a wet-lab problem that needs a quick ML proof-of-concept, I am genuinely interested. See the <a href=\"projects.html\">Ongoing Research</a> page for what is currently active."
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
