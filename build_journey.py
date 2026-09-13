#!/usr/bin/env python3
"""Draw the About page journey and write it into about.html.

The drawing is line art in one SVG: a ground line that steps up once per year
of published work, nine scenes, the papers as slabs in each riser, and a door
marked PhD at the end. journey.js animates it; with JavaScript off the same
markup is a wide strip you can scroll sideways, and the facts below it are a
plain list. Everything between JOURNEY:BEGIN and JOURNEY:END is regenerated,
so edit this file, not about.html.

Coordinates: the world is 5240 by 300. Ground starts at y 250 on the left and
climbs to 170 on the right, one 16 unit riser per publication year.

Run: python3 build_journey.py
"""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parent
ABOUT = REPO / "about.html"
BEGIN = "<!-- JOURNEY:BEGIN -->"
END = "<!-- JOURNEY:END -->"

W, H = 5240, 300

# ── the ground ───────────────────────────────────────────────────────────
# (x where the riser starts, ground level after it). The first entry is the
# starting level. A riser is 40 wide and 16 tall, which a walk cycle can climb
# without the legs looking broken.
RISERS = [(1250, 234), (2450, 218), (3100, 202), (4150, 186), (4880, 170)]
GROUND_START = 250
RISER_W = 40


def ground_path() -> str:
    d = [f"M 0 {GROUND_START}"]
    y = GROUND_START
    for x, ny in RISERS:
        d.append(f"H {x}")
        d.append(f"L {x + RISER_W} {ny}")
        y = ny
    d.append(f"H {W}")
    return " ".join(d)


def ground_y(x: float) -> float:
    y = GROUND_START
    for rx, ny in RISERS:
        if x >= rx + RISER_W:
            y = ny
        elif x > rx:
            t = (x - rx) / RISER_W
            return y + (ny - y) * t
    return y


# ── small drawing helpers, all line art ──────────────────────────────────
def p(d: str, cls: str = "jl") -> str:
    return f'<path class="{cls}" d="{d}"/>'


def rect(x, y, w, h, cls="jl", r=0) -> str:
    if r:
        return f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/>'
    return f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}"/>'


def circle(cx, cy, r, cls="jl") -> str:
    return f'<circle class="{cls}" cx="{cx}" cy="{cy}" r="{r}"/>'


def line(x1, y1, x2, y2, cls="jl") -> str:
    return f'<line class="{cls}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'


def label(x, y, text, cls="jt") -> str:
    return f'<text class="{cls}" x="{x}" y="{y}" text-anchor="middle">{text}</text>'


def small_figure(x, y, scale=0.42) -> str:
    """A seated-size onlooker: head, body, two legs, two arms."""
    s = scale
    return (
        f'<g class="jl" transform="translate({x},{y}) scale({s})">'
        f'<circle cx="0" cy="-88" r="13"/>'
        f'<path d="M 0 -75 V -38 M 0 -38 L -16 0 M 0 -38 L 16 0 M 0 -66 L -20 -48 M 0 -66 L 20 -48"/>'
        f"</g>"
    )


def sheets(riser_x, count) -> str:
    """The riser is a stack of paper: one slab per publication that year, so
    the years with papers are the years the ground gains height."""
    below = ground_y(riser_x - 1)
    above = ground_y(riser_x + RISER_W + 1)
    step = (below - above) / count
    out = []
    for i in range(count):
        y = below - (i + 1) * step
        out.append(
            f'<rect class="jl jsheet" x="{riser_x - 4 + i * 3}" y="{y:.1f}" '
            f'width="{RISER_W + 10}" height="{step:.1f}" rx="1"/>'
        )
    return "".join(out)


def clock(cx, cy, r, hands: str) -> str:
    return circle(cx, cy, r) + p(hands)


# The Scifiniti knot, traced from the brand PDF (bbox 90.5 92.13 305.42 square).
KNOT_PATHS = Path(__file__).with_name("journey-knot.txt")


def knot(x, y, size) -> str:
    d = KNOT_PATHS.read_text().strip()
    s = size / 305.42
    return (
        f'<g class="jknot" transform="translate({x},{y}) scale({s}) translate(-90.5,-92.13)">'
        f"{d}</g>"
    )


