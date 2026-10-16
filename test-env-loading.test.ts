import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import os from "os";

// Create a temporary directory for the test
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sumchin-test-"));

try {
  // Create a dummy .env.local in the temporary directory
  fs.writeFileSync(path.join(tempDir, ".env.local"), "HF_CREDENTIALS=TEST_KEY_ID:TEST_KEY_SECRET\n");

  // We need to run index.ts, but from the temporary directory.
  // We can just create a wrapper script in the temporary directory that imports the original index.ts
  // But index.ts uses process.cwd() for dotenv (implicitly by default).
  // dotenv resolves paths relative to process.cwd().

  // So we run index.ts using node/tsx, with the cwd set to the temporary directory.
  const stdout = execSync(`npx tsx ${path.resolve("index.ts")}`, {
    encoding: "utf8",
    stdio: "pipe",
    cwd: tempDir
  });
  console.log(stdout);
} catch (error: any) {
  const output = (error.stdout || "") + (error.stderr || "");

  // We expect an error from the API or something else, but NOT the error about missing HF_CREDENTIALS
  if (output.includes("HF_CREDENTIALS is not configured")) {
    console.error("Test Failed: HF_CREDENTIALS was not loaded from .env.local");
    process.exit(1);
  } else {
    console.log("Test Passed: HF_CREDENTIALS was loaded from .env.local properly.");
  }
} finally {
  // Clean up the temporary directory
  fs.rmSync(tempDir, { recursive: true, force: true });
}
