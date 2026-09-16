import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ParsedEventRow = {
  eventDate: string;
  address: string;
  titleIt: string;
  lat: number;
  lng: number;
  line: number;
};

type CsvField = "data" | "luogo" | "lat" | "lng" | "titolo";

const REQUIRED_HEADERS: CsvField[] = ["data", "luogo", "lat", "lng"];

const HEADER_ALIASES: Record<CsvField, string[]> = {
  data: ["data", "date", "event_date", "giorno"],
  luogo: ["luogo", "place", "venue", "address", "indirizzo", "location"],
  lat: ["lat", "latitude", "latitudine"],
  lng: ["lng", "lon", "long", "longitude", "longitudine"],
  titolo: ["titolo", "title", "title_it", "nome", "name"],
};

export function getDbUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DB_DATABASE_URL ??
    process.env.DB_POSTGRES_URL
  );
}

export function parseCliArgs(argv: string[]) {
  const flags = new Set(
    argv.filter((a) => a.startsWith("-")).map((a) => a.toLowerCase()),
  );
  const positionals = argv.filter((a) => !a.startsWith("-"));
  const checkWord =
    positionals[0]?.toLowerCase() === "check" ||
    positionals[0]?.toLowerCase() === "dry-run";
  const filePath = checkWord ? positionals[1] : positionals[0];
  const dryRun =
    checkWord ||
    flags.has("--check") ||
    flags.has("--dry-run") ||
    flags.has("-n") ||
    process.env.DRY_RUN === "1" ||
    process.env.DRY_RUN === "true";
  const help = flags.has("--help") || flags.has("-h");
  return { dryRun, help, filePath };
}

function detectDelimiter(text: string): "," | ";" {
  const firstLine = text.split("\n")[0] ?? "";
  if (firstLine.includes(";")) return ";";
  return ",";
}

function parseCsv(text: string): string[][] {
  const normalized = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const delimiter = detectDelimiter(normalized);

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell.trim());
    cell = "";
  };
  const pushRow = () => {
    if (row.some((c) => c.length > 0)) rows.push(row);
    row = [];
  };

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]!;
    const next = normalized[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        continue;
      }
      cell += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      pushCell();
      continue;
    }
    if (ch === "\n") {
      pushCell();
      pushRow();
      continue;
    }
    cell += ch;
  }

  pushCell();
  pushRow();
  return rows;
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

function mapHeaders(
  headerRow: string[],
): Partial<Record<CsvField, number>> &
  Record<"data" | "luogo" | "lat" | "lng", number> {
  const normalized = headerRow.map(normalizeHeader);
  const indexes: Partial<Record<CsvField, number>> = {};

  for (const key of Object.keys(HEADER_ALIASES) as CsvField[]) {
    const idx = normalized.findIndex((h) => HEADER_ALIASES[key].includes(h));
    if (idx >= 0) indexes[key] = idx;
  }

  for (const key of REQUIRED_HEADERS) {
    if (indexes[key] == null) {
      throw new Error(
        `Header CSV mancante: "${key}" (alias: ${HEADER_ALIASES[key].join(", ")}). Trovati: ${headerRow.join(", ")}`,
      );
    }
  }

  return indexes as Partial<Record<CsvField, number>> &
    Record<"data" | "luogo" | "lat" | "lng", number>;
}

function parseDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(value);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = dmy[3]!;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  return null;
}

function parseCoord(raw: string, kind: "lat" | "lng"): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  if (kind === "lat" && (n < -90 || n > 90)) return null;
  if (kind === "lng" && (n < -180 || n > 180)) return null;
  return n;
}

function truncateTitle(value: string) {
  return value.length > 255 ? value.slice(0, 255) : value;
}

/** Legge il CSV eventi (stesso formato di import/delete). */
export function parseEventCsvRows(filePath: string): ParsedEventRow[] {
  const absolute = resolve(process.cwd(), filePath);
  const text = readFileSync(absolute, "utf8");
  const matrix = parseCsv(text);
  if (matrix.length < 2) {
    throw new Error("CSV vuoto o senza righe dati.");
  }

  const [header, ...body] = matrix;
  const indexes = mapHeaders(header!);
  const parsed: ParsedEventRow[] = [];
  const errors: string[] = [];

  body.forEach((cells, i) => {
    const line = i + 2;
    const data = cells[indexes.data] ?? "";
    const luogo = (cells[indexes.luogo] ?? "").trim();
    const titolo =
      indexes.titolo != null ? (cells[indexes.titolo] ?? "").trim() : "";
    const latRaw = cells[indexes.lat] ?? "";
    const lngRaw = cells[indexes.lng] ?? "";

    if (!data && !luogo && !titolo && !latRaw && !lngRaw) return;

    const eventDate = parseDate(data);
    const lat = parseCoord(latRaw, "lat");
    const lng = parseCoord(lngRaw, "lng");

    if (!eventDate) {
      errors.push(`riga ${line}: data non valida "${data}" (atteso DD/MM/YYYY)`);
      return;
    }
    if (!luogo) {
      errors.push(`riga ${line}: luogo mancante`);
      return;
    }
    if (lat == null) {
      errors.push(`riga ${line}: lat non valida "${latRaw}"`);
      return;
    }
    if (lng == null) {
      errors.push(`riga ${line}: lng non valida "${lngRaw}"`);
      return;
    }

    parsed.push({
      eventDate,
      address: luogo,
      titleIt: truncateTitle(titolo || luogo),
      lat,
      lng,
      line,
    });
  });

  if (errors.length > 0) {
    throw new Error(`CSV non valido:\n- ${errors.join("\n- ")}`);
  }

  return parsed;
}
