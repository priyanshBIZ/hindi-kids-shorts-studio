import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hindi Kids Shorts Studio database...");

  // Create or get default project
  const project = await prisma.project.upsert({
    where: { id: "default-project" },
    update: {},
    create: {
      id: "default-project",
      name: "Hindi Kids Shorts",
      description: "Production studio for Hindi children's animated Shorts and Reels",
    },
  });

  // Create sample story: गज्जू और नन्ही चिड़िया
  const sampleStory = await prisma.story.create({
    data: {
      projectId: project.id,
      title: "गज्जू और नन्ही चिड़िया (Gajju and the Little Bird)",
      concept: "एक छोटा हाथी एक पेड़ से गिरी नन्ही चिड़िया की मदद करता है और उसे प्यार से उसके घोंसले में वापस पहुँचाता है।",
      language: "hi",
      ageGroup: "4-8",
      moral: "दूसरों की मदद करने से सच्ची खुशी और सच्चे दोस्त मिलते हैं।",
      storyText: "एक सुंदर हरे-भरे जंगल में रहता था नन्हा हाथी गज्जू! एक दिन खेलते-खेलते उसने देखा कि एक छोटी नन्ही चिड़िया ज़मीन पर गिरकर रो रही थी। गज्जू ने बिना डरे अपनी लंबी सूंड को आगे बढ़ाया और बड़े प्यार से नन्ही चिड़िया को उठाया। उसने चिड़िया को धीरे से पेड़ पर बने उसके घोंसले में पहुँचा दिया। चिड़िया खुशी से चहकने लगी और दोनों पक्के दोस्त बन गए!",
      durationSeconds: 30,
      status: "READY_TO_PUBLISH",
      scenes: {
        create: [
          {
            sceneNumber: 1,
            duration: 6,
            visualDescription: "Cute chubby baby elephant named Gajju with big playful ears walking merrily along a sunlit jungle path with vibrant pink and yellow flowers.",
            videoPrompt: "Cute high-quality 3D children's animation. A cute baby elephant named Gajju with soft grey skin, large playful ears, and cheerful warm brown eyes walking happily on a sunlit jungle path with bright pink flowers. Vertical 9:16 composition, soft cinematic volumetric lighting, Pixar-style rounded friendly character design, no text, no watermark, no logos.",
            narration: "एक सुंदर हरे-भरे जंगल में रहता था नन्हा हाथी गज्जू! वह बहुत दयालु और खुशमिज़ाज था।",
          },
          {
            sceneNumber: 2,
            duration: 6,
            visualDescription: "Gajju stops near a large blooming banyan tree, tilting his head with concern as he notices a tiny fluffy blue sparrow chick shivering on the grass.",
            videoPrompt: "Cute high-quality 3D children's animation. Baby elephant Gajju with expressive caring face bending down near a giant cartoon tree root, looking gently at a tiny fluffy blue baby bird on the lush green grass. Warm golden sunlight, shallow depth of field, vertical 9:16 framing, no text, no logos.",
            narration: "अरे देखो! एक नन्ही सी चिड़िया ज़मीन पर गिरकर परेशान थी। गज्जू तुरंत उसके पास गया।",
          },
          {
            sceneNumber: 3,
            duration: 6,
            visualDescription: "Gajju gently wraps the tip of his soft trunk around the little bird, lifting it carefully upwards like an elevator.",
            videoPrompt: "Cute high-quality 3D children's animation. Baby elephant Gajju carefully and gently cradling the tiny fluffy bird with the tip of his trunk, slowly elevating it toward the green tree branches. Cheerful magical sparkles in air, vertical 9:16, cute cartoon aesthetics, no text.",
            narration: "गज्जू ने अपनी सूंड आगे बढ़ाई और बड़े प्यार से नन्ही चिड़िया को ऊपर उठाया।",
          },
          {
            sceneNumber: 4,
            duration: 6,
            visualDescription: "Gajju safely places the baby bird into its cozy woven twig nest where its mother chirps with joy.",
            videoPrompt: "Cute high-quality 3D children's animation. Baby elephant placing the little bird into a cozy nest on a sunny branch. Mama bird chirping joyfully with hearts floating, Gajju smiling proudly. Vertical 9:16, vibrant pastel tones, warm lighting, no text.",
            narration: "वाह! चिड़िया अपने घोंसले में सुरक्षित पहुँच गई। माँ चिड़िया बहुत खुश हुई!",
          },
          {
            sceneNumber: 5,
            duration: 6,
            visualDescription: "Gajju and the birds happily singing and dancing together in the sunlit jungle glade.",
            videoPrompt: "Cute high-quality 3D children's animation. Baby elephant Gajju doing a cute happy dance with colorful fluttering birds in a lush sunny meadow with butterflies. Cheerful atmosphere, warm sunlight, vertical 9:16, no text, no watermark.",
            narration: "दूसरों की मदद करने से सच्ची खुशी मिलती है! गज्जू और चिड़िया बन गए पक्के दोस्त।",
          },
        ],
      },
      videos: {
        create: {
          youtubeUrl: "https://youtube.com/shorts/sample-gajju-story",
          aspectRatio: "9:16",
          duration: 30,
          status: "READY",
          provider: "MANUAL",
        },
      },
      metadata: {
        create: {
          youtubeTitle: "गज्जू और नन्ही चिड़िया 🐘🐦 | Hindi Kahaniya #Shorts",
          youtubeDescription: "देखिए कैसे दयालु हाथी गज्जू ने एक नन्ही चिड़िया की जान बचाई! बच्चों के लिए प्यारी और शिक्षाप्रद हिंदी कहानी। दोस्तों की मदद करना सीखें। Like & Subscribe for more daily Hindi Kids Shorts!\n\n#HindiKahaniya #KidsStories #GajjuElephant #Shorts #MoralStories",
          youtubeTags: "Hindi Stories, Kids Kahaniya, Gajju Hathi, Hindi Animated Shorts, Moral Stories for Kids, Bachon Ki Kahani, 3D Animation India",
          youtubeHashtags: "#Shorts #HindiKahaniya #KidsStories #MoralStories #HindiShorts",
          instagramCaption: "जब गज्जू ने बचाई नन्ही चिड़िया की जान! 🐘✨ क्या आपके बच्चों को भी जानवरों से प्यार है? हमें कमेंट में बताएं! ❤️\n\n#reelsindia #hindikahaniya #kidsreels #parentingindia #moralstories #indianmoms",
          instagramHashtags: "#reelsindia #hindikahaniya #kidsreels #parentingindia #indianmoms #kidslearning #3danimation",
          facebookCaption: "दया और दोस्ती की एक सुंदर कहानी - गज्जू और नन्ही चिड़िया! बच्चों को सिखाएं दूसरों की मदद करने का महत्व। 🌟 #HindiStories #FamilyValues #KidsAnimation",
          facebookHashtags: "#HindiStories #KidsAnimation #FamilyValues #MoralStories #KidsLearning",
        },
      },
    },
  });

  console.log(`Seeded story: ${sampleStory.title} (ID: ${sampleStory.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
