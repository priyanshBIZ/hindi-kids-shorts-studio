import { StorySchemaType } from "../validation/story.schema";
import { MetadataSchemaType } from "../validation/metadata.schema";

export interface AIProvider {
  generateStory(prompt: string, systemPrompt?: string): Promise<{ text: string; tokensUsed?: number }>;
  generateMetadata(story: { title: string; concept: string; moral: string }): Promise<MetadataSchemaType>;
  testConnection(): Promise<{ connected: boolean; model: string; latencyMs?: number; error?: string }>;
}

export interface TTSProvider {
  generateNarration(text: string, voice?: string): Promise<{ audioBuffer: Buffer; duration: number }>;
  testConnection(): Promise<{ connected: boolean; model: string; error?: string }>;
}
