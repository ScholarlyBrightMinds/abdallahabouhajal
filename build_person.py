#!/usr/bin/env python3
"""build_person.py · one source for the Person markup on index and about.

The homepage and the About page each carry a full Schema.org Person for
Abdallah. They used to be typed by hand and had drifted apart (different
alternate names, different sameAs lists). This file holds the one true copy
and writes it into both pages between markers:

    index.html   <!-- PERSON-JSONLD:BEGIN --> ... <!-- PERSON-JSONLD:END -->
    about.html   <!-- ABOUTPAGE-JSONLD:BEGIN --> ... <!-- ABOUTPAGE-JSONLD:END -->

Every fact here must also be visible somewhere on the site (About shows the
degrees and awards), because search engines ignore markup that the page
does not back up. Identifiers were checked against their registries on
2026-09-24: ORCID (which lists Scopus 58094444100), OpenAlex (three
records, one person), Semantic Scholar, the AbdallahHajal GitHub account
(profile name Abdallah Abou Hajal, owner of the BAD Molecule Filter code),
ROR 023abrt21 and Wikidata Q4703454 for Al Ain University, and the Wikidata
ids in knowsAbout.

Run it after changing anything below, then commit both pages:

    python3 build_person.py

Nothing in the weekly bake calls it, and no weekly builder writes between
these markers.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent
SITE = "https://scholarlybrightminds.github.io/abdallahabouhajal"

AAU_ROR = "https://ror.org/023abrt21"

PERSON = {
    "@type": "Person",
    "@id": f"{SITE}/#person",
    "name": "Abdallah Abou Hajal",
    # Every spelling found on his papers and profiles, plus the Arabic form.
    # "A. A. Hajal" is how several citing papers and the Manchester record
    # print him (they read Abou as a middle name).
    "alternateName": [
        "Abdallah F. Abou Hajal",
        "Abdallah Abouhajal",
        "Abdalla Abou Hajal",
        "Abdallah Abu Hajal",
        "Abdallah F. Abu Hajal",
        "Abou Hajal A",
        "A. A. Hajal",
        "عبدالله أبو حجل",
    ],
    "givenName": "Abdallah",
    "familyName": "Abou Hajal",
    "additionalName": "F.",
    "jobTitle": "Data Analyst & AI Automation Lead",
    "worksFor": {
        "@type": "Organization",
        "name": "Scifiniti Publishing",
        "url": "https://scifiniti.com",
        "address": {"@type": "PostalAddress", "addressLocality": "Abu Dhabi",
                    "addressCountry": "AE"},
    },
    "memberOf": {
        "@type": "Organization",
        "@id": "https://scholarlybrightminds.github.io/#organization",
        "name": "Scholarly Bright Minds",
        "url": "https://scholarlybrightminds.github.io/",
    },
    "alumniOf": [{
        "@type": "CollegeOrUniversity",
        "@id": AAU_ROR,
        "name": "Al Ain University",
        "url": "https://aau.ac.ae",
        "department": "College of Pharmacy",
        "sameAs": [AAU_ROR, "https://www.wikidata.org/wiki/Q4703454"],
    }],
    "hasCredential": [
        {"@type": "EducationalOccupationalCredential",
         "name": "MSc Pharmaceutical Sciences",
         "credentialCategory": "degree",
         "educationalLevel": "Master's degree",
         "dateCreated": "2023",
         "recognizedBy": {"@id": AAU_ROR}},
        {"@type": "EducationalOccupationalCredential",
         "name": "BSc Pharmacy",
         "credentialCategory": "degree",
         "educationalLevel": "Bachelor's degree",
         "dateCreated": "2021",
         "recognizedBy": {"@id": AAU_ROR}},
    ],
    "award": [
        "First place, BindHack hackathon, Insilico Medicine, Masdar City, 2025",
        "Three Minute Thesis, second place, 2nd AAU Health and Biomedical Postgraduate Symposium, 2024",
        "Best Quality Poster, first place, 1st International Conference on Pharmacy and Biomedical Sciences, Al Ain University, 2023",
    ],
    "address": {"@type": "PostalAddress", "addressLocality": "Abu Dhabi",
                "addressCountry": "AE"},
    "email": "abdallah.abouhajal@gmail.com",
    "image": {
        "@type": "ImageObject",
        "@id": f"{SITE}/#profile-image",
        "contentUrl": f"{SITE}/images/profile.png",
        "url": f"{SITE}/images/profile.png",
        "caption": "Abdallah Abou Hajal",
        "width": 1080,
        "height": 1080,
    },
    "url": f"{SITE}/",
    "identifier": [
        {"@type": "PropertyValue", "propertyID": "ORCID",
         "value": "0009-0006-1807-2178", "url": "https://orcid.org/0009-0006-1807-2178"},
        {"@type": "PropertyValue", "propertyID": "Google Scholar",
         "value": "1I8SvsQAAAAJ", "url": "https://scholar.google.com/citations?user=1I8SvsQAAAAJ"},
        {"@type": "PropertyValue", "propertyID": "OpenAlex",
         "value": "A5102914480", "url": "https://openalex.org/A5102914480"},
        {"@type": "PropertyValue", "propertyID": "Semantic Scholar",
         "value": "2203865831", "url": "https://www.semanticscholar.org/author/2203865831"},
        {"@type": "PropertyValue", "propertyID": "Scopus Author ID",
         "value": "58094444100", "url": "https://www.scopus.com/authid/detail.uri?authorId=58094444100"},
    ],
    # His own accounts only. The ScholarlyBrightMinds GitHub is the group's,
    # so it lives in memberOf, not here.
    "sameAs": [
        "https://scholar.google.com/citations?user=1I8SvsQAAAAJ&hl=en",
        "https://orcid.org/0009-0006-1807-2178",
        "https://www.linkedin.com/in/abdallah-abou-hajal/",
        "https://www.researchgate.net/profile/Abdallah-Abou-Hajal-2",
        "https://github.com/AbdallahAbouHajal",
        "https://github.com/AbdallahHajal",
        "https://openalex.org/A5102914480",
        "https://openalex.org/A5092110406",
        "https://openalex.org/A5108811528",
        "https://www.semanticscholar.org/author/2203865831",
        "https://www.scopus.com/authid/detail.uri?authorId=58094444100",
        "https://www.instagram.com/abdallah_abouhajal/",
    ],
    "knowsAbout": [
        {"@type": "Thing", "name": "Drug discovery",
         "sameAs": "https://www.wikidata.org/wiki/Q1418791"},
        {"@type": "Thing", "name": "Cheminformatics",
         "sameAs": "https://www.wikidata.org/wiki/Q910164"},
        {"@type": "Thing", "name": "Machine learning",
         "sameAs": "https://www.wikidata.org/wiki/Q2539"},
        {"@type": "Thing", "name": "Virtual screening",
         "sameAs": "https://www.wikidata.org/wiki/Q4112105"},
        "Colloidal aggregators in drug screening",
        "Large Language Models",
        "AutoML",
        "Molecular Property Prediction",
        "Programmatic Molecular Dynamics Simulation",
        "Adverse Outcome Pathway Networks",
        "Computational Toxicology",
    ],
    "knowsLanguage": [
        {"@type": "Language", "name": "English", "alternateName": "en"},
        {"@type": "Language", "name": "Arabic", "alternateName": "ar"},
    ],
    "description": ("Researcher in AI for drug discovery and Data Analyst and AI "
                    "Automation Lead at Scifiniti Publishing, Abu Dhabi. MSc "
                    "Pharmaceutical Sciences, Al Ain University. First author of "
                    "the BAD Molecule Filter (J. Chem. Inf. Model. 2024), a model "
                    "that flags molecules that look like real hits in a drug "
                    "screen but are clumping together and causing false positives."),
}

ABOUT_PAGE = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": f"{SITE}/about.html#page",
    "url": f"{SITE}/about.html",
    "name": "About · Abdallah Abou Hajal",
    "isPartOf": {"@id": f"{SITE}/#website"},
    "mainEntity": PERSON,
}


def block(obj: dict) -> str:
    return ('<script type="application/ld+json">\n'
            + json.dumps(obj, indent=2, ensure_ascii=False)
            + "\n</script>")


def write_between(path: Path, begin: str, end: str, body: str) -> None:
    text = path.read_text(encoding="utf-8")
    pat = re.compile(re.escape(begin) + r".*?" + re.escape(end), re.S)
    if not pat.search(text):
        raise SystemExit(f"[FAIL] {path.name}: markers {begin} / {end} not found")
    new = pat.sub(lambda _m: f"{begin}\n{body}\n{end}", text, count=1)
    if new != text:
        path.write_text(new, encoding="utf-8")
        print(f"[OK] {path.name}: Person markup written")
    else:
        print(f"[OK] {path.name}: already current")


def main() -> int:
    person = {"@context": "https://schema.org", **PERSON}
    write_between(REPO / "index.html", "<!-- PERSON-JSONLD:BEGIN -->",
                  "<!-- PERSON-JSONLD:END -->", block(person))
    write_between(REPO / "about.html", "<!-- ABOUTPAGE-JSONLD:BEGIN -->",
                  "<!-- ABOUTPAGE-JSONLD:END -->", block(ABOUT_PAGE))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
