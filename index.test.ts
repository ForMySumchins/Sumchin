import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

test("loads HF_CREDENTIALS from .env.local", async () => {
  let envLocalBackup: string | null = null;

  try {
    // Backup existing .env.local if it exists
    try {
      envLocalBackup = await fs.readFile(".env.local", "utf-8");
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
    }

    // Write a fake .env.local for testing
    const testCredentials = "test_key_id:test_key_secret";
    await fs.writeFile(".env.local", `HF_CREDENTIALS=${testCredentials}\n`);

    // Run the index.ts script
    const { stdout, stderr } = await execAsync("env -u HF_CREDENTIALS npx tsx index.ts").catch(e => e);
    // Capture both stdout and stderr in case it exits with an error (which it will, because the credentials are fake)

    // Verify it doesn't fail on missing credentials (the specific error message "HF_CREDENTIALS is not configured...")
    const output = (stdout || "") + (stderr || "");
    assert.doesNotMatch(output, /HF_CREDENTIALS is not configured/);

    // Instead it should reach the invalid API credentials error, indicating it parsed the credentials
    assert.match(output, /Invalid API credentials/);

  } finally {
    // Restore the backup or delete the test file
    if (envLocalBackup !== null) {
      await fs.writeFile(".env.local", envLocalBackup);
    } else {
      try {
        await fs.unlink(".env.local");
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }
    }
  }
});
