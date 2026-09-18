# API Integrations & Provider Guide

## Provider Interfaces

All third-party services are isolated behind clean TypeScript interfaces to ensure modularity and zero vendor lock-in.

### 1. `AIProvider` (`lib/ai/types.ts`)
```typescript
export interface AIProvider {
  generateStory(prompt: string, systemPrompt?: string): Promise<{ text: string; tokensUsed?: number }>;
  generateMetadata(story: { title: string; concept: string; moral: string }): Promise<MetadataSchemaType>;
  testConnection(): Promise<{ connected: boolean; model: string; latencyMs?: number; error?: string }>;
}
```
**Current Implementation**: `GeminiAIProvider` using `@google/generative-ai` with structured JSON output and automatic repair fallback.

---

### 2. `VideoProvider` (`lib/video/types.ts`)
```typescript
export interface VideoProvider {
  name: string;
  isAutomated: boolean;
  saveManualVideo(params: { storyId: string; fileUrl?: string; youtubeUrl?: string }): Promise<VideoRecord>;
  generateVideo?(params: { storyId: string; prompts: string[] }): Promise<{ jobId: string }>;
}
```
**Current Implementation**: `ManualVideoProvider` (V1).
**Phase 4 Implementation**: `UseAPIVideoProvider` (Google Flow automation).

---

### 3. `YouTubeProvider` (`lib/platforms/youtube.ts`)
```typescript
export interface YouTubeProvider {
  name: string;
  isConfigured(): boolean;
  getAuthUrl(): string;
  testConnection(): Promise<{ connected: boolean; channelName?: string; error?: string }>;
  uploadVideo(params: { videoPath: string; title: string; description: string; tags: string[] }): Promise<{ videoId: string; url: string }>;
}
```
**Phase 2 Implementation**: `YouTubeOAuthProvider` with official Google OAuth 2.0.

---

### 4. `MetaProvider` (`lib/platforms/meta.ts`)
```typescript
export interface MetaProvider {
  name: string;
  isConfigured(): boolean;
  publishReel(params: { videoUrl: string; caption: string; hashtags: string }): Promise<{ publicationId: string; url: string }>;
}
```
**Phase 3 Implementation**: `MetaInstagramProvider` & `MetaFacebookProvider` via Meta Graph API.
