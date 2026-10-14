import { execSync } from "child_process";
import fs from "fs";

const envLocalFile = ".env.local";
let backup = null;

if (fs.existsSync(envLocalFile)) {
  backup = fs.readFileSync(envLocalFile, "utf-8");
}

try {
  fs.writeFileSync(envLocalFile, "HF_CREDENTIALS=MOCK_ID:MOCK_SECRET\n");

  try {
    execSync("tsx index.ts", { encoding: "utf-8" });
    console.error("Expected execution to fail due to invalid mock credentials.");
    process.exit(1);
  } catch (error: any) {
    const stderr = error.stderr || "";
    const stdout = error.stdout || "";
    const output = stderr + stdout;

    if (output.includes("HF_CREDENTIALS is not configured")) {
      console.error("Failed to load mock credentials from .env.local.");
      console.error("Output:", output);
      process.exit(1);
    }

    if (!output.includes("Invalid API credentials")) {
      console.error("Unexpected error occurred.");
      console.error("Output:", output);
      process.exit(1);
    }

    console.log("Successfully validated .env.local loading using dynamic imports.");
  }
} finally {
  if (backup !== null) {
    fs.writeFileSync(envLocalFile, backup);
  } else {
    if (fs.existsSync(envLocalFile)) {
      fs.unlinkSync(envLocalFile);
    }
  }
}
