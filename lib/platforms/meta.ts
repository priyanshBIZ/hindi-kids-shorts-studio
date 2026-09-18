import { prisma } from "../database/prisma";

export interface MetaConnectionStatus {
  connected: boolean;
  accountId?: string;
  accountName?: string;
  accountAvatar?: string;
  expiresAt?: Date | null;
  error?: string;
}

export class MetaInstagramProvider {
  name = "Instagram Reels Official Graph API";

  private getAppId(): string | undefined {
    return process.env.META_APP_ID?.replace(/^["']|["']$/g, "").trim();
  }

  private getAppSecret(): string | undefined {
    return process.env.META_APP_SECRET?.replace(/^["']|["']$/g, "").trim();
  }

  private getRedirectUri(): string {
    return (
      process.env.META_REDIRECT_URI?.replace(/^["']|["']$/g, "").trim() ||
      `${process.env.APP_URL || "http://localhost:3000"}/api/auth/callback/meta`
    );
  }

  public isConfigured(): boolean {
    const appId = this.getAppId();
    const appSec = this.getAppSecret();
    return Boolean(appId && appId.length > 0 && appSec && appSec.length > 0);
  }

  public getAuthUrl(): string {
    if (!this.isConfigured()) return "#";

    const appId = this.getAppId();
    const redirectUri = encodeURIComponent(this.getRedirectUri());
    const scopes = encodeURIComponent(
      "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management"
    );

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`;
  }

  public async handleOAuthCallback(code: string): Promise<MetaConnectionStatus> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const redirectUri = this.getRedirectUri();

    // 1. Exchange auth code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message || "Failed to exchange Meta OAuth code");
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for 60-day long-lived access token
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const accessToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000; // ~60 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 3. Discover Instagram Business Account connected to Facebook Pages
    const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    let igAccountId = "unknown_instagram";
    let igUsername = "Connected Instagram";
    let igAvatar: string | undefined = undefined;

    if (accountsData.data && accountsData.data.length > 0) {
      for (const page of accountsData.data) {
        if (page.instagram_business_account) {
          igAccountId = page.instagram_business_account.id;
          igUsername = page.instagram_business_account.username || page.name;
          igAvatar = page.instagram_business_account.profile_picture_url;
          break;
        }
      }
    }

    // 4. Save to OAuthAccount in database
    await prisma.oAuthAccount.upsert({
      where: { platform: "INSTAGRAM" },
      create: {
        platform: "INSTAGRAM",
        accountId: igAccountId,
        accountName: `@${igUsername.replace(/^@/, "")}`,
        accountAvatar: igAvatar,
        accessToken,
        expiresAt,
        scope: "instagram_content_publish",
      },
      update: {
        accountId: igAccountId,
        accountName: `@${igUsername.replace(/^@/, "")}`,
        accountAvatar: igAvatar,
        accessToken,
        expiresAt,
        scope: "instagram_content_publish",
      },
    });

    return {
      connected: true,
      accountId: igAccountId,
      accountName: `@${igUsername.replace(/^@/, "")}`,
      accountAvatar: igAvatar,
      expiresAt,
    };
  }

  public async getConnectionStatus(): Promise<MetaConnectionStatus> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        error: "META_APP_ID and META_APP_SECRET not configured in .env",
      };
    }

    const account = await prisma.oAuthAccount.findUnique({
      where: { platform: "INSTAGRAM" },
    });

    if (!account || !account.accessToken) {
      return {
        connected: false,
        error: "Instagram account not connected. Click 'Connect Instagram' to authenticate.",
      };
    }

    return {
      connected: true,
      accountId: account.accountId || undefined,
      accountName: account.accountName || "Connected Instagram",
      accountAvatar: account.accountAvatar || undefined,
      expiresAt: account.expiresAt,
    };
  }

  public async disconnect(): Promise<boolean> {
    try {
      await prisma.oAuthAccount.deleteMany({
        where: { platform: "INSTAGRAM" },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Publish Instagram Reel using official Meta Graph API 2-Step Async Flow:
   * 1. POST /{ig-user-id}/media (create media container)
   * 2. Poll until container status is FINISHED
   * 3. POST /{ig-user-id}/media_publish
   */
  public async publishReel(params: {
    storyId: string;
    videoUrl: string;
    caption: string;
    hashtags?: string;
  }): Promise<{ publicationId: string; reelUrl: string }> {
    const account = await prisma.oAuthAccount.findUnique({
      where: { platform: "INSTAGRAM" },
    });

    if (!account || !account.accessToken || !account.accountId) {
      throw new Error("No Instagram account connected. Please connect your Instagram profile in Settings.");
    }

    const igUserId = account.accountId;
    const accessToken = account.accessToken;

    // Format caption with hashtags
    const fullCaption = `${params.caption}\n\n${params.hashtags || ""}`.trim();

    // Ensure video URL is publicly accessible for Instagram ingestion
    let publicVideoUrl = params.videoUrl;
    if (publicVideoUrl.startsWith("/uploads/")) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      publicVideoUrl = `${appUrl}${publicVideoUrl}`;
    }

    // Step 1: Create media container
    const createContainerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
    const containerRes = await fetch(createContainerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: publicVideoUrl,
        caption: fullCaption,
        share_to_feed: true,
        access_token: accessToken,
      }),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || containerData.error) {
      throw new Error(containerData.error?.message || "Failed to create Instagram Reel container");
    }

    const containerId = containerData.id;

    // Step 2: Poll container status until FINISHED (up to 60s)
    let isReady = false;
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const statusUrl = `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`;
      const statusRes = await fetch(statusUrl);
      const statusData = await statusRes.json();

      if (statusData.status_code === "FINISHED") {
        isReady = true;
        break;
      } else if (statusData.status_code === "ERROR") {
        throw new Error("Instagram Reel media container processing failed on Meta servers");
      }
    }

    if (!isReady) {
      throw new Error("Timeout waiting for Instagram Reel container processing to finish.");
    }

    // Step 3: Publish container
    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) {
      throw new Error(publishData.error?.message || "Failed to publish Instagram Reel");
    }

    const reelId = publishData.id;
    const reelUrl = `https://www.instagram.com/reel/${reelId}`;

    // Record in publications table
    await prisma.publication.create({
      data: {
        storyId: params.storyId,
        platform: "INSTAGRAM",
        status: "PUBLISHED",
        platformUrl: reelUrl,
        publishedAt: new Date(),
      },
    });

    return {
      publicationId: reelId,
      reelUrl,
    };
  }
}

export class MetaFacebookProvider {
  name = "Facebook Pages Official API";

  public isConfigured(): boolean {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    return Boolean(appId && appId.trim().length > 0 && appSecret && appSecret.trim().length > 0);
  }

  public async getConnectionStatus() {
    return {
      connected: this.isConfigured(),
      details: this.isConfigured() ? "Meta App Configured" : "Not configured",
    };
  }
}

export const metaInstagramProvider = new MetaInstagramProvider();
export const metaFacebookProvider = new MetaFacebookProvider();
