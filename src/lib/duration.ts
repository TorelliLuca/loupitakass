/**
 * Parse durata da input admin: "3:45", "3.45" no, "225", "3m45s" semplice.
 * Ritorna secondi interi o undefined se vuoto.
 */
export function parseDurationInput(raw: unknown): number | undefined | null {
  if (raw === null) return null;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  if (/^\d+$/.test(trimmed)) {
    const sec = Number(trimmed);
    if (!Number.isFinite(sec) || sec < 0 || sec > 24 * 60 * 60) {
      return undefined;
    }
    return Math.trunc(sec);
  }

  const mmss = trimmed.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (mmss) {
    const minutes = Number(mmss[1]);
    const seconds = Number(mmss[2]);
    const total = minutes * 60 + seconds;
    if (total > 24 * 60 * 60) return undefined;
    return total;
  }

  return undefined;
}

/** Formatta secondi come m:ss (es. 225 → "3:45"). */
export function formatDurationSec(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return "";
  const total = Math.trunc(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
