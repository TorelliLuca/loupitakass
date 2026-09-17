import { woodpeckerPinMarkup } from "@/components/brand/woodpecker-pin-markup";

/** Palette bandiera occitana: rosso + oro. */
const RED = "#c8102e";
const RED_DEEP = "#8e0b1f";
const GOLD = "#f0c419";
const GOLD_DEEP = "#c9a227";

type MarkerOptions = {
  upcoming: boolean;
  label: string;
  animate: boolean;
  /** Numero di date nello stesso punto (>1 = badge conteggio). */
  count?: number;
  /** Ritardo CSS dell’animazione di drop (ms). */
  animationDelayMs?: number;
};

export function createEventMapMarker({
  upcoming,
  label,
  animate,
  count = 1,
  animationDelayMs = 0,
}: MarkerOptions) {
  const wrapper = document.createElement("div");
  wrapper.className = "event-map-marker-wrap";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "event-map-marker";
  button.setAttribute("aria-label", label);

  if (animate) {
    button.style.animationDelay = `${animationDelayMs}ms`;
    button.dataset.animate = "true";
  }

  // Pin + cerchio dello stesso colore; dorso nero su entrambi, accenti a contrasto
  const fill = upcoming ? GOLD : RED;
  const stroke = upcoming ? GOLD_DEEP : RED_DEEP;
  const disc = upcoming ? GOLD : RED;
  const bird = upcoming ? "rosso" : "nero";

  const badge =
    count > 1
      ? `<span class="event-map-marker__count" aria-hidden="true">${count}</span>`
      : "";

  button.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 40"
      width="44"
      height="55"
      aria-hidden="true"
      class="event-map-marker__svg"
      style="filter: drop-shadow(0 2px 3px rgba(26, 24, 20, 0.35))"
    >
      <path
        d="M16 1.5 C9.1 1.5 3.5 7.1 3.5 14 C3.5 21.5 16 38.5 16 38.5 C16 38.5 28.5 21.5 28.5 14 C28.5 7.1 22.9 1.5 16 1.5 Z"
        fill="${fill}"
        stroke="${stroke}"
        stroke-width="1.25"
      />
      <circle cx="16" cy="13" r="9.25" fill="${disc}" opacity="0.95" />
      ${woodpeckerPinMarkup(bird, 16, 13, 20)}
    </svg>
    ${badge}
  `;
  wrapper.appendChild(button);
  return wrapper;
}
