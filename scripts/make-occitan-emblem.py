"""Unisce croce + stellina (1/15) in un unico SVG watermark."""
from __future__ import annotations

import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CROSS = ROOT / "public/images/brand/occitan-cross.svg"
OUT = ROOT / "public/images/brand/occitan-emblem.svg"

# Croce in viewBox 800×800; stella nel cantone NE (3× rispetto a prima)
CROSS_SIZE = 800
STAR_SIZE = (CROSS_SIZE / 22) * 3  # ~109px
# Centro ottico vicino ai bracci N/E (stesso punto di prima, scala 3×)
STAR_X = 575
STAR_Y = 62


def star_path(size: float = 100) -> str:
    cx = cy = size / 2
    outer = size * 0.48
    inner = outer * 0.38
    pts: list[str] = []
    for i in range(14):
        ang = -math.pi / 2 + i * math.pi / 7
        rad = outer if i % 2 == 0 else inner
        x = cx + rad * math.cos(ang)
        y = cy + rad * math.sin(ang)
        pts.append(f"{x:.3f} {y:.3f}")
    return "M " + " L ".join(pts) + " Z"


def main() -> None:
    cross_svg = CROSS.read_text(encoding="utf-8")
    paths = re.findall(r"<path d=\"([^\"]+)\"/>", cross_svg)
    if len(paths) < 2:
        raise SystemExit(f"Expected ≥2 paths in {CROSS}, got {len(paths)}")

    # Cantone NE: vicino alla croce, non sul bordo esterno
    star_x = STAR_X
    star_y = STAR_Y
    scale = STAR_SIZE / 100

    path_xml = "\n".join(f'  <path d="{d}"/>' for d in paths)
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CROSS_SIZE} {CROSS_SIZE}" fill="#c4c4c4" fill-rule="evenodd" shape-rendering="geometricPrecision" aria-hidden="true">
<title>Emblema occitano</title>
  <!-- Croce -->
{path_xml}
  <!-- Stella a 7 punte, ~1/15, angolo alto a destra -->
  <g transform="translate({star_x:.2f} {star_y:.2f}) scale({scale:.6f})">
    <path d="{star_path()}" fill-rule="nonzero"/>
  </g>
</svg>
"""
    OUT.write_text(svg, encoding="utf-8")
    print(
        f"Wrote {OUT} ({OUT.stat().st_size} bytes) "
        f"star={STAR_SIZE:.1f}px at ({star_x:.0f},{star_y:.0f})"
    )


if __name__ == "__main__":
    main()
