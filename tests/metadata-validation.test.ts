import { describe, it, expect } from "vitest";
import { MetadataSchema } from "../lib/validation/metadata.schema";

describe("Metadata Validation", () => {
  it("should validate complete multi-platform social metadata", () => {
    const validMetadata = {
      youtubeTitle: "गज्जू और नन्ही चिड़िया 🐘 | Hindi Kahaniya #Shorts",
      youtubeDescription: "प्यारी हिंदी बाल कहानी गज्जू हाथी की। Subscribe for more!",
      youtubeTags: "Hindi Stories, Gajju, Kids Shorts, Moral Stories",
      youtubeHashtags: "#Shorts #HindiKahaniya #KidsStories",
      instagramCaption: "जब गज्जू ने बचाई चिड़िया की जान! ❤️ क्या आपको जानवरों से प्यार है?",
      instagramHashtags: "#reelsindia #hindikahaniya #kidsreels #parentingindia",
      facebookCaption: "एक प्यारी और शिक्षाप्रद हिंदी कहानी बच्चों के लिए।",
      facebookHashtags: "#HindiStories #KidsAnimation #FamilyValues",
    };

    const result = MetadataSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });

  it("should reject metadata missing required fields", () => {
    const invalidMetadata = {
      youtubeTitle: "Small",
      youtubeDescription: "",
    };

    const result = MetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });
});
