import { FlowPromptPackage } from "@/types/video";

export const DEFAULT_MASTER_STYLE =
  "Cute high-quality 3D children's animation. Bright friendly environment, soft cinematic volumetric lighting, expressive but simple characters, rounded cartoon design, warm family-friendly atmosphere, vibrant pastel colors, vertical 9:16 composition. No text inside the video, no watermark, no logos. Consistent character appearance across all scenes.";

export const DEFAULT_CHARACTER_CONSISTENCY =
  "Maintain the exact same character design, proportions, clothing, skin texture, fur color, and signature accessories throughout the entire story across every scene.";

export function buildFlowPromptPackage(story: {
  title: string;
  durationSeconds: number;
  scenes: {
    sceneNumber: number;
    duration: number;
    visualDescription: string;
    videoPrompt: string;
    narration: string;
  }[];
}): FlowPromptPackage {
  const masterStyle = DEFAULT_MASTER_STYLE;
  const characterConsistency = DEFAULT_CHARACTER_CONSISTENCY;

  return {
    storyTitle: story.title,
    masterStyle,
    characterConsistency,
    totalScenes: story.scenes.length,
    totalDuration: story.durationSeconds,
    scenes: story.scenes.map((scene) => {
      let prompt = scene.videoPrompt;
      if (!prompt.includes("3D") && !prompt.includes("animation")) {
        prompt = `${masterStyle}\n\nSCENE ${scene.sceneNumber}: ${scene.visualDescription}\n\n${characterConsistency}`;
      }
      return {
        ...scene,
        videoPrompt: prompt,
      };
    }),
  };
}
