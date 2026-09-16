export const ADMIN_FLASH = {
  created: "Evento creato correttamente.",
  updated: "Evento aggiornato correttamente.",
  deleted: "Evento eliminato.",
  "album-created": "Album creato correttamente.",
  "album-updated": "Album aggiornato correttamente.",
  "album-deleted": "Album eliminato.",
  "user-created": "Utente admin creato correttamente.",
  "user-updated": "Utente admin aggiornato correttamente.",
  "user-deleted": "Utente admin eliminato.",
} as const;

export type AdminFlashKey = keyof typeof ADMIN_FLASH;

export function adminEventsRedirect(flash: Extract<AdminFlashKey, "created" | "updated" | "deleted">) {
  return `/admin/eventi?ok=${flash}`;
}

export function adminAlbumsRedirect(
  flash: Extract<AdminFlashKey, "album-created" | "album-updated" | "album-deleted">,
) {
  return `/admin/album?ok=${flash}`;
}

export function adminUsersRedirect(
  flash: Extract<AdminFlashKey, "user-created" | "user-updated" | "user-deleted">,
) {
  return `/admin/utenti/gestisci?ok=${flash}`;
}
