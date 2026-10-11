import { describe, it } from "node:test";
import assert from "node:assert";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

describe("Seedance script CLI output", () => {
  it("should fail gracefully and display formatted error when HF_CREDENTIALS is missing", async () => {
    try {
      await execAsync("npx tsx index.ts", { env: { ...process.env, HF_CREDENTIALS: "" } });
      assert.fail("Script should have exited with an error");
    } catch (error: any) {
      assert.strictEqual(error.code, 1, "Exit code should be 1");
      const stderr = error.stderr.toString();

      assert.ok(
        stderr.includes("❌ ERROR: HF_CREDENTIALS is not configured."),
        "Should print missing credentials error message with emoji"
      );
      assert.ok(
        stderr.includes("💡 Action: Add it to .env.local locally; never commit it."),
        "Should print missing credentials action with emoji"
      );
    }
  });
});