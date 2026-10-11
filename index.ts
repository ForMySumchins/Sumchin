import "dotenv/config";
import { config, higgsfield } from "@higgsfield/client/v2";

const credentials = process.env.HF_CREDENTIALS;
if (!credentials) {
  console.error("\n❌ ERROR: HF_CREDENTIALS is not configured.");
  console.error("💡 Action: Add it to .env.local locally; never commit it.\n");
  process.exit(1);
}

config({ credentials });

console.log("⏳ Initializing Seedance 2.5 request...");

try {
  console.log("⏳ Subscribing to text-to-video generation...");
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
    console.error(`\n❌ ERROR: Generation did not complete successfully.`);
    console.error(`Status: ${result.status ?? "unknown"}\n`);
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
    console.error("\n❌ ERROR: Generation completed, but no video URL was returned.\n");
    process.exit(1);
  }

  console.log(`\n✅ Video generated successfully:\n🎥 ${videoUrl}\n`);
} catch (error) {
  console.error("\n❌ ERROR: Seedance request failed, was canceled, or was moderated.");
  if (error instanceof Error) console.error(`Details: ${error.message}\n`);
  process.exit(1);
}
