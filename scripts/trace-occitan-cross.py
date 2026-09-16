"""Trace croce occitana → SVG grigio vettoriale (senza rettangolo di fondo)."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from potrace import Bitmap

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/albums/cover-fallback.webp"
OUT = ROOT / "public/images/brand/occitan-cross.svg"


def fmt(n: float) -> str:
    s = f"{n:.1f}".rstrip("0").rstrip(".")
    return s or "0"


def path_bbox(curve) -> tuple[float, float, float, float]:
    xs: list[float] = [curve.start_point.x]
    ys: list[float] = [curve.start_point.y]
    for segment in curve.segments:
        if segment.is_corner:
            xs += [segment.c.x, segment.end_point.x]
            ys += [segment.c.y, segment.end_point.y]
        else:
            xs += [segment.c1.x, segment.c2.x, segment.end_point.x]
            ys += [segment.c1.y, segment.c2.y, segment.end_point.y]
    return min(xs), min(ys), max(xs), max(ys)


def main() -> None:
    cf = Image.open(SRC).convert("RGBA")
    arr = np.array(cf)
    a = arr[:, :, 3].astype(np.float32)
    lum = arr[:, :, :3].astype(np.float32).mean(axis=2)
    ink = (a > 80) & (lum > 80)

    # Soft upsample → curve più fluide
    mask = Image.fromarray((ink.astype(np.uint8) * 255), mode="L")
    mask = mask.resize((2400, 2400), Image.Resampling.BILINEAR)
    ink2 = np.array(mask) > 140

    path = Bitmap(ink2).trace(
        turdsize=20,
        turnpolicy=1,
        alphamax=1.0,
        opticurve=True,
        opttolerance=0.4,
    )

    scale = 2400 / 800  # → viewBox 800
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" fill="#c4c4c4" fill-rule="evenodd" shape-rendering="geometricPrecision" aria-hidden="true">',
        "<title>Croce occitana</title>",
    ]

    kept = 0
    for curve in path:
        x0, y0, x1, y1 = path_bbox(curve)
        w, h = (x1 - x0) / scale, (y1 - y0) / scale
        if w > 780 and h > 780:
            continue

        start = curve.start_point
        d = [f"M {fmt(start.x / scale)} {fmt(start.y / scale)}"]
        for segment in curve.segments:
            if segment.is_corner:
                c, e = segment.c, segment.end_point
                d.append(
                    f"L {fmt(c.x / scale)} {fmt(c.y / scale)} "
                    f"L {fmt(e.x / scale)} {fmt(e.y / scale)}"
                )
            else:
                c1, c2, e = segment.c1, segment.c2, segment.end_point
                d.append(
                    f"C {fmt(c1.x / scale)} {fmt(c1.y / scale)} "
                    f"{fmt(c2.x / scale)} {fmt(c2.y / scale)} "
                    f"{fmt(e.x / scale)} {fmt(e.y / scale)}"
                )
        d.append("Z")
        parts.append(f'<path d="{" ".join(d)}"/>')
        kept += 1

    parts.append("</svg>")
    OUT.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({kept} paths, {OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
