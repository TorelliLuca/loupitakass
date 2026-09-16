"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { BLOB_MAX_BYTES, deleteEventMedia, uploadEventMedia } from "@/lib/blob";
import { getDb } from "@/lib/db";
import { events, type EventStatus } from "@/lib/db/schema";
import { adminEventsRedirect } from "@/lib/admin/flash";
import {
  parseEventAutosaveData,
  parseEventFormData,
  type EventAutosaveValues,
  type EventFormValues,
} from "@/lib/validators/event";

export type EventActionState = {
  error?: string;
  success?: string;
};

export type AutosaveEventState = {
  error?: string;
  success?: boolean;
  updatedAt?: string;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

function nullish(value: string | undefined) {
  return value ?? null;
}

function toDbValues(data: EventFormValues | EventAutosaveValues) {
  const titleIt =
    "titleIt" in data && data.titleIt?.trim()
      ? data.titleIt.trim()
      : "Nuovo evento";

  return {
    eventDate: data.eventDate,
    eventTime: nullish(data.eventTime),
    venue: null,
    city: nullish(data.city),
    country: nullish(data.country),
    address: nullish(data.address),
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    ticketUrl: nullish(data.ticketUrl),
    titleIt,
    titleFr: nullish(data.titleFr),
    titleEn: nullish(data.titleEn),
    titleOc: nullish(data.titleOc),
    descriptionIt: nullish(data.descriptionIt),
    descriptionFr: nullish(data.descriptionFr),
    descriptionEn: nullish(data.descriptionEn),
    descriptionOc: nullish(data.descriptionOc),
    status: data.status as EventStatus,
    updatedAt: new Date(),
  };
}

async function resolveFlyerUrl(
  formData: FormData,
  currentUrl: string | null,
  removeFlyer?: boolean,
) {
  if (removeFlyer) {
    await deleteEventMedia(currentUrl);
    return null;
  }

  const file = formData.get("flyer");
  if (!(file instanceof File) || file.size === 0) {
    return currentUrl;
  }

  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("Il volantino deve essere un’immagine o un PDF.");
  }

  if (file.size > BLOB_MAX_BYTES) {
    throw new Error("Volantino troppo grande (max 4 MB).");
  }

  const blob = await uploadEventMedia(file);
  if (currentUrl && currentUrl !== blob.url) {
    await deleteEventMedia(currentUrl);
  }
  return blob.url;
}

function revalidateAdminEventPaths(eventId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/eventi");
  if (eventId) {
    revalidatePath(`/admin/eventi/${eventId}`);
  }
}

function revalidatePublicPaths() {
  revalidatePath("/");
  for (const locale of ["it", "fr", "en", "oc"]) {
    revalidatePath(`/${locale}`);
  }
}

function revalidatePublicAndAdmin(eventId?: string) {
  revalidateAdminEventPaths(eventId);
  revalidatePublicPaths();
}

export async function autosaveEventAction(
  eventId: string,
  formData: FormData,
): Promise<AutosaveEventState> {
  await requireAdmin();

  const parsed = parseEventAutosaveData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  try {
    const db = getDb();
    const [current] = await db
      .select({ flyerUrl: events.flyerUrl, status: events.status })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!current) {
      return { error: "Evento non trovato." };
    }

    const flyerUrl = await resolveFlyerUrl(
      formData,
      current.flyerUrl,
      parsed.data.removeFlyer,
    );

    const updatedAt = new Date();
    await db
      .update(events)
      .set({
        ...toDbValues(parsed.data),
        flyerUrl,
        updatedAt,
      })
      .where(eq(events.id, eventId));

    revalidateAdminEventPaths(eventId);
    const touchesPublic =
      current.status === "published" || parsed.data.status === "published";
    if (touchesPublic) {
      revalidatePublicPaths();
    }

    return { success: true, updatedAt: updatedAt.toISOString() };
  } catch (error) {
    console.error("[admin/events/autosave]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossibile salvare la bozza.",
    };
  }
}

export async function updateEventAction(
  eventId: string,
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  await requireAdmin();

  const parsed = parseEventFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  try {
    const db = getDb();
    const [current] = await db
      .select({ flyerUrl: events.flyerUrl, status: events.status })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!current) {
      return { error: "Evento non trovato." };
    }

    const flyerUrl = await resolveFlyerUrl(
      formData,
      current.flyerUrl,
      parsed.data.removeFlyer,
    );

    await db
      .update(events)
      .set({
        ...toDbValues(parsed.data),
        flyerUrl,
      })
      .where(eq(events.id, eventId));

    const touchesPublic =
      current.status === "published" || parsed.data.status === "published";
    if (touchesPublic) {
      revalidatePublicAndAdmin(eventId);
    } else {
      revalidateAdminEventPaths(eventId);
    }
  } catch (error) {
    console.error("[admin/events/update]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare l’evento.",
    };
  }

  redirect(adminEventsRedirect("updated"));
}

export async function deleteEventAction(eventId: string) {
  await requireAdmin();

  try {
    const db = getDb();
    const [current] = await db
      .select({ flyerUrl: events.flyerUrl, status: events.status })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    await db.delete(events).where(eq(events.id, eventId));
    await deleteEventMedia(current?.flyerUrl);

    if (current?.status === "published") {
      revalidatePublicAndAdmin();
    } else {
      revalidateAdminEventPaths();
    }
  } catch (error) {
    console.error("[admin/events/delete]", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossibile eliminare l’evento.",
    );
  }

  redirect(adminEventsRedirect("deleted"));
}
