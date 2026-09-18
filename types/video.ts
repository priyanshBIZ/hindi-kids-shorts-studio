export type VideoStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";
export type VideoProviderType = "MANUAL" | "USEAPI";

export interface VideoRecord {
  id?: string;
  storyId: string;
  fileUrl?: string | null;
  youtubeUrl?: string | null;
  duration?: number | null;
  aspectRatio: string;
  status: VideoStatus;
  flowCreditsUsed?: number | null;
  provider: VideoProviderType;
  createdAt?: Date;
}

export interface FlowPromptPackage {
  storyTitle: string;
  masterStyle: string;
  characterConsistency: string;
  totalScenes: number;
  totalDuration: number;
  scenes: {
    sceneNumber: number;
    duration: number;
    visualDescription: string;
    videoPrompt: string;
    narration: string;
  }[];
}
