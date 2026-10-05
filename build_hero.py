#!/usr/bin/env python3
"""build_hero.py · the moving molecule beside him on the homepage.

Writes `images/hero/md.json`: erlotinib as it moved in the EGFR pocket during
the 1M17 molecular dynamics run that the game's third step plays (pose A, the
pose that holds). hero.js draws it in a small tile and steps through the real
frames while it turns, so the wobble on the homepage is the simulation itself.

Every third frame of the 101 is kept (34 frames, 60 ps apart), centred on the
mean centroid, in tenths of an angstrom. Bonds are worked out once with the
same rule fitdrug.js uses for the 3D pocket.

    python3 build_hero.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

REPO = Path(__file__).resolve().parent
SRC = REPO / "data" / "fitdrug" / "pocket3d.json"
OUT = REPO / "images" / "hero" / "md.json"

POSE = "A"          # the pose that stays put, which is the game's answer
EVERY = 3           # keep every third frame
SCALE = 10          # stored as integers, tenths of an angstrom
LIMIT = 12_000      # bytes; the tile is decoration and must stay small


def bonds_for(xyz: list[tuple[float, float, float]], els: list[str]) -> list[int]:
    """Heavy atoms bond when they are close enough, with room for sulphur and
    phosphorus. Same cut-offs as bond3() in fitdrug.js."""
    out: list[int] = []
    for i in range(len(xyz)):
        for j in range(i + 1, len(xyz)):
            cut = 1.78 + (0.24 if {els[i], els[j]} & {"S", "P"} else 0)
            d2 = sum((a - b) ** 2 for a, b in zip(xyz[i], xyz[j]))
            if 0.64 < d2 < cut * cut:
                out += [i, j]
    return out


def main() -> int:
    data = json.loads(SRC.read_text(encoding="utf-8"))
    run = data["md"][POSE]
    scale_in = float(data["scale"])
    els = [data["els"][k] for k in run["e"]]
    n = len(els)

    frames = [
        [tuple(f[3 * a + c] / scale_in for c in range(3)) for a in range(n)]
        for f in run["f"][::EVERY]
    ]
    cx, cy, cz = (sum(at[c] for fr in frames for at in fr) / (len(frames) * n) for c in range(3))
    frames = [[(x - cx, y - cy, z - cz) for x, y, z in fr] for fr in frames]

    bonds = bonds_for(frames[0], els)
    radius = max(math.sqrt(x * x + y * y + z * z) for fr in frames for x, y, z in fr)

    out = {
        "note": f"Erlotinib in EGFR (1M17), MD run {run['run']}, one frame in {EVERY}, "
                f"{run['ps'] * EVERY:g} ps apart, tenths of an angstrom about the mean centroid. "
                "Written by build_hero.py from data/fitdrug/pocket3d.json.",
        "scale": SCALE,
        "ps": round(run["ps"] * EVERY),
        "els": els,
        "bonds": bonds,
        "r": round(radius, 2),
        "frames": [[round(v * SCALE) for at in fr for v in at] for fr in frames],
    }
    text = json.dumps(out, separators=(",", ":"))
    if len(text) > LIMIT:
        raise SystemExit(f"[FAIL] md.json would be {len(text)} bytes, over {LIMIT}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text + "\n", encoding="utf-8")
    print(f"[OK] {OUT.relative_to(REPO)}: {n} atoms, {len(bonds) // 2} bonds, "
          f"{len(frames)} frames, radius {radius:.2f} A, {len(text)} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
