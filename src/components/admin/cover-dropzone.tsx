"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const radius = { borderRadius: "0.75rem" } as const;
const ACCEPT = "image/*";
const MAX_BYTES = 4 * 1024 * 1024;

type CoverDropzoneProps = {
  disabled?: boolean;
  currentUrl?: string | null;
  /** Nome input file (default `cover`) */
  inputName?: string;
  /** Nome checkbox rimozione (default `removeCover`) */
  removeName?: string;
  /** Etichetta breve, es. "Fronte" / "Retro" */
  label?: string;
  emptyHint?: string;
  currentLinkLabel?: string;
  removeLabel?: string;
};

export function CoverDropzone({
  disabled,
  currentUrl,
  inputName = "cover",
  removeName = "removeCover",
  label = "Cover",
  emptyHint = "Trascina l’immagine qui",
  currentLinkLabel = "Immagine attuale",
  removeLabel = "Rimuovi immagine attuale",
}: CoverDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function applyFile(next: File | null) {
    if (!next) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (!next.type.startsWith("image/")) {
      toast.error(`${label}: formato non valido, usa un’immagine.`);
      return;
    }
    if (next.size > MAX_BYTES) {
      toast.error(`${label}: file troppo grande (max 4 MB).`);
      return;
    }

    setFile(next);
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(next);
      inputRef.current.files = dt.files;
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0] ?? null;
    applyFile(dropped);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        name={inputName}
        type="file"
        accept={ACCEPT}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
      />

      <label
        htmlFor={inputId}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-4 py-8 text-center transition-colors",
          disabled && "pointer-events-none opacity-50",
          dragging
            ? "border-brand-brass bg-brand-brass/10"
            : "border-foreground/20 bg-muted/30 hover:border-brand-brass/60 hover:bg-muted/50",
        )}
        style={radius}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`Anteprima ${label}`}
            className="max-h-40 rounded-md object-contain"
          />
        ) : (
          <span
            className="flex size-12 items-center justify-center bg-background ring-1 ring-foreground/10"
            style={{ borderRadius: "0.75rem" }}
          >
            <Upload className="size-5 text-brand-ink" aria-hidden />
          </span>
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-ink">
            {file
              ? file.name
              : dragging
                ? "Rilascia il file qui"
                : emptyHint}
          </p>
          <p className="text-xs text-muted-foreground">
            oppure clicca · JPG/PNG/WebP · max 4 MB · le cover album vengono
            ottimizzate in automatico (~1400px)
          </p>
        </div>
      </label>

      {file ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => applyFile(null)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          <X className="size-3.5" aria-hidden />
          Rimuovi file selezionato
        </button>
      ) : null}

      {currentUrl && !file ? (
        <div className="space-y-2 text-sm">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-ink underline underline-offset-4"
          >
            {currentLinkLabel}
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt={currentLinkLabel}
            className="max-h-36 rounded-md object-contain ring-1 ring-foreground/10"
            style={radius}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name={removeName}
              disabled={disabled}
              className="size-4 accent-brand-ink"
            />
            {removeLabel}
          </label>
        </div>
      ) : null}
    </div>
  );
}
