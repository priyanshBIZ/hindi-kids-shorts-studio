import { NextRequest, NextResponse } from "next/server";
import { generateDailyStory } from "@/lib/ai/story-generator";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// High quality multi-week curriculum library (4 complete rotating weeks with 100% unique characters & stories)
const CURRICULUM_WEEKS = [
  // Week 1 (Classic Forest Friends)
  [
    {
      title: "गज्जू और नन्ही चिड़िया (Gajju and the Little Bird)",
      theme: "Baby elephant Gajju helping a fallen baby sparrow get back to its nest high in the mango tree.",
      characterName: "Gajju the baby elephant",
      moral: "Helping others brings true happiness",
    },
    {
      title: "चीकू गिलहरी और जादुई अखरोट (Chiku and the Magic Walnut)",
      theme: "Clever squirrel Chiku finding a huge walnut and sharing with forest friends before winter.",
      characterName: "Chiku the squirrel",
      moral: "Sharing multiplies your joy",
    },
    {
      title: "मीनू चिड़िया का मजबूत घोंसला (Meenu Sparrow's Sturdy Nest)",
      theme: "Little sparrow Meenu building a windproof nest with gentle Golu bear.",
      characterName: "Meenu sparrow & Golu bear",
      moral: "Teamwork makes any difficult task easy",
    },
    {
      title: "टॉमी और खोई बिल्ली (Tommy and the Lost Kitten)",
      theme: "Friendly puppy Tommy guiding a lost kitten back home through a rainy day.",
      characterName: "Tommy the puppy",
      moral: "Kindness and courage light up dark paths",
    },
    {
      title: "सोनू खरगोश की सच्ची जीत (Sonu Rabbit's Real Victory)",
      theme: "Playful rabbit Sonu learning that persistence and patience win the race.",
      characterName: "Sonu the rabbit",
      moral: "Patience and practice lead to success",
    },
    {
      title: "रैम्बो मोर की जादुई छतरी (Rambo Peacock's Umbrella)",
      theme: "Shy peacock Rambo sharing his colorful feathers as an umbrella for woodland friends.",
      characterName: "Rambo the peacock",
      moral: "Your unique gifts are meant to bless others",
    },
    {
      title: "मिठू तोता और मीठा आम (Mithu Parrot and Sweet Mango)",
      theme: "Cheerful parrot Mithu finding a giant mango tree & inviting all birds to feast.",
      characterName: "Mithu the parrot",
      moral: "Celebrating together makes food taste sweeter",
    },
  ],
  // Week 2 (Next Week: Safari & Adventure)
  [
    {
      title: "शेरू और जादुई शब्द (Sheru Cub and the Magic Words)",
      theme: "Little lion cub Sheru discovers the power of polite words 'Please' and 'Thank you' in the savannah.",
      characterName: "Sheru the lion cub",
      moral: "Politeness and gentle words earn true respect",
    },
    {
      title: "मुन्नू बंदर और केला पार्टी (Munnu Monkey's Banana Party)",
      theme: "Playful monkey Munnu learns the beauty of waiting for your turn and sharing fresh ripe fruit.",
      characterName: "Munnu the monkey",
      moral: "Patience and self-control make games fun for all",
    },
    {
      title: "भोलू भालू और नदी का पुल (Bholu Bear's River Bridge)",
      theme: "Big friendly bear Bholu helps little forest creatures cross the rushing stream safely.",
      characterName: "Bholu the bear",
      moral: "True strength is used to protect and help the small",
    },
    {
      title: "टीना हिरण का साहस (Tina Fawn's Brave Jump)",
      theme: "Gentle spotted deer Tina finds the courage to rescue her best friend bunny's lost toy.",
      characterName: "Tina the fawn",
      moral: "Courage doesn't mean having no fear, it means helping anyway",
    },
    {
      title: "जुगनू की चमकीली रात (Jugnu Firefly's Guiding Light)",
      theme: "Tiny firefly Jugnu lights up the dark forest path for lost animal friends during night.",
      characterName: "Jugnu the firefly",
      moral: "No matter how small you are, you can make a big difference",
    },
    {
      title: "कालू कौआ और मटका (Kalu Crow and the Cold Water)",
      theme: "Clever crow Kalu shares freshly collected cold water with tired woodland birds in summer.",
      characterName: "Kalu the clever crow",
      moral: "Cleverness paired with generosity brings real harmony",
    },
    {
      title: "तारा और रात का गीत (Tara the Little Star's Song)",
      theme: "A cheerful little star descends close to the treetops to sing sweet bedtime lullabies to baby animals.",
      characterName: "Tara the baby star",
      moral: "Sweet words and peaceful thoughts bring sweet dreams",
    },
  ],
  // Week 3 (Ocean & Meadow Wonders)
  [
    {
      title: "गुनगुन मधुमक्खी का शहद (Gungun Honeybee's Golden Honey)",
      theme: "Hardworking bee Gungun teaches forest friends that daily steady work creates delicious sweet rewards.",
      characterName: "Gungun the honeybee",
      moral: "Hard work and dedication create great results",
    },
    {
      title: "नील डॉल्फ़िन और कछुआ दादा (Neel Dolphin & Turtle Grandpa)",
      theme: "Playful blue dolphin Neel helps an old wise sea turtle find the sunny coral reef.",
      characterName: "Neel the blue dolphin",
      moral: "Respecting and assisting elders brings blessings",
    },
    {
      title: "पप्पू पेंगुइन की बर्फ स्लाइड (Pappu Penguin's Ice Slide)",
      theme: "Happy penguin Pappu builds an ice amusement slide to cheer up a lonely polar bear cub.",
      characterName: "Pappu the penguin",
      moral: "Spreading laughter is the greatest gift of friendship",
    },
    {
      title: "चुनमुन चिड़िया का संगीत (Chunmun Finch's Morning Tune)",
      theme: "Cheerful finch Chunmun wakes the sleepy jungle with melodious songs of hope and joy.",
      characterName: "Chunmun the finch",
      moral: "Starting the day with gratitude brings endless energy",
    },
    {
      title: "ढोलू गेंडा और नन्हा गिलहरी (Dholu Rhino & Tiny Squirrel)",
      theme: "Mighty rhino Dholu learns to walk softly and gently so he doesn't disturb tiny flower blossoms.",
      characterName: "Dholu the rhino",
      moral: "Gentleness is the highest form of power",
    },
    {
      title: "रूपा ऊँट और मीठा झरना (Roopa Camel & the Desert Spring)",
      theme: "Friendly young camel Roopa guides tired desert travelers to a hidden fresh water oasis.",
      characterName: "Roopa the camel",
      moral: "Sharing resources with travelers is noble and blessed",
    },
    {
      title: "नटखट हिरण और सच की बात (Natkhat Fawn Speaks Truth)",
      theme: "Playful fawn Natkhat bravely admits he accidentally tipped over the honey jar, winning admiration.",
      characterName: "Natkhat the fawn",
      moral: "Speaking the truth sets your heart free and earns trust",
    },
  ],
  // Week 4 (Village Farm & Mountains)
  [
    {
      title: "पिंटू साही की फूलों वाली जैकेट (Pintu Hedgehog's Flower Vest)",
      theme: "Prickly hedgehog Pintu decorates his quills with soft flower petals so friends can hug him safely.",
      characterName: "Pintu the hedgehog",
      moral: "Thinking about others' comfort makes you truly lovable",
    },
    {
      title: "बाघा नन्हा बाघ और गेंद (Bagha Tiger Cub and the Ball)",
      theme: "Playful tiger cub Bagha discovers that rolling a bright red ball with friends is 10 times more fun than playing alone.",
      characterName: "Bagha the tiger cub",
      moral: "Playing together doubles the joy",
    },
    {
      title: "चीकू उल्लू और पहली सुबह (Cheenu Baby Owl's Sunshine)",
      theme: "Curious baby owl Cheenu stays awake for sunrise and marvels at colorful morning flowers.",
      characterName: "Cheenu the baby owl",
      moral: "Curiosity and looking at things with an open mind reveal new beauty",
    },
    {
      title: "जलेबी बछिया और बारिश (Jalebi the Calf & Rainbow Rain)",
      theme: "Playful calf Jalebi dances in the fresh monsoon rain and guides farm ducks to the pond.",
      characterName: "Jalebi the calf",
      moral: "Finding joy in nature's wonders keeps the spirit bright",
    },
    {
      title: "मोती टट्टू और पहाड़ का सफर (Moti Pony's Mountain Climb)",
      theme: "Patient little pony Moti takes careful steps on the rocky hill to deliver fresh berries to granny goat.",
      characterName: "Moti the pony",
      moral: "Carefulness and steady patience overcome steep hills",
    },
    {
      title: "रानी तितली का अनोखा नाच (Rani Butterfly's Wind Dance)",
      theme: "Graceful butterfly Rani teaches shy blooming buds how to sway happily with the wind.",
      characterName: "Rani the butterfly",
      moral: "Encouraging others helps them bloom to their fullest",
    },
    {
      title: "गोलू हाथी और तरबूज दावत (Golu Elephant's Watermelon Feast)",
      theme: "Baby elephant Golu splits a huge juicy watermelon equally among all his animal playmates.",
      characterName: "Golu the elephant",
      moral: "Equal sharing ensures everyone leaves with a full smile",
    },
  ],
];

/**
 * POST /api/stories/batch
 * Generates or schedules a batch of 7 stories for the 7-day weekly schedule.
 * Ultra-resilient: picks unique multi-week curriculum based on start date.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const startDateStr = body.startDate;
    
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    startDate.setHours(10, 0, 0, 0);

    // Calculate rotating week index from start date (Sept 19 = week 0, Sept 26 = week 1, etc.)
    const baseTime = new Date("2026-09-19T00:00:00Z").getTime();
    const weekIndex = Math.max(0, Math.floor((startDate.getTime() - baseTime) / (7 * 24 * 60 * 60 * 1000)));
    const targetCurriculum = CURRICULUM_WEEKS[weekIndex % CURRICULUM_WEEKS.length];

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
    const tasks = targetCurriculum.map(async (preset, i) => {
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
