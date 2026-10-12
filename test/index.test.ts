import { test } from "node:test";
import assert from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");
const backupEnvPath = path.join(rootDir, ".env.local.backup");

test("index.ts loads HF_CREDENTIALS from .env.local", () => {
  // Backup existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    fs.renameSync(envPath, backupEnvPath);
  }

  // Write a fake credential to .env.local
  fs.writeFileSync(envPath, "HF_CREDENTIALS=TEST_ID:TEST_SECRET\n");

  try {
    // Run the script
    execSync("npm start", { cwd: rootDir, stdio: "pipe" });
  } catch (error: any) {
    // The script will likely exit with code 1 because TEST_ID:TEST_SECRET are invalid
    // credentials and the API request will fail.
    // However, it should NOT fail with the "HF_CREDENTIALS is not configured" error.
    const stderr = error.stderr?.toString() || "";
    const stdout = error.stdout?.toString() || "";

    assert.ok(
      !stderr.includes("HF_CREDENTIALS is not configured"),
      "Should not fail with missing credentials error when .env.local is present",
    );
  } finally {
    // Cleanup fake credential
    if (fs.existsSync(envPath)) {
      fs.unlinkSync(envPath);
    }
    // Restore backup if it existed
    if (fs.existsSync(backupEnvPath)) {
      fs.renameSync(backupEnvPath, envPath);
    }
  }
});
