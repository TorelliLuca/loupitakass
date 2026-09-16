import { z } from "zod";
import { EVENT_STATUSES } from "@/lib/db/schema";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url("URL non valido.").optional(),
);

const optionalCoord = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}, z.number().optional());

const eventStatusSchema = z.enum(EVENT_STATUSES);

const eventFieldsBase = {
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida."),
  eventTime: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{1,2}:\d{2}$/, "Ora non valida (es. 21:00).")
      .optional(),
  ),
  city: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  country: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  address: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  lat: optionalCoord,
  lng: optionalCoord,
  ticketUrl: optionalUrl,
  titleFr: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
  titleEn: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
  titleOc: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
  descriptionIt: z.preprocess(
    emptyToUndefined,
    z.string().max(8000).optional(),
  ),
  descriptionFr: z.preprocess(
    emptyToUndefined,
    z.string().max(8000).optional(),
  ),
  descriptionEn: z.preprocess(
    emptyToUndefined,
    z.string().max(8000).optional(),
  ),
  descriptionOc: z.preprocess(
    emptyToUndefined,
    z.string().max(8000).optional(),
  ),
  status: eventStatusSchema,
  removeFlyer: z.boolean().optional(),
};

/** Submit esplicito: titolo IT obbligatorio. */
export const eventFormSchema = z.object({
  ...eventFieldsBase,
  titleIt: z.string().trim().min(1, "Titolo IT obbligatorio.").max(255),
});

/**
 * Autosave: titolo può essere vuoto (si ripiega su "Nuovo evento" in action).
 * Status sempre presente nel form.
 */
export const eventAutosaveSchema = z.object({
  ...eventFieldsBase,
  titleIt: z.preprocess(
    emptyToUndefined,
    z.string().max(255).optional(),
  ),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
export type EventAutosaveValues = z.infer<typeof eventAutosaveSchema>;

function formDataToFields(formData: FormData) {
  const statusRaw = formData.get("status");
  const status =
    typeof statusRaw === "string" &&
    EVENT_STATUSES.includes(statusRaw as (typeof EVENT_STATUSES)[number])
      ? statusRaw
      : "draft";

  return {
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    city: formData.get("city"),
    country: formData.get("country"),
    address: formData.get("address"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    ticketUrl: formData.get("ticketUrl"),
    titleIt: formData.get("titleIt"),
    titleFr: formData.get("titleFr"),
    titleEn: formData.get("titleEn"),
    titleOc: formData.get("titleOc"),
    descriptionIt: formData.get("descriptionIt"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionOc: formData.get("descriptionOc"),
    status,
    removeFlyer: formData.get("removeFlyer") === "on",
  };
}

export function parseEventFormData(formData: FormData) {
  return eventFormSchema.safeParse(formDataToFields(formData));
}

export function parseEventAutosaveData(formData: FormData) {
  return eventAutosaveSchema.safeParse(formDataToFields(formData));
}
