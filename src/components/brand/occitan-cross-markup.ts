/**
 * Crotz occitana (croce di Tolosa): croix clêchée, vidée et pommetée.
 * Ogni braccio termina a forchetta (3 punte) con 12 pommes.
 * Non è una croce greca / templare: le estremità sono allargate e biforcate.
 */
export function occitanCrossMarkup(
  color: string,
  cx = 16,
  cy = 13,
  size = 14,
) {
  const s = size / 24;
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  const r = 0.95 * s;

  const p = (px: number, py: number) =>
    `${(ox + px * s).toFixed(2)} ${(oy + py * s).toFixed(2)}`;

  const pomme = (px: number, py: number) =>
    `<circle cx="${(ox + px * s).toFixed(2)}" cy="${(oy + py * s).toFixed(2)}" r="${r.toFixed(2)}" fill="${color}" />`;

  /*
    Geometria 24×24, centro 12,12.
    Braccio nord: stelo stretto che si apre a forchetta a 3 punte
    (sinistra / centro / destra), poi simmetria per Est/Sud/Ovest.
    Il foro centrale rende la croce "vidée".
  */
  const outer = [
    // —— Nord: forchetta ——
    "M", p(10.6, 9.2),
    "L", p(10.6, 5.4),
    "L", p(8.05, 2.55), // punta SX
    "L", p(9.35, 1.55),
    "L", p(10.55, 3.35),
    "L", p(12, 1.15), // punta CENTRO
    "L", p(13.45, 3.35),
    "L", p(14.65, 1.55),
    "L", p(15.95, 2.55), // punta DX
    "L", p(13.4, 5.4),
    "L", p(13.4, 9.2),
    // —— Est: forchetta ——
    "L", p(14.8, 10.6),
    "L", p(18.6, 10.6),
    "L", p(21.45, 8.05),
    "L", p(22.45, 9.35),
    "L", p(20.65, 10.55),
    "L", p(22.85, 12),
    "L", p(20.65, 13.45),
    "L", p(22.45, 14.65),
    "L", p(21.45, 15.95),
    "L", p(18.6, 13.4),
    "L", p(14.8, 13.4),
    // —— Sud: forchetta ——
    "L", p(13.4, 14.8),
    "L", p(13.4, 18.6),
    "L", p(15.95, 21.45),
    "L", p(14.65, 22.45),
    "L", p(13.45, 20.65),
    "L", p(12, 22.85),
    "L", p(10.55, 20.65),
    "L", p(9.35, 22.45),
    "L", p(8.05, 21.45),
    "L", p(10.6, 18.6),
    "L", p(10.6, 14.8),
    // —— Ovest: forchetta ——
    "L", p(9.2, 13.4),
    "L", p(5.4, 13.4),
    "L", p(2.55, 15.95),
    "L", p(1.55, 14.65),
    "L", p(3.35, 13.45),
    "L", p(1.15, 12),
    "L", p(3.35, 10.55),
    "L", p(1.55, 9.35),
    "L", p(2.55, 8.05),
    "L", p(5.4, 10.6),
    "L", p(9.2, 10.6),
    "Z",
  ].join(" ");

  // Foro centrale (vidée)
  const hole = [
    "M", p(10.55, 10.55),
    "L", p(13.45, 10.55),
    "L", p(13.45, 13.45),
    "L", p(10.55, 13.45),
    "Z",
  ].join(" ");

  // 12 pommes sulle 12 punte della forchetta
  const pommes = [
    // Nord
    [8.05, 2.35],
    [12, 1.0],
    [15.95, 2.35],
    // Est
    [21.65, 8.05],
    [23.0, 12],
    [21.65, 15.95],
    // Sud
    [15.95, 21.65],
    [12, 23.0],
    [8.05, 21.65],
    // Ovest
    [2.35, 15.95],
    [1.0, 12],
    [2.35, 8.05],
  ];

  return `
    <g class="occitan-cross" aria-hidden="true">
      <path
        d="${outer} ${hole}"
        fill="${color}"
        fill-rule="evenodd"
      />
      ${pommes.map(([px, py]) => pomme(px, py)).join("")}
    </g>
  `;
}
