import { put } from "@vercel/blob";

/** Upload admin media (es. volantini eventi) su Vercel Blob. */
export async function uploadEventMedia(
  file: File,
  opts?: { folder?: string },
) {
  const folder = opts?.folder ?? "events";
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const pathname = `${folder}/${Date.now()}-${safeName}`;

  return put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  });
}
