import { google } from "googleapis";
import { prisma } from "../database/prisma";
import fs from "fs";
import path from "path";

export interface YouTubeConnectionStatus {
  connected: boolean;
  channelId?: string;
  channelTitle?: string;
  channelAvatar?: string;
  expiresAt?: Date | null;
  error?: string;
}

export class YouTubeOAuthProvider {
  name = "YouTube Shorts Official API";

  private getClientId(): string | undefined {
    return process.env.YOUTUBE_CLIENT_ID?.replace(/^["']|["']$/g, "").trim();
  }

  private getClientSecret(): string | undefined {
    return process.env.YOUTUBE_CLIENT_SECRET?.replace(/^["']|["']$/g, "").trim();
  }

  public getRedirectUri(req?: any): string {
    const envUri = process.env.YOUTUBE_REDIRECT_URI?.replace(/^["']|["']$/g, "").trim();
    if (envUri && envUri.length > 0) {
      return envUri;
    }

    if (req) {
      const host = req.headers?.get?.("x-forwarded-host") || req.headers?.get?.("host");
      const proto = req.headers?.get?.("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
      if (host) {
        return `${proto}://${host}/api/auth/callback/youtube`;
      }
    }

    const appUrl = process.env.APP_URL?.replace(/^["']|["']$/g, "").trim() || "http://localhost:3000";
    return `${appUrl}/api/auth/callback/youtube`;
  }

  public isConfigured(): boolean {
    const cid = this.getClientId();
    const sec = this.getClientSecret();
    return Boolean(cid && cid.length > 0 && sec && sec.length > 0);
  }

  public getOAuthClient(req?: any) {
    return new google.auth.OAuth2(
      this.getClientId(),
      this.getClientSecret(),
      this.getRedirectUri(req)
    );
  }

  public getAuthUrl(req?: any): string {
    if (!this.isConfigured()) return "#";

    const oauth2Client = this.getOAuthClient(req);
    const scopes = [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  public async handleOAuthCallback(code: string): Promise<YouTubeConnectionStatus> {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch Channel info
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelRes = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channel = channelRes.data.items?.[0];
    const channelId = channel?.id || "unknown_channel";
    const channelTitle = channel?.snippet?.title || "My YouTube Channel";
    const channelAvatar = channel?.snippet?.thumbnails?.default?.url || undefined;

    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

    // Persist to OAuthAccount in database
    await prisma.oAuthAccount.upsert({
      where: { platform: "YOUTUBE" },
      create: {
        platform: "YOUTUBE",
        accountId: channelId,
        accountName: channelTitle,
        accountAvatar: channelAvatar,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || null,
        expiresAt,
        scope: tokens.scope || null,
      },
      update: {
        accountId: channelId,
        accountName: channelTitle,
        accountAvatar: channelAvatar,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        scope: tokens.scope || undefined,
      },
    });

    return {
      connected: true,
      channelId,
      channelTitle,
      channelAvatar,
      expiresAt,
    };
  }

  public async getConnectionStatus(): Promise<YouTubeConnectionStatus> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        error: "YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET not configured in .env",
      };
    }

    const account = await prisma.oAuthAccount.findUnique({
      where: { platform: "YOUTUBE" },
    });

    if (!account || !account.accessToken) {
      return {
        connected: false,
        error: "YouTube account not connected. Click 'Connect Channel' to authenticate.",
      };
    }

    return {
      connected: true,
      channelId: account.accountId || undefined,
      channelTitle: account.accountName || "Connected Channel",
      channelAvatar: account.accountAvatar || undefined,
      expiresAt: account.expiresAt,
    };
  }

  public async disconnect(): Promise<boolean> {
    try {
      await prisma.oAuthAccount.deleteMany({
        where: { platform: "YOUTUBE" },
      });
      return true;
    } catch {
      return false;
    }
  }

  private async getAuthorizedClient() {
    const account = await prisma.oAuthAccount.findUnique({
      where: { platform: "YOUTUBE" },
    });

    if (!account || !account.accessToken) {
      throw new Error("No YouTube account connected. Please connect your channel in Settings.");
    }

    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken || undefined,
    });

    // Check if token expired and refresh
    if (account.expiresAt && account.expiresAt.getTime() < Date.now()) {
      if (account.refreshToken) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        await prisma.oAuthAccount.update({
          where: { platform: "YOUTUBE" },
          data: {
            accessToken: credentials.access_token || account.accessToken,
            expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
          },
        });
      }
    }

    return oauth2Client;
  }

  public async publishShort(params: {
    storyId: string;
    filePath: string;
    title: string;
    description: string;
    tags: string[];
    privacyStatus?: "public" | "unlisted" | "private";
  }): Promise<{ videoId: string; youtubeUrl: string }> {
    const oauth2Client = await this.getAuthorizedClient();
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    let absoluteFilePath = params.filePath;
    if (params.filePath.startsWith("/uploads/")) {
      absoluteFilePath = path.join(process.cwd(), "public", params.filePath);
    }

    if (!fs.existsSync(absoluteFilePath)) {
      throw new Error(`Video file not found at: ${absoluteFilePath}`);
    }

    const fileStream = fs.createReadStream(absoluteFilePath);

    // Ensure title includes #Shorts for YouTube algorithm
    const titleWithShorts = params.title.includes("#Shorts")
      ? params.title
      : `${params.title} #Shorts`;

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: titleWithShorts.substring(0, 100),
          description: `${params.description}\n\n#Shorts #HindiKahaniya #KidsStories`,
          tags: params.tags,
          categoryId: "27", // Education (or 1 = Film & Animation)
          defaultLanguage: "hi",
        },
        status: {
          privacyStatus: params.privacyStatus || "public",
          selfDeclaredMadeForKids: true,
        },
      },
      media: {
        body: fileStream,
      },
    });

    const videoId = res.data.id;
    if (!videoId) {
      throw new Error("Failed to receive video ID from YouTube API");
    }

    const youtubeUrl = `https://youtube.com/shorts/${videoId}`;

    // Record in publications & video table
    await prisma.publication.create({
      data: {
        storyId: params.storyId,
        platform: "YOUTUBE",
        status: "PUBLISHED",
        platformUrl: youtubeUrl,
        publishedAt: new Date(),
      },
    });

    await prisma.video.upsert({
      where: { id: params.storyId }, // Fallback query
      create: {
        storyId: params.storyId,
        youtubeUrl,
        fileUrl: params.filePath,
        status: "READY",
        provider: "YOUTUBE_OAUTH",
      },
      update: {
        youtubeUrl,
        status: "READY",
      },
    }).catch(async () => {
      // If storyId is not PK on video, update by storyId
      await prisma.video.updateMany({
        where: { storyId: params.storyId },
        data: { youtubeUrl, status: "READY" },
      });
    });

    await prisma.story.update({
      where: { id: params.storyId },
      data: { status: "PUBLISHED" },
    });

    return {
      videoId,
      youtubeUrl,
    };
  }
}

export const youtubeOAuthProvider = new YouTubeOAuthProvider();
