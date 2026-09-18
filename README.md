# Hindi Kids Shorts Studio 🐘✨

> Production-quality private dashboard for creating, managing, and publishing 3D animated short Hindi children's stories for YouTube Shorts, Instagram Reels, and Facebook Reels.

---

## 🌟 Overview & Workflow (Phase 1 V1)

```
                       DAILY WORKFLOW
                             │
                             ▼
                    Generate story/idea
                     (Gemini 2.5/3.1)
                             │
                             ▼
                 Generate scenes + prompts
                 (3D Pixar Style Vertical 9:16)
                             │
                             ▼
                    Generate Hindi script
                    (Devanagari Voiceover)
                             │
                             ▼
                    YOU copy into Flow
                  (Manual Flow Checkpoint)
                             │
                             ▼
                    Generate final video
                             │
                             ▼
              Upload to dummy YouTube manually
              OR Upload MP4 directly to Studio
                             │
                             ▼
           Paste YouTube Short URL in dashboard
                             │
                             ▼
                     Dashboard records it
                             │
                             ▼
           Generate platform-specific metadata
                 (YouTube / IG / FB)
                             │
                             ▼
                     REVIEW & APPROVE
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
              YouTube    Instagram   Facebook
```

In Phase 1, external publishing and Google Flow generation are handled with zero credential exposure via a **Manual Video Checkpoint**, letting you test video quality and metadata before adding OAuth.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- npm or yarn

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and supply your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL="file:./dev.db"
```

### 3. Database Initialization & Seed
```bash
# Push schema to SQLite
npx prisma db push

# (Optional) Seed initial demo story: "गज्जू और नन्ही चिड़िया"
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated test suite covering story validation, prompt synthesis, and metadata schemas:
```bash
npm test
```

---

## 📁 Repository Structure

```
hindi-kids-shorts/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx      # Main dashboard & pipeline tracker
│   │   ├── content/                # Content library & story creator wizard
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx       # Story Studio, Flow prompts, video checkpoint, metadata
│   │   ├── calendar/page.tsx       # Content publishing calendar
│   │   ├── analytics/page.tsx      # Token usage & AI cost tracking
│   │   └── settings/               # API status & provider configuration
│   ├── api/                        # Server-side API routes (Gemini AI, Uploads, Health)
│   └── layout.tsx
├── components/                     # Modular UI components (Dashboard, Story, Video, Metadata)
├── lib/
│   ├── ai/                         # GeminiAIProvider, Story, Script, and Metadata generators
│   ├── video/                      # ManualVideoProvider & UseAPI stub
│   ├── platforms/                  # YouTube & Meta provider interfaces
│   ├── database/                   # Prisma client singleton
│   └── storage/                    # Local storage provider for MP4s
├── prompts/                        # Master prompt templates (System, Story, Script, Video, Social)
├── prisma/
│   └── schema.prisma               # Relational database schema
└── docs/                           # Architecture, API integrations, and deployment guides
```

---

## 🗺️ Roadmap

- **Phase 1 (Current)**: Gemini story & script engine, structured 3D Flow prompts, manual video checkpoint, multi-platform metadata generator, content calendar, and analytics.
- **Phase 2**: Official YouTube Data API v3 OAuth integration and 1-click video publishing.
- **Phase 3**: Official Meta Graph API integration for Instagram Reels & Facebook Pages.
- **Phase 4**: Automated Google Flow / Veo generation via UseAPI provider.
