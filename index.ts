import "dotenv/config";
import { config, higgsfield } from "@higgsfield/client/v2";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = process.env.HF_CREDENTIALS;
if (!credentials) {
  console.error("HF_CREDENTIALS is not configured. Add it to .env.local locally; never commit it.");
  process.exit(1);
}

config({ credentials });

const CACHE_FILE = path.join(__dirname, ".cache.json");

async function getCache(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveCache(cache: Record<string, any>): Promise<void> {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

try {
  const model = "bytedance/seedance-2.5/text-to-video";
  const params = {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  };

  const cacheKey = crypto
    .createHash("sha256")
    .update(JSON.stringify({ model, params }))
    .digest("hex");

  const cache = await getCache();
  let result;

  if (cache[cacheKey]) {
    console.log("Cache hit! Using cached result.");
    result = cache[cacheKey];
  } else {
    console.log("Cache miss. Calling API...");
    result = await higgsfield.subscribe(model, params);
    cache[cacheKey] = result;
    await saveCache(cache);
  }

  if (result.status !== "completed") {
    console.error(`Generation did not complete successfully (status: ${result.status ?? "unknown"}).`);
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
    console.error("Generation completed, but no video URL was returned.");
    process.exit(1);
  }

  console.log(videoUrl);
} catch (error) {
  console.error("Seedance request failed, was canceled, or was moderated.");
  if (error instanceof Error) console.error(error.message);
  process.exit(1);
}