# ── the nine scenes ──────────────────────────────────────────────────────
def scene_1() -> str:
    """2016 to 2021. Al Ain University, and a pharmacy shelf."""
    g = ground_y(300)
    out = [
        # building: steps, columns, roof
        p(f"M 150 {g} L 172 {g - 12} H 388 L 410 {g}"),
        p(f"M 172 {g - 12} V {g - 96} H 388 V {g - 12}"),
        p(f"M 158 {g - 96} L 280 {g - 142} L 402 {g - 96}"),
        line(206, g - 96, 206, g - 12),
        line(248, g - 96, 248, g - 12),
        line(312, g - 96, 312, g - 12),
        line(354, g - 96, 354, g - 12),
        p(f"M 266 {g - 12} V {g - 58} H 294 V {g - 12}"),
        label(280, g - 156, "Al Ain University"),
        # pharmacy shelf
        line(452, g - 84, 556, g - 84),
        line(452, g - 46, 556, g - 46),
        line(452, g - 92, 452, g),
        line(556, g - 92, 556, g),
        rect(464, g - 104, 16, 20),
        rect(492, g - 108, 16, 24),
        rect(520, g - 102, 16, 18),
        rect(470, g - 64, 14, 18),
        rect(500, g - 66, 14, 20),
        rect(528, g - 62, 14, 16),
    ]
    return "".join(out)


def scene_2() -> str:
    """2021 to 2023. A lab bench, a ring stand, and two students taught."""
    g = ground_y(880)
    out = [
        # bench
        line(742, g - 60, 1010, g - 60),
        line(760, g - 60, 760, g),
        line(992, g - 60, 992, g),
        # ring stand with a round bottom flask
        line(812, g - 60, 812, g - 168),
        line(812, g - 140, 862, g - 140),
        circle(868, g - 118, 20),
        p(f"M 860 {g - 134} L 856 {g - 156} H 880 L 876 {g - 134}"),
        # notebook on the bench
        p(f"M 920 {g - 60} l 34 -10 l 30 10"),
        # two students at a second bench
        line(1060, g - 44, 1168, g - 44),
        line(1072, g - 44, 1072, g),
        line(1156, g - 44, 1156, g),
        small_figure(1092, g - 44),
        small_figure(1140, g - 44),
    ]
    return "".join(out)


def scene_3() -> str:
    """2022. The first two papers land, and the ground steps up."""
    g_after = ground_y(1350)
    out = [
        sheets(1250, 2),
        # rosemary sprig on the top sheet
        p(f"M 1330 {g_after - 2} v -34"),
        p(
            f"M 1330 {g_after - 12} l -12 -7 M 1330 {g_after - 12} l 12 -7 "
            f"M 1330 {g_after - 22} l -12 -7 M 1330 {g_after - 22} l 12 -7 "
            f"M 1330 {g_after - 32} l -9 -6 M 1330 {g_after - 32} l 9 -6"
        ),
    ]
    return "".join(out)


def scene_4() -> str:
    """Feb 2023. Scifiniti: a desk, five journal spines, the sign."""
    g = ground_y(1900)
    out = [
        # sign board on two posts that stand on the ground
        line(1846, g, 1846, g - 130),
        line(2034, g, 2034, g - 130),
        rect(1806, g - 186, 268, 58, "jl", 4),
        knot(1848, g - 157, 40),
        f'<text class="jt jt-brand" x="1892" y="{g - 148}" text-anchor="start">Scifiniti</text>',
        # desk with five journal spines
        line(1812, g - 60, 2064, g - 60),
        line(1830, g - 60, 1830, g),
        line(2046, g - 60, 2046, g),
        rect(1856, g - 106, 13, 46),
        rect(1874, g - 100, 13, 40),
        rect(1892, g - 110, 13, 50),
        rect(1910, g - 96, 13, 36),
        rect(1928, g - 104, 13, 44),
        # a screen with a review queue
        p(f"M 1966 {g - 60} v -52 h 74 v 52"),
        line(1978, g - 96, 2028, g - 96),
        line(1978, g - 84, 2016, g - 84),
        line(1978, g - 72, 2022, g - 72),
    ]
    return "".join(out)


