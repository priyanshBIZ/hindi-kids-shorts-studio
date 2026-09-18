export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiStatusItem {
  service: string;
  name: string;
  status: "CONNECTED" | "NOT_CONFIGURED" | "ERROR" | "MANUAL";
  details?: string;
  model?: string;
  canTest: boolean;
}

export interface ApiStatusResponse {
  gemini: ApiStatusItem;
  geminiTTS: ApiStatusItem;
  flow: ApiStatusItem;
  youtube: ApiStatusItem;
  instagram: ApiStatusItem;
  facebook: ApiStatusItem;
}
