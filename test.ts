import { test } from "node:test";
import assert from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("index.ts fails if HF_CREDENTIALS is not set", async () => {
  try {
    execSync("npx tsx index.ts", { env: { ...process.env, HF_CREDENTIALS: "" }, stdio: "pipe" });
    assert.fail("Should have failed");
  } catch (err: any) {
    assert.match(err.stderr.toString(), /HF_CREDENTIALS is not configured/);
  }
});

test("index.ts uses .env.local", async () => {
  const backup = fs.existsSync(".env.local") ? fs.readFileSync(".env.local") : null;
  try {
    fs.writeFileSync(".env.local", "HF_CREDENTIALS=test:test\n");
    execSync("npx tsx index.ts", { stdio: "pipe" });
    assert.fail("Should have failed with invalid credentials");
  } catch (err: any) {
    assert.match(err.stderr.toString(), /Invalid API credentials/);
  } finally {
    if (backup) fs.writeFileSync(".env.local", backup);
    else fs.unlinkSync(".env.local");
  }
});
