import type { AppLocale } from "@/i18n/routing";
import type { Album, Event, Member } from "@/lib/db/schema";

function member(partial: {
  id: string;
  sortOrder: number;
  firstName: string;
  lastName: string;
  roleIt: string;
  roleFr: string;
  roleEn: string;
  roleOc: string;
  bioIt: string;
  bioFr: string;
  bioEn: string;
  bioOc: string;
  photoUrl?: string | null;
}): Member {
  return {
    photoUrl: partial.photoUrl ?? null,
    isActive: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    bioIt: partial.bioIt,
    bioFr: partial.bioFr,
    bioEn: partial.bioEn,
    bioOc: partial.bioOc,
    id: partial.id,
    sortOrder: partial.sortOrder,
    firstName: partial.firstName,
    lastName: partial.lastName,
    roleIt: partial.roleIt,
    roleFr: partial.roleFr,
    roleEn: partial.roleEn,
    roleOc: partial.roleOc,
  };
}

/** Membri reali — bio individuali da completare quando fornite dal cliente. */
export const demoMembers: Member[] = [
  member({
    id: "m-luca",
    sortOrder: 1,
    firstName: "Luca",
    lastName: "Declementi",
    roleIt: "Voce, organetto, strumenti a fiato",
    roleFr: "Voix, accordéon diatonique, instruments à vent",
    roleEn: "Vocals, diatonic accordion, wind instruments",
    roleOc: "Votz, organet, instruments de vent",
    bioIt: "",
    bioFr: "",
    bioEn: "",
    bioOc: "",
    photoUrl: "/images/members/luca-declementi.jpg",
  }),
  member({
    id: "m-loris",
    sortOrder: 2,
    firstName: "Loris",
    lastName: "Giraudo",
    roleIt: "Ghironda, organetto",
    roleFr: "Vielle à roue, accordéon diatonique",
    roleEn: "Hurdy-gurdy, diatonic accordion",
    roleOc: "Virondela, organet",
    bioIt: "",
    bioFr: "",
    bioEn: "",
    bioOc: "",
    photoUrl: "/images/members/loris-giraudo.jpg",
  }),
  member({
    id: "m-anna",
    sortOrder: 3,
    firstName: "Anna",
    lastName: "Damiano",
    roleIt: "Flauto traverso",
    roleFr: "Flûte traversière",
    roleEn: "Transverse flute",
    roleOc: "Flaüt traversièr",
    bioIt: "",
    bioFr: "",
    bioEn: "",
    bioOc: "",
    photoUrl: "/images/members/anna-damiano.jpg",
  }),
  member({
    id: "m-daniele",
    sortOrder: 4,
    firstName: "Daniele",
    lastName: "Mauro",
    roleIt: "Basso elettrico",
    roleFr: "Basse électrique",
    roleEn: "Electric bass",
    roleOc: "Bassa electrica",
    bioIt: "",
    bioFr: "",
    bioEn: "",
    bioOc: "",
    photoUrl: "/images/members/daniele-mauro.jpg",
  }),
  member({
    id: "m-simone",
    sortOrder: 5,
    firstName: "Simone",
    lastName: "Pastorino",
    roleIt: "Chitarra elettrica",
    roleFr: "Guitare électrique",
    roleEn: "Electric guitar",
    roleOc: "Guitarra electrica",
    bioIt: "",
    bioFr: "",
    bioEn: "",
    bioOc: "",
    photoUrl: "/images/members/simone-pastorino.jpg",
  }),
  member({
    id: "m-davide",
    sortOrder: 6,
    firstName: "Davide",
    lastName: "Bagnis",
    roleIt: "Batteria",
    roleFr: "Batterie",
    roleEn: "Drums",
    roleOc: "Batariá",
    bioIt: "",
    bioFr: "",
    bioEn: "",
    bioOc: "",
    photoUrl: "/images/members/davide-bagnis.jpg",
  }),
];

function offsetDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export const demoEvents: Event[] = [
  {
    id: "demo-e1",
    eventDate: offsetDate(1),
    eventTime: "21:00",
    venue: "Sala prova",
    city: "Torino",
    country: "Italia",
    address: null,
    lat: 45.0703,
    lng: 7.6869,
    ticketUrl: null,
    flyerUrl: null,
    titleIt: "Concerto in arrivo",
    titleFr: "Concert à venir",
    titleEn: "Upcoming concert",
    titleOc: "Concèrt a venir",
    descriptionIt: null,
    descriptionFr: null,
    descriptionEn: null,
    descriptionOc: null,
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  {
    id: "demo-e2",
    eventDate: offsetDate(3),
    eventTime: "20:30",
    venue: "Festival d’estate",
    city: "Cuneo",
    country: "Italia",
    address: null,
    lat: 44.3842,
    lng: 7.5427,
    ticketUrl: null,
    flyerUrl: null,
    titleIt: "Festival d’estate",
    titleFr: "Festival d’été",
    titleEn: "Summer festival",
    titleOc: "Festival d’estiu",
    descriptionIt: null,
    descriptionFr: null,
    descriptionEn: null,
    descriptionOc: null,
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  {
    id: "demo-e3",
    eventDate: offsetDate(-2),
    eventTime: "21:00",
    venue: "Piazza esempio",
    city: "Nice",
    country: "France",
    address: null,
    lat: 43.7102,
    lng: 7.262,
    ticketUrl: null,
    flyerUrl: null,
    titleIt: "Concerto passato",
    titleFr: "Concert passé",
    titleEn: "Past concert",
    titleOc: "Concèrt passat",
    descriptionIt: null,
    descriptionFr: null,
    descriptionEn: null,
    descriptionOc: null,
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  {
    id: "demo-e4",
    eventDate: offsetDate(-5),
    eventTime: "19:00",
    venue: "Centro culturale",
    city: "Genova",
    country: "Italia",
    address: null,
    lat: 44.4056,
    lng: 8.9463,
    ticketUrl: null,
    flyerUrl: null,
    titleIt: "Serata folk",
    titleFr: "Soirée folk",
    titleEn: "Folk night",
    titleOc: "Serada folk",
    descriptionIt: null,
    descriptionFr: null,
    descriptionEn: null,
    descriptionOc: null,
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
];

export function localizedEventTitle(event: Event, locale: AppLocale): string {
  const map = {
    it: event.titleIt,
    fr: event.titleFr,
    en: event.titleEn,
    oc: event.titleOc,
  } as const;
  return map[locale] || event.titleIt;
}

export function localizedEventDescription(
  event: Event,
  locale: AppLocale,
): string | null {
  const map = {
    it: event.descriptionIt,
    fr: event.descriptionFr,
    en: event.descriptionEn,
    oc: event.descriptionOc,
  } as const;
  const value = map[locale] || event.descriptionIt;
  return value?.trim() ? value : null;
}

export function localizedAlbumTitle(album: Album, locale: AppLocale): string {
  const map = {
    it: album.titleIt,
    fr: album.titleFr,
    en: album.titleEn,
    oc: album.titleOc,
  } as const;
  return map[locale] || album.titleIt;
}

export const demoAlbums: Album[] = [
  {
    id: "demo-a1",
    releaseDate: offsetDate(-8),
    releaseType: "album",
    coverUrl: "/images/gallery/fb-1200.jpg",
    coverBackUrl: "/images/gallery/ig-4x5.jpg",
    discUrl: null,
    durationSec: null,
    titleIt: "La Gabelo",
    titleFr: "La Gabelo",
    titleEn: "La Gabelo",
    titleOc: "La Gabelo",
    spotifyUrl: "https://open.spotify.com/",
    appleMusicUrl: null,
    youtubeMusicUrl: "https://music.youtube.com/",
    bandcampUrl: null,
    deezerUrl: null,
    tidalUrl: null,
    amazonMusicUrl: null,
    sortOrder: 1,
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  {
    id: "demo-a2",
    releaseDate: offsetDate(2),
    releaseType: "single",
    coverUrl: "/images/gallery/ig-4x5.jpg",
    coverBackUrl: null,
    discUrl: null,
    durationSec: 214,
    titleIt: "Nuovo lavoro",
    titleFr: "Nouveau travail",
    titleEn: "New work",
    titleOc: "Novèl trabalh",
    spotifyUrl: "https://open.spotify.com/",
    appleMusicUrl: "https://music.apple.com/",
    youtubeMusicUrl: null,
    bandcampUrl: null,
    deezerUrl: null,
    tidalUrl: null,
    amazonMusicUrl: null,
    sortOrder: 2,
    status: "published",
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
];

export type AlbumPlatformKey =
  | "spotify"
  | "appleMusic"
  | "youtubeMusic"
  | "bandcamp"
  | "deezer"
  | "tidal"
  | "amazonMusic";

export type AlbumPlatformLink = {
  key: AlbumPlatformKey;
  href: string;
};

/** Solo piattaforme con URL valorizzato, ordine fisso. */
export function albumPlatformLinks(album: Album): AlbumPlatformLink[] {
  const entries: [AlbumPlatformKey, string | null][] = [
    ["spotify", album.spotifyUrl],
    ["appleMusic", album.appleMusicUrl],
    ["youtubeMusic", album.youtubeMusicUrl],
    ["bandcamp", album.bandcampUrl],
    ["deezer", album.deezerUrl],
    ["tidal", album.tidalUrl],
    ["amazonMusic", album.amazonMusicUrl],
  ];
  return entries
    .filter((entry): entry is [AlbumPlatformKey, string] => Boolean(entry[1]))
    .map(([key, href]) => ({ key, href }));
}

export function localizedMemberRole(member: Member, locale: AppLocale): string {
  const map = {
    it: member.roleIt,
    fr: member.roleFr,
    en: member.roleEn,
    oc: member.roleOc,
  } as const;
  return map[locale] || member.roleIt || "";
}

export function localizedMemberBio(member: Member, locale: AppLocale): string {
  const map = {
    it: member.bioIt,
    fr: member.bioFr,
    en: member.bioEn,
    oc: member.bioOc,
  } as const;
  return map[locale] || member.bioIt || "";
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isUpcomingAlbum(album: Album, today = todayIsoDate()): boolean {
  return album.releaseDate > today;
}

export function isUpcomingEvent(event: Event, today = todayIsoDate()): boolean {
  return event.eventDate >= today;
}

/** Quante date passate mostrare in lista prima di «Mostra tutto». */
export const PAST_EVENTS_LIST_LIMIT = 3;

export function splitEvents(events: Event[], today = todayIsoDate()) {
  const upcoming = events
    .filter((e) => isUpcomingEvent(e, today))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const past = events
    .filter((e) => !isUpcomingEvent(e, today))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  return { upcoming, past };
}
