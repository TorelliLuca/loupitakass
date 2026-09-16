/**
 * Capitoli e gallery della pagina «La nostra storia».
 * Copy i18n in messages → Story; qui solo asset e ordine.
 */

export const STORY_CHAPTER_IDS = [
  "origins",
  "sound",
  "road",
  "record",
  "today",
] as const;

export type StoryChapterId = (typeof STORY_CHAPTER_IDS)[number];

export const STORY_CHAPTERS: {
  id: StoryChapterId;
  image: string;
  /** Alternanza layout: immagine a sinistra o a destra su desktop. */
  imageSide: "left" | "right";
}[] = [
  {
    id: "origins",
    image: "/images/gallery/2025-orizzontale.jpg",
    imageSide: "right",
  },
  {
    id: "sound",
    image: "/images/gallery/foto-1.jpg",
    imageSide: "left",
  },
  {
    id: "road",
    image: "/images/gallery/foto-2.jpg",
    imageSide: "right",
  },
  {
    id: "record",
    image: "/images/gallery/fb-1200.jpg",
    imageSide: "left",
  },
  {
    id: "today",
    image: "/images/gallery/2025-verticale.jpg",
    imageSide: "right",
  },
];

export const STORY_GALLERY = [
  { id: "g1", src: "/images/gallery/foto-1.jpg", tile: "tall" },
  { id: "g2", src: "/images/gallery/foto-2.jpg", tile: "land" },
  { id: "g3", src: "/images/gallery/foto-3.jpg", tile: "land" },
  { id: "g6", src: "/images/gallery/2025-verticale.jpg", tile: "tall" },
  { id: "g5", src: "/images/gallery/2025-orizzontale.jpg", tile: "wide" },
  { id: "g4", src: "/images/gallery/foto-4.jpg", tile: "sq" },
  { id: "g7", src: "/images/gallery/ig-3x4.jpg", tile: "sq" },
  { id: "g8", src: "/images/gallery/ig-4x5.jpg", tile: "tall" },
  { id: "g9", src: "/images/gallery/fb-1200.jpg", tile: "wide" },
] as const;

export type StoryGalleryItem = (typeof STORY_GALLERY)[number];
export type StoryGalleryTile = StoryGalleryItem["tile"];
