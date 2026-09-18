import { describe, it, expect } from "vitest";
import { buildFlowPromptPackage } from "../lib/ai/prompt-generator";

describe("Flow Scene Prompt Synthesis", () => {
  it("should construct a Flow prompt package with master style and consistency rules", () => {
    const mockStory = {
      title: "गज्जू और नन्ही चिड़िया",
      durationSeconds: 30,
      scenes: [
        {
          sceneNumber: 1,
          duration: 6,
          visualDescription: "Cute baby elephant walking happily.",
          videoPrompt: "Cute 3D animation of baby elephant walking in jungle.",
          narration: "एक सुंदर जंगल में रहता था गज्जू हाथी!",
        },
        {
          sceneNumber: 2,
          duration: 6,
          visualDescription: "Elephant spots a little bird.",
          videoPrompt: "Cute 3D animation of elephant finding a shivering bird.",
          narration: "अरे देखो! एक नन्ही सी चिड़िया ज़मीन पर थी।",
        },
      ],
    };

    const pkg = buildFlowPromptPackage(mockStory);
    expect(pkg.storyTitle).toBe("गज्जू और नन्ही चिड़िया");
    expect(pkg.totalScenes).toBe(2);
    expect(pkg.masterStyle).toContain("3D");
    expect(pkg.characterConsistency).toBeDefined();
    expect(pkg.scenes[0].videoPrompt).toBeDefined();
  });
});
