import { test } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";

test("index.ts fails if HF_CREDENTIALS is not set", () => {
  const result = spawnSync("npx", ["tsx", "index.ts"], {
    env: { ...process.env, HF_CREDENTIALS: "" },
    encoding: "utf-8",
  });

  assert.strictEqual(result.status, 1);
  assert.match(
    result.stderr,
    /HF_CREDENTIALS is not configured\. Add it to \.env\.local locally; never commit it\./,
  );
});

test("index.ts proceeds if HF_CREDENTIALS is set", () => {
  // It should at least pass the credentials check and fail later if the credentials are bad
  const result = spawnSync("npx", ["tsx", "index.ts"], {
    env: { ...process.env, HF_CREDENTIALS: "fake:fake" },
    encoding: "utf-8",
  });

  // Since fake credentials are used, it might fail, but it shouldn't be because of the missing env var
  assert.doesNotMatch(
    result.stderr,
    /HF_CREDENTIALS is not configured\. Add it to \.env\.local locally; never commit it\./,
  );
});
