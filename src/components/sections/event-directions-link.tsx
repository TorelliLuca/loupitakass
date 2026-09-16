"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { eventMapsUrl, googleMapsDirectionsUrl } from "@/lib/maps-link";

type EventDirectionsLinkProps = {
  lat: number;
  lng: number;
  label: string;
  placeLabel?: string | null;
};

export function EventDirectionsLink({
  lat,
  lng,
  label,
  placeLabel,
}: EventDirectionsLinkProps) {
  const [href, setHref] = useState(() =>
    googleMapsDirectionsUrl({ lat, lng, label: placeLabel }),
  );

  useEffect(() => {
    setHref(eventMapsUrl({ lat, lng, label: placeLabel }));
  }, [lat, lng, placeLabel]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-brand-ink underline underline-offset-4"
    >
      <MapPin className="size-3.5 shrink-0 text-brand-brass" aria-hidden />
      {label}
    </a>
  );
}
