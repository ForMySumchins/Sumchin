import { test } from "node:test";
import assert from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("Loads credentials from .env.local", () => {
  const envLocalPath = ".env.local";
  const backupPath = ".env.local.bak";

  if (fs.existsSync(envLocalPath)) {
    fs.renameSync(envLocalPath, backupPath);
  }

  try {
    fs.writeFileSync(envLocalPath, "HF_CREDENTIALS=FAKE_ID:FAKE_SECRET\n");
    try {
      execSync("npx tsx index.ts", { stdio: "pipe" });
    } catch (error: any) {
      const stderr = error.stderr?.toString() || "";
      assert.doesNotMatch(stderr, /HF_CREDENTIALS is not configured/);
      assert.match(stderr, /Invalid API credentials|Seedance request failed/);
    }
  } finally {
    if (fs.existsSync(envLocalPath)) {
      fs.unlinkSync(envLocalPath);
    }
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, envLocalPath);
    }
  }
});
