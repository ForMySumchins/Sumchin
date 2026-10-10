import "dotenv/config";
import { config, higgsfield } from "@higgsfield/client/v2";

const credentials = process.env.HF_CREDENTIALS;
if (!credentials) {
  console.error("❌ Error: HF_CREDENTIALS is not configured.");
  console.error("   Please add it to your .env.local file. (Never commit this file)");
  process.exit(1);
}

config({ credentials });

try {
  console.log("⏳ Starting generation (this usually takes 2-3 minutes)...");

  const result = await higgsfield.subscribe(
    "bytedance/seedance-2.5/text-to-video",
    {
      input: {
        prompt: "A cinematic scene at sunset",
        duration: 5,
        resolution: "720p",
        aspect_ratio: "16:9",
      },
      withPolling: true,
    },
  );

  if (result.status !== "completed") {
    console.error(`❌ Generation did not complete successfully`);
    console.error(`   Status: ${result.status ?? "unknown"}`);
    process.exit(1);
  }

  const video = result.video as unknown;
  const videoUrl =
    typeof video === "string"
      ? video
      : video && typeof video === "object" && "url" in video
        ? String((video as { url?: unknown }).url ?? "")
        : "";

  if (!videoUrl) {
    console.error("❌ Generation completed, but no video URL was returned.");
    process.exit(1);
  }

  console.log("✅ Success! Video URL:");
  console.log(videoUrl);
} catch (error) {
  console.error("❌ Request failed, was canceled, or was moderated.");
  if (error instanceof Error) {
    console.error(`   Details: ${error.message}`);
  }
  process.exit(1);
}
