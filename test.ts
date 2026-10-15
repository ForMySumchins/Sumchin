import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import dotenv from "dotenv";

test("dotenv correctly loads from .env.local", async () => {
  const originalEnvLocal = await fs.readFile(".env.local", "utf-8").catch(() => null);
  const originalEnv = await fs.readFile(".env", "utf-8").catch(() => null);

  try {
    // Create synthetic fixtures
    await fs.writeFile(".env.local", "HF_CREDENTIALS=local_key");
    await fs.writeFile(".env", "HF_CREDENTIALS=base_key\nOTHER_KEY=base_other");

    // Clear existing environment variables that might interfere
    delete process.env.HF_CREDENTIALS;
    delete process.env.OTHER_KEY;

    // Test the specific behavior that we modified in index.ts
    dotenv.config({ path: [".env.local", ".env"] });

    assert.strictEqual(process.env.HF_CREDENTIALS, "local_key", "Should prefer .env.local");
    assert.strictEqual(process.env.OTHER_KEY, "base_other", "Should load from .env if not in .env.local");

  } finally {
    // Clean up our synthetic environment variables
    delete process.env.HF_CREDENTIALS;
    delete process.env.OTHER_KEY;

    // Restore developer files safely
    if (originalEnvLocal !== null) {
      await fs.writeFile(".env.local", originalEnvLocal);
    } else {
      await fs.unlink(".env.local").catch(() => {});
    }

    if (originalEnv !== null) {
      await fs.writeFile(".env", originalEnv);
    } else {
      await fs.unlink(".env").catch(() => {});
    }
  }
});
