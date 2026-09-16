import type {
  FacebookPostApiItem,
  InstagramMediaApiItem,
  SocialMediaType,
  SocialPost,
} from "@/lib/meta/types";

const GRAPH = "https://graph.facebook.com/v21.0";
const REVALIDATE_SECONDS = 3600;
const DEFAULT_LIMIT = 9;

const FB_POST_FIELDS =
  "id,message,created_time,full_picture,permalink_url,attachments{media_type,media{image{src},source}}";

const IG_MEDIA_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_url,media_type,thumbnail_url}";

function getSystemToken(): string | null {
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  return token || null;
}

function getPageId(): string | null {
  return process.env.META_PAGE_ID?.trim() || null;
}

function getIgUserId(): string | null {
  return process.env.META_IG_USER_ID?.trim() || null;
}

type MetaErrorBody = {
  error?: { message?: string; code?: number; type?: string };
};

async function graphGet<T>(
  path: string,
  searchParams: Record<string, string>,
  accessToken: string,
): Promise<T | null> {
  const url = new URL(`${GRAPH}${path}`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("access_token", accessToken);

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    const json = (await res.json()) as T & MetaErrorBody;
    if (!res.ok) {
      const metaMsg = json?.error?.message ?? res.statusText;
      console.error(`[meta] ${path} → ${res.status}: ${metaMsg}`);
      return null;
    }
    return json;
  } catch (error) {
    console.error(`[meta] ${path} failed`, error);
    return null;
  }
}

/**
 * Lo System User token spesso non basta su /published_posts:
 * serve il Page access token (campo access_token della Pagina).
 */
async function resolvePageAccessToken(): Promise<string | null> {
  const systemToken = getSystemToken();
  const pageId = getPageId();
  if (!systemToken || !pageId) return null;

  const page = await graphGet<{ access_token?: string }>(
    `/${pageId}`,
    { fields: "access_token" },
    systemToken,
  );
  if (page?.access_token) return page.access_token;

  const accounts = await graphGet<{
    data?: Array<{ id: string; access_token?: string }>;
  }>(`/me/accounts`, { fields: "id,access_token", limit: "50" }, systemToken);

  const match = accounts?.data?.find((entry) => entry.id === pageId);
  if (match?.access_token) return match.access_token;

  // Ultimo tentativo: token system user così com'è
  return systemToken;
}

function mapInstagramMediaType(raw?: string): SocialMediaType {
  if (raw === "VIDEO") return "VIDEO";
  if (raw === "CAROUSEL_ALBUM") return "CAROUSEL_ALBUM";
  return "IMAGE";
}

function instagramImageUrl(item: InstagramMediaApiItem): string | null {
  if (item.media_type === "VIDEO") {
    return item.thumbnail_url ?? item.media_url ?? null;
  }
  if (item.media_url) return item.media_url;
  if (item.thumbnail_url) return item.thumbnail_url;

  const child = item.children?.data?.find(
    (c) => c.media_url || c.thumbnail_url,
  );
  if (!child) return null;
  if (child.media_type === "VIDEO") {
    return child.thumbnail_url ?? child.media_url ?? null;
  }
  return child.media_url ?? child.thumbnail_url ?? null;
}

function mapInstagramItem(item: InstagramMediaApiItem): SocialPost | null {
  if (!item.id || !item.permalink) return null;

  return {
    id: item.id,
    platform: "instagram",
    permalink: item.permalink,
    caption: item.caption?.trim() || null,
    imageUrl: instagramImageUrl(item),
    mediaType: mapInstagramMediaType(item.media_type),
    timestamp: item.timestamp ?? new Date(0).toISOString(),
  };
}

function facebookImageUrl(item: FacebookPostApiItem): string | null {
  if (item.full_picture) return item.full_picture;
  const media = item.attachments?.data?.[0]?.media;
  return media?.image?.src ?? media?.source ?? null;
}

function mapFacebookItem(item: FacebookPostApiItem): SocialPost | null {
  if (!item.id || !item.permalink_url) return null;

  const caption = item.message?.trim() || null;
  const imageUrl = facebookImageUrl(item);
  if (!imageUrl && !caption) return null;

  return {
    id: item.id,
    platform: "facebook",
    permalink: item.permalink_url,
    caption,
    imageUrl,
    mediaType: imageUrl ? "IMAGE" : "TEXT",
    timestamp: item.created_time ?? new Date(0).toISOString(),
  };
}

export async function getInstagramPosts(
  limit = DEFAULT_LIMIT,
): Promise<SocialPost[]> {
  const igUserId = getIgUserId();
  const pageToken = await resolvePageAccessToken();
  if (!igUserId || !pageToken) return [];

  const data = await graphGet<{ data?: InstagramMediaApiItem[] }>(
    `/${igUserId}/media`,
    { fields: IG_MEDIA_FIELDS, limit: String(limit) },
    pageToken,
  );

  const posts = (data?.data ?? [])
    .map(mapInstagramItem)
    .filter((post): post is SocialPost => post !== null);

  if (posts.length > 0 && posts.length < 2) {
    console.warn(
      `[meta] Instagram ha restituito solo ${posts.length} post (attesi fino a ${limit})`,
    );
  }

  return posts;
}

async function fetchFacebookEdge(
  pageId: string,
  edge: "posts" | "feed" | "published_posts",
  pageToken: string,
  limit: number,
): Promise<SocialPost[]> {
  const data = await graphGet<{ data?: FacebookPostApiItem[] }>(
    `/${pageId}/${edge}`,
    { fields: FB_POST_FIELDS, limit: String(limit) },
    pageToken,
  );

  return (data?.data ?? [])
    .map(mapFacebookItem)
    .filter((post): post is SocialPost => post !== null);
}

export async function getFacebookPosts(
  limit = DEFAULT_LIMIT,
): Promise<SocialPost[]> {
  const pageId = getPageId();
  const pageToken = await resolvePageAccessToken();
  if (!pageId || !pageToken) return [];

  // published_posts spesso 403 senza permessi extra; posts/feed sono più tolleranti
  for (const edge of ["posts", "feed", "published_posts"] as const) {
    const posts = await fetchFacebookEdge(pageId, edge, pageToken, limit);
    if (posts.length > 0) return posts;
  }

  return [];
}
