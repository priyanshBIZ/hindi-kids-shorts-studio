import { NextRequest, NextResponse } from "next/server";
import { generateDailyStory } from "@/lib/ai/story-generator";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/stories/batch
 * Generates a batch of 7 stories for the upcoming week (Saturday through Friday)
 * and schedules each one for 10:00 AM on consecutive days.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const startDate = body.startDate ? new Date(body.startDate) : new Date();

    // Reset start date time to 10:00 AM
    startDate.setHours(10, 0, 0, 0);

    const generatedStories = [];

    // Generate 7 stories, assigning scheduledFor to consecutive days at 10:00 AM
    for (let i = 0; i < 7; i++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(startDate.getDate() + i);

      try {
        const story = await generateDailyStory({});
        
        // Update the story scheduledFor date to 10:00 AM on day i
        const updatedStory = await prisma.story.update({
          where: { id: story.id },
          data: { scheduledFor: scheduledDate },
        });

        generatedStories.push({
          id: updatedStory.id,
          title: updatedStory.title,
          scheduledFor: scheduledDate,
          dayOfWeek: scheduledDate.toLocaleDateString("en-US", { weekday: "long" }),
        });
      } catch (genErr: unknown) {
        console.error(`[Batch Gen] Error generating story ${i + 1}:`, genErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated and scheduled ${generatedStories.length} stories for daily 10:00 AM publishing!`,
      data: generatedStories,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Batch story generation failed";
    console.error("[Batch Gen] Error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
