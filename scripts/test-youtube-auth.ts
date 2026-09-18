import { youtubeOAuthProvider } from "../lib/platforms/youtube";

async function main() {
  console.log("Checking YouTube OAuth configuration...");
  const isConfigured = youtubeOAuthProvider.isConfigured();
  console.log("Is Configured:", isConfigured);

  if (isConfigured) {
    const authUrl = youtubeOAuthProvider.getAuthUrl();
    console.log("✅ Google OAuth Consent URL successfully generated:");
    console.log(authUrl);
  }
}

main().catch(console.error);
