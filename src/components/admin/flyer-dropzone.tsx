"use client";

import { FileImage, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const radius = { borderRadius: "0.75rem" } as const;
const ACCEPT = "image/*,application/pdf";
const MAX_BYTES = 4 * 1024 * 1024;

type FlyerDropzoneProps = {
  disabled?: boolean;
  currentUrl?: string | null;
};

export function FlyerDropzone({ disabled, currentUrl }: FlyerDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    if (!next) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const okType =
      next.type.startsWith("image/") || next.type === "application/pdf";
    if (!okType) {
      setError("Formato non valido: usa un’immagine o un PDF.");
      return;
    }
    if (next.size > MAX_BYTES) {
          setError("File troppo grande (max 4 MB).");
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
        name="flyer"
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
            alt="Anteprima volantino"
            className="max-h-40 rounded-md object-contain"
          />
        ) : (
          <span className="flex size-12 items-center justify-center bg-background ring-1 ring-foreground/10"
            style={{ borderRadius: "0.75rem" }}
          >
            {file?.type === "application/pdf" ? (
              <FileImage className="size-5 text-brand-ink" aria-hidden />
            ) : (
              <Upload className="size-5 text-brand-ink" aria-hidden />
            )}
          </span>
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-ink">
            {file
              ? file.name
              : dragging
                ? "Rilascia il file qui"
                : "Trascina il volantino qui"}
          </p>
          <p className="text-xs text-muted-foreground">
            oppure clicca per selezionare · JPG, PNG, WebP o PDF · max 4 MB
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

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {currentUrl && !file ? (
        <div className="space-y-2 text-sm">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-ink underline underline-offset-4"
          >
            Volantino attuale
          </a>
          {/\.(png|jpe?g|webp|gif)(\?|$)/i.test(currentUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt="Volantino attuale"
              className="max-h-36 rounded-md object-contain ring-1 ring-foreground/10"
              style={radius}
            />
          ) : null}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="removeFlyer"
              disabled={disabled}
              className="size-4 accent-brand-ink"
            />
            Rimuovi volantino attuale
          </label>
        </div>
      ) : null}
    </div>
  );
}
