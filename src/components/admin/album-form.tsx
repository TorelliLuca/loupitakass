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
  autosaveAlbumAction,
  type AlbumActionState,
} from "@/app/admin/actions/albums";
import { CoverDropzone } from "@/components/admin/cover-dropzone";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToasts } from "@/hooks/use-action-toasts";
import {
  ALBUM_RELEASE_TYPE_LABEL,
  getAlbumReleaseType,
} from "@/lib/admin/album-release-type";
import { ALBUM_STATUS_LABEL } from "@/lib/admin/album-status";
import {
  ALBUM_RELEASE_TYPES,
  ALBUM_STATUSES,
  type Album,
  type AlbumReleaseType,
} from "@/lib/db/schema";
import { formatDurationSec } from "@/lib/duration";
import { toast } from "sonner";

const radius = { borderRadius: "0.5rem" } as const;
const panelRadius = { borderRadius: "1rem" } as const;
const ease = [0.22, 1, 0.36, 1] as const;
const AUTOSAVE_MS = 900;

type AutosaveUi = "idle" | "saving" | "saved" | "error";

type AlbumFormProps = {
  album: Album;
  action: (
    prev: AlbumActionState,
    formData: FormData,
  ) => Promise<AlbumActionState>;
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

export function AlbumForm({
  album,
  action,
  submitLabel = "Salva e torna alla lista",
}: AlbumFormProps) {
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, formAction, pending] = useActionState(action, {});
  const [autosaveUi, setAutosaveUi] = useState<AutosaveUi>("idle");
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [releaseType, setReleaseType] = useState<AlbumReleaseType>(() =>
    getAlbumReleaseType(album),
  );
  const [, startAutosave] = useTransition();
  useActionToasts(state, pending);
  const isSingle = releaseType === "single";

  const runAutosave = useCallback(() => {
    const form = formRef.current;
    if (!form || pending) return;

    const formData = new FormData(form);
    setAutosaveUi("saving");
    setAutosaveError(null);

    startAutosave(async () => {
      const result = await autosaveAlbumAction(album.id, formData);
      if (result.error) {
        setAutosaveUi("error");
        setAutosaveError(result.error);
        toast.error(result.error);
        return;
      }
      setAutosaveUi("saved");
      if (result.updatedAt) setSavedAt(result.updatedAt);
    });
  }, [album.id, pending, startAutosave]);

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

      <FormSection title="Uscita" delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo *" htmlFor="releaseType">
            <select
              id="releaseType"
              name="releaseType"
              value={releaseType}
              onChange={(e) =>
                setReleaseType(e.target.value as AlbumReleaseType)
              }
              disabled={pending}
              className="flex h-10 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              style={radius}
            >
              {ALBUM_RELEASE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ALBUM_RELEASE_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data di uscita *" htmlFor="releaseDate">
            <Input
              id="releaseDate"
              name="releaseDate"
              type="date"
              required
              defaultValue={album.releaseDate}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Ordine" htmlFor="sortOrder">
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              step={1}
              defaultValue={album.sortOrder}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          {isSingle ? (
            <Field label="Durata" htmlFor="duration">
              <Input
                id="duration"
                name="duration"
                placeholder="3:45"
                defaultValue={
                  album.durationSec != null
                    ? formatDurationSec(album.durationSec)
                    : ""
                }
                disabled={pending}
                className="h-10"
                style={radius}
              />
            </Field>
          ) : (
            <input
              type="hidden"
              name="duration"
              value={
                album.durationSec != null
                  ? formatDurationSec(album.durationSec)
                  : ""
              }
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Ordine in vetrina: numeri più bassi prima (es. album 1, singoli 2…).{" "}
          {isSingle
            ? "Singolo: copertina + inserto in hover. Durata in mm:ss (es. 3:45)."
            : "Album: cover fronte/retro e immagine disco che esce dalla sleeve."}
        </p>
      </FormSection>

      <FormSection title="Titoli (i18n)" delay={0.08}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titolo IT *" htmlFor="titleIt">
            <Input
              id="titleIt"
              name="titleIt"
              required
              defaultValue={album.titleIt}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Titolo FR" htmlFor="titleFr">
            <Input
              id="titleFr"
              name="titleFr"
              defaultValue={album.titleFr ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Titolo EN" htmlFor="titleEn">
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={album.titleEn ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Titolo OC" htmlFor="titleOc">
            <Input
              id="titleOc"
              name="titleOc"
              defaultValue={album.titleOc ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Piattaforme" delay={0.11}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Spotify" htmlFor="spotifyUrl">
            <Input
              id="spotifyUrl"
              name="spotifyUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.spotifyUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Apple Music" htmlFor="appleMusicUrl">
            <Input
              id="appleMusicUrl"
              name="appleMusicUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.appleMusicUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="YouTube Music" htmlFor="youtubeMusicUrl">
            <Input
              id="youtubeMusicUrl"
              name="youtubeMusicUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.youtubeMusicUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Bandcamp" htmlFor="bandcampUrl">
            <Input
              id="bandcampUrl"
              name="bandcampUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.bandcampUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Deezer" htmlFor="deezerUrl">
            <Input
              id="deezerUrl"
              name="deezerUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.deezerUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Tidal" htmlFor="tidalUrl">
            <Input
              id="tidalUrl"
              name="tidalUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.tidalUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
          <Field label="Amazon Music" htmlFor="amazonMusicUrl">
            <Input
              id="amazonMusicUrl"
              name="amazonMusicUrl"
              type="url"
              placeholder="https://"
              defaultValue={album.amazonMusicUrl ?? ""}
              disabled={pending}
              className="h-10"
              style={radius}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Media e stato" delay={0.14}>
        <div
          className={
            isSingle
              ? "grid gap-6 sm:grid-cols-1 sm:max-w-md"
              : "grid gap-6 sm:grid-cols-2"
          }
        >
          <div className="space-y-2">
            <Label>{isSingle ? "Copertina" : "Fronte"}</Label>
            <CoverDropzone
              disabled={pending}
              currentUrl={album.coverUrl}
              inputName="cover"
              removeName="removeCover"
              label={isSingle ? "Copertina" : "Fronte"}
              emptyHint={
                isSingle
                  ? "Trascina la copertina qui"
                  : "Trascina il fronte qui"
              }
              currentLinkLabel={
                isSingle ? "Copertina attuale" : "Fronte attuale"
              }
              removeLabel={
                isSingle
                  ? "Rimuovi copertina attuale"
                  : "Rimuovi fronte attuale"
              }
            />
          </div>
          {!isSingle ? (
            <>
              <div className="space-y-2">
                <Label>Retro</Label>
                <CoverDropzone
                  disabled={pending}
                  currentUrl={album.coverBackUrl}
                  inputName="coverBack"
                  removeName="removeCoverBack"
                  label="Retro"
                  emptyHint="Trascina il retro qui"
                  currentLinkLabel="Retro attuale"
                  removeLabel="Rimuovi retro attuale"
                />
              </div>
              <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                <Label>Disco (vinile / CD)</Label>
                <CoverDropzone
                  disabled={pending}
                  currentUrl={album.discUrl}
                  inputName="disc"
                  removeName="removeDisc"
                  label="Disco"
                  emptyHint="Trascina il disco qui (PNG/WebP con trasparenza)"
                  currentLinkLabel="Disco attuale"
                  removeLabel="Rimuovi disco attuale"
                />
                <p className="text-xs text-muted-foreground">
                  Ideale: PNG o WebP quadrato con fondo trasparente. Niente PDF.
                  Senza file resta il disco CSS di default.
                </p>
              </div>
            </>
          ) : null}
        </div>
        <Field label="Stato" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={
              ALBUM_STATUSES.includes(
                album.status as (typeof ALBUM_STATUSES)[number],
              )
                ? album.status
                : "draft"
            }
            disabled={pending}
            className="flex h-10 w-full border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            style={radius}
          >
            {ALBUM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ALBUM_STATUS_LABEL[status]}
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
