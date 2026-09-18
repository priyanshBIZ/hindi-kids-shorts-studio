import { VideoProvider } from "./types";
import { VideoRecord } from "@/types/video";

/**
 * UseAPIVideoProvider - Phase 4 Integration Stub
 * 
 * Provides structured stubs for automating Google Flow / Veo generation via UseAPI.
 * In Phase 1, this returns NOT_CONFIGURED or stubbed statuses without attempting mock executions.
 */
export class UseAPIVideoProvider implements VideoProvider {
  name = "UseAPI Google Flow Automation";
  isAutomated = true;

  private token: string | undefined;
  private baseUrl: string;

  constructor() {
    this.token = process.env.USEAPI_TOKEN;
    this.baseUrl = process.env.USEAPI_BASE_URL || "https://api.useapi.net";
  }

  isConfigured(): boolean {
    return Boolean(this.token && this.token.trim().length > 0);
  }

  async saveManualVideo(_params: {
    storyId: string;
    fileUrl?: string;
    youtubeUrl?: string;
    duration?: number;
  }): Promise<VideoRecord> {
    throw new Error("Manual video saving is handled by ManualVideoProvider");
  }

  async generateVideo(_params: {
    storyId: string;
    prompts: string[];
  }): Promise<{ jobId: string }> {
    if (!this.isConfigured()) {
      throw new Error("UseAPI is not configured (Phase 4 integration). Please use the Manual Google Flow workflow in Phase 1.");
    }
    // Stub for Phase 4
    throw new Error("UseAPI automated generation will be implemented in Phase 4.");
  }

  async getJobStatus(_jobId: string): Promise<{ status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"; progress?: number; videoUrl?: string }> {
    if (!this.isConfigured()) {
      throw new Error("UseAPI is not configured.");
    }
    return { status: "FAILED" };
  }
}

export const useAPIVideoProvider = new UseAPIVideoProvider();
