export type InstrumentKey =
  | "accordion"
  | "hurdyGurdy"
  | "flute"
  | "bass"
  | "guitar"
  | "drums";

/** Mapping demo: id membro → strumento dominante. */
export const memberInstrument: Record<string, InstrumentKey> = {
  "m-luca": "accordion",
  "m-loris": "hurdyGurdy",
  "m-anna": "flute",
  "m-daniele": "bass",
  "m-simone": "guitar",
  "m-davide": "drums",
};

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
