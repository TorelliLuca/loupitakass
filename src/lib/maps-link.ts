/** Preferisce Mappe Apple su iOS / Safari macOS; altrimenti Google Maps. */
export function prefersAppleMaps(userAgent: string): boolean {
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isMacSafari =
    /Macintosh/i.test(userAgent) &&
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(userAgent);
  return isIOS || isMacSafari;
}

type MapsLinkOptions = {
  lat: number;
  lng: number;
  /** Etichetta luogo (venue / città). */
  label?: string | null;
};

/** Google Maps: percorso verso destinazione (partenza = posizione attuale). */
export function googleMapsDirectionsUrl({
  lat,
  lng,
}: MapsLinkOptions): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}`;
}

/** Apple Maps: percorso verso destinazione (senza saddr = posizione attuale). */
export function appleMapsDirectionsUrl({
  lat,
  lng,
  label,
}: MapsLinkOptions): string {
  const daddr = label?.trim() || `${lat},${lng}`;
  return `https://maps.apple.com/?daddr=${encodeURIComponent(daddr)}&ll=${lat},${lng}&dirflg=d`;
}

/** URL indicazioni verso l’evento (client-only: richiede `navigator`). */
export function eventMapsUrl(options: MapsLinkOptions): string {
  if (prefersAppleMaps(navigator.userAgent)) {
    return appleMapsDirectionsUrl(options);
  }
  return googleMapsDirectionsUrl(options);
}
