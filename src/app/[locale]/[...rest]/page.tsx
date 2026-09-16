import { notFound } from "next/navigation";

/** Catch-all: forza la 404 localizzata per path sconosciuti sotto `[locale]`. */
export default function CatchAllPage() {
  notFound();
}
