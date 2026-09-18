import { geminiAIProvider } from "../lib/ai/gemini";
import { generateDailyStory } from "../lib/ai/story-generator";

async function main() {
  console.log("1. Testing Health & Connectivity...");
  const health = await geminiAIProvider.testConnection();
  console.log("Health result:", health);

  console.log("\n2. Testing Story Generation with Gemini...");
  const story = await generateDailyStory({
    theme: "A cheerful little monkey named Chintu learning to share mangoes",
    characterName: "Chintu the monkey",
    moral: "Sharing brings happiness to all",
  });

  console.log("\n✅ Story Successfully Generated:");
  console.log(`Title: ${story.title}`);
  console.log(`Moral: ${story.moral}`);
  console.log(`Scenes generated: ${story.scenes.length}`);
  console.log(`Scene 1 Prompt: ${story.scenes[0].videoPrompt.substring(0, 100)}...`);
  console.log(`Scene 1 Voiceover: ${story.scenes[0].narration}`);
}

main().catch(console.error);
