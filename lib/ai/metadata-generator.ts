import { geminiAIProvider } from "./gemini";
import { MetadataSchemaType } from "../validation/metadata.schema";
import { prisma } from "../database/prisma";

export async function generateAndSaveMetadata(storyId: string): Promise<MetadataSchemaType> {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story) {
    throw new Error(`Story with ID ${storyId} not found`);
  }

  const generated = await geminiAIProvider.generateMetadata({
    title: story.title,
    concept: story.concept,
    moral: story.moral,
  });

  // Save or update in database
  await prisma.metadata.upsert({
    where: { storyId },
    create: {
      storyId,
      youtubeTitle: generated.youtubeTitle,
      youtubeDescription: generated.youtubeDescription,
      youtubeTags: generated.youtubeTags,
      youtubeHashtags: generated.youtubeHashtags,
      instagramCaption: generated.instagramCaption,
      instagramHashtags: generated.instagramHashtags,
      facebookCaption: generated.facebookCaption,
      facebookHashtags: generated.facebookHashtags,
    },
    update: {
      youtubeTitle: generated.youtubeTitle,
      youtubeDescription: generated.youtubeDescription,
      youtubeTags: generated.youtubeTags,
      youtubeHashtags: generated.youtubeHashtags,
      instagramCaption: generated.instagramCaption,
      instagramHashtags: generated.instagramHashtags,
      facebookCaption: generated.facebookCaption,
      facebookHashtags: generated.facebookHashtags,
    },
  });

  // If story has video, update story status to READY_TO_PUBLISH
  const video = await prisma.video.findFirst({
    where: { storyId },
  });

  if (video) {
    await prisma.story.update({
      where: { id: storyId },
      data: { status: "READY_TO_PUBLISH" },
    });
  }

  return generated;
}
