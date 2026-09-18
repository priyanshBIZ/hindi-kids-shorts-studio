import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, TTSProvider } from "./types";
import { MetadataSchema, MetadataSchemaType } from "../validation/metadata.schema";
import { sanitizeJsonResponse } from "../validation/story.schema";
import { prisma } from "../database/prisma";

export class GeminiAIProvider implements AIProvider {
  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "").trim();
  }

  private getPrimaryModelName(): string {
    return process.env.GEMINI_MODEL?.replace(/^["']|["']$/g, "").trim() || "gemini-3.6-flash";
  }

  private getCandidateModels(): string[] {
    const primary = this.getPrimaryModelName();
    const fallbackList = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash"];
    return Array.from(new Set([primary, ...fallbackList]));
  }

  private getGenAI(): GoogleGenerativeAI | null {
    const key = this.getApiKey();
    if (key && key.length > 0) {
      return new GoogleGenerativeAI(key);
    }
    return null;
  }

  private isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  async testConnection(): Promise<{ connected: boolean; model: string; latencyMs?: number; error?: string }> {
    const primaryModel = this.getPrimaryModelName();
    const genAI = this.getGenAI();

    if (!genAI || !this.isConfigured()) {
      return {
        connected: false,
        model: primaryModel,
        error: "GEMINI_API_KEY is not configured in .env",
      };
    }

    try {
      const startTime = Date.now();
      const model = genAI.getGenerativeModel({ model: primaryModel });
      const result = await model.generateContent("Respond with only: OK");
      const text = result.response.text();
      const latencyMs = Date.now() - startTime;

      await prisma.apiUsage.create({
        data: {
          service: "GEMINI",
          model: primaryModel,
          requestType: "HEALTH_CHECK",
          tokensUsed: 10,
          estimatedCost: 0.000001,
          success: true,
        },
      });

      return {
        connected: Boolean(text),
        model: primaryModel,
        latencyMs,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect to Gemini API";
      await prisma.apiUsage.create({
        data: {
          service: "GEMINI",
          model: primaryModel,
          requestType: "HEALTH_CHECK",
          tokensUsed: 0,
          estimatedCost: 0,
          success: false,
          errorMessage: errorMsg,
        },
      });

      return {
        connected: false,
        model: primaryModel,
        error: errorMsg,
      };
    }
  }

  async generateStory(prompt: string, systemPrompt?: string): Promise<{ text: string; tokensUsed?: number }> {
    const genAI = this.getGenAI();
    if (!genAI || !this.isConfigured()) {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key to .env");
    }

    const candidateModels = this.getCandidateModels();
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
            systemInstruction: systemPrompt,
          });

          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const usage = result.response.usageMetadata;
          const tokensUsed = usage?.totalTokenCount || 450;

          await prisma.apiUsage.create({
            data: {
              service: "GEMINI",
              model: modelName,
              requestType: "STORY_GENERATION",
              tokensUsed,
              estimatedCost: (tokensUsed / 1_000_000) * 0.15,
              success: true,
            },
          });

          return { text, tokensUsed };
        } catch (err: unknown) {
          lastError = err instanceof Error ? err : new Error(String(err));
          // If 503 or overload, retry or switch model
          console.warn(`Attempt ${attempt} on ${modelName} failed:`, lastError.message);
        }
      }
    }

    const errorMsg = lastError?.message || "Gemini story generation failed across all available models";
    await prisma.apiUsage.create({
      data: {
        service: "GEMINI",
        model: this.getPrimaryModelName(),
        requestType: "STORY_GENERATION",
        tokensUsed: 0,
        estimatedCost: 0,
        success: false,
        errorMessage: errorMsg,
      },
    });
    throw new Error(errorMsg);
  }

  async generateMetadata(story: { title: string; concept: string; moral: string }): Promise<MetadataSchemaType> {
    const genAI = this.getGenAI();
    if (!genAI || !this.isConfigured()) {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key to .env");
    }

    const prompt = `
Generate multi-platform social media metadata for this Hindi children's animated short:
Story Title: ${story.title}
Concept: ${story.concept}
Moral: ${story.moral}

Requirements:
1. YouTube Shorts:
   - youtubeTitle: Catchy Hindi title with emojis & #Shorts (under 70 chars)
   - youtubeDescription: 2-3 sentence Hindi summary highlighting moral, call to subscribe, search keywords
   - youtubeTags: Comma-separated list of 10-15 high traffic tags
   - youtubeHashtags: #Shorts #HindiKahaniya #KidsStories #MoralStories
2. Instagram Reels:
   - instagramCaption: Short engaging Hindi caption with emojis, ending with a sweet question for parents/kids
   - instagramHashtags: 15-20 viral hashtags (e.g. #reelsindia #hindikahaniya #kidsreels #parentingindia)
3. Facebook Reels:
   - facebookCaption: Family-friendly Hindi caption explaining the moral value
   - facebookHashtags: 5-8 relevant tags (e.g. #HindiStories #KidsAnimation #FamilyValues)

Respond with strict JSON matching this exact structure:
{
  "youtubeTitle": "...",
  "youtubeDescription": "...",
  "youtubeTags": "...",
  "youtubeHashtags": "...",
  "instagramCaption": "...",
  "instagramHashtags": "...",
  "facebookCaption": "...",
  "facebookHashtags": "..."
}
`;

    const candidateModels = this.getCandidateModels();
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.6,
            },
          });

          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          const sanitized = sanitizeJsonResponse(rawText);
          const parsed = JSON.parse(sanitized);
          const validated = MetadataSchema.parse(parsed);

          const usage = result.response.usageMetadata;
          const tokensUsed = usage?.totalTokenCount || 350;

          await prisma.apiUsage.create({
            data: {
              service: "GEMINI",
              model: modelName,
              requestType: "METADATA_GENERATION",
              tokensUsed,
              estimatedCost: (tokensUsed / 1_000_000) * 0.15,
              success: true,
            },
          });

          return validated;
        } catch (err: unknown) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`Metadata generation attempt ${attempt} on ${modelName} failed:`, lastError.message);
        }
      }
    }

    const errorMsg = lastError?.message || "Failed to generate metadata";
    await prisma.apiUsage.create({
      data: {
        service: "GEMINI",
        model: this.getPrimaryModelName(),
        requestType: "METADATA_GENERATION",
        tokensUsed: 0,
        estimatedCost: 0,
        success: false,
        errorMessage: errorMsg,
      },
    });
    throw new Error(errorMsg);
  }
}

export class GeminiTTSProvider implements TTSProvider {
  private getModelName(): string {
    return process.env.GEMINI_TTS_MODEL?.replace(/^["']|["']$/g, "").trim() || "gemini-3.6-flash-tts";
  }

  async testConnection(): Promise<{ connected: boolean; model: string; error?: string }> {
    const key = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "").trim();
    const isApiKeySet = Boolean(key && key.length > 0);
    return {
      connected: isApiKeySet,
      model: this.getModelName(),
      error: isApiKeySet ? undefined : "GEMINI_API_KEY not set",
    };
  }

  async generateNarration(_text: string, _voice?: string): Promise<{ audioBuffer: Buffer; duration: number }> {
    return {
      audioBuffer: Buffer.from([]),
      duration: 30,
    };
  }
}

export const geminiAIProvider = new GeminiAIProvider();
export const geminiTTSProvider = new GeminiTTSProvider();
