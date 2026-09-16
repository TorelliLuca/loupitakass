import { z } from "zod";
import { parseDurationInput } from "@/lib/duration";
import { ALBUM_RELEASE_TYPES, ALBUM_STATUSES } from "@/lib/db/schema";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url("URL non valido.").optional(),
);

const optionalInt = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : value;
}, z.number().int().optional());

/** Durata opzionale: mm:ss oppure secondi. null = rimuovi/vuoto. */
const optionalDurationSec = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseDurationInput(value);
  if (parsed === null) return null;
  if (parsed === undefined) return value;
  return parsed;
}, z.number().int().min(0).max(86400).nullable());

const albumStatusSchema = z.enum(ALBUM_STATUSES);
const albumReleaseTypeSchema = z.enum(ALBUM_RELEASE_TYPES);

const albumFieldsBase = {
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida."),
  releaseType: albumReleaseTypeSchema,
  sortOrder: optionalInt,
  durationSec: optionalDurationSec,
  titleFr: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
  titleEn: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
  titleOc: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
  spotifyUrl: optionalUrl,
  appleMusicUrl: optionalUrl,
  youtubeMusicUrl: optionalUrl,
  bandcampUrl: optionalUrl,
  deezerUrl: optionalUrl,
  tidalUrl: optionalUrl,
  amazonMusicUrl: optionalUrl,
  status: albumStatusSchema,
  removeCover: z.boolean().optional(),
  removeCoverBack: z.boolean().optional(),
  removeDisc: z.boolean().optional(),
};

/** Submit esplicito: titolo IT obbligatorio. */
export const albumFormSchema = z.object({
  ...albumFieldsBase,
  titleIt: z.string().trim().min(1, "Titolo IT obbligatorio.").max(255),
});

/**
 * Autosave: titolo può essere vuoto (si ripiega su "Nuovo album" in action).
 * Status sempre presente nel form.
 */
export const albumAutosaveSchema = z.object({
  ...albumFieldsBase,
  titleIt: z.preprocess(
    emptyToUndefined,
    z.string().max(255).optional(),
  ),
});

export type AlbumFormValues = z.infer<typeof albumFormSchema>;
export type AlbumAutosaveValues = z.infer<typeof albumAutosaveSchema>;

function formDataToFields(formData: FormData) {
  const statusRaw = formData.get("status");
  const status =
    typeof statusRaw === "string" &&
    ALBUM_STATUSES.includes(statusRaw as (typeof ALBUM_STATUSES)[number])
      ? statusRaw
      : "draft";

  const typeRaw = formData.get("releaseType");
  const releaseType =
    typeof typeRaw === "string" &&
    ALBUM_RELEASE_TYPES.includes(
      typeRaw as (typeof ALBUM_RELEASE_TYPES)[number],
    )
      ? typeRaw
      : "album";

  return {
    releaseDate: formData.get("releaseDate"),
    releaseType,
    sortOrder: formData.get("sortOrder"),
    durationSec: formData.get("duration"),
    titleIt: formData.get("titleIt"),
    titleFr: formData.get("titleFr"),
    titleEn: formData.get("titleEn"),
    titleOc: formData.get("titleOc"),
    spotifyUrl: formData.get("spotifyUrl"),
    appleMusicUrl: formData.get("appleMusicUrl"),
    youtubeMusicUrl: formData.get("youtubeMusicUrl"),
    bandcampUrl: formData.get("bandcampUrl"),
    deezerUrl: formData.get("deezerUrl"),
    tidalUrl: formData.get("tidalUrl"),
    amazonMusicUrl: formData.get("amazonMusicUrl"),
    status,
    removeCover: formData.get("removeCover") === "on",
    removeCoverBack: formData.get("removeCoverBack") === "on",
    removeDisc: formData.get("removeDisc") === "on",
  };
}

export function parseAlbumFormData(formData: FormData) {
  return albumFormSchema.safeParse(formDataToFields(formData));
}

export function parseAlbumAutosaveData(formData: FormData) {
  return albumAutosaveSchema.safeParse(formDataToFields(formData));
}
