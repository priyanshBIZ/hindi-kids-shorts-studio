import { describe, it, expect } from "vitest";
import { StorySchema, SceneSchema, sanitizeJsonResponse } from "../lib/validation/story.schema";

describe("Story Validation & Sanitization", () => {
  it("should sanitize raw JSON wrapped in markdown fences", () => {
    const rawMarkdown = "```json\n{\n  \"title\": \"गज्जू और नन्ही चिड़िया\",\n  \"concept\": \"हाथी की कहानी\"\n}\n```";
    const sanitized = sanitizeJsonResponse(rawMarkdown);
    expect(sanitized).toBe('{\n  "title": "गज्जू और नन्ही चिड़िया",\n  "concept": "हाथी की कहानी"\n}');
  });

  it("should strip trailing commas before closing braces", () => {
    const rawWithTrailing = '{"title": "गज्जू", "concept": "एक कहानी",}';
    const sanitized = sanitizeJsonResponse(rawWithTrailing);
    expect(JSON.parse(sanitized)).toEqual({ title: "गज्जू", concept: "एक कहानी" });
  });

  it("should validate a complete valid story schema", () => {
    const validStory = {
      title: "गज्जू और नन्ही चिड़िया",
      concept: "एक छोटा हाथी एक गिरी हुई नन्ही चिड़िया की मदद करता है।",
      moral: "दूसरों की मदद करने से सच्ची खुशी मिलती है।",
      ageGroup: "4-8",
      durationSeconds: 30,
      scenes: [
        {
          sceneNumber: 1,
          duration: 6,
          visualDescription: "Baby elephant walking in a lush sunlit cartoon forest with bright flowers.",
          videoPrompt: "Cute high-quality 3D children's animation. Baby elephant Gajju walking happily.",
          narration: "एक सुंदर जंगल में रहता था गज्जू हाथी!",
        },
        {
          sceneNumber: 2,
          duration: 6,
          visualDescription: "Baby elephant finds a small baby bird on the green forest floor.",
          videoPrompt: "Cute high-quality 3D children's animation. Elephant looking gently at tiny bird.",
          narration: "अरे देखो! एक नन्ही सी चिड़िया ज़मीन पर परेशान थी।",
        },
        {
          sceneNumber: 3,
          duration: 6,
          visualDescription: "Elephant gently lifts bird with trunk.",
          videoPrompt: "Cute high-quality 3D children's animation. Elephant gently lifting bird.",
          narration: "गज्जू ने अपनी सूंड से चिड़िया को उठाया।",
        },
        {
          sceneNumber: 4,
          duration: 6,
          visualDescription: "Elephant places bird back in nest with its mother.",
          videoPrompt: "Cute high-quality 3D children's animation. Bird safely in cozy tree nest.",
          narration: "चिड़िया अपने घोंसले में सुरक्षित पहुँच गई।",
        },
      ],
    };

    const parsed = StorySchema.safeParse(validStory);
    expect(parsed.success).toBe(true);
  });

  it("should reject stories with less than 3 scenes", () => {
    const invalidStory = {
      title: "गज्जू",
      concept: "कहानी",
      moral: "मदद",
      scenes: [
        {
          sceneNumber: 1,
          duration: 6,
          visualDescription: "Description here with enough length",
          videoPrompt: "Video prompt here with enough length",
          narration: "हिंदी आवाज़",
        },
      ],
    };

    const parsed = StorySchema.safeParse(invalidStory);
    expect(parsed.success).toBe(false);
  });
});