def scene_5() -> str:
    """2023. The thesis tool on a public server, and the poster prize."""
    g = ground_y(2600)
    out = [
        sheets(2450, 3),
        # browser frame holding a clump of aggregating molecules
        rect(2380, g - 150, 184, 118, "jl", 4),
        line(2380, g - 126, 2564, g - 126),
        circle(2394, g - 138, 4),
        circle(2406, g - 138, 4),
        circle(2418, g - 138, 4),
        circle(2452, g - 92, 13),
        circle(2476, g - 80, 10),
        circle(2470, g - 104, 8),
        circle(2494, g - 96, 12),
        circle(2450, g - 68, 7),
        line(2452, g - 92, 2476, g - 80),
        line(2452, g - 92, 2470, g - 104),
        line(2476, g - 80, 2494, g - 96),
        line(2476, g - 80, 2450, g - 68),
        # globe: the public web server
        circle(2528, g - 78, 18),
        p(f"M 2510 {g - 78} h 36 M 2528 {g - 96} a 12 18 0 0 1 0 36 a 12 18 0 0 1 0 -36"),
        # poster on an easel with a first place rosette
        p(f"M 2622 {g} l 22 -96 M 2700 {g} l -22 -96 M 2636 {g - 46} h 52"),
        rect(2612, g - 178, 100, 84, "jl", 2),
        line(2626, g - 160, 2698, g - 160),
        line(2626, g - 146, 2676, g - 146),
        line(2626, g - 132, 2690, g - 132),
        line(2626, g - 118, 2666, g - 118),
        circle(2700, g - 118, 13),
        p(f"M 2694 {g - 106} l -4 18 l 10 -6 l 10 6 l -4 -18"),
    ]
    return "".join(out)


def scene_6() -> str:
    """2024. Three Minute Thesis, and the JCIM paper in the stack."""
    g = ground_y(3250)
    out = [
        sheets(3100, 3),
        # podium
        p(f"M 3180 {g} v -74 h 72 v 74"),
        p(f"M 3172 {g - 74} h 88"),
        line(3216, g - 74, 3216, g - 120),
        p(f"M 3202 {g - 120} h 28"),
        # a clock reading three minutes
        clock(3320, g - 116, 30, f"M 3320 {g - 136} v 20 h 17"),
        label(3320, g - 70, "3:00"),
        # the JCIM sheet, marked
        f'<g class="jl jhighlight"><rect x="3380" y="{g - 128}" width="108" height="76" rx="2"/>'
        f'<line x1="3396" y1="{g - 108}" x2="3472" y2="{g - 108}"/>'
        f'<line x1="3396" y1="{g - 94}" x2="3456" y2="{g - 94}"/>'
        f'<line x1="3396" y1="{g - 80}" x2="3468" y2="{g - 80}"/></g>',
        label(3434, g - 30, "JCIM"),
    ]
    return "".join(out)


def scene_7() -> str:
    """May 2025. The automation job: a dashboard and a loop of agents."""
    g = ground_y(3800)
    out = [
        # dashboard on the wall
        rect(3700, g - 190, 170, 104, "jl", 4),
        p(f"M 3716 {g - 104} v -26 M 3744 {g - 104} v -44 M 3772 {g - 104} v -34 M 3800 {g - 104} v -58 M 3828 {g - 104} v -48"),
        line(3708, g - 104, 3862, g - 104),
        # the desk under it
        line(3688, g - 60, 3884, g - 60),
        line(3704, g - 60, 3704, g),
        line(3868, g - 60, 3868, g),
        # three agent boxes passing work round a loop
        rect(3900, g - 150, 46, 30, "jl", 3),
        rect(3980, g - 150, 46, 30, "jl", 3),
        rect(3940, g - 90, 46, 30, "jl", 3),
        p(f"M 3946 {g - 135} h 28 m -8 -5 l 8 5 l -8 5"),
        p(f"M 4000 {g - 120} v 18 l -14 10 m 6 -10 l -8 10 l 12 2"),
        p(f"M 3940 {g - 70} h -18 v -46 l 14 -4 m -14 4 l 10 8"),
    ]
    return "".join(out)


