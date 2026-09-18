import { z } from "zod";

export const SceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(10),
  duration: z.number().int().min(3).max(15).default(6),
  visualDescription: z.string().min(10, "Visual description must be descriptive"),
  videoPrompt: z.string().min(15, "Video prompt must provide 3D visual details"),
  narration: z.string().min(5, "Narration must have Hindi text"),
});

export const StorySchema = z.object({
  title: z.string().min(3, "Title is required"),
  concept: z.string().min(10, "Concept is required"),
  moral: z.string().min(5, "Moral is required"),
  ageGroup: z.string().default("4-8"),
  durationSeconds: z.number().int().min(20).max(60).default(30),
  storyText: z.string().optional(),
  scenes: z.array(SceneSchema).min(3).max(7),
});

export type StorySchemaType = z.infer<typeof StorySchema>;
export type SceneSchemaType = z.infer<typeof SceneSchema>;

/**
 * Helper to clean and sanitize raw JSON output from LLM
 * (removes markdown code fences, trailing commas, non-JSON text).
 */
export function sanitizeJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();

  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned;
}
