import { config, higgsfield } from "@higgsfield/client/v2";

const credentials = process.env.HF_CREDENTIALS;
if (!credentials) {
  console.error("\n--------------------------------------------------");
  console.error("❌ [ERROR] HF_CREDENTIALS is not configured.");
  console.error("   Add it to .env.local locally; never commit it.");
  console.error("--------------------------------------------------\n");
  process.exit(1);
}

config({ credentials });

try {
  console.log("⏳ Starting video generation...");
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
    console.error("\n--------------------------------------------------");
    console.error(`❌ [ERROR] Generation did not complete successfully`);
    console.error(`   Status: ${result.status ?? "unknown"}`);
    console.error("--------------------------------------------------\n");
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
    console.error("\n--------------------------------------------------");
    console.error("❌ [ERROR] Generation completed, but no video URL was returned.");
    console.error("--------------------------------------------------\n");
    process.exit(1);
  }

  console.log("✅ Video generation complete!");
  console.log(videoUrl);
} catch (error) {
  console.error("\n--------------------------------------------------");
  console.error("❌ [ERROR] Seedance request failed, was canceled, or was moderated.");
  if (error instanceof Error) console.error(`   Details: ${error.message}`);
  console.error("--------------------------------------------------\n");
  process.exit(1);
}
