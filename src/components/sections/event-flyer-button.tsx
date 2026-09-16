"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EventFlyerButtonProps = {
  url: string;
  label: string;
  title: string;
};

function isPdf(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

export function EventFlyerButton({ url, label, title }: EventFlyerButtonProps) {
  const pdf = isPdf(url);

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer text-sm text-brand-ink underline underline-offset-4">
        {label}
      </DialogTrigger>
      <DialogContent
        className="max-h-[min(92vh,56rem)] w-full max-w-[min(92vw,42rem)] overflow-hidden p-3 sm:max-w-[min(92vw,42rem)]"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {pdf ? (
          <iframe
            src={url}
            title={title}
            className="h-[min(80vh,48rem)] w-full rounded-lg bg-brand-mist/40"
          />
        ) : (
          // URL Blob dinamica con dimensioni variabili: img nativa più adatta del componente Image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={title}
            className="mx-auto max-h-[min(80vh,48rem)] w-auto max-w-full object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
