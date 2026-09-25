#!/usr/bin/env python3
"""build_background.py · the molecules behind every page.

Lays real molecule skeletons into one seamless tile, `images/bg-molecules.svg`,
which styles.css paints behind the whole site at a few percent opacity. The
coordinates are the same ones the two games draw from, so what sits behind the
page is chemistry this site is actually about, not a stock pattern.

A molecule is placed only where it fits whole inside the tile with room to
spare, and the tile repeats, so there is no seam and no clipped ring.

The same run writes `images/bg-molecules.json`: each placement's centre and its
bonds as a path around that centre. bg-motion.js uses it to lay the same
molecules out as separate elements that turn and drift on their own. Both
files come from one seed, so the moving layer starts exactly where the still
tile is and the hand-over is invisible.

    python3 build_background.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

REPO = Path(__file__).resolve().parent
OUT = REPO / "images" / "bg-molecules.svg"
OUT_JSON = REPO / "images" / "bg-molecules.json"
STROKE, STROKE_W = "#121a2c", 2.6
DECK = REPO / "data" / "molecules.json"
MINE = REPO / "data" / "research-mols.json"

W, H = 1400, 1000          # the tile, in its own units
BOND = 21                  # one bond, in tile units
MARGIN = 26                # keep a molecule this far inside the tile edge
GAP = 34                   # and this far from any other molecule

# Which molecules, and how big. The three from the research page first, because
# they are the ones this site has papers about, then a few familiar ones so the
# pattern reads as chemistry to anybody.
WANTED = [
    ("Erlotinib", 1.0), ("Quercetin", 0.92), ("Metformin", 0.8),
    ("Caffeine", 0.86), ("Morphine", 0.94), ("Penicillin G", 0.94),
    ("Adenine", 0.78), ("Ibuprofen", 0.84), ("Serotonin", 0.82),
    ("Quinine", 0.98), ("Aspirin", 0.78), ("Testosterone", 0.9),
]


def load() -> dict:
    out = {}
    for path in (MINE, DECK):
        if not path.exists():
            continue
        for m in json.loads(path.read_text(encoding="utf-8"))["molecules"]:
            out.setdefault(m["name"], m)
    return out


def rotated(mol: dict, scale: float, turn: float) -> tuple[list, list]:
    """Atom positions in tile units, rotated, centred on the origin."""
    cos, sin = math.cos(turn), math.sin(turn)
    pts = []
    for a in mol["atoms"]:
        x, y = a[1] * BOND * scale, a[2] * BOND * scale
        pts.append((x * cos - y * sin, x * sin + y * cos))
    cx = (min(p[0] for p in pts) + max(p[0] for p in pts)) / 2
    cy = (min(p[1] for p in pts) + max(p[1] for p in pts)) / 2
    pts = [(p[0] - cx, p[1] - cy) for p in pts]
    return pts, mol["bonds"]


def segments(pts: list, bonds: list) -> list:
    """One line per bond, with the second line of a double bond beside it."""
    out = []
    for b in bonds:
        i, j, order = b[0], b[1], b[2]
        side = b[3] if len(b) > 3 else 0
        ax, ay = pts[i]
        bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        ln = math.hypot(dx, dy) or 1
        nx, ny = -dy / ln, dx / ln
        gap = 0.15 * BOND
        offsets = [0.0] if order == 1 else (
            [0.0, side * gap * 1.5] if (order == 2 and side) else
            [-gap, gap] if order == 2 else [-gap * 1.4, 0.0, gap * 1.4])
        for o in offsets:
            trim = 0.16 if (o and side) else 0.0
            out.append((ax + nx * o + dx * trim, ay + ny * o + dy * trim,
                        bx + nx * o - dx * trim, by + ny * o - dy * trim))
    return out


def main() -> int:
    have = load()
    missing = [n for n, _ in WANTED if n not in have]
    if missing:
        print(f"[FAIL] not in the data files: {', '.join(missing)}")
        return 1

    # a fixed walk of positions and turns, so every build draws the same tile
    rnd = 20260914
    def nxt(n: int) -> int:
        nonlocal rnd
        rnd = (1103515245 * rnd + 12345) % (1 << 31)
        return rnd % n

    placed, parts, layout = [], [], []
    for name, scale in WANTED:
        mol = have[name]
        best = None
        for _try in range(400):
            turn = nxt(628) / 100.0
            pts, bonds = rotated(mol, scale, turn)
            rx = max(abs(p[0]) for p in pts) + MARGIN
            ry = max(abs(p[1]) for p in pts) + MARGIN
            if rx * 2 > W or ry * 2 > H:
                continue
            cx = rx + nxt(max(1, int(W - rx * 2)))
            cy = ry + nxt(max(1, int(H - ry * 2)))
            clash = any(abs(cx - px) < (rx + prx + GAP) and abs(cy - py) < (ry + pry + GAP)
                        for px, py, prx, pry in placed)
            if clash:
                continue
            best = (cx, cy, rx, ry, pts, bonds)
            break
        if not best:
            print(f"  skipped {name}, no room left")
            continue
        cx, cy, rx, ry, pts, bonds = best
        placed.append((cx, cy, rx, ry))
        d, rel = [], []
        for x1, y1, x2, y2 in segments(pts, bonds):
            d.append(f"M{x1 + cx:.1f} {y1 + cy:.1f}L{x2 + cx:.1f} {y2 + cy:.1f}")
            rel.append(f"M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}")
        parts.append(f'<path d="{"".join(d)}"/>')
        # radius of the circle the molecule sweeps as it turns, plus the stroke
        reach = max(math.hypot(x, y) for x, y in pts) + STROKE_W
        layout.append({"name": name, "cx": round(cx, 1), "cy": round(cy, 1),
                       "r": round(reach, 1), "d": "".join(rel)})
        print(f"  {name:14} at {cx:4.0f},{cy:4.0f}  {len(bonds)} bonds")

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
        f'<g fill="none" stroke="{STROKE}" stroke-width="{STROKE_W}" stroke-linecap="round" '
        f'stroke-linejoin="round">{"".join(parts)}</g></svg>'
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(svg, encoding="utf-8")
    print(f"wrote {OUT.relative_to(REPO)}  {len(placed)} molecules  {len(svg) / 1024:.1f} KB")
    doc = json.dumps({"tile": [W, H], "stroke": STROKE, "strokeWidth": STROKE_W,
                      "molecules": layout}, separators=(",", ":"))
    OUT_JSON.write_text(doc + "\n", encoding="utf-8")
    print(f"wrote {OUT_JSON.relative_to(REPO)}  {len(layout)} placements  {len(doc) / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
