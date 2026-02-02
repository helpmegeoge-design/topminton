import { type NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

const BADMINTON_STYLES = {
  professional: {
    prompt: "Professional badminton player portrait, wearing official team jersey, confident pose, sports photography style, stadium background with dramatic lighting, high quality, realistic",
    negative: "cartoon, anime, low quality, blurry"
  },
  champion: {
    prompt: "Champion badminton player celebrating victory, holding golden trophy, wearing championship medal, confetti in background, epic sports moment photography, high quality",
    negative: "cartoon, anime, low quality, blurry"
  },
  action: {
    prompt: "Dynamic badminton player in action pose, mid-swing with racket, intense focus expression, motion blur effect, sports action photography, dramatic lighting",
    negative: "cartoon, anime, low quality, blurry, static"
  },
  casual: {
    prompt: "Casual badminton player portrait, wearing comfortable sports attire, friendly smile, indoor badminton court background, natural lighting, approachable look",
    negative: "cartoon, anime, low quality, blurry"
  },
  anime: {
    prompt: "Anime style badminton player character, cool pose with racket, wearing stylish sports uniform, dynamic background, vibrant colors, anime art style, high quality illustration",
    negative: "realistic, photo, low quality"
  },
  mascot: {
    prompt: "Cute 3D mascot character as badminton player, kawaii style, holding badminton racket, wearing green sports jersey, soft vinyl toy aesthetic, clean background",
    negative: "realistic, photo, scary, dark"
  }
};

export async function POST(request: NextRequest) {
  try {
    const { style, faceImageUrl, customPrompt } = await request.json();

    if (!style && !customPrompt) {
      return NextResponse.json(
        { error: "Style or custom prompt is required" },
        { status: 400 }
      );
    }

    const selectedStyle = BADMINTON_STYLES[style as keyof typeof BADMINTON_STYLES] || BADMINTON_STYLES.professional;
    const finalPrompt = customPrompt || selectedStyle.prompt;

    // If face image is provided, use face swap model
    if (faceImageUrl) {
      // First generate the base image
      const baseResult = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: finalPrompt,
          image_size: "square_hd",
          num_inference_steps: 4,
          num_images: 1,
        },
      }) as { images?: { url: string }[] };

      const baseImageUrl = baseResult.images?.[0]?.url;

      if (!baseImageUrl) {
        throw new Error("Failed to generate base image");
      }

      // Then apply face swap
      const faceSwapResult = await fal.subscribe("fal-ai/face-swap", {
        input: {
          base_image_url: baseImageUrl,
          swap_image_url: faceImageUrl,
        },
      }) as { image?: { url: string } };

      const finalImageUrl = faceSwapResult.image?.url;

      if (!finalImageUrl) {
        throw new Error("Failed to apply face swap");
      }

      return NextResponse.json({ 
        imageUrl: finalImageUrl,
        baseImageUrl,
        style,
      });
    }

    // Generate image without face swap
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: finalPrompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    }) as { images?: { url: string }[] };

    const imageUrl = result.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return NextResponse.json({ 
      imageUrl,
      style,
    });
  } catch (error) {
    console.error("Error generating AI profile:", error);
    return NextResponse.json(
      { error: "Failed to generate AI profile image" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    styles: Object.keys(BADMINTON_STYLES),
    descriptions: {
      professional: "Professional team jersey look",
      champion: "Victory celebration with trophy",
      action: "Dynamic action shot mid-swing",
      casual: "Friendly casual sports look",
      anime: "Cool anime character style",
      mascot: "Cute 3D mascot character"
    }
  });
}
