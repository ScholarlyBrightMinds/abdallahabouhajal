👋 Hi, I'm Abdallah — and yes, this is my entire academic life in a GitHub repo
MSc Pharmaceutical Sciences | AI × Drug Discovery | Data Analyst @ Scifiniti Publishing  
📍 Abu Dhabi, UAE  |  📧 abdallah.abouhajal@gmail.com
![Website](https://img.shields.io/badge/Website-Live-black?style=flat-square&logo=github)
![Google Scholar](https://img.shields.io/badge/Google%20Scholar-Profile-4285F4?style=flat-square&logo=google-scholar&logoColor=white)
![Scopus](https://img.shields.io/badge/Scopus-Profile-E9711C?style=flat-square)
![ORCID](https://img.shields.io/badge/ORCID-0009--0006--1807--2178-A6CE39?style=flat-square&logo=orcid&logoColor=white)
---
What even is this repo?
My personal academic website, hosted on GitHub Pages for free (shoutout to whoever invented that).  
It auto-updates my publications and citation metrics every week via GitHub Actions — no manual copy-pasting, no embarrassing outdated CVs, no "I'll update it later" lying to myself.
Built on top of ScholarSite 2.0 by @muhammedrashidx — heavily modified to fit my setup.
---
About me (the non-boring version)
I started as a pharmacist, pivoted into AI/drug discovery during my MSc, and somehow ended up writing Python scripts to automate things nobody asked me to automate. That's just how I am.
My MSc thesis was about predicting which drug-like molecules are actually just messy colloidal aggregators pretending to be hits — a sneaky little problem that wastes millions in early-stage drug discovery. We built a tool for that. It lives on a public web server now. Pretty cool.
After graduating, I spent two years as a Managing Editor at Scifiniti Publishing, which taught me more about how science actually gets published than any textbook ever could. Now I'm a Data Analyst there, automating workflows and analyzing journal performance data.
Also, I won a hackathon at Insilico Medicine in Masdar City in 2025. Just leaving that here.
What I'm actually good at:
Machine learning for drug discovery (QSAR, aggregation prediction, DDI)
Cheminformatics with RDKit
AutoML (AutoGluon specifically — it's underrated, use it)
Making GitHub Actions do things so I don't have to
Writing papers that people apparently cite (97 times and counting)
---
How the site works
```
You push a change
    → GitHub Pages deploys it instantly

Every week (Monday 05:00 UTC)
    → GitHub Actions runs serpapi_fetcher.py
    → Fetches all publications + citations from Google Scholar via SerpAPI
    → Saves to data/serpapi/serpapi.json + data/serpapi/metrics.json
    → Commits and pushes automatically
    → Website updates with real citation counts, h-index, everything
```
No database. No server. No monthly bill. Just JSON files and vibes.
---
Pages
Page	What's on it
Home	Who I am, links to everything
About	More detail about my background and experience
Ongoing Research	What I'm currently working on
Publications	All 14 papers, auto-rendered, live citation counts
Blog	When I have thoughts worth writing down
---
Key files
```
📁 repo root
├── index.html              # Home page
├── about.html              # About page
├── projects.html           # Ongoing Research
├── publications.html       # Publications page
├── blog.html               # Blog
│
├── serpapi_fetcher.py      # Fetches scholar data from SerpAPI
├── serpapi.v1.js           # Renders publications on the page
├── scopus_fetcher.py       # Scopus fallback fetcher (bonus)
├── scopus.v2.js            # Scopus renderer
│
├── data/
│   ├── serpapi/
│   │   ├── serpapi.json    # All publications (auto-updated weekly)
│   │   └── metrics.json    # Citations, h-index, doc count
│   └── scopus/
│       ├── scopus.json     # Scopus publications
│       └── metrics.json    # Scopus metrics
│
└── .github/workflows/
    ├── serpapi-monthly.yml # Weekly auto-update (Google Scholar)
    └── scopus-monthly.yml  # Monthly auto-update (Scopus)
```
---
Setup (if you want to fork this for yourself)
1. Fork the repo
2. Set your GitHub Secrets (`Settings → Secrets and variables → Actions`):
Secret	What it is
`SERPAPI_KEY`	Your API key from serpapi.com — free plan works
`SCHOLAR_AUTHOR_ID`	Your Google Scholar ID (the bit after `user=` in your profile URL)
`SCOPUS_API_KEY`	From dev.elsevier.com — optional, only if you use Scopus
`SCOPUS_AUTHOR_ID`	Your Scopus author ID — optional
3. Update `publications.html`  
Change `data-author-id` to your own Google Scholar ID.
4. Replace my content  
Edit the HTML files directly on GitHub. No local setup needed.
5. Enable GitHub Pages  
`Settings → Pages → Source: Deploy from branch → main → / (root)`
6. Trigger the workflow manually  
`Actions → Monthly SerpApi Scholar Update → Run workflow`
Your publications will populate within a minute. Done.
---
Research snapshot
> **14 publications · 97 citations · h-index 7** *(auto-updated weekly from Google Scholar)*
Topics I publish on: AI in drug discovery · Cheminformatics · Machine learning for toxicity prediction · Large language models in pharma · AutoML · Aggregation-based false positives
Selected highlights:
🏆 BAD Molecule Filter — JCIM 2024 — boosting detection of colloidal aggregators in drug screens
🤖 AutoML for DDI prediction — AutoGluon applied to drug-drug interaction prediction (2026)
📊 AI in drug discovery review — Journal of Medical Economics 2024 — 21 citations
---
Credits
Base template: ScholarSite 2.0 by @muhammedrashidx (MIT License)
Publication pipeline: built and maintained by me, with a lot of debugging and some help from Claude
---
If any of this is useful to you, feel free to fork it. If you find a bug, open an issue. If you want to collaborate on something, just email me.
