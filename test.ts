import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);
const ENV_LOCAL_PATH = ".env.local";
const ENV_LOCAL_BACKUP_PATH = ".env.local.bak";

async function runTest() {
  let backedUp = false;

  // Backup existing .env.local if it exists
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    fs.copyFileSync(ENV_LOCAL_PATH, ENV_LOCAL_BACKUP_PATH);
    backedUp = true;
  }

  try {
    // Write fake credentials to .env.local
    fs.writeFileSync(ENV_LOCAL_PATH, "HF_CREDENTIALS=MOCK_KEY:MOCK_SECRET\n");

    // Run the script
    const { stdout, stderr } = await execAsync("npx tsx index.ts").catch(e => e);

    // If HF_CREDENTIALS was not picked up, it throws the specific error string
    const errorMessage = "HF_CREDENTIALS is not configured";
    if (stderr && stderr.includes(errorMessage)) {
      console.error("Test failed: HF_CREDENTIALS was not loaded from .env.local");
      process.exit(1);
    }

    // A valid response or specific higgsfield error is fine, as long as it loaded the credential.
    console.log("Test passed: .env.local credentials successfully loaded.");
  } finally {
    // Restore backup if it existed
    if (backedUp) {
      fs.copyFileSync(ENV_LOCAL_BACKUP_PATH, ENV_LOCAL_PATH);
      fs.unlinkSync(ENV_LOCAL_BACKUP_PATH);
    } else {
      // Clean up the mock .env.local if there was no original
      if (fs.existsSync(ENV_LOCAL_PATH)) {
        fs.unlinkSync(ENV_LOCAL_PATH);
      }
    }
  }
}

runTest();
