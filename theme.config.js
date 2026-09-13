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
        { label: "4× Corresponding Author" },
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


    // ── "By the numbers" impact tiles (home page) ────────────────
    // Each tile is one number + label + sub-line; first tile auto-updates
    // via build_html.py from the weekly SerpApi pull (see numLiveSource).
    impactStats: [
        { num: "14",  label: "Publications",     sub: "peer-reviewed",                      numLiveSource: "total_documents" },
        { num: "94", label: "Citations",        sub: "across all work",                    numLiveSource: "total_citations" },
        { num: "4×",  label: "Corresponding",    sub: "first or corresponding author" },
        { num: "1st", label: "BindHack",         sub: "First place · Insilico Medicine 2025", variant: "gold" },
        { num: "1",   label: "Live ML tool",     sub: "BAD Molecule Filter web server" }
    ],

    // ── About page: research narrative ───────────────────────────
    about: {
        paragraphs: [
            "I hold an <strong>MSc in Pharmaceutical Sciences</strong> from Al Ain University (GPA 3.94), working under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI &amp; computer science). My thesis developed a machine-learning tool for predicting promiscuous aggregate-based inhibitors, published first-author in the <em>Journal of Chemical Information and Modeling</em> and deployed as a public web server.",
            "I currently work as a <strong>Data Analyst at Scifiniti Publishing</strong> (since May 2025), after two years there as <strong>Managing Editor</strong> (Feb 2023 to May 2025). This editorial side-of-the-house gave me a rare, hands-on view of how science actually gets published: peer-review coordination, journal performance analytics, editorial operations across multiple STEM titles.",
            "In parallel I have kept publishing, with <strong>4 papers as corresponding author</strong>, most recently on an <em>AutoML framework for drug-drug interaction prediction</em>, on <em>large language models in drug delivery</em>, on <em>machine-learning reliability in tumor-progression prediction</em>, and on <em>GitHub's significance for AI-driven drug discovery</em>.",
            "I am <strong>now seeking a PhD opportunity</strong> to further apply machine learning and data-driven methods to impactful challenges in drug discovery: AI-driven virtual and high-throughput screening, predictive modeling, and model interpretability. If that aligns with your group, I would love to hear from you."
        ],

        // Vertical timeline on About page
        timeline: [
            { date: "2016 to 2021",                  title: "BSc in Pharmacy",                  desc: "Al Ain University · GPA 3.83 · Honor Student 2017/2018." },
            { date: "Sep 2021 to Feb 2023",          title: "MSc &amp; Research / Lab Assistant", desc: "Postgraduate scholarship; undergrad lab sessions; drug-discovery research." },
            { date: "Apr 2023 · Graduation",         title: "MSc Pharmaceutical Sciences",      desc: "GPA 3.94 · Thesis supervised by Prof. Ghattas &amp; Prof. Ben Amor." },
            { date: "Feb 2023 to May 2025",          title: "Managing Editor · Scifiniti",      desc: "Editorial operations across multiple STEM journals." },
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
            date: "Sep 2025",
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
            desc:  "Public defence under Prof. Mohammad Ghattas (medicinal chemistry) and Prof. Boulbaba Ben Amor (AI). Graduated with GPA 3.94. Thesis published first-author in JCIM later that year."
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
                body:  "Open to collaborations on cheminformatics, AutoML for pharmacology, LLMs for drug discovery, and open-science tooling. If you have a wet-lab problem that needs a quick ML proof-of-concept, I am genuinely interested. See the <a href=\"research.html#projects\">current projects</a> for what is active."
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
