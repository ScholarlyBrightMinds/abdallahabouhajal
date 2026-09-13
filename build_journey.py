#!/usr/bin/env python3
"""Draw the About page walk and write it into about.html.

The world is one SVG, 5600 by 600 units, with the stick man 120 units tall.
Three layers give it depth: a pale skyline that drifts slowly, the world itself
(ground, illustrated scenes, papers, the man), and a near band of pebbles that
drifts faster. Six scenes are illustrations sitting on the ground line, two of
them carrying a real logo on a blank sign panel: Al Ain University on the campus
board, Scifiniti on the office panel. Papers fall on their real publication
years and stack into the risers he walks up.

journey.js animates it. With JavaScript off the same markup is the finished
drawing as a strip you scroll sideways, with the dated facts below it as a list.
Everything between JOURNEY:BEGIN and JOURNEY:END is regenerated, so edit this
file, not about.html.

Run: python3 build_journey.py
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent
ABOUT = REPO / "about.html"
ART = REPO / "images" / "journey"
BEGIN = "<!-- JOURNEY:BEGIN -->"
END = "<!-- JOURNEY:END -->"

W, H = 5600, 600
GROUND_START = 500          # ground level on the left
RISER_W, RISER_H = 46, 17   # one riser per year of published work
MAN_H = 120                 # the stick man's height, the scale of everything

# ── the scenes ───────────────────────────────────────────────────────────
# key, world x of the left edge, world width, world height. The art is drawn so
# its bottom edge IS the ground line, so each one sits at ground level at its x.
SCENES = {
    "s1_campus":   (190, 634, 330),
    "s2_lab":      (1480, 498, 235),
    "s3_office":   (2330, 569, 296),
    "s4_journals": (3300, 433, 215),
    "s5_desk":     (4080, 407, 195),
    "s6_gate":     (5240, 263, 265),
}

# A real logo on a blank panel in the art: scene key, logo file, the panel as
# fractions of the scene box (x0, x1, y0, y1) measured off the pixels, and the
# logo's own aspect ratio.
SIGNS = [
    ("s1_campus", "aau-logo.svg", (0.726, 0.978, 0.511, 0.815), 121 / 88,
     "Al Ain University"),
    ("s3_office", "scifiniti-logo.svg", (0.419, 0.730, 0.125, 0.409), 1277.43 / 490.34,
     "Scifiniti Publishing"),
]

# ── the stations ─────────────────────────────────────────────────────────
# id, x where he stops, datetime, tick label, heading, fact, scene, what he carries
STATIONS = [
    (1, 860, "2016", "2016 to 2021", "BSc Pharmacy",
     "Al Ain University, College of Pharmacy. GPA 3.83, graduated with Excellent, "
     "Honor Student 2017/2018.",
     "s1_campus", "bag"),
    (2, 1830, "2021-09", "2021 to 2023", "MSc Pharmaceutical Sciences",
     "Al Ain University. GPA 3.94 on a postgraduate scholarship, research and lab "
     "assistant, teaching undergraduate labs. Thesis: a machine learning tool for "
     "promiscuous aggregate based inhibitors, supervised by Prof. Mohammad Ghattas "
     "and Prof. Boulbaba Ben Amor, deployed as a public web server.",
     "s2_lab", "bag"),
    (3, 2800, "2023-02", "Feb 2023", "Managing Editor, Scifiniti Publishing",
     "Editorial operations across 5+ STEM journals in Abu Dhabi, first contact for "
     "authors, reviewers and editors. The papers kept coming while the job ran.",
     "s3_office", "laptop"),
    (4, 3620, "2024-06", "2024", "First author in JCIM",
     "Boosting the accuracy and chemical space coverage of the detection of small "
     "colloidal aggregating molecules, the BAD Molecule Filter, in Journal of "
     "Chemical Information and Modeling.",
     "s4_journals", "laptop"),
    (5, 4380, "2025-05", "May 2025", "Data Analyst and AI Automation Lead, Scifiniti",
     "LLM based agents for editorial workflows, Python tooling for publishing "
     "operations, dashboards for journal performance.",
     "s5_desk", "laptop"),
    (6, 5120, "2026", "2026 to today", "Applying for PhD positions",
     "Three papers published this year and two more under review. Looking for a "
     "group working on machine learning for drug discovery.",
     "s6_gate", "laptop"),
]

# ── the papers ───────────────────────────────────────────────────────────
# Counted from data/serpapi/serpapi.json, the same file the publications page
# uses, so the stack cannot drift from the record. x is where that year sits on
# the walk, between the stations either side of it.
PAPER_YEARS = [(2360, 2022, 2), (2980, 2023, 4), (3480, 2024, 2),
               (4560, 2025, 3), (5000, 2026, 3)]


def paper_counts() -> dict[int, int]:
    src = REPO / "data" / "serpapi" / "serpapi.json"
    try:
        rows = json.loads(src.read_text(encoding="utf-8"))
    except Exception:
        return {}
    out: dict[int, int] = {}
    for r in rows:
        y = str(r.get("year") or "")[:4]
        if y.isdigit():
            out[int(y)] = out.get(int(y), 0) + 1
    return out


# ── ground ───────────────────────────────────────────────────────────────
def risers() -> list[tuple[int, int]]:
    """(x where the riser starts, ground level after it), one per paper year."""
    out, y = [], GROUND_START
    for x, _year, _n in PAPER_YEARS:
        y -= RISER_H
        out.append((x, y))
    return out


def ground_y(x: float) -> float:
    y = GROUND_START
    for rx, ny in risers():
        if x >= rx + RISER_W:
            y = ny
        elif x > rx:
            return y + (ny - y) * (x - rx) / RISER_W
    return y


def ground_path() -> str:
    d = [f"M 0 {GROUND_START}"]
    for x, ny in risers():
        d.append(f"H {x}")
        d.append(f"L {x + RISER_W} {ny}")
    d.append(f"H {W}")
    return " ".join(d)


def ground_fill() -> str:
    return f'<path class="jearth" d="{ground_path()} V {H} H 0 Z"/>'


# ── layers ───────────────────────────────────────────────────────────────
def skyline() -> str:
    """A pale city edge for the far layer. Deterministic, so every build of the
    page draws the same skyline."""
    rnd, out, x = 1234567, [], 0
    def nxt(n):
        nonlocal rnd
        rnd = (1103515245 * rnd + 12345) % (1 << 31)
        return rnd % n
    while x < 3900:
        w = 46 + nxt(70)
        h = 60 + nxt(190)
        out.append(f'<rect x="{x}" y="{430 - h}" width="{w}" height="{h}"/>')
        if nxt(7) == 0:
            r = 18 + nxt(14)
            out.append(f'<path d="M {x + w / 2 - r} {430 - h} a {r} {r} 0 0 1 {2 * r} 0"/>')
        x += w + 10 + nxt(46)
    return (f'<g class="jskyline">{"".join(out)}</g>'
            f'<circle class="jsun" cx="520" cy="150" r="54"/>')


def foreground() -> str:
    """A near band of pebbles and tufts that drifts faster than the world."""
    rnd, out, x = 76543, [], -200
    def nxt(n):
        nonlocal rnd
        rnd = (1103515245 * rnd + 12345) % (1 << 31)
        return rnd % n
    while x < 6600:
        y = 534 + nxt(40)
        if nxt(3) == 0:
            out.append(f'<path class="jtuft" d="M {x} {y} l 5 -14 M {x} {y} l -2 -11 M {x} {y} l 11 -9"/>')
        else:
            rx = 5 + nxt(9)
            out.append(f'<ellipse class="jpebble" cx="{x}" cy="{y}" rx="{rx}" ry="{max(3, rx * 0.5):.0f}"/>')
        x += 90 + nxt(190)
    return "".join(out)


# ── scenes and signs ─────────────────────────────────────────────────────
def scene_group(sid: int, key: str) -> str:
    x, w, h = SCENES[key]
    y = ground_y(x + w * 0.5) - h
    parts = [
        f'<image href="images/journey/{key}.webp" x="{x}" y="{y:.0f}" '
        f'width="{w}" height="{h}" preserveAspectRatio="none"/>'
    ]
    for skey, logo, (fx0, fx1, fy0, fy1), aspect, name in SIGNS:
        if skey != key:
            continue
        px, pw = x + fx0 * w, (fx1 - fx0) * w
        py, ph = y + fy0 * h, (fy1 - fy0) * h
        lw, lh = pw * 0.86, ph * 0.80
        if lw / lh > aspect:
            lw = lh * aspect
        else:
            lh = lw / aspect
        lx, ly = px + (pw - lw) / 2, py + (ph - lh) / 2
        parts.append(
            f'<image class="jsign" href="images/journey/{logo}" '
            f'x="{lx:.1f}" y="{ly:.1f}" width="{lw:.1f}" height="{lh:.1f}" '
            f'data-cx="{lx + lw / 2:.1f}" data-cy="{ly + lh / 2:.1f}">'
            f'<title>{name}</title></image>'
        )
    return (f'<g class="jscene" data-station="{sid}" data-x="{x}" data-w="{w}">'
            f'{"".join(parts)}</g>')


# ── papers ───────────────────────────────────────────────────────────────
def papers() -> str:
    """One sheet per published paper, landing on its year and stacking into the
    riser he then walks up. The JCIM paper, his first as first author, is the
    marked one."""
    counts = paper_counts()
    out = []
    for rx, year, fallback in PAPER_YEARS:
        n = counts.get(year, fallback)
        below = ground_y(rx - 1)
        step = RISER_H / max(1, n)
        for i in range(n):
            y = below - (i + 1) * step
            cls = "jsheet jsheet-mark" if (year == 2024 and i == 0) else "jsheet"
            out.append(
                f'<rect class="{cls}" x="{rx - 16 + i * 5}" y="{y:.1f}" '
                f'width="{RISER_W + 34}" height="{step:.1f}" rx="1.5" '
                f'data-x="{rx}" data-year="{year}" data-i="{i}"/>'
            )
    return f'<g class="jpapers">{"".join(out)}</g>'


# ── the figure, for the page without JavaScript ──────────────────────────
def standing_man(x: float) -> str:
    """The same proportions journey.js animates, standing still. journey.js
    removes this and draws its own."""
    g = ground_y(x)
    hip, sho, head = -52, -96, -112
    def leg(dx):
        return f"M 0 {hip} L {dx * 4} {hip / 2 - 2} L {dx * 9} 0"
    def arm(dx):
        return f"M 0 {sho} L {dx * 7} {sho + 18} L {dx * 5} {sho + 36}"
    d = " ".join([f"M 0 {hip} V {sho}", leg(-1), leg(1), arm(-1), arm(1)])
    return (
        f'<g class="jman jman-static" transform="translate({x},{g:.0f})">'
        f'<path class="jl" d="{d}"/>'
        f'<circle class="jl" cx="0" cy="{head}" r="11"/>'
        f"</g>"
    )


def svg() -> str:
    scenes = "".join(scene_group(sid, key) for sid, _x, _dt, _t, _h, _b, key, _c in STATIONS)
    return (
        f'<svg class="journey-svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
        f'role="img" aria-labelledby="journey-svg-title" preserveAspectRatio="xMinYMax meet">'
        '<title id="journey-svg-title">Abdallah Abou Hajal walking from Al Ain University '
        'through his masters and Scifiniti Publishing to his published research and a PhD</title>'
        f'<g class="jlayer jsky" data-par="0.28">{skyline()}</g>'
        f'<g class="jlayer jworld" data-par="1">'
        f'{ground_fill()}'
        f'{scenes}'
        f'{papers()}'
        f'<path class="jl jground" id="journey-ground" d="{ground_path()}"/>'
        f'{standing_man(STATIONS[-1][1])}'
        f'<g class="jman" id="journey-man" aria-hidden="true"></g>'
        f'</g>'
        f'<g class="jlayer jfore" data-par="1.12">{foreground()}</g>'
        f'</svg>'
    )


def ticks() -> str:
    out = []
    for sid, x, dt, tick, heading, _b, _s, _c in STATIONS:
        out.append(
            f'<button type="button" class="journey-tick" data-station="{sid}" '
            f'style="left:{x / W * 100:.2f}%" aria-label="Go to {tick}, {heading}">'
            f'<span>{dt[:4]}</span></button>'
        )
    return "".join(out)


def facts() -> str:
    rows = []
    for sid, x, dt, tick, heading, body, _s, carry in STATIONS:
        rows.append(
            f'<li class="journey-fact" data-station="{sid}" data-x="{x}" data-carry="{carry}">'
            f'<time datetime="{dt}">{tick}</time>'
            f'<h3>{heading}</h3><p>{body}</p></li>'
        )
    return "".join(rows)


def block() -> str:
    return (
        f'{BEGIN}\n'
        '<section class="journey" id="journey" aria-labelledby="journey-title">\n'
        '    <h2 class="sec-title" id="journey-title">Career path</h2>\n'
        '    <div class="journey-stage">\n'
        f'        {svg()}\n'
        '        <div class="journey-capwrap"><p class="journey-caption" hidden>'
        '<span class="jc-date"></span><span class="jc-title"></span></p></div>\n'
        '    </div>\n'
        '    <div class="journey-controls" hidden>\n'
        '        <button type="button" class="journey-play" aria-label="Play the walk">Play</button>\n'
        '        <div class="journey-track">\n'
        '            <input class="journey-scrub" type="range" min="0" max="1000" value="0" step="1" '
        'aria-label="Position in the walk">\n'
        f'            <div class="journey-ticks" aria-hidden="true">{ticks()}</div>\n'
        '        </div>\n'
        '        <span class="journey-time" aria-live="off">0:00</span>\n'
        '    </div>\n'
        f'    <ol class="journey-facts">{facts()}</ol>\n'
        '</section>\n'
        f'{END}'
    )


def main() -> int:
    missing = [k for k in SCENES if not (ART / f"{k}.webp").exists()]
    missing += [s[1] for s in SIGNS if not (ART / s[1]).exists()]
    if missing:
        print(f"[FAIL] images/journey is missing: {', '.join(missing)}")
        return 1
    html = ABOUT.read_text(encoding="utf-8")
    if BEGIN not in html or END not in html:
        print("[FAIL] about.html has no JOURNEY:BEGIN / JOURNEY:END markers")
        return 1
    new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda _: block(), html, flags=re.S)
    if new == html:
        print("[OK] about.html: journey already current")
    else:
        ABOUT.write_text(new, encoding="utf-8")
        counts = paper_counts()
        total = sum(counts.get(y, n) for _x, y, n in PAPER_YEARS)
        print(f"[OK] about.html: journey redrawn, {len(block())} chars, "
              f"{len(STATIONS)} stations, {total} papers, {len(SIGNS)} real logos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
