"use client";

import { Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  autosaveEventAction,
  type EventActionState,
} from "@/app/admin/actions/events";
import { EventLocationPicker } from "@/components/admin/event-location-picker";
import { FlyerDropzone } from "@/components/admin/flyer-dropzone";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToasts } from "@/hooks/use-action-toasts";
import { EVENT_STATUS_LABEL } from "@/lib/admin/event-status";
import { EVENT_STATUSES, type Event } from "@/lib/db/schema";

const radius = { borderRadius: "0.5rem" } as const;
const panelRadius = { borderRadius: "1rem" } as const;
const ease = [0.22, 1, 0.36, 1] as const;
const AUTOSAVE_MS = 900;

type AutosaveUi = "idle" | "saving" | "saved" | "error";

type EventFormProps = {
  event: Event;
  action: (
    prev: EventActionState,
    formData: FormData,
  ) => Promise<EventActionState>;
  submitLabel?: string;
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function FormSection({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} inView={false}>
      <section
        className="space-y-4 bg-card p-5 ring-1 ring-foreground/10"
        style={panelRadius}
      >
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          {title}
        </h2>
        {children}
      </section>
    </FadeIn>
  );
}

function formatSavedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function EventForm({
  event,
  action,
  submitLabel = "Salva e torna alla lista",
}: EventFormProps) {
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, formAction, pending] = useActionState(action, {});
  const [autosaveUi, setAutosaveUi] = useState<AutosaveUi>("idle");
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [, startAutosave] = useTransition();
  useActionToasts(state, pending);

  const runAutosave = useCallback(() => {
    const form = formRef.current;
    if (!form || pending) return;

    const formData = new FormData(form);
    setAutosaveUi("saving");
    setAutosaveError(null);

    startAutosave(async () => {
      const result = await autosaveEventAction(event.id, formData);
      if (result.error) {
        setAutosaveUi("error");
        setAutosaveError(result.error);
        return;
      }
      setAutosaveUi("saved");
      if (result.updatedAt) setSavedAt(result.updatedAt);
    });
  }, [event.id, pending, startAutosave]);

  const scheduleAutosave = useCallback(() => {
    if (pending) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runAutosave, AUTOSAVE_MS);
  }, [pending, runAutosave]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const onChange = () => scheduleAutosave();
    form.addEventListener("input", onChange);
    form.addEventListener("change", onChange);
    return () => {
      form.removeEventListener("input", onChange);
      form.removeEventListener("change", onChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleAutosave]);

  const autosaveLabel =
    autosaveUi === "saving"
      ? "Salvataggio…"
      : autosaveUi === "error"
        ? autosaveError ?? "Errore salvataggio"
        : autosaveUi === "saved" && savedAt
          ? `Salvato alle ${formatSavedAt(savedAt)}`
          : "Le modifiche si salvano automaticamente";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-8"
      aria-busy={pending}
    >
      <p
        className={`text-sm ${autosaveUi === "error" ? "text-destructive" : "text-muted-foreground"}`}
        aria-live="polite"
      >
        {autosaveLabel}
      </p>

      <FormSection title="Data e orario" delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data *" htmlFor="eventDate">
            <Input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              defaultValue={event.eventDate}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Ora" htmlFor="eventTime">
            <Input
              id="eventTime"
              name="eventTime"
              type="time"
              defaultValue={event.eventTime ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="URL biglietti" htmlFor="ticketUrl">
              <Input
                id="ticketUrl"
                name="ticketUrl"
                type="url"
                placeholder="https://"
                defaultValue={event.ticketUrl ?? ""}
                disabled={pending}
                className="h-10"
                style={radius}
              />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection title="Luogo" delay={0.08}>
        <EventLocationPicker
          disabled={pending}
          onLocationChange={scheduleAutosave}
          initial={{
            address: event.address ?? "",
            city: event.city ?? "",
            country: event.country ?? "",
            lat: event.lat ?? null,
            lng: event.lng ?? null,
          }}
        />
      </FormSection>

      <FormSection title="Titoli (i18n)" delay={0.11}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titolo IT *" htmlFor="titleIt">
            <Input
              id="titleIt"
              name="titleIt"
              required
              defaultValue={event.titleIt}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Titolo FR" htmlFor="titleFr">
            <Input
              id="titleFr"
              name="titleFr"
              defaultValue={event.titleFr ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Titolo EN" htmlFor="titleEn">
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={event.titleEn ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Titolo OC" htmlFor="titleOc">
            <Input
              id="titleOc"
              name="titleOc"
              defaultValue={event.titleOc ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Descrizioni" delay={0.14}>
        <div className="grid gap-4">
          <Field label="Descrizione IT" htmlFor="descriptionIt">
            <Textarea
              id="descriptionIt"
              name="descriptionIt"
              rows={3}
              defaultValue={event.descriptionIt ?? ""}
              disabled={pending}
              style={radius}
            />
          </Field>
          <Field label="Descrizione FR" htmlFor="descriptionFr">
            <Textarea
              id="descriptionFr"
              name="descriptionFr"
              rows={3}
              defaultValue={event.descriptionFr ?? ""}
              disabled={pending}
              style={radius}
            />
          </Field>
          <Field label="Descrizione EN" htmlFor="descriptionEn">
            <Textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={3}
              defaultValue={event.descriptionEn ?? ""}
              disabled={pending}
              style={radius}
            />
          </Field>
          <Field label="Descrizione OC" htmlFor="descriptionOc">
            <Textarea
              id="descriptionOc"
              name="descriptionOc"
              rows={3}
              defaultValue={event.descriptionOc ?? ""}
              disabled={pending}
              style={radius}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Media e stato" delay={0.17}>
        <div className="space-y-2">
          <Label>Volantino</Label>
          <FlyerDropzone disabled={pending} currentUrl={event.flyerUrl} />
        </div>
        <Field label="Stato" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={
              EVENT_STATUSES.includes(
                event.status as (typeof EVENT_STATUSES)[number],
              )
                ? event.status
                : "draft"
            }
            disabled={pending}
            className="flex h-10 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            style={radius}
          >
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {EVENT_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-muted-foreground">
          Solo «Pubblicato» è visibile sul sito. Le bozze restano nascoste.
        </p>
      </FormSection>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease }}
      >
        <Button
          type="submit"
          className="h-10 px-6"
          style={radius}
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Salvataggio…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </motion.div>
    </form>
  );
}
