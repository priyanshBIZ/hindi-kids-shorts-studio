import { NextRequest, NextResponse } from "next/server";
import { generateDailyStory } from "@/lib/ai/story-generator";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// High quality fallback curriculum for 7 days (Sat - Fri)
const CURRICULUM_PRESETS = [
  {
    title: "गज्जू और नन्ही चिड़िया (Gajju and the Little Bird)",
    theme: "Gajju the baby elephant helping a fallen baby sparrow get back to its nest.",
    characterName: "Gajju the baby elephant",
    moral: "Helping others brings true happiness",
  },
  {
    title: "चीकू गिलहरी और जादुई अखरोट (Chiku and the Magic Walnut)",
    theme: "Clever squirrel Chiku finding a huge walnut and sharing with forest friends.",
    characterName: "Chiku the squirrel",
    moral: "Sharing multiplies your joy",
  },
  {
    title: "मीनू चिड़िया का मजबूत घोंसला (Meenu Sparrow's Sturdy Nest)",
    theme: "Little sparrow Meenu building a windproof nest with Golu bear.",
    characterName: "Meenu sparrow & Golu bear",
    moral: "Teamwork makes any difficult task easy",
  },
  {
    title: "टॉमी और खोई बिल्ली (Tommy and the Lost Kitten)",
    theme: "Friendly puppy Tommy guiding a lost kitten back home in rain.",
    characterName: "Tommy the puppy",
    moral: "Kindness and courage light up dark paths",
  },
  {
    title: "सोनू खरगोश की सच्ची जीत (Sonu Rabbit's Real Victory)",
    theme: "Playful rabbit Sonu learning that persistence wins the race.",
    characterName: "Sonu the rabbit",
    moral: "Patience and practice lead to success",
  },
  {
    title: "रैम्बो मोर की जादुई छतरी (Rambo Peacock's Umbrella)",
    theme: "Shy peacock Rambo sharing his colorful feathers as an umbrella.",
    characterName: "Rambo the peacock",
    moral: "Your unique gifts are meant to bless others",
  },
  {
    title: "मिठू तोता और मीठा आम (Mithu Parrot and Sweet Mango)",
    theme: "Cheerful parrot Mithu finding a giant mango tree & inviting all birds.",
    characterName: "Mithu the parrot",
    moral: "Celebrating together makes food taste sweeter",
  },
];

/**
 * POST /api/stories/batch
 * Generates or schedules a batch of 7 stories for the 7-day weekly schedule.
 * Ultra-resilient: processes concurrently with fast fallback to ensure <10s response.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const startDateStr = body.startDate;
    
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setHours(10, 0, 0, 0);

    // Find existing default project
    let project = await prisma.project.findFirst({
      where: { name: "Hindi Kids Shorts" },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: "Hindi Kids Shorts",
          description: "Automated & Curated Hindi Children's Short Video Studio",
        },
      });
    }

    const results = [];

    // Process all 7 days concurrently using Promise.allSettled for maximum speed (<10 seconds total!)
    const tasks = CURRICULUM_PRESETS.map(async (preset, i) => {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(startDate.getDate() + i);

      try {
        // Try AI generation with preset seed
        const story = await generateDailyStory({
          theme: preset.theme,
          characterName: preset.characterName,
          moral: preset.moral,
        });

        // Set scheduledFor date
        const updated = await prisma.story.update({
          where: { id: story.id },
          data: { scheduledFor: scheduledDate },
        });

        return {
          id: updated.id,
          title: updated.title,
          scheduledFor: scheduledDate,
          dayIndex: i,
          status: "SUCCESS",
        };
      } catch (err: unknown) {
        // Safe fallback story creation if AI generation times out
        console.warn(`[Batch Gen] Fallback for day ${i + 1}:`, err);

        const created = await prisma.story.create({
          data: {
            projectId: project.id,
            title: preset.title,
            concept: preset.theme,
            moral: preset.moral,
            ageGroup: "4-8",
            durationSeconds: 30,
            storyText: preset.theme,
            scheduledFor: scheduledDate,
            status: "PROMPTS_READY",
            scenes: {
              create: [
                {
                  sceneNumber: 1,
                  duration: 6,
                  visualDescription: `Scene 1: ${preset.characterName} in a vibrant jungle setting.`,
                  videoPrompt: `Cute high-quality 3D children's animation. ${preset.characterName} walking happily on a sunlit path, vertical 9:16, Pixar style.`,
                  narration: `एक सुंदर जंगल में रहता था ${preset.characterName}!`,
                },
                {
                  sceneNumber: 2,
                  duration: 6,
                  visualDescription: `Scene 2: ${preset.theme}`,
                  videoPrompt: `Cute high-quality 3D children's animation. ${preset.theme}, vertical 9:16, bright colors.`,
                  narration: `वह हमेशा दूसरों की मदद के लिए तैयार रहता था।`,
                },
                {
                  sceneNumber: 3,
                  duration: 6,
                  visualDescription: `Scene 3: Overcoming challenge together.`,
                  videoPrompt: `Cute 3D animation, friendly animal interaction, warm lighting, vertical 9:16 composition.`,
                  narration: `सब मिलकर बहुत खुश हुए और गाना गाने लगे!`,
                },
              ],
            },
          },
        });

        return {
          id: created.id,
          title: created.title,
          scheduledFor: scheduledDate,
          dayIndex: i,
          status: "SUCCESS_FALLBACK",
        };
      }
    });

    const settled = await Promise.allSettled(tasks);
    
    for (const item of settled) {
      if (item.status === "fulfilled") {
        results.push(item.value);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated and scheduled ${results.length} stories for daily 10:00 AM publishing!`,
      data: results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Batch story generation failed";
    console.error("[Batch Gen] Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