def scene_8() -> str:
    """2025. BindHack: six hours, an antibody finding its antigen, first place."""
    g = ground_y(4300)
    out = [
        sheets(4150, 3),
        # six hour clock
        clock(4270, g - 130, 30, f"M 4270 {g - 150} v 20 l 22 10"),
        label(4270, g - 84, "6 h"),
        # antibody Y docking onto an antigen
        p(f"M 4372 {g - 74} v -28 l -22 -26 M 4372 {g - 102} l 22 -26"),
        p(f"M 4342 {g - 136} l 8 -10 M 4402 {g - 136} l -8 -10"),
        p(f"M 4336 {g - 152} q 30 -26 60 0"),
        circle(4366, g - 168, 9),
        # first place flag
        line(4470, g, 4470, g - 120),
        p(f"M 4470 {g - 120} h 66 l -14 18 l 14 18 h -66"),
        label(4502, g - 78, "1st"),
    ]
    return "".join(out)


def scene_9() -> str:
    """2026 to today. Three more papers, and a door that is not open yet."""
    g = ground_y(4990)
    out = [
        sheets(4880, 3),
        # the door, drawn dashed because it has not been opened
        f'<g class="jl jdoor"><path d="M 5100 {g} v -118 h 96 v 118"/>'
        f'<circle cx="5182" cy="{g - 70}" r="5"/></g>',
        label(5148, g - 130, "PhD"),
    ]
    return "".join(out)


SCENES = [scene_1, scene_2, scene_3, scene_4, scene_5, scene_6, scene_7, scene_8, scene_9]

# Station: (id, x of the man's stop, datetime, tick label, heading, fact lines)
STATIONS = [
    (1, 620, "2016", "2016 to 2021", "BSc Pharmacy",
     "Al Ain University · GPA 3.83, graduated with Excellent · Honor Student 2017/2018"),
    (2, 1200, "2021-09", "2021 to 2023", "MSc Pharmaceutical Sciences",
     "Al Ain University · GPA 3.94 · postgraduate scholarship, research and lab assistant, "
     "taught undergraduate lab sessions"),
    (3, 1470, "2022", "2022", "First papers",
     "Volatile oil of Rosmarinus officinalis, J Essent Oil Bear Plants · "
     "Pharmacist prescribing protocol, Pharmacy Practice"),
    (4, 2140, "2023-02", "Feb 2023", "Managing Editor, Scifiniti Publishing",
     "Editorial operations across 5+ STEM journals, author and reviewer contact, review timelines"),
    (5, 2780, "2023-04", "2023", "MSc thesis, and a poster prize",
     "Machine learning tool for predicting promiscuous aggregate-based inhibitors, supervised by "
     "Prof. Mohammad Ghattas and Prof. Boulbaba Ben Amor, deployed as a public web server · "
     "Best Quality Poster, first place, 1st International Conference on Pharmacy and Biomedical Sciences"),
    (6, 3520, "2024-06", "2024", "First-author paper in JCIM",
     "Boosting the accuracy and chemical space coverage of colloidal aggregator detection, the BAD "
     "Molecule Filter · Three Minute Thesis, second place · papers in J Med Econ and Expert Opin "
     "Drug Metab Toxicol"),
    (7, 3980, "2025-05", "May 2025", "Data Analyst and AI Automation Lead, Scifiniti",
     "LLM agents for editorial workflows, Python tooling, journal performance dashboards"),
    (8, 4560, "2025-09", "2025", "First place, BindHack",
     "Insilico Medicine, Masdar City · best antibody-antigen binding model in a six hour competition · "
     "papers in J Pharm Sci, Comput Biol Med and Expert Opin Drug Metab Toxicol"),
    (9, 5010, "2026", "2026 to today", "Applying for PhD positions",
     "Papers in Toxicol Mech Methods, Expert Opin Drug Discov and Computational Toxicology · "
     "looking for a group working on machine learning for drug discovery"),
]

HAND = {1: "mortar", 2: "flask", 3: "flask", 4: "laptop", 5: "laptop",
        6: "laptop", 7: "laptop", 8: "graph", 9: "graph"}




