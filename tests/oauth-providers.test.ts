import { describe, it, expect } from "vitest";
import { youtubeOAuthProvider } from "../lib/platforms/youtube";
import { metaInstagramProvider } from "../lib/platforms/meta";

describe("OAuth Platform Providers", () => {
  it("should have YouTube provider defined with valid interface", () => {
    expect(youtubeOAuthProvider.name).toBe("YouTube Shorts Official API");
    expect(typeof youtubeOAuthProvider.getAuthUrl).toBe("function");
    expect(typeof youtubeOAuthProvider.getConnectionStatus).toBe("function");
  });

  it("should have Meta Instagram provider defined with valid interface", () => {
    expect(metaInstagramProvider.name).toBe("Instagram Reels Official Graph API");
    expect(typeof metaInstagramProvider.getAuthUrl).toBe("function");
    expect(typeof metaInstagramProvider.getConnectionStatus).toBe("function");
  });

  it("should return not configured when credentials are absent", async () => {
    const ytStatus = await youtubeOAuthProvider.getConnectionStatus();
    expect(ytStatus.connected).toBe(false);

    const igStatus = await metaInstagramProvider.getConnectionStatus();
    expect(igStatus.connected).toBe(false);
  });
});
