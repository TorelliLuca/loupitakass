"""Stella occitana a 7 punte (geom. precisa) → SVG."""
from __future__ import annotations

import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public/images/brand/occitan-star.svg"


def main() -> None:
    cx, cy = 50.0, 50.0
    outer, inner = 48.0, 48.0 * 0.38
    pts: list[str] = []
    for i in range(14):
        ang = -math.pi / 2 + i * math.pi / 7
        rad = outer if i % 2 == 0 else inner
        x = cx + rad * math.cos(ang)
        y = cy + rad * math.sin(ang)
        pts.append(f"{x:.3f} {y:.3f}")

    d = "M " + " L ".join(pts) + " Z"
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#c4c4c4" shape-rendering="geometricPrecision" aria-hidden="true">
<title>Stella occitana</title>
<path d="{d}"/>
</svg>
"""
    OUT.write_text(svg, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
