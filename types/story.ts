export type StoryStatus = 
  | "IDEA"
  | "STORY_GENERATED"
  | "PROMPTS_READY"
  | "VIDEO_PENDING"
  | "VIDEO_ADDED"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "FAILED";

export interface SceneItem {
  id?: string;
  storyId?: string;
  sceneNumber: number;
  duration: number;
  visualDescription: string;
  videoPrompt: string;
  narration: string;
}

export interface StoryGenerationRequest {
  theme?: string;
  characterName?: string;
  moral?: string;
  targetDuration?: number;
}

export interface StoryGenerationResponse {
  title: string;
  concept: string;
  moral: string;
  ageGroup: string;
  durationSeconds: number;
  storyText?: string;
  scenes: {
    sceneNumber: number;
    duration: number;
    visualDescription: string;
    videoPrompt: string;
    narration: string;
  }[];
}
