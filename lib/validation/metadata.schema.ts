import { z } from "zod";

export const MetadataSchema = z.object({
  youtubeTitle: z.string().min(5, "YouTube title is required"),
  youtubeDescription: z.string().min(10, "YouTube description is required"),
  youtubeTags: z.string().min(5, "YouTube tags are required"),
  youtubeHashtags: z.string().min(5, "YouTube hashtags are required"),
  instagramCaption: z.string().min(10, "Instagram caption is required"),
  instagramHashtags: z.string().min(5, "Instagram hashtags are required"),
  facebookCaption: z.string().min(10, "Facebook caption is required"),
  facebookHashtags: z.string().min(5, "Facebook hashtags are required"),
});

export type MetadataSchemaType = z.infer<typeof MetadataSchema>;
