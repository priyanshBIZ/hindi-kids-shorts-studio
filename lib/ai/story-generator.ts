import fs from "fs";
import path from "path";
import { geminiAIProvider } from "./gemini";
import { StorySchema, StorySchemaType, sanitizeJsonResponse } from "../validation/story.schema";
import { prisma } from "../database/prisma";
import { StoryGenerationRequest } from "@/types/story";

function readPromptFile(relativePath: string, defaultContent: string): string {
  try {
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  } catch (err) {
    console.warn(`Could not read prompt file ${relativePath}:`, err);
  }
  return defaultContent;
}

export async function generateDailyStory(req: StoryGenerationRequest = {}): Promise<StorySchemaType & { id: string }> {
  const systemPrompt = readPromptFile(
    "prompts/story/system.txt",
    "You are an expert children's storyteller creating short animated stories for Indian Hindi-speaking children aged 4 to 8."
  );

  let userPromptTemplate = readPromptFile(
    "prompts/story/daily-story.txt",
    "Create a new 30-second Hindi animated short story with 4-5 scenes for kids."
  );

  const themeText = req.theme 
    ? `Theme: ${req.theme}. ${req.characterName ? `Character name: ${req.characterName}.` : ""} ${req.moral ? `Moral lesson: ${req.moral}.` : ""}`
    : "Create an inspiring, joyful original story featuring a lovable recurring animal character (like Gajju the baby elephant, Chiku the squirrel, or Meenu the bird) learning about sharing, kindness, or courage.";

  const filledUserPrompt = userPromptTemplate.replace("{{THEME}}", themeText);

  // Attempt generation with retry/repair strategy
  let lastError: Error | null = null;
  let parsedStory: StorySchemaType | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await geminiAIProvider.generateStory(
        attempt === 1 ? filledUserPrompt : `${filledUserPrompt}\n\nIMPORTANT: Return ONLY valid JSON adhering strictly to the schema.`,
        systemPrompt
      );

      const sanitized = sanitizeJsonResponse(response.text);
      const rawJson = JSON.parse(sanitized);
      parsedStory = StorySchema.parse(rawJson);
      break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Story generation attempt ${attempt} failed:`, lastError.message);
    }
  }

  if (!parsedStory) {
    throw new Error(`Failed to generate valid story after retries: ${lastError?.message || "Unknown error"}`);
  }

  // Find or create default project
  let project = await prisma.project.findFirst({
    where: { name: "Hindi Kids Shorts" },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Hindi Kids Shorts",
        description: "Automated & Curated Hindi Children's Short Video Studio",
      },
    });
  }

  // Create Story and Scenes in Database
  const createdStory = await prisma.story.create({
    data: {
      projectId: project.id,
      title: parsedStory.title,
      concept: parsedStory.concept,
      moral: parsedStory.moral,
      ageGroup: parsedStory.ageGroup || "4-8",
      durationSeconds: parsedStory.durationSeconds || 30,
      storyText: parsedStory.storyText || parsedStory.concept,
      status: "PROMPTS_READY",
      scenes: {
        create: parsedStory.scenes.map((scene) => ({
          sceneNumber: scene.sceneNumber,
          duration: scene.duration,
          visualDescription: scene.visualDescription,
          videoPrompt: scene.videoPrompt,
          narration: scene.narration,
        })),
      },
    },
    include: {
      scenes: {
        orderBy: { sceneNumber: "asc" },
      },
    },
  });

  return {
    id: createdStory.id,
    title: createdStory.title,
    concept: createdStory.concept,
    moral: createdStory.moral,
    ageGroup: createdStory.ageGroup,
    durationSeconds: createdStory.durationSeconds,
    storyText: createdStory.storyText || undefined,
    scenes: createdStory.scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      duration: s.duration,
      visualDescription: s.visualDescription,
      videoPrompt: s.videoPrompt,
      narration: s.narration,
    })),
  };
}
