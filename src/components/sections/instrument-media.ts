export type InstrumentKey =
  | "accordion"
  | "hurdyGurdy"
  | "flute"
  | "bass"
  | "guitar"
  | "drums";

function memberSlug(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Mapping membro → strumento dominante (slug nome, stabile tra demo e DB). */
export const memberInstrumentBySlug: Record<string, InstrumentKey> = {
  "luca-declementi": "accordion",
  "loris-giraudo": "hurdyGurdy",
  "anna-damiano": "flute",
  "daniele-mauro": "bass",
  "simone-pastorino": "guitar",
  "davide-bagnis": "drums",
};

/** Fallback per id demo (`m-luca`, …) se non c’è match per slug. */
export const memberInstrument: Record<string, InstrumentKey> = {
  "m-luca": "accordion",
  "m-loris": "hurdyGurdy",
  "m-anna": "flute",
  "m-daniele": "bass",
  "m-simone": "guitar",
  "m-davide": "drums",
};

export function resolveMemberInstrument(member: {
  id: string;
  firstName: string;
  lastName: string;
}): InstrumentKey | null {
  return (
    memberInstrumentBySlug[memberSlug(member.firstName, member.lastName)] ??
    memberInstrument[member.id] ??
    null
  );
}

/**
 * Dettagli strumento ritagliati dallo stesso shooting membri
 * (stesso stile luce/colore delle card).
 */
export const instrumentPhoto: Record<InstrumentKey, string> = {
  accordion: "/images/instruments/accordion.jpg",
  hurdyGurdy: "/images/instruments/hurdy-gurdy.jpg",
  flute: "/images/instruments/flute.jpg",
  bass: "/images/instruments/bass.jpg",
  guitar: "/images/instruments/guitar.jpg",
  drums: "/images/instruments/drums.jpg",
};

/** Icone grafiche minimal (silhouette nera + accenti, fondo trasparente). */
export const instrumentIcon: Record<InstrumentKey, string> = {
  accordion: "/images/instruments/icons/accordion.png",
  hurdyGurdy: "/images/instruments/icons/hurdy-gurdy.png",
  flute: "/images/instruments/icons/flute.png",
  bass: "/images/instruments/icons/bass.png",
  guitar: "/images/instruments/icons/guitar.png",
  drums: "/images/instruments/icons/drums.png",
};

/**
 * Layout filigrana per strumento.
 * I rientri testo sono sul lato icona (header più leggero, bio più stretto in basso).
 */
export type WatermarkLayout = {
  box: string;
  insetRight: string;
  insetLeft: string;
  /** Clearance testo → icona a destra / sinistra (header: ruolo + nome). */
  headerClearance: { right: string; left: string };
  /** Clearance testo → icona (bio, zona bassa dove la PNG è più presente). */
  bioClearance: { right: string; left: string };
  /** Allineamento dedicato (es. charleston: titolo a sx, bio a dx). */
  headerAlign?: "left" | "right";
  bioAlign?: "left" | "right";
};

const defaultWatermarkLayout: WatermarkLayout = {
  box: "h-[82%] w-[90%]",
  insetRight: "-right-[16%]",
  insetLeft: "-left-[16%]",
  headerClearance: { right: "pr-[36%]", left: "pl-[36%]" },
  bioClearance: { right: "pr-[40%]", left: "pl-[40%]" },
};

export const instrumentWatermarkLayout: Partial<
  Record<InstrumentKey, WatermarkLayout>
> = {
  /** Organetto: barre gialle larghe → bio rientra di più; PNG più a bordo destro. */
  accordion: {
    box: "h-[75%] w-[75%]",
    insetRight: "-right-[12%]",
    insetLeft: "-left-[12%]",
    headerClearance: { right: "pr-[40%]", left: "pl-[40%]" },
    bioClearance: { right: "pr-[50%]", left: "pl-[50%]" },
  },
  /**
   * Charleston: titolo sopra la PNG più a sinistra;
   * bio allineata allo strumento più a destra.
   */
  drums: {
    box: "h-[75%] w-[75%]",
    insetRight: "right-0",
    insetLeft: "left-0",
    headerAlign: "left",
    bioAlign: "right",
    headerClearance: { right: "pr-[28%] max-w-[58%]", left: "pl-0 pr-[38%] max-w-[58%]" },
    bioClearance: { right: "pr-0 pl-[62%]", left: "pl-[62%]" },
  },
};

export function resolveWatermarkLayout(
  instrument: InstrumentKey | null | undefined,
): WatermarkLayout {
  if (!instrument) return defaultWatermarkLayout;
  return instrumentWatermarkLayout[instrument] ?? defaultWatermarkLayout;
}
