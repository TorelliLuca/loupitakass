import sharp from "sharp";
import { del, put } from "@vercel/blob";

/** Max per file in ingresso; body Server Action fino a 8 MB (vedi next.config). */
const MAX_BYTES = 4 * 1024 * 1024;

/** Lato max cover album sul sito (griglia ~300–400px, retina ~800). */
const ALBUM_MAX_EDGE = 1400;
const ALBUM_JPEG_QUALITY = 82;

function assertBlobConfigured() {
  const hasRw = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasOidc =
    Boolean(process.env.BLOB_STORE_ID) &&
    Boolean(process.env.VERCEL_OIDC_TOKEN);
  if (!hasRw && !hasOidc) {
    throw new Error(
      "Vercel Blob non configurato: manca BLOB_READ_WRITE_TOKEN oppure BLOB_STORE_ID + VERCEL_OIDC_TOKEN. Esegui `vercel env pull`.",
    );
  }
}

/** Ridimensiona/comprimi cover album (JPEG) per caricamento veloce in vetrina. */
async function optimizeAlbumCover(file: File): Promise<{
  body: Buffer;
  contentType: string;
  ext: string;
}> {
  const input = Buffer.from(await file.arrayBuffer());
  const body = await sharp(input)
    .rotate()
    .resize(ALBUM_MAX_EDGE, ALBUM_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: ALBUM_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return { body, contentType: "image/jpeg", ext: "jpg" };
}

/**
 * Disco/vinile: WebP con alpha (PNG/SVG in ingresso).
 * JPEG distruggerebbe la trasparenza del foro/bordo.
 */
async function optimizeAlbumDisc(file: File): Promise<{
  body: Buffer;
  contentType: string;
  ext: string;
}> {
  const input = Buffer.from(await file.arrayBuffer());
  const body = await sharp(input)
    .rotate()
    .resize(ALBUM_MAX_EDGE, ALBUM_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86, alphaQuality: 90 })
    .toBuffer();

  return { body, contentType: "image/webp", ext: "webp" };
}

export type AlbumMediaVariant = "cover" | "disc";

/** Upload admin media (es. volantini eventi) su Vercel Blob. */
export async function uploadEventMedia(
  file: File,
  opts?: { folder?: string; variant?: AlbumMediaVariant },
) {
  assertBlobConfigured();

  if (file.size > MAX_BYTES) {
    throw new Error("File troppo grande (max 4 MB).");
  }

  const folder = opts?.folder ?? "events";
  const variant = opts?.variant ?? "cover";
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");

  if (folder === "albums" && file.type.startsWith("image/")) {
    const optimized =
      variant === "disc"
        ? await optimizeAlbumDisc(file)
        : await optimizeAlbumCover(file);
    const base =
      safeName.replace(/\.[^.]+$/, "") ||
      (variant === "disc" ? "disc" : "cover");
    const pathname = `${folder}/${Date.now()}-${base}.${optimized.ext}`;
    return put(pathname, optimized.body, {
      access: "public",
      addRandomSuffix: true,
      contentType: optimized.contentType,
    });
  }

  const pathname = `${folder}/${Date.now()}-${safeName}`;
  return put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || undefined,
  });
}

/** Elimina un blob pubblico se l’URL appartiene allo store Vercel. */
export async function deleteEventMedia(url: string | null | undefined) {
  if (!url) return;
  if (!url.includes(".blob.vercel-storage.com")) return;

  assertBlobConfigured();
  try {
    await del(url);
  } catch (error) {
    console.warn("[blob] delete fallita:", error);
  }
}

export const BLOB_MAX_BYTES = MAX_BYTES;
