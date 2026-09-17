/**
 * Picchio brand nei map pin (`public/images/brand/picchio-*-pin.png`).
 * - `rosso`: dorso nero + accenti rossi (glyph gialli)
 * - `nero` / `giallo`: dorso nero + accenti oro (glyph rossi)
 * Rigenera con `python scripts/process-picchio-pin.py`.
 */
export function woodpeckerPinMarkup(
  variant: "rosso" | "giallo" | "nero",
  cx = 16,
  cy = 13,
  size = 20,
) {
  // ?v= bust cache browser dopo cambio asset
  const href =
    variant === "rosso"
      ? "/images/brand/picchio-rosso-pin.png?v=18"
      : variant === "giallo"
        ? "/images/brand/picchio-giallo-pin.png?v=18"
        : "/images/brand/picchio-nero-pin.png?v=18";
  const x = (cx - size / 2).toFixed(2);
  const y = (cy - size / 2).toFixed(2);

  return `
    <image
      class="woodpecker-pin"
      href="${href}"
      x="${x}"
      y="${y}"
      width="${size}"
      height="${size}"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    />
  `;
}
