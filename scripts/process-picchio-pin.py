"""Genera le varianti pin del picchio brand.

L'originale ha dorso VUOTO (trasparenza tra bianco/rosso).
Si preservano solo bianco, rosso e occhio; il buco interno
viene riempito di nero su entrambe le varianti.
  - picchio-rosso-pin.png  → dorso nero + accenti rossi (glyph gialli)
  - picchio-nero-pin.png   → dorso nero + accenti oro (glyph rossi)
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "images" / "brand"
SRC = BRAND / "picchio-brand-source.png"

GOLD = np.array([240, 196, 25], dtype=np.float32)
BLACK_DORSO = np.array([12, 12, 12], dtype=np.float32)


def _masks(arr: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    opaque = a > 10
    is_white = (lum > 180) & opaque
    is_red = (r > 80) & (r > g * 1.35) & (r > b * 1.35) & opaque
    is_dark = (lum < 55) & opaque & ~is_red
    return is_white, is_red, is_dark, opaque


def _eye_mask(is_white: np.ndarray, is_dark: np.ndarray) -> np.ndarray:
    """Occhio = piccola macchia scura a contatto col bianco."""
    h, w = is_dark.shape
    visited = np.zeros((h, w), dtype=bool)
    eye = np.zeros((h, w), dtype=bool)
    max_eye = max(80, int(0.002 * h * w))

    for y0, x0 in zip(*np.where(is_dark), strict=False):
        if visited[y0, x0]:
            continue
        touches_white = False
        comp: list[tuple[int, int]] = []
        q: deque[tuple[int, int]] = deque([(y0, x0)])
        visited[y0, x0] = True
        while q:
            y, x = q.popleft()
            comp.append((y, x))
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if not (0 <= ny < h and 0 <= nx < w):
                    continue
                if is_white[ny, nx]:
                    touches_white = True
                if is_dark[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
        if touches_white and len(comp) <= max_eye:
            for y, x in comp:
                eye[y, x] = True
    return eye


def _crown_mask(is_red: np.ndarray) -> np.ndarray:
    """Solo la corona rossa in alto (esclude le macchie coda)."""
    if not is_red.any():
        return is_red
    h, w = is_red.shape
    visited = np.zeros((h, w), dtype=bool)
    best: list[tuple[int, int]] | None = None
    best_top = 10**9
    for y0, x0 in zip(*np.where(is_red), strict=False):
        if visited[y0, x0]:
            continue
        comp: list[tuple[int, int]] = []
        q: deque[tuple[int, int]] = deque([(y0, x0)])
        visited[y0, x0] = True
        top = y0
        while q:
            y, x = q.popleft()
            comp.append((y, x))
            top = min(top, y)
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if not (0 <= ny < h and 0 <= nx < w):
                    continue
                if is_red[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
        # Preferisci la componente più in alto e abbastanza grande
        if len(comp) < 50:
            continue
        if top < best_top or (top == best_top and best is not None and len(comp) > len(best)):
            best_top = top
            best = comp
    out = np.zeros_like(is_red)
    if best:
        for y, x in best:
            out[y, x] = True
    return out


def _face_mask(is_white: np.ndarray, is_red: np.ndarray) -> np.ndarray:
    """Porzione di bianco vicino alla corona (= faccia, non tutto il petto)."""
    import cv2

    crown = _crown_mask(is_red)
    if not crown.any() or not is_white.any():
        return np.zeros_like(is_white)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51, 51))
    near_crown = cv2.dilate(crown.astype(np.uint8), kernel, iterations=2) > 0
    seeds = is_white & near_crown
    if not seeds.any():
        return np.zeros_like(is_white)

    ys_c, _ = np.where(crown)
    y_lim = int(ys_c.max() + max(40, 0.55 * (ys_c.max() - ys_c.min() + 1)))

    face = np.zeros_like(is_white)
    h, w = is_white.shape
    q: deque[tuple[int, int]] = deque()
    for y, x in zip(*np.where(seeds), strict=False):
        face[y, x] = True
        q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if not (0 <= ny < h and 0 <= nx < w):
                continue
            if ny > y_lim:
                continue
            if is_white[ny, nx] and not face[ny, nx]:
                face[ny, nx] = True
                q.append((ny, nx))
    return face


def _draw_beak(base: np.ndarray, is_white: np.ndarray, is_red: np.ndarray) -> None:
    """Disegna un becco nero a punta sulla parte alta della faccia (in-place)."""
    import cv2

    face = _face_mask(is_white, is_red)
    if not face.any():
        return

    fys, fxs = np.where(face)
    # Attacco in alto sulla faccia (zona occhio / fronte), non sul petto
    y_hi = int(np.percentile(fys, 8))
    y_lo = int(np.percentile(fys, 28))
    band = face.copy()
    band[:y_hi, :] = False
    band[y_lo:, :] = False
    if not band.any():
        band = face

    bys, bxs = np.where(band)
    xmin = int(bxs.min())
    y_mid = int(np.median(bys[bxs == xmin])) if np.any(bxs == xmin) else int(np.median(bys))

    length = 96
    half_w = 22
    tip = (max(0, xmin - length), max(0, y_mid - int(length * 0.5)))
    base_top = (xmin + 3, max(0, y_mid - half_w))
    base_bot = (xmin + 3, min(base.shape[0] - 1, y_mid + half_w))
    tri = np.array([tip, base_top, base_bot], dtype=np.int32)

    img = np.ascontiguousarray(base.astype(np.uint8))
    cv2.fillConvexPoly(img, tri, (12, 12, 12, 255))
    np.copyto(base, img.astype(base.dtype))


def build_bird(im: Image.Image, dorso_rgb: np.ndarray) -> Image.Image:
    """Bianco+rosso+occhio originali; dorso riempito; becco ridisegnato."""
    import cv2

    src = np.array(im.convert("RGBA"), dtype=np.float32)
    is_white, is_red, is_dark, _ = _masks(src)
    eye = _eye_mask(is_white, is_dark)
    keep_core = is_white | is_red | eye

    ys, xs = np.where(keep_core)
    pts = np.column_stack([xs, ys]).astype(np.int32)
    hull = cv2.convexHull(pts)
    sil = np.zeros(keep_core.shape, dtype=np.uint8)
    cv2.fillConvexPoly(sil, hull, 1)
    sil_bool = sil.astype(bool)

    base = np.zeros_like(src)
    base[keep_core] = src[keep_core]
    base[keep_core, 3] = np.maximum(base[keep_core, 3], 255)

    holes = sil_bool & ~keep_core
    base[holes, 0] = dorso_rgb[0]
    base[holes, 1] = dorso_rgb[1]
    base[holes, 2] = dorso_rgb[2]
    base[holes, 3] = 255

    # Becco per ultimo, così non viene coperto dal fill del dorso
    _draw_beak(base, is_white, is_red)

    out = Image.fromarray(base.astype(np.uint8), "RGBA")

    alpha = np.array(out)[:, :, 3]
    ys, xs = np.where(alpha > 10)
    pad = 20
    h, w = alpha.shape
    y0, y1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + 1 + pad)
    x0, x1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + 1 + pad)
    cropped = out.crop((x0, y0, x1, y1))
    side = max(cropped.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(
        cropped,
        ((side - cropped.size[0]) // 2, (side - cropped.size[1]) // 2),
        cropped,
    )
    return canvas


def recolor_red_accents(im: Image.Image, target_rgb: np.ndarray) -> Image.Image:
    arr = np.array(im.convert("RGBA"), dtype=np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    red_mask = (r > 80) & (r > g * 1.35) & (r > b * 1.35) & (a > 10)
    strength = np.clip(r / 255.0, 0, 1)
    for i, ch in enumerate(target_rgb):
        channel = arr[:, :, i]
        channel[red_mask] = ch * strength[red_mask]
        arr[:, :, i] = channel
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def save_pin(im: Image.Image, name: str, size: int = 256) -> None:
    path = BRAND / name
    im.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Sorgente mancante: {SRC}")

    src = Image.open(SRC)

    # Entrambi i glyph: dorso nero. Accenti rossi (gialli) / oro (rossi).
    dorso_nero = build_bird(src, BLACK_DORSO)
    save_pin(dorso_nero, "picchio-rosso-pin.png")

    nero = recolor_red_accents(dorso_nero, GOLD)
    save_pin(nero, "picchio-nero-pin.png")
    save_pin(nero, "picchio-giallo-pin.png")


if __name__ == "__main__":
    main()
