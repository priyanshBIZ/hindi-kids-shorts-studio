export type SocialPlatform = "YOUTUBE" | "INSTAGRAM" | "FACEBOOK";
export type PublicationStatus = "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";

export interface PlatformMetadata {
  youtubeTitle?: string;
  youtubeDescription?: string;
  youtubeTags?: string;
  youtubeHashtags?: string;
  instagramCaption?: string;
  instagramHashtags?: string;
  facebookCaption?: string;
  facebookHashtags?: string;
}

export interface PlatformPublication {
  id?: string;
  storyId: string;
  platform: SocialPlatform;
  status: PublicationStatus;
  platformUrl?: string | null;
  publishedAt?: Date | null;
  errorMessage?: string | null;
}
