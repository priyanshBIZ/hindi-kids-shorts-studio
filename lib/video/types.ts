import { VideoRecord } from "@/types/video";

export interface VideoProvider {
  name: string;
  isAutomated: boolean;
  saveManualVideo(params: {
    storyId: string;
    fileUrl?: string;
    youtubeUrl?: string;
    duration?: number;
  }): Promise<VideoRecord>;
  generateVideo?(params: {
    storyId: string;
    prompts: string[];
  }): Promise<{ jobId: string }>;
  getJobStatus?(jobId: string): Promise<{ status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"; progress?: number; videoUrl?: string }>;
}
