/**
 * Picchio brand nei map pin (asset leggeri da `public/images/brand/`).
 * Gli SVG originali sono wrapper con PNG base64 enormi: qui usiamo le versioni pin.
 */
export function woodpeckerPinMarkup(
  variant: "rosso" | "giallo" | "nero",
  cx = 16,
  cy = 13,
  size = 20,
) {
  const href =
    variant === "rosso"
      ? "/images/brand/picchio-rosso-pin.png"
      : variant === "giallo"
        ? "/images/brand/picchio-giallo-pin.png"
        : "/images/brand/picchio-nero-pin.png";
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
