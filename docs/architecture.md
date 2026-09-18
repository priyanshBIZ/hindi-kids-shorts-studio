# System Architecture & Technical Design

## 1. High-Level Architecture

The **Hindi Kids Shorts Studio** is architected as a modular TypeScript/Next.js application with clean provider boundaries.

```mermaid
flowchart TD
    subgraph UI_Layer["Next.js App Router (Client & SSR)"]
        Dashboard["Dashboard & Today's Story"]
        StoryStudio["Story Studio & Scene Viewer"]
        FlowCheckpoint["Manual Video Checkpoint"]
        MetadataStudio["Platform Metadata Studio"]
        CalendarView["Content Calendar"]
        AnalyticsView["AI Cost & Token Analytics"]
    end

    subgraph API_Layer["Server-Side API Routes"]
        StoriesAPI["/api/stories"]
        VideoAPI["/api/stories/[id]/video"]
        MetadataAPI["/api/stories/[id]/metadata"]
        HealthAPI["/api/health"]
        UploadAPI["/api/upload"]
    end

    subgraph Provider_Layer["Provider Abstractions"]
        AIProv["AIProvider (GeminiAIProvider)"]
        TTSProv["TTSProvider (GeminiTTSProvider)"]
        VidProv["VideoProvider (Manual / UseAPI)"]
        YTProv["YouTubeProvider (OAuth Stub)"]
        MetaProv["MetaProvider (Instagram / Facebook)"]
        StoreProv["StorageProvider (LocalStorage)"]
    end

    subgraph Persistence["Data Layer"]
        PrismaDB[("SQLite / PostgreSQL Database")]
        FileStore[("Local MP4 Storage")]
    end

    UI_Layer --> API_Layer
    API_Layer --> Provider_Layer
    Provider_Layer --> Persistence
```

## 2. Status Transitions

Stories advance through explicit states:
1. `IDEA` -> Story concept generated.
2. `STORY_GENERATED` -> Full narration and scene breakdown ready.
3. `PROMPTS_READY` -> Master style and per-scene Google Flow prompts synthesized.
4. `VIDEO_PENDING` -> Prompts copied, waiting for video generation in Google Flow.
5. `VIDEO_ADDED` -> MP4 uploaded or YouTube Short URL pasted into dashboard.
6. `READY_TO_PUBLISH` -> YouTube, Instagram, and Facebook social metadata generated and approved.
7. `PUBLISHED` -> Video confirmed live on social platforms.
