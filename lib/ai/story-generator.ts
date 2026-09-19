import { geminiAIProvider } from "./gemini";
import { StorySchema, StorySchemaType, sanitizeJsonResponse } from "../validation/story.schema";
import { prisma } from "../database/prisma";
import { StoryGenerationRequest } from "@/types/story";

export const DEFAULT_SYSTEM_PROMPT = `You are an expert children's storyteller specializing in creating delightful, heartwarming, and educational short animated stories for Indian Hindi-speaking children aged 4 to 8.

CORE GUIDELINES:
1. Target Audience: Indian kids aged 4-8 years.
2. Language: Simple, pure, conversational everyday Hindi (हिंदी) in Devanagari script. Use short sentences and joyful, easy-to-understand vocabulary.
3. Tone: Joyful, friendly, inspiring, gentle, and warm.
4. Total Duration: 25 to 35 seconds across 4 to 5 distinct visual scenes.
5. Character Design: Original, recurring lovable animal or child characters (e.g. Gajju the baby elephant, Chiku the squirrel, Meenu the sparrow, Golu the bear).
6. Strict Safety & Content Rules:
   - Absolutely NO violence, hitting, or aggression.
   - Absolutely NO frightening imagery, monsters, or scary sounds.
   - Absolutely NO adult themes, politics, or religious controversies.
   - Absolutely NO unsafe stunts (jumping from heights, playing with fire, sharp objects, or medicines).
   - Clear positive moral takeaway in every story (sharing, helping, kindness, honesty, curiosity).
   - Consistent character appearance and clear visual continuity from Scene 1 to the final scene.`;

export const DEFAULT_DAILY_STORY_PROMPT = `Create a brand new engaging 30-second Hindi animated short story for kids.

THEME OR CONCEPT (Optional):
{{THEME}}

REQUIREMENTS:
1. Title in Hindi (Devanagari) with an English/Hinglish translation.
2. 4 to 5 sequential scenes. Each scene duration should be 5 to 7 seconds.
3. For each scene, provide:
   - sceneNumber (1, 2, 3, 4, 5)
   - duration in seconds (5, 6, 7)
   - visualDescription (clear visual cues in English)
   - videoPrompt (optimized 3D animation prompt in English for Google Flow/Veo)
   - narration (warm, energetic 1-2 line Hindi voiceover in Devanagari)

OUTPUT FORMAT:
Strict JSON matching this EXACT schema key names (create a unique, specific title reflecting the requested theme):
{
  "title": "[Insert Unique Story Title in Hindi & English reflecting the theme]",
  "concept": "एक छोटा हाथी एक गिरी हुई नन्ही चिड़िया की मदद करता है।",
  "moral": "दूसरों की मदद करने से सच्ची खुशी मिलती है।",
  "ageGroup": "4-8",
  "durationSeconds": 30,
  "storyText": "एक सुंदर जंगल में रहता था गज्जू हाथी...",
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 6,
      "visualDescription": "A cute chubby baby elephant named Gajju with big friendly eyes walking through a vibrant green jungle with blooming colorful flowers.",
      "videoPrompt": "Cute high-quality 3D children's animation. A cute baby elephant named Gajju with soft grey skin, large playful ears, and cheerful warm brown eyes walking happily on a sunlit jungle path with bright pink flowers. Vertical 9:16 composition, soft cinematic volumetric lighting, Pixar-style rounded friendly character design, no text, no watermark, no logos.",
      "narration": "एक सुंदर जंगल में रहता था गज्जू हाथी! वह बहुत दयालु और खुशमिज़ाज था।"
    }
  ]
}`;

/**
 * Normalizes raw JSON objects to handle common LLM key variations (snake_case vs camelCase)
 */
function normalizeStoryJson(rawJson: any): any {
  if (!rawJson || typeof rawJson !== "object") return rawJson;

  const concept = rawJson.concept || rawJson.summary || rawJson.description || rawJson.theme || rawJson.title || "Hindi kids story";
  const moral = rawJson.moral || rawJson.moralLesson || rawJson.lesson || "Helping others brings happiness";
  const title = rawJson.title || "बाल कहानी (Kids Story)";
  const ageGroup = rawJson.ageGroup || rawJson.age_group || "4-8";
  const durationSeconds = Number(rawJson.durationSeconds || rawJson.duration_seconds || rawJson.duration || 30);
  const storyText = rawJson.storyText || rawJson.story_text || concept;

  const rawScenes = Array.isArray(rawJson.scenes) ? rawJson.scenes : [];
  const scenes = rawScenes.map((s: any, idx: number) => ({
    sceneNumber: Number(s.sceneNumber || s.scene_number || s.scene || idx + 1),
    duration: Number(s.duration || s.durationSeconds || s.duration_seconds || 6),
    visualDescription: s.visualDescription || s.visual_description || s.visual || s.description || "Cute 3D animation scene",
    videoPrompt: s.videoPrompt || s.video_prompt || s.prompt || s.visualDescription || s.visual_description || "Cute high-quality 3D children animation, vertical 9:16",
    narration: s.narration || s.voiceover || s.hindiNarration || s.hindi_narration || s.dialogue || "कहानी का सुंदर दृश्य।",
  }));

  return {
    title,
    concept,
    moral,
    ageGroup,
    durationSeconds,
    storyText,
    scenes,
  };
}

export async function generateDailyStory(req: StoryGenerationRequest = {}): Promise<StorySchemaType & { id: string }> {
  const systemPrompt = DEFAULT_SYSTEM_PROMPT;
  const userPromptTemplate = DEFAULT_DAILY_STORY_PROMPT;

  const themeText = req.theme 
    ? `Theme: ${req.theme}. ${req.characterName ? `Character name: ${req.characterName}.` : ""} ${req.moral ? `Moral lesson: ${req.moral}.` : ""}`
    : "Create an inspiring, joyful original story featuring a lovable recurring animal character (like Gajju the baby elephant, Chiku the squirrel, or Meenu the bird) learning about sharing, kindness, or courage.";

  const filledUserPrompt = userPromptTemplate.replace("{{THEME}}", themeText);

  // Attempt generation with retry/repair strategy
  let lastError: Error | null = null;
  let parsedStory: StorySchemaType | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await geminiAIProvider.generateStory(
        attempt === 1 
          ? filledUserPrompt 
          : `${filledUserPrompt}\n\nCRITICAL: Return ONLY valid JSON adhering strictly to the key names: title, concept, moral, ageGroup, durationSeconds, storyText, and scenes array with sceneNumber, duration, visualDescription, videoPrompt, narration.`,
        systemPrompt
      );

      const sanitized = sanitizeJsonResponse(response.text);
      const rawJson = JSON.parse(sanitized);
      const normalized = normalizeStoryJson(rawJson);
      parsedStory = StorySchema.parse(normalized);
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
