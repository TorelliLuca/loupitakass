export type SocialPlatform = "instagram" | "facebook";

export type SocialMediaType =
  | "IMAGE"
  | "VIDEO"
  | "CAROUSEL_ALBUM"
  | "TEXT";

export type SocialPost = {
  id: string;
  platform: SocialPlatform;
  permalink: string;
  caption: string | null;
  imageUrl: string | null;
  mediaType: SocialMediaType;
  timestamp: string;
};

export type InstagramMediaApiItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: {
    data?: Array<{
      media_url?: string;
      media_type?: string;
      thumbnail_url?: string;
    }>;
  };
};

export type FacebookPostApiItem = {
  id: string;
  message?: string;
  created_time?: string;
  full_picture?: string;
  permalink_url?: string;
  attachments?: {
    data?: Array<{
      media_type?: string;
      media?: {
        image?: { src?: string };
        source?: string;
      };
    }>;
  };
};