def standing_man(x: float, scale: float = 0.66) -> str:
    """The same figure journey.js animates, in its idle pose, for the version
    of this page that never runs JavaScript. journey.js removes it and draws
    its own."""
    import math
    HIP, SHO, LEG, ARM = 38, 74, 40, 32
    lA, rA, alA, arA = 0.28, -0.28, -0.5, 0.5
    def limb(ox, oy, ang, ln):
        return f"M {ox} {oy} L {ox + math.sin(ang) * ln:.1f} {oy + math.cos(ang) * ln:.1f}"
    d = " ".join([
        limb(0, -HIP, lA, LEG),
        limb(0, -HIP, rA, LEG),
        f"M 0 {-HIP} V {-SHO + 4}",
        limb(0, -SHO + 8, alA, ARM),
        limb(0, -SHO + 8, arA, ARM),
    ])
    y = ground_y(x)
    return (
        f'<g class="jman jman-static" transform="translate({x},{y:.0f}) scale({scale})">'
        f'<path class="jl" stroke-width="6" d="{d}"/>'
        f'<circle class="jl" stroke-width="6" cx="0" cy="{-SHO - 16}" r="15"/>'
        f"</g>"
    )


def ruler() -> str:
    """A line along the bottom with a tick per stop. It fills in behind him,
    so the stage shows how far through the walk you are without a caption."""
    y = 264
    out = [f'<line class="jl jruler-base" x1="0" y1="{y}" x2="{W}" y2="{y}"/>',
           f'<line class="jl jruler-fill" id="journey-progress" x1="0" y1="{y}" x2="{W}" y2="{y}"/>']
    seen = set()
    for sid, x, dt, tick, heading, body in STATIONS:
        out.append(f'<line class="jl jruler-tick" x1="{x}" y1="{y - 7}" x2="{x}" y2="{y}"/>')
        year = dt[:4]
        if year in seen:
            continue
        seen.add(year)
        out.append(f'<text class="jt jruler-year" x="{x}" y="{y + 16}" text-anchor="middle">{year}</text>')
    return f'<g class="jruler">{"".join(out)}</g>'


def svg() -> str:
    parts = [
        f'<svg class="journey-svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
        f'role="img" aria-labelledby="journey-svg-title" preserveAspectRatio="xMinYMax meet">',
        '<title id="journey-svg-title">Abdallah Abou Hajal walking from university through '
        'his masters and Scifiniti to his published research</title>',
        '<g class="journey-world">',
        f'<path class="jl jground" id="journey-ground" d="{ground_path()}"/>',
        ruler(),
    ]
    for i, scene in enumerate(SCENES, start=1):
        parts.append(f'<g class="jscene" data-station="{i}">{scene()}</g>')
    parts.append(standing_man(5010))
    parts.append('<g class="jman" id="journey-man" aria-hidden="true"></g>')
    parts.append("</g></svg>")
    return "".join(parts)


def facts() -> str:
    rows = []
    for sid, x, dt, tick, heading, body in STATIONS:
        rows.append(
            f'<li class="journey-fact" data-station="{sid}" data-x="{x}" data-hand="{HAND[sid]}">'
            f'<time datetime="{dt}">{tick}</time>'
            f'<h3>{heading}</h3><p>{body}</p></li>'
        )
    return "".join(rows)


def block() -> str:
    return (
        f'{BEGIN}\n'
        '<section class="journey" id="journey" aria-labelledby="journey-title">\n'
        '    <h2 class="sec-title" id="journey-title">The road so far</h2>\n'
        '    <div class="journey-stage">\n'
        f'        {svg()}\n'
        '    </div>\n'
        '    <div class="journey-controls" hidden>\n'
        '        <button type="button" class="journey-play" aria-label="Play the walk">Play</button>\n'
        '        <input class="journey-scrub" type="range" min="0" max="1000" value="0" step="1" '
        'aria-label="Position in the walk">\n'
        '        <span class="journey-time" aria-live="off">0:00</span>\n'
        '        <span class="journey-year"></span>\n'
        '    </div>\n'
        f'    <ol class="journey-facts">{facts()}</ol>\n'
        '</section>\n'
        f'{END}'
    )


def main() -> int:
    html = ABOUT.read_text(encoding="utf-8")
    if BEGIN not in html or END not in html:
        print("[FAIL] about.html has no JOURNEY:BEGIN / JOURNEY:END markers")
        return 1
    new = re.sub(
        re.escape(BEGIN) + r".*?" + re.escape(END),
        lambda _: block(),
        html,
        flags=re.S,
    )
    if new == html:
        print("[OK] about.html: journey already current")
    else:
        ABOUT.write_text(new, encoding="utf-8")
        print(f"[OK] about.html: journey redrawn, {len(block())} chars")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
