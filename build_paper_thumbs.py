#!/usr/bin/python3
"""
build_paper_thumbs.py: card thumbnails of each paper's first page.

LOCAL TOOL, NOT PART OF THE WEEKLY GITHUB ACTION. The publisher PDFs live on
Abdallah's laptop (PDF_DIR below) and are not in the repo, so this cannot run
in CI. Run it by hand when a paper is added or a crop needs fixing, look at the
output, then commit images/papers/*.webp. build_html.py only checks whether
images/papers/<slug>.webp exists, so the weekly bake keeps working untouched.

Run with the macOS system Python, which has PyMuPDF (fitz) and Pillow:

    /usr/bin/python3 build_paper_thumbs.py
    /usr/bin/python3 build_paper_thumbs.py --only 10.1021/acs.jcim.4c00363

Needs `cwebp` on PATH (brew install webp).

For every row of "00 - INDEX.md" in PDF_DIR:
  1. Find "Publication #N - *.pdf".
  2. Pick the article's first page. Taylor & Francis put a cover sheet in
     front (634x833 pt, says "To cite this article"); when page 1 looks like
     that, the article starts on page 2.
  3. Crop the band from the journal header through the abstract. The default
     box is x 4% to 96%, y 0% to 58% of the page. CROPS overrides it per DOI;
     each override was tuned by eye so the band holds the header, title,
     authors and as much abstract as fits, ends in the white space between
     two lines, and keeps margin notes (ACS download stamp, CC licence line)
     out. Crops aim at the 4 / 3.4 box the card uses on publications.html.
  4. Render the crop about 1440 px wide, downsize to 720 px (Lanczos) and
     encode images/papers/<slug>.webp with cwebp -q 80. A page dense with
     small type that still weighs over 90 KB steps down to q 78, 76 and so
     on (never below 70) until it fits.
  5. Print slug, source page, crop, pixel size, bytes and quality. A row marked
     "INK AT EDGE" has dark pixels on its bottom row, so a line of text is
     probably cut in half there and the override needs another look.

The slug comes from build_html._slugify_doi, the same function
render_article uses to find the file.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import fitz  # PyMuPDF
    from PIL import Image
except ImportError:
    sys.exit("[FAIL] needs PyMuPDF and Pillow; run with /usr/bin/python3")

from build_html import _slugify_doi

REPO_ROOT = Path(__file__).resolve().parent
PDF_DIR = Path.home() / "Desktop" / "PhD Hunting" / "List of Publications PDFs"
INDEX_MD = PDF_DIR / "00 - INDEX.md"
OUT_DIR = REPO_ROOT / "images" / "papers"

RENDER_W = 1440   # px width the crop is rasterised at
OUT_W = 720       # px width of the published WebP
WEBP_Q = 80       # cwebp quality to start from
MIN_Q = 70
MAX_BYTES = 90_000

# Fractions of the article page: (x0, x1, y0, y1).
DEFAULT_CROP = (0.04, 0.96, 0.00, 0.58)

# Keys are lower-case DOIs. Comment says what the band ends on.
CROPS: dict[str, tuple[float, float, float, float]] = {
    # Elsevier, Computational Toxicology: whole abstract and its closing rule
    "10.1016/j.comtox.2026.100429":    (0.050, 0.950, 0.000, 0.574),
    # T&F cover sheet skipped. Grey abstract box, then the first intro lines
    "10.1080/17460441.2026.2641511":   (0.050, 0.955, 0.040, 0.632),
    # T&F cover sheet skipped. Abstract, then the top of the graphical abstract
    "10.1080/15376516.2026.2628929":   (0.070, 0.935, 0.035, 0.599),
    # Elsevier, J Pharm Sci: whole abstract and copyright line
    "10.1016/j.xphs.2025.104147":      (0.050, 0.960, 0.020, 0.600),
    # Elsevier, Comput Biol Med: whole abstract, intro heading, two intro lines
    "10.1016/j.compbiomed.2025.110156": (0.050, 0.955, 0.020, 0.603),
    # T&F cover sheet skipped. Grey abstract box, then the first intro lines
    "10.1080/17425255.2025.2551724":   (0.050, 0.955, 0.040, 0.632),
    # ACS JCIM: x starts past the vertical "Downloaded via" stamp in the left
    # margin. TOC graphic, then the abstract up to a line gap
    "10.1021/acs.jcim.4c00363":        (0.060, 0.940, 0.030, 0.5973),
    # T&F cover sheet skipped. Editorial with no abstract: title, intro text
    "10.1080/13696998.2024.2315864":   (0.050, 0.955, 0.025, 0.616),
    # T&F cover sheet skipped. Editorial: keywords, then both intro columns
    "10.1080/17425255.2023.2294939":   (0.050, 0.955, 0.040, 0.632),
    # Elsevier, Saudi Pharm J: long author list, abstract to a line gap
    "10.1016/j.jsps.2023.05.024":      (0.050, 0.955, 0.040, 0.6176),
    # Elsevier, Saudi Pharm J: abstract to a line gap
    "10.1016/j.jsps.2023.01.004":      (0.050, 0.955, 0.040, 0.6166),
    # Pharmacy Practice (A4): x starts past the vertical CC licence line.
    # Whole abstract and keywords
    "10.18549/pharmpract.2023.3.2850": (0.050, 0.960, 0.040, 0.5866),
    # Pharmacy Practice (A4): same margin rule. Whole abstract and keywords
    "10.18549/pharmpract.2022.3.2713": (0.050, 0.960, 0.012, 0.5586),
    # T&F cover sheet skipped. Whole abstract, keywords, intro heading
    "10.1080/0972060x.2022.2072177":   (0.100, 0.880, 0.050, 0.5675),
}

TF_COVER_SIZE = (634, 833)  # points


def read_index() -> list[tuple[int, str]]:
    """Return [(publication number, doi)] from the markdown table."""
    rows = []
    doi_re = re.compile(r"^10\.\d{4,9}/\S+$")
    for line in INDEX_MD.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*Publication #(\d+)\s*\|", line)
        if not m:
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        doi = next((c for c in cells if doi_re.match(c)), None)
        if doi:
            rows.append((int(m.group(1)), doi))
    return rows


def find_pdf(num: int) -> Path | None:
    hits = sorted(PDF_DIR.glob(f"Publication #{num} - *.pdf"))
    return hits[0] if hits else None


def article_page_index(doc: "fitz.Document") -> int:
    """0 normally; 1 when page 1 is a Taylor & Francis cover sheet."""
    if len(doc) < 2:
        return 0
    first = doc[0]
    if "To cite this article" in first.get_text():
        return 1
    w, h = first.rect.width, first.rect.height
    if abs(w - TF_COVER_SIZE[0]) < 2 and abs(h - TF_COVER_SIZE[1]) < 2:
        return 1
    return 0


def render_crop(page: "fitz.Page", crop: tuple[float, float, float, float]) -> Image.Image:
    x0, x1, y0, y1 = crop
    W, H = page.rect.width, page.rect.height
    clip = fitz.Rect(x0 * W, y0 * H, x1 * W, y1 * H)
    zoom = RENDER_W / clip.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip, alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    out_h = round(img.height * OUT_W / img.width)
    return img.resize((OUT_W, out_h), Image.LANCZOS)


def ink_at_bottom(img: Image.Image) -> bool:
    """True when the last pixel row holds dark ink, i.e. text cut in half."""
    gray = img.convert("L")
    y = gray.height - 1
    px = gray.load()
    dark = sum(1 for x in range(gray.width) if px[x, y] < 140)
    return dark > 3


def encode_webp(img: Image.Image, dest: Path, cwebp: str) -> tuple[int, int]:
    """Encode at WEBP_Q. Pages dense with small type can land a little over
    MAX_BYTES at q 80; those step down 2 at a time, never below MIN_Q.
    Returns (bytes, quality used)."""
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "crop.png"
        img.save(png)
        q = WEBP_Q
        while True:
            subprocess.run(
                [cwebp, "-quiet", "-q", str(q), "-m", "6", "-sharp_yuv",
                 "-metadata", "none", str(png), "-o", str(dest)],
                check=True,
            )
            size = dest.stat().st_size
            if size <= MAX_BYTES or q <= MIN_Q:
                return size, q
            q -= 2


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--only", help="build just this DOI")
    args = ap.parse_args()

    if not INDEX_MD.exists():
        print(f"[FAIL] {INDEX_MD} not found (this tool only runs on the laptop that has the PDFs)")
        return 1
    cwebp = shutil.which("cwebp") or "/opt/homebrew/bin/cwebp"
    if not Path(cwebp).exists():
        print("[FAIL] cwebp not found; brew install webp")
        return 1
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    rows = read_index()
    if args.only:
        rows = [r for r in rows if r[1].lower() == args.only.lower()]
    if not rows:
        print("[FAIL] no index rows to build")
        return 1

    print(f"{'#':>3}  {'slug':<34} {'page':>4}  {'crop x0-x1, y0-y1':<31} "
          f"{'size':<9} {'bytes':>7} {'q':>3}")
    total = 0
    failed = 0
    for num, doi in rows:
        pdf = find_pdf(num)
        if not pdf:
            print(f"{num:>3}  [FAIL] no PDF for Publication #{num}")
            failed += 1
            continue
        slug = _slugify_doi(doi)
        crop = CROPS.get(doi.lower(), DEFAULT_CROP)
        with fitz.open(pdf) as doc:
            idx = article_page_index(doc)
            img = render_crop(doc[idx], crop)
        dest = OUT_DIR / f"{slug}.webp"
        size, q = encode_webp(img, dest, cwebp)
        total += size
        flag = "  INK AT EDGE" if ink_at_bottom(img) else ""
        crop_s = f"{crop[0]:.4f}-{crop[1]:.4f}, {crop[2]:.4f}-{crop[3]:.4f}"
        print(f"{num:>3}  {slug:<34} {idx + 1:>4}  {crop_s:<31} "
              f"{img.width}x{img.height:<5} {size:>7} {q:>3}{flag}")
    print(f"total {total} bytes in {OUT_DIR.relative_to(REPO_ROOT)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
